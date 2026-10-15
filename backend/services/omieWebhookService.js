/**
 * omieWebhookService.js
 * 
 * Controlador Inteligente de Eventos e Webhooks do Omie ERP.
 * Arquitetura Event-Driven com Deduplicação Robusta Multi-Tier:
 * - Localiza produtos existentes por Omie ID, SKU, SKU normalizado, chaves de modelo no título/ID/slug
 * - NUNCA duplica produtos existentes
 * - Novos produtos desconhecidos são criados estritamente como RASCUNHO (status: 'draft') e 'Sob Consulta'
 */

const axios = require("axios");

const OMIE_APP_KEY = process.env.OMIE_APP_KEY;
const OMIE_APP_SECRET = process.env.OMIE_APP_SECRET;
const OMIE_PRODUTOS_URL = "https://app.omie.com.br/api/v1/geral/produtos/";

const SKU_STOP_WORDS = new Set([
  'TOOLS', 'SIGMA', 'MAHOVI', 'DELTA', 'STARKX', 'WOLFCAR', 'LAPEK',
  'AUTOMOTIVO', 'AUTOMOTIVA', 'VEICULAR', 'PROFISSIONAL', 'UNIVERSAL',
  'DIGITAL', 'ANALOGICO', 'MANUAL', 'ELETRICO', 'PNEUMATICO', 'HIDRAULICO',
  'PECAS', 'PECA', 'LITROS', 'LITRO', 'KG', 'TON', 'TONELADAS', 'PSI', 'BAR',
  'MM', 'CM', 'METROS', 'METRO', 'M', 'POL', 'POLEGADAS', 'PRO', 'PLUS', 'KIT', 'MINI'
]);

function normalizeKey(str) {
  if (!str) return '';
  return String(str).toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function extractModelKeys(str) {
  if (!str) return [];
  const upper = String(str).toUpperCase();
  const matches = upper.match(/[A-Z0-9]{2,}\s*[-_/]\s*[A-Z0-9]{2,}|[A-Z]{2,4}\s*[0-9]{2,5}[A-Z0-9]*|[0-9]{2,5}\s*[A-Z]{2,4}/g) || [];
  return matches.map(m => normalizeKey(m)).filter(m => m.length >= 3 && !SKU_STOP_WORDS.has(m));
}

async function fetchOmieProductDetails(codigoProduto, codigo) {
  const appKey = process.env.OMIE_APP_KEY;
  const appSecret = process.env.OMIE_APP_SECRET;

  if (!appKey || !appSecret) {
    console.warn(`[Omie Webhook] Variáveis OMIE_APP_KEY ou OMIE_APP_SECRET não configuradas no ambiente.`);
    return null;
  }

  try {
    const param = codigoProduto ? { codigo_produto: Number(codigoProduto) } : { codigo };
    const res = await axios.post(OMIE_PRODUTOS_URL, {
      call: "ConsultarProduto",
      app_key: appKey,
      app_secret: appSecret,
      param: [param]
    }, { timeout: 6000 });
    return res.data;
  } catch (err) {
    console.warn(`[Omie Webhook] Falha ao consultar detalhes do produto (${codigoProduto || codigo}): ${err.message}`);
    return null;
  }
}

function cleanTitle(str) {
  if (!str) return '';
  return String(str)
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#8211;/g, '-')
    .replace(/&#8243;/g, '"')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
}

function getSignificantTitleWords(str) {
  const cleaned = cleanTitle(str).replace(/[^A-Z0-9]/g, ' ');
  const TITLE_STOP_WORDS = new Set([
    'COM', 'SEM', 'PARA', 'DAS', 'DOS', 'UMA', 'UNS', 'POR', 'TIPO', 'NOVO', 'SOB',
    'DE', 'DA', 'DO', 'EM', 'NA', 'NO', 'E', 'O', 'A', 'AS', 'OS', 'AO', 'AOS'
  ]);
  return cleaned
    .split(/\s+/)
    .filter(w => w.length >= 3 && !SKU_STOP_WORDS.has(w) && !TITLE_STOP_WORDS.has(w));
}

/**
 * Localiza produto existente no catálogo do PostgreSQL através de múltiplos níveis de precisão (Multi-Tier Deduplication)
 * Regra estrita: prioriza SEMPRE produtos já publicados (status = 'published') com imagens válidas.
 * Procura PRIMEIRO por SKU (exato, normalizado, base, variações) e DEPOIS por Nome/Título.
 */
async function findMatchingAthenaProduct(pool, { codigoProduto, codigoSku, descricao }) {
  if (!pool) return null;

  const omieId = codigoProduto ? Number(codigoProduto) : null;
  const rawSku = String(codigoSku || '').trim();
  const normCod = normalizeKey(rawSku);

  const PRIORITY_ORDER = `ORDER BY (CASE WHEN status = 'published' THEN 0 ELSE 1 END), (CASE WHEN image IS NOT NULL AND image != '' THEN 0 ELSE 1 END), id ASC`;

  // 1. Match exato por IDs numéricos do Omie
  if (omieId && !isNaN(omieId) && omieId > 0) {
    const res = await pool.query(
      `SELECT id, name, slug, sku, omie_code, status, price_negotiable, variants FROM products 
       WHERE omie_codigo_produto = $1 OR omie_product_id = $1 
       ${PRIORITY_ORDER} LIMIT 1`,
      [omieId]
    );
    if (res.rows.length > 0) return { product: res.rows[0], matchType: 'omie_id' };
  }

  // 2. Match exato case-insensitive por SKU ou omie_code
  if (rawSku && !SKU_STOP_WORDS.has(rawSku.toUpperCase())) {
    const res = await pool.query(
      `SELECT id, name, slug, sku, omie_code, status, price_negotiable, variants FROM products 
       WHERE (sku IS NOT NULL AND LOWER(sku) = LOWER($1))
          OR (omie_code IS NOT NULL AND LOWER(omie_code) = LOWER($1))
       ${PRIORITY_ORDER} LIMIT 1`,
      [rawSku]
    );
    if (res.rows.length > 0) return { product: res.rows[0], matchType: 'exact_sku' };
  }

  // 3. Match por SKU normalizado (sem traços, pontos, barras ou espaços)
  // Ex: "MAH-3D1" equivale a "MAH3D1"
  if (normCod && normCod.length >= 3 && !SKU_STOP_WORDS.has(normCod)) {
    const res = await pool.query(
      `SELECT id, name, slug, sku, omie_code, status, price_negotiable, variants FROM products 
       WHERE (sku IS NOT NULL AND regexp_replace(UPPER(sku), '[^A-Z0-9]', '', 'g') = $1)
          OR (omie_code IS NOT NULL AND regexp_replace(UPPER(omie_code), '[^A-Z0-9]', '', 'g') = $1)
       ${PRIORITY_ORDER} LIMIT 1`,
      [normCod]
    );
    if (res.rows.length > 0) return { product: res.rows[0], matchType: 'normalized_sku' };
  }

  // 4. Match por SKU dentro do array de variações (variants JSONB)
  if (rawSku || (omieId && !isNaN(omieId) && omieId > 0)) {
    try {
      const resVariants = await pool.query(
        `SELECT id, name, slug, sku, omie_code, status, price_negotiable, variants FROM products 
         WHERE variants IS NOT NULL AND jsonb_array_length(variants) > 0
         ${PRIORITY_ORDER}`
      );
      for (const row of resVariants.rows) {
        const vars = Array.isArray(row.variants) ? row.variants : [];
        for (let i = 0; i < vars.length; i++) {
          const v = vars[i];
          if (!v) continue;
          const vSku = String(v.sku || '').trim().toLowerCase();
          const vOmie = String(v.omieCode || '').trim().toLowerCase();
          const vOmieId = v.omieProductId ? Number(v.omieProductId) : (v.omieCode && /^\d+$/.test(v.omieCode) ? Number(v.omieCode) : null);

          const targetSku = rawSku.toLowerCase();
          const targetId = omieId;

          const skuMatch = targetSku && (vSku === targetSku || vOmie === targetSku || normalizeKey(vSku) === normCod);
          const idMatch = targetId && vOmieId === targetId;

          if (skuMatch || idMatch) {
            return {
              product: row,
              matchType: 'variant_match',
              matchedVariantIndex: i,
              matchedVariant: v
            };
          }
        }
      }
    } catch (varErr) {
      console.warn(`[Omie Webhook] Erro ao buscar correspondência em variações: ${varErr.message}`);
    }
  }

  // 5. Match por SKU Base (removendo sufixos de voltagem como -110V, -220V, -127V, -DUP, -KIT)
  const baseSku = rawSku.replace(/-(?:110V|220V|127V|DUP|KIT)$/i, '').trim();
  const baseNorm = normalizeKey(baseSku);
  if (baseNorm && baseNorm !== normCod && baseNorm.length >= 3 && !SKU_STOP_WORDS.has(baseNorm)) {
    const resBase = await pool.query(
      `SELECT id, name, slug, sku, omie_code, status, price_negotiable, variants FROM products 
       WHERE (sku IS NOT NULL AND regexp_replace(UPPER(sku), '[^A-Z0-9]', '', 'g') LIKE $1 || '%')
          OR (omie_code IS NOT NULL AND regexp_replace(UPPER(omie_code), '[^A-Z0-9]', '', 'g') LIKE $1 || '%')
          OR (id IS NOT NULL AND regexp_replace(UPPER(id), '[^A-Z0-9]', '', 'g') LIKE '%' || $1 || '%')
       ${PRIORITY_ORDER} LIMIT 1`,
      [baseNorm]
    );
    if (resBase.rows.length > 0) return { product: resBase.rows[0], matchType: 'base_sku_suffix_stripped' };
  }

  // 6. Match de código/modelo contido no ID, slug ou nome do produto
  if (normCod && normCod.length >= 3 && !SKU_STOP_WORDS.has(normCod)) {
    const res = await pool.query(
      `SELECT id, name, slug, sku, omie_code, status, price_negotiable, variants FROM products 
       WHERE (id IS NOT NULL AND regexp_replace(UPPER(id), '[^A-Z0-9]', '', 'g') LIKE '%' || $1 || '%')
          OR (slug IS NOT NULL AND regexp_replace(UPPER(slug), '[^A-Z0-9]', '', 'g') LIKE '%' || $1 || '%')
          OR (name IS NOT NULL AND regexp_replace(UPPER(name), '[^A-Z0-9]', '', 'g') LIKE '%' || $1 || '%')
       ${PRIORITY_ORDER} LIMIT 1`,
      [normCod]
    );
    if (res.rows.length > 0) return { product: res.rows[0], matchType: 'model_in_name_or_id' };
  }

  // 7. Extração de chaves de modelo a partir da descrição e do código
  const modelCandidates = new Set([
    ...extractModelKeys(rawSku),
    ...extractModelKeys(descricao || '')
  ]);

  for (const model of modelCandidates) {
    if (model.length < 3 || SKU_STOP_WORDS.has(model)) continue;
    const res = await pool.query(
      `SELECT id, name, slug, sku, omie_code, status, price_negotiable, variants FROM products 
       WHERE (sku IS NOT NULL AND regexp_replace(UPPER(sku), '[^A-Z0-9]', '', 'g') = $1)
          OR (id IS NOT NULL AND regexp_replace(UPPER(id), '[^A-Z0-9]', '', 'g') LIKE '%' || $1 || '%')
          OR (name IS NOT NULL AND regexp_replace(UPPER(name), '[^A-Z0-9]', '', 'g') LIKE '%' || $1 || '%')
       ${PRIORITY_ORDER} LIMIT 1`,
      [model]
    );
    if (res.rows.length > 0) return { product: res.rows[0], matchType: `desc_model_${model}` };
  }

  // 8. Match Semântico por NOME / TÍTULO (Deduplicação Inteligente por Descrição)
  if (descricao && typeof descricao === 'string' && descricao.trim().length >= 5) {
    const cleanDesc = cleanTitle(descricao);
    const normDesc = normalizeKey(cleanDesc);

    // 8a. Match exato por nome normalizado (ignorando pontuações e espaços)
    const resExactName = await pool.query(
      `SELECT id, name, slug, sku, omie_code, status, price_negotiable, variants FROM products 
       WHERE regexp_replace(UPPER(name), '[^A-Z0-9]', '', 'g') = $1
       ${PRIORITY_ORDER} LIMIT 1`,
      [normDesc]
    );
    if (resExactName.rows.length > 0) return { product: resExactName.rows[0], matchType: 'exact_name_match' };

    // 8b. Match por sobreposição de palavras significativas no título (Keywords)
    const keywords = getSignificantTitleWords(descricao);
    if (keywords.length >= 2) {
      // Busca produtos publicados que contenham as palavras-chave
      const likeClauses = keywords.slice(0, 4).map((_, idx) => `name ILIKE $${idx + 1}`);
      const resKeywords = await pool.query(
        `SELECT id, name, slug, sku, omie_code, status, price_negotiable, variants FROM products 
         WHERE status = 'published' AND (${likeClauses.join(' AND ')})
         LIMIT 1`,
        keywords.slice(0, 4).map(k => `%${k}%`)
      );
      if (resKeywords.rows.length > 0) {
        return { product: resKeywords.rows[0], matchType: 'keywords_title_match' };
      }
    }
  }

  return null;
}

/**
 * Processa eventos de alteração de produto ou estoque recebidos via Webhook do Omie
 */
async function processOmieProductWebhook(pool, body) {
  if (!pool || !body) return { processed: false, reason: "no_pool_or_body" };

  try {
    const topic = String(body.topic || "").trim();
    const event = body.event || body;

    console.log(`[OMIE WEBHOOK] Evento de Produto/Estoque recebido: "${topic}"`);

    // Extrai identificadores de produto
    const codigoProduto = event.codigo_produto || event.id_produto || event.codigo_produto_integracao;
    const codigoSku = event.codigo || event.codigo_item;
    let descricao = event.descricao || event.nome || event.descricao_produto || "";

    if (!codigoProduto && !codigoSku) {
      console.warn("[OMIE WEBHOOK] Evento de produto sem codigo_produto ou SKU. Ignorando.");
      return { processed: false, reason: "missing_product_identifiers" };
    }

    let precoVenda = event.valor_unitario != null 
      ? Number(event.valor_unitario) 
      : (event.preco_venda != null ? Number(event.preco_venda) : null);

    let estoqueQuantidade = event.quantidade_estoque != null
      ? Number(event.quantidade_estoque)
      : (event.saldo_fisico != null 
          ? Number(event.saldo_fisico) 
          : (event.saldo_atual != null ? Number(event.saldo_atual) : null));

    // Se o webhook for esparso (não enviou preço, estoque ou descrição completos), consulta os dados frescos no Omie
    if (precoVenda == null || estoqueQuantidade == null || !descricao) {
      const details = await fetchOmieProductDetails(codigoProduto, codigoSku);
      if (details) {
        if (precoVenda == null) precoVenda = Number(details.valor_unitario || 0);
        if (estoqueQuantidade == null) estoqueQuantidade = Number(details.quantidade_estoque || 0);
        if (!descricao) descricao = details.descricao || "";
      }
    }

    const finalPreco = precoVenda != null ? Number(precoVenda) : 0;
    const finalEstoque = estoqueQuantidade != null ? Math.max(0, parseInt(estoqueQuantidade, 10)) : 0;

    // 1. Busca inteligente de correspondência com produtos já existentes na Athena
    const matchResult = await findMatchingAthenaProduct(pool, { codigoProduto, codigoSku, descricao });

    if (matchResult && matchResult.product) {
      const existing = matchResult.product;

      if (matchResult.matchType === 'variant_match') {
        const variants = Array.isArray(existing.variants) ? [...existing.variants] : [];
        const idx = matchResult.matchedVariantIndex;
        if (idx >= 0 && idx < variants.length) {
          const updatedVar = { ...variants[idx] };
          if (finalPreco > 0) updatedVar.price = finalPreco;
          updatedVar.stockQty = finalEstoque;
          if (codigoProduto) {
            updatedVar.omieProductId = Number(codigoProduto);
            updatedVar.omieCode = updatedVar.omieCode || String(codigoProduto);
          }
          if (codigoSku && !SKU_STOP_WORDS.has(String(codigoSku).toUpperCase())) {
            updatedVar.sku = updatedVar.sku || codigoSku;
          }
          variants[idx] = updatedVar;

          const hasAnyStock = variants.some(v => (Number(v.stockQty) || 0) > 0);

          await pool.query(`
            UPDATE products
            SET 
              variants = $1::jsonb,
              in_stock = CASE WHEN $2 THEN true ELSE in_stock END,
              omie_last_sync = CURRENT_TIMESTAMP
            WHERE id = $3::text
          `, [JSON.stringify(variants), hasAnyStock, existing.id]);

          console.log(`[OMIE WEBHOOK] ✅ Variação "${updatedVar.name}" (SKU: ${updatedVar.sku}) do produto "${existing.name}" (ID: ${existing.id}) atualizada via webhook! Preço: R$ ${finalPreco} | Estoque: ${finalEstoque}`);
          return {
            processed: true,
            action: "variant_updated",
            matchType: "variant_match",
            productId: existing.id,
            name: existing.name,
            variantName: updatedVar.name,
            variantSku: updatedVar.sku,
            precoVenda: finalPreco,
            estoqueQuantidade: finalEstoque
          };
        }
      }

      const cleanSku = (codigoSku && !SKU_STOP_WORDS.has(String(codigoSku).toUpperCase())) ? codigoSku : (existing.sku || '');

      await pool.query(`
        UPDATE products
        SET 
          preco_venda = CASE WHEN $1::numeric > 0 THEN $1::numeric ELSE preco_venda END,
          price = CASE WHEN (price IS NULL OR price = 0) AND $1::numeric > 0 THEN $1::numeric ELSE price END,
          estoque_quantidade = $2::integer,
          in_stock = ($2::integer > 0),
          omie_codigo_produto = COALESCE(omie_codigo_produto, $3::bigint),
          omie_product_id = COALESCE(omie_product_id, $3::bigint),
          omie_code = COALESCE(NULLIF($4::text, ''), omie_code),
          sku = CASE 
            WHEN sku IS NULL OR sku = '' OR sku IN ('Tools', 'kg', 'Litros', 'Mahovi', 'Delta', 'Sigma') 
            THEN COALESCE(NULLIF($4::text, ''), sku) 
            ELSE sku 
          END,
          omie_last_sync = CURRENT_TIMESTAMP
        WHERE id = $5::text
      `, [
        finalPreco,
        finalEstoque,
        codigoProduto ? Number(codigoProduto) : null,
        cleanSku,
        existing.id
      ]);

      if (codigoProduto && existing.id !== `prod_omie_${codigoProduto}`) {
        await pool.query(
          `DELETE FROM products WHERE id = $1 AND status = 'draft'`,
          [`prod_omie_${codigoProduto}`]
        );
      }

      console.log(`[OMIE WEBHOOK] ✅ Produto existente localizado (${matchResult.matchType}) e atualizado: "${existing.name}" (ID: ${existing.id}) | Preço: R$ ${finalPreco} | Estoque: ${finalEstoque}`);
      
      // Sincroniza catálogo XML/CSV no Cloudflare R2 em segundo plano
      try {
        const { generateAndSyncCatalogToR2 } = require('../routes/feedRoutes');
        generateAndSyncCatalogToR2(true).catch(err => console.error('[Omie Catalog Sync Notice]:', err.message));
      } catch (e) {}

      return {
        processed: true,
        action: "updated",
        matchType: matchResult.matchType,
        productId: existing.id,
        name: existing.name,
        precoVenda: finalPreco,
        estoqueQuantidade: finalEstoque
      };
    }

    // 2. Se NÃO existe em nenhuma tabela ou critério, importa como NOVO RASCUNHO (draft)
    console.log(`[OMIE WEBHOOK] Produto (${codigoProduto || codigoSku}) não existe no catálogo local. Criando como RASCUNHO...`);
    const fullProduct = await fetchOmieProductDetails(codigoProduto, codigoSku);
    if (fullProduct) {
      const { upsertOmieProductToLocal } = require("./hermesProductService");
      const inserted = await upsertOmieProductToLocal(pool, fullProduct);
      return {
        processed: true,
        action: "inserted_draft",
        product: inserted
      };
    }

    return { processed: false, reason: "product_not_found_on_omie" };
  } catch (err) {
    console.error("[processOmieProductWebhook Error]:", err.message);
    return { processed: false, error: err.message };
  }
}

module.exports = {
  processOmieProductWebhook,
  fetchOmieProductDetails,
  findMatchingAthenaProduct,
  normalizeKey,
  extractModelKeys
};
