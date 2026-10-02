require('dotenv').config({ path: '.env' });
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const client = await pool.connect();
  try {
    console.log('Iniciando unificação e limpeza das 4 duplicatas manuais...');
    await client.query('BEGIN');

    // 1. Kit Funil para Óleo de Motor 15 Peças (0699990106)
    // Manter prod_1790612867800 (R$ 447,29), excluir prod_1790612977491 (R$ 0,00)
    const del1 = await client.query('DELETE FROM products WHERE id = $1 RETURNING id, name', ['prod_1790612977491']);
    console.log(`1. Kit Funil: duplicata vazia [${del1.rows[0]?.id}] "${del1.rows[0]?.name}" removida. Mantido prod_1790612867800 (R$ 447,29).`);

    // 2. Jogo de Grampos para Tapetes Automotivos (0699970000)
    // Manter prod_1790873384216, excluir prod_1790874513864
    const del2 = await client.query('DELETE FROM products WHERE id = $1 RETURNING id, name', ['prod_1790874513864']);
    console.log(`2. Jogo de Grampos: duplicata [${del2.rows[0]?.id}] "${del2.rows[0]?.name}" removida. Mantido prod_1790873384216.`);

    // 3. Jogo de Ferramentas 4 Bandejas em EVA 125 Peças (0699940010)
    // Transferir preço R$ 2.489,03 de prod_1790346674110 para prod_1790871645501 (que tem 22 specs) e excluir prod_1790346674110
    await client.query(`
      UPDATE products
      SET price = 2489.03, preco_venda = 2489.03, updated_at = NOW()
      WHERE id = 'prod_1790871645501'
    `);
    const del3 = await client.query('DELETE FROM products WHERE id = $1 RETURNING id, name', ['prod_1790346674110']);
    console.log(`3. Jogo de Ferramentas EVA: preço R$ 2.489,03 unificado no produto completo prod_1790871645501. Duplicata antiga [${del3.rows[0]?.id}] removida.`);

    // 4. Cabo de Recarga Tipo 2 para Tipo 2 32A EW1035 (EW1035)
    // Manter prod_1790623979056, excluir duplicata prod_1790624056392
    const del4 = await client.query('DELETE FROM products WHERE id = $1 RETURNING id, name', ['prod_1790624056392']);
    console.log(`4. Cabo E-Wolf EW1035: duplicata [${del4.rows[0]?.id}] "${del4.rows[0]?.name}" removida. Mantido prod_1790623979056.`);

    await client.query('COMMIT');
    console.log('\n🎉 Todas as 4 duplicatas manuais foram unificadas e limpas com sucesso!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Erro na transação, rollback executado:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

run();
