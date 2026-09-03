/**
 * Normalizes image URLs to use the production Cloudflare CDN custom domain.
 * Seamlessly upgrades legacy dev URLs to the fast, edge-cached images.athenaconsultoria.com.br.
 */
export function normalizeImageUrl(url) {
  if (!url || typeof url !== 'string') return url;
  if (url.includes('pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev')) {
    return url.replace('https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev', 'https://images.athenaconsultoria.com.br');
  }
  return url;
}

export function normalizeProduct(p) {
  if (!p || typeof p !== 'object') return p;
  return {
    ...p,
    image: normalizeImageUrl(p.image),
    images: Array.isArray(p.images) ? p.images.map(normalizeImageUrl) : p.images
  };
}

export function normalizeBrand(b) {
  if (!b || typeof b !== 'object') return b;
  return {
    ...b,
    logo: normalizeImageUrl(b.logo)
  };
}
