import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeImageUrl, normalizeProduct, normalizeBrand, isProductPublished } from '../../src/utils/imageUrl.js';

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
});
