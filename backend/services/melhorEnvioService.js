/**
 * melhorEnvioService.js
 * 
 * Integração oficial da Athena Soluções Automotivas com a API v2 do Melhor Envio.
 * Permite cálculo de frete dinâmico para múltiplos transportadores (Correios, Jadlog, Buslog, Loggi, Azul Cargo).
 * 
 * Documentação da API: https://docs.melhorenvio.com.br/
 */

const axios = require('axios');

// CEP padrão de expedição da Athena (Brasília - DF)
const DEFAULT_ORIGIN_CEP = process.env.MELHOR_ENVIO_FROM_CEP || '71996413';

// Configuração de ambiente (Sandbox vs Produção)
const isSandbox = process.env.MELHOR_ENVIO_SANDBOX === 'true' || process.env.MELHOR_ENVIO_ENV === 'sandbox';
const MELHOR_ENVIO_BASE_URL = isSandbox
  ? 'https://sandbox.melhorenvio.com.br'
  : 'https://melhorenvio.com.br';

const MELHOR_ENVIO_TOKEN = process.env.MELHOR_ENVIO_TOKEN || '';

/**
 * Sanitiza e formata CEP para 8 dígitos numéricos
 */
function cleanCep(cep) {
  if (!cep) return '';
  return String(cep).replace(/\D/g, '').slice(0, 8);
}

/**
 * Extrai peso e dimensões (altura, largura, comprimento) de um produto ou de suas specs
 */
function extractDimensionsAndWeight(product = {}) {
  let weight = 1.0; // Padrão: 1 kg
  let height = 15;  // Padrão: 15 cm
  let width = 20;   // Padrão: 20 cm
  let length = 25;  // Padrão: 25 cm

  // 1. Tenta pegar campos diretos se existirem
  if (product.weight && Number(product.weight) > 0) weight = Number(product.weight);
  if (product.height && Number(product.height) > 0) height = Number(product.height);
  if (product.width && Number(product.width) > 0) width = Number(product.width);
  if (product.length && Number(product.length) > 0) length = Number(product.length);

  // 2. Se as specs existirem (array ou objeto), tenta inferir dados reais do equipamento
  const specsList = Array.isArray(product.specs) 
    ? product.specs 
    : (product.specs && typeof product.specs === 'object' ? Object.entries(product.specs).map(([k, v]) => `${k}: ${v}`) : []);

  for (const spec of specsList) {
    const text = String(spec).toLowerCase();
    
    // Procura peso (ex: "Peso: 2,5 kg", "Peso: 800g", "Peso aproximado: 1.2kg")
    if (text.includes('peso')) {
      const matchKg = text.match(/([\d.,]+)\s*kg/);
      if (matchKg) {
        const val = parseFloat(matchKg[1].replace(',', '.'));
        if (!isNaN(val) && val > 0) weight = val;
      } else {
        const matchG = text.match(/([\d.,]+)\s*g\b/);
        if (matchG) {
          const val = parseFloat(matchG[1].replace(',', '.'));
          if (!isNaN(val) && val > 0) weight = val / 1000;
        }
      }
    }

    // Procura dimensões (ex: "30 x 20 x 15 cm", "Dimensões: 400 x 300 x 200 mm")
    if (text.includes('dimens') || text.includes('medidas') || text.includes('tamanho')) {
      const matchCm = text.match(/([\d.,]+)\s*[xX*]\s*([\d.,]+)\s*[xX*]\s*([\d.,]+)\s*cm/);
      if (matchCm) {
        const d1 = parseFloat(matchCm[1].replace(',', '.'));
        const d2 = parseFloat(matchCm[2].replace(',', '.'));
        const d3 = parseFloat(matchCm[3].replace(',', '.'));
        if (!isNaN(d1) && !isNaN(d2) && !isNaN(d3)) {
          height = Math.min(d1, d2, d3);
          length = Math.max(d1, d2, d3);
          width = [d1, d2, d3].sort((a, b) => a - b)[1];
        }
      }
    }
  }

  // Garantir limites mínimos aceitos pelas transportadoras do Melhor Envio
  // Altura mín: 2cm, Largura mín: 11cm, Comprimento mín: 16cm, Peso mín: 0.1kg
  return {
    weight: Math.max(0.1, Number(weight.toFixed(2))),
    height: Math.max(2, Math.round(height)),
    width: Math.max(11, Math.round(width)),
    length: Math.max(16, Math.round(length))
  };
}

/**
 * Simula cotação de contingência caso o token do Melhor Envio ainda não esteja cadastrado no .env
 * ou a API externa esteja temporariamente instável.
 */
function getSimulatedFreight(fromCep, toCep, weight, insuranceValue) {
  const ufCode = toCep.slice(0, 2);
  const isSameRegion = ['70', '71', '72', '73'].includes(ufCode); // Região DF / Entorno
  const isSoutheast = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39'].includes(ufCode);

  let basePac = isSameRegion ? 18.50 : (isSoutheast ? 27.90 : 38.50);
  let baseSedex = isSameRegion ? 24.90 : (isSoutheast ? 42.00 : 59.90);
  let baseJadlog = isSameRegion ? 16.90 : (isSoutheast ? 25.50 : 36.20);

  // Adicional por peso (acima de 1kg)
  if (weight > 1) {
    const extra = (weight - 1) * 4.5;
    basePac += extra;
    baseSedex += extra * 1.5;
    baseJadlog += extra * 1.2;
  }

  return [
    {
      id: 3,
      name: '.Package (Econômico)',
      company: {
        id: 2,
        name: 'Jadlog',
        picture: 'https://images.athenaconsultoria.com.br/transportadoras/jadlog.png'
      },
      price: Number(baseJadlog.toFixed(2)),
      currency: 'BRL',
      delivery_time: isSameRegion ? 2 : (isSoutheast ? 4 : 6),
      delivery_range: {
        min: isSameRegion ? 1 : 3,
        max: isSameRegion ? 2 : (isSoutheast ? 4 : 6)
      },
      is_simulated: true
    },
    {
      id: 1,
      name: 'PAC',
      company: {
        id: 1,
        name: 'Correios',
        picture: 'https://images.athenaconsultoria.com.br/transportadoras/correios.png'
      },
      price: Number(basePac.toFixed(2)),
      currency: 'BRL',
      delivery_time: isSameRegion ? 3 : (isSoutheast ? 5 : 8),
      delivery_range: {
        min: isSameRegion ? 2 : 4,
        max: isSameRegion ? 3 : (isSoutheast ? 5 : 8)
      },
      is_simulated: true
    },
    {
      id: 2,
      name: 'SEDEX (Expresso)',
      company: {
        id: 1,
        name: 'Correios',
        picture: 'https://images.athenaconsultoria.com.br/transportadoras/correios.png'
      },
      price: Number(baseSedex.toFixed(2)),
      currency: 'BRL',
      delivery_time: isSameRegion ? 1 : (isSoutheast ? 2 : 4),
      delivery_range: {
        min: 1,
        max: isSameRegion ? 1 : (isSoutheast ? 2 : 4)
      },
      is_simulated: true
    }
  ];
}

/**
 * Calcula cotação de frete oficial via API v2 do Melhor Envio
 * 
 * @param {Object} params
 * @param {string} params.destinationCep - CEP de destino do cliente
 * @param {string} [params.originCep] - CEP de origem da Athena (default: 71996413)
 * @param {Array} [params.products] - Lista de itens [{ id, width, height, length, weight, quantity, price }]
 * @param {Object} [params.package] - Pacote consolidado alternativo { height, width, length, weight }
 * @returns {Promise<Object>} Resultado estruturado com lista de opções de frete
 */
async function calculateShipping({ destinationCep, originCep = DEFAULT_ORIGIN_CEP, products = [], package: pkg = null }) {
  const cleanFrom = cleanCep(originCep) || '71996413';
  const cleanTo = cleanCep(destinationCep);

  if (!cleanTo || cleanTo.length !== 8) {
    throw new Error('CEP de destino inválido. O CEP deve conter 8 dígitos numéricos.');
  }

  // Prepara itens / produtos para envio ao Melhor Envio
  let preparedProducts = [];
  let totalDeclaredValue = 0;
  let totalWeight = 0;

  if (Array.isArray(products) && products.length > 0) {
    preparedProducts = products.map((item, index) => {
      const dim = extractDimensionsAndWeight(item);
      const qty = Math.max(1, parseInt(item.quantity) || 1);
      const unitPrice = Math.max(1.0, parseFloat(item.price) || 50.0);
      
      totalDeclaredValue += unitPrice * qty;
      totalWeight += dim.weight * qty;

      return {
        id: String(item.id || item.sku || `item_${index + 1}`),
        width: dim.width,
        height: dim.height,
        length: dim.length,
        weight: dim.weight,
        insurance_value: unitPrice,
        quantity: qty
      };
    });
  } else if (pkg) {
    totalWeight = Math.max(0.1, parseFloat(pkg.weight) || 1.0);
    totalDeclaredValue = Math.max(1.0, parseFloat(pkg.insurance_value || pkg.price) || 50.0);
  } else {
    // Pacote padrão de ferramenta/equipamento automotivo
    totalWeight = 1.0;
    totalDeclaredValue = 100.0;
    preparedProducts = [
      {
        id: 'default_package',
        width: 20,
        height: 15,
        length: 25,
        weight: 1.0,
        insurance_value: 100.0,
        quantity: 1
      }
    ];
  }

  // Se o token não estiver cadastrado, utiliza motor resiliente de estimativa
  if (!MELHOR_ENVIO_TOKEN || MELHOR_ENVIO_TOKEN.trim() === '') {
    console.warn('[Melhor Envio] MELHOR_ENVIO_TOKEN não configurado no .env. Utilizando motor de cotação resiliente.');
    const simulatedOptions = getSimulatedFreight(cleanFrom, cleanTo, totalWeight, totalDeclaredValue);
    return {
      success: true,
      provider: 'simulated_contingency',
      from: cleanFrom,
      to: cleanTo,
      is_simulated: true,
      notice: 'Cotação estimada. Configure MELHOR_ENVIO_TOKEN no .env para ativar as tarifas de contrato oficiais da Athena.',
      options: simulatedOptions
    };
  }

  // Monta payload oficial do Melhor Envio v2
  const payload = {
    from: {
      postal_code: cleanFrom
    },
    to: {
      postal_code: cleanTo
    },
    options: {
      receipt: false,
      own_hand: false
    }
  };

  if (pkg) {
    payload.package = {
      height: Math.max(2, Math.round(pkg.height || 15)),
      width: Math.max(11, Math.round(pkg.width || 20)),
      length: Math.max(16, Math.round(pkg.length || 25)),
      weight: Math.max(0.1, Number((pkg.weight || 1.0).toFixed(2)))
    };
    if (totalDeclaredValue > 0) {
      payload.options.insurance_value = totalDeclaredValue;
    }
  } else {
    payload.products = preparedProducts;
  }

  try {
    const response = await axios.post(
      `${MELHOR_ENVIO_BASE_URL}/api/v2/me/shipment/calculate`,
      payload,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MELHOR_ENVIO_TOKEN}`,
          'User-Agent': 'Athena Soluções Automotivas (contato@athenaconsultoria.com.br)'
        },
        timeout: 10000 // 10 segundos de timeout
      }
    );

    const rawServices = Array.isArray(response.data) ? response.data : [];

    // Filtra apenas opções disponíveis e sem erro de restrição de rota
    const validOptions = rawServices
      .filter(service => {
        if (!service) return false;
        if (service.error) {
          // Loga erro específico da transportadora em debug
          return false;
        }
        const price = parseFloat(service.custom_price || service.price);
        return !isNaN(price) && price > 0;
      })
      .map(service => {
        const finalPrice = parseFloat(service.custom_price || service.price);
        const days = parseInt(service.custom_delivery_time || service.delivery_time) || 1;
        const range = service.custom_delivery_range || service.delivery_range || { min: days, max: days };

        return {
          id: service.id,
          name: service.name,
          company: {
            id: service.company?.id,
            name: service.company?.name || 'Transportadora',
            picture: service.company?.picture || ''
          },
          price: Number(finalPrice.toFixed(2)),
          currency: service.currency || 'BRL',
          delivery_time: days,
          delivery_range: {
            min: range.min || days,
            max: range.max || days
          },
          discount: parseFloat(service.discount || 0),
          is_simulated: false
        };
      })
      .sort((a, b) => a.price - b.price); // Ordena por melhor preço

    return {
      success: true,
      provider: 'melhor_envio_v2',
      environment: isSandbox ? 'sandbox' : 'production',
      from: cleanFrom,
      to: cleanTo,
      is_simulated: false,
      options: validOptions
    };

  } catch (err) {
    console.error('[Melhor Envio Error]', err.response?.data || err.message);

    // Em caso de falha da API externa (ex: token expirado, rate limit ou timeout),
    // aciona contingência para não quebrar a navegação do cliente
    const fallbackOptions = getSimulatedFreight(cleanFrom, cleanTo, totalWeight, totalDeclaredValue);
    return {
      success: true,
      provider: 'simulated_fallback',
      from: cleanFrom,
      to: cleanTo,
      is_simulated: true,
      error_details: err.response?.data?.message || err.message,
      notice: 'Cotação aproximada devido a instabilidade temporária na transportadora.',
      options: fallbackOptions
    };
  }
}

module.exports = {
  calculateShipping,
  extractDimensionsAndWeight,
  cleanCep,
  DEFAULT_ORIGIN_CEP,
  isSandbox
};
