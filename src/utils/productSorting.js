/**
 * Athena Product Sorting & Relevance Interleaving Algorithm
 * 
 * Ensures that when "Mais Relevantes" (Featured) sorting is active:
 * 1. Featured items (isFeatured === true) come first.
 * 2. Products are intelligently interleaved so that NO CONSECUTIVE PRODUCTS
 *    share the same brand or category (avoiding streaks of the same manufacturer or equipment type).
 * 3. Majority brands/categories are balanced and scheduled smoothly across the list to prevent
 *    them from bunching together at the end.
 * 4. Standard (non-featured) products continue the interleaving seamlessly from where featured left off.
 * 5. Uses a seeded pseudo-random number generator for stable ordering during pagination while allowing
 *    new randomized combinations on demand or per session.
 */

// Mulberry32 seeded pseudo-random number generator for fast, high-quality distribution
export function createPrng(seed) {
  let s = (Math.abs(Math.floor(seed)) || 123456789) >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Fisher-Yates shuffle with custom or default random generator
export function shuffleArray(arr, randomFn = Math.random) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

/**
 * Interleave a list of products to minimize/eliminate consecutive brand or category repeats.
 * 
 * @param {Array} items - Products to interleave
 * @param {Object|null} initialPrev1 - Last item from preceding segment (for boundary continuity)
 * @param {Object|null} initialPrev2 - Second to last item from preceding segment
 * @param {Function} randomFn - PRNG generator function
 * @returns {Array} Interleaved products
 */
export function interleaveProducts(items, initialPrev1 = null, initialPrev2 = null, randomFn = Math.random) {
  if (!items || items.length <= 1) return items ? [...items] : [];

  let pool = shuffleArray(items, randomFn);
  const result = [];
  let prev1 = initialPrev1;
  let prev2 = initialPrev2;

  while (pool.length > 0) {
    // Count remaining occurrences of each brand and category in current pool
    const brandCounts = {};
    const catCounts = {};
    for (let k = 0; k < pool.length; k++) {
      const item = pool[k];
      if (item.brandId) brandCounts[item.brandId] = (brandCounts[item.brandId] || 0) + 1;
      if (item.categoryId) catCounts[item.categoryId] = (catCounts[item.categoryId] || 0) + 1;
    }

    const totalRemaining = pool.length;
    let bestIndex = 0;
    let minScore = Infinity;

    for (let i = 0; i < pool.length; i++) {
      const candidate = pool[i];
      let score = 0;

      const bCount = candidate.brandId ? (brandCounts[candidate.brandId] || 0) : 0;
      const cCount = candidate.categoryId ? (catCounts[candidate.categoryId] || 0) : 0;

      // 1. Extreme penalty for repeating the immediate previous item's brand or category
      if (prev1) {
        if (candidate.brandId && prev1.brandId && candidate.brandId === prev1.brandId) {
          score += 1000000;
        }
        if (candidate.categoryId && prev1.categoryId && candidate.categoryId === prev1.categoryId) {
          score += 500000;
        }
      }

      // 2. Moderate penalty for repeating an item from 2 spots ago (discourages A-B-A-B repetition)
      if (prev2) {
        if (candidate.brandId && prev2.brandId && candidate.brandId === prev2.brandId) {
          score += 3000;
        }
        if (candidate.categoryId && prev2.categoryId && candidate.categoryId === prev2.categoryId) {
          score += 1500;
        }
      }

      // 3. Pigeonhole urgency:
      // When a brand or category represents a larger portion of remaining items,
      // it MUST be consumed early so it doesn't run out of alternatives and bunch up at the end.
      const brandUrgency = (bCount / totalRemaining) * 50000;
      const catUrgency = (cCount / totalRemaining) * 20000;
      score -= (brandUrgency + catUrgency);

      // 4. Controlled random jitter for true dynamic variety
      score += randomFn() * 40;

      if (score < minScore) {
        minScore = score;
        bestIndex = i;
      }
    }

    const chosen = pool[bestIndex];
    result.push(chosen);
    prev2 = prev1;
    prev1 = chosen;
    pool.splice(bestIndex, 1);
  }

  return result;
}

/**
 * Sorts products using Athena's Smart Relevance Interleaving:
 * - Featured items (isFeatured === true) placed at the top, interleaved by brand and category.
 * - Standard items follow immediately, continuing the brand and category alternating sequence.
 * 
 * @param {Array} products 
 * @param {number|null} seed 
 * @returns {Array}
 */
export function getRelevanceSortedProducts(products, seed = null) {
  if (!Array.isArray(products) || products.length === 0) return [];

  const randomFn = seed != null ? createPrng(seed) : Math.random;
  const featured = [];
  const standard = [];

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    if (p.isFeatured) {
      featured.push(p);
    } else {
      standard.push(p);
    }
  }

  const sortedFeatured = interleaveProducts(featured, null, null, randomFn);
  const lastFeatured1 = sortedFeatured.length > 0 ? sortedFeatured[sortedFeatured.length - 1] : null;
  const lastFeatured2 = sortedFeatured.length > 1 ? sortedFeatured[sortedFeatured.length - 2] : null;

  const sortedStandard = interleaveProducts(standard, lastFeatured1, lastFeatured2, randomFn);

  return [...sortedFeatured, ...sortedStandard];
}

/**
 * Universal catalog sorting function supporting all sort modes:
 * - 'featured': Smart brand/category interleaved relevance
 * - 'price-low': Price ascending
 * - 'price-high': Price descending
 * - 'name-az': Name alphabetical
 */
export function sortProducts(products, sortBy = 'featured', seed = null) {
  if (!Array.isArray(products) || products.length === 0) return [];

  switch (sortBy) {
    case 'featured':
      return getRelevanceSortedProducts(products, seed);
    case 'price-low':
      return [...products].sort((a, b) => (a.price || 0) - (b.price || 0));
    case 'price-high':
      return [...products].sort((a, b) => (b.price || 0) - (a.price || 0));
    case 'name-az':
      return [...products].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    default:
      return getRelevanceSortedProducts(products, seed);
  }
}
