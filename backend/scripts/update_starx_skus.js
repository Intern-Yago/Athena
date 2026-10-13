const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  console.log('🔄 Iniciando atualização e sincronização dos SKUs da Stärkx com o Omie ERP...');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. SKX-018
    await client.query(`
      UPDATE products 
      SET sku = 'SKX-018',
          omie_code = 'SKX-018',
          omie_codigo_produto = 11877658191,
          price = 799.00,
          preco_venda = 799.00,
          in_stock = true,
          omie_last_sync = NOW()
      WHERE id = 'prod_starkx_skx-018'
    `);
    console.log('✅ prod_starkx_skx-018 atualizado: SKU=SKX-018 | Omie=11877658191 | R$ 799,00');

    // 2. SKX-028
    await client.query(`
      UPDATE products 
      SET sku = 'SKX-028',
          omie_code = 'SKX-028',
          omie_codigo_produto = 11877716910,
          price = 1197.00,
          preco_venda = 1197.00,
          in_stock = true,
          omie_last_sync = NOW()
      WHERE id = 'prod_starkx_skx-028'
    `);
    console.log('✅ prod_starkx_skx-028 atualizado: SKU=SKX-028 | Omie=11877716910 | R$ 1.197,00');

    // 3. SKX-038 (Omie criou EQCBSKI001)
    const skx038Variants = JSON.stringify([
      {
        id: 'var_skx038_orig',
        name: 'SKX-038',
        sku: 'SKX-038',
        omie_code: 'SKX-038',
        omie_codigo_produto: 11877659130
      }
    ]);
    await client.query(`
      UPDATE products 
      SET sku = 'EQCBSKI001',
          omie_code = 'EQCBSKI001',
          omie_codigo_produto = 11930149186,
          price = 799.00,
          preco_venda = 799.00,
          price_negotiable = false,
          in_stock = true,
          variants = $1::jsonb,
          omie_last_sync = NOW()
      WHERE id = 'prod_starkx_skx-038'
    `, [skx038Variants]);
    // Remove rascunho duplicado se existir
    await client.query(`DELETE FROM products WHERE id = 'prod_omie_11930149186'`);
    console.log('✅ prod_starkx_skx-038 atualizado: SKU=EQCBSKI001 | Omie=11930149186 | R$ 799,00 (Rascunho duplicado removido)');

    // 4. SKX-088
    await client.query(`
      UPDATE products 
      SET sku = 'SKX-088',
          omie_code = 'SKX-088',
          omie_codigo_produto = 11877659306,
          price = 1255.70,
          preco_venda = 1255.70,
          in_stock = true,
          omie_last_sync = NOW()
      WHERE id = 'prod_starkx_skx088'
    `);
    console.log('✅ prod_starkx_skx088 atualizado: SKU=SKX-088 | Omie=11877659306 | R$ 1.255,70');

    // 5. SKX-108
    await client.query(`
      UPDATE products 
      SET sku = 'SKX-108',
          omie_code = 'SKX-108',
          omie_codigo_produto = 11877659398,
          price = 1290.00,
          preco_venda = 1290.00,
          in_stock = true,
          omie_last_sync = NOW()
      WHERE id = 'prod_starkx_skx-108'
    `);
    console.log('✅ prod_starkx_skx-108 atualizado: SKU=SKX-108 | Omie=11877659398 | R$ 1.290,00');

    // 6. SKX-208
    await client.query(`
      UPDATE products 
      SET sku = 'SKX-208',
          omie_code = 'SKX-208',
          omie_codigo_produto = 11877659534,
          price = 718.20,
          preco_venda = 718.20,
          in_stock = true,
          omie_last_sync = NOW()
      WHERE id = 'prod_starkx_skx208'
    `);
    console.log('✅ prod_starkx_skx208 atualizado: SKU=SKX-208 | Omie=11877659534 | R$ 718,20');

    // 7. VENU 90 (Omie criou EQSCTCB004 e TPM VENU 90)
    const venu90Variants = JSON.stringify([
      {
        id: 'var_tpm_venu90',
        name: 'TPM VENU 90',
        sku: 'TPM VENU 90',
        omie_code: 'TPM VENU 90',
        omie_codigo_produto: 11878088773
      },
      {
        id: 'var_venu90_orig',
        name: 'VENU90',
        sku: 'VENU90',
        omie_code: 'VENU90'
      }
    ]);
    await client.query(`
      UPDATE products 
      SET sku = 'EQSCTCB004',
          omie_code = 'EQSCTCB004',
          omie_codigo_produto = 11929046930,
          price = 1400.00,
          preco_venda = 1400.00,
          price_negotiable = false,
          in_stock = true,
          variants = $1::jsonb,
          omie_last_sync = NOW()
      WHERE id = 'prod_starkx_thinkcar_venu90'
    `, [venu90Variants]);
    // Remove rascunhos duplicados
    await client.query(`DELETE FROM products WHERE id IN ('prod_omie_11929046930', 'prod_omie_11878088773')`);
    console.log('✅ prod_starkx_thinkcar_venu90 atualizado: SKU=EQSCTCB004 | Omie=11929046930 | R$ 1.400,00 (Rascunhos duplicados removidos)');

    // 8. VENU 5 (Sensor TPMS - Omie criou TPM SENSOR TPMS S2)
    const venu5Variants = JSON.stringify([
      {
        id: 'var_venu5_orig',
        name: 'VENU 5',
        sku: 'VENU-5',
        omie_code: 'VENU-5'
      }
    ]);
    await client.query(`
      UPDATE products 
      SET sku = 'TPM SENSOR TPMS S2',
          omie_code = 'TPM SENSOR TPMS S2',
          omie_codigo_produto = 11878088790,
          price = 185.00,
          preco_venda = 185.00,
          price_negotiable = false,
          in_stock = true,
          variants = $1::jsonb,
          omie_last_sync = NOW()
      WHERE id = 'prod_1787753320561'
    `, [venu5Variants]);
    // Remove rascunho duplicado
    await client.query(`DELETE FROM products WHERE id = 'prod_omie_11878088790'`);
    console.log('✅ prod_1787753320561 atualizado: SKU=TPM SENSOR TPMS S2 | Omie=11878088790 | R$ 185,00 (Rascunho duplicado removido)');

    // 9. VENU I PRO (EAATA / Thinkcar)
    const venuIProVariants = JSON.stringify([
      {
        id: 'var_venu_i_pro_orig',
        name: 'VENU-I-PRO',
        sku: 'VENU-I-PRO',
        omie_code: 'VENU-I-PRO'
      }
    ]);
    await client.query(`
      UPDATE products 
      SET sku = 'TPMS VENU I PRO',
          omie_code = 'TPMS VENU I PRO',
          omie_codigo_produto = 11878088770,
          price = 1035.00,
          preco_venda = 1035.00,
          price_negotiable = false,
          in_stock = true,
          variants = $1::jsonb,
          omie_last_sync = NOW()
      WHERE id = 'prod_eaata_venu-i-pro'
    `, [venuIProVariants]);
    await client.query(`DELETE FROM products WHERE id = 'prod_omie_11878088770'`);
    console.log('✅ prod_eaata_venu-i-pro atualizado: SKU=TPMS VENU I PRO | Omie=11878088770 | R$ 1.035,00 (Rascunho duplicado removido)');

    await client.query('COMMIT');
    console.log('\n🎉 Transação concluída com sucesso no PostgreSQL!');

    // Sincroniza athena-db.json se existir
    const dbJsonPath = path.join(__dirname, '../data/athena-db.json');
    if (fs.existsSync(dbJsonPath)) {
      try {
        const dbJson = JSON.parse(fs.readFileSync(dbJsonPath, 'utf8'));
        if (Array.isArray(dbJson.products)) {
          const removedIds = new Set([
            'prod_omie_11930149186',
            'prod_omie_11929046930',
            'prod_omie_11878088773',
            'prod_omie_11878088790',
            'prod_omie_11878088770'
          ]);
          dbJson.products = dbJson.products.filter(p => !removedIds.has(p.id));

          // Atualiza os produtos modificados no JSON
          const pMap = {
            'prod_starkx_skx-018': { sku: 'SKX-018', omie_code: 'SKX-018', omie_codigo_produto: 11877658191, price: '799.00' },
            'prod_starkx_skx-028': { sku: 'SKX-028', omie_code: 'SKX-028', omie_codigo_produto: 11877716910, price: '1197.00' },
            'prod_starkx_skx-038': { sku: 'EQCBSKI001', omie_code: 'EQCBSKI001', omie_codigo_produto: 11930149186, price: '799.00' },
            'prod_starkx_skx088': { sku: 'SKX-088', omie_code: 'SKX-088', omie_codigo_produto: 11877659306, price: '1255.70' },
            'prod_starkx_skx-108': { sku: 'SKX-108', omie_code: 'SKX-108', omie_codigo_produto: 11877659398, price: '1290.00' },
            'prod_starkx_skx208': { sku: 'SKX-208', omie_code: 'SKX-208', omie_codigo_produto: 11877659534, price: '718.20' },
            'prod_starkx_thinkcar_venu90': { sku: 'EQSCTCB004', omie_code: 'EQSCTCB004', omie_codigo_produto: 11929046930, price: '1400.00' },
            'prod_1787753320561': { sku: 'TPM SENSOR TPMS S2', omie_code: 'TPM SENSOR TPMS S2', omie_codigo_produto: 11878088790, price: '185.00' },
            'prod_eaata_venu-i-pro': { sku: 'TPMS VENU I PRO', omie_code: 'TPMS VENU I PRO', omie_codigo_produto: 11878088770, price: '1035.00' }
          };

          dbJson.products.forEach(p => {
            if (pMap[p.id]) {
              Object.assign(p, pMap[p.id]);
            }
          });

          fs.writeFileSync(dbJsonPath, JSON.stringify(dbJson, null, 2));
          console.log('✅ athena-db.json sincronizado com sucesso!');
        }
      } catch (errJson) {
        console.warn('Aviso ao sincronizar athena-db.json:', errJson.message);
      }
    }

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Erro na transação. Rollback executado:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
