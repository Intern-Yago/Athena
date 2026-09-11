/**
 * omieWebhookService.js
 * 
 * Controlador de Eventos e Webhooks do Omie ERP para Atualizacao de Produtos e Estoque.
 * Arquitetura Event-Driven: Mantem a replica de leitura no Supabase (PostgreSQL) 100% atualizada
 * em tempo real com alteracoes de preco e estoque feitas no Omie.
 */

const axios = require("axios");

const OMIE_APP_KEY = process.env.OMIE_APP_KEY || "7410462256197";
const OMIE_APP_SECRET = process.env.OMIE_APP_SECRET || "0a8c9d675963da05b8565eb75a167020";
const OMIE_PRODUTOS_URL = "https://app.omie.com.br/api/v1/geral/produtos/";

async function fetchOmieProductDetails(codigoProduto, codigo) {
  try {
    const param = codigoProduto ? { codigo_produto: Number(codigoProduto) } : { codigo };
    const res = await axios.post(OMIE_PRODUTOS_URL, {
      call: "ConsultarProduto",
      app_key: OMIE_APP_KEY,
      app_secret: OMIE_APP_SECRET,
      param: [param]
    }, { timeout: 6000 });
    return res.data;
  } catch (err) {
    console.warn(`[Omie Webhook] Falha ao consultar detalhes do produto (${codigoProduto || codigo}): ${err.message}`);
    return null;
  }
}

/**
 * Processa eventos de alteracao de produto ou estoque recebidos via Webhook do Omie
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

    // Se o webhook for esparso (nao enviou preco ou estoque completos), consulta os dados frescos no Omie
    if (precoVenda == null || estoqueQuantidade == null) {
      const details = await fetchOmieProductDetails(codigoProduto, codigoSku);
      if (details) {
        if (precoVenda == null) precoVenda = Number(details.valor_unitario || 0);
        if (estoqueQuantidade == null) estoqueQuantidade = Number(details.quantidade_estoque || 0);
      }
    }

    const finalPreco = precoVenda != null ? Number(precoVenda) : 0;
    const finalEstoque = estoqueQuantidade != null ? Math.max(0, parseInt(estoqueQuantidade, 10)) : 0;

    // 1. Tenta atualizar produto existente na tabela products
    const updateRes = await pool.query(`
      UPDATE products
      SET 
        preco_venda = $1,
        price = CASE WHEN $1 > 0 THEN $1 ELSE price END,
        estoque_quantidade = $2,
        in_stock = ($2 > 0),
        omie_codigo_produto = COALESCE(omie_codigo_produto, $3),
        omie_product_id = COALESCE(omie_product_id, $3),
        omie_code = COALESCE(NULLIF($4, ''), omie_code),
        omie_last_sync = CURRENT_TIMESTAMP
      WHERE 
        (omie_codigo_produto IS NOT NULL AND omie_codigo_produto = $3) OR
        (omie_product_id IS NOT NULL AND omie_product_id = $3) OR
        (omie_code IS NOT NULL AND omie_code != '' AND LOWER(omie_code) = LOWER($4))
      RETURNING id, name, slug, price_negotiable
    `, [
      finalPreco,
      finalEstoque,
      codigoProduto ? Number(codigoProduto) : null,
      codigoSku || ""
    ]);

    if (updateRes.rows.length > 0) {
      const updated = updateRes.rows[0];
      console.log(`[OMIE WEBHOOK] Produto atualizado no Supabase: "${updated.name}" | Preco: R$ ${finalPreco} | Estoque: ${finalEstoque}`);
      return {
        processed: true,
        action: "updated",
        productId: updated.id,
        name: updated.name,
        precoVenda: finalPreco,
        estoqueQuantidade: finalEstoque
      };
    }

    // 2. Se nao encontrou pelo ID nem SKU, tenta importar o produto completo para o cache
    console.log(`[OMIE WEBHOOK] Produto (${codigoProduto || codigoSku}) nao existe no banco local. Carregando dados completos do Omie...`);
    const fullProduct = await fetchOmieProductDetails(codigoProduto, codigoSku);
    if (fullProduct) {
      const { upsertOmieProductToLocal } = require("./hermesProductService");
      const inserted = await upsertOmieProductToLocal(pool, fullProduct);
      return {
        processed: true,
        action: "inserted_cache",
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
  fetchOmieProductDetails
};
