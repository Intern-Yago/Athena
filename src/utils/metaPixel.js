/**
 * metaPixel.js
 * Utilitário de telemetria e eventos para o Meta Pixel (Facebook & Instagram Ads)
 * Datasets ativos:
 * - 2181846082544846 (Conjunto de Dados do Catálogo / Meta Commerce)
 * - 2198770257418355 (Pixel Secundário)
 */

export const META_PIXEL_ID = '2181846082544846';
export const META_PIXEL_IDS = ['2181846082544846', '2198770257418355'];

export function trackMetaEvent(eventName, params = {}) {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    try {
      window.fbq('track', eventName, params);
    } catch (err) {
      console.warn('[Meta Pixel Warning]:', err.message);
    }
  }
}

export function trackMetaCustom(eventName, params = {}) {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    try {
      window.fbq('trackCustom', eventName, params);
    } catch (err) {
      console.warn('[Meta Pixel Custom Warning]:', err.message);
    }
  }
}
