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

/**
 * Verifica se uma string de URL é uma imagem válida (não nula, não vazia).
 */
export function isValidImageUrl(url) {
  return typeof url === 'string' && url.trim().length > 0;
}

/**
 * Verifica se um produto possui pelo menos uma imagem válida em toda a sua estrutura
 * (foto principal, fotos da galeria ou fotos específicas de variações).
 */
export function hasProductValidImages(product) {
  if (!product || typeof product !== 'object') return false;

  // 1. Imagem principal
  if (isValidImageUrl(product.image)) return true;

  // 2. Galeria de imagens adicionais do produto principal
  if (Array.isArray(product.images) && product.images.some(isValidImageUrl)) return true;

  // 3. Imagens específicas das variações
  if (Array.isArray(product.variants) && product.variants.some(v => v && isValidImageUrl(v.image))) return true;

  return false;
}

/**
 * Validação de regras de negócio para publicação de produto baseada em imagens.
 * 
 * Diretriz Principal: Proteção contra Rascunho Órfão
 * Se um produto (com ou sem variações) for salvo/publicado sem nenhuma imagem válida
 * em toda a sua estrutura, o sistema impede a publicação direta e o salva automaticamente
 * como rascunho, alertando o usuário.
 */
export function validateProductImagePublishStatus(product) {
  const hasVariants = Array.isArray(product?.variants) && product.variants.some(v => v && (v.name || '').trim() !== '');
  const hasImages = hasProductValidImages(product);

  if (hasImages) {
    return {
      canPublish: true,
      hasImages: true,
      hasVariants,
      reason: 'ok',
      message: null
    };
  }

  // Cenário sem imagens válidas na estrutura
  if (hasVariants) {
    // Grupo B.2: O Produto Principal NÃO tem foto e NENHUMA variação tem foto
    return {
      canPublish: false,
      hasImages: false,
      hasVariants: true,
      reason: 'no_images_with_variants',
      message: 'Atenção: É obrigatório cadastrar pelo menos uma imagem na estrutura do produto ou nas variações para publicar. O produto foi salvo como rascunho.'
    };
  }

  // Grupo A.2: Produto SEM variações e sem foto
  return {
    canPublish: false,
    hasImages: false,
    hasVariants: false,
    reason: 'no_images_simple',
    message: 'Atenção: A imagem é obrigatória para a publicação. O produto foi salvo como rascunho.'
  };
}

/**
 * Gestão Inteligente de Imagens: Por Variação e Herança Híbrida.
 * 
 * Mapeamento Completo de Cenários:
 * - Grupo A (Produto SEM Variações):
 *   A.1: Produto com foto -> Publica e salva normalmente com a foto cadastrada.
 *   A.2: Produto sem foto -> Impede publicação, salva como rascunho.
 * 
 * - Grupo B (Produto COM Variações):
 *   B.1: O Produto Principal NÃO tem foto, mas AS VARIAÇÕES têm fotos próprias:
 *        Permite publicar. Cada variação exibe estritamente a sua foto ao ser clicada/selecionada.
 *        O mini demonstrativo exibe sempre apenas uma foto (a da variação ativa).
 *   B.2: O Produto Principal NÃO tem foto e NENHUMA variação tem foto:
 *        Salva automaticamente como rascunho.
 *   B.3: O Produto Principal TEM foto e as Variações NENHUMA tem foto:
 *        Todas as variações herdam visualmente a foto do produto principal na exibição.
 *   B.4: O Produto Principal TEM foto e TODAS AS VARIAÇÕES também têm fotos:
 *        Exibe miniaturas combinadas (foto do pai + foto da variação selecionada),
 *        dando o foco inicial para a foto da variação (index 0).
 *   B.5: Cenário Misto (O Produto Principal TEM foto, algumas variações têm foto própria e OUTRAS NÃO TÊM):
 *        - Para as variações que POSSUEM foto: exibe a foto da variação + foto do pai, foco na variação.
 *        - Para a variação que NÃO POSSUI foto: essa variação em específico herda a imagem principal
 *          do produto pai, e no mini demonstrativo vai aparecer somente uma foto (apenas a principal herdada),
 *          sem inventar fotos nem duplicar miniaturas.
 */
export function getVariantGalleryImages(product, selectedVariant) {
  if (!product) return [];

  const parentMainImage = typeof product.image === 'string' ? product.image.trim() : '';
  const parentGalleryImages = Array.isArray(product.images)
    ? product.images.filter(isValidImageUrl).map(img => img.trim())
    : [];

  // Lista única e deduplicada de fotos do pai, preservando a imagem principal como primeira
  const parentImages = Array.from(new Set([parentMainImage, ...parentGalleryImages].filter(Boolean)));

  // Foto da primeira variação que possui imagem válida (usada como capa provisória caso o pai não tenha nenhuma foto)
  const firstVariantWithPhoto = Array.isArray(product.variants)
    ? product.variants.find(v => v && isValidImageUrl(v.image))
    : null;
  const fallbackCoverImage = firstVariantWithPhoto ? firstVariantWithPhoto.image.trim() : '';

  const variantImage = typeof selectedVariant?.image === 'string' ? selectedVariant.image.trim() : '';

  // Se houver uma variação selecionada
  if (selectedVariant) {
    if (variantImage) {
      // Variação POSSUI foto própria
      if (parentImages.length > 0) {
        // B.4 & B.5 (variação COM foto própria e pai COM fotos registradas):
        // Foco inicial para a foto da variação (index 0) + foto(s) do produto pai
        const otherParentImages = parentImages.filter(img => img !== variantImage);
        return [variantImage, ...otherParentImages];
      } else {
        // B.1 (variação COM foto própria e pai SEM fotos registradas):
        // Cada variação exibe estritamente a SUA PRÓPRIA FOTO (1 foto).
        // NUNCA replica fotos de variações irmãs!
        return [variantImage];
      }
    } else {
      // Variação NÃO POSSUI foto própria
      if (parentImages.length > 0) {
        // B.3 & B.5: Herda a imagem principal do produto pai (1 foto)
        const inheritedMainImage = parentMainImage || parentImages[0];
        return inheritedMainImage ? [inheritedMainImage] : [];
      } else if (fallbackCoverImage) {
        // O produto principal não tem foto, mas uma variação (a 1ª) tem foto:
        // Nesse caso, a capa (foto da 1ª variação) aparece para a variação sem foto também (1 foto)
        return [fallbackCoverImage];
      } else {
        // B.2: Sem imagem em lugar nenhum
        return [];
      }
    }
  }

  // Produto SEM variações selecionadas ou exibição geral
  if (parentImages.length > 0) {
    return parentImages;
  }
  if (fallbackCoverImage) {
    return [fallbackCoverImage];
  }
  return [];
}
