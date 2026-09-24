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
  let parsedModel3d = p.model3d || p.model_3d;
  if (typeof parsedModel3d === 'string') {
    try {
      parsedModel3d = JSON.parse(parsedModel3d);
    } catch (e) {}
  }
  if (parsedModel3d && typeof parsedModel3d === 'object' && parsedModel3d.glb) {
    parsedModel3d = {
      ...parsedModel3d,
      glb: normalizeImageUrl(parsedModel3d.glb)
    };
  }
  return {
    ...p,
    model3d: parsedModel3d,
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

export function isProductPublished(p) {
  if (!p || typeof p !== 'object') return false;
  const s = String(p.status || 'published').toLowerCase().trim();
  if (s === 'draft' || s === 'rascunho' || s === 'hidden' || s === 'oculto' || s === 'inactive') {
    return false;
  }
  return s === 'published' || s === 'publicado';
}
