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

    // Delay de segurança anti-bloqueio de Rate Limit da Omie (limite estrito de 4 req/segundo)
    if (page <= totalPages) {
      await new Promise(r => setTimeout(r, 300));
    }
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

      const res = await pool.query(`
        SELECT id, name, slug, brand_id, omie_product_id, omie_code, sku, COALESCE(variants, '[]'::jsonb) as variants 
        FROM products 
        ORDER BY name ASC
      `);
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
    linkedViaVariantsCount: 0,
    totalVariantsCount: 0,
    matchedVariantsCount: 0,
    unmatchedCount: 0,
    matches: [],
    unmatched: []
  };

  const updatesToApply = [];

  for (const ap of athenaProducts) {
    const isAlreadyLinked = Boolean(ap.omie_product_id || ap.omieProductId);
    if (isAlreadyLinked) {
      results.alreadyLinked++;
    }

    // --- 1. AVALIAÇÃO DE VARIAÇÕES ---
    const rawVariants = Array.isArray(ap.variants) 
      ? ap.variants 
      : (typeof ap.variants === 'string' ? JSON.parse(ap.variants || '[]') : []);
    const variants = rawVariants.map(v => ({ ...v }));
    let variantsModified = false;
    let variantsMatchedThisProduct = 0;

    if (variants.length > 0) {
      results.totalVariantsCount += variants.length;

      for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        if (!v) continue;

        const vSku = normalizeKey(v.sku);
        const vOmie = normalizeKey(v.omieCode);
        const vKeys = [...new Set([
          vSku,
          vOmie,
          ...extractModelKeys(v.name),
          ...extractModelKeys(`${ap.name} ${v.name}`),
          ...extractModelKeys(v.sku)
        ])].filter(k => k && k.length >= 3);

        let vTarget = null;
        let vMatchType = null;

        // Busca por código direto da variação
        for (const k of vKeys) {
          if (omieByCode.has(k)) {
            vTarget = omieByCode.get(k);
            vMatchType = 'EXACT_CODE';
            break;
          }
        }

        // Busca por modelo na descrição do Omie
        if (!vTarget) {
          for (const k of vKeys) {
            if (omieByModel.has(k)) {
              vTarget = omieByModel.get(k);
              vMatchType = 'MODEL_IN_DESC';
              break;
            }
          }
        }

        if (vTarget) {
          v.omieProductId = Number(vTarget.codigo_produto);
          v.omieCode = vTarget.codigo || String(vTarget.codigo_produto);
          if (vTarget.quantidade_estoque != null) {
            v.stockQty = Number(vTarget.quantidade_estoque);
          }
          if (vTarget.valor_unitario != null && Number(vTarget.valor_unitario) > 0) {
            v.price = Number(vTarget.valor_unitario);
          }
          variants[i] = v;
          variantsModified = true;
          variantsMatchedThisProduct++;
          results.matchedVariantsCount++;
        } else if (v.omieProductId || v.omieCode) {
          variantsMatchedThisProduct++;
        }
      }
    }

    // --- 2. AVALIAÇÃO DO PRODUTO PRINCIPAL (PAI) ---
    const skuKey = normalizeKey(ap.sku);
    const idKeys = extractModelKeys(ap.id);
    const nameKeys = extractModelKeys(ap.name);
    const rawIdModel = normalizeKey(ap.id.replace(/^prod_[a-z]+_/i, ''));
    if (rawIdModel.length >= 3) idKeys.push(rawIdModel);
    if (skuKey && skuKey.length >= 3) idKeys.push(skuKey);

    const allKeys = [...new Set([...idKeys, ...nameKeys])];

    let target = null;
    let matchType = null;

    // Busca por código direto do pai
    for (const k of allKeys) {
      if (omieByCode.has(k)) {
        target = omieByCode.get(k);
        matchType = 'EXACT_CODE';
        break;
      }
    }

    // Busca por modelo na descrição do Omie
    if (!target) {
      for (const k of allKeys) {
        if (omieByModel.has(k)) {
          target = omieByModel.get(k);
          matchType = 'MODEL_IN_DESC';
          break;
        }
      }
    }

    const hasLinkedVariants = variantsMatchedThisProduct > 0;
    const isMatched = Boolean(target || hasLinkedVariants);

    if (isMatched) {
      results.matchedCount++;
      if (!isAlreadyLinked) results.newlyMatched++;
      if (!target && hasLinkedVariants) results.linkedViaVariantsCount++;

      const finalOmieId = target ? target.codigo_produto : (ap.omie_product_id || ap.omieProductId || null);
      const finalOmieCode = target ? target.codigo : (ap.omie_code || ap.omieCode || (variants.length > 0 ? variants.find(v => v.omieCode)?.omieCode : ''));
      const hasAnyStock = variants.length > 0 ? variants.some(v => (Number(v.stockQty) || 0) > 0) : null;

      const matchObj = {
        athenaId: ap.id,
        athenaName: ap.name,
        omieId: finalOmieId,
        omieCode: finalOmieCode,
        omieName: target ? target.descricao : `Vinculado via ${variantsMatchedThisProduct}/${variants.length} variações`,
        matchType: target ? matchType : 'LINKED_VIA_VARIANTS',
        variants: variantsModified ? variants : null,
        hasAnyStock,
        variantsMatchedCount: variantsMatchedThisProduct,
        totalVariants: variants.length,
        confidence: target ? (matchType === 'EXACT_CODE' ? '100%' : '95%') : '90% (Variações)'
      };

      results.matches.push(matchObj);
      if (target || variantsModified) {
        updatesToApply.push(matchObj);
      }
    } else {
      results.unmatchedCount++;
      results.unmatched.push({
        athenaId: ap.id,
        athenaName: ap.name,
        brandId: ap.brand_id || ap.brandId,
        variantsCount: variants.length
      });
    }
  }

  const matchPercent = ((results.matchedCount / results.total) * 100).toFixed(1);
  console.log(`📊 RESULTADO DA CORRESPONDÊNCIA:`);
  console.log(`   - Total de Produtos no Site: ${results.total}`);
  console.log(`   - Total de Variações Encontradas: ${results.totalVariantsCount}`);
  console.log(`   - Variações Correspondidas: ${results.matchedVariantsCount}`);
  console.log(`   - Produtos Correspondidos (Pai ou Variações): ${results.matchedCount} (${matchPercent}%)`);
  console.log(`   - Produtos Vinculados via Variações: ${results.linkedViaVariantsCount}`);
  console.log(`   - Não Correspondidos / Exceções: ${results.unmatchedCount}\n`);

  if (!isDryRun && updatesToApply.length > 0) {
    console.log(`💾 Aplicando ${updatesToApply.length} vínculos no Banco de Dados...`);

    if (pool) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        for (const item of updatesToApply) {
          await client.query(`
            UPDATE products 
            SET 
              omie_product_id = COALESCE($1, omie_product_id), 
              omie_code = COALESCE(NULLIF($2, ''), omie_code),
              variants = CASE WHEN $3::jsonb IS NOT NULL THEN $3::jsonb ELSE variants END,
              in_stock = CASE WHEN $4::boolean IS NOT NULL THEN $4::boolean ELSE in_stock END,
              omie_last_sync = CURRENT_TIMESTAMP
            WHERE id = $5
          `, [
            item.omieId, 
            item.omieCode || '', 
            item.variants ? JSON.stringify(item.variants) : null, 
            item.hasAnyStock, 
            item.athenaId
          ]);
        }
        await client.query('COMMIT');
        console.log(`✅ Vínculos e variações salvos com sucesso no PostgreSQL!`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Erro na transação do PostgreSQL:', err.message);
        throw err;
      } finally {
        client.release();
      }
    }

    if (dbJson && dbJson.products) {
      for (const item of updatesToApply) {
        const p = dbJson.products.find(x => x.id === item.athenaId);
        if (p) {
          if (item.omieId) p.omieProductId = item.omieId;
          if (item.omieCode) p.omieCode = item.omieCode;
          if (item.variants) p.variants = item.variants;
          if (item.hasAnyStock !== null) p.inStock = item.hasAnyStock;
          p.omieLastSync = new Date().toISOString();
        }
      }
      fs.writeFileSync(dbJsonPath, JSON.stringify(dbJson, null, 2));
      console.log(`✅ Vínculos e variações salvos com sucesso no athena-db.json!`);
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
