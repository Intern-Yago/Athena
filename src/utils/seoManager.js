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

const LOWERCASE_PREPOSITIONS = new Set([
  'de', 'da', 'do', 'das', 'dos', 'com', 'para', 'em', 'por', 'sem', 'sob', 'sobre', 'ate', 'até', 'e', 'a', 'o', 'as', 'os', 'no', 'na', 'nos', 'nas', 'ao', 'aos', 'pelo', 'pela'
]);

const UPPERCASE_ACRONYMS = new Set([
  'EAATA', 'MAHOVI', 'STÄRKX', 'STARKX', 'SGT', 'MXT', 'PRO', 'HVLP', 'PSI', 'KGF', 'NM', 'KGF.M', 'LED', 'LEDS', 'HD', 'USB', 'OBD', 'OBD-II', 'ECU', 'TCU', 'TCM', 'BCM', 'ABS', 'SRS', 'SAS', 'BMS', 'ADAS', 'TPMS', 'IMMO', 'CAN', 'CAN-FD', 'DOIP', 'EV', 'DC', 'AC', 'CCS2', 'GB/T', 'GBT', 'IP54', 'IP65', 'IP67', 'NBR', 'ISO', 'VG', 'CVT', 'ATF', 'DCT', 'DSG', 'DQ200', 'DQ250', 'MAH', 'WAL', 'LPK', 'SKX', 'DT', 'TC', 'EW', 'TTE', 'TTK', 'TPC', 'TFJ', 'TES', 'TBT', 'ACT20', 'EPD002', '360PRO', 'IA', '3D', '2D', '12V', '24V', '48V', '110V', '127V', '220V', '380V', '60HZ', 'HP', 'PCM', 'RPM', 'MM', 'CM', 'KG', 'KW', 'KWH', 'AH', 'PU', 'EVA', 'SUV', 'SUVS', 'NR-12', 'NR12', 'CNPJ', 'CPF', 'PIX', 'DF'
]);

/**
 * Normaliza títulos de produtos e páginas para o Google Search Console:
 * - Decodifica entidades HTML (&quot; -> ")
 * - Converte títulos que estão 100% em CAIXA ALTA ou com preposições gritantes (DE, COM, PARA)
 *   para Title Case técnico elegante, preservando siglas, códigos de modelo (MAH-1020, SGT-0555) e unidades (7kW, 32A).
 */
export function formatSeoProductTitle(rawTitle) {
  if (!rawTitle || typeof rawTitle !== 'string') return '';
  let clean = rawTitle
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();

  // Verifica se o título inteiro é predominantemente maiúsculo ou possui preposições em CAIXA ALTA
  const hasUppercasePrepositions = /\b(DE|DA|DO|DAS|DOS|COM|PARA|EM|POR)\b/.test(clean);
  const lettersOnly = clean.replace(/[^a-zA-ZÀ-ÿ]/g, '');
  const upperLetters = clean.replace(/[^A-ZÀ-Ý]/g, '');
  const isMostlyAllCaps = lettersOnly.length > 6 && (upperLetters.length / lettersOnly.length) > 0.72;

  if (!hasUppercasePrepositions && !isMostlyAllCaps) {
    return clean;
  }

  const words = clean.split(' ');
  return words
    .map((word, idx) => {
      if (!word) return '';
      const upperWord = word.toUpperCase();
      const lowerWord = word.toLowerCase();

      // Preserva códigos alfanuméricos de modelo/medida (ex: MAH-1020, SGT-0555, 30X33MM -> 30x33mm, 7kW, 32A, 1/2")
      if (/^[A-Z]{2,5}-[0-9A-Z-]+$/i.test(word)) {
        return upperWord;
      }
      if (/^[0-9]+[.,]?[0-9]*(kw|kwh|v|a|ah|nm|psi|hp|w|l|m|mm|cm|kg|t|un|hz|graus|"|″|”|°)$/i.test(word)) {
        return word
          .replace(/kw$/i, 'kW')
          .replace(/kwh$/i, 'kWh')
          .replace(/ah$/i, 'Ah')
          .replace(/nm$/i, 'Nm')
          .replace(/hz$/i, 'Hz')
          .replace(/psi$/i, 'PSI')
          .replace(/hp$/i, 'HP')
          .replace(/mm$/i, 'mm')
          .replace(/cm$/i, 'cm')
          .replace(/kg$/i, 'kg')
          .replace(/un$/i, 'un');
      }
      if (UPPERCASE_ACRONYMS.has(upperWord)) {
        return upperWord;
      }

      // Se não for a primeira palavra nem após traço/barra, preposições ficam em minúsculo
      const prevWord = idx > 0 ? words[idx - 1] : '';
      const isAfterSeparator = prevWord === '-' || prevWord === '–' || prevWord === '|' || prevWord === ':';
      if (idx > 0 && !isAfterSeparator && LOWERCASE_PREPOSITIONS.has(lowerWord)) {
        return lowerWord;
      }

      // Se a palavra já estiver em Mixed Case normal (ex: "ThinkTool", "Stärkx") e não for toda maiúscula, preserva
      if (word !== upperWord && word !== lowerWord) {
        return word;
      }

      return lowerWord.charAt(0).toUpperCase() + lowerWord.slice(1);
    })
    .join(' ');
}

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
