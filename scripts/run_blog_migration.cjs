const fs = require('fs');
const path = require('path');
const { getPool } = require('../backend/services/db');

async function runMigration() {
  const sqlPath = path.resolve(__dirname, '../backend/migrations/2026_11_10_blog_module_baseline.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  
  console.log('[Migration] Lendo arquivo de migração:', sqlPath);
  console.log('[Migration] Tamanho do script:', sql.length, 'bytes');
  
  const pool = getPool();
  const client = await pool.connect();
  
  try {
    console.log('[Migration] Iniciando execução da migração no Supabase...');
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('[Migration] Sucesso! Migração do módulo de Blog aplicada com sucesso no Supabase.');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('[Migration] ERRO na execução da migração:', err);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
}

runMigration();
