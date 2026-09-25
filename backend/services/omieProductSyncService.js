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

const SKU_STOP_WORDS = new Set([
  'TOOLS', 'SIGMA', 'MAHOVI', 'DELTA', 'STARKX', 'WOLFCAR', 'LAPEK',
  'AUTOMOTIVO', 'AUTOMOTIVA', 'VEICULAR', 'PROFISSIONAL', 'UNIVERSAL',
  'DIGITAL', 'ANALOGICO', 'MANUAL', 'ELETRICO', 'PNEUMATICO', 'HIDRAULICO',
  'PECAS', 'PECA', 'LITROS', 'LITRO', 'KG', 'TON', 'TONELADAS', 'PSI', 'BAR',
  'MM', 'CM', 'METROS', 'METRO', 'M', 'POL', 'POLEGADAS', 'PRO', 'PLUS', 'KIT', 'MINI'
]);

/**
 * Extrai o código SKU a partir do título do produto.
 * Ignora nomes de marcas e palavras genéricas.
 * Exemplo: "Elevador Automotivo MAH-4008 - Mahovi" -> "MAH-4008"
 */
function extractSkuFromTitle(str) {
  if (!str) return '';
  const parts = String(str).trim().split(/\s+/);
  if (parts.length === 0) return '';

  for (let i = parts.length - 1; i >= 0; i--) {
    const candidate = parts[i].replace(/^[(\[{'"]+|[)\]}'"]+$/g, '').trim();
    const upper = candidate.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!upper || SKU_STOP_WORDS.has(upper)) continue;

    const hasLetter = /[A-Z]/i.test(candidate);
    const hasDigit = /[0-9]/.test(candidate);
    const hasHyphen = candidate.includes('-');
    const isBarcode = /^[0-9]{6,}$/.test(candidate);

    if ((hasLetter && hasDigit) || (hasHyphen && candidate.length >= 3) || isBarcode) {
      return candidate;
    }
  }

  return '';
}

let omieBlockedUntil = 0;

/**
 * Helper para chamadas seguras à API do Omie com proteção anti-flood e cooldown
 */
async function callOmie(url, callMethod, paramObj) {
  const appKey = process.env.OMIE_APP_KEY;
  const appSecret = process.env.OMIE_APP_SECRET;

  if (!appKey || !appSecret) {
    return { success: false, reason: 'credentials_missing' };
  }

  // Se o Omie nos bloqueou temporariamente, respeita a janela de cooldown
  if (Date.now() < omieBlockedUntil) {
    const remainingSeconds = Math.ceil((omieBlockedUntil - Date.now()) / 1000);
    return { 
      success: false, 
      isBlocked: true, 
      error: `Omie ERP em cooldown por rate limit. Aguardando ${remainingSeconds}s antes de enviar novas requisições.` 
    };
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
    const fault = err.response?.data?.faultstring || err.message || '';

    // Detecta bloqueio por consumo indevido da API do Omie
    if (/bloqueada por consumo indevido/i.test(fault)) {
      const match = fault.match(/novamente em\s+(\d+)\s+segundos/i);
      const seconds = match ? parseInt(match[1], 10) : 1800;
      omieBlockedUntil = Date.now() + (seconds * 1000);
      console.warn(`[Omie Sync] ⚠️ Rate limit detectado no Omie ERP: "${fault}". Cooldown ativado por ${seconds}s.`);
    }

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

    // 3. Atualização de estoque no Omie se informado e diferente do atual
    const stockQty = product.stock != null 
      ? Number(product.stock) 
      : (product.estoqueQuantidade != null ? Number(product.estoqueQuantidade) : null);

    const currentOmieStock = omieItem.quantidade_estoque != null
      ? Number(omieItem.quantidade_estoque)
      : (omieItem.saldo_fisico != null ? Number(omieItem.saldo_fisico) : null);

    // Evita chamadas repetitivas e abusivas a IncluirAjusteEstoque:
    // Apenas envia ajuste se o estoque mudou de fato, se for > 0, ou se syncStock for explicitamente pedido
    const shouldSyncStock = stockQty != null && !isNaN(stockQty) && stockQty >= 0 && (
      product.syncStock === true ||
      (currentOmieStock != null && stockQty !== currentOmieStock) ||
      (currentOmieStock == null && stockQty > 0)
    );

    if (shouldSyncStock) {
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
    } else if (stockQty != null) {
      console.log(`[Omie Sync] Estoque do produto "${product.name}" (${stockQty} un.) já alinhado com Omie ERP (${currentOmieStock ?? 0} un.). Ajuste de estoque ignorado.`);
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
