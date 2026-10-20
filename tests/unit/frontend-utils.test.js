import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeImageUrl, normalizeProduct, normalizeBrand, isProductPublished } from '../../src/utils/imageUrl.js';
import {
  decodeHtmlEntities,
  getMacroRegionByState,
  resolveOrderOrigin,
  matchesShipmentFilters
} from '../../src/utils/orderUtils.js';
import {
  ADMIN_CACHE_KEYS,
  getCachedAdminData,
  setCachedAdminData,
  invalidateAdminCache
} from '../../src/utils/adminDataCache.js';
import { isStaffAnalyticsBlocked } from '../../src/utils/metaPixel.js';

describe('Frontend Utils: Image & Product Normalization (imageUrl.js)', () => {
  it('should rewrite legacy R2 dev URLs to the fast custom CDN domain', () => {
    const rawR2 = 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/products/scanner.webp';
    const normalized = normalizeImageUrl(rawR2);
    assert.strictEqual(normalized, 'https://images.athenaconsultoria.com.br/products/scanner.webp');
  });

  it('should leave external image URLs untouched', () => {
    const external = 'https://cdn.example.com/logo.png';
    assert.strictEqual(normalizeImageUrl(external), external);
  });

  it('should normalize product main image, image arrays and 3D assets', () => {
    const rawProduct = {
      id: 'prod_123',
      name: 'Elevador Hidráulico',
      image: 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/elevador.webp',
      images: [
        'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/foto1.webp',
        'https://external.com/foto2.jpg'
      ],
      model3d: {
        glb: 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/3d/elevador.glb'
      }
    };

    const normalized = normalizeProduct(rawProduct);
    assert.strictEqual(normalized.image, 'https://images.athenaconsultoria.com.br/elevador.webp');
    assert.strictEqual(normalized.images[0], 'https://images.athenaconsultoria.com.br/foto1.webp');
    assert.strictEqual(normalized.images[1], 'https://external.com/foto2.jpg');
    assert.strictEqual(normalized.model3d.glb, 'https://images.athenaconsultoria.com.br/3d/elevador.glb');
  });

  it('should normalize brand logos', () => {
    const brand = {
      id: 'b1',
      name: 'Mahovi',
      logo: 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/mahovi.png'
    };
    const normalized = normalizeBrand(brand);
    assert.strictEqual(normalized.logo, 'https://images.athenaconsultoria.com.br/mahovi.png');
  });

  it('should accurately determine published vs draft/hidden product status', () => {
    assert.strictEqual(isProductPublished({ status: 'published' }), true);
    assert.strictEqual(isProductPublished({ status: 'publicado' }), true);
    assert.strictEqual(isProductPublished({ status: 'draft' }), false);
    assert.strictEqual(isProductPublished({ status: 'rascunho' }), false);
    assert.strictEqual(isProductPublished({ status: 'hidden' }), false);
    assert.strictEqual(isProductPublished({ status: 'oculto' }), false);
    assert.strictEqual(isProductPublished(null), false);
  });

  it('should strictly normalize priceNegotiable to ensure Sob Consulta safety', () => {
    // Both undefined -> Sob Consulta (true)
    const p1 = normalizeProduct({ id: 'p1', name: 'Teste' });
    assert.strictEqual(p1.priceNegotiable, true);
    assert.strictEqual(p1.price_negotiable, true);

    // price_negotiable from Postgres (true) but priceNegotiable missing -> true
    const p2 = normalizeProduct({ id: 'p2', name: 'Teste', price_negotiable: true });
    assert.strictEqual(p2.priceNegotiable, true);
    assert.strictEqual(p2.price_negotiable, true);

    // Explicitly false in both -> false (authorized for online buy)
    const p3 = normalizeProduct({ id: 'p3', name: 'Teste', priceNegotiable: false, price_negotiable: false });
    assert.strictEqual(p3.priceNegotiable, false);
    assert.strictEqual(p3.price_negotiable, false);

    // Conflict where one is true -> true (safe quote-only fallback)
    const p4 = normalizeProduct({ id: 'p4', name: 'Teste', priceNegotiable: false, price_negotiable: true });
    assert.strictEqual(p4.priceNegotiable, true);
    assert.strictEqual(p4.price_negotiable, true);
  });
});

describe('Frontend Utils: Order & Fulfillment Domain Utilities (orderUtils.js)', () => {
  it('should decode HTML entities in item names', () => {
    assert.strictEqual(decodeHtmlEntities('ALICATE UNIVERSAL 8&quot;'), 'ALICATE UNIVERSAL 8"');
    assert.strictEqual(decodeHtmlEntities('KIT CHAVE &amp; SOQUETE &#39;PRO&#39;'), "KIT CHAVE & SOQUETE 'PRO'");
  });

  it('should map Brazilian state UF to macro-regions accurately', () => {
    assert.strictEqual(getMacroRegionByState('DF'), 'Centro-Oeste');
    assert.strictEqual(getMacroRegionByState('SP'), 'Sudeste');
    assert.strictEqual(getMacroRegionByState('PR'), 'Sul');
    assert.strictEqual(getMacroRegionByState('BA'), 'Nordeste');
    assert.strictEqual(getMacroRegionByState('AM'), 'Norte');
  });

  it('should differentiate Site orders (even when synced to Omie) from native Omie ERP orders', () => {
    const nativeOmieOrder = {
      id: 'ord_omie_123456',
      order_number: 'OMIE-124',
      omie_pedido_id: '123456'
    };
    const origOmie = resolveOrderOrigin(nativeOmieOrder);
    assert.strictEqual(origOmie.originKey, 'omie');
    assert.strictEqual(origOmie.isSyncedWithOmie, true);
    assert.strictEqual(origOmie.omieRef, '123456');

    const siteOrderSyncedToOmie = {
      id: 'ord_998877',
      order_number: 'ATH-2026-0042',
      omie_pedido_id: '654321'
    };
    const origSite = resolveOrderOrigin(siteOrderSyncedToOmie);
    assert.strictEqual(origSite.originKey, 'site');
    assert.strictEqual(origSite.isSyncedWithOmie, true);
    assert.strictEqual(origSite.omieRef, '654321');
  });

  it('should filter shipments by search, status, origin, items volume and region', () => {
    const rawShipment = {
      id: 'shp_omie_124',
      order_id: 'ord_omie_124',
      order_number: 'OMIE-124',
      customer_snapshot: { name: 'LIDIANE GUIMARAES AMORIM' },
      status: 'pending',
      shipping_address: { city: 'BRASILIA (DF)', state: 'DF', zip: '70000-000' },
      items: Array.from({ length: 18 }, (_, i) => ({ name: `Item ${i + 1}`, quantity: 1 }))
    };
    const sampleShipment = {
      ...rawShipment,
      _statusKey: 'pending',
      _origin: resolveOrderOrigin(rawShipment),
      _itemCount: rawShipment.items.length,
      _stateUf: 'DF',
      _macroRegion: getMacroRegionByState('DF')
    };

    assert.strictEqual(
      matchesShipmentFilters(sampleShipment, { searchQuery: '#omie-124' }),
      true
    );
    assert.strictEqual(
      matchesShipmentFilters(sampleShipment, {
        originFilter: 'omie',
        itemsFilter: '16+',
        regionFilter: 'macro:Centro-Oeste'
      }),
      true
    );
    assert.strictEqual(
      matchesShipmentFilters(sampleShipment, { originFilter: 'site' }),
      false
    );
    assert.strictEqual(
      matchesShipmentFilters(sampleShipment, { itemsFilter: '1' }),
      false
    );
  });

  it('should store, retrieve and invalidate operational data in adminDataCache (SWR)', () => {
    const sampleKanban = {
      pending: [{ id: 'shp_1', order_number: 'OMIE-124' }],
      picking: [],
      ready: [],
      shipped: [],
      delivered: []
    };

    setCachedAdminData(ADMIN_CACHE_KEYS.FULFILLMENT_KANBAN, sampleKanban);
    const cached = getCachedAdminData(ADMIN_CACHE_KEYS.FULFILLMENT_KANBAN);
    assert.ok(cached);
    assert.strictEqual(cached.isFresh, true);
    assert.strictEqual(cached.data.pending.length, 1);

    invalidateAdminCache(ADMIN_CACHE_KEYS.FULFILLMENT_KANBAN);
    assert.strictEqual(getCachedAdminData(ADMIN_CACHE_KEYS.FULFILLMENT_KANBAN), null);
  });

  it('should block analytics for Staff (admin/vendedor) while keeping analytics active for Customers (cliente)', () => {
    const store = new Map();
    globalThis.window = {
      location: { pathname: '/produto/elevador-hidraulico' },
      localStorage: {
        getItem: (k) => store.get(k) || null,
        setItem: (k, v) => store.set(k, v)
      }
    };

    // Visitante anônimo -> rastreia normalmente (false = não bloqueado)
    assert.strictEqual(isStaffAnalyticsBlocked(), false);

    // Cliente logado -> rastreia normalmente (false = não bloqueado)
    store.set('athena_user', JSON.stringify({ id: 'u1', role: 'cliente', name: 'Oficina Cliente' }));
    assert.strictEqual(isStaffAnalyticsBlocked(), false);

    // Admin logado -> bloqueado (true)
    store.set('athena_user', JSON.stringify({ id: 'u2', role: 'admin', name: 'Yago Admin' }));
    assert.strictEqual(isStaffAnalyticsBlocked(), true);

    // Vendedor logado -> bloqueado (true)
    store.set('athena_user', JSON.stringify({ id: 'u3', role: 'vendedor', name: 'Vendedor Athena' }));
    assert.strictEqual(isStaffAnalyticsBlocked(), true);

    delete globalThis.window;
  });
});
