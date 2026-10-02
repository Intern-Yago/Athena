/**
 * update_sigma_sgt_skus.js
 * 
 * Reconcilia os produtos Sigma Tools no catálogo PostgreSQL da Athena com o Omie ERP,
 * atualizando SKUs legados (numéricos antigos) para os novos códigos oficiais SGT-xxxx
 * com validação semântica de integridade (evitando falsos positivos)
 * e garantindo que todos permaneçam sob consulta (price_negotiable = true).
 * 
 * Uso:
 *   node backend/scripts/update_sigma_sgt_skus.js --dry-run
 *   node backend/scripts/update_sigma_sgt_skus.js --apply
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('../node_modules/dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });
const { Pool } = require('../node_modules/pg');

const isApply = process.argv.includes('--apply');
const isDryRun = !isApply;

function norm(str) {
  return String(str || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

const STOP_WORDS = new Set([
  'PARA', 'COM', 'SEM', 'DAS', 'DOS', 'UMA', 'UNS', 'POR', 'SIGMA', 'TOOLS',
  'TOOL', 'PECA', 'PECAS', 'PRODUTO', 'TIPO', 'NOVO', 'ORIGINAL', 'ATHENA',
  'SOB', 'CONSULTA', 'AUTO', 'AUTOMOTIVA', 'EM', 'DE', 'DA', 'DO', 'E', 'O', 'A'
]);

function getSignificantWords(text) {
  if (!text) return new Set();
  const words = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 3 && !STOP_WORDS.has(w));
  return new Set(words);
}

function hasSemanticOverlap(nameA, nameB) {
  const wordsA = getSignificantWords(nameA);
  const wordsB = getSignificantWords(nameB);
  for (const w of wordsA) {
    if (wordsB.has(w)) return true;
  }
  return false;
}

async function run() {
  console.log('===============================================================');
  console.log(` MODERNIZAÇÃO DE SKUs SIGMA TOOLS (SGT-xxxx) OMIE ERP ↔ ATHENA `);
  console.log(` Modo: ${isDryRun ? '🔍 SIMULAÇÃO / DRY-RUN' : '🚀 APLICAÇÃO REAL'}`);
  console.log('===============================================================\n');

  const cacheFile = path.join(__dirname, '../data/omie_catalog_cache.json');
  if (!fs.existsSync(cacheFile)) {
    throw new Error('Arquivo de cache omie_catalog_cache.json não encontrado!');
  }

  const omieList = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
  console.log(`📦 Produtos carregados do Omie ERP: ${omieList.length}`);

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  // 1. Indexar catálogo Omie
  const omieById = new Map();
  const omieByNormCod = new Map();
  const omieSgtList = [];

  for (const op of omieList) {
    omieById.set(Number(op.codigo_produto), op);
    const nCod = norm(op.codigo);
    if (nCod) omieByNormCod.set(nCod, op);
    if (String(op.codigo || '').toUpperCase().startsWith('SGT')) {
      omieSgtList.push(op);
    }
  }

  console.log(`🏷️  Produtos Omie com código oficial SGT: ${omieSgtList.length}\n`);

  // 2. Buscar produtos Sigma no banco da Athena
  const athenaProds = (await pool.query(`
    SELECT id, name, slug, sku, omie_code, omie_product_id, price, price_negotiable, brand_id, variants, status
    FROM products
    WHERE brand_id = 'brand_sigmatools' 
       OR name ILIKE '%sigma%' 
       OR sku LIKE 'SGT%' 
       OR omie_code LIKE 'SGT%'
    ORDER BY name ASC
  `)).rows;

  console.log(`📦 Produtos Sigma Tools identificados no catálogo Athena: ${athenaProds.length}`);

  const plannedUpdates = [];
  const alreadyUpToDate = [];
  const noSgtFound = [];
  const rejectedMismatches = [];

  for (const ap of athenaProds) {
    const curSku = String(ap.sku || '').trim();
    const curOmieCode = String(ap.omie_code || '').trim();
    let matchedOp = null;
    let matchMethod = '';

    // Estratégia 1: Extração explícita de código SGT no nome ou slug da Athena (Máxima Precisão)
    const searchStr = `${ap.name} ${ap.slug || ''}`;
    const sgtMatch = searchStr.match(/\b(SGT[-_ ]?[A-Z0-9]+(?:[-_][A-Z0-9]+)?)\b/i);
    if (sgtMatch) {
      const sgtNorm = norm(sgtMatch[1]);
      if (omieByNormCod.has(sgtNorm)) {
        matchedOp = omieByNormCod.get(sgtNorm);
        matchMethod = 'name_sgt_exact';
      } else {
        // Busca por prefixo (ex: SGT-0518 vs SGT-0518-110V)
        for (const [k, op] of omieByNormCod.entries()) {
          if (k.startsWith(sgtNorm) && k.length - sgtNorm.length <= 5) {
            matchedOp = op;
            matchMethod = 'name_sgt_prefix';
            break;
          }
        }
      }
    }

    // Estratégia 2: Vínculo por omie_product_id (com validação semântica)
    if (!matchedOp && ap.omie_product_id && omieById.has(Number(ap.omie_product_id))) {
      const op = omieById.get(Number(ap.omie_product_id));
      if (String(op.codigo).toUpperCase().startsWith('SGT')) {
        // Validação semântica: só aceita se houver sobreposição de palavras-chave
        if (hasSemanticOverlap(ap.name, op.descricao)) {
          matchedOp = op;
          matchMethod = 'omie_product_id_semantic_verified';
        } else {
          rejectedMismatches.push({
            id: ap.id,
            name: ap.name,
            claimedOmieId: ap.omie_product_id,
            omieDesc: op.descricao,
            omieCodigo: op.codigo
          });
        }
      }
    }

    // Estratégia 3: Vínculo por prod_omie_ID (com validação semântica)
    if (!matchedOp && ap.id && ap.id.startsWith('prod_omie_')) {
      const pid = Number(ap.id.replace('prod_omie_', ''));
      if (omieById.has(pid)) {
        const op = omieById.get(pid);
        if (String(op.codigo).toUpperCase().startsWith('SGT')) {
          if (hasSemanticOverlap(ap.name, op.descricao)) {
            matchedOp = op;
            matchMethod = 'prod_omie_id_semantic_verified';
          }
        }
      }
    }

    // Estratégia 4: Código numérico antigo presente na descrição Omie (com validação semântica)
    if (!matchedOp && curSku && /^\d{6,}$/.test(curSku)) {
      const matchInOmie = omieSgtList.find(op => 
        op.descricao && op.descricao.includes(curSku) && hasSemanticOverlap(ap.name, op.descricao)
      );
      if (matchInOmie) {
        matchedOp = matchInOmie;
        matchMethod = 'old_sku_in_omie_desc';
      }
    }

    if (matchedOp) {
      const officialSgtSku = String(matchedOp.codigo).trim();
      const needsSkuUpdate = curSku !== officialSgtSku;
      const needsOmieCodeUpdate = curOmieCode !== officialSgtSku;
      const needsOmieIdUpdate = Number(ap.omie_product_id) !== Number(matchedOp.codigo_produto);
      const needsNegotiableUpdate = ap.price_negotiable !== true;

      if (needsSkuUpdate || needsOmieCodeUpdate || needsOmieIdUpdate || needsNegotiableUpdate) {
        plannedUpdates.push({
          id: ap.id,
          name: ap.name,
          oldSku: curSku,
          newSku: officialSgtSku,
          oldOmieCode: curOmieCode,
          newOmieCode: officialSgtSku,
          oldOmieProductId: ap.omie_product_id,
          newOmieProductId: matchedOp.codigo_produto,
          oldPriceNegotiable: ap.price_negotiable,
          matchMethod,
          omieDesc: matchedOp.descricao
        });
      } else {
        alreadyUpToDate.push({
          id: ap.id,
          name: ap.name,
          sku: curSku
        });
      }
    } else {
      noSgtFound.push({
        id: ap.id,
        name: ap.name,
        sku: curSku
      });
    }
  }

  console.log(`\n---------------------------------------------------------------`);
  console.log(`📊 DIAGNÓSTICO DE RECONCILIAÇÃO COM VALIDAÇÃO SEMÂNTICA:`);
  console.log(`   - Produtos já 100% atualizados com SGT e Sob Consulta: ${alreadyUpToDate.length}`);
  console.log(`   - Produtos validados para atualização com SGT:          ${plannedUpdates.length}`);
  console.log(`   - Falsos positivos/conflitos prevenidos e rejeitados:   ${rejectedMismatches.length}`);
  console.log(`   - Produtos sem correspondência SGT no Omie:             ${noSgtFound.length}`);
  console.log(`---------------------------------------------------------------\n`);

  if (rejectedMismatches.length > 0) {
    console.log(`⚠️  Falsos positivos rejeitados para segurança (${rejectedMismatches.length}):`);
    console.table(rejectedMismatches.map(m => ({
      'Produto Athena': m.name.slice(0, 35),
      'Produto Omie Mapeado': m.omieDesc.slice(0, 35),
      'Código Rejeitado': m.omieCodigo
    })));
  }

  if (plannedUpdates.length > 0) {
    console.log(`\nExemplos de atualizações validadas (${Math.min(15, plannedUpdates.length)} de ${plannedUpdates.length}):`);
    console.table(plannedUpdates.slice(0, 15).map(u => ({
      Nome: u.name.slice(0, 38),
      'SKU Antigo': u.oldSku,
      'SKU Novo (SGT)': u.newSku,
      'Método': u.matchMethod
    })));
  }

  if (isApply && plannedUpdates.length > 0) {
    console.log(`\n🚀 Aplicando ${plannedUpdates.length} atualizações no banco de dados PostgreSQL...`);
    let appliedCount = 0;
    
    for (const update of plannedUpdates) {
      await pool.query(`
        UPDATE products
        SET sku = $1,
            omie_code = $2,
            omie_product_id = $3,
            omie_codigo_produto = $3,
            price_negotiable = TRUE,
            omie_last_sync = CURRENT_TIMESTAMP
        WHERE id = $4
      `, [
        update.newSku,
        update.newOmieCode,
        update.newOmieProductId,
        update.id
      ]);
      appliedCount++;
      if (appliedCount % 50 === 0 || appliedCount === plannedUpdates.length) {
        console.log(`   ✓ Progresso: ${appliedCount} de ${plannedUpdates.length} produtos atualizados...`);
      }
    }

    console.log(`\n🎉 SUCESSO! ${appliedCount} produtos Sigma Tools foram atualizados com SKU oficial SGT-xxxx e marcados com Sob Consulta (price_negotiable = true).`);
  } else if (isDryRun) {
    console.log('\n💡 Modo DRY-RUN concluído. Nenhuma alteração foi gravada no banco.');
    console.log('   Para aplicar de fato, execute: node backend/scripts/update_sigma_sgt_skus.js --apply\n');
  }

  await pool.end();
}

run().catch(err => {
  console.error('❌ Erro na execução:', err);
  process.exit(1);
});
