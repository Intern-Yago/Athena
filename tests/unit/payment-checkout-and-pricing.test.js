import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getDiscountPercentage } from '../../src/utils/commercialPolicy.js';
import { normalizeProduct } from '../../src/utils/imageUrl.js';
import { calculateInstallments, getAsaasCreditCardTotalRate, calculatePaymentGateways } from '../../src/utils/installmentCalculator.js';

describe('Pacote C — Checkout Transparente Asaas, Precificação Black Friday & De/Por', () => {

  describe('1. Regra de Desconto Black Friday (getDiscountPercentage)', () => {
    it('deve calcular corretamente a porcentagem inteira de desconto quando originalPrice > price', () => {
      // De 1000 por 850 -> 15% OFF
      assert.equal(getDiscountPercentage(850, 1000), 15);
      // De 200 por 100 -> 50% OFF
      assert.equal(getDiscountPercentage(100, 200), 50);
      // De 500 por 449 -> 10.2% -> 10%
      assert.equal(getDiscountPercentage(449, 500), 10);
    });

    it('deve retornar null se originalPrice for menor ou igual ao price (sem desconto real)', () => {
      assert.equal(getDiscountPercentage(1000, 1000), null);
      assert.equal(getDiscountPercentage(1200, 1000), null);
    });

    it('deve retornar null se valores forem nulos, zerados, negativos ou strings inválidas', () => {
      assert.equal(getDiscountPercentage(null, 1000), null);
      assert.equal(getDiscountPercentage(500, null), null);
      assert.equal(getDiscountPercentage(0, 1000), null);
      assert.equal(getDiscountPercentage(500, 0), null);
      assert.equal(getDiscountPercentage('abc', 1000), null);
      assert.equal(getDiscountPercentage(500, 'xyz'), null);
      assert.equal(getDiscountPercentage(undefined, undefined), null);
    });

    it('deve aceitar strings numéricas válidas e calcular corretamente', () => {
      assert.equal(getDiscountPercentage('750', '1000'), 25);
      assert.equal(getDiscountPercentage(750, '1000'), 25);
    });
  });

  describe('2. normalizeProduct — originalPrice e warrantyMonths', () => {
    it('deve normalizar originalPrice a partir de snake_case ou camelCase', () => {
      const p1 = normalizeProduct({ id: 'p1', original_price: '599.90', price: 499.90 });
      assert.equal(p1.originalPrice, 599.90);
      assert.equal(p1.original_price, 599.90);

      const p2 = normalizeProduct({ id: 'p2', originalPrice: 800, price: 650 });
      assert.equal(p2.originalPrice, 800);
      assert.equal(p2.original_price, 800);
    });

    it('deve normalizar warrantyMonths a partir de snake_case ou camelCase', () => {
      const p1 = normalizeProduct({ id: 'p1', warranty_months: 12 });
      assert.equal(p1.warrantyMonths, 12);
      assert.equal(p1.warranty_months, 12);

      const p2 = normalizeProduct({ id: 'p2', warrantyMonths: 24 });
      assert.equal(p2.warrantyMonths, 24);
      assert.equal(p2.warranty_months, 24);
    });
  });

  describe('3. Parcelamento Asaas no Cartão de Crédito até 12x', () => {
    it('deve calcular até 12 parcelas com taxas MDR e antecipação estritas', () => {
      const list = calculateInstallments(1000, 12);
      assert.equal(list.length, 12);

      // Parcela 1x (à vista)
      assert.equal(list[0].installments, 1);
      assert.ok(list[0].totalValue >= 1000);

      // Parcela 12x
      const p12 = list[11];
      assert.equal(p12.installments, 12);
      assert.ok(p12.installmentValue > 0);
      assert.ok(p12.totalValue > 1000);
      assert.equal(p12.isBestValue, true);
    });

    it('taxa de antecipação e MDR deve crescer monotonicamente com o número de parcelas', () => {
      let previousRate = 0;
      for (let i = 1; i <= 12; i++) {
        const rate = getAsaasCreditCardTotalRate(i);
        assert.ok(rate > previousRate, `Taxa de ${i}x deve ser maior que ${i - 1}x`);
        previousRate = rate;
      }
    });

    it('calculatePaymentGateways deve fornecer simulação com PIX, Boleto, Débito e Crédito', () => {
      const gateways = calculatePaymentGateways(600);
      assert.ok(gateways.pix.customerAmount > 0);
      assert.ok(gateways.credit.installments.length === 12);
      assert.equal(gateways.credit.netReceivedAtSight, 600);
    });
  });

  describe('4. Validação de Documento e Estoque no Checkout (Simulação de Regras)', () => {
    function validateCheckoutDocument(doc) {
      const cleanDoc = (doc || '').replace(/[^0-9a-zA-Z]/g, '').toUpperCase();
      const numericDocOnly = cleanDoc.replace(/\D/g, '');
      if (numericDocOnly.length !== 11 && numericDocOnly.length !== 14) {
        return { valid: false, error: 'Documento fiscal inválido. Informe um CPF válido com 11 dígitos ou CNPJ com 14 dígitos.' };
      }
      return { valid: true, doc: cleanDoc };
    }

    it('deve aprovar CPF com 11 dígitos numéricos', () => {
      const res = validateCheckoutDocument('123.456.789-01');
      assert.equal(res.valid, true);
      assert.equal(res.doc, '12345678901');
    });

    it('deve aprovar CNPJ com 14 dígitos numéricos', () => {
      const res = validateCheckoutDocument('12.345.678/0001-90');
      assert.equal(res.valid, true);
      assert.equal(res.doc, '12345678000190');
    });

    it('deve rejeitar documentos com tamanho incorreto (ex: 9, 10 ou 12 dígitos)', () => {
      assert.equal(validateCheckoutDocument('123456789').valid, false);
      assert.equal(validateCheckoutDocument('1234567890').valid, false);
      assert.equal(validateCheckoutDocument('123456789012').valid, false);
      assert.equal(validateCheckoutDocument('').valid, false);
      assert.equal(validateCheckoutDocument(null).valid, false);
    });

    function validateDirectSaleStock(product) {
      if (product.product_type === 'digital' || product.productType === 'digital') {
        return { available: true };
      }
      const inStockFlag = product.in_stock !== false && product.inStock !== false;
      const stockQty = product.estoque_quantidade != null ? Number(product.estoque_quantidade) : (product.stock != null ? Number(product.stock) : null);
      if (!inStockFlag || (stockQty !== null && stockQty <= 0)) {
        return { available: false, error: 'O produto está temporariamente esgotado para compra direta.' };
      }
      return { available: true };
    }

    it('deve aprovar produto físico com estoque positivo', () => {
      const res = validateDirectSaleStock({ in_stock: true, estoque_quantidade: 5, product_type: 'physical' });
      assert.equal(res.available, true);
    });

    it('deve aprovar produto digital mesmo com estoque zerado', () => {
      const res = validateDirectSaleStock({ in_stock: true, estoque_quantidade: 0, product_type: 'digital' });
      assert.equal(res.available, true);
    });

    it('deve rejeitar produto físico com estoque_quantidade <= 0', () => {
      const res = validateDirectSaleStock({ in_stock: true, estoque_quantidade: 0, product_type: 'physical' });
      assert.equal(res.available, false);
    });

    it('deve rejeitar produto físico com in_stock = false', () => {
      const res = validateDirectSaleStock({ in_stock: false, estoque_quantidade: 10, product_type: 'physical' });
      assert.equal(res.available, false);
    });
  });

});
