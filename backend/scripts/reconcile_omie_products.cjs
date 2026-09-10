/**
 * reconcile_omie_products.cjs
 * 
 * Script inteligente de reconciliação e vínculo automático entre:
 * - Produtos do Omie ERP (via API ListarProdutos)
 * - Produtos do catálogo da Athena (PostgreSQL & athena-db.json)
 * 
 * Uso:
 *   node backend/scripts/reconcile_omie_products.cjs --dry-run
 *   node backend/scripts/reconcile_omie_products.cjs --apply
 */

const path = require('path');
const fs = require('fs');
const dotenv = require('../node_modules/dotenv');

// Carrega .env da raiz do projeto
dotenv.config({ path: path.join(__dirname, '../../.env') });
const { Pool } = require('../node_modules/pg');

const OMIE_APP_KEY = process.env.OMIE_APP_KEY;
const OMIE_APP_SECRET = process.env.OMIE_APP_SECRET;

function normalizeKey(str) {
  if (!str) return '';
  return String(str).toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function extractModelKeys(str) {
  if (!str) return [];
  const upper = String(str).toUpperCase();
  // Padrões de código como MAH-4008, SGT-0529AK, W1058, DT-CAN03, CAR-10, SKX-208, 0701052905
  const matches = upper.match(/[A-Z0-9]{2,}[-_/][A-Z0-9]{2,}|[A-Z]{2,4}[0-9]{2,5}[A-Z0-9]*|[0-9]{2,5}[A-Z]{2,4}/g) || [];
  return matches.map(m => normalizeKey(m)).filter(m => m.length >= 3);
}

async function fetchAllOmieProducts() {
  console.log('🔄 Buscando catálogo completo do Omie ERP...');
  const allOmie = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const res = await fetch('https://app.omie.com.br/api/v1/geral/produtos/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        call: 'ListarProdutos',
        app_key: OMIE_APP_KEY,
        app_secret: OMIE_APP_SECRET,
        param: [{
          pagina: page,
          registros_por_pagina: 100,
          apenas_importado_api: 'N',
          filtrar_apenas_omiepdv: 'N'
        }]
      })
    });

    const data = await res.json();
    if (data.faultstring) {
      throw new Error(`Erro Omie: ${data.faultstring}`);
    }

    totalPages = data.total_de_paginas || 1;
    const batch = data.produto_servico_cadastro || [];
    allOmie.push(...batch);
    page++;
  }

  console.log(`✅ Total de produtos carregados do Omie: ${allOmie.length}`);
  return allOmie;
}

async function reconcileProducts(options = { isDryRun: true }) {
  const isDryRun = options.isDryRun !== false;
  console.log(`\n======================================================`);
  console.log(` INICIANDO RECONCILIAÇÃO OMIE ↔ ATHENA (${isDryRun ? 'SIMULAÇÃO / DRY-RUN' : 'APLICAÇÃO REAL'})`);
  console.log(`======================================================\n`);

  const omieProducts = await fetchAllOmieProducts();

  // Mapeamentos em memória do Omie
  const omieByCode = new Map();
  const omieByModel = new Map();
  const omieByEan = new Map();

  for (const op of omieProducts) {
    const normCod = normalizeKey(op.codigo);
    if (normCod && normCod.length >= 3) {
      if (!omieByCode.has(normCod)) omieByCode.set(normCod, op);
    }

    const normEan = normalizeKey(op.ean);
    if (normEan && normEan.length >= 8) {
      if (!omieByEan.has(normEan)) omieByEan.set(normEan, op);
    }

    // Extrai candidatos a modelo da descrição
    const descKeys = extractModelKeys(op.descricao);
    for (const dk of descKeys) {
      if (!omieByModel.has(dk)) omieByModel.set(dk, op);
    }
  }

  // Busca produtos da Athena
  let pool = null;
  let athenaProducts = [];

  if (process.env.DATABASE_URL) {
    try {
      pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      });
      // Garante colunas na tabela
      await pool.query(`
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS omie_product_id BIGINT;
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS omie_code VARCHAR(100);
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS omie_last_sync TIMESTAMP;
        CREATE INDEX IF NOT EXISTS idx_products_omie_product_id ON public.products(omie_product_id);
        CREATE INDEX IF NOT EXISTS idx_products_omie_code ON public.products(omie_code);
      `);

      const res = await pool.query('SELECT id, name, slug, brand_id, omie_product_id, omie_code FROM products ORDER BY name ASC');
      athenaProducts = res.rows;
    } catch (e) {
      console.warn('⚠️ Não foi possível conectar ao Postgres, usando athena-db.json:', e.message);
    }
  }

  // Fallback JSON local se não tiver Postgres
  const dbJsonPath = path.join(__dirname, '../data/athena-db.json');
  let dbJson = null;
  if (fs.existsSync(dbJsonPath)) {
    try {
      dbJson = JSON.parse(fs.readFileSync(dbJsonPath, 'utf8'));
      if (athenaProducts.length === 0 && dbJson.products) {
        athenaProducts = dbJson.products;
      }
    } catch (e) {}
  }

  console.log(`📦 Total de produtos no catálogo da Athena: ${athenaProducts.length}\n`);

  const results = {
    total: athenaProducts.length,
    matchedCount: 0,
    alreadyLinked: 0,
    newlyMatched: 0,
    unmatchedCount: 0,
    matches: [],
    unmatched: []
  };

  const updatesToApply = [];

  for (const ap of athenaProducts) {
    if (ap.omie_product_id || ap.omieProductId) {
      results.alreadyLinked++;
    }

    const idKeys = extractModelKeys(ap.id);
    const nameKeys = extractModelKeys(ap.name);
    // Também extrai sufixo do ID: ex prod_mahovi_mah-1008 -> MAH1008
    const rawIdModel = normalizeKey(ap.id.replace(/^prod_[a-z]+_/i, ''));
    if (rawIdModel.length >= 3) idKeys.push(rawIdModel);

    const allKeys = [...new Set([...idKeys, ...nameKeys])];

    let target = null;
    let matchType = null;

    // 1. Busca por código direto
    for (const k of allKeys) {
      if (omieByCode.has(k)) {
        target = omieByCode.get(k);
        matchType = 'EXACT_CODE';
        break;
      }
    }

    // 2. Busca por modelo na descrição do Omie
    if (!target) {
      for (const k of allKeys) {
        if (omieByModel.has(k)) {
          target = omieByModel.get(k);
          matchType = 'MODEL_IN_DESC';
          break;
        }
      }
    }

    if (target) {
      results.matchedCount++;
      results.newlyMatched++;
      const matchObj = {
        athenaId: ap.id,
        athenaName: ap.name,
        omieId: target.codigo_produto,
        omieCode: target.codigo,
        omieName: target.descricao,
        matchType,
        confidence: matchType === 'EXACT_CODE' ? '100%' : '95%'
      };
      results.matches.push(matchObj);
      updatesToApply.push(matchObj);
    } else {
      results.unmatchedCount++;
      results.unmatched.push({
        athenaId: ap.id,
        athenaName: ap.name,
        brandId: ap.brand_id || ap.brandId
      });
    }
  }

  const matchPercent = ((results.matchedCount / results.total) * 100).toFixed(1);
  console.log(`📊 RESULTADO DA CORRESPONDÊNCIA:`);
  console.log(`   - Total de Produtos no Site: ${results.total}`);
  console.log(`   - Correspondidos com Sucesso: ${results.matchedCount} (${matchPercent}%)`);
  console.log(`   - Não Correspondidos / Exceções: ${results.unmatchedCount}\n`);

  if (!isDryRun && updatesToApply.length > 0) {
    console.log(`💾 Aplicando ${updatesToApply.length} vínculos no Banco de Dados...`);

    if (pool) {
      for (const item of updatesToApply) {
        await pool.query(`
          UPDATE products 
          SET omie_product_id = $1, omie_code = $2, omie_last_sync = CURRENT_TIMESTAMP
          WHERE id = $3
        `, [item.omieId, item.omieCode, item.athenaId]);
      }
      console.log(`✅ Vínculos salvos com sucesso no PostgreSQL!`);
    }

    if (dbJson && dbJson.products) {
      for (const item of updatesToApply) {
        const p = dbJson.products.find(x => x.id === item.athenaId);
        if (p) {
          p.omieProductId = item.omieId;
          p.omieCode = item.omieCode;
          p.omieLastSync = new Date().toISOString();
        }
      }
      fs.writeFileSync(dbJsonPath, JSON.stringify(dbJson, null, 2));
      console.log(`✅ Vínculos salvos com sucesso no athena-db.json!`);
    }
  } else if (isDryRun) {
    console.log(`ℹ️ Modo simulação (--dry-run). Nenhuma alteração foi gravada.`);
    console.log(`   Para aplicar no banco, execute com a flag: --apply`);
  }

  if (pool) await pool.end();
  return results;
}

// Execução via terminal direta
if (require.main === module) {
  const args = process.argv.slice(2);
  const isApply = args.includes('--apply');
  reconcileProducts({ isDryRun: !isApply })
    .then(() => process.exit(0))
    .catch(err => {
      console.error('❌ Erro na reconciliação:', err);
      process.exit(1);
    });
}

module.exports = { reconcileProducts, fetchAllOmieProducts };
