/**
 * recommendationEngine.js
 * 
 * Motor Centralizado de Recomendações e Compatibilidade Técnica (Pacote B - Athena).
 * 
 * Regras de Governança Comercial:
 * 1. Elegibilidade Estrita:
 *    - Produto publicado e ativo (isProductPublished && status === 'published')
 *    - Ação comercial viável (modalidade comercial válida: direct_sale, variable_tax ou technical_consultative)
 *    - Nunca recomenda o produto atual nem repete itens duplicados
 * 
 * 2. Transparência na Interface:
 *    - Produtos compatíveis reais (acessórios/conexões diretas) são isolados como "Acessórios & Itens Compatíveis"
 *    - Fallbacks de navegação (mesma categoria ou mesma marca) são claramente rotulados como "Outros Produtos da Categoria"
 *      ou "Mais desta Marca", nunca fingindo compatibilidade mecânica ou técnica sem vínculo.
 */

import { isProductPublished } from './imageUrl.js';
import { getCommercialMode } from './commercialPolicy.js';

/**
 * Valida se um produto do catálogo está apto a ser exibido em vitrines de recomendação.
 */
export function isProductEligibleForRecommendation(product) {
  if (!product || typeof product !== 'object' || !product.id || !product.name) return false;

  // 1. Validação de publicação
  if (!isProductPublished(product)) return false;
  if (product.status && product.status !== 'published') return false;

  // 2. Validação de imagem válida (vitrines visuais não exibem produtos sem foto)
  const hasImage = Boolean(
    (product.image && typeof product.image === 'string' && product.image.trim() !== '') ||
    (Array.isArray(product.images) && product.images.length > 0 && product.images[0])
  );
  if (!hasImage) return false;

  // 3. Viabilidade comercial (deve ter modalidade reconhecida pelo sistema)
  const mode = getCommercialMode(product);
  if (!mode) return false;

  return true;
}

/**
 * Obtém produtos compatíveis tecnicamente (acessórios, flanges, cabos, adaptadores).
 * Suporta tanto chamada com objeto ({ currentProduct, allProducts }) quanto posicional (currentProduct, allProducts).
 */
export function getCompatibleProducts(arg1, arg2 = []) {
  let currentProduct = null;
  let allProducts = [];

  if (arg1 && typeof arg1 === 'object' && ('currentProduct' in arg1 || 'allProducts' in arg1)) {
    currentProduct = arg1.currentProduct || null;
    allProducts = Array.isArray(arg1.allProducts) ? arg1.allProducts : [];
  } else {
    currentProduct = arg1 || null;
    allProducts = Array.isArray(arg2) ? arg2 : [];
  }

  if (!currentProduct || !Array.isArray(allProducts)) return [];

  const currentId = currentProduct.id;
  const currentSlug = currentProduct.slug;

  const directCompatIds = Array.isArray(currentProduct.compatibleProductIds) 
    ? currentProduct.compatibleProductIds 
    : [];

  // Extrai links no texto de descrição ou abas customizadas (/produto/slug)
  const textContent = `${currentProduct.description || ''} ${(currentProduct.customTabs || []).map(t => t.content || '').join(' ')}`;
  const linkMatches = textContent.match(/\/produto\/([a-zA-Z0-9_-]+)/g) || [];
  const linkedSlugs = linkMatches.map(m => m.replace('/produto/', ''));

  const linkedProductIds = allProducts
    .filter(p => isProductEligibleForRecommendation(p) && p.id !== currentId && (linkedSlugs.includes(p.slug) || linkedSlugs.includes(p.id)))
    .map(p => p.id);

  // Inbound: produtos do catálogo que marcam este equipamento como compatível
  const incomingProductIds = allProducts
    .filter(p => isProductEligibleForRecommendation(p) && p.id !== currentId && (
      (Array.isArray(p.compatibleProductIds) && p.compatibleProductIds.includes(currentId)) ||
      (currentSlug && Array.isArray(p.customTabs) && p.customTabs.some(t => t.content && t.content.includes(currentSlug)))
    ))
    .map(p => p.id);

  const uniqueIds = Array.from(new Set([...directCompatIds, ...linkedProductIds, ...incomingProductIds]));

  return uniqueIds
    .map(id => allProducts.find(p => p.id === id && p.id !== currentId))
    .filter(p => Boolean(p) && isProductEligibleForRecommendation(p));
}

/**
 * Obtém recomendações personalizadas para a página do produto com distinção honesta de títulos.
 * Suporta tanto chamada com objeto ({ currentProduct, allProducts, limit }) quanto posicional (currentProduct, allProducts, { limit }).
 */
export function getRecommendedProducts(arg1, arg2 = [], arg3 = {}) {
  let currentProduct = null;
  let allProducts = [];
  let limit = 5;

  if (arg1 && typeof arg1 === 'object' && ('currentProduct' in arg1 || 'allProducts' in arg1)) {
    currentProduct = arg1.currentProduct || null;
    allProducts = Array.isArray(arg1.allProducts) ? arg1.allProducts : [];
    if (typeof arg1.limit === 'number' && arg1.limit > 0) limit = arg1.limit;
  } else {
    currentProduct = arg1 || null;
    allProducts = Array.isArray(arg2) ? arg2 : [];
    if (typeof arg3 === 'number' && arg3 > 0) {
      limit = arg3;
    } else if (arg3 && typeof arg3 === 'object' && typeof arg3.limit === 'number' && arg3.limit > 0) {
      limit = arg3.limit;
    }
  }

  if (!currentProduct || !Array.isArray(allProducts)) {
    return {
      products: [],
      all: [],
      curated: [],
      categoryFallbacks: [],
      brandFallbacks: [],
      hasCurated: false,
      sectionTitle: 'Outros Produtos da Categoria'
    };
  }

  const currentId = currentProduct.id;
  const currentCatId = currentProduct.categoryId;
  const currentBrandId = currentProduct.brandId;

  // 1. Recomendações manuais do curador/admin (recommendedProductIds)
  const rawCuratedIds = Array.isArray(currentProduct.recommendedProductIds) 
    ? currentProduct.recommendedProductIds 
    : [];

  const curated = rawCuratedIds
    .map(id => allProducts.find(p => p.id === id && p.id !== currentId && isProductEligibleForRecommendation(p)))
    .filter(Boolean);

  const pickedIds = new Set([currentId, ...curated.map(p => p.id)]);

  // 2. Mesma categoria (fallback honesto)
  const categoryFallbacks = [];
  if (curated.length < limit && currentCatId) {
    for (const p of allProducts) {
      if (categoryFallbacks.length + curated.length >= limit) break;
      if (!pickedIds.has(p.id) && p.categoryId === currentCatId && isProductEligibleForRecommendation(p)) {
        categoryFallbacks.push(p);
        pickedIds.add(p.id);
      }
    }
  }

  // 3. Mesma marca (fallback secundário)
  const brandFallbacks = [];
  if (curated.length + categoryFallbacks.length < limit && currentBrandId) {
    for (const p of allProducts) {
      if (brandFallbacks.length + categoryFallbacks.length + curated.length >= limit) break;
      if (!pickedIds.has(p.id) && p.brandId === currentBrandId && isProductEligibleForRecommendation(p)) {
        brandFallbacks.push(p);
        pickedIds.add(p.id);
      }
    }
  }

  const all = [...curated, ...categoryFallbacks, ...brandFallbacks].slice(0, limit);

  // Determina o rótulo editorial exato da vitrine
  let sectionTitle = 'Produtos Recomendados';
  if (curated.length === 0 && categoryFallbacks.length > 0) {
    sectionTitle = 'Outros Produtos da Categoria';
  } else if (curated.length === 0 && brandFallbacks.length > 0) {
    sectionTitle = 'Mais desta Marca';
  }

  return {
    products: all,
    all,
    curated,
    categoryFallbacks,
    brandFallbacks,
    hasCurated: curated.length > 0,
    sectionTitle
  };
}
