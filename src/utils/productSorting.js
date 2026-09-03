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
 * Uses Dynamic Anti-Clustering Balanced Dispersion so brands and categories are richly mixed
 * without deterministic A-B-A-B repetition, ensuring no two adjacent products share the same brand or category.
 * 
 * @param {Array} items - Products to interleave
 * @param {Object|null} initialPrev1 - Last item from preceding segment
 * @param {Object|null} initialPrev2 - Second to last item from preceding segment
 * @param {Object|null} initialPrev3 - Third to last item from preceding segment
 * @param {Function} randomFn - PRNG generator function
 * @returns {Array} Interleaved products
 */
export function interleaveProducts(items, initialPrev1 = null, initialPrev2 = null, initialPrev3 = null, randomFn = Math.random) {
  if (!items || items.length <= 1) return items ? [...items] : [];

  let pool = shuffleArray(items, randomFn);
  const result = [];
  let prev1 = initialPrev1;
  let prev2 = initialPrev2;
  let prev3 = initialPrev3;

  while (pool.length > 0) {
    const brandCounts = {};
    const catCounts = {};
    for (let k = 0; k < pool.length; k++) {
      const it = pool[k];
      if (it.brandId) brandCounts[it.brandId] = (brandCounts[it.brandId] || 0) + 1;
      if (it.categoryId) catCounts[it.categoryId] = (catCounts[it.categoryId] || 0) + 1;
    }

    const totalRemaining = pool.length;
    let bestCandidates = [];
    let bestScore = -Infinity;

    for (let i = 0; i < pool.length; i++) {
      const cand = pool[i];
      let score = 0;

      // 1. BRAND ANTI-CLUSTERING: Never place same brand side-by-side
      if (prev1 && cand.brandId && prev1.brandId && cand.brandId === prev1.brandId) {
        score -= 60000;
      }
      if (prev2 && cand.brandId && prev2.brandId && cand.brandId === prev2.brandId) {
        score -= 2500;
      }
      if (prev3 && cand.brandId && prev3.brandId && cand.brandId === prev3.brandId) {
        score -= 600;
      }

      // 2. CATEGORY ANTI-CLUSTERING: Never place same category side-by-side
      if (prev1 && cand.categoryId && prev1.categoryId && cand.categoryId === prev1.categoryId) {
        score -= 30000;
      }
      if (prev2 && cand.categoryId && prev2.categoryId && cand.categoryId === prev2.categoryId) {
        score -= 2000;
      }
      if (prev3 && cand.categoryId && prev3.categoryId && cand.categoryId === prev3.categoryId) {
        score -= 400;
      }

      // 3. BALANCED PROPORTIONAL URGENCY: Gently prioritize brands/categories with higher remaining volume
      const bCount = cand.brandId ? (brandCounts[cand.brandId] || 0) : 0;
      const cCount = cand.categoryId ? (catCounts[cand.categoryId] || 0) : 0;
      const bRatio = bCount / totalRemaining;
      const cRatio = cCount / totalRemaining;
      score += bRatio * 1600;
      score += cRatio * 900;

      // 4. VIBRANT RANDOM JITTER: Ensures varied, non-deterministic mixes across pages
      score += randomFn() * 1200;

      if (score > bestScore) {
        bestScore = score;
        bestCandidates = [i];
      } else if (Math.abs(score - bestScore) < 1e-6) {
        bestCandidates.push(i);
      }
    }

    const chosenPoolIndex = bestCandidates[Math.floor(randomFn() * bestCandidates.length)];
    const chosen = pool[chosenPoolIndex];
    result.push(chosen);

    prev3 = prev2;
    prev2 = prev1;
    prev1 = chosen;
    pool.splice(chosenPoolIndex, 1);
  }

  return result;
}

/**
 * Sorts products using Athena's Smart Relevance Interleaving:
 * - Featured items (isFeatured === true or featured === true) placed at the top, interleaved by brand and category.
 * - Standard items follow immediately, continuing the diverse alternating sequence.
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
    const isFeatured = Boolean(p.isFeatured || p.featured || p.destaque);
    if (isFeatured) {
      featured.push(p);
    } else {
      standard.push(p);
    }
  }

  const sortedFeatured = interleaveProducts(featured, null, null, null, randomFn);
  const lastFeatured1 = sortedFeatured.length > 0 ? sortedFeatured[sortedFeatured.length - 1] : null;
  const lastFeatured2 = sortedFeatured.length > 1 ? sortedFeatured[sortedFeatured.length - 2] : null;
  const lastFeatured3 = sortedFeatured.length > 2 ? sortedFeatured[sortedFeatured.length - 3] : null;

  const sortedStandard = interleaveProducts(standard, lastFeatured1, lastFeatured2, lastFeatured3, randomFn);

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
