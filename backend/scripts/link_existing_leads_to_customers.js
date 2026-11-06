const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// ============================================================================
// BLACKLIST DE PAREAMENTO (Neutraliza dados genéricos / placeholders)
// ============================================================================
const BLACKLISTED_PHONES = new Set([
  '00000000', '11111111', '22222222', '33333333', '44444444',
  '55555555', '66666666', '77777777', '88888888', '99999999',
  '000000000', '111111111', '999999999',
  '0000000000', '00000000000', '11111111111', '99999999999'
]);

const BLACKLISTED_DOCS = new Set([
  '00000000000', '11111111111', '22222222222', '33333333333',
  '44444444444', '55555555555', '66666666666', '77777777777',
  '88888888888', '99999999999', '00000000000000'
]);

const BLACKLISTED_EMAIL_PREFIXES = [
  'naotem', 'sememail', 'naoinformado', 'teste', 'test', 'nenhum', 'cliente', 'admin', 'fake'
];

function isEmailBlacklisted(email) {
  if (!email) return true;
  const clean = String(email).trim().toLowerCase();
  if (clean.length < 5 || !clean.includes('@')) return true;
  const [prefix, domain] = clean.split('@');
  if (BLACKLISTED_EMAIL_PREFIXES.some(b => prefix === b || prefix.startsWith(b))) return true;
  if (['teste.com', 'test.com', 'exemplo.com', 'email.com', 'example.com'].includes(domain)) return true;
  return false;
}

function cleanDigits(val) {
  return String(val || '').replace(/\D/g, '');
}

function normalizePhone(p) {
  let d = cleanDigits(p);
  if (!d) return '';
  if (BLACKLISTED_PHONES.has(d)) return '';
  if (d.startsWith('021') && (d.length === 13 || d.length === 14)) d = d.slice(3);
  else if (d.startsWith('21') && (d.length === 12 || d.length === 13) && !['219', '218', '217', '216', '215', '214', '213', '212'].includes(d.slice(0, 3))) d = d.slice(2);
  if (d.startsWith('55') && (d.length === 12 || d.length === 13)) d = d.slice(2);
  if (d.startsWith('0') && (d.length === 11 || d.length === 12)) d = d.slice(1);
  if (d.length === 8 || d.length === 9) d = '61' + d;
  if (d.length === 10 && ['6', '7', '8', '9'].includes(d.charAt(2))) {
    d = d.slice(0, 2) + '9' + d.slice(2);
  }
  if (BLACKLISTED_PHONES.has(d) || d.length < 8) return '';
  return d;
}

function normalizeDoc(doc) {
  const d = cleanDigits(doc);
  if (!d || BLACKLISTED_DOCS.has(d)) return '';
  if (d.length !== 11 && d.length !== 14) return '';
  return d;
}

function normalizeName(name) {
  if (!name) return '';
  return String(name)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function linkLeadsToCustomers() {
  console.log('=====================================================');
  console.log('🔗 PAREAMENTO RETROATIVO DE LEADS COM BASE CENTRAL');
  console.log('=====================================================');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  const client = await pool.connect();

  try {
    // 1. Carregar todos os clientes
    console.log('[1/4] Carregando clientes da base central...');
    const custRes = await client.query('SELECT id, name, fantasy_name, cpf, cnpj, phone, phone2, email FROM crm_customers');
    const customers = custRes.rows;
    console.log(`Carregados ${customers.length} clientes.`);

    // Índices de busca por prioridade
    const docMap = new Map();
    const phoneMap = new Map();
    const emailMap = new Map();
    const nameMap = new Map();

    for (const c of customers) {
      // 1. Documentos
      [c.cpf, c.cnpj].forEach(d => {
        const normDoc = normalizeDoc(d);
        if (normDoc) docMap.set(normDoc, c.id);
      });

      // 2. Telefones
      [c.phone, c.phone2].forEach(p => {
        const normP = normalizePhone(p);
        if (normP) {
          phoneMap.set(normP, c.id);
          if (normP.length >= 8) phoneMap.set(normP.slice(-8), c.id);
        }
      });

      // 3. E-mail
      if (c.email && !isEmailBlacklisted(c.email)) {
        emailMap.set(String(c.email).trim().toLowerCase(), c.id);
      }

      // 4. Nome
      [c.name, c.fantasy_name].forEach(n => {
        const normN = normalizeName(n);
        if (normN && normN.length >= 4) {
          nameMap.set(normN, c.id);
        }
      });
    }

    // 2. Carregar todos os leads sem customer_id
    console.log('[2/4] Buscando leads sem customer_id...');
    const leadsRes = await client.query('SELECT id, name, company, document, phone, phone2, email, customer_id FROM crm_leads');
    const leads = leadsRes.rows;
    console.log(`Total de leads no banco: ${leads.length}`);

    let linkedByDoc = 0;
    let linkedByPhone = 0;
    let linkedByEmail = 0;
    let linkedByName = 0;
    let alreadyLinked = 0;
    let unlinked = 0;

    await client.query('BEGIN');

    for (const lead of leads) {
      if (lead.customer_id) {
        alreadyLinked++;
        continue;
      }

      let matchedCustId = null;
      let matchedBy = null;

      // 1. Documento
      const leadDoc = normalizeDoc(lead.document);
      if (leadDoc && docMap.has(leadDoc)) {
        matchedCustId = docMap.get(leadDoc);
        matchedBy = 'doc';
      }

      // 2. Telefone (Telefone 1 e Telefone 2)
      if (!matchedCustId) {
        for (const p of [lead.phone, lead.phone2]) {
          const normP = normalizePhone(p);
          if (normP) {
            matchedCustId = phoneMap.get(normP) || (normP.length >= 8 ? phoneMap.get(normP.slice(-8)) : null);
            if (matchedCustId) {
              matchedBy = 'phone';
              break;
            }
          }
        }
      }

      // 3. E-mail
      if (!matchedCustId && lead.email && !isEmailBlacklisted(lead.email)) {
        const leadEm = String(lead.email).trim().toLowerCase();
        if (emailMap.has(leadEm)) {
          matchedCustId = emailMap.get(leadEm);
          matchedBy = 'email';
        }
      }

      // 4. Nome / Empresa
      if (!matchedCustId) {
        for (const n of [lead.name, lead.company]) {
          const normN = normalizeName(n);
          if (normN && normN.length >= 4 && nameMap.has(normN)) {
            matchedCustId = nameMap.get(normN);
            matchedBy = 'name';
            break;
          }
        }
      }

      if (matchedCustId) {
        await client.query('UPDATE crm_leads SET customer_id = $1, updated_at = NOW() WHERE id = $2', [matchedCustId, lead.id]);
        if (matchedBy === 'doc') linkedByDoc++;
        else if (matchedBy === 'phone') linkedByPhone++;
        else if (matchedBy === 'email') linkedByEmail++;
        else if (matchedBy === 'name') linkedByName++;
      } else {
        unlinked++;
      }
    }

    await client.query('COMMIT');
    console.log('[3/4] Atualização transacional concluída com sucesso!');

    console.log('\n=====================================================');
    console.log('📊 RELATÓRIO DO PAREAMENTO RETROATIVO');
    console.log('=====================================================');
    console.log(`Leads já vinculados previamente: ${alreadyLinked}`);
    console.log(`Novos leads vinculados por Documento: ${linkedByDoc}`);
    console.log(`Novos leads vinculados por Telefone: ${linkedByPhone}`);
    console.log(`Novos leads vinculados por E-mail: ${linkedByEmail}`);
    console.log(`Novos leads vinculados por Nome: ${linkedByName}`);
    console.log(`Total recém-vinculados: ${linkedByDoc + linkedByPhone + linkedByEmail + linkedByName}`);
    console.log(`Leads avulsos restantes (sem par na base): ${unlinked}`);

  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Erro no pareamento:', e);
    throw e;
  } finally {
    client.release();
    await pool.end();
  }
}

linkLeadsToCustomers().catch(e => {
  console.error(e);
  process.exit(1);
});
