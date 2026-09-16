/**
 * omieProductSyncService.js
 * 
 * Serviço de sincronização bidirecional entre Athena Loja Virtual e Omie ERP.
 * 
 * Regras de Negócio:
 * 1. SKU: O usuário pode preencher manualmente o SKU no Painel Admin.
 *    Se não preenchido, o sistema extrai automaticamente a última palavra do título (índice -1).
 * 2. Quando o produto vem do Omie: utiliza exatamente o código/SKU (codigo), descrição (descricao),
 *    valor unitário (valor_unitario) e saldo de estoque (quantidade_estoque/saldo_fisico) do Omie,
 *    criando em modo rascunho (draft) e mantendo "Sob Consulta" (price_negotiable: true).
 * 3. Bidirecionalidade:
 *    - Quando alterado no Painel Admin do Site: sincroniza com o Omie ERP via API.
 *    - Quando alterado no Omie ERP: webhook atualiza os dados no site em tempo real.
 */

const axios = require('axios');

const OMIE_PRODUTOS_URL = 'https://app.omie.com.br/api/v1/geral/produtos/';
const OMIE_ESTOQUE_AJUSTE_URL = 'https://app.omie.com.br/api/v1/estoque/ajuste/';

/**
 * Extrai o código SKU a partir do título do produto.
 * Regra: última palavra do título quando separado por espaço (index -1),
 * limpando pontuações e delimitadores.
 * Exemplo: "Elevador Automotivo MAH-4008" -> "MAH-4008"
 */
function extractSkuFromTitle(str) {
  if (!str) return '';
  const parts = String(str).trim().split(/\s+/);
  if (parts.length === 0) return '';
  const candidate = parts[parts.length - 1]; // index -1
  const clean = candidate.replace(/^[(\[{'"]+|[)\]}'"]+$/g, '').trim();
  return clean.length >= 2 ? clean : '';
}

/**
 * Helper para chamadas seguras à API do Omie
 */
async function callOmie(url, callMethod, paramObj) {
  const appKey = process.env.OMIE_APP_KEY;
  const appSecret = process.env.OMIE_APP_SECRET;

  if (!appKey || !appSecret) {
    return { success: false, reason: 'credentials_missing' };
  }

  try {
    const response = await axios.post(url, {
      call: callMethod,
      app_key: appKey,
      app_secret: appSecret,
      param: [paramObj]
    }, { timeout: 8000 });
    return { success: true, data: response.data };
  } catch (err) {
    const fault = err.response?.data?.faultstring || err.message;
    return { success: false, error: fault };
  }
}

/**
 * Sincroniza um produto do site para o Omie ERP (Site -> Omie)
 * Chamado quando um produto tem seus dados ou estoque alterados no Painel Admin.
 */
async function syncProductToOmie(pool, product) {
  const appKey = process.env.OMIE_APP_KEY;
  const appSecret = process.env.OMIE_APP_SECRET;

  if (!appKey || !appSecret) {
    console.log('[Omie Sync] OMIE_APP_KEY ou OMIE_APP_SECRET não configuradas. Sincronização com ERP suspensa.');
    return { synced: false, reason: 'no_credentials' };
  }

  try {
    const candidateSku = String(product.sku || product.omieCode || extractSkuFromTitle(product.name) || '').trim();
    const candidateOmieId = product.omieCodigoProduto || product.omieProductId || null;

    if (!candidateSku && !candidateOmieId) {
      console.log(`[Omie Sync] Produto "${product.name}" sem SKU ou ID Omie identificável. Nenhuma ação no ERP necessária.`);
      return { synced: false, reason: 'no_identifier' };
    }

    console.log(`[Omie Sync] Sincronizando produto "${product.name}" (SKU: "${candidateSku}", ID Omie: ${candidateOmieId || 'auto'}) para o Omie ERP...`);

    // 1. Consulta o produto no Omie para obter o codigo_produto definitivo
    let omieItem = null;
    if (candidateOmieId && Number(candidateOmieId) > 0) {
      const res = await callOmie(OMIE_PRODUTOS_URL, 'ConsultarProduto', { codigo_produto: Number(candidateOmieId) });
      if (res.success && res.data) omieItem = res.data;
    }

    if (!omieItem && candidateSku) {
      const res = await callOmie(OMIE_PRODUTOS_URL, 'ConsultarProduto', { codigo: candidateSku });
      if (res.success && res.data) omieItem = res.data;
    }

    if (!omieItem) {
      console.log(`[Omie Sync] Produto com SKU "${candidateSku}" não encontrado no Omie ERP.`);
      return { synced: false, reason: 'not_found_on_omie' };
    }

    const omieId = Number(omieItem.codigo_produto);
    const omieCode = String(omieItem.codigo || candidateSku).trim();

    // 2. Atualiza dados cadastrais / preço no Omie via AlterarProduto
    const precoNum = Number(product.price || product.precoVenda || 0);
    const updatePayload = {
      codigo_produto: omieId,
      codigo: omieCode,
      descricao: product.name
    };
    if (precoNum > 0) {
      updatePayload.valor_unitario = precoNum;
    }

    const alterRes = await callOmie(OMIE_PRODUTOS_URL, 'AlterarProduto', updatePayload);
    if (alterRes.success) {
      console.log(`[Omie Sync] ✅ Dados do produto "${product.name}" atualizados no Omie ERP com sucesso!`);
    } else {
      console.warn(`[Omie Sync] Aviso ao atualizar dados no Omie: ${alterRes.error}`);
    }

    // 3. Atualização de estoque no Omie se informado
    const stockQty = product.stock != null 
      ? Number(product.stock) 
      : (product.estoqueQuantidade != null ? Number(product.estoqueQuantidade) : null);

    if (stockQty != null && !isNaN(stockQty) && stockQty >= 0) {
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const yyyy = today.getFullYear();
      const formattedDate = `${dd}/${mm}/${yyyy}`;

      const ajustePayload = {
        id_prod: omieId,
        data: formattedDate,
        quan: stockQty,
        obs: 'Ajuste sincronizado via Painel Admin Athena Loja Virtual',
        origem: 'AJU',
        tipo: 'ENT',
        motivo: 'INV'
      };

      const ajusteRes = await callOmie(OMIE_ESTOQUE_AJUSTE_URL, 'IncluirAjusteEstoque', ajustePayload);
      if (ajusteRes.success) {
        console.log(`[Omie Sync] ✅ Estoque do produto "${product.name}" atualizado no Omie para ${stockQty} un.`);
      } else {
        console.warn(`[Omie Sync] Aviso ao sincronizar estoque no Omie (${stockQty} un.): ${ajusteRes.error}`);
      }
    }

    // 4. Salva o vínculo e timestamp de sincronização no PostgreSQL local
    if (pool && product.id) {
      await pool.query(`
        UPDATE products
        SET 
          sku = COALESCE(NULLIF($1, ''), sku),
          omie_code = COALESCE(NULLIF($1, ''), omie_code),
          omie_codigo_produto = COALESCE($2, omie_codigo_produto),
          omie_product_id = COALESCE($2, omie_product_id),
          omie_last_sync = CURRENT_TIMESTAMP
        WHERE id = $3
      `, [omieCode, omieId, product.id]);
    }

    return {
      synced: true,
      omieId,
      omieCode,
      productName: product.name
    };
  } catch (err) {
    console.error('[Omie Sync Error]:', err.message);
    return { synced: false, error: err.message };
  }
}

module.exports = {
  extractSkuFromTitle,
  syncProductToOmie,
  callOmie
};
