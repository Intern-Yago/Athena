/**
 * Athena Product Search Engine
 * 
 * Features:
 * - Direct text matching (name, badge, description, brand, category, specs, customTabs, sku)
 * - Deep Bidirectional Relation Expansion:
 *   If Product A is linked to Product B (via compatibleProductIds in either direction):
 *   When a user searches for Product A (e.g. "4002"),
 *   Product B (e.g. "Maleta de conectores") will ALSO appear in the search results!
 * - Accent / diacritic insensitivity (NFD normalization)
 * - Multi-token stemming (plurals: elevadores -> elevador, etc.)
 * - Relevance ranking: direct matches prioritized over related items
 */

export const normalizeSearchText = (text) => {
  if (!text) return '';
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

export const getSearchTokens = (term) => {
  if (!term) return [];
  const normalized = normalizeSearchText(term);
  const words = normalized.split(/\s+/).filter(Boolean);
  const tokens = new Set();

  words.forEach((w) => {
    tokens.add(w);
    if (w.endsWith('es') && w.length > 4) {
      tokens.add(w.slice(0, -2)); // elevadores -> elevador, alinhadores -> alinhador, conectores -> conector
    } else if (w.endsWith('s') && w.length > 3) {
      tokens.add(w.slice(0, -1)); // maletas -> maleta, rampas -> rampa, pecas -> peca
    }
  });

  return Array.from(tokens);
};

/**
 * Builds a bidirectional relation map for all products.
 * If product A lists product B in compatibleProductIds, then:
 * map.get(A.id) includes B AND map.get(B.id) includes A.
 * 
 * @param {Array} products 
 * @returns {Map<string, Array>}
 */
export const buildProductRelationsMap = (products) => {
  const relationsMap = new Map();
  if (!Array.isArray(products)) return relationsMap;

  const prodById = new Map();
  products.forEach((p) => {
    if (p && p.id) {
      prodById.set(p.id, p);
      relationsMap.set(p.id, []);
    }
  });

  products.forEach((p) => {
    if (!p || !p.id) return;
    const directIds = Array.isArray(p.compatibleProductIds) ? p.compatibleProductIds : [];

    directIds.forEach((targetId) => {
      const target = prodById.get(targetId);
      if (target) {
        // p -> target
        const listA = relationsMap.get(p.id);
        if (listA && !listA.some((item) => item.id === targetId)) {
          listA.push(target);
        }
        // target -> p (bidirectional)
        const listB = relationsMap.get(targetId);
        if (listB && !listB.some((item) => item.id === p.id)) {
          listB.push(p);
        }
      }
    });
  });

  return relationsMap;
};

/**
 * Builds the searchable text corpus for a single product.
 * 
 * @param {Object} prod 
 * @param {Map|Array} categories 
 * @param {Map|Array} brands 
 * @returns {string}
 */
export const buildProductOwnCorpus = (prod, categories, brands) => {
  if (!prod) return '';

  let catName = '';
  if (categories instanceof Map) {
    catName = categories.get(prod.categoryId)?.name || '';
  } else if (Array.isArray(categories)) {
    catName = categories.find((c) => c.id === prod.categoryId)?.name || '';
  }

  let brandName = '';
  if (brands instanceof Map) {
    brandName = brands.get(prod.brandId)?.name || '';
  } else if (Array.isArray(brands)) {
    brandName = brands.find((b) => b.id === prod.brandId)?.name || '';
  }

  const customTabsContent = Array.isArray(prod.customTabs)
    ? prod.customTabs.map((t) => `${t.title || ''} ${t.content || ''}`).join(' ')
    : '';
  const specsContent = Array.isArray(prod.specs) ? prod.specs.join(' ') : '';

  return [
    prod.name,
    prod.slug,
    prod.badge,
    prod.sku,
    prod.description,
    catName,
    brandName,
    specsContent,
    customTabsContent
  ]
    .map(normalizeSearchText)
    .filter(Boolean)
    .join(' ');
};

/**
 * Evaluates whether a product matches a search query directly OR via its related products.
 * 
 * @param {Object} prod 
 * @param {string} rawTerm 
 * @param {Map} relationsMap 
 * @param {Map|Array} categories 
 * @param {Map|Array} brands 
 * @param {Map|null} ownCorpusCache 
 * @returns {{ matches: boolean, isDirectMatch: boolean, matchedViaProduct: Object|null }}
 */
export const matchProductWithRelations = (
  prod,
  rawTerm,
  relationsMap,
  categories,
  brands,
  ownCorpusCache = null
) => {
  const term = normalizeSearchText(rawTerm);
  if (!term) {
    return { matches: true, isDirectMatch: true, matchedViaProduct: null };
  }

  const tokens = getSearchTokens(rawTerm);
  const ownCorpus = ownCorpusCache?.get(prod.id) || buildProductOwnCorpus(prod, categories, brands);

  // 1. Direct match check:
  // If the product itself contains the full search term or all individual tokens
  const directFullMatch = ownCorpus.includes(term);
  const directTokenMatch = tokens.length > 0 && tokens.every((t) => ownCorpus.includes(t));

  if (directFullMatch || directTokenMatch) {
    return { matches: true, isDirectMatch: true, matchedViaProduct: null };
  }

  // 2. Related products check (Bidirectional):
  // Check if any product linked to this product directly matches the search query
  const relatedList = relationsMap?.get(prod.id) || [];

  for (let i = 0; i < relatedList.length; i++) {
    const relProd = relatedList[i];
    const relCorpus = ownCorpusCache?.get(relProd.id) || buildProductOwnCorpus(relProd, categories, brands);

    const relFullMatch = relCorpus.includes(term);
    const relTokenMatch = tokens.length > 0 && tokens.every((t) => relCorpus.includes(t));

    if (relFullMatch || relTokenMatch) {
      return { matches: true, isDirectMatch: false, matchedViaProduct: relProd };
    }
  }

  // 3. Combined multi-token check:
  // e.g. user searches "maleta 4002" where "maleta" is in this product and "4002" is in the related product
  if (tokens.length > 1 && relatedList.length > 0) {
    const combinedCorpus = [
      ownCorpus,
      ...relatedList.map((r) => ownCorpusCache?.get(r.id) || buildProductOwnCorpus(r, categories, brands))
    ].join(' ');

    if (tokens.every((t) => combinedCorpus.includes(t))) {
      const primaryRel = relatedList.find((r) => {
        const rCorpus = ownCorpusCache?.get(r.id) || buildProductOwnCorpus(r, categories, brands);
        return tokens.some((t) => rCorpus.includes(t));
      }) || relatedList[0];

      return { matches: true, isDirectMatch: false, matchedViaProduct: primaryRel };
    }
  }

  return { matches: false, isDirectMatch: false, matchedViaProduct: null };
};
