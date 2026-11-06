const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

function cleanEmail(e) {
  if (!e) return '';
  return String(e).trim().toLowerCase();
}

function cleanPhone(p) {
  if (!p) return '';
  return String(p).replace(/\D/g, '');
}

function formatPhoneDisplay(digits) {
  if (!digits) return '';
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return digits;
}

async function syncCustomersForPool(connectionString, label) {
  console.log(`\n========================================`);
  console.log(`Populating real crm_customers for: ${label}`);
  console.log(`========================================`);

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // 1. Get existing customers in crm_customers
    const existingRes = await pool.query('SELECT id, email, phone, cpf, cnpj FROM crm_customers');
    const existingEmails = new Set(existingRes.rows.map(r => cleanEmail(r.email)).filter(Boolean));
    const existingPhones = new Set(existingRes.rows.map(r => cleanPhone(r.phone)).filter(Boolean));

    console.log(`Currently ${existingRes.rows.length} customers in crm_customers.`);

    // 2. Fetch paying customers from orders
    let orderCustomers = [];
    try {
      const ordersRes = await pool.query('SELECT customer_snapshot, total, created_at FROM orders WHERE customer_snapshot IS NOT NULL ORDER BY created_at DESC');
      const byEmail = new Map();
      for (const row of ordersRes.rows) {
        try {
          const snap = typeof row.customer_snapshot === 'string' ? JSON.parse(row.customer_snapshot) : row.customer_snapshot;
          if (snap && (snap.email || snap.phone)) {
            const em = cleanEmail(snap.email);
            const key = em || cleanPhone(snap.phone);
            if (!byEmail.has(key)) {
              byEmail.set(key, {
                name: (snap.name || '').trim(),
                fantasy_name: (snap.company || snap.razao_social || snap.name || '').trim(),
                email: em,
                phone: formatPhoneDisplay(cleanPhone(snap.phone)),
                document: (snap.document || snap.cpf || snap.cnpj || '').trim(),
                address: snap.address ? (typeof snap.address === 'object' ? [snap.address.street, snap.address.number, snap.address.neighborhood].filter(Boolean).join(', ') : String(snap.address)) : '',
                city: snap.address?.city || 'Brasília',
                state: snap.address?.state || 'DF',
                cep: snap.address?.postal_code || snap.address?.cep || '',
                category: 'Mecânica Geral',
                pipeline_stage: 'cliente_ativo',
                notes: 'Cliente com histórico de compras no e-commerce Athena',
                equipments: ['Equipamento Automotivo'],
                created_at: row.created_at || new Date()
              });
            }
          }
        } catch (_) {}
      }
      orderCustomers = Array.from(byEmail.values());
      console.log(`Found ${orderCustomers.length} unique paying customers in orders.`);
    } catch (e) {
      console.warn('Orders query failed or table does not exist:', e.message);
    }

    // 3. Fetch leads from crm_leads where stage_id = 'stg_rif_clientes' or source = 'contacts_csv'
    let leadCustomers = [];
    try {
      const leadsRes = await pool.query(`
        SELECT id, name, phone, email, company, document, address, notes, created_at
        FROM crm_leads
        WHERE stage_id = 'stg_rif_clientes' OR source = 'contacts_csv'
        ORDER BY created_at ASC
      `);
      for (const lead of leadsRes.rows) {
        const em = cleanEmail(lead.email);
        const p = cleanPhone(lead.phone);
        if (em && existingEmails.has(em)) continue;
        if (p && existingPhones.has(p)) continue;

        leadCustomers.push({
          name: (lead.name || em.split('@')[0]).trim(),
          fantasy_name: (lead.company || '').trim() || (lead.name || '').trim(),
          email: em,
          phone: formatPhoneDisplay(p),
          document: (lead.document || '').trim(),
          address: (lead.address || '').trim(),
          city: 'Brasília',
          state: 'DF',
          cep: '',
          category: 'Mecânica Geral',
          pipeline_stage: 'lead',
          notes: lead.notes || 'Importado via contatos',
          equipments: [],
          created_at: lead.created_at || new Date()
        });
      }
      console.log(`Found ${leadCustomers.length} candidates from crm_leads.`);
    } catch (e) {
      console.warn('Leads query failed:', e.message);
    }

    // Combine unique list
    const combined = [...orderCustomers, ...leadCustomers];
    let inserted = 0;

    for (const cust of combined) {
      const em = cleanEmail(cust.email);
      const ph = cleanPhone(cust.phone);
      if (em && existingEmails.has(em)) continue;
      if (ph && existingPhones.has(ph)) continue;

      const custId = `cust_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
      const isCnpj = cust.document && cust.document.replace(/\D/g, '').length > 11;
      const cpf = isCnpj ? '' : cust.document;
      const cnpj = isCnpj ? cust.document : '';

      await pool.query(`
        INSERT INTO crm_customers (
          id, name, fantasy_name, cpf, cnpj, phone, email,
          address, city, state, cep, category, pipeline_stage,
          notes, equipments, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11, $12, $13,
          $14, $15, $16, $17
        )
      `, [
        custId,
        cust.name,
        cust.fantasy_name || cust.name,
        cpf || null,
        cnpj || null,
        cust.phone || null,
        cust.email || null,
        cust.address || null,
        cust.city || 'Brasília',
        cust.state || 'DF',
        cust.cep || null,
        cust.category || 'Mecânica Geral',
        cust.pipeline_stage || 'cliente_ativo',
        cust.notes || '',
        JSON.stringify(cust.equipments || []),
        cust.created_at || new Date(),
        new Date()
      ]);

      if (em) existingEmails.add(em);
      if (ph) existingPhones.add(ph);
      inserted++;
    }

    console.log(`Successfully inserted ${inserted} real customers into crm_customers.`);

    const countAfter = await pool.query('SELECT COUNT(*) FROM crm_customers');
    console.log(`Total in crm_customers now: ${countAfter.rows[0].count}`);
  } finally {
    await pool.end();
  }
}

async function main() {
  if (process.env.DATABASE_URL) {
    await syncCustomersForPool(process.env.DATABASE_URL, 'DATABASE_URL');
  }
  if (process.env.CRM_DATABASE_URL && process.env.CRM_DATABASE_URL !== process.env.DATABASE_URL) {
    await syncCustomersForPool(process.env.CRM_DATABASE_URL, 'CRM_DATABASE_URL');
  }
}

main().catch(console.error);
