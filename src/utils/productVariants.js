/**
 * Product Variants Business Rules & Availability Calculator
 * 
 * Regra 1:
 * Quando o produto principal estiver "Sob Consulta" (priceNegotiable !== false ou preço base <= 0),
 * TODAS as suas variações estarão automaticamente sob consulta também, independente do preço da variação.
 * 
 * Regra 2:
 * Se o produto principal estiver disponível para venda online:
 * As variações podem estar ativas para venda ou desativadas.
 * - Modo Automático ('auto'):
 *   Controlado pela quantidade em estoque. Se o estoque zerar (<= 0), desativa automaticamente.
 * - Modo Manual Ativa ('manual_active'):
 *   Prioridade manual: Força a variação a ficar ATIVA para venda no site, mesmo com estoque zerado (ex: sob encomenda).
 * - Modo Manual Inativa ('manual_inactive'):
 *   Prioridade manual: Força a variação a ficar DESATIVADA no site, mesmo que haja estoque registrado.
 */

export function isProductQuoteOnly(product) {
  if (!product) return true;
  const baseHasPrice = Number(product.price) > 0;
  return Boolean(product.priceNegotiable !== false || !baseHasPrice);
}

export function getVariantStockNumber(variant) {
  if (!variant) return null;
  if (variant.stockQty === '' || variant.stockQty === undefined || variant.stockQty === null) {
    return null;
  }
  const parsed = Number(variant.stockQty);
  return isNaN(parsed) ? null : parsed;
}

export function getVariantAvailability(variant, product) {
  if (!variant) {
    return {
      available: false,
      isQuoteOnly: false,
      canBuy: false,
      reason: 'not_found',
      label: 'Variação não encontrada',
      statusControl: 'auto',
      stockQty: null
    };
  }

  // 1. Regra Mestre: Produto Sob Consulta => Todas as variações ficam Sob Consulta
  if (isProductQuoteOnly(product)) {
    return {
      available: true, // Disponível para cotação comercial
      isQuoteOnly: true,
      canBuy: false, // Bloqueado para checkout online direto
      reason: 'quote_only',
      label: 'Sob Consulta',
      statusControl: variant.statusControl || 'auto',
      stockQty: getVariantStockNumber(variant)
    };
  }

  // 2. Modo de controle (com fallback retrocompatível para isActive)
  let mode = variant.statusControl;
  if (!mode) {
    if (variant.isActive === false) {
      mode = 'manual_inactive';
    } else if (variant.isActive === true && variant.isManualForce) {
      mode = 'manual_active';
    } else {
      mode = 'auto';
    }
  }

  const stock = getVariantStockNumber(variant);

  // Prioridade Manual: Desativada pelo usuário
  if (mode === 'manual_inactive' || variant.isActive === false) {
    return {
      available: false,
      isQuoteOnly: false,
      canBuy: false,
      reason: 'manual_inactive',
      label: 'Desativada Manualmente',
      statusControl: 'manual_inactive',
      stockQty: stock
    };
  }

  // Prioridade Manual: Ativada pelo usuário (mesmo se o estoque zerar)
  if (mode === 'manual_active') {
    return {
      available: true,
      isQuoteOnly: false,
      canBuy: true,
      reason: 'manual_active',
      label: stock !== null && stock <= 0 ? 'Ativa (Sob Encomenda)' : 'Ativa (Manual)',
      statusControl: 'manual_active',
      stockQty: stock
    };
  }

  // Modo Automático: verificação pelo saldo de estoque
  if (stock !== null && stock <= 0) {
    return {
      available: false,
      isQuoteOnly: false,
      canBuy: false,
      reason: 'auto_inactive',
      label: 'Esgotada (Desativada Automaticamente)',
      statusControl: 'auto',
      stockQty: stock
    };
  }

  return {
    available: true,
    isQuoteOnly: false,
    canBuy: true,
    reason: 'auto_active',
    label: 'Ativa para Venda',
    statusControl: 'auto',
    stockQty: stock
  };
}

export function isVariantActiveForSale(variant, product) {
  const result = getVariantAvailability(variant, product);
  return result.canBuy;
}

export function isVariantVisibleInCatalog(variant, product) {
  if (!variant || variant.showInCatalog === false) return false;
  // Se o usuário desativou manualmente, nunca exibe nos cards
  if (variant.statusControl === 'manual_inactive' || variant.isActive === false) return false;
  // Se for produto sob consulta, exibe as opções no card para orçamento
  if (isProductQuoteOnly(product)) return true;
  // Se for para venda no site, exibe se estiver ativa para compra
  const avail = getVariantAvailability(variant, product);
  return avail.canBuy;
}
