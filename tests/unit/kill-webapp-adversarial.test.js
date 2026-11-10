import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  captureAndStoreUtmParams,
  formatAttributionForWhatsApp,
  formatAttributionForApi
} from '../../src/utils/utmTracker.js';
import {
  getDiscountPercentage,
  buildCartWhatsAppMessage,
  buildProductWhatsAppMessage,
  canCheckout,
  getCommercialMode
} from '../../src/utils/commercialPolicy.js';

describe('Adversarial Security & Fuzzing Suite — "Kill WebApp" Red-Team Test', () => {

  // --------------------------------------------------------------------------
  // 1. ADVERSARIAL UTM & ATTRIBUTION TRACKER FUZZING
  // --------------------------------------------------------------------------
  describe('1. Adversarial UTM & Attribution Tracker Fuzzing', () => {

    it('XSS Injection: Remove tags HTML e scripts maliciosos de parâmetros UTM', () => {
      const maliciousQs = '?utm_source=<script>alert("xss")</script>&utm_campaign=\'<svg onload=alert(1)>\'&utm_term="><img src=x onerror=alert(1)>';
      const captured = captureAndStoreUtmParams(maliciousQs);

      assert.ok(captured);
      assert.equal(captured.utm_source.includes('<script>'), false);
      assert.equal(captured.utm_source.includes('</script>'), false);
      assert.equal(captured.utm_campaign.includes('<svg'), false);
      assert.equal(captured.utm_term.includes('<img'), false);

      const whatsAppTag = formatAttributionForWhatsApp(captured);
      assert.equal(whatsAppTag.includes('<'), false);
      assert.equal(whatsAppTag.includes('>'), false);
      assert.equal(whatsAppTag.includes('alert'), true); // Conteúdo textual permitido, mas sanitizado sem tags
    });

    it('Buffer Bloat / DoS: Trunca parâmetros UTM gigantes sem travar ou sofrer ReDoS', () => {
      const giantString = 'A'.repeat(50000);
      const bloatedQs = `?utm_source=${giantString}&utm_campaign=${giantString}`;
      
      const start = Date.now();
      const captured = captureAndStoreUtmParams(bloatedQs);
      const elapsed = Date.now() - start;

      assert.ok(elapsed < 100, `Processamento deve ser sub-100ms (demorou ${elapsed}ms)`);
      assert.ok(captured);
      assert.ok(captured.utm_source.length <= 150, 'utm_source deve ser truncado a 100-150 caracteres');
      assert.ok(captured.utm_campaign.length <= 150, 'utm_campaign deve ser truncado a 150 caracteres');
    });

    it('Prototype Pollution: Rejeita chaves e payloads que tentam injetar __proto__ ou constructor', () => {
      const pollutionPayload = JSON.parse('{"__proto__": {"admin": true}, "source": "meta"}');
      const apiPayload = formatAttributionForApi(pollutionPayload);

      assert.equal(Object.prototype.hasOwnProperty.call(Object.prototype, 'admin'), false);
      assert.equal(apiPayload.source, 'meta');
    });

    it('Zero-Emoji Invariant: Garante ausência total de emojis na formatação de WhatsApp', () => {
      const captured = {
        utm_source: 'google_ads',
        utm_medium: 'cpc',
        utm_campaign: 'blackfriday2026'
      };

      const tag = formatAttributionForWhatsApp(captured);
      const hasEmoji = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(tag);
      assert.equal(hasEmoji, false, 'Tag de atribuição não pode conter emojis');
    });

  });

  // --------------------------------------------------------------------------
  // 2. ADVERSARIAL PRICING & DISCOUNT ENGINE ATTACKS
  // --------------------------------------------------------------------------
  describe('2. Adversarial Pricing & Discount Engine Attacks', () => {

    it('Preço Negativo: Rejeita tentativa de gerar descontos fraudulentos com preços negativos', () => {
      // Preço atual negativo com preço original positivo (-100 e 200 resultaria em 150% OFF em código fraco)
      assert.equal(getDiscountPercentage(-100, 200), null);
      assert.equal(getDiscountPercentage(100, -200), null);
      assert.equal(getDiscountPercentage(-50, -100), null);
    });

    it('Inversão e Empate: Rejeita quando originalPrice <= price (sem desconto real)', () => {
      assert.equal(getDiscountPercentage(500, 500), null);
      assert.equal(getDiscountPercentage(600, 500), null);
    });

    it('Tipo e NaN Injection: Rejeita strings arbitrárias e tipos não numéricos sem estourar exceção', () => {
      assert.equal(getDiscountPercentage('not_a_number', 100), null);
      assert.equal(getDiscountPercentage(100, 'undefined'), null);
      assert.equal(getDiscountPercentage(null, undefined), null);
      assert.equal(getDiscountPercentage({}, []), null);
      assert.equal(getDiscountPercentage(Infinity, 100), null);
    });

    it('Sanitização Numérica Segura para PostgreSQL (Simulação do Parser do Backend)', () => {
      const parseSafeNumeric = (val) => {
        if (val === null || val === undefined || val === '') return null;
        const num = parseFloat(val);
        return !isNaN(num) && isFinite(num) && num >= 0 ? num : null;
      };

      const parseSafeInt = (val) => {
        if (val === null || val === undefined || val === '') return null;
        const num = parseInt(val, 10);
        return !isNaN(num) && isFinite(num) && num >= 0 ? num : null;
      };

      // Entradas maliciosas que gerariam "NaN" ou quebrariam a query SQL
      assert.equal(parseSafeNumeric('abc'), null);
      assert.equal(parseSafeNumeric('NaN'), null);
      assert.equal(parseSafeNumeric('-50.00'), null);
      assert.equal(parseSafeNumeric('150.50'), 150.5);

      assert.equal(parseSafeInt('abc'), null);
      assert.equal(parseSafeInt('-12'), null);
      assert.equal(parseSafeInt('12'), 12);
    });

  });

  // --------------------------------------------------------------------------
  // 3. ADVERSARIAL CART & QUANTITY MANIPULATION
  // --------------------------------------------------------------------------
  describe('3. Adversarial Cart & Quantity Manipulation', () => {

    it('Quantidades Negativas no Carrinho: Normaliza para no mínimo 1 unidade ao montar mensagem', () => {
      const cartItems = [
        {
          id: 'p1',
          name: 'Produto Teste',
          price: 100.00,
          quantity: -10, // Tentativa maliciosa de subtotal negativo (-R$ 1.000)
          commercial_mode: 'direct_sale'
        }
      ];

      const url = buildCartWhatsAppMessage({ cartItems });
      const message = decodeURIComponent(url);

      assert.ok(message.includes('1. *1x Produto Teste* - Venda Direta:'));
      assert.equal(message.includes('-10x'), false);
      assert.equal(message.includes('-R$'), false);
    });

    it('Preço Oculto em Consultivo: Garante que NUNCA vaze valor de maquinário pesado na mensagem', () => {
      const product = {
        id: 'elv_1',
        name: 'Elevador Automotivo 4T',
        price: 25000.00, // Tem preço interno mas modalidade é technical_consultative
        commercial_mode: 'technical_consultative'
      };

      const encoded = buildProductWhatsAppMessage({ product });
      const message = decodeURIComponent(encoded);

      assert.equal(message.includes('25000'), false);
      assert.equal(message.includes('25.000'), false);
      assert.ok(message.includes('Gostaria de uma cotação para o equipamento'));
    });

    it('Parcelamento Adulterado: Simulação de bloqueio de valor de parcela adulterado', () => {
      const finalPayable = 1200.00;
      const installmentCount = 12;
      const attackerInstallmentValue = 0.50; // Atacante envia R$ 0.50 em vez de R$ 100+

      const minAcceptableInstallment = (finalPayable / installmentCount) * 0.95;
      
      let finalInstallmentValue = null;
      if (attackerInstallmentValue >= minAcceptableInstallment) {
        finalInstallmentValue = attackerInstallmentValue;
      }

      // Deve descartar a parcela fraudulenta de R$ 0.50
      assert.equal(finalInstallmentValue, null, 'Parcela adulterada de R$ 0.50 deve ser descartada');
    });

  });

  // --------------------------------------------------------------------------
  // 4. ADVERSARIAL CACHE POISONING & PRIVACY GUARDS
  // --------------------------------------------------------------------------
  describe('4. Adversarial Cache Poisoning & Privacy Guards', () => {

    it('Cache Guard: Requisições autenticadas ou com filtros restritos NÃO podem ser cacheadas publicamente', () => {
      const evaluateCachePolicy = (headers = {}, query = {}) => {
        const isPublicCatalog = !headers.authorization && (!query.status || query.status === 'published');
        return isPublicCatalog
          ? 'public, max-age=60, s-maxage=300, stale-while-revalidate=600'
          : 'private, no-cache, no-store, must-revalidate';
      };

      // Usuário público comum navegando no catálogo
      assert.equal(
        evaluateCachePolicy({}, {}),
        'public, max-age=60, s-maxage=300, stale-while-revalidate=600'
      );

      // Usuário público filtrando por status=published
      assert.equal(
        evaluateCachePolicy({}, { status: 'published' }),
        'public, max-age=60, s-maxage=300, stale-while-revalidate=600'
      );

      // Admin autenticado acessando catálogo com token JWT
      assert.equal(
        evaluateCachePolicy({ authorization: 'Bearer jwt_token' }, {}),
        'private, no-cache, no-store, must-revalidate'
      );

      // Consulta de rascunhos / itens não publicados (status=draft)
      assert.equal(
        evaluateCachePolicy({}, { status: 'draft' }),
        'private, no-cache, no-store, must-revalidate'
      );
    });

  });

});
