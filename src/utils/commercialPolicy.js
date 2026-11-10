/**
 * commercialPolicy.js
 * 
 * Fonte Única de Verdade (Single Source of Truth) para Governança Comercial da Athena.
 * Desacopla estritamente a Exibição de Preço da Autorização de Checkout Online.
 * 
 * Modalidades:
 * 1. direct_sale: Venda direta online (equipamentos leves, consumíveis e licenças).
 * 2. variable_tax: Variação tributária (scanners e ferramentas com faturamento direto CPF vs MEI vs CNPJ). Preço oculto por padrão.
 * 3. technical_consultative: Maquinário pesado (elevadores, alinhadores 3D). Preço oculto por padrão.
 */

import { formatAttributionForWhatsApp } from './utmTracker.js';

export const COMMERCIAL_MODES = Object.freeze({
  DIRECT_SALE: 'direct_sale',
  VARIABLE_TAX: 'variable_tax',
  TECHNICAL_CONSULTATIVE: 'technical_consultative'
});

export const VALID_COMMERCIAL_MODES = Object.freeze([
  COMMERCIAL_MODES.DIRECT_SALE,
  COMMERCIAL_MODES.VARIABLE_TAX,
  COMMERCIAL_MODES.TECHNICAL_CONSULTATIVE
]);

/**
 * Retorna a modalidade comercial normalizada de um produto.
 * Fallback seguro: 'variable_tax'.
 */
export function getCommercialMode(product) {
  if (!product || typeof product !== 'object') return COMMERCIAL_MODES.VARIABLE_TAX;
  const mode = product.commercialMode || product.commercial_mode;
  if (VALID_COMMERCIAL_MODES.includes(mode)) {
    return mode;
  }
  return COMMERCIAL_MODES.VARIABLE_TAX;
}

/**
 * Determina se o preço deve ser exibido para o cliente final no site.
 * - direct_sale: Preço exibido se for estritamente maior que zero.
 * - variable_tax e technical_consultative: Preço OCULTO por padrão.
 *   Só é exibido se explicitamente marcado com isPriceVisible / is_price_visible === true.
 */
export function shouldShowPrice(product) {
  if (!product || typeof product !== 'object') return false;
  const price = Number(product.price || product.preco_venda || 0);
  if (price <= 0) return false;

  const mode = getCommercialMode(product);
  if (mode === COMMERCIAL_MODES.DIRECT_SALE) {
    return true;
  }

  // Nas modalidades consultivas, exige flag explícita por produto
  const isExplicitlyVisible = Boolean(product.isPriceVisible ?? product.is_price_visible ?? false);
  return isExplicitlyVisible;
}

export const isPriceVisible = shouldShowPrice;

/**
 * Determina se o produto está autorizado para finalização de compra online via Gateway (Asaas).
 * Regra Inviolável: Apenas produtos em direct_sale com preço > 0 podem ser comprados online.
 */
export function canCheckout(product) {
  if (!product || typeof product !== 'object') return false;
  const mode = getCommercialMode(product);
  if (mode !== COMMERCIAL_MODES.DIRECT_SALE) return false;

  const price = Number(product.price || product.preco_venda || 0);
  return price > 0;
}

/**
 * Retorna as informações do badge de exibição para cards e listas.
 * Regra: Sem 'Pronta Entrega', apenas sinalização consultiva profissional.
 */
export function getCommercialBadge(product) {
  const mode = getCommercialMode(product);
  switch (mode) {
    case COMMERCIAL_MODES.VARIABLE_TAX:
      return {
        label: 'Valores no WhatsApp',
        mode: COMMERCIAL_MODES.VARIABLE_TAX,
        variant: 'amber'
      };
    case COMMERCIAL_MODES.TECHNICAL_CONSULTATIVE:
      return {
        label: 'Consulte no WhatsApp',
        mode: COMMERCIAL_MODES.TECHNICAL_CONSULTATIVE,
        variant: 'slate'
      };
    case COMMERCIAL_MODES.DIRECT_SALE:
    default:
      return null;
  }
}

/**
 * Formatador auxiliar de moeda BRL.
 */
export function formatBRL(value) {
  const num = Number(value || 0);
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
}

/**
 * Formata o prazo de entrega em dias úteis.
 */
export function formatDeliveryDays(days) {
  const num = Number(days || 0);
  return `${num} ${num === 1 ? 'dia útil' : 'dias úteis'}`;
}

/**
 * Monta a mensagem de WhatsApp para cotação na página do produto ou card.
 * Regra: ZERO EMOJIS, estritamente texto plano.
 * Para modalidades consultivas, NENHUM preço de referência é incluído.
 */
export function buildProductWhatsAppMessage({ product, brand, category, variant, quantity = 1, shipping = null, attribution = null }) {
  if (!product) return '';

  const productName = product.name || 'Equipamento';
  const brandName = brand?.name || product.brandName || 'Athena';
  const categoryName = category?.name || product.categoryName || 'Equipamentos Automotivos';
  const variantDisplay = variant?.name ? ` - ${variant.name}` : '';
  const skuCode = variant?.sku || product.sku;
  const skuText = skuCode ? ` (Cód: ${skuCode})` : '';
  const qtyNum = Math.max(1, parseInt(quantity, 10) || 1);
  const qtyText = `Quantidade: ${qtyNum} ${qtyNum === 1 ? 'unidade' : 'unidades'}`;
  const attributionTag = formatAttributionForWhatsApp(attribution);

  // Seção dinâmica de frete (se calculada pelo cliente)
  let shippingText = '';
  if (shipping && shipping.price != null && !shipping.onlyCep) {
    const cepLabel = shipping.cep ? `${shipping.cep}${shipping.addressInfo ? ` (${shipping.addressInfo})` : ''}` : '';
    const carrierName = shipping.company?.name || 'Transportadora';
    const serviceName = shipping.name ? ` — ${shipping.name}` : '';
    shippingText = `\n\nDados para Entrega:\n- CEP: ${cepLabel}\n- Opção de envio: ${carrierName}${serviceName}\n- Valor do frete: ${formatBRL(shipping.price)} (Prazo: ${formatDeliveryDays(shipping.delivery_time)})`;
  } else if (shipping && shipping.cep) {
    const cepLabel = `${shipping.cep}${shipping.addressInfo ? ` (${shipping.addressInfo})` : ''}`;
    shippingText = `\n\nDados para Entrega:\n- CEP informado: ${cepLabel}`;
  }

  const isBuyable = canCheckout(product);
  const showPrice = shouldShowPrice(product);

  if (isBuyable && showPrice) {
    const activePrice = Number(variant?.price || product.price || 0);
    const formattedVal = formatBRL(activePrice);
    return encodeURIComponent(
      `Olá Athena Soluções Automotivas!\n\nTenho interesse em comprar o equipamento:\n*${productName}${variantDisplay}*${skuText}\nMarca: ${brandName}\n${qtyText}\nValor no site: ${formattedVal} no PIX / cartão.${shippingText}\n\nGostaria de orientações para fechar o pedido ou tirar dúvidas sobre o envio.${attributionTag}`
    );
  }

  // Modalidade consultiva (variable_tax ou technical_consultative): ZERO referência a preço
  const closingText = shippingText
    ? 'Poderia me informar as condições comerciais para o meu faturamento (CPF / CNPJ) e opções de pagamento para fecharmos com essa opção de frete?'
    : 'Poderia me informar as condições comerciais para o meu faturamento (CPF / CNPJ), opções de frete e formas de pagamento?';

  return encodeURIComponent(
    `Olá Athena Soluções Automotivas!\n\nGostaria de uma cotação para o equipamento:\n*${productName}${variantDisplay}*${skuText}\nMarca: ${brandName}\nCategoria: ${categoryName}\n${qtyText}${shippingText}\n\n${closingText}${attributionTag}`
  );
}

/**
 * Monta a mensagem de WhatsApp para cotação de múltiplos itens no Carrinho.
 * Regra: ZERO EMOJIS, estritamente texto plano.
 */
export function buildCartWhatsAppMessage({ cartItems = [], shipping = null, attribution = null }) {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return 'https://wa.me/5561983485671';
  }

  let message = 'Olá! Vim pelo site da Athena Soluções Automotivas e gostaria de um orçamento para os seguintes equipamentos:\n\n';

  let hasDirectSaleItems = false;
  let directSaleSubtotal = 0;

  cartItems.forEach((item, idx) => {
    const brand = item.brandName ? ` [Marca: ${item.brandName}]` : '';
    const sku = item.sku ? ` (Cód: ${item.sku})` : '';
    const variantDisplay = item.variantName ? ` (${item.variantName})` : '';
    const isDirect = canCheckout(item);

    if (isDirect && Number(item.price) > 0) {
      hasDirectSaleItems = true;
      const itemSubtotal = Number(item.price) * (Number(item.quantity) || 1);
      directSaleSubtotal += itemSubtotal;
      message += `${idx + 1}. *${item.quantity}x ${item.name}${variantDisplay}*${brand}${sku} - Venda Direta: ${formatBRL(itemSubtotal)}\n`;
    } else {
      message += `${idx + 1}. *${item.quantity}x ${item.name}${variantDisplay}*${brand}${sku} - Cotação Consultiva\n`;
    }
  });

  if (hasDirectSaleItems && directSaleSubtotal > 0) {
    message += `\nSubtotal dos itens de venda direta: ${formatBRL(directSaleSubtotal)}\n`;
  }

  if (shipping && shipping.price != null && !shipping.onlyCep) {
    const cepLabel = shipping.cep ? `${shipping.cep}${shipping.addressInfo ? ` (${shipping.addressInfo})` : ''}` : '';
    const carrierName = shipping.company?.name || 'Transportadora';
    const serviceName = shipping.name ? ` — ${shipping.name}` : '';
    message += `\nDados para Entrega:\n- CEP: ${cepLabel}\n- Opção de envio: ${carrierName}${serviceName}\n- Valor do frete: ${formatBRL(shipping.price)} (Prazo: ${formatDeliveryDays(shipping.delivery_time)})\n`;
    message += '\nPoderia me informar as condições comerciais finais e opções de pagamento para fecharmos com essa opção de envio?';
  } else if (shipping && shipping.cep) {
    const cepLabel = `${shipping.cep}${shipping.addressInfo ? ` (${shipping.addressInfo})` : ''}`;
    message += `\nDados para Entrega:\n- CEP informado: ${cepLabel}\n`;
    message += '\nPoderia me informar as condições comerciais para o meu faturamento (CPF / CNPJ), opções de frete para este CEP e formas de pagamento?';
  } else {
    message += '\nPoderia me informar as condições comerciais para o meu faturamento (CPF / CNPJ), disponibilidade e prazo de entrega?';
  }

  const attributionTag = formatAttributionForWhatsApp(attribution);
  message += attributionTag;

  return `https://wa.me/5561983485671?text=${encodeURIComponent(message)}`;
}

/**
 * Calcula a porcentagem inteira de desconto real entre o preço original e o preço atual (Pacote C - Black Friday).
 * @param {number|string} price - Preço atual de venda
 * @param {number|string} originalPrice - Preço original ("De")
 * @returns {number|null} Porcentagem inteira de desconto (ex: 15 para 15% OFF) ou null se inexistente/inválido.
 */
export function getDiscountPercentage(price, originalPrice) {
  const p = Number(price);
  const orig = Number(originalPrice);
  if (!p || !orig || isNaN(p) || isNaN(orig)) return null;
  if (orig <= p) return null;
  const pct = Math.round(((orig - p) / orig) * 100);
  return pct > 0 && pct < 100 ? pct : null;
}
