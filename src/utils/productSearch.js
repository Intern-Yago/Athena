/**
 * Athena Product Search Engine
 * 
 * Features:
 * - Direct text matching (name, badge, description, brand, category, specs, customTabs, sku)
 * - Deep Bidirectional Relation Expansion:
 *   If Product A is linked to Product B (via compatibleProductIds in either direction):
 *   When a user searches for Product A (e.g. "4002" or "WAL-FUN"),
 *   Product B (e.g. "Maleta de conectores") will ALSO appear in the search results!
 * - Alphanumeric & Symbol Insensitivity:
 *   Matches "WALFUN" <-> "WAL-FUN" <-> "WAL FUN", "SKX018" <-> "SKX-018", "W1058" <-> "W-1058"
 * - Fuzzy Typo-Tolerance & String Similarity:
 *   Tolerates typos and misspellings using Damerau-Levenshtein edit distance (e.g. "WALFUM", "MAHOVY", "BALANCIADORA")
 * - Accent / diacritic insensitivity (NFD Unicode normalization)
 * - Multi-token stemming for Portuguese plurals (elevadores -> elevador, alinhadores -> alinhador, etc.)
 * - Relevance ranking: direct exact matches prioritized over clean matches, fuzzy matches, and related items
 */

export const normalizeSearchText = (text) => {
  if (!text) return '';
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

export const cleanAlphanumeric = (text) => {
  if (!text) return '';
  return normalizeSearchText(text).replace(/[^a-z0-9]/g, '');
};

/**
 * Fast Damerau-Levenshtein edit distance supporting:
 * - Insertions
 * - Deletions
 * - Substitutions
 * - Transpositions of adjacent characters (e.g. "launhc" -> "launch")
 */
export const damerauLevenshtein = (a, b) => {
  const al = a.length;
  const bl = b.length;
  if (al === 0) return bl;
  if (bl === 0) return al;

  const m = [];
  for (let i = 0; i <= al; i++) m[i] = [i];
  for (let j = 0; j <= bl; j++) m[0][j] = j;

  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      m[i][j] = Math.min(
        m[i - 1][j] + 1,       // deletion
        m[i][j - 1] + 1,       // insertion
        m[i - 1][j - 1] + cost // substitution
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        m[i][j] = Math.min(m[i][j], m[i - 2][j - 2] + 1); // transposition
      }
    }
  }
  return m[al][bl];
};

/**
 * Splits text into individual words, stripping punctuation and adding plural stems
 */
export const extractWords = (text) => {
  const norm = normalizeSearchText(text);
  if (!norm) return [];
  const words = norm
    .split(/[\s\-_./\\+,:;()[\]{}|#*~"']+/)
    .map((w) => w.trim())
    .filter(Boolean);

  const result = new Set(words);

  // Plural stemming for Portuguese
  words.forEach((w) => {
    if (w.endsWith('es') && w.length > 4) {
      result.add(w.slice(0, -2)); // elevadores -> elevador, conectores -> conector
    } else if (w.endsWith('s') && w.length > 3) {
      result.add(w.slice(0, -1)); // maletas -> maleta, pecas -> peca, rampas -> rampa
    }
  });

  return Array.from(result);
};

/**
 * Extracts compound alphanumeric codes (e.g. "wal-fun", "mah-1008", "skx-018", "dt-can03", "12v/24v")
 */
export const extractCompoundCodes = (text) => {
  const norm = normalizeSearchText(text);
  if (!norm) return [];
  const matches = norm.match(/[a-z0-9]+(?:[-_./][a-z0-9]+)+/g) || [];
  return matches;
};

/**
 * Computes similarity between a query token and a target token
 * Returns a score between 0.0 and 1.0
 */
export const computeTokenSimilarity = (qToken, tToken) => {
  if (!qToken || !tToken) return 0;
  if (qToken === tToken) return 1.0;

  const qClean = cleanAlphanumeric(qToken);
  const tClean = cleanAlphanumeric(tToken);
  if (qClean && qClean === tClean) return 0.98;

  // Prefix matching
  if (tToken.startsWith(qToken) && qToken.length >= 3) {
    return 0.88 + 0.1 * (qToken.length / tToken.length);
  }
  if (qClean && tClean && tClean.startsWith(qClean) && qClean.length >= 3) {
    return 0.86 + 0.1 * (qClean.length / tClean.length);
  }

  // Substring matching
  if (tToken.includes(qToken) && qToken.length >= 3) {
    return 0.84 + 0.05 * (qToken.length / tToken.length);
  }
  if (qClean && tClean && tClean.includes(qClean) && qClean.length >= 3) {
    return 0.82 + 0.05 * (qClean.length / tClean.length);
  }

  // Fuzzy edit distance
  const s1 = qClean || qToken;
  const s2 = tClean || tToken;
  const minLen = Math.min(s1.length, s2.length);
  const maxLen = Math.max(s1.length, s2.length);

  // Guard against false positives on very short tokens (1 to 3 chars)
  if (minLen < 4) return 0;

  let maxDist = 0;
  if (minLen >= 4 && minLen <= 5) maxDist = 1;
  else if (minLen >= 6 && minLen <= 7) maxDist = 1;
  else if (minLen >= 8) maxDist = 2;

  if (maxDist === 0) return 0;

  const dist = damerauLevenshtein(s1, s2);
  if (dist <= maxDist) {
    return 1 - (dist / maxLen) * 0.35;
  }

  return 0;
};

/**
 * Generates tokens for search compatibility with legacy callers
 */
export const getSearchTokens = (term) => {
  if (!term) return [];
  return extractWords(term);
};

// Internal cache for product search profiles
const profileCache = new Map();

/**
 * Builds a rich search profile for a single product
 */
export const getProductSearchProfile = (prod, categories, brands) => {
  if (!prod) return null;
  const cached = profileCache.get(prod.id);
  if (cached) return cached;

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

  const nameWords = extractWords(prod.name);
  const skuWords = extractWords(prod.sku || '');
  const brandWords = extractWords(brandName);
  const catWords = extractWords(catName);
  const specWords = extractWords(specsContent);
  const descWords = extractWords(`${prod.description || ''} ${customTabsContent}`);

  const compounds = new Set([
    ...extractCompoundCodes(prod.name),
    ...extractCompoundCodes(prod.sku || ''),
    ...extractCompoundCodes(specsContent)
  ]);

  const fullText = [
    prod.name,
    prod.slug,
    prod.badge,
    prod.sku,
    brandName,
    catName,
    specsContent,
    prod.description,
    customTabsContent
  ]
    .filter(Boolean)
    .join(' ');

  const specsNorm = normalizeSearchText(specsContent);
  const descNorm = normalizeSearchText(`${prod.description || ''} ${customTabsContent}`);
  const brandNorm = normalizeSearchText(brandName);
  const catNorm = normalizeSearchText(catName);

  const profile = {
    id: prod.id,
    name: prod.name,
    nameClean: cleanAlphanumeric(prod.name),
    nameNorm: normalizeSearchText(prod.name),
    nameWords,
    skuWords,
    compounds: Array.from(compounds),
    brandWords,
    catWords,
    specWords,
    descWords,
    specsNorm,
    descNorm,
    brandNorm,
    catNorm,
    fullNorm: normalizeSearchText(fullText),
    fullClean: cleanAlphanumeric(fullText)
  };

  profileCache.set(prod.id, profile);
  return profile;
};

/**
 * Builds the searchable text corpus for a single product (backward compatible).
 */
export const buildProductOwnCorpus = (prod, categories, brands) => {
  const profile = getProductSearchProfile(prod, categories, brands);
  return profile ? profile.fullNorm : '';
};

/**
 * Builds a bidirectional relation map for all products.
 * If product A lists product B in compatibleProductIds, then:
 * map.get(A.id) includes B AND map.get(B.id) includes A.
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
        const listA = relationsMap.get(p.id);
        if (listA && !listA.some((item) => item.id === targetId)) {
          listA.push(target);
        }
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
 * Evaluates whether a product profile matches a raw query directly with tiered relevance.
 */
export const evaluateDirectProductMatch = (profile, rawTerm) => {
  const normTerm = normalizeSearchText(rawTerm);
  const cleanTerm = cleanAlphanumeric(rawTerm);
  if (!normTerm) {
    return { matches: true, score: 1.0, matchType: 'all' };
  }

  // 1. Direct full text substring match (exact)
  if (profile.fullNorm.includes(normTerm)) {
    const isNameExact = profile.nameNorm.includes(normTerm);
    const isCodeExact = profile.compounds.some((c) => c.includes(normTerm));
    const isBrandExact = profile.brandNorm?.includes(normTerm);
    const isCatExact = profile.catNorm?.includes(normTerm);
    const isSpecsExact = profile.specsNorm?.includes(normTerm);

    let score = 45; // Default for description match
    let matchType = 'desc';

    if (isNameExact || isCodeExact) {
      score = 100;
      matchType = 'name_exact';
    } else if (isBrandExact || isCatExact) {
      score = 85;
      matchType = 'brand_exact';
    } else if (isSpecsExact) {
      score = 65;
      matchType = 'specs_exact';
    }

    return {
      matches: true,
      score,
      matchType
    };
  }

  // 2. Direct clean alphanumeric full match (e.g. WALFUN matching WAL-FUN in name or codes)
  if (cleanTerm.length >= 3) {
    const inNameClean = profile.nameClean.includes(cleanTerm);
    if (inNameClean) {
      return {
        matches: true,
        score: 95,
        matchType: 'clean_name'
      };
    }
    // Check if cleanTerm matches any compound code cleaned
    for (const code of profile.compounds) {
      const codeClean = cleanAlphanumeric(code);
      if (codeClean === cleanTerm) {
        return {
          matches: true,
          score: 95,
          matchType: 'clean_code'
        };
      }
    }
    // Check brand/category clean
    if (cleanAlphanumeric(profile.brandNorm).includes(cleanTerm) || cleanAlphanumeric(profile.catNorm).includes(cleanTerm)) {
      return {
        matches: true,
        score: 80,
        matchType: 'clean_brand'
      };
    }
    // Check specs clean
    if (cleanAlphanumeric(profile.specsNorm).includes(cleanTerm)) {
      return {
        matches: true,
        score: 60,
        matchType: 'clean_specs'
      };
    }
    // Fallback: description clean
    if (profile.fullClean.includes(cleanTerm)) {
      return {
        matches: true,
        score: 40,
        matchType: 'clean_desc'
      };
    }
  }

  // 3. Token-by-token similarity & field-weighted scoring
  const queryTokens = normTerm.split(/\s+/).filter(Boolean);
  if (queryTokens.length === 0) {
    return { matches: true, score: 1.0, matchType: 'all' };
  }

  let totalScore = 0;
  let allTokensMatch = true;

  for (const qToken of queryTokens) {
    const qClean = cleanAlphanumeric(qToken);
    let bestTokenScore = 0;

    // Check compound codes
    for (const code of profile.compounds) {
      const sim = computeTokenSimilarity(qToken, code);
      if (sim * 3.0 > bestTokenScore) bestTokenScore = sim * 3.0;
    }

    // Check name tokens (weight 3.0)
    for (const w of profile.nameWords) {
      const sim = computeTokenSimilarity(qToken, w);
      if (sim * 3.0 > bestTokenScore) bestTokenScore = sim * 3.0;
    }

    // Check SKU tokens (weight 3.0)
    for (const w of profile.skuWords) {
      const sim = computeTokenSimilarity(qToken, w);
      if (sim * 3.0 > bestTokenScore) bestTokenScore = sim * 3.0;
    }

    // Check brand tokens (weight 2.5)
    for (const w of profile.brandWords) {
      const sim = computeTokenSimilarity(qToken, w);
      if (sim * 2.5 > bestTokenScore) bestTokenScore = sim * 2.5;
    }

    // Check category tokens (weight 2.0)
    for (const w of profile.catWords) {
      const sim = computeTokenSimilarity(qToken, w);
      if (sim * 2.0 > bestTokenScore) bestTokenScore = sim * 2.0;
    }

    // Check specs tokens (weight 1.5)
    for (const w of profile.specWords) {
      const sim = computeTokenSimilarity(qToken, w);
      if (sim * 1.5 > bestTokenScore) bestTokenScore = sim * 1.5;
    }

    // Check desc tokens (weight 1.0)
    for (const w of profile.descWords) {
      const sim = computeTokenSimilarity(qToken, w);
      if (sim * 1.0 > bestTokenScore) bestTokenScore = sim * 1.0;
    }

    // Check if clean token is substring of clean name
    if (qClean.length >= 4 && profile.nameClean.includes(qClean)) {
      const subScore = 2.8;
      if (subScore > bestTokenScore) bestTokenScore = subScore;
    }

    // Minimum required score per token for fuzzy inclusion (0.7 * base weight 1.0 = 0.70)
    if (bestTokenScore < 0.70) {
      allTokensMatch = false;
      break;
    }

    totalScore += bestTokenScore;
  }

  if (allTokensMatch) {
    const avgScore = (totalScore / queryTokens.length) * 25; // Scale to 0-100 range
    return {
      matches: true,
      score: avgScore,
      matchType: 'fuzzy'
    };
  }

  return { matches: false, score: 0, matchType: 'none' };
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
 * @returns {{ matches: boolean, isDirectMatch: boolean, matchedViaProduct: Object|null, score: number, matchType: string }}
 */
export const matchProductWithRelations = (
  prod,
  rawTerm,
  relationsMap,
  categories,
  brands,
  ownCorpusCache = null
) => {
  const normTerm = normalizeSearchText(rawTerm);
  if (!normTerm) {
    return { matches: true, isDirectMatch: true, matchedViaProduct: null, score: 100, matchType: 'all' };
  }

  const profile = getProductSearchProfile(prod, categories, brands);
  if (!profile) {
    return { matches: false, isDirectMatch: false, matchedViaProduct: null, score: 0, matchType: 'none' };
  }

  const directMatch = evaluateDirectProductMatch(profile, rawTerm);

  if (directMatch.matches) {
    return {
      matches: true,
      isDirectMatch: true,
      matchedViaProduct: null,
      score: directMatch.score,
      matchType: directMatch.matchType
    };
  }

  // Related products check (Bidirectional):
  // Check if any product linked to this product directly matches the search query
  const relatedList = relationsMap?.get(prod.id) || [];
  let bestRelated = null;
  let bestRelScore = 0;

  for (let i = 0; i < relatedList.length; i++) {
    const relProd = relatedList[i];
    const relProfile = getProductSearchProfile(relProd, categories, brands);
    if (!relProfile) continue;

    const relMatch = evaluateDirectProductMatch(relProfile, rawTerm);

    if (relMatch.matches && relMatch.score > bestRelScore) {
      bestRelScore = relMatch.score;
      bestRelated = relProd;
    }
  }

  if (bestRelated) {
    return {
      matches: true,
      isDirectMatch: false,
      matchedViaProduct: bestRelated,
      score: bestRelScore * 0.5, // Related items ranked below direct matches
      matchType: 'related'
    };
  }

  return { matches: false, isDirectMatch: false, matchedViaProduct: null, score: 0, matchType: 'none' };
};
