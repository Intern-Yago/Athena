const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

function cleanEmail(e) {
  if (!e) return '';
  return String(e).trim().toLowerCase();
}

function cleanPhone(p) {
  if (!p) return '';
  const digits = String(p).replace(/\D/g, '');
  return digits;
}

function capitalizeWords(str) {
  if (!str) return '';
  return str.toLowerCase().replace(/(^|\s)\S/g, (l) => l.toUpperCase());
}

async function syncDatabase(connectionString, label) {
  console.log(`\n========================================`);
  console.log(`Starting sync for: ${label}`);
  console.log(`========================================`);

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // 1. Build enrichment dictionary
    console.log('[1/5] Loading enrichment sources...');
    const enrichmentMap = new Map();

    function enrich(email, data) {
      const e = cleanEmail(email);
      if (!e) return;
      const prev = enrichmentMap.get(e) || {};
      const newPhone = cleanPhone(data.phone || data.telefone) || prev.phone || '';
      const newName = (data.name || data.nome || '').trim() || prev.name || '';
      const newComp = (data.company || '').trim() || prev.company || '';
      const newDoc = (data.cnpj || data.cpf || data.document || '').trim() || prev.document || '';
      const newAddr = (data.address || '').trim() || prev.address || '';

      enrichmentMap.set(e, {
        name: newName,
        phone: newPhone,
        company: newComp,
        document: newDoc,
        address: newAddr
      });
    }

    // 1a. External Omie & Ploomes
    const extPath = path.join(__dirname, '../data/external_enrichment.json');
    if (fs.existsSync(extPath)) {
      const ext = JSON.parse(fs.readFileSync(extPath, 'utf8'));
      if (ext.omie) {
        for (const [em, val] of Object.entries(ext.omie)) enrich(em, val);
      }
      if (ext.ploomes) {
        for (const [em, val] of Object.entries(ext.ploomes)) enrich(em, val);
      }
    }

    // 1b. Orders
    try {
      const ordersRes = await pool.query('SELECT customer_snapshot FROM orders WHERE customer_snapshot IS NOT NULL');
      for (const row of ordersRes.rows) {
        try {
          const snap = typeof row.customer_snapshot === 'string' ? JSON.parse(row.customer_snapshot) : row.customer_snapshot;
          if (snap && snap.email) {
            let addr = '';
            if (snap.address) {
              addr = [snap.address.street, snap.address.number, snap.address.city, snap.address.state].filter(Boolean).join(', ');
            }
            enrich(snap.email, {
              name: snap.name,
              phone: snap.phone,
              document: snap.cpf || snap.cnpj,
              address: addr
            });
          }
        } catch (_) {}
      }
    } catch (e) {
      console.warn('Orders query failed or table does not exist:', e.message);
    }

    // 1c. Inscricoes
    try {
      const inscRes = await pool.query('SELECT nome, email, telefone FROM inscricoes');
      for (const row of inscRes.rows) {
        enrich(row.email, {
          name: row.nome,
          phone: row.telefone
        });
      }
    } catch (e) {
      console.warn('Inscricoes query failed:', e.message);
    }

    // 1d. Users
    try {
      const usersRes = await pool.query('SELECT name, email, phone FROM users');
      for (const row of usersRes.rows) {
        enrich(row.email, {
          name: row.name,
          phone: row.phone
        });
      }
    } catch (e) {
      console.warn('Users query failed:', e.message);
    }

    console.log(`Enrichment dictionary built with ${enrichmentMap.size} emails.`);

    // 2. Parse contacts.csv
    console.log('[2/5] Parsing contacts.csv...');
    const csvPath = path.join(__dirname, '../../contacts.csv');
    if (!fs.existsSync(csvPath)) {
      throw new Error(`contacts.csv not found at ${csvPath}`);
    }

    const fileContent = fs.readFileSync(csvPath, 'utf8');
    const lines = fileContent.split(/\r?\n/).filter(l => l.trim().length > 0);
    const header = lines[0].split(',');
    const emailIdx = header.indexOf('E-mail 1 - Value');
    const fnIdx = header.indexOf('First Name');
    const mnIdx = header.indexOf('Middle Name');
    const lnIdx = header.indexOf('Last Name');

    const csvContacts = new Map();
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',');
      const email = cleanEmail(row[emailIdx]);
      if (!email) continue;

      const fn = (row[fnIdx] || '').trim();
      const mn = (row[mnIdx] || '').trim();
      const ln = (row[lnIdx] || '').trim();
      const csvName = [fn, mn, ln].filter(Boolean).join(' ');

      const prev = csvContacts.get(email) || { csvName: '', count: 0 };
      csvContacts.set(email, {
        csvName: prev.csvName || csvName,
        count: prev.count + 1
      });
    }

    console.log(`Found ${lines.length - 1} rows in contacts.csv representing ${csvContacts.size} unique emails.`);

    // 3. Fetch existing crm_leads
    console.log('[3/5] Querying existing crm_leads...');
    const existingLeadsRes = await pool.query('SELECT * FROM crm_leads');
    const existingLeads = existingLeadsRes.rows;

    const leadsByEmail = new Map();
    const leadsByPhone = new Map();

    for (const lead of existingLeads) {
      if (lead.email) {
        leadsByEmail.set(cleanEmail(lead.email), lead);
      }
      if (lead.phone) {
        const p = cleanPhone(lead.phone);
        if (p.length >= 8) {
          leadsByPhone.set(p, lead);
        }
      }
    }
    console.log(`Loaded ${existingLeads.length} existing leads from database.`);

    // Check max order in stg_rif_clientes
    const orderRes = await pool.query(`SELECT COALESCE(MAX("order"), -1) as max_order FROM crm_leads WHERE stage_id = 'stg_rif_clientes'`);
    let nextOrder = (parseInt(orderRes.rows[0].max_order, 10) || 0) + 1;

    // 4. Process each contact: Update existing or Insert new
    console.log('[4/5] Syncing contacts (updating existing or creating new in Clientes)...');
    let completedCount = 0;
    let createdCount = 0;
    let unchangedCount = 0;

    for (const [email, info] of csvContacts.entries()) {
      const enriched = enrichmentMap.get(email) || {};

      let bestName = enriched.name || info.csvName;
      if (!bestName) {
        // Fallback to email username beautified
        const prefix = email.split('@')[0].replace(/[._-]/g, ' ');
        bestName = capitalizeWords(prefix);
      }

      const bestPhone = enriched.phone || '';
      const bestCompany = enriched.company || '';
      const bestDocument = enriched.document || '';
      const bestAddress = enriched.address || '';

      // Check if lead already exists in DB (by email or phone)
      let existingLead = leadsByEmail.get(email);
      if (!existingLead && bestPhone && bestPhone.length >= 8) {
        existingLead = leadsByPhone.get(bestPhone);
      }

      if (existingLead) {
        // ONLY COMPLETE MISSING FIELDS
        const updates = [];
        const params = [];

        // Complete name if existing is empty or just an email
        if ((!existingLead.name || existingLead.name.includes('@')) && bestName && !bestName.includes('@')) {
          params.push(bestName);
          updates.push(`name = $${params.length}`);
        }

        // Complete phone if missing
        if (!existingLead.phone && bestPhone) {
          params.push(bestPhone);
          updates.push(`phone = $${params.length}`);
        }

        // Complete email if missing
        if (!existingLead.email && email) {
          params.push(email);
          updates.push(`email = $${params.length}`);
        }

        // Complete company if missing
        if (!existingLead.company && bestCompany) {
          params.push(bestCompany);
          updates.push(`company = $${params.length}`);
        }

        // Complete document if missing
        if (!existingLead.document && bestDocument) {
          params.push(bestDocument);
          updates.push(`document = $${params.length}`);
        }

        // Complete address if missing
        if (!existingLead.address && bestAddress) {
          params.push(bestAddress);
          updates.push(`address = $${params.length}`);
        }

        if (updates.length > 0) {
          params.push(new Date());
          updates.push(`updated_at = $${params.length}`);

          params.push(existingLead.id);
          const updateSql = `UPDATE crm_leads SET ${updates.join(', ')} WHERE id = $${params.length}`;
          await pool.query(updateSql, params);
          completedCount++;
        } else {
          unchangedCount++;
        }
      } else {
        // Create new lead in "stg_rif_clientes" ("Clientes")
        const newLeadId = `lead_csv_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
        const insertSql = `
          INSERT INTO crm_leads (
            id, funnel_id, stage_id, name, phone, email,
            company, document, address, priority, status,
            source, notes, "order", created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6,
            $7, $8, $9, $10, $11,
            $12, $13, $14, $15, $16
          )
        `;

        await pool.query(insertSql, [
          newLeadId,
          'fun_rifa_elevador',
          'stg_rif_clientes',
          bestName,
          bestPhone || null,
          email,
          bestCompany || null,
          bestDocument || null,
          bestAddress || null,
          'medium',
          'active',
          'contacts_csv',
          'Importado do Google Contacts (contacts.csv)',
          nextOrder++,
          new Date(),
          new Date()
        ]);
        createdCount++;
      }
    }

    console.log(`Sync results for ${label}:`);
    console.log(`  - Existing leads completed/enriched: ${completedCount}`);
    console.log(`  - Existing leads already complete: ${unchangedCount}`);
    console.log(`  - New leads created in "Clientes": ${createdCount}`);

    // 5. Final Stage Distribution
    console.log('[5/5] Final stage distribution for fun_rifa_elevador:');
    const finalStages = await pool.query(`
      SELECT s.id, s.title, s."order", COUNT(l.id) as count
      FROM crm_stages s
      LEFT JOIN crm_leads l ON l.stage_id = s.id
      WHERE s.funnel_id = 'fun_rifa_elevador'
      GROUP BY s.id, s.title, s."order"
      ORDER BY s."order"
    `);
    console.table(finalStages.rows);

  } finally {
    await pool.end();
  }
}

async function main() {
  if (process.env.DATABASE_URL) {
    await syncDatabase(process.env.DATABASE_URL, 'DATABASE_URL');
  } else {
    console.error('DATABASE_URL not found!');
  }

  if (process.env.CRM_DATABASE_URL && process.env.CRM_DATABASE_URL !== process.env.DATABASE_URL) {
    await syncDatabase(process.env.CRM_DATABASE_URL, 'CRM_DATABASE_URL');
  }
}

main().catch(err => {
  console.error('Fatal sync error:', err);
  process.exit(1);
});
