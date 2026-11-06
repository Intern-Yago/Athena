import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { evaluateCoupon } = require('../../backend/utils/coupons.js');

describe('Business Rules: Coupon Evaluation Engine (evaluateCoupon)', () => {
  const sampleItems = [
    { id: 'prod_1', productId: 'prod_1', price: 100, quantity: 2, priceNegotiable: false }
  ]; // Subtotal: 200

  it('should reject inactive/paused coupons', () => {
    const coupon = { status: 'paused', discountType: 'percentage', discountValue: 10 };
    const res = evaluateCoupon(coupon, sampleItems);
    assert.strictEqual(res.valid, false);
    assert.match(res.error, /pausado ou inativo/i);
  });

  it('should reject expired coupons', () => {
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const coupon = { status: 'active', expiresAt: pastDate, discountType: 'percentage', discountValue: 10 };
    const res = evaluateCoupon(coupon, sampleItems);
    assert.strictEqual(res.valid, false);
    assert.match(res.error, /expirou/i);
  });

  it('should apply percentage discount correctly', () => {
    const coupon = { status: 'active', code: 'PROMO10', discountType: 'percentage', discountValue: 10, maxDiscount: 0 };
    const res = evaluateCoupon(coupon, sampleItems);
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.subtotal, 200);
    assert.strictEqual(res.discountAmount, 20); // 10% of 200
    assert.strictEqual(res.finalPayable, 180);
    assert.strictEqual(res.isFreeOrder, false);
  });

  it('should respect maxDiscount ceiling on percentage coupons', () => {
    const coupon = { status: 'active', code: 'PROMO50', discountType: 'percentage', discountValue: 50, maxDiscount: 30 };
    const res = evaluateCoupon(coupon, sampleItems);
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.discountAmount, 30); // 50% of 200 would be 100, but capped at 30
    assert.strictEqual(res.finalPayable, 170);
  });

  it('should apply fixed discount correctly', () => {
    const coupon = { status: 'active', code: 'FIXED50', discountType: 'fixed', discountValue: 50 };
    const res = evaluateCoupon(coupon, sampleItems);
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.discountAmount, 50);
    assert.strictEqual(res.finalPayable, 150);
  });

  it('should enforce minimum order amount constraint', () => {
    const coupon = { status: 'active', code: 'MIN500', discountType: 'fixed', discountValue: 50, minOrderAmount: 500 };
    const res = evaluateCoupon(coupon, sampleItems); // Subtotal is 200
    assert.strictEqual(res.valid, false);
    assert.match(res.error, /valor mínimo de compra/i);
  });

  it('should enforce customer maximum usage limit', () => {
    const coupon = { 
      status: 'active', 
      code: 'ONCE', 
      discountType: 'fixed', 
      discountValue: 10, 
      maxUsagePerCustomer: 1,
      usedBy: [{ email: 'customer@test.com' }]
    };
    const res = evaluateCoupon(coupon, sampleItems, 'customer@test.com');
    assert.strictEqual(res.valid, false);
    assert.match(res.error, /máximo de vezes permitido/i);
  });

  it('should enforce specific email restriction', () => {
    const coupon = { 
      status: 'active', 
      code: 'VIP_ONLY', 
      discountType: 'fixed', 
      discountValue: 10, 
      customerType: 'specific_email',
      specificEmail: 'vip@athena.com.br'
    };
    const resDenied = evaluateCoupon(coupon, sampleItems, 'other@athena.com.br');
    assert.strictEqual(resDenied.valid, false);
    assert.match(resDenied.error, /exclusivo e intransferível/i);

    const resAllowed = evaluateCoupon(coupon, sampleItems, 'vip@athena.com.br');
    assert.strictEqual(resAllowed.valid, true);
  });

  it('should enforce R$ 5,00 Gateway Rule when discount leaves between R$ 0,01 and R$ 4,99', () => {
    // Cart subtotal: 100
    const items = [{ id: 'p1', price: 100, quantity: 1, priceNegotiable: false }];
    // Discount of 97 leaves payable at R$ 3,00 (below Asaas minimum of R$ 5,00)
    const coupon = { status: 'active', code: 'ALMOST_FREE', discountType: 'fixed', discountValue: 97 };
    const res = evaluateCoupon(coupon, items);
    assert.strictEqual(res.valid, false);
    assert.match(res.error, /R\$ 5,00/i);
  });

  it('should allow 100% discount (finalPayable === 0) for free promotional orders', () => {
    const items = [{ id: 'p1', price: 100, quantity: 1, priceNegotiable: false }];
    const coupon = { status: 'active', code: 'FREE100', discountType: 'percentage', discountValue: 100 };
    const res = evaluateCoupon(coupon, items);
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.finalPayable, 0);
    assert.strictEqual(res.isFreeOrder, true);
  });
});
