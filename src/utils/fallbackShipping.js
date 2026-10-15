/**
 * fallbackShipping.js
 * Motor resiliente de cotação de frete para contingência imediata caso o backend
 * esteja em cold-start ou a API externa do Melhor Envio esteja indisponível.
 */

export function getFallbackShippingOptions(toCep, products = []) {
  const cleanToCep = String(toCep || '').replace(/\D/g, '').slice(0, 8);
  const ufCode = cleanToCep.slice(0, 2);
  const isSameRegion = ['70', '71', '72', '73'].includes(ufCode); // DF / Entorno
  const isSoutheast = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39'].includes(ufCode);

  let totalWeight = 1.0;
  if (Array.isArray(products) && products.length > 0) {
    totalWeight = products.reduce((acc, p) => acc + (Number(p.weight) || 1.0) * (Number(p.quantity) || 1), 0);
  }

  let baseJadlog = isSameRegion ? 16.90 : (isSoutheast ? 25.50 : 36.20);
  let basePac = isSameRegion ? 18.50 : (isSoutheast ? 27.90 : 38.50);
  let baseSedex = isSameRegion ? 24.90 : (isSoutheast ? 42.00 : 59.90);

  if (totalWeight > 1) {
    const extra = (totalWeight - 1) * 4.5;
    baseJadlog += extra * 1.2;
    basePac += extra;
    baseSedex += extra * 1.5;
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
