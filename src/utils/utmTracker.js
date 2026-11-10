/**
 * utmTracker.js
 *
 * Motor de Rastreamento Omnichannel & Atribuição de Tráfego — Athena Automotivo.
 * Captura parâmetros de campanha (UTMs, GCLID, FBCLID) e canais orgânicos,
 * preservando a rastreabilidade pelo funil de vendas (PDP -> Carrinho -> WhatsApp / Checkout Asaas).
 *
 * REGRA INVIOLÁVEL: Zero emojis nas saídas de texto e mensagens.
 */

export const UTM_SESSION_KEY = 'athena_utm_session';
export const UTM_FIRST_TOUCH_KEY = 'athena_utm_first_touch';
export const UTM_LAST_TOUCH_KEY = 'athena_utm_last_touch';
export const ATTRIBUTION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias de janela de atribuição

/**
 * Detecta a origem orgânica a partir do Referrer caso não haja UTMs na URL.
 */
export function detectOrganicSource(referrerStr = '') {
  if (!referrerStr || typeof referrerStr !== 'string') return null;
  const ref = referrerStr.toLowerCase();

  try {
    if (ref.includes('google.')) return { utm_source: 'google', utm_medium: 'organic', utm_campaign: 'seo' };
    if (ref.includes('instagram.') || ref.includes('l.instagram.com')) return { utm_source: 'instagram', utm_medium: 'organic_social', utm_campaign: 'bio_or_post' };
    if (ref.includes('facebook.') || ref.includes('fb.me') || ref.includes('l.facebook.com')) return { utm_source: 'facebook', utm_medium: 'organic_social', utm_campaign: 'post' };
    if (ref.includes('tiktok.')) return { utm_source: 'tiktok', utm_medium: 'organic_social', utm_campaign: 'profile' };
    if (ref.includes('whatsapp') || ref.includes('wa.me')) return { utm_source: 'whatsapp', utm_medium: 'chat', utm_campaign: 'direct_share' };
    if (ref.includes('youtube.') || ref.includes('youtu.be')) return { utm_source: 'youtube', utm_medium: 'video_referral', utm_campaign: 'organic' };
    if (ref.includes('bing.')) return { utm_source: 'bing', utm_medium: 'organic', utm_campaign: 'seo' };

    const parsed = new URL(referrerStr);
    const host = parsed.hostname.replace(/^www\./, '');
    if (host && !host.includes('athenaconsultoria.com.br') && !host.includes('localhost')) {
      return { utm_source: host, utm_medium: 'referral', utm_campaign: 'external_site' };
    }
  } catch (_) {
    // URL parse fallback
  }

  return null;
}

/**
 * Analisa os parâmetros de URL e Referrer e captura os dados de atribuição.
 * Salva na sessão atual e no histórico local.
 *
 * @param {string} [searchString] - window.location.search ou querystring simulada
 * @param {string} [referrerString] - document.referrer ou referrer simulado
 * @returns {object|null} Dados de atribuição capturados ou null se inexistente
 */
export function captureAndStoreUtmParams(searchString = '', referrerString = '') {
  const isBrowser = typeof window !== 'undefined';
  const rawSearch = searchString || (isBrowser ? window.location?.search : '') || '';
  const rawReferrer = referrerString || (isBrowser ? document?.referrer : '') || '';

  let captured = null;

  try {
    const params = new URLSearchParams(rawSearch);
    const utmSource = params.get('utm_source');
    const utmMedium = params.get('utm_medium');
    const utmCampaign = params.get('utm_campaign');
    const utmContent = params.get('utm_content');
    const utmTerm = params.get('utm_term');
    const gclid = params.get('gclid');
    const fbclid = params.get('fbclid');
    const ttclid = params.get('ttclid');

    const hasUtmOrAdId = Boolean(utmSource || utmCampaign || gclid || fbclid || ttclid);

    if (hasUtmOrAdId) {
      let resolvedSource = utmSource;
      let resolvedMedium = utmMedium;

      if (!resolvedSource) {
        if (gclid) {
          resolvedSource = 'google_ads';
          resolvedMedium = resolvedMedium || 'cpc';
        } else if (fbclid) {
          resolvedSource = 'meta_ads';
          resolvedMedium = resolvedMedium || 'cpc';
        } else if (ttclid) {
          resolvedSource = 'tiktok_ads';
          resolvedMedium = resolvedMedium || 'cpc';
        }
      }

      captured = {
        utm_source: resolvedSource || 'direct_or_unknown',
        utm_medium: resolvedMedium || 'none',
        utm_campaign: utmCampaign || (gclid ? 'google_cpc' : fbclid ? 'meta_cpc' : null),
        utm_content: utmContent || null,
        utm_term: utmTerm || null,
        gclid: gclid || null,
        fbclid: fbclid || null,
        ttclid: ttclid || null,
        landing_page: isBrowser ? window.location?.pathname : '/',
        captured_at: Date.now()
      };
    } else if (rawReferrer) {
      const organic = detectOrganicSource(rawReferrer);
      if (organic) {
        captured = {
          ...organic,
          utm_content: null,
          utm_term: null,
          gclid: null,
          fbclid: null,
          ttclid: null,
          landing_page: isBrowser ? window.location?.pathname : '/',
          captured_at: Date.now()
        };
      }
    }
  } catch (_) {
    // Silencia erros de parseamento de query
  }

  if (captured && isBrowser) {
    try {
      const serialized = JSON.stringify(captured);
      window.sessionStorage?.setItem(UTM_SESSION_KEY, serialized);

      if (!window.localStorage?.getItem(UTM_FIRST_TOUCH_KEY)) {
        window.localStorage?.setItem(UTM_FIRST_TOUCH_KEY, serialized);
      }
      window.localStorage?.setItem(UTM_LAST_TOUCH_KEY, serialized);
    } catch (_) {
      // Falha de storage
    }
  }

  return captured;
}

/**
 * Recupera os dados de atribuição válidos da sessão ou histórico local.
 * Prioriza sessão ativa; se ausente, utiliza o último toque (se dentro da janela de 30 dias).
 *
 * @returns {object|null}
 */
export function getStoredAttribution() {
  if (typeof window === 'undefined') return null;

  try {
    const sessionRaw = window.sessionStorage?.getItem(UTM_SESSION_KEY);
    if (sessionRaw) {
      const parsed = JSON.parse(sessionRaw);
      if (parsed && parsed.utm_source) return parsed;
    }

    const lastTouchRaw = window.localStorage?.getItem(UTM_LAST_TOUCH_KEY);
    if (lastTouchRaw) {
      const parsed = JSON.parse(lastTouchRaw);
      if (parsed && parsed.captured_at) {
        const age = Date.now() - parsed.captured_at;
        if (age <= ATTRIBUTION_TTL_MS) {
          return parsed;
        }
      }
    }
  } catch (_) {
    // Storage read fail
  }

  return null;
}

/**
 * Formata os dados de atribuição para inclusão no texto de WhatsApp (Cotação Consultiva ou Venda Direta).
 * REGRAS:
 * - Zero emojis
 * - Texto conciso entre colchetes ao final da mensagem
 *
 * Exemplo: "[Origem: google_ads / cpc | Campanha: blackfriday2026]"
 *
 * @param {object|null} [customAttribution]
 * @returns {string} String formatada ou string vazia
 */
export function formatAttributionForWhatsApp(customAttribution = null) {
  const attr = customAttribution || getStoredAttribution();
  if (!attr || !attr.utm_source) return '';

  const parts = [];
  const sourceMed = attr.utm_medium && attr.utm_medium !== 'none'
    ? `${attr.utm_source} / ${attr.utm_medium}`
    : attr.utm_source;

  parts.push(`Origem: ${sourceMed}`);

  if (attr.utm_campaign) {
    parts.push(`Campanha: ${attr.utm_campaign}`);
  }

  if (attr.utm_term) {
    parts.push(`Termo: ${attr.utm_term}`);
  }

  return `\n\n[${parts.join(' | ')}]`;
}

/**
 * Retorna objeto limpo de atribuição para envio no payload de checkout Asaas e APIs do backend.
 *
 * @param {object|null} [customAttribution]
 * @returns {object|null}
 */
export function formatAttributionForApi(customAttribution = null) {
  const attr = customAttribution || getStoredAttribution();
  if (!attr || !attr.utm_source) return null;

  return {
    source: attr.utm_source,
    medium: attr.utm_medium || null,
    campaign: attr.utm_campaign || null,
    content: attr.utm_content || null,
    term: attr.utm_term || null,
    gclid: attr.gclid || null,
    fbclid: attr.fbclid || null,
    landingPage: attr.landing_page || null,
    capturedAt: attr.captured_at || Date.now()
  };
}
