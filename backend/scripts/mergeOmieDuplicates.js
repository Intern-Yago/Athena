require('dotenv').config({ path: '.env' });
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const MERGE_PAIRS = [
  // 1. Porta Acessórios Balde Detailers
  {
    deleteId: 'prod_omie_11878414999',
    keepId: 'prod_1790876747111',
    name: 'Porta Acessórios para Baldes Detailers - SGT Tools',
    sku: '0699990055',
    omieCode: '0699990055',
    omieCodigoProduto: 11878414999,
    price: 58.51
  },
  // 2. Suporte para Pulverizadores 5 Furos + 5 Ganchos
  {
    deleteId: 'prod_omie_11878413891',
    keepId: 'prod_1790875191809',
    name: 'Suporte para Pulverizadores 5 Furos e 5 Ganchos – Sigma Tools',
    sku: '0699990021',
    omieCode: '0699990021',
    omieCodigoProduto: 11878413891,
    price: 137.50
  },
  // 3. Suporte Plástico Modelo V para Politrizes
  {
    deleteId: 'prod_omie_11878413913',
    keepId: 'prod_1790874657729',
    name: 'Suporte Plástico Modelo V para Politrizes – Sigma Tools',
    sku: '0699990022',
    omieCode: '0699990022',
    omieCodigoProduto: 11878413913,
    price: 62.37
  },
  // 4. Suporte Organizador de Pincéis e Pulverizadores
  {
    deleteId: 'prod_omie_11878414716',
    keepId: 'prod_1790876063539',
    name: 'Suporte Organizador de Pincéis e Pulverizadores - Sigma Tools',
    sku: '0699990023',
    omieCode: '0699990023',
    omieCodigoProduto: 11878414716,
    price: 151.41
  },
  // 5. Jogo de Ferramentas CR-V Master 178 Peças
  {
    deleteId: 'prod_omie_11878336343',
    keepId: 'prod_1790778365724',
    name: 'Jogo de Ferramentas CR-V Master 178 Peças para Oficinas – SGT Tools',
    sku: '0699940001',
    omieCode: '0699940001',
    omieCodigoProduto: 11878336343,
    price: 1060.42
  },
  // 6. Bomba Manual para Transferência de Óleo
  {
    deleteId: 'prod_omie_11878337513',
    keepId: 'prod_1790183304712',
    name: 'Bomba Manual para Transferência de Óleo, Combustível e Fluidos - Sigma Tools',
    sku: '0699960001',
    omieCode: '0699960001',
    omieCodigoProduto: 11878337513,
    price: 63.75
  },
  // 7. Carrinho Detailers Dobrável
  {
    deleteId: 'prod_omie_11878414991',
    keepId: 'prod_1790794881112',
    name: 'Carrinho Detailers Dobrável para Estética Automotiva – Sigma Tools',
    sku: '0699990051',
    omieCode: '0699990051',
    omieCodigoProduto: 11878414991,
    price: 621.53
  },
  // 8. Kit 3 Bandejas Magnéticas em Silicone
  {
    deleteId: 'prod_omie_11878337532',
    keepId: 'prod_1790181571198',
    name: 'Kit 3 Bandejas Magnéticas em Silicone - Sigma Tools',
    sku: '0699990205',
    omieCode: '0699990205',
    omieCodigoProduto: 11878337532,
    price: 261.36
  },
  // 9. Acoplador com Engate Rápido para Graxeiro
  {
    deleteId: 'prod_omie_11878334015',
    keepId: 'prod_1790190834395',
    name: 'Acoplador com Engate Rápido para Graxeiro com Alça Dupla - Sigma Tools',
    sku: '0761159000',
    omieCode: '0761159000',
    omieCodigoProduto: 11878334015,
    price: 18.99
  },
  // 10. Calibrador e Medidor de Pressão de Pneus Digital 220 PSI
  {
    deleteId: 'prod_omie_11878334013',
    keepId: 'prod_1790185819966',
    name: 'Calibrador e Medidor de Pressão de Pneus Digital 220 PSI - Sigma Tools',
    sku: '0761085005',
    omieCode: '0761085005',
    omieCodigoProduto: 11878334013,
    price: 124.60
  }
];

async function executeMerge() {
  const client = await pool.connect();
  try {
    console.log('Iniciando transação de união e limpeza de duplicatas no PostgreSQL...');
    await client.query('BEGIN');

    for (const item of MERGE_PAIRS) {
      console.log(`\nProcessando: "${item.name}"`);

      // 1. Atualiza o produto oficial a manter com os dados do Omie
      const updateRes = await client.query(`
        UPDATE products
        SET 
          sku = COALESCE(NULLIF(sku, 'Tools'), $1),
          omie_code = $2,
          omie_codigo_produto = $3,
          price = CASE WHEN price IS NULL OR price = 0 THEN $4 ELSE price END,
          preco_venda = CASE WHEN preco_venda IS NULL OR preco_venda = 0 THEN $4 ELSE preco_venda END,
          updated_at = NOW()
        WHERE id = $5
        RETURNING id, name, sku, price, omie_codigo_produto
      `, [item.sku, item.omieCode, item.omieCodigoProduto, item.price, item.keepId]);

      if (updateRes.rows.length === 0) {
        console.warn(`⚠️ Produto oficial a manter não encontrado: ${item.keepId}`);
      } else {
        console.log(`  ✅ Produto oficial atualizado com sucesso: [${item.keepId}] SKU: ${updateRes.rows[0].sku} | Preço: R$ ${updateRes.rows[0].price}`);
      }

      // 2. Remove o rascunho cru do Omie sem foto
      const deleteRes = await client.query(`
        DELETE FROM products
        WHERE id = $1
        RETURNING id, name
      `, [item.deleteId]);

      if (deleteRes.rows.length === 0) {
        console.log(`  ℹ️ Produto vazio [${item.deleteId}] já havia sido removido.`);
      } else {
        console.log(`  🗑️ Rascunho duplicado sem foto removido: [${item.deleteId}] "${deleteRes.rows[0].name}"`);
      }
    }

    await client.query('COMMIT');
    console.log('\n🎉 Transação concluída com sucesso! Todas as 10 duplicatas foram unificadas e os rascunhos sem foto foram excluídos.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Erro na transação, rollback executado:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

executeMerge();
