import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  captureAndStoreUtmParams,
  detectOrganicSource,
  formatAttributionForWhatsApp,
  formatAttributionForApi
} from '../../src/utils/utmTracker.js';
import {
  buildProductWhatsAppMessage,
  buildCartWhatsAppMessage
} from '../../src/utils/commercialPolicy.js';

describe('Pacote D: Motor de Rastreamento Omnichannel & Atribuição de Tráfego', () => {

  it('detectOrganicSource: Identifica motores de busca, redes sociais e referrers orgânicos', () => {
    assert.deepEqual(detectOrganicSource('https://www.google.com.br/search?q=elevador+4t'), {
      utm_source: 'google',
      utm_medium: 'organic',
      utm_campaign: 'seo'
    });

    assert.deepEqual(detectOrganicSource('https://l.instagram.com/'), {
      utm_source: 'instagram',
      utm_medium: 'organic_social',
      utm_campaign: 'bio_or_post'
    });

    assert.deepEqual(detectOrganicSource('https://m.facebook.com/'), {
      utm_source: 'facebook',
      utm_medium: 'organic_social',
      utm_campaign: 'post'
    });

    assert.deepEqual(detectOrganicSource('https://www.tiktok.com/'), {
      utm_source: 'tiktok',
      utm_medium: 'organic_social',
      utm_campaign: 'profile'
    });

    assert.deepEqual(detectOrganicSource('https://web.whatsapp.com/'), {
      utm_source: 'whatsapp',
      utm_medium: 'chat',
      utm_campaign: 'direct_share'
    });

    assert.deepEqual(detectOrganicSource('https://www.bing.com/'), {
      utm_source: 'bing',
      utm_medium: 'organic',
      utm_campaign: 'seo'
    });
  });

  it('captureAndStoreUtmParams: Extrai parâmetros UTM completos da query string', () => {
    const qs = '?utm_source=meta&utm_medium=cpc&utm_campaign=blackfriday2026&utm_content=carrossel_elevadores&utm_term=elevador4t';
    const result = captureAndStoreUtmParams(qs);

    assert.ok(result);
    assert.equal(result.utm_source, 'meta');
    assert.equal(result.utm_medium, 'cpc');
    assert.equal(result.utm_campaign, 'blackfriday2026');
    assert.equal(result.utm_content, 'carrossel_elevadores');
    assert.equal(result.utm_term, 'elevador4t');
  });

  it('captureAndStoreUtmParams: Normaliza campanhas originadas por gclid (Google Ads)', () => {
    const qs = '?gclid=EAIaIQobChMI123456789';
    const result = captureAndStoreUtmParams(qs);

    assert.ok(result);
    assert.equal(result.utm_source, 'google_ads');
    assert.equal(result.utm_medium, 'cpc');
    assert.equal(result.gclid, 'EAIaIQobChMI123456789');
  });

  it('captureAndStoreUtmParams: Normaliza campanhas originadas por fbclid (Meta Ads)', () => {
    const qs = '?fbclid=IwAR0987654321';
    const result = captureAndStoreUtmParams(qs);

    assert.ok(result);
    assert.equal(result.utm_source, 'meta_ads');
    assert.equal(result.utm_medium, 'cpc');
    assert.equal(result.fbclid, 'IwAR0987654321');
  });

  it('formatAttributionForWhatsApp: Formata texto limpo em colchetes e com ZERO emojis', () => {
    const sampleAttribution = {
      utm_source: 'meta',
      utm_medium: 'cpc',
      utm_campaign: 'blackfriday2026',
      utm_term: 'balanceadora'
    };

    const formatted = formatAttributionForWhatsApp(sampleAttribution);
    assert.equal(formatted, '\n\n[Origem: meta / cpc | Campanha: blackfriday2026 | Termo: balanceadora]');

    // Invariante: Zero emojis
    const hasEmoji = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(formatted);
    assert.equal(hasEmoji, false, 'Formatação para WhatsApp não pode conter nenhum emoji');
  });

  it('formatAttributionForApi: Retorna payload sanitizado para envio no checkout Asaas', () => {
    const sampleAttribution = {
      utm_source: 'google_ads',
      utm_medium: 'cpc',
      utm_campaign: 'blackfriday2026',
      utm_content: 'banner_superior',
      utm_term: 'elevador 4000kg',
      gclid: 'gclid_12345',
      landing_page: '/produto/elevador-4t',
      captured_at: 1731240000000
    };

    const apiPayload = formatAttributionForApi(sampleAttribution);
    assert.deepEqual(apiPayload, {
      source: 'google_ads',
      medium: 'cpc',
      campaign: 'blackfriday2026',
      content: 'banner_superior',
      term: 'elevador 4000kg',
      gclid: 'gclid_12345',
      fbclid: null,
      landingPage: '/produto/elevador-4t',
      capturedAt: 1731240000000
    });
  });

  it('buildProductWhatsAppMessage: Incorpora tag de atribuição ao final da mensagem de cotação consultiva', () => {
    const product = {
      id: 'prod_elevador_1',
      name: 'Elevador Automotivo 4000kg',
      commercial_mode: 'technical_consultative',
      sku: 'ELV-4000'
    };

    const attribution = {
      utm_source: 'facebook_marketplace',
      utm_medium: 'catalog',
      utm_campaign: 'bf_promocoes'
    };

    const encoded = buildProductWhatsAppMessage({
      product,
      brand: { name: 'Sigma' },
      category: { name: 'Elevadores' },
      quantity: 1,
      attribution
    });

    const decoded = decodeURIComponent(encoded);
    assert.ok(decoded.includes('Gostaria de uma cotação para o equipamento:'));
    assert.ok(decoded.includes('[Origem: facebook_marketplace / catalog | Campanha: bf_promocoes]'));

    // Zero emojis
    const hasEmoji = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(decoded);
    assert.equal(hasEmoji, false, 'Mensagem gerada não pode conter emojis');
  });

  it('buildCartWhatsAppMessage: Incorpora tag de atribuição na mensagem com múltiplos itens', () => {
    const cartItems = [
      {
        id: 'p1',
        name: 'Óleo Sintético 5W30',
        price: 45.00,
        quantity: 2,
        commercial_mode: 'direct_sale'
      },
      {
        id: 'p2',
        name: 'Rampa de Alinhamento 4T',
        price: 0,
        quantity: 1,
        commercial_mode: 'technical_consultative'
      }
    ];

    const attribution = {
      utm_source: 'google_ads',
      utm_medium: 'cpc',
      utm_campaign: 'blackfriday2026'
    };

    const url = buildCartWhatsAppMessage({
      cartItems,
      attribution
    });

    assert.ok(url.startsWith('https://wa.me/5561983485671?text='));
    const message = decodeURIComponent(url.replace('https://wa.me/5561983485671?text=', ''));

    assert.ok(message.includes('1. *2x Óleo Sintético 5W30* - Venda Direta:'));
    assert.ok(message.includes('2. *1x Rampa de Alinhamento 4T* - Cotação Consultiva'));
    assert.ok(message.includes('[Origem: google_ads / cpc | Campanha: blackfriday2026]'));

    // Zero emojis
    const hasEmoji = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(message);
    assert.equal(hasEmoji, false);
  });

});
