/**
 * Athena On-Site Personalization & User Interest Tracker
 * 
 * Captures user interest signals from:
 * 1. URL parameters (?tag=..., ?utm_term=..., ?sku=..., ?interesse=..., ?produto=...)
 * 2. On-site product detail views (viewed SKU, category, name)
 * 3. On-site internal search queries
 * 
 * Then dynamically reorders catalog products:
 * - Position 1: Target product matching highest interest
 * - Positions 2 & 3: Up to 2 related products from the exact same category
 * - Position 4+: Standard smart relevance interleaving (featured products first)
 */

export const USER_INTEREST_KEY = 'athena_user_interest';
export const USER_INTEREST_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

/**
 * Extracts interest parameters from current or passed search string
 */
export function extractUrlInterest(searchString = '') {
  if (typeof window === 'undefined' && !searchString) return null;
  const rawSearch = searchString || (typeof window !== 'undefined' ? window.location?.search : '');
  if (!rawSearch) return null;

  try {
    const params = new URLSearchParams(rawSearch);
    const tag = (
      params.get('tag') ||
      params.get('utm_term') ||
      params.get('interesse') ||
      params.get('interest') ||
      params.get('produto') ||
      params.get('sku') ||
      params.get('target') ||
      ''
    ).trim();

    if (tag) {
      return {
        query: tag,
        sku: tag.toUpperCase(),
        source: 'url_tag',
        timestamp: Date.now()
      };
    }
  } catch (_) {
    // Ignore URL parse errors
  }
  return null;
}

/**
 * Records product interest when user visits a product page
 */
export function recordProductInterest(product) {
  if (typeof window === 'undefined' || !product) return;
  try {
    const interest = {
      productId: product.id || null,
      sku: (product.sku && String(product.sku).trim()) || null,
      categoryId: product.categoryId || null,
      brandId: product.brandId || null,
      name: product.name || '',
      source: 'product_view',
      timestamp: Date.now()
    };
    window.localStorage?.setItem(USER_INTEREST_KEY, JSON.stringify(interest));
  } catch (_) {
    // Ignore localStorage errors
  }
}

/**
 * Records search query interest when user searches on the site
 */
export function recordSearchInterest(searchTerm) {
  if (typeof window === 'undefined' || !searchTerm) return;
  const clean = String(searchTerm).trim();
  if (clean.length < 2) return;

  try {
    const interest = {
      query: clean,
      sku: clean.toUpperCase(),
      source: 'internal_search',
      timestamp: Date.now()
    };
    window.localStorage?.setItem(USER_INTEREST_KEY, JSON.stringify(interest));
  } catch (_) {
    // Ignore localStorage errors
  }
}

/**
 * Retrieves the currently active user interest, respecting TTL and prioritizing direct URL params
 */
export function getUserInterest(customSearchString = '') {
  // 1. URL takes immediate precedence
  const urlInterest = extractUrlInterest(customSearchString);
  if (urlInterest) {
    return urlInterest;
  }

  // 2. Local storage stored interest
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage?.getItem(USER_INTEREST_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.timestamp) return null;

    if (Date.now() - parsed.timestamp > USER_INTEREST_TTL_MS) {
      window.localStorage?.removeItem(USER_INTEREST_KEY);
      return null;
    }
    return parsed;
  } catch (_) {
    return null;
  }
}

/**
 * Clears stored user interest
 */
export function clearUserInterest() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage?.removeItem(USER_INTEREST_KEY);
  } catch (_) {}
}

/**
 * Matches a product against a search query/tag using multi-token matching
 */
function matchProductScore(product, query) {
  if (!product || !query) return 0;
  const cleanQuery = query.toLowerCase().trim();
  const prodName = (product.name || '').toLowerCase();
  const prodSku = (product.sku || '').toLowerCase();
  const prodId = String(product.id || '').toLowerCase();

  // Exact match on SKU or ID
  if (prodSku === cleanQuery || prodId === cleanQuery) return 1000;
  if (prodSku && cleanQuery.length >= 3 && prodSku.includes(cleanQuery)) return 800;

  // Multi-token match on name
  const tokens = cleanQuery.split(/[\s\-_+]+/).filter(t => t.length >= 2);
  if (tokens.length === 0) return 0;

  const matchedTokens = tokens.filter(t => prodName.includes(t) || prodSku.includes(t));
  if (matchedTokens.length === tokens.length) {
    return 500 + matchedTokens.length * 50;
  }
  if (matchedTokens.length > 0) {
    return 100 + matchedTokens.length * 20;
  }
  return 0;
}

/**
 * Finds the single best matching target product given the user interest
 */
export function findTargetProduct(products, interest) {
  if (!Array.isArray(products) || products.length === 0 || !interest) return null;

  // 1. Direct ID match
  if (interest.productId) {
    const byId = products.find(p => p.id === interest.productId);
    if (byId) return byId;
  }

  // 2. Direct SKU match
  if (interest.sku) {
    const cleanSku = String(interest.sku).trim().toUpperCase();
    const bySku = products.find(p => String(p.sku || '').trim().toUpperCase() === cleanSku);
    if (bySku) return bySku;
  }

  // 3. Query / Tag scoring match
  const query = interest.query || interest.name;
  if (query) {
    let bestProduct = null;
    let highestScore = 0;
    for (const p of products) {
      const score = matchProductScore(p, query);
      if (score > highestScore && score >= 100) {
        highestScore = score;
        bestProduct = p;
      }
    }
    if (bestProduct) return bestProduct;
  }

  return null;
}

/**
 * Applies personalized ordering to products:
 * - Position 1: Target product matching user interest
 * - Position 2 & 3: Up to 2 related products from the same category
 * - Remaining positions: Fall back to standard sort logic (featured first, interleaved)
 * 
 * @param {Array} products 
 * @param {Object|null} interest 
 * @param {Function} baseSortFn - Fallback sorting function for remaining products
 * @returns {Array} Reordered products
 */
export function applyPersonalization(products, interest, baseSortFn) {
  if (!Array.isArray(products) || products.length <= 1 || !interest) {
    return typeof baseSortFn === 'function' ? baseSortFn(products) : products;
  }

  const target = findTargetProduct(products, interest);
  if (!target) {
    return typeof baseSortFn === 'function' ? baseSortFn(products) : products;
  }

  // 1. Target is #1
  const top1 = target;

  // 2. Find same category items (excluding target)
  const sameCategoryPool = products.filter(
    p => p.id !== top1.id && p.categoryId && p.categoryId === top1.categoryId
  );

  // Take up to 2 items from same category (give preference to featured ones if present)
  sameCategoryPool.sort((a, b) => {
    const aFeat = Boolean(a.isFeatured || a.featured || a.destaque) ? 1 : 0;
    const bFeat = Boolean(b.isFeatured || b.featured || b.destaque) ? 1 : 0;
    return bFeat - aFeat;
  });

  const topSameCategory = sameCategoryPool.slice(0, 2);
  const pickedIds = new Set([top1.id, ...topSameCategory.map(p => p.id)]);

  // 3. Remaining products
  const remaining = products.filter(p => !pickedIds.has(p.id));
  const sortedRemaining = typeof baseSortFn === 'function' ? baseSortFn(remaining) : remaining;

  return [top1, ...topSameCategory, ...sortedRemaining];
}
