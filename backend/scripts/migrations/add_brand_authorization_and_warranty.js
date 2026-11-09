/**
 * add_brand_authorization_and_warranty.js
 * 
 * Migração Pacote B - Governança de Marcas Autorizadas e Garantia Estruturada
 * 
 * Regras da Diretriz:
 * - is_authorized BOOLEAN DEFAULT false (padrão isAuthorized: false para todas as marcas)
 * - authorization_label VARCHAR(100) DEFAULT NULL (rótulo neutro, ex: "Revenda Autorizada")
 * - warranty_months INTEGER DEFAULT NULL (campo numérico dedicado, sem regex livre)
 */

const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  console.log('--- INICIANDO MIGRAÇÃO: PACOTE B (MARCAS E GARANTIA) ---');

  // 1. Tabela brands
  await pool.query(`
    ALTER TABLE brands 
    ADD COLUMN IF NOT EXISTS is_authorized BOOLEAN NOT NULL DEFAULT false;
  `);
  console.log('✓ Coluna is_authorized adicionada em brands (DEFAULT false)');

  await pool.query(`
    ALTER TABLE brands 
    ADD COLUMN IF NOT EXISTS authorization_label VARCHAR(100) DEFAULT NULL;
  `);
  console.log('✓ Coluna authorization_label adicionada em brands');

  // 2. Tabela products
  await pool.query(`
    ALTER TABLE products 
    ADD COLUMN IF NOT EXISTS warranty_months INTEGER DEFAULT NULL;
  `);
  console.log('✓ Coluna warranty_months adicionada em products');

  // Verificação de integridade
  const { rows: brands } = await pool.query(`
    SELECT id, name, is_authorized, authorization_label FROM brands ORDER BY name ASC
  `);
  console.log('\nEstado inicial das marcas no banco (todas is_authorized = false):');
  console.table(brands);

  await pool.end();
  console.log('--- MIGRAÇÃO CONCLUÍDA COM SUCESSO ---');
}

migrate().catch(err => {
  console.error('Erro na migração:', err);
  process.exit(1);
});
