import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  extractUrlInterest,
  recordProductInterest,
  recordSearchInterest,
  getUserInterest,
  clearUserInterest,
  findTargetProduct,
  applyPersonalization,
  USER_INTEREST_KEY
} from '../../src/utils/userInterestTracker.js';
import { sortProducts } from '../../src/utils/productSorting.js';

// Mock localStorage for node environment
const mockStorage = new Map();
global.window = {
  location: { search: '' },
  localStorage: {
    getItem: (key) => mockStorage.get(key) || null,
    setItem: (key, val) => mockStorage.set(key, String(val)),
    removeItem: (key) => mockStorage.delete(key),
    clear: () => mockStorage.clear()
  }
};

describe('Catalog Personalization Engine (userInterestTracker & productSorting)', () => {
  beforeEach(() => {
    mockStorage.clear();
    global.window.location.search = '';
  });

  const sampleProducts = [
    { id: 'prod_1', sku: 'SGT-5118', name: 'Politriz Roto Orbital SGT-5118', categoryId: 'cat_politrizes', brandId: 'sigma', isFeatured: true },
    { id: 'prod_2', sku: 'SGT-8116', name: 'Politriz a Bateria SGT-8116', categoryId: 'cat_politrizes', brandId: 'sigma', isFeatured: false },
    { id: 'prod_3', sku: 'MAH-4001', name: 'Elevador Automotivo 4000kg MAH-4001', categoryId: 'cat_elevadores', brandId: 'mahov', isFeatured: false },
    { id: 'prod_4', sku: 'MAH-4002', name: 'Elevador Pantográfico MAH-4002', categoryId: 'cat_elevadores', brandId: 'mahov', isFeatured: true },
    { id: 'prod_5', sku: 'MAH-4003', name: 'Elevador 4 Colunas MAH-4003', categoryId: 'cat_elevadores', brandId: 'mahov', isFeatured: false },
    { id: 'prod_6', sku: 'LAUNCH-X431', name: 'Scanner Automotivo Launch X431', categoryId: 'cat_scanners', brandId: 'launch', isFeatured: true },
    { id: 'prod_7', sku: 'AUTEL-MS906', name: 'Scanner Autel MaxiSys MS906', categoryId: 'cat_scanners', brandId: 'autel', isFeatured: false }
  ];

  it('1. Deve extrair interesse a partir de parâmetros de URL (tag, utm_term, sku)', () => {
    const interestTag = extractUrlInterest('?tag=mah-4001');
    assert.ok(interestTag);
    assert.strictEqual(interestTag.query, 'mah-4001');

    const interestUtm = extractUrlInterest('?utm_source=meta&utm_term=elevador-4001');
    assert.ok(interestUtm);
    assert.strictEqual(interestUtm.query, 'elevador-4001');

    const interestSku = extractUrlInterest('?sku=MAH-4001');
    assert.ok(interestSku);
    assert.strictEqual(interestSku.sku, 'MAH-4001');
  });

  it('2. Deve registrar e recuperar interesse de produto visualizado em localStorage', () => {
    const product = sampleProducts[2]; // MAH-4001
    recordProductInterest(product);

    const stored = getUserInterest();
    assert.ok(stored);
    assert.strictEqual(stored.productId, 'prod_3');
    assert.strictEqual(stored.sku, 'MAH-4001');
    assert.strictEqual(stored.categoryId, 'cat_elevadores');
  });

  it('3. Deve registrar interesse por busca interna', () => {
    recordSearchInterest('elevador mah4001');
    const stored = getUserInterest();
    assert.ok(stored);
    assert.strictEqual(stored.query, 'elevador mah4001');
  });

  it('4. Deve localizar o produto alvo por SKU ou nome com precisão', () => {
    const targetBySku = findTargetProduct(sampleProducts, { sku: 'MAH-4001' });
    assert.ok(targetBySku);
    assert.strictEqual(targetBySku.id, 'prod_3');

    const targetByQuery = findTargetProduct(sampleProducts, { query: 'elevador 4001' });
    assert.ok(targetByQuery);
    assert.strictEqual(targetByQuery.id, 'prod_3');
  });

  it('5. applyPersonalization: deve colocar o alvo em #1, 2 produtos da mesma categoria em #2 e #3, e destaques depois', () => {
    const interest = { sku: 'MAH-4001' };
    const personalized = applyPersonalization(sampleProducts, interest);

    // #1 Alvo principal
    assert.strictEqual(personalized[0].id, 'prod_3', 'Posição 1 deve ser o MAH-4001');

    // #2 e #3 devem ser da mesma categoria (cat_elevadores)
    assert.strictEqual(personalized[1].categoryId, 'cat_elevadores', 'Posição 2 deve ser da categoria cat_elevadores');
    assert.strictEqual(personalized[2].categoryId, 'cat_elevadores', 'Posição 3 deve ser da categoria cat_elevadores');
    assert.notStrictEqual(personalized[1].id, 'prod_3');
    assert.notStrictEqual(personalized[2].id, 'prod_3');

    // Total de produtos deve ser preservado sem duplicações
    assert.strictEqual(personalized.length, sampleProducts.length);
    const uniqueIds = new Set(personalized.map(p => p.id));
    assert.strictEqual(uniqueIds.size, sampleProducts.length);
  });

  it('6. sortProducts: modo "featured" com userInterest deve priorizar o produto de interesse dinamicamente', () => {
    const interest = { query: 'mah-4001' };
    const sorted = sortProducts(sampleProducts, 'featured', 12345, interest);

    assert.strictEqual(sorted[0].sku, 'MAH-4001', 'O produto de interesse deve estar no topo absoluto');
    assert.strictEqual(sorted[1].categoryId, 'cat_elevadores');
    assert.strictEqual(sorted[2].categoryId, 'cat_elevadores');
  });

  it('7. sortProducts: sem interesse, deve manter a ordenação padrão de relevância sem quebrar', () => {
    const sorted = sortProducts(sampleProducts, 'featured', 12345, null);
    assert.ok(sorted.length === sampleProducts.length);
    // Destaques (isFeatured) vêm primeiro no padrão
    assert.ok(Boolean(sorted[0].isFeatured));
  });
});
