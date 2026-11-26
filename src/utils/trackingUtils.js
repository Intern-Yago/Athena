/**
 * trackingUtils.js
 * Utilitários para gerar links de rastreio inteligentes e unificados por transportadora ou Melhor Envio
 */

export function buildTrackingUrl(carrierName = '', trackingCode = '') {
  const code = String(trackingCode || '').trim();
  if (!code) return null;

  const carrier = String(carrierName || '').toLowerCase();

  // 1. Correios (padrão 13 caracteres ex: QB123456789BR ou AA...BR)
  if (carrier.includes('correio') || carrier.includes('sedex') || carrier.includes('pac') || /^[A-Z]{2}[0-9]{9}[A-Z]{2}$/i.test(code)) {
    return `https://rastreamento.correios.com.br/app/index.php?codigo=${encodeURIComponent(code)}`;
  }

  // 2. Jadlog
  if (carrier.includes('jadlog')) {
    return `https://www.jadlog.com.br/jadlog/tracking?cte=${encodeURIComponent(code)}`;
  }

  // 3. Total Express
  if (carrier.includes('total')) {
    return `https://tracking.totalexpress.com.br/tracking/${encodeURIComponent(code)}`;
  }

  // 4. Loggi
  if (carrier.includes('loggi')) {
    return `https://www.loggi.com/rastreador/${encodeURIComponent(code)}`;
  }

  // 5. Azul Cargo Express
  if (carrier.includes('azul')) {
    return `https://www.azulcargoexpress.com.br/Rastreio/Rastreio?awb=${encodeURIComponent(code)}`;
  }

  // 6. Hub Unificado Melhor Rastreio (Melhor Envio)
  return `https://melhorrastreio.com.br/rastreio/${encodeURIComponent(code)}`;
}
