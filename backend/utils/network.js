// -------------------------------------------------------------
// CORS & NETWORK ISOLATION UTILITIES
// -------------------------------------------------------------

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

// Determina se um IP pertence à infraestrutura interna (Render/Docker RFC 1918) ou aos proxies da Cloudflare
function isInfrastructureOrPrivateIp(ip) {
  if (!ip || typeof ip !== 'string') return true;
  const clean = ip.replace('::ffff:', '').trim();
  if (clean === '127.0.0.1' || clean === '::1' || clean === 'localhost') return true;

  // 1. Faixas de Rede Privadas RFC 1918 (Render internal load balancers, VPCs, Docker, Localhost)
  if (/^10\./.test(clean)) return true;
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(clean)) return true;
  if (/^192\.168\./.test(clean)) return true;
  if (/^100\.(6[4-9]|[7-9][0-9]|1[0-1][0-9]|12[0-7])\./.test(clean)) return true;
  if (/^169\.254\./.test(clean) || clean.startsWith('fe80:')) return true;

  // 2. Faixas Oficiais de Proxies da Borda Cloudflare
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

  return false;
}

module.exports = {
  ALLOWED_CORS_ORIGINS,
  isOriginAllowed,
  isInfrastructureOrPrivateIp
};
