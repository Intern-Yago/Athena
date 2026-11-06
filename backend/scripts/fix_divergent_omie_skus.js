/**
 * fix_divergent_omie_skus.js
 * 
 * Corrige SKUs divergentes/irregulares no Omie ERP via API (AlterarProduto)
 * e sincroniza os produtos correspondentes no PostgreSQL da Athena.
 * 
 * Regra: Apenas produtos com 100% DE CERTEZA (zero dúvidas, modelos oficiais de fábrica).
 */

const axios = require('axios');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const OMIE_APP_KEY = process.env.OMIE_APP_KEY;
const OMIE_APP_SECRET = process.env.OMIE_APP_SECRET;
const OMIE_PRODUTOS_URL = 'https://app.omie.com.br/api/v1/geral/produtos/';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Lista auditada com 100% DE CERTEZA
const CORRECTIONS = [
  {
    omieId: 11877764824,
    oldCode: 'DIGNÓSTICO MCU3',
    newCode: 'MCU3',
    desc: 'MCU3 (adaptador para leitura de Módulos)',
    dbId: 'prod_omie_11877764824'
  },
  {
    omieId: 11877764429,
    oldCode: 'DIAGNÓSTICO PROG2',
    newCode: 'PROG2',
    desc: 'PROG2 (programador)',
    dbId: 'prod_omie_11877764429'
  },
  {
    omieId: 11878089178,
    oldCode: 'EQUIP. MACACO HIDRAULICO TFJ 340',
    newCode: 'TFJ-340',
    desc: 'MACACO HIDRAULICO TFJ 340',
    dbId: 'prod_eaata_tfj-340'
  },
  {
    omieId: 11878089153,
    oldCode: 'EQUIP. CARRINHO DE FERRAMENTAS TTK 333',
    newCode: 'TTK-333',
    desc: 'CARRINHO DE FERRAMENTAS TTK 333',
    dbId: 'prod_eaata_ttk-333'
  },
  {
    omieId: 11878089144,
    oldCode: 'EQUIP. CARRINHO DE FERRAMENTAS HIBRIDO',
    newCode: 'TTK-88',
    desc: 'CARRINHO DE FERRAMENTAS HIBRIDO/ELETRICO - TTK 88',
    dbId: 'prod_eaata_ttk-88'
  },
  {
    omieId: 11878089162,
    oldCode: 'EQUIP. TOR 218',
    newCode: 'TOR-218',
    desc: 'TOR 218',
    dbId: 'prod_omie_11878089162'
  },
  {
    omieId: 11878089166,
    oldCode: 'EQUIP. M-TESTER',
    newCode: 'M-TESTER',
    desc: 'M-TESTER',
    dbId: 'prod_eaata_m-tester'
  },
  {
    omieId: 11878089175,
    oldCode: 'EQUIP. CARRINHO THINKCAR TPC 400',
    newCode: 'TPC-400',
    desc: 'CARRINHO THINKCAR TPC 400',
    dbId: 'prod_eaata_tpc-400'
  },
  {
    omieId: 11878088795,
    oldCode: 'EQUIP. TBT 360 PRO',
    newCode: 'TBT360PRO',
    desc: 'TBT 360 PRO',
    dbId: 'prod_eaata_tbt360pro'
  },
  {
    omieId: 11877767052,
    oldCode: 'DIAGNÓSTICO SCOPE BOX',
    newCode: 'SCOPE-BOX',
    desc: 'EAATA SCOPE BOX (osciloscópio)',
    dbId: 'prod_eaata_scope-box'
  },
  {
    omieId: 11877769360,
    oldCode: 'DIAGNÓSTICO AUXILIAR DE PARTIDA',
    newCode: 'EJS120',
    desc: 'AUXILIAR DE PARTIDA  EAATA- EJS 120',
    dbId: 'prod_1790717317368'
  },
  {
    omieId: 11878088864,
    oldCode: 'EQUIP.  EPD - ESTABILIZADOR EAATA',
    newCode: 'EPD002',
    desc: 'EPD - ESTABILIZADOR EAATA',
    dbId: 'prod_1790717925829'
  },
  {
    omieId: 11877768248,
    oldCode: 'DIAGNÓSTICO ECT PRO -  CANETA TESTE',
    newCode: 'ACT20',
    desc: 'ECT PRO -  CANETA TESTE EAATA',
    dbId: 'prod_1790717730558'
  },
  {
    omieId: 11877767462,
    oldCode: 'DIAGNÓSTICO EVE PRO CAMERA EAATA',
    newCode: 'TES-402',
    desc: 'EVE PRO - CAMERA EAATA',
    dbId: 'prod_1790717601334'
  },
  {
    omieId: 11877766245,
    oldCode: 'DIAGNÓSTICO ADAPT. PROG360BOX',
    newCode: 'PROG360BOX',
    desc: 'EAATA ADAPTADOR PROG360BOX - COMPATIVÉL COM PROG THINKCAR/ LAUCH',
    dbId: 'prod_1790717203446'
  },
  {
    omieId: 11877765779,
    oldCode: 'DIAGNÓSTICO ADPT. TRAVA MQB',
    newCode: 'ADAPTADOR-INS-DB1-PA',
    desc: 'EAATA ADAPTADOR TRAVA MQB',
    dbId: 'prod_eaata_adaptador-ins-db1-pa'
  },
  {
    omieId: 11877765553,
    oldCode: 'DIAGNÓSTICO ADPT. FUJITSU',
    newCode: 'ADAPTADOR-V4-LEITURA',
    desc: 'EAATA ADAPTADOR FUJITSU',
    dbId: 'prod_eaata_adaptador-v4-leitura'
  },
  {
    omieId: 11878088770,
    oldCode: 'TPMS VENU I PRO',
    newCode: 'VENU-I-PRO',
    desc: 'VENU I PRO',
    dbId: 'prod_eaata_venu-i-pro'
  },
  {
    omieId: 11878088773,
    oldCode: 'TPM VENU 90',
    newCode: 'VENU-90',
    desc: 'VENU 90',
    dbId: 'prod_starkx_thinkcar_venu90'
  },
  {
    omieId: 11878088790,
    oldCode: 'TPM SENSOR TPMS S2',
    newCode: 'VENU-5',
    desc: 'SENSOR TPMS S2 (Válvula)',
    dbId: 'prod_1787753320561'
  },
  {
    omieId: 11877763189,
    oldCode: 'SCANNER 360 PRO',
    newCode: 'EAATA360',
    desc: '360 PRO',
    dbId: 'prod_1790020231902'
  },
  {
    omieId: 11877757221,
    oldCode: 'SCANNER 399',
    newCode: 'THINKTOOL-399',
    desc: 'SCANNER THINKTOOL EXPERT 399',
    dbId: 'prod_omie_11877757221'
  },
  {
    omieId: 11916117306,
    oldCode: 'TVPA 4500 17',
    newCode: 'TVPA-4500/17',
    desc: 'EQUIP DE TESTE/MEDICAO SIMULTANEA PRESSAO/VAZAO MOD 4500 C/ 17 MGS',
    dbId: 'prod_planatc_tvpa450017'
  },
  {
    omieId: 11909222712, // Já existe como ALC-001 no Omie
    oldCode: 'ALC-001',
    newCode: 'ALC-001',
    desc: 'Alicate Aplicador de Mangueira Corrugada na Bomba e Tampa de Combustível – Planatc ALC-001',
    dbId: 'prod_planatc_alc001',
    skipOmieAlter: true
  },
  {
    omieId: 11916117316,
    oldCode: 'VSCA 1000',
    newCode: 'VSCA-1000',
    desc: 'ACIONADOR VALVULA SOLENOIDE CAMBIO AUTOMATICO - 7899513102768',
    dbId: 'prod_omie_11916117316'
  }
];

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function callOmie(callName, paramObj) {
  const payload = {
    call: callName,
    app_key: OMIE_APP_KEY,
    app_secret: OMIE_APP_SECRET,
    param: [paramObj]
  };
  const res = await axios.post(OMIE_PRODUTOS_URL, payload);
  return res.data;
}

async function run() {
  console.log('========================================================================');
  console.log(' CORREÇÃO SEGURA DE SKUs DIVERGENTES NO OMIE & BANCO POSTGRESQL');
  console.log('========================================================================\n');

  const cachePath = path.join(__dirname, '../data/omie_products_cache.json');
  let omieCache = [];
  if (fs.existsSync(cachePath)) {
    omieCache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 0. Limpeza prévia de rascunhos duplicados para não conflitar com constraints
    console.log('🧹 Limpando rascunhos duplicados legados antes de atualizar...');
    await client.query(`DELETE FROM products WHERE id = 'prod_omie_11877503447'`);

    // 1. Atualizar cada produto no Omie ERP e no PostgreSQL
    for (let i = 0; i < CORRECTIONS.length; i++) {
      const c = CORRECTIONS[i];
      console.log(`\n[${i + 1}/${CORRECTIONS.length}] Processando: ID ${c.omieId} | De: "${c.oldCode}" ➔ Para: "${c.newCode}"`);

      // A. Chamar Omie AlterarProduto se necessário
      if (!c.skipOmieAlter) {
        try {
          const omieRes = await callOmie('AlterarProduto', {
            codigo_produto: c.omieId,
            codigo: c.newCode,
            descricao: c.desc
          });
          console.log(`   ✅ Omie ERP atualizado: ${omieRes.descricao_status || 'OK'}`);
        } catch (errOmie) {
          const errorData = errOmie.response ? errOmie.response.data : errOmie.message;
          console.warn(`   ⚠️ Aviso ao atualizar Omie:`, JSON.stringify(errorData));
        }
      } else {
        console.log(`   ℹ️ Omie já possui código "${c.newCode}". Pulando chamada de alteração.`);
      }

      // B. Atualizar no PostgreSQL
      if (c.dbId) {
        const updateRes = await client.query(`
          UPDATE products
          SET sku = $1,
              omie_code = $1,
              omie_product_id = $2,
              omie_codigo_produto = $2,
              omie_last_sync = NOW()
          WHERE id = $3
        `, [c.newCode, c.omieId, c.dbId]);

        if (updateRes.rowCount > 0) {
          console.log(`   ✅ PostgreSQL atualizado no produto ${c.dbId}`);
        } else {
          console.log(`   ℹ️ Produto ${c.dbId} não localizado diretamente no banco para atualização.`);
        }
      }

      // C. Atualizar no Cache Local se existir
      const cachedItem = omieCache.find(p => Number(p.codigo_produto) === Number(c.omieId));
      if (cachedItem) {
        cachedItem.codigo = c.newCode;
      }

      // Pequena pausa para respeitar limites de taxa do Omie
      await sleep(350);
    }

    // 2. Vinculação do Elevador MAH-1005 (prod_1787854089182 com Omie 11877503447)
    console.log('\n[26/26] Vinculando Mahovi MAH-1005 (prod_1787854089182 com Omie 11877503447)...');
    await client.query(`
      UPDATE products
      SET omie_product_id = 11877503447,
          omie_codigo_produto = 11877503447,
          omie_code = 'MAH-1005',
          omie_last_sync = NOW()
      WHERE id = 'prod_1787854089182'
    `);
    console.log('   ✅ MAH-1005 vinculado oficialmente no PostgreSQL!');

    await client.query('COMMIT');
    console.log('\n🎉 Transação concluída com sucesso no PostgreSQL!');

    // Salvar cache atualizado
    if (omieCache.length > 0) {
      fs.writeFileSync(cachePath, JSON.stringify(omieCache, null, 2));
      console.log('✅ omie_products_cache.json atualizado.');
    }

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Erro durante o processo. Rollback efetuado:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(console.error);
