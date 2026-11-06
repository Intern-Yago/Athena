import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { 
  calculateShipping, 
  extractDimensionsAndWeight, 
  cleanCep, 
  DEFAULT_ORIGIN_CEP 
} = require('../../backend/services/melhorEnvioService.js');

describe('Melhor Envio Shipping Engine & Freight Quotation', () => {

  it('cleanCep: deve sanitizar e formatar CEP para 8 dígitos numéricos', () => {
    assert.strictEqual(cleanCep('71996-413'), '71996413');
    assert.strictEqual(cleanCep('01001-000'), '01001000');
    assert.strictEqual(cleanCep(' 71.996-413 '), '71996413');
    assert.strictEqual(cleanCep(''), '');
    assert.strictEqual(cleanCep(null), '');
  });

  it('extractDimensionsAndWeight: deve extrair peso e dimensões das specs ou usar defaults seguros', () => {
    // 1. Produto com specs textuais
    const productWithSpecs = {
      name: 'Máquina de Teste de Bicos',
      specs: [
        'Modelo: LB-50000',
        'Peso: 12,5 kg',
        'Dimensões: 45 x 35 x 30 cm'
      ]
    };

    const dim1 = extractDimensionsAndWeight(productWithSpecs);
    assert.strictEqual(dim1.weight, 12.5);
    assert.strictEqual(dim1.length, 45);
    assert.strictEqual(dim1.width, 35);
    assert.strictEqual(dim1.height, 30);

    // 2. Produto sem specs (deve retornar dimensões mínimas válidas para Correios/Jadlog)
    const emptyProduct = {};
    const dim2 = extractDimensionsAndWeight(emptyProduct);
    assert.ok(dim2.weight >= 0.1, 'Peso mínimo seguro');
    assert.ok(dim2.height >= 2, 'Altura mínima aceita pelas transportadoras');
    assert.ok(dim2.width >= 11, 'Largura mínima aceita');
    assert.ok(dim2.length >= 16, 'Comprimento mínimo aceito');
  });

  it('calculateShipping: deve calcular cotação para CEP válido sem estourar exceções', async () => {
    const res = await calculateShipping({
      destinationCep: '01310100', // Avenida Paulista, SP
      products: [
        {
          id: 'test_item_1',
          name: 'Scanner Automotivo',
          weight: 2.0,
          price: 2500,
          quantity: 1
        }
      ]
    });

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.from, DEFAULT_ORIGIN_CEP);
    assert.strictEqual(res.to, '01310100');
    assert.ok(Array.isArray(res.options), 'Deve retornar lista de opções de frete');
    assert.ok(res.options.length > 0, 'Deve conter pelo menos uma transportadora');

    const firstOption = res.options[0];
    assert.ok(typeof firstOption.price === 'number', 'Preço deve ser numérico');
    assert.ok(firstOption.price > 0, 'Preço deve ser positivo');
    assert.ok(firstOption.name, 'Opção deve ter nome de serviço');
    assert.ok(firstOption.company?.name, 'Opção deve identificar transportadora');
    assert.ok(typeof firstOption.delivery_time === 'number', 'Prazo deve ser numérico');
  });

  it('calculateShipping: deve rejeitar CEP inválido com erro amigável', async () => {
    await assert.rejects(
      async () => {
        await calculateShipping({ destinationCep: '123' });
      },
      /CEP de destino inválido/
    );
  });
});
