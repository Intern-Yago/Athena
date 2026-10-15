/**
 * metaPixel.js
 * Utilitário de telemetria e eventos para o Meta Pixel (Facebook & Instagram Ads)
 * Pixel ID: 2198770257418355
 */

export const META_PIXEL_ID = '2198770257418355';

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
