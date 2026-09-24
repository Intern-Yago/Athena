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
  const matches = upper.match(/[A-Z0-9]{2,}[-_/][A-Z0-9]{2,}|[A-Z]{2,4}[0-9]{2,5}[A-Z0-9]*|[0-9]{2,5}[A-Z]{2,4}/g) || [];
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

/**
 * Localiza produto existente no catálogo do PostgreSQL através de múltiplos níveis de precisão (Multi-Tier Deduplication)
 */
async function findMatchingAthenaProduct(pool, { codigoProduto, codigoSku, descricao }) {
  if (!pool) return null;

  const omieId = codigoProduto ? Number(codigoProduto) : null;
  const rawSku = String(codigoSku || '').trim();
  const normCod = normalizeKey(rawSku);

  // 1. Match exato por IDs numéricos do Omie
  if (omieId && !isNaN(omieId) && omieId > 0) {
    const res = await pool.query(
      `SELECT id, name, slug, sku, omie_code, status, price_negotiable FROM products 
       WHERE omie_codigo_produto = $1 OR omie_product_id = $1 LIMIT 1`,
      [omieId]
    );
    if (res.rows.length > 0) return { product: res.rows[0], matchType: 'omie_id' };
  }

  // 2. Match exato case-insensitive por SKU ou omie_code
  if (rawSku && !SKU_STOP_WORDS.has(rawSku.toUpperCase())) {
    const res = await pool.query(
      `SELECT id, name, slug, sku, omie_code, status, price_negotiable FROM products 
       WHERE (sku IS NOT NULL AND LOWER(sku) = LOWER($1))
          OR (omie_code IS NOT NULL AND LOWER(omie_code) = LOWER($1))
       LIMIT 1`,
      [rawSku]
    );
    if (res.rows.length > 0) return { product: res.rows[0], matchType: 'exact_sku' };
  }

  // 3. Match por SKU normalizado (sem traços, pontos, barras ou espaços)
  // Ex: "MAH-3D1" equivale a "MAH3D1"
  if (normCod && normCod.length >= 3 && !SKU_STOP_WORDS.has(normCod)) {
    const res = await pool.query(
      `SELECT id, name, slug, sku, omie_code, status, price_negotiable FROM products 
       WHERE (sku IS NOT NULL AND regexp_replace(UPPER(sku), '[^A-Z0-9]', '', 'g') = $1)
          OR (omie_code IS NOT NULL AND regexp_replace(UPPER(omie_code), '[^A-Z0-9]', '', 'g') = $1)
       LIMIT 1`,
      [normCod]
    );
    if (res.rows.length > 0) return { product: res.rows[0], matchType: 'normalized_sku' };
  }

  // 4. Match de código/modelo contido no ID, slug ou nome do produto
  // Ex: Produto Athena "prod_mahovi_mah3d1_alinhador" ou nome contendo "MAH-3D1"
  if (normCod && normCod.length >= 3 && !SKU_STOP_WORDS.has(normCod)) {
    const res = await pool.query(
      `SELECT id, name, slug, sku, omie_code, status, price_negotiable FROM products 
       WHERE (id IS NOT NULL AND regexp_replace(UPPER(id), '[^A-Z0-9]', '', 'g') LIKE '%' || $1 || '%')
          OR (slug IS NOT NULL AND regexp_replace(UPPER(slug), '[^A-Z0-9]', '', 'g') LIKE '%' || $1 || '%')
          OR (name IS NOT NULL AND regexp_replace(UPPER(name), '[^A-Z0-9]', '', 'g') LIKE '%' || $1 || '%')
       ORDER BY (CASE WHEN regexp_replace(UPPER(COALESCE(sku, '')), '[^A-Z0-9]', '', 'g') = $1 THEN 1 ELSE 2 END) ASC
       LIMIT 1`,
      [normCod]
    );
    if (res.rows.length > 0) return { product: res.rows[0], matchType: 'model_in_name_or_id' };
  }

  // 5. Extração de chaves de modelo a partir da descrição e do código
  const modelCandidates = new Set([
    ...extractModelKeys(rawSku),
    ...extractModelKeys(descricao || '')
  ]);

  for (const model of modelCandidates) {
    if (model.length < 3 || SKU_STOP_WORDS.has(model)) continue;
    const res = await pool.query(
      `SELECT id, name, slug, sku, omie_code, status, price_negotiable FROM products 
       WHERE (sku IS NOT NULL AND regexp_replace(UPPER(sku), '[^A-Z0-9]', '', 'g') = $1)
          OR (id IS NOT NULL AND regexp_replace(UPPER(id), '[^A-Z0-9]', '', 'g') LIKE '%' || $1 || '%')
          OR (name IS NOT NULL AND regexp_replace(UPPER(name), '[^A-Z0-9]', '', 'g') LIKE '%' || $1 || '%')
       LIMIT 1`,
      [model]
    );
    if (res.rows.length > 0) return { product: res.rows[0], matchType: `desc_model_${model}` };
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

      console.log(`[OMIE WEBHOOK] ✅ Produto existente localizado (${matchResult.matchType}) e atualizado: "${existing.name}" (ID: ${existing.id}) | Preço: R$ ${finalPreco} | Estoque: ${finalEstoque}`);
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
