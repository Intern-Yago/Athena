// -------------------------------------------------------------
// COUPONS & DISCOUNT ENGINE (WITH STRICT R$ 5,00 GATEWAY RULE)
// -------------------------------------------------------------

function evaluateCoupon(coupon, items = [], customerEmail = '', customerCpfCnpj = '') {
  if (!coupon) return { valid: false, error: 'Cupom de desconto não encontrado.' };
  if (coupon.status !== 'active') return { valid: false, error: 'Este cupom está pausado ou inativo.' };

  // 1. Expiration check
  if (coupon.expiresAt || coupon.expires_at) {
    const expDate = new Date(coupon.expiresAt || coupon.expires_at);
    if (expDate < new Date()) {
      return { valid: false, error: 'Este cupom de desconto expirou em ' + expDate.toLocaleDateString('pt-BR') + '.' };
    }
  }

  // 2. Total global usage limit
  const maxTotal = Number(coupon.maxUsageTotal || coupon.max_usage_total || 0);
  const usedCount = Number(coupon.usedCount || coupon.used_count || 0);
  if (maxTotal > 0 && usedCount >= maxTotal) {
    return { valid: false, error: 'Este cupom atingiu o limite máximo de utilizações.' };
  }

  // 3. Customer usage limit
  const maxPerCustomer = Number(coupon.maxUsagePerCustomer || coupon.max_usage_per_customer || 1);
  const usedBy = coupon.usedBy || coupon.used_by || [];
  const cleanEmail = (customerEmail || '').toLowerCase().trim();
  const cleanDoc = (customerCpfCnpj || '').replace(/[^0-9a-zA-Z]/g, '').toUpperCase();

  if (maxPerCustomer > 0 && (cleanEmail || cleanDoc)) {
    const customerUsageCount = usedBy.filter(u => 
      (cleanEmail && (u.email || '').toLowerCase().trim() === cleanEmail) ||
      (cleanDoc && (u.document || '').replace(/[^0-9a-zA-Z]/g, '').toUpperCase() === cleanDoc)
    ).length;

    if (customerUsageCount >= maxPerCustomer) {
      return { valid: false, error: 'Você já utilizou este cupom de desconto o número máximo de vezes permitido.' };
    }
  }

  // 4. Target specific customer email restriction
  const customerType = coupon.customerType || coupon.customer_type || 'all';
  const specificEmail = (coupon.specificEmail || coupon.specific_email || '').toLowerCase().trim();
  if (customerType === 'specific_email' && specificEmail) {
    if (!cleanEmail) {
      return { valid: false, error: 'Informe seu e-mail para validar este cupom exclusivo.', requiresEmail: true };
    }
    if (cleanEmail !== specificEmail) {
      return { valid: false, error: 'Este cupom é exclusivo e intransferível para o e-mail ' + specificEmail + '.' };
    }
  }

  // 5. Items eligibility check (only products with price > 0 and not negotiable)
  const validItems = items.filter(it => (Number(it.price) || 0) > 0 && !it.priceNegotiable);
  if (validItems.length === 0) {
    return { valid: false, error: 'Cupons só podem ser aplicados em produtos com preço de compra direta cadastrado.' };
  }

  const scopeType = coupon.scopeType || coupon.scope_type || 'all';
  const targetProductIds = coupon.targetProductIds || coupon.target_product_ids || [];
  const targetCategoryIds = coupon.targetCategoryIds || coupon.target_category_ids || [];
  const targetBrandIds = coupon.targetBrandIds || coupon.target_brand_ids || [];

  const eligibleItems = validItems.filter(it => {
    if (scopeType === 'all') return true;
    if (scopeType === 'products') return targetProductIds.includes(it.productId || it.id);
    if (scopeType === 'categories') return targetCategoryIds.includes(it.categoryId);
    if (scopeType === 'brands') return targetBrandIds.includes(it.brandId);
    return false;
  });

  if (eligibleItems.length === 0) {
    return { valid: false, error: 'Este cupom não é aplicável aos produtos selecionados no pedido.' };
  }

  // 6. Minimum purchase amount & minimum item quantity
  const eligibleSubtotal = eligibleItems.reduce((sum, it) => sum + (Number(it.price) * (Number(it.quantity) || 1)), 0);
  const totalQuantity = eligibleItems.reduce((sum, it) => sum + (Number(it.quantity) || 1), 0);

  const minOrderAmount = Number(coupon.minOrderAmount || coupon.min_order_amount || 0);
  if (minOrderAmount > 0 && eligibleSubtotal < minOrderAmount) {
    return { valid: false, error: `Este cupom exige um valor mínimo de compra de R$ ${minOrderAmount.toFixed(2).replace('.', ',')}. Subtotal atual: R$ ${eligibleSubtotal.toFixed(2).replace('.', ',')}.` };
  }

  const minItemQuantity = Number(coupon.minItemQuantity || coupon.min_item_quantity || 0);
  if (minItemQuantity > 0 && totalQuantity < minItemQuantity) {
    return { valid: false, error: `Este cupom exige uma quantidade mínima de ${minItemQuantity} itens elegíveis no carrinho.` };
  }

  // 7. Calculate Discount Amount
  const discountType = coupon.discountType || coupon.discount_type || 'percentage';
  const discountVal = Number(coupon.discountValue || coupon.discount_value || 0);
  const maxDiscount = Number(coupon.maxDiscount || coupon.max_discount || 0);

  let rawDiscount = 0;
  if (discountType === 'percentage') {
    rawDiscount = (eligibleSubtotal * discountVal) / 100;
    if (maxDiscount > 0 && rawDiscount > maxDiscount) {
      rawDiscount = maxDiscount;
    }
  } else {
    // Fixed amount (R$)
    rawDiscount = discountVal;
  }

  // Full cart subtotal
  const totalCartSubtotal = validItems.reduce((sum, it) => sum + (Number(it.price) * (Number(it.quantity) || 1)), 0);
  const discountAmount = Math.min(rawDiscount, totalCartSubtotal);
  const finalPayable = Math.max(0, Math.round((totalCartSubtotal - discountAmount) * 100) / 100);

  // 8. STRICT R$ 5,00 GATEWAY RULE
  // If not 100% free (finalPayable === 0), it MUST be at least R$ 5,00!
  if (finalPayable > 0 && finalPayable < 5.00) {
    return {
      valid: false,
      error: `O desconto deste cupom deixaria o valor final a pagar em R$ ${finalPayable.toFixed(2).replace('.', ',')}, que fica abaixo do mínimo permitido pelo sistema (R$ 5,00). Adicione mais produtos ou utilize um cupom de 100%.`
    };
  }

  return {
    valid: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      description: coupon.description,
      discountType,
      discountValue: discountVal,
      maxDiscount
    },
    discountAmount,
    subtotal: totalCartSubtotal,
    finalPayable,
    isFreeOrder: finalPayable === 0
  };
}

module.exports = {
  evaluateCoupon
};
