const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');
const env = fs.readFileSync(envPath, 'utf8');
const match = env.match(/DATABASE_URL=([^\r\n]+)/);
const { Pool } = require('../node_modules/pg');
const pool = new Pool({
  connectionString: match[1].replace(/[\"']/g, ''),
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const brands = await pool.query(`
    SELECT b.id, b.name, b.slug, b.description, b.website_url, COUNT(p.id)::int as product_count
    FROM brands b
    LEFT JOIN products p ON p.brand_id = b.id
    GROUP BY b.id
    ORDER BY product_count DESC
  `);
  for (const b of brands.rows) {
    const sample = await pool.query('SELECT name FROM products WHERE brand_id = $1 LIMIT 3', [b.id]);
    console.log('----------------------------------------------------');
    console.log(`${b.id} | ${b.name} | ${b.slug} (${b.product_count} produtos)`);
    console.log(`Atual: "${b.description}"`);
    console.log(`Site: ${b.website_url}`);
    console.log(`Exemplos: ${sample.rows.map(r => r.name).join('; ')}`);
  }
  pool.end();
}

run();
