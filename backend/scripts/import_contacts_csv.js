const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

function cleanDigits(val) {
  return String(val || '').replace(/\D/g, '');
}

/**
 * Normaliza e formata telefone brasileiro
 * Regras aplicadas:
 * - CSP de operadora (ex: 021, 21) removido se preceder o DDD
 * - DDI 55 removido
 * - Zero à esquerda removido
 * - Telefones locais (8 ou 9 dígitos sem DDD) recebem DDD 61 padrão (Brasília/DF)
 * - Se celular de 8 dígitos, converte para 9 dígitos adicionando '9' na frente
 * - Retorna formato legível: (61) 98888-8888
 */
function normalizeAndFormatPhone(rawPhone) {
  if (!rawPhone) return { formatted: '', digits: '', key8: '', raw: '' };
  let d = cleanDigits(rawPhone);
  if (!d) return { formatted: '', digits: '', key8: '', raw: rawPhone };

  // Operadora CSP tipo 021 ou 21
  if (d.startsWith('021') && (d.length === 13 || d.length === 14)) {
    d = d.slice(3);
  } else if (d.startsWith('21') && (d.length === 12 || d.length === 13) && !['219', '218', '217', '216', '215', '214', '213', '212'].includes(d.slice(0, 3))) {
    d = d.slice(2);
  }

  // DDI 55
  if (d.startsWith('55') && (d.length === 12 || d.length === 13)) {
    d = d.slice(2);
  }

  // Zero à esquerda
  if (d.startsWith('0') && (d.length === 11 || d.length === 12)) {
    d = d.slice(1);
  }

  // Se tiver 8 ou 9 dígitos (sem DDD), adiciona DDD 61
  if (d.length === 8 || d.length === 9) {
    d = '61' + d;
  }

  // Se tem 10 dígitos (DDD + 8 dígitos) e o primeiro dígito local é [6,7,8,9], adiciona 9 de celular
  if (d.length === 10 && ['6', '7', '8', '9'].includes(d.charAt(2))) {
    d = d.slice(0, 2) + '9' + d.slice(2);
  }

  let formatted = d;
  if (d.length === 11) {
    formatted = `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  } else if (d.length === 10) {
    formatted = `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  }

  const key8 = d.length >= 8 ? d.slice(-8) : d;
  return { formatted, digits: d, key8, raw: rawPhone };
}

function parsePhones(raw) {
  if (!raw) return [];
  const parts = raw.split(':::').map(p => p.trim()).filter(Boolean);
  return parts.map(normalizeAndFormatPhone).filter(p => p.digits.length > 0);
}

function parseCSV(text) {
  const lines = [];
  let cur = '';
  let inQuotes = false;
  let row = [];
  
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];
    if (c === '"') {
      if (inQuotes && next === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      row.push(cur);
      cur = '';
    } else if ((c === '\r' || c === '\n') && !inQuotes) {
      if (c === '\r' && next === '\n') i++;
      row.push(cur);
      cur = '';
      if (row.length > 1 || row[0] !== '') lines.push(row);
      row = [];
    } else {
      cur += c;
    }
  }
  if (cur.length > 0 || row.length > 0) {
    row.push(cur);
    lines.push(row);
  }
  
  const headers = lines[0].map(h => h.trim());
  return lines.slice(1).map(r => {
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = (r[idx] || '').trim(); });
    return obj;
  });
}

function generateId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
}

async function runImport() {
  console.log('=====================================================');
  console.log('🚀 INICIANDO IMPORTAÇÃO CONTROLADA DO CONTACTS.CSV');
  console.log('=====================================================');

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL não configurada no backend/.env');
  }

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  const client = await pool.connect();

  try {
    // 1. Garantir que as colunas phone2 existam
    console.log('[1/5] Verificando estrutura das colunas phone2 no PostgreSQL...');
    await client.query('ALTER TABLE crm_customers ADD COLUMN IF NOT EXISTS phone2 VARCHAR(40);');
    await client.query('ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS phone2 VARCHAR(40);');

    // 2. Indexar leads existentes do funil da rifa
    console.log('[2/5] Carregando leads existentes do funil da rifa para verificação...');
    const existingLeadsRes = await client.query(`
      SELECT id, name, phone, phone2, stage_id
      FROM crm_leads
      WHERE funnel_id = 'fun_rifa_elevador'
    `);

    const leadsByPhone = new Map();
    const leadsByKey8 = new Map();

    for (const lead of existingLeadsRes.rows) {
      [lead.phone, lead.phone2].forEach(p => {
        if (!p) return;
        const norm = normalizeAndFormatPhone(p);
        if (norm.digits) leadsByPhone.set(norm.digits, lead);
        if (norm.key8) leadsByKey8.set(norm.key8, lead);
      });
    }
    console.log(`Leads já existentes no funil: ${existingLeadsRes.rows.length}`);

    // 3. Indexar clientes existentes na base central crm_customers
    console.log('[3/5] Carregando clientes existentes da base crm_customers...');
    const existingCustRes = await client.query(`
      SELECT id, name, phone, phone2
      FROM crm_customers
    `);

    const custByPhone = new Map();
    const custByKey8 = new Map();

    for (const cust of existingCustRes.rows) {
      [cust.phone, cust.phone2].forEach(p => {
        if (!p) return;
        const norm = normalizeAndFormatPhone(p);
        if (norm.digits) custByPhone.set(norm.digits, cust);
        if (norm.key8) custByKey8.set(norm.key8, cust);
      });
    }
    console.log(`Clientes já existentes em crm_customers: ${existingCustRes.rows.length}`);

    // Obter estágio de Clientes do funil da rifa
    const stageQueryRes = await client.query(`
      SELECT id, title FROM crm_stages 
      WHERE funnel_id = 'fun_rifa_elevador' AND title ILIKE '%Cliente%'
      ORDER BY "order" ASC LIMIT 1
    `);
    if (stageQueryRes.rows.length === 0) {
      throw new Error("Estágio 'Clientes' não encontrado no funil fun_rifa_elevador");
    }
    const targetStageId = stageQueryRes.rows[0].id;
    console.log(`Estágio de destino encontrado: ${stageQueryRes.rows[0].title} (ID: ${targetStageId})`);

    // Obter maior ordem da coluna Clientes
    const orderRes = await client.query(`
      SELECT COALESCE(MAX("order"), -1) as max_order
      FROM crm_leads
      WHERE stage_id = $1
    `, [targetStageId]);
    let nextOrder = (parseInt(orderRes.rows[0].max_order, 10) || -1) + 1;

    // 4. Ler contacts.csv
    console.log('[4/5] Lendo e processando contacts.csv...');
    const csvPath = path.join(__dirname, '../../contacts.csv');
    if (!fs.existsSync(csvPath)) {
      throw new Error(`contacts.csv não encontrado em ${csvPath}`);
    }

    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const records = parseCSV(csvContent);
    console.log(`Total de registros lidos do CSV: ${records.length}`);

    let custCreated = 0;
    let custIgnored = 0;
    let leadsCreated = 0;
    let leadsIgnored = 0;
    let leadsEnrichedPhone2 = 0;
    let custEnrichedPhone2 = 0;

    await client.query('BEGIN');

    for (const r of records) {
      // Monta nome mantendo o prefixo conforme solicitado pelo usuário
      const fullName = [r['First Name'], r['Middle Name'], r['Last Name']].filter(Boolean).join(' ').trim();
      if (!fullName) continue;

      const rawPhone = r['Phone 1 - Value'];
      const phones = parsePhones(rawPhone);
      if (phones.length === 0) continue;

      const p1 = phones[0];
      const p2 = phones[1] || null;

      const company = r['Organization Name'] || '';
      const email = r['E-mail 1 - Value'] || '';

      // --- A. Processar crm_customers ---
      let existingCust = custByPhone.get(p1.digits) || custByKey8.get(p1.key8);
      if (!existingCust && p2) {
        existingCust = custByPhone.get(p2.digits) || custByKey8.get(p2.key8);
      }

      if (existingCust) {
        custIgnored++;
        // Se o cliente existe mas não tinha phone2 e o CSV tem phone2, enriquece
        if (!existingCust.phone2 && p2) {
          await client.query('UPDATE crm_customers SET phone2 = $1, updated_at = NOW() WHERE id = $2', [p2.formatted, existingCust.id]);
          existingCust.phone2 = p2.formatted;
          custEnrichedPhone2++;
        }
      } else {
        const custId = generateId('cust');
        await client.query(`
          INSERT INTO crm_customers (
            id, name, fantasy_name, phone, phone2, email, category, city, state, pipeline_stage, notes, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
        `, [
          custId,
          fullName,
          company || null,
          p1.formatted,
          p2 ? p2.formatted : null,
          email || null,
          'Mecânica Geral',
          'Brasília',
          'DF',
          'cliente_ativo',
          'Importado de contacts.csv'
        ]);

        custCreated++;
        // Registrar nos mapas para evitar duplicatas internas do CSV
        const newCustObj = { id: custId, name: fullName, phone: p1.formatted, phone2: p2 ? p2.formatted : null };
        custByPhone.set(p1.digits, newCustObj);
        custByKey8.set(p1.key8, newCustObj);
        if (p2) {
          custByPhone.set(p2.digits, newCustObj);
          custByKey8.set(p2.key8, newCustObj);
        }
      }

      // --- B. Processar crm_leads (Funil da Rifa - fun_rifa_elevador) ---
      let existingLead = leadsByPhone.get(p1.digits) || leadsByKey8.get(p1.key8);
      if (!existingLead && p2) {
        existingLead = leadsByPhone.get(p2.digits) || leadsByKey8.get(p2.key8);
      }

      if (existingLead) {
        leadsIgnored++;
        // Se o lead já está no funil mas não tinha phone2 e o CSV tem phone2, enriquece sem mover de coluna
        if (!existingLead.phone2 && p2) {
          await client.query('UPDATE crm_leads SET phone2 = $1, updated_at = NOW() WHERE id = $2', [p2.formatted, existingLead.id]);
          existingLead.phone2 = p2.formatted;
          leadsEnrichedPhone2++;
        }
      } else {
        const leadId = generateId('lead_csv');
        await client.query(`
          INSERT INTO crm_leads (
            id, funnel_id, stage_id, name, company, phone, phone2, email,
            priority, status, notes, "order", source, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
        `, [
          leadId,
          'fun_rifa_elevador',
          targetStageId,
          fullName,
          company || null,
          p1.formatted,
          p2 ? p2.formatted : null,
          email || null,
          'medium',
          'active',
          'Importado de contacts.csv',
          nextOrder++,
          'contacts_csv'
        ]);

        leadsCreated++;
        const newLeadObj = { id: leadId, name: fullName, phone: p1.formatted, phone2: p2 ? p2.formatted : null, stage_id: targetStageId };
        leadsByPhone.set(p1.digits, newLeadObj);
        leadsByKey8.set(p1.key8, newLeadObj);
        if (p2) {
          leadsByPhone.set(p2.digits, newLeadObj);
          leadsByKey8.set(p2.key8, newLeadObj);
        }
      }
    }

    await client.query('COMMIT');
    console.log('[5/5] Transação consolidada com sucesso no PostgreSQL!');

    console.log('\n=====================================================');
    console.log('📊 RELATÓRIO FINAL DA IMPORTAÇÃO');
    console.log('=====================================================');
    console.log(`Total de contatos processados: ${records.length}`);
    console.log(`\n1. BASE CENTRAL DE CLIENTES (crm_customers):`);
    console.log(`   - Novos clientes inseridos: ${custCreated}`);
    console.log(`   - Clientes já existentes (preservados/ignorados): ${custIgnored}`);
    console.log(`   - Clientes enriquecidos com Telefone 2: ${custEnrichedPhone2}`);
    console.log(`\n2. FUNIL DA RIFA (crm_leads - fun_rifa_elevador):`);
    console.log(`   - Novos leads criados na coluna 'Clientes': ${leadsCreated}`);
    console.log(`   - Leads já existentes no funil (preservados/ignorados): ${leadsIgnored}`);
    console.log(`   - Leads enriquecidos com Telefone 2: ${leadsEnrichedPhone2}`);

    // Distribuição final por etapa
    const stagesRes = await client.query(`
      SELECT s.id, s.title, s."order", COUNT(l.id) as count
      FROM crm_stages s
      LEFT JOIN crm_leads l ON l.stage_id = s.id
      WHERE s.funnel_id = 'fun_rifa_elevador'
      GROUP BY s.id, s.title, s."order"
      ORDER BY s."order"
    `);
    console.log('\nDistribuição Final do Funil da Rifa:');
    console.table(stagesRes.rows);

    const totalCustRes = await client.query('SELECT count(*) FROM crm_customers');
    console.log(`Total consolidado em crm_customers: ${totalCustRes.rows[0].count}`);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Erro na importação. Transação revertida:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

runImport().catch(e => {
  console.error('Falha geral:', e);
  process.exit(1);
});
