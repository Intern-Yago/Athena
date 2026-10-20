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
const fs = require('fs');
const path = require('path');

const OMIE_PRODUTOS_URL = 'https://app.omie.com.br/api/v1/geral/produtos/';
const OMIE_ESTOQUE_AJUSTE_URL = 'https://app.omie.com.br/api/v1/estoque/ajuste/';
const OMIE_ESTOQUE_CONSULTA_URL = 'https://app.omie.com.br/api/v1/estoque/consulta/';

/**
 * Busca de contingência no cache local do Omie (omie_products_cache.json)
 * caso a API do Omie esteja em cooldown de rate-limit.
 */
function findInLocalOmieCache(candidateSku, candidateOmieId) {
  try {
    const cachePath = path.join(__dirname, '../data/omie_products_cache.json');
    if (!fs.existsSync(cachePath)) return null;
    const list = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    if (!Array.isArray(list)) return null;

    if (candidateOmieId && Number(candidateOmieId) > 0) {
      const byId = list.find(item => Number(item.codigo_produto) === Number(candidateOmieId));
      if (byId) return byId;
    }
    if (candidateSku) {
      const cleanTarget = String(candidateSku).trim().toUpperCase();
      const bySku = list.find(item => String(item.codigo || '').trim().toUpperCase() === cleanTarget);
      if (bySku) return bySku;
    }
  } catch (_) {}
  return null;
}

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

    // Fallback para cache local caso a API do Omie esteja em rate-limit temporário
    if (!omieItem) {
      omieItem = findInLocalOmieCache(candidateSku, candidateOmieId);
    }

    if (!omieItem) {
      console.log(`[Omie Sync] Produto com SKU "${candidateSku}" não encontrado no Omie ERP.`);
      return { synced: false, reason: 'not_found_on_omie' };
    }

    const omieId = Number(omieItem.codigo_produto);
    const omieCode = String(omieItem.codigo || candidateSku).trim();

    // 1.1 Consulta PosicaoEstoque em tempo real no Omie (para puxar saldo de estoque e preço atualizados)
    let posicaoEstoque = null;
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    const formattedDate = `${dd}/${mm}/${yyyy}`;

    if (omieId > 0) {
      const stockRes = await callOmie(OMIE_ESTOQUE_CONSULTA_URL, 'PosicaoEstoque', {
        codigo_local_estoque: 0,
        id_prod: omieId,
        data: formattedDate
      });
      if (stockRes.success && stockRes.data) {
        posicaoEstoque = stockRes.data;
      }
    }

    // 2. Hidratação Bidirecional de Preço / Valor de Venda:
    // - Se o usuário NÃO preencheu preço (<= 0), puxa automaticamente do Omie!
    // - Se o usuário preencheu um preço (> 0), envia para o Omie.
    const userPrice = Number(product.price || product.precoVenda || product.preco_venda || 0);
    const omieUnitPrice = Number(
      omieItem.valor_unitario ||
      posicaoEstoque?.nPrecoUnitario ||
      posicaoEstoque?.preco_unitario ||
      0
    );

    let finalPrice = userPrice;
    if (userPrice <= 0 && omieUnitPrice > 0) {
      finalPrice = omieUnitPrice;
      product.price = finalPrice;
      product.precoVenda = finalPrice;
      product.preco_venda = finalPrice;
      console.log(`[Omie Sync] 💰 Preço puxado automaticamente do Omie para "${product.name}": R$ ${finalPrice}`);
    } else if (userPrice > 0) {
      const updatePayload = {
        codigo_produto: omieId,
        codigo: omieCode,
        descricao: product.name,
        valor_unitario: userPrice
      };
      const alterRes = await callOmie(OMIE_PRODUTOS_URL, 'AlterarProduto', updatePayload);
      if (alterRes.success) {
        console.log(`[Omie Sync] ✅ Dados do produto "${product.name}" atualizados no Omie ERP com sucesso!`);
      } else {
        console.warn(`[Omie Sync] Aviso ao atualizar dados no Omie: ${alterRes.error}`);
      }
    }

    // 3. Hidratação Bidirecional de Estoque:
    // - Se o estoque não foi preenchido (ou está 0) no site, puxa o saldo real do Omie!
    // - Se o usuário preencheu um estoque > 0 diferente do Omie, atualiza no Omie.
    const rawUserStock = product.stock != null && product.stock !== ''
      ? Number(product.stock)
      : (product.estoqueQuantidade != null && product.estoqueQuantidade !== '' ? Number(product.estoqueQuantidade) : 0);

    const currentOmieStock = posicaoEstoque?.saldo != null
      ? Number(posicaoEstoque.saldo)
      : (posicaoEstoque?.fisico != null
          ? Number(posicaoEstoque.fisico)
          : (omieItem.quantidade_estoque != null
              ? Number(omieItem.quantidade_estoque)
              : (omieItem.saldo_fisico != null ? Number(omieItem.saldo_fisico) : null)));

    let finalStock = rawUserStock;
    if ((!rawUserStock || rawUserStock <= 0) && currentOmieStock != null && !isNaN(currentOmieStock)) {
      finalStock = Math.max(0, Math.round(currentOmieStock));
      product.stock = finalStock;
      product.estoqueQuantidade = finalStock;
      product.estoque_quantidade = finalStock;
      product.inStock = finalStock > 0 || product.inStock !== false;
      console.log(`[Omie Sync] 📦 Estoque puxado automaticamente do Omie para "${product.name}": ${finalStock} un.`);
    } else {
      const shouldSyncStock = rawUserStock != null && !isNaN(rawUserStock) && rawUserStock > 0 && (
        product.syncStock === true ||
        (currentOmieStock != null && rawUserStock !== currentOmieStock) ||
        currentOmieStock == null
      );

      if (shouldSyncStock) {
        const ajustePayload = {
          id_prod: omieId,
          data: formattedDate,
          quan: rawUserStock,
          obs: 'Ajuste sincronizado via Painel Admin Athena Loja Virtual',
          origem: 'AJU',
          tipo: 'ENT',
          motivo: 'INV'
        };

        const ajusteRes = await callOmie(OMIE_ESTOQUE_AJUSTE_URL, 'IncluirAjusteEstoque', ajustePayload);
        if (ajusteRes.success) {
          console.log(`[Omie Sync] ✅ Estoque do produto "${product.name}" atualizado no Omie para ${rawUserStock} un.`);
        } else {
          console.warn(`[Omie Sync] Aviso ao sincronizar estoque no Omie (${rawUserStock} un.): ${ajusteRes.error}`);
        }
      }
    }

    // 3.0 Hidratação Automática de Medidas e Peso (se ausentes no produto):
    // Puxa largura, altura, profundidade (cm) e peso_bruto/peso_liq (kg) do Omie
    const omieWidth = Number(omieItem.largura || 0);
    const omieHeight = Number(omieItem.altura || 0);
    const omieDepth = Number(omieItem.profundidade || omieItem.comprimento || 0);
    const omieWeight = Number(omieItem.peso_bruto || omieItem.peso_liq || 0);

    const currentSpecs = Array.isArray(product.specs) ? [...product.specs] : [];
    const hasWeightSpec = currentSpecs.some(s => /peso/i.test(String(s)));
    const hasDimensionSpec = currentSpecs.some(s => /(dimens|medidas|tamanho|largura|altura)/i.test(String(s)));

    if (!hasWeightSpec && omieWeight > 0) {
      currentSpecs.push(`Peso bruto: ${omieWeight.toString().replace('.', ',')} kg`);
      product.weight = omieWeight;
      console.log(`[Omie Sync] ⚖️ Peso puxado automaticamente do Omie para "${product.name}": ${omieWeight} kg`);
    }

    if (!hasDimensionSpec && (omieWidth > 0 || omieHeight > 0 || omieDepth > 0)) {
      const wStr = omieWidth > 0 ? omieWidth : 20;
      const hStr = omieHeight > 0 ? omieHeight : 15;
      const dStr = omieDepth > 0 ? omieDepth : 25;
      currentSpecs.push(`Dimensões: ${wStr} x ${hStr} x ${dStr} cm`);
      if (omieWidth > 0) product.width = omieWidth;
      if (omieHeight > 0) product.height = omieHeight;
      if (omieDepth > 0) product.length = omieDepth;
      console.log(`[Omie Sync] 📏 Medidas puxadas automaticamente do Omie para "${product.name}": ${wStr}x${hStr}x${dStr} cm`);
    }

    product.specs = currentSpecs;

    // 3.1 Sincronização individual das variações (se houverem)
    if (Array.isArray(product.variants) && product.variants.length > 0) {
      for (let i = 0; i < product.variants.length; i++) {
        const v = product.variants[i];
        if (!v) continue;
        const vSku = String(v.sku || v.omieCode || '').trim();
        const vOmieId = v.omieProductId ? Number(v.omieProductId) : (v.omieCode && /^\d+$/.test(v.omieCode) ? Number(v.omieCode) : null);
        if (!vSku && !vOmieId) continue;

        try {
          let omieVarItem = null;
          if (vOmieId && vOmieId > 0) {
            const res = await callOmie(OMIE_PRODUTOS_URL, 'ConsultarProduto', { codigo_produto: vOmieId });
            if (res.success && res.data) omieVarItem = res.data;
          }
          if (!omieVarItem && vSku) {
            const res = await callOmie(OMIE_PRODUTOS_URL, 'ConsultarProduto', { codigo: vSku });
            if (res.success && res.data) omieVarItem = res.data;
          }
          if (!omieVarItem) {
            omieVarItem = findInLocalOmieCache(vSku, vOmieId);
          }

          if (omieVarItem) {
            const vProdId = Number(omieVarItem.codigo_produto);
            v.omieProductId = vProdId;
            v.omieCode = String(omieVarItem.codigo || vSku).trim();

            const vPrice = Number(v.price || 0);
            const omieVarPrice = Number(omieVarItem.valor_unitario || 0);
            if (vPrice <= 0 && omieVarPrice > 0) {
              v.price = omieVarPrice;
            } else if (vPrice > 0) {
              await callOmie(OMIE_PRODUTOS_URL, 'AlterarProduto', {
                codigo_produto: vProdId,
                codigo: omieVarItem.codigo || vSku,
                descricao: `${product.name} - ${v.name}`,
                valor_unitario: vPrice
              });
            }

            const vStock = v.stockQty !== '' && v.stockQty != null ? Number(v.stockQty) : null;
            const currentVStock = omieVarItem.quantidade_estoque != null
              ? Number(omieVarItem.quantidade_estoque)
              : (omieVarItem.saldo_fisico != null ? Number(omieVarItem.saldo_fisico) : null);

            if ((vStock == null || vStock <= 0) && currentVStock != null && !isNaN(currentVStock)) {
              v.stockQty = Math.max(0, Math.round(currentVStock));
            } else if (vStock != null && !isNaN(vStock) && vStock > 0) {
              if (currentVStock != null && vStock !== currentVStock) {
                await callOmie(OMIE_ESTOQUE_AJUSTE_URL, 'IncluirAjusteEstoque', {
                  id_prod: vProdId,
                  data: formattedDate,
                  quan: vStock,
                  obs: `Ajuste variação ${v.name} via Painel Admin Athena`,
                  origem: 'AJU',
                  tipo: 'ENT',
                  motivo: 'INV'
                });
              }
            }
          }
        } catch (vErr) {
          console.warn(`[Omie Sync] Aviso ao sincronizar variação "${v.name}":`, vErr.message);
        }
      }
    }

    product.sku = product.sku || omieCode;
    product.omieCode = omieCode;
    product.omieProductId = omieId;
    product.omieCodigoProduto = omieId;

    // 4. Salva o vínculo, preços, estoque, medidas e timestamp de sincronização no PostgreSQL local
    if (pool && product.id) {
      await pool.query(`
        UPDATE products
        SET 
          sku = COALESCE(NULLIF($1, ''), sku),
          omie_code = COALESCE(NULLIF($1, ''), omie_code),
          omie_codigo_produto = COALESCE($2, omie_codigo_produto),
          omie_product_id = COALESCE($2, omie_product_id),
          price = CASE WHEN $3::numeric > 0 THEN $3::numeric ELSE price END,
          preco_venda = CASE WHEN $3::numeric > 0 THEN $3::numeric ELSE preco_venda END,
          estoque_quantidade = $4::integer,
          in_stock = $5::boolean,
          specs = $6::jsonb,
          variants = $7::jsonb,
          omie_last_sync = CURRENT_TIMESTAMP
        WHERE id = $8
      `, [
        omieCode,
        omieId,
        finalPrice > 0 ? finalPrice : 0,
        finalStock != null && !isNaN(finalStock) ? Math.max(0, Math.round(finalStock)) : 0,
        Boolean(product.inStock),
        JSON.stringify(Array.isArray(product.specs) ? product.specs : []),
        JSON.stringify(Array.isArray(product.variants) ? product.variants : []),
        product.id
      ]);
    }

    return {
      synced: true,
      omieId,
      omieCode,
      price: finalPrice,
      stock: finalStock,
      specs: product.specs,
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
