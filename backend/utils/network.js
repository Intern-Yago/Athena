// -------------------------------------------------------------
// CORS & NETWORK ISOLATION UTILITIES (CLOUDFLARE HARDENED)
// -------------------------------------------------------------

const net = require('net');
const crypto = require('crypto');

const ALLOWED_CORS_ORIGINS = [
  'https://www.athenaconsultoria.com.br',
  'https://athenaconsultoria.com.br',
  'https://athena-backend-hu1m.onrender.com',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:5173'
];

function isOriginAllowed(origin) {
  if (!origin) return false;
  return ALLOWED_CORS_ORIGINS.includes(origin) ||
    /^https?:\/\/(.*\.)?athenaconsultoria\.com\.br(:\d+)?$/.test(origin) ||
    /^https?:\/\/(.*\.)?onrender\.com(:\d+)?$/.test(origin) ||
    /^https?:\/\/(.*\.)?vercel\.app(:\d+)?$/.test(origin) ||
    /^https?:\/\/localhost(:\d+)?$/.test(origin) ||
    /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin);
}

// 1. Identifica endereços privados RFC 1918 ou Loopback (Render router, Docker, Localhost)
function isPrivateIp(ip) {
  if (!ip || typeof ip !== 'string') return true;
  const clean = ip.replace('::ffff:', '').trim().toLowerCase();
  if (clean === '127.0.0.1' || clean === '::1' || clean === 'localhost') return true;

  if (/^10\./.test(clean)) return true;
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(clean)) return true;
  if (/^192\.168\./.test(clean)) return true;
  if (/^100\.(6[4-9]|[7-9][0-9]|1[0-1][0-9]|12[0-7])\./.test(clean)) return true;
  if (/^169\.254\./.test(clean) || clean.startsWith('fe80:')) return true;

  return false;
}

// 2. Identifica nós oficiais de borda e proxies da Cloudflare (IPv4 e IPv6)
function isCloudflareIp(ip) {
  if (!ip || typeof ip !== 'string') return false;
  const clean = ip.replace('::ffff:', '').trim().toLowerCase();

  // IPv4 Cloudflare CIDRs
  if (/^173\.245\.(4[8-9]|5[0-9]|6[0-3])\./.test(clean)) return true;
  if (/^103\.21\.(24[4-7])\./.test(clean)) return true;
  if (/^103\.22\.(20[0-3])\./.test(clean)) return true;
  if (/^103\.31\.(4|5|6|7)\./.test(clean)) return true;
  if (/^141\.101\.(6[4-9]|[7-9][0-9]|1[0-1][0-9]|12[0-7])\./.test(clean)) return true;
  if (/^108\.162\.(19[2-9]|2[0-4][0-9]|25[0-5])\./.test(clean)) return true;
  if (/^190\.93\.(24[0-9]|25[0-5])\./.test(clean)) return true;
  if (/^188\.114\.(9[6-9]|1[0-1][0-9]|12[0-7])\./.test(clean)) return true;
  if (/^197\.234\.(24[0-3])\./.test(clean)) return true;
  if (/^198\.41\.(12[8-9]|1[3-9][0-9]|2[0-4][0-9]|25[0-5])\./.test(clean)) return true;
  if (/^162\.15[89]\./.test(clean)) return true;
  if (/^104\.(1[6-9]|2[0-7])\./.test(clean)) return true;
  if (/^172\.(6[4-9]|7[0-1])\./.test(clean)) return true;
  if (/^131\.0\.(7[2-5])\./.test(clean)) return true;

  // IPv6 Cloudflare CIDRs
  if (clean.startsWith('2400:cb00:')) return true;
  if (clean.startsWith('2606:4700:')) return true;
  if (clean.startsWith('2803:f800:')) return true;
  if (clean.startsWith('2405:b500:')) return true;
  if (clean.startsWith('2405:8100:')) return true;
  if (clean.startsWith('2a06:98c0:')) return true;
  if (clean.startsWith('2c0f:f248:')) return true;

  return false;
}

// Determina se um IP pertence à infraestrutura interna ou à Cloudflare
function isInfrastructureOrPrivateIp(ip) {
  return isPrivateIp(ip) || isCloudflareIp(ip);
}

// Comparação de tokens com proteção estrita contra Timing Attacks
function safeCompareTokens(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Extrator Seguro de IP com Defesa Anti-Spoofing de Cabeçalhos da Cloudflare.
 * Impede que atacantes forjem "CF-Connecting-IP" em requisições diretas ao Origin.
 */
function getClientIp(req, { forceStrictOrigin = false } = {}) {
  const socketIp = (req.socket?.remoteAddress || req.connection?.remoteAddress || '').replace('::ffff:', '').trim();
  const isDirectPeerCloudflare = isCloudflareIp(socketIp);
  const isDirectPeerPrivate = isPrivateIp(socketIp);

  const originSecret = process.env.ATHENA_ORIGIN_SECRET;
  const incomingSecret = req.headers?.['x-athena-origin-secret'];
  const hasValidOriginSecret = Boolean(
    originSecret && 
    incomingSecret && 
    typeof incomingSecret === 'string' && 
    safeCompareTokens(incomingSecret, originSecret)
  );

  const isDevOrTest = process.env.NODE_ENV !== 'production' && !forceStrictOrigin;
  const hasCfRay = Boolean(req.headers?.['cf-ray']);
  
  // Condição estrita de confiança no cabeçalho CF-Connecting-IP
  const canTrustCfHeader = isDirectPeerCloudflare || hasValidOriginSecret || (isDirectPeerPrivate && hasCfRay) || isDevOrTest;

  if (canTrustCfHeader && req.headers?.['cf-connecting-ip']) {
    const cfIp = req.headers['cf-connecting-ip'];
    if (typeof cfIp === 'string') {
      const cleanCf = cfIp.split(',')[0].trim().replace('::ffff:', '');
      if (cleanCf && net.isIP(cleanCf) && !isInfrastructureOrPrivateIp(cleanCf)) {
        return cleanCf;
      }
    }
  }

  // Fallback 1: IP atribuído pelo Express (filtrado por trust proxy)
  let ip = req.ip || socketIp || '127.0.0.1';
  if (typeof ip === 'string') {
    ip = ip.replace('::ffff:', '').trim();
  }

  if (ip && net.isIP(ip) && !isInfrastructureOrPrivateIp(ip)) {
    return ip;
  }

  // Fallback 2: X-Forwarded-For aceito unicamente através de nós confiáveis
  if (isDirectPeerPrivate || isDirectPeerCloudflare || isDevOrTest) {
    const xff = req.headers?.['x-forwarded-for'];
    if (xff && typeof xff === 'string') {
      const parts = xff.split(',').map(s => s.trim().replace('::ffff:', '')).filter(Boolean);
      const publicIp = parts.find(p => net.isIP(p) && !isInfrastructureOrPrivateIp(p));
      if (publicIp) return publicIp;
    }
  }

  return (net.isIP(ip) ? ip : '127.0.0.1');
}

module.exports = {
  ALLOWED_CORS_ORIGINS,
  isOriginAllowed,
  isPrivateIp,
  isCloudflareIp,
  isInfrastructureOrPrivateIp,
  safeCompareTokens,
  getClientIp
};
