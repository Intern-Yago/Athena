import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { 
  COMMERCIAL_MODES, 
  getCommercialMode, 
  shouldShowPrice, 
  canCheckout, 
  getCommercialBadge,
  buildProductWhatsAppMessage,
  buildCartWhatsAppMessage
} from '../../src/utils/commercialPolicy.js';
import { normalizeProduct } from '../../src/utils/imageUrl.js';

describe('Athena Commercial Policy — Unit & Security Guard Suite', () => {

  describe('1. commercialPolicy.js Contract & Default Safety', () => {
    it('deve usar variable_tax como fallback para produtos sem modalidade', () => {
      assert.equal(getCommercialMode(null), 'variable_tax');
      assert.equal(getCommercialMode({}), 'variable_tax');
      assert.equal(getCommercialMode({ commercial_mode: 'modo_invalido' }), 'variable_tax');
      assert.equal(getCommercialMode({ commercialMode: 'direct_sale' }), 'direct_sale');
      assert.equal(getCommercialMode({ commercial_mode: 'technical_consultative' }), 'technical_consultative');
    });

    it('deve ocultar preço por padrão em variable_tax e technical_consultative', () => {
      const prodVarTax = { commercial_mode: 'variable_tax', price: 1500 };
      assert.equal(shouldShowPrice(prodVarTax), false, 'Preço deve ser oculto por padrão em variable_tax');

      const prodTech = { commercial_mode: 'technical_consultative', price: 25000 };
      assert.equal(shouldShowPrice(prodTech), false, 'Preço deve ser oculto por padrão em technical_consultative');

      // Exibição liberada apenas se is_price_visible for explicitamente true
      const prodVarTaxVisible = { commercial_mode: 'variable_tax', price: 1500, is_price_visible: true };
      assert.equal(shouldShowPrice(prodVarTaxVisible), true);

      const prodTechVisible = { commercial_mode: 'technical_consultative', price: 25000, isPriceVisible: true };
      assert.equal(shouldShowPrice(prodTechVisible), true);
    });

    it('deve exibir preço em direct_sale se e somente se price > 0', () => {
      assert.equal(shouldShowPrice({ commercial_mode: 'direct_sale', price: 250 }), true);
      assert.equal(shouldShowPrice({ commercial_mode: 'direct_sale', price: 0 }), false);
      assert.equal(shouldShowPrice({ commercial_mode: 'direct_sale', price: null }), false);
    });

    it('canCheckout deve autorizar APENAS direct_sale com price > 0', () => {
      assert.equal(canCheckout({ commercial_mode: 'direct_sale', price: 300 }), true);
      assert.equal(canCheckout({ commercial_mode: 'direct_sale', price: 0 }), false);
      assert.equal(canCheckout({ commercial_mode: 'variable_tax', price: 1500, is_price_visible: true }), false);
      assert.equal(canCheckout({ commercial_mode: 'technical_consultative', price: 50000, is_price_visible: true }), false);
    });

    it('getCommercialBadge: deve retornar badges informativos sem termo "Pronta Entrega"', () => {
      const bVar = getCommercialBadge({ commercial_mode: 'variable_tax' });
      assert.equal(bVar?.label, 'Valores no WhatsApp');

      const bTech = getCommercialBadge({ commercial_mode: 'technical_consultative' });
      assert.equal(bTech?.label, 'Consulte no WhatsApp');

      const bDirect = getCommercialBadge({ commercial_mode: 'direct_sale' });
      assert.equal(bDirect, null, 'Venda direta não deve ter badge intrusivo nem "Pronta Entrega"');
    });

    it('WhatsApp: mensagens devem ser estritamente texto plano com ZERO emojis', () => {
      const msgConsultative = decodeURIComponent(buildProductWhatsAppMessage({
        product: { name: 'Elevador 4T', sku: 'EL-4000', commercial_mode: 'technical_consultative', price: 35000 },
        brand: { name: 'Engecass' },
        category: { name: 'Elevadores' },
        shipping: { cep: '71200-010', addressInfo: 'Brasília - DF', price: 650, delivery_time: 3, company: { name: 'Braspress' }, name: 'Rodoviário' }
      }));

      // Verificação de ausência de emojis
      const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
      assert.equal(emojiRegex.test(msgConsultative), false, 'Mensagem não pode conter emojis');

      // Modalidade consultiva não deve conter o preço de referência
      assert.equal(msgConsultative.includes('35.000'), false, 'Mensagem consultiva não pode citar preço de referência');
      assert.equal(msgConsultative.includes('Braspress'), true);
      assert.equal(msgConsultative.includes('71200-010'), true);
      assert.equal(msgConsultative.includes('3 dias úteis'), true);
    });

    it('WhatsApp Carrinho: deve montar cotação múltipla sem emojis', () => {
      const cartUrl = buildCartWhatsAppMessage({
        cartItems: [
          { name: 'Scanner Raven 3', sku: '108001', commercial_mode: 'variable_tax', price: 8900, quantity: 1 },
          { name: 'Cabo OBD', sku: '108002', commercial_mode: 'direct_sale', price: 450, quantity: 2 }
        ],
        shipping: { cep: '71200-010', price: 50, delivery_time: 1, company: { name: 'Sedex' } }
      });

      const decoded = decodeURIComponent(cartUrl);
      const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
      assert.equal(emojiRegex.test(decoded), false, 'Carrinho não pode conter emojis');
      assert.equal(decoded.includes('1 dia útil'), true);
      assert.equal(decoded.includes('Cotação Consultiva'), true);
    });
  });

  describe('2. normalizeProduct Frontend Contract', () => {
    it('deve normalizar commercialMode e isPriceVisible a partir de snake_case ou camelCase', () => {
      const rawApiProduct = {
        id: 'prod_test_01',
        name: 'Equipamento Teste',
        commercial_mode: 'technical_consultative',
        is_price_visible: true
      };

      const normalized = normalizeProduct(rawApiProduct);
      assert.equal(normalized.commercialMode, 'technical_consultative');
      assert.equal(normalized.commercial_mode, 'technical_consultative');
      assert.equal(normalized.isPriceVisible, true);
      assert.equal(normalized.is_price_visible, true);
    });
  });

  describe('3. Backend Charge Route Logic (Simulação com Mock de Banco e Gateway)', () => {
    // Simula a validação exata executada em POST /api/payments/charge
    function validateChargeItemsAgainstDb(items, dbProducts) {
      if (!Array.isArray(items) || items.length === 0) {
        return { valid: false, status: 400, error: 'Lista de equipamentos/itens vazia.' };
      }

      for (const item of items) {
        const pId = item.id || item.productId;
        const dbProd = dbProducts.find(p => p.id === pId);

        if (!dbProd) {
          return { valid: false, status: 400, error: `Equipamento não localizado no catálogo oficial: ${pId}` };
        }

        const commMode = dbProd.commercial_mode || dbProd.commercialMode || 'variable_tax';
        if (commMode !== 'direct_sale') {
          return {
            valid: false,
            status: 400,
            error: `O produto "${dbProd.name || pId}" está em modalidade consultiva (${commMode}) e não permite pagamento direto online. Solicite cotação via WhatsApp.`
          };
        }

        let unitPrice = Number(dbProd.price || 0);
        if (item.variantSku && Array.isArray(dbProd.variants)) {
          const v = dbProd.variants.find(va => va.sku === item.variantSku);
          if (v && Number(v.price) > 0) unitPrice = Number(v.price);
        }

        if (unitPrice <= 0) {
          return {
            valid: false,
            status: 400,
            error: `O produto "${dbProd.name || pId}" não possui preço válido cadastrado no catálogo.`
          };
        }

        // Trava Inviolável 3: Validação estrita de quantidade por item (inteiro positivo seguro entre 1 e 100)
        const rawQty = item.quantity;
        let qty = NaN;
        if (typeof rawQty === 'number') {
          qty = Number.isSafeInteger(rawQty) ? rawQty : NaN;
        } else if (typeof rawQty === 'string') {
          const trimmed = rawQty.trim();
          if (/^[1-9]\d*$/.test(trimmed)) {
            const parsedNum = Number(trimmed);
            qty = Number.isSafeInteger(parsedNum) ? parsedNum : NaN;
          }
        }
        const MAX_QUANTITY_PER_ITEM = 100;

        if (isNaN(qty) || qty < 1 || qty > MAX_QUANTITY_PER_ITEM) {
          return {
            valid: false,
            status: 400,
            error: `Quantidade inválida para o produto "${dbProd.name || pId}". A quantidade deve ser um número inteiro positivo seguro entre 1 e ${MAX_QUANTITY_PER_ITEM}.`
          };
        }
      }

      return { valid: true };
    }

    const mockDbProducts = [
      { id: 'prod_direct', name: 'Chave de Fenda', price: 50.00, commercial_mode: 'direct_sale' },
      { id: 'prod_var_tax', name: 'Scanner Automotivo', price: 7500.00, commercial_mode: 'variable_tax' },
      { id: 'prod_heavy', name: 'Elevador 4T', price: 28000.00, commercial_mode: 'technical_consultative' },
      { id: 'prod_zero_price', name: 'Produto Sem Preço', price: 0, commercial_mode: 'direct_sale' },
      { 
        id: 'prod_variant_price', 
        name: 'Camisa Oficina', 
        price: 0, 
        commercial_mode: 'direct_sale',
        variants: [{ sku: 'VAR-P', price: 89.90 }, { sku: 'VAR-M', price: 0 }]
      }
    ];

    it('deve rejeitar compra de produto em variable_tax com 400', () => {
      const res = validateChargeItemsAgainstDb([{ id: 'prod_var_tax', quantity: 1 }], mockDbProducts);
      assert.equal(res.valid, false);
      assert.equal(res.status, 400);
      assert.match(res.error, /modalidade consultiva/);
    });

    it('deve rejeitar compra de produto em technical_consultative com 400', () => {
      const res = validateChargeItemsAgainstDb([{ id: 'prod_heavy', quantity: 1 }], mockDbProducts);
      assert.equal(res.valid, false);
      assert.equal(res.status, 400);
      assert.match(res.error, /modalidade consultiva/);
    });

    it('deve rejeitar compra de produto com price <= 0 lido do banco', () => {
      const res = validateChargeItemsAgainstDb([{ id: 'prod_zero_price', quantity: 1 }], mockDbProducts);
      assert.equal(res.valid, false);
      assert.equal(res.status, 400);
      assert.match(res.error, /não possui preço válido/);
    });

    it('deve rejeitar compra de produto inexistente no banco com 400', () => {
      const res = validateChargeItemsAgainstDb([{ id: 'prod_fantasma', quantity: 1 }], mockDbProducts);
      assert.equal(res.valid, false);
      assert.equal(res.status, 400);
      assert.match(res.error, /não localizado no catálogo/);
    });

    it('deve aprovar compra quando produto pai tem price=0 mas variante selecionada tem price > 0', () => {
      const res = validateChargeItemsAgainstDb([{ id: 'prod_variant_price', variantSku: 'VAR-P', quantity: 1 }], mockDbProducts);
      assert.equal(res.valid, true);
    });

    it('deve rejeitar compra quando variante selecionada tem price <= 0', () => {
      const res = validateChargeItemsAgainstDb([{ id: 'prod_variant_price', variantSku: 'VAR-M', quantity: 1 }], mockDbProducts);
      assert.equal(res.valid, false);
      assert.equal(res.status, 400);
      assert.match(res.error, /não possui preço válido/);
    });

    it('deve aprovar compra apenas quando 100% dos itens são direct_sale válidos', () => {
      const res = validateChargeItemsAgainstDb([
        { id: 'prod_direct', quantity: 2 },
        { id: 'prod_variant_price', variantSku: 'VAR-P', quantity: 1 }
      ], mockDbProducts);
      assert.equal(res.valid, true);
    });

    it('em carrinho misto, deve rejeitar checkout online devido ao item consultivo', () => {
      const res = validateChargeItemsAgainstDb([
        { id: 'prod_direct', quantity: 1 },
        { id: 'prod_heavy', quantity: 1 }
      ], mockDbProducts);
      assert.equal(res.valid, false);
      assert.equal(res.status, 400);
      assert.match(res.error, /modalidade consultiva/);
    });

    describe('Validação Estrita de Quantidades no Checkout Online', () => {
      it('deve rejeitar ausência do campo quantity (undefined) com 400', () => {
        const res = validateChargeItemsAgainstDb([{ id: 'prod_direct' }], mockDbProducts);
        assert.equal(res.valid, false);
        assert.equal(res.status, 400);
        assert.match(res.error, /Quantidade inválida/);
      });

      it('deve rejeitar quantity explicitamente nulo com 400', () => {
        const res = validateChargeItemsAgainstDb([{ id: 'prod_direct', quantity: null }], mockDbProducts);
        assert.equal(res.valid, false);
        assert.equal(res.status, 400);
        assert.match(res.error, /Quantidade inválida/);
      });

      it('deve rejeitar quantidade zero (0) com 400', () => {
        const res = validateChargeItemsAgainstDb([{ id: 'prod_direct', quantity: 0 }], mockDbProducts);
        assert.equal(res.valid, false);
        assert.equal(res.status, 400);
        assert.match(res.error, /Quantidade inválida/);
      });

      it('deve rejeitar quantidade negativa (-3) com 400', () => {
        const res = validateChargeItemsAgainstDb([{ id: 'prod_direct', quantity: -3 }], mockDbProducts);
        assert.equal(res.valid, false);
        assert.equal(res.status, 400);
        assert.match(res.error, /Quantidade inválida/);
      });

      it('deve rejeitar quantidade decimal numérica (1.5) com 400', () => {
        const res = validateChargeItemsAgainstDb([{ id: 'prod_direct', quantity: 1.5 }], mockDbProducts);
        assert.equal(res.valid, false);
        assert.equal(res.status, 400);
        assert.match(res.error, /Quantidade inválida/);
      });

      it('deve rejeitar quantidade decimal em string ("2.5") com 400', () => {
        const res = validateChargeItemsAgainstDb([{ id: 'prod_direct', quantity: '2.5' }], mockDbProducts);
        assert.equal(res.valid, false);
        assert.equal(res.status, 400);
        assert.match(res.error, /Quantidade inválida/);
      });

      it('deve rejeitar string com sufixo alfanumérico que parseInt aceitaria ("10abc") com 400', () => {
        const res = validateChargeItemsAgainstDb([{ id: 'prod_direct', quantity: '10abc' }], mockDbProducts);
        assert.equal(res.valid, false);
        assert.equal(res.status, 400);
        assert.match(res.error, /Quantidade inválida/);
      });

      it('deve rejeitar quantidade NaN com 400', () => {
        const res = validateChargeItemsAgainstDb([{ id: 'prod_direct', quantity: NaN }], mockDbProducts);
        assert.equal(res.valid, false);
        assert.equal(res.status, 400);
        assert.match(res.error, /Quantidade inválida/);
      });

      it('deve rejeitar quantidade com string inválida ("abc", "") com 400', () => {
        const res1 = validateChargeItemsAgainstDb([{ id: 'prod_direct', quantity: 'abc' }], mockDbProducts);
        assert.equal(res1.valid, false);
        assert.equal(res1.status, 400);
        assert.match(res1.error, /Quantidade inválida/);

        const res2 = validateChargeItemsAgainstDb([{ id: 'prod_direct', quantity: '' }], mockDbProducts);
        assert.equal(res2.valid, false);
        assert.equal(res2.status, 400);
        assert.match(res2.error, /Quantidade inválida/);
      });

      it('deve rejeitar números extremamente grandes e fora de MAX_SAFE_INTEGER com 400', () => {
        const resExtreme = validateChargeItemsAgainstDb([{ id: 'prod_direct', quantity: 1e20 }], mockDbProducts);
        assert.equal(resExtreme.valid, false);
        assert.equal(resExtreme.status, 400);
        assert.match(resExtreme.error, /Quantidade inválida/);

        const resUnsafe = validateChargeItemsAgainstDb([{ id: 'prod_direct', quantity: Number.MAX_SAFE_INTEGER + 1 }], mockDbProducts);
        assert.equal(resUnsafe.valid, false);
        assert.equal(resUnsafe.status, 400);
        assert.match(resUnsafe.error, /Quantidade inválida/);

        const resBigString = validateChargeItemsAgainstDb([{ id: 'prod_direct', quantity: '999999999999999999999999' }], mockDbProducts);
        assert.equal(resBigString.valid, false);
        assert.equal(resBigString.status, 400);
        assert.match(resBigString.error, /Quantidade inválida/);
      });

      it('deve rejeitar tipos inválidos como booleano ou array com 400', () => {
        const resBool = validateChargeItemsAgainstDb([{ id: 'prod_direct', quantity: true }], mockDbProducts);
        assert.equal(resBool.valid, false);
        assert.equal(resBool.status, 400);
        assert.match(resBool.error, /Quantidade inválida/);

        const resArr = validateChargeItemsAgainstDb([{ id: 'prod_direct', quantity: [2] }], mockDbProducts);
        assert.equal(resArr.valid, false);
        assert.equal(resArr.status, 400);
        assert.match(resArr.error, /Quantidade inválida/);
      });

      it('deve rejeitar quantidade acima do limite máximo de 100 com 400', () => {
        const res = validateChargeItemsAgainstDb([{ id: 'prod_direct', quantity: 101 }], mockDbProducts);
        assert.equal(res.valid, false);
        assert.equal(res.status, 400);
        assert.match(res.error, /Quantidade inválida/);
      });

      it('deve aprovar quantidades válidas no limite (100) e inteiros positivos', () => {
        const resLimit = validateChargeItemsAgainstDb([{ id: 'prod_direct', quantity: 100 }], mockDbProducts);
        assert.equal(resLimit.valid, true);

        const resStringInt = validateChargeItemsAgainstDb([{ id: 'prod_direct', quantity: '5' }], mockDbProducts);
        assert.equal(resStringInt.valid, true);

        const resUnit = validateChargeItemsAgainstDb([{ id: 'prod_direct', quantity: 1 }], mockDbProducts);
        assert.equal(resUnit.valid, true);
      });
    });
  });

  describe('4. Admin Coherence & Validation Guard (Correction 1)', () => {
    // Simula a lógica de recepção do Admin PUT/POST em backend/server.js
    function processAdminProductPayload(body, existingDbProduct = null) {
      const VALID_MODES = ['direct_sale', 'variable_tax', 'technical_consultative'];
      let incomingCommercialMode = null;

      if (body.commercialMode !== undefined || body.commercial_mode !== undefined) {
        const rawMode = body.commercialMode !== undefined ? body.commercialMode : body.commercial_mode;
        if (rawMode != null) {
          if (!VALID_MODES.includes(rawMode)) {
            return { error: `commercial_mode inválido: "${rawMode}"`, status: 400 };
          }
          incomingCommercialMode = rawMode;
        }
      }

      // Preservação de valor existente se omitido no payload
      const effectiveMode = incomingCommercialMode !== null 
        ? incomingCommercialMode 
        : (existingDbProduct ? existingDbProduct.commercial_mode : 'variable_tax');

      const derivedPriceNegotiable = (effectiveMode !== 'direct_sale');

      return {
        effectiveMode,
        derivedPriceNegotiable,
        status: 200
      };
    }

    it('deve rejeitar commercialMode inválido com 400', () => {
      const res = processAdminProductPayload({ commercialMode: 'modo_inexistente' });
      assert.equal(res.status, 400);
      assert.match(res.error, /inválido/);
    });

    it('PUT sem os campos novos não pode alterar a modalidade atual do banco', () => {
      const existingProduct = { id: 'p1', commercial_mode: 'technical_consultative', price_negotiable: true };
      
      // Requisição legada de edição sem commercialMode nem isPriceVisible
      const updatePayload = { name: 'Novo Nome do Elevador', price: 32000 };
      
      const res = processAdminProductPayload(updatePayload, existingProduct);
      assert.equal(res.status, 200);
      assert.equal(res.effectiveMode, 'technical_consultative', 'Modalidade atual do banco deve ser rigorosamente preservada');
      assert.equal(res.derivedPriceNegotiable, true);
    });

    it('ao definir direct_sale, price_negotiable deve ser false', () => {
      const res = processAdminProductPayload({ commercialMode: 'direct_sale' });
      assert.equal(res.status, 200);
      assert.equal(res.effectiveMode, 'direct_sale');
      assert.equal(res.derivedPriceNegotiable, false);
    });

    it('ao definir variable_tax, price_negotiable deve ser true', () => {
      const res = processAdminProductPayload({ commercialMode: 'variable_tax' });
      assert.equal(res.status, 200);
      assert.equal(res.effectiveMode, 'variable_tax');
      assert.equal(res.derivedPriceNegotiable, true);
    });
  });

});
