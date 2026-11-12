/**
 * src/utils/seoManager.js
 *
 * Gerenciador centralizado de SEO On-Page (Title, Meta Description, Canonical, OpenGraph e Schema JSON-LD)
 * para garantir que o Googlebot e os rastreadores de IA Generativa (Google SGE / AI Overviews)
 * recebam sempre a URL canônica exata da rota atual sem apontar incorretamente para a Home ("/").
 */

const SITE_URL = 'https://www.athenaconsultoria.com.br';
const DEFAULT_TITLE = 'Athena Soluções Automotivas | Catálogo de Equipamentos';
const DEFAULT_DESC = 'Equipamentos para oficinas mecânicas e auto centers: elevadores hidráulicos, scanners de diagnóstico, alinhadores 3D e ferramentas especiais. Pronta-entrega!';
const DEFAULT_IMAGE = `${SITE_URL}/logo.jpg`;

export function normalizeCanonicalPath(rawPath) {
  if (!rawPath || typeof rawPath !== 'string') return '/';
  let clean = rawPath.split('?')[0].split('#')[0].trim();
  if (!clean.startsWith('/')) clean = `/${clean}`;
  if (clean === '/catalog' || clean === '/catalogo' || clean === '/inicio' || clean === '/home') {
    return '/';
  }
  // Remove barra final exceto na raiz
  if (clean.length > 1 && clean.endsWith('/')) {
    clean = clean.slice(0, -1);
  }
  return clean;
}

export function setPageSeo({
  title,
  description,
  canonicalPath,
  image,
  type = 'website',
  noindex = false,
  schemaId = 'dynamic-page-json-ld',
  schemaData = null
}) {
  if (typeof document === 'undefined') return;

  const finalTitle = title || DEFAULT_TITLE;
  const finalDesc = (description || DEFAULT_DESC).slice(0, 165);
  const cleanPath = normalizeCanonicalPath(
    canonicalPath !== undefined ? canonicalPath : (typeof window !== 'undefined' ? window.location.pathname : '/')
  );
  const canonicalUrl = `${SITE_URL}${cleanPath}`;
  const finalImage = image || DEFAULT_IMAGE;

  // 1. Document Title
  document.title = finalTitle;

  // 2. Canonical Link
  let canonicalEl = document.querySelector('link[rel="canonical"]');
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', canonicalUrl);

  // 3. Meta Description
  let descEl = document.querySelector('meta[name="description"]');
  if (!descEl) {
    descEl = document.createElement('meta');
    descEl.setAttribute('name', 'description');
    document.head.appendChild(descEl);
  }
  descEl.setAttribute('content', finalDesc);

  // 4. Meta Robots (garante index, follow para páginas públicas e noindex para admin/login)
  let robotsEl = document.querySelector('meta[name="robots"]');
  if (noindex) {
    if (!robotsEl) {
      robotsEl = document.createElement('meta');
      robotsEl.setAttribute('name', 'robots');
      document.head.appendChild(robotsEl);
    }
    robotsEl.setAttribute('content', 'noindex, nofollow');
  } else if (robotsEl) {
    robotsEl.setAttribute('content', 'index, follow, max-image-preview:large, max-snippet:-1');
  }

  // 5. OpenGraph & Twitter
  const setMetaProp = (attrName, attrVal, contentVal) => {
    let el = document.querySelector(`meta[${attrName}="${attrVal}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attrName, attrVal);
      document.head.appendChild(el);
    }
    el.setAttribute('content', contentVal);
  };

  setMetaProp('property', 'og:type', type);
  setMetaProp('property', 'og:title', finalTitle);
  setMetaProp('property', 'og:description', finalDesc);
  setMetaProp('property', 'og:url', canonicalUrl);
  setMetaProp('property', 'og:image', finalImage);
  setMetaProp('name', 'twitter:title', finalTitle);
  setMetaProp('name', 'twitter:description', finalDesc);
  setMetaProp('name', 'twitter:image', finalImage);

  // 6. Schema.org JSON-LD
  if (schemaId) {
    const existingScript = document.getElementById(schemaId);
    if (schemaData) {
      const script = existingScript || document.createElement('script');
      script.id = schemaId;
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(schemaData);
      if (!existingScript) {
        document.head.appendChild(script);
      }
    } else if (existingScript) {
      existingScript.remove();
    }
  }
}
