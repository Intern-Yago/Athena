/**
 * add_original_price.js
 * 
 * Migração Pacote C - Precificação Black Friday & Preço De / Por Real e Estruturado
 * 
 * Adiciona a coluna original_price na tabela products para suportar o preço de tabela
 * original ("De / Por") e cálculo automatizado de desconto real, sem falsas promoções.
 */

const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  console.log('--- INICIANDO MIGRAÇÃO: PACOTE C (PREÇO ORIGINAL / DE-POR) ---');

  await pool.query(`
    ALTER TABLE products 
    ADD COLUMN IF NOT EXISTS original_price NUMERIC DEFAULT NULL;
  `);
  console.log('✓ Coluna original_price adicionada em products (DEFAULT NULL)');

  // Verificação de integridade
  const { rows } = await pool.query('SELECT count(*) as total FROM products');
  console.log(`✓ Total de produtos no catálogo verificado: ${rows[0].total}`);

  await pool.end();
  console.log('--- MIGRAÇÃO CONCLUÍDA COM SUCESSO ---');
}

migrate().catch(err => {
  console.error('Erro na migração:', err);
  process.exit(1);
});
