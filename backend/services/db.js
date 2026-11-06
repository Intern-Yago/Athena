/**
 * db.js
 * 
 * Camada de conexao e transacoes ACID do Athena OS.
 * Singleton resiliente para PostgreSQL (Supabase / RDS).
 */

const { Pool } = require('pg');

let poolInstance = null;

function getPool() {
  if (!poolInstance) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      console.warn('[DB WARNING] DATABASE_URL não configurada no ambiente.');
      return null;
    }
    poolInstance = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    });

    poolInstance.on('error', (err) => {
      console.error('[DB UNEXPECTED ERROR]', err.message);
    });
  }
  return poolInstance;
}

/**
 * Executa uma query simples no pool
 */
async function query(text, params = []) {
  const pool = getPool();
  if (!pool) throw new Error('Database pool não está disponível.');
  return await pool.query(text, params);
}

/**
 * Executa um bloco de codigo dentro de uma transacao atômica ACID com BEGIN / COMMIT / ROLLBACK.
 * O callback recebe o `client` com o lock reservado.
 */
async function withTransaction(callback) {
  const pool = getPool();
  if (!pool) throw new Error('Database pool não está disponível.');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  getPool,
  query,
  withTransaction
};
