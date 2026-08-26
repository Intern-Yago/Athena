require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const DB_PATH = path.join(__dirname, 'data', 'athena-db.json');
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.cjtqfkedqqjuhraeesmg:XIdMCm8CWoO31qiz@aws-0-us-east-1.pooler.supabase.com:5432/postgres';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function syncToSupabase() {
  console.log('Sincronizando banco de dados Supabase com as URLs do Cloudflare R2...');

  const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  const products = data.products || [];
  const brands = data.brands || [];

  let count = 0;
  for (const p of products) {
    await pool.query(
      'UPDATE products SET image = $1, images = $2::jsonb, description = $3, specs = $4::jsonb, attachments = $5::jsonb WHERE id = $6',
      [
        p.image,
        JSON.stringify(p.images || []),
        p.description || '',
        JSON.stringify(p.specs || []),
        JSON.stringify(p.attachments || []),
        p.id
      ]
    );
    count++;
  }

  for (const b of brands) {
    await pool.query(
      'UPDATE brands SET logo = $1 WHERE id = $2',
      [b.logo, b.id]
    );
  }

  console.log(`SUCESSO: ${count} produtos e ${brands.length} marcas sincronizados no Supabase com imagens WebP no Cloudflare R2!`);
}

syncToSupabase()
  .then(() => pool.end())
  .catch((err) => {
    console.error('Erro na sincronização:', err);
    pool.end();
  });
