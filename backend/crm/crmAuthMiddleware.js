/**
 * crmAuthMiddleware.js
 * 
 * Middleware de segurança e autenticação para o módulo Athena CRM.
 * Garante que:
 * 1. O token JWT seja válido, assinado com HMAC-SHA256 e não-expirado.
 * 2. O usuário possua papel de equipe comercial ou administrativa (admin, staff, vendedor, etc.).
 * 3. Clientes comuns do e-commerce não consigam acessar os dados confidenciais do CRM.
 */

const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'athena_jwt_secret_key_prod_2026_@#!_secure_auth';

const ALLOWED_CRM_ROLES = new Set([
  'admin',
  'staff',
  'vendedor',
  'operacoes',
  'edicao',
  'editor'
]);

function verifyCrmToken(token) {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, signature] = parts;
  const data = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('base64url');

  try {
    const sigBuffer = Buffer.from(signature);
    const expBuffer = Buffer.from(expectedSignature);
    if (sigBuffer.length !== expBuffer.length || !crypto.timingSafeEqual(sigBuffer, expBuffer)) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null; // Token expirado
    }
    return payload;
  } catch (err) {
    return null;
  }
}

function requireCrmAuth(req, res, next) {
  // Rotas públicas (healthcheck)
  if (req.path === '/health') {
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7).trim() 
    : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Acesso não autorizado ao CRM. Token de autenticação não fornecido.'
    });
  }

  const user = verifyCrmToken(token);
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Sessão do CRM inválida ou expirada. Por favor, autentique-se novamente.'
    });
  }

  const userRole = String(user.role || '').toLowerCase();
  if (!ALLOWED_CRM_ROLES.has(userRole)) {
    return res.status(403).json({
      success: false,
      error: 'Acesso negado. Apenas membros da equipe comercial ou administradores podem acessar o CRM.'
    });
  }

  req.crmUser = user;
  next();
}

// Rate Limiter em memória para proteção do endpoint de Lookup (CPF/CNPJ)
const lookupTracker = new Map();
const LOOKUP_WINDOW_MS = 60 * 1000; // 1 minuto
const MAX_LOOKUPS_PER_WINDOW = 30;  // 30 consultas por minuto por IP

function rateLimitLookup(req, res, next) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  
  const record = lookupTracker.get(ip) || { count: 0, resetAt: now + LOOKUP_WINDOW_MS };
  
  if (now > record.resetAt) {
    record.count = 1;
    record.resetAt = now + LOOKUP_WINDOW_MS;
  } else {
    record.count++;
  }
  
  lookupTracker.set(ip, record);

  if (record.count > MAX_LOOKUPS_PER_WINDOW) {
    return res.status(429).json({
      success: false,
      error: 'Limite de consultas excedido. Aguarde 1 minuto antes de consultar novos documentos.'
    });
  }

  // Limpeza periódica de memória
  if (lookupTracker.size > 2000) {
    for (const [k, v] of lookupTracker.entries()) {
      if (now > v.resetAt) lookupTracker.delete(k);
    }
  }

  next();
}

module.exports = {
  requireCrmAuth,
  rateLimitLookup,
  verifyCrmToken
};
