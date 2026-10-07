require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const cloudinary = require('cloudinary').v2;
const swaggerUi = require('swagger-ui-express');
const basicAuth = require('express-basic-auth');
const { isR2Configured, uploadToR2, deleteFromR2, listR2Objects, invalidateR2Cache } = require('./r2Service');

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const axios = require('axios');
const { 
  searchHermesProducts, 
  hermesGeminiToolDeclaration, 
  hermesGeminiTools,
  executeHermesGeminiTool,
  updateProductByHermes,
  createProductByHermes,
  syncProductFromOmie
} = require('./services/hermesProductService');
const { processOmieProductWebhook } = require('./services/omieWebhookService');
const { syncProductToOmie, extractSkuFromTitle } = require('./services/omieProductSyncService');
const opsRoutes = require('./routes/opsRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const opsAdminRoutes = require('./routes/opsAdminRoutes');
const customerOrderRoutes = require('./routes/customerOrderRoutes');
const orderService = require('./services/orderService');

const app = express();
const PORT = process.env.PORT || 3001;
const DB_PATH = path.join(__dirname, 'data', 'athena-db.json');

// -------------------------------------------------------------
// GOOGLE SMTP & NODEMAILER CONFIGURATION (GMAIL EMAIL SERVICE)
// -------------------------------------------------------------
const SMTP_USER = process.env.SMTP_USER || process.env.GMAIL_USER || 'athena.consultoria.automotiva@gmail.com';
const rawSmtpPass = process.env.SMTP_PASS || process.env.GMAIL_PASS || process.env.GMAIL_APP_PASSWORD || '';
const SMTP_PASS = rawSmtpPass ? rawSmtpPass.replace(/\s+/g, '') : '';
const SMTP_FROM = process.env.SMTP_FROM || '"Athena Soluções Automotivas" <no-reply@athenaconsultoria.com.br>';

let mailTransporter = null;
if (SMTP_PASS) {
  mailTransporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // STARTTLS na porta 587
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    },
    family: 4, // FORÇA IPv4: Previne Connection Timeout no Render e servidores Linux
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 10000,
    tls: {
      rejectUnauthorized: false
    }
  });
  console.log('Google SMTP (Gmail Port 587 IPv4) configurado para:', SMTP_USER, '| Remetente:', SMTP_FROM);
} else {
  console.log('Google SMTP em modo log (Defina GMAIL_APP_PASSWORD no .env para envio real).');
}

function buildAthenaEmailHtml({
  badgeText = '',
  badgeBg = '#fffbeb',
  badgeColor = '#b45309',
  badgeBorder = '#fde68a',
  title = '',
  subtitle = '',
  bodyHtml = '',
  maxWidth = 600
}) {
  const badgeHtml = badgeText ? `
    <div style="margin-bottom: 14px; text-align: center;">
      <span style="display: inline-block; padding: 5px 14px; border-radius: 9999px; background-color: ${badgeBg}; color: ${badgeColor}; border: 1px solid ${badgeBorder}; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
        ${badgeText}
      </span>
    </div>
  ` : '';

  const titleHtml = title ? `
    <h2 style="color: #0f172a; font-size: 20px; font-weight: 800; margin: 0 0 8px 0; letter-spacing: -0.3px; text-align: center;">
      ${title}
    </h2>
  ` : '';

  const subtitleHtml = subtitle ? `
    <p style="color: #64748b; font-size: 13px; margin: 0 0 20px 0; text-align: center; line-height: 1.5;">
      ${subtitle}
    </p>
  ` : '';

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Athena Soluções Automotivas</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #334155;">
      <div style="background-color: #f8fafc; width: 100%; padding: 36px 16px; box-sizing: border-box;">
        <div style="max-width: ${maxWidth}px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05); border-top: 4px solid #f59e0b;">
          
          <!-- Cabeçalho Oficial Athena -->
          <div style="background-color: #ffffff; padding: 26px 24px 20px 24px; text-align: center; border-bottom: 1px solid #f1f5f9;">
            <table role="presentation" style="margin: 0 auto; border-collapse: collapse;">
              <tr>
                <td style="vertical-align: middle; padding-right: 12px;">
                  <img src="https://athenaconsultoria.com.br/logo.jpg" alt="Athena Logo" width="42" height="42" style="border-radius: 10px; border: 1px solid #e2e8f0; display: block; object-fit: contain;" />
                </td>
                <td style="vertical-align: middle; text-align: left;">
                  <span style="display: block; font-size: 22px; font-weight: 900; letter-spacing: 0.5px; color: #0f172a; line-height: 1.1;">
                    ATHENA
                  </span>
                  <span style="display: block; font-size: 10px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #d97706; margin-top: 2px;">
                    Soluções Automotivas
                  </span>
                </td>
              </tr>
            </table>
          </div>

          <!-- Corpo do Conteúdo -->
          <div style="padding: 28px 32px;">
            ${badgeHtml}
            ${titleHtml}
            ${subtitleHtml}
            ${bodyHtml}
          </div>

          <!-- Rodapé Oficial Athena -->
          <div style="background-color: #f8fafc; padding: 22px 24px; border-top: 1px solid #e2e8f0; text-align: center;">
            <p style="color: #64748b; font-size: 12px; margin: 0 0 6px 0; font-weight: 600;">
              Athena Soluções Automotivas • SIA Trecho 3, Brasília - DF
            </p>
            <p style="color: #94a3b8; font-size: 11px; margin: 0 0 8px 0;">
              Dúvidas ou Atendimento? WhatsApp: <strong style="color: #0f172a;">(61) 98348-5671</strong> • E-mail: <a href="mailto:contato@athenaconsultoria.com.br" style="color: #d97706; text-decoration: none; font-weight: 600;">contato@athenaconsultoria.com.br</a>
            </p>
            <p style="color: #cbd5e1; font-size: 10px; margin: 0;">
              Mensagem oficial gerada automaticamente pelo sistema Athena.
            </p>
          </div>

        </div>
      </div>
    </body>
    </html>
  `;
}

async function sendPasswordResetEmail(toEmail, resetCode, userName = 'Cliente') {
  const htmlContent = buildAthenaEmailHtml({
    maxWidth: 520,
    badgeText: 'Recuperação de Acesso',
    badgeBg: '#fffbeb',
    badgeColor: '#b45309',
    badgeBorder: '#fde68a',
    title: 'Redefinição de Senha',
    bodyHtml: `
      <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0; text-align: center;">
        Olá, <strong>${userName}</strong>! Recebemos uma solicitação para redefinir a senha de acesso da sua conta Athena. Utilize o código de verificação abaixo:
      </p>

      <div style="background-color: #fffbeb; border: 2px dashed #f59e0b; border-radius: 14px; padding: 22px; margin: 0 0 20px 0; text-align: center;">
        <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #b45309; display: block;">
          ${resetCode}
        </span>
        <span style="font-size: 11px; color: #92400e; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-top: 6px; display: block;">
          Código de Segurança
        </span>
      </div>

      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 18px; margin-bottom: 20px; text-align: center;">
        <p style="margin: 0; color: #64748b; font-size: 12px; line-height: 1.5;">
          ⏱ Este código é válido por <strong>15 minutos</strong>. Se você não solicitou esta redefinição, desconsidere este e-mail com segurança.
        </p>
      </div>
    `
  });

  const result = await sendDispatchedEmail({
    to: toEmail,
    subject: 'Código de Recuperação de Senha — Athena Soluções Automotivas',
    html: htmlContent,
    replyTo: 'contato@athenaconsultoria.com.br'
  });

  if (result.success && result.provider !== 'log') {
    return { success: true, method: result.provider };
  }

  console.log(`[DEBUG CODIGO DE RECUPERACAO] E-mail: ${toEmail} | Codigo: ${resetCode}`);
  return { success: true, method: 'log', code: resetCode, error: result.error };
}

// Generate 6-Character Alphanumeric Code (Letters & Numbers Mixed)
function generateAlphanumericOtp(length = 6) {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const numbers = '23456789';
  const allChars = letters + numbers;

  // Guarantee mixed: at least 2 letters and at least 2 numbers
  let chars = [
    letters[Math.floor(Math.random() * letters.length)],
    letters[Math.floor(Math.random() * letters.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    numbers[Math.floor(Math.random() * numbers.length)]
  ];

  for (let i = 4; i < length; i++) {
    chars.push(allChars[Math.floor(Math.random() * allChars.length)]);
  }

  // Shuffle using Fisher-Yates algorithm
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join('');
}

async function sendVerificationEmail(toEmail, code, userName = 'Cliente') {
  const htmlContent = buildAthenaEmailHtml({
    maxWidth: 520,
    badgeText: 'Verificação de Segurança',
    badgeBg: '#fffbeb',
    badgeColor: '#b45309',
    badgeBorder: '#fde68a',
    title: 'Confirme seu E-mail',
    bodyHtml: `
      <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0; text-align: center;">
        Olá, <strong>${userName}</strong>! Para validar suas solicitações de cotações, orçamentos e compras de equipamentos no portal Athena, utilize o código de segurança abaixo:
      </p>

      <div style="background-color: #fffbeb; border: 2px dashed #f59e0b; border-radius: 14px; padding: 22px; margin: 0 0 20px 0; text-align: center;">
        <span style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #b45309; display: block;">
          ${code}
        </span>
        <span style="font-size: 11px; color: #92400e; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-top: 6px; display: block;">
          Código de Validação da Conta
        </span>
      </div>

      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 18px; margin-bottom: 20px; text-align: center;">
        <p style="margin: 0; color: #64748b; font-size: 12px; line-height: 1.5;">
          ⏱ Este código expira em <strong>30 minutos</strong> e deve ser informado na tela de verificação do site Athena.
        </p>
      </div>
    `
  });

  const result = await sendDispatchedEmail({
    to: toEmail,
    subject: `Código de Verificação Athena: ${code}`,
    html: htmlContent,
    replyTo: 'contato@athenaconsultoria.com.br'
  });

  if (result.success && result.provider !== 'log') {
    return { success: true, method: result.provider };
  }

  console.log(`[VERIFICACAO EMAIL ATHENA] E-mail: ${toEmail} | Codigo: ${code} (Validade: 30 minutos)`);
  return { success: true, method: 'log', code, error: result.error };
}

// -------------------------------------------------------------
// JWT CRYPTOGRAPHIC SIGNING & SESSION SECURITY (OWASP A07:2021)
// -------------------------------------------------------------
const JWT_SECRET = process.env.JWT_SECRET || 'athena_jwt_secret_key_prod_2026_@#!_secure_auth';
const TOKEN_EXPIRY_SECONDS = 12 * 3600; // 12 hours max session token

function base64UrlEncode(str) {
  return Buffer.from(str).toString('base64url');
}

function base64UrlDecode(str) {
  return Buffer.from(str, 'base64url').toString('utf8');
}

function generateToken(payload, expiresInSeconds = TOKEN_EXPIRY_SECONDS) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('base64url');

  return {
    token: `${data}.${signature}`,
    expiresAt: (now + expiresInSeconds) * 1000
  };
}

function verifyToken(token) {
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

    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null; // Expired
    }
    return payload;
  } catch (e) {
    return null;
  }
}

// Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : null;

  if (!token) {
    return res.status(401).json({ error: 'Acesso não autorizado. Token de sessão não fornecido.' });
  }

  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Sessão inválida ou expirada. Por favor, faça login novamente.' });
  }

  req.user = user;
  next();
}

// Require Administrator Role Middleware
function requireAdmin(req, res, next) {
  if (req.user?.isMagicLinkSession) {
    logSecurityEvent({
      event: 'PRIVILEGE_ESCALATION_BLOCKED',
      userId: req.user.id,
      email: req.user.email,
      ip: getClientIp(req),
      userAgent: req.headers['user-agent'],
      outcome: 'BLOCKED',
      reason: 'Tentativa de acesso a rota de administrador via sessão restrita de Magic Link'
    });
    return res.status(403).json({ error: 'Acesso negado. Sessões de Link Emergencial não possuem autorização para executar ações administrativas.' });
  }
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Permissão negada. Apenas administradores podem executar esta ação.' });
  }
  next();
}

// Require Staff / Internal Collaborator Role Middleware (Admin, Vendedor, Editor)
function requireStaff(req, res, next) {
  if (req.user?.isMagicLinkSession) {
    logSecurityEvent({
      event: 'PRIVILEGE_ESCALATION_BLOCKED',
      userId: req.user.id,
      email: req.user.email,
      ip: getClientIp(req),
      userAgent: req.headers['user-agent'],
      outcome: 'BLOCKED',
      reason: 'Tentativa de acesso a rota de equipe/staff via sessão restrita de Magic Link'
    });
    return res.status(403).json({ error: 'Acesso negado. Sessões de Link Emergencial não possuem autorização para executar ações de equipe.' });
  }
  if (!req.user || !['admin', 'vendedor', 'editor', 'edicao'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Permissão negada. Acesso restrito à equipe interna.' });
  }
  next();
}

// Disable Express fingerprinting header
app.disable('x-powered-by');

// Enable trust proxy for Render / Cloudflare / Heroku load balancers
// Ignora saltos internos e proxies privados (loopback, linklocal, uniquelocal / 10.x / 172.16-31.x / 192.168.x)
app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);

// -------------------------------------------------------------
// OWASP SECURITY HARDENING & RATE LIMITING MIDDLEWARES
// -------------------------------------------------------------
app.use(helmet({
  contentSecurityPolicy: false, // Compatible with Cloudflare CDN & CORS
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Active Cyber Deception & Technology Camouflage (MITRE D3FEND Decoy Pattern / OWASP A05:2021)
app.use((req, res, next) => {
  res.setHeader('X-Powered-By', 'PHP/8.3.14');
  res.setHeader('Server', 'Apache/2.4.58 (Ubuntu)');
  res.setHeader('X-Pingback', 'https://www.athenaconsultoria.com.br/xmlrpc.php');
  res.setHeader('Link', '<https://www.athenaconsultoria.com.br/wp-json/>; rel="https://api.w.org/"');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');
  next();
});

// Helper: Determina se um IP pertence à infraestrutura interna (Render/Docker RFC 1918) ou aos proxies da Cloudflare
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

  // 2. Faixas Oficiais de Proxies da Borda Cloudflare (para que nenhum nó da Cloudflare seja bloqueado acidentalmente)
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

// Retrocompatibilidade interna
const isPrivateOrInternalIp = isInfrastructureOrPrivateIp;

// Secure Client IP Extractor
// Prioriza o cabeçalho canônico da Cloudflare (CF-Connecting-IP) ou o primeiro IP público da cadeia
function getClientIp(req) {
  // 1. Cloudflare fornece o IP real do cliente no cabeçalho CF-Connecting-IP
  const cfIp = req.headers['cf-connecting-ip'];
  if (cfIp && typeof cfIp === 'string') {
    const cleanCf = cfIp.split(',')[0].trim().replace('::ffff:', '');
    if (cleanCf && !isInfrastructureOrPrivateIp(cleanCf)) {
      return cleanCf;
    }
  }

  // 2. IP resolvido pelo Express via trust proxy (já filtra proxies locais e privados configurados)
  let ip = req.ip || req.socket?.remoteAddress || '127.0.0.1';
  if (typeof ip === 'string' && ip.startsWith('::ffff:')) {
    ip = ip.replace('::ffff:', '');
  }
  if (!isInfrastructureOrPrivateIp(ip)) {
    return ip.trim();
  }

  // 3. Fallback: analisa X-Forwarded-For em busca do primeiro IP público que não seja da infraestrutura
  const xff = req.headers['x-forwarded-for'];
  if (xff && typeof xff === 'string') {
    const parts = xff.split(',').map(s => s.trim().replace('::ffff:', '')).filter(Boolean);
    const publicIp = parts.find(p => !isInfrastructureOrPrivateIp(p));
    if (publicIp) return publicIp;
  }

  return typeof ip === 'string' ? ip.trim() : '127.0.0.1';
}

// -------------------------------------------------------------
// CORS (CROSS-ORIGIN RESOURCE SHARING) HARDENING
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
    /^https?:\/\/athena-[a-zA-Z0-9-]+\.onrender\.com(:\d+)?$/.test(origin) ||
    /^https?:\/\/athena-[a-zA-Z0-9-]+\.vercel\.app(:\d+)?$/.test(origin) ||
    /^https?:\/\/localhost(:\d+)?$/.test(origin) ||
    /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin);
}

app.use(cors({
  origin: (origin, callback) => {
    // Requisições sem cabeçalho Origin (mobile apps, curl, webhooks servidor-a-servidor como Asaas e Omie)
    if (!origin) return callback(null, true);

    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }

    // Se for um site clonado ou domínio de terceiro não autorizado, recusa o cabeçalho CORS
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  optionsSuccessStatus: 200
}));

app.options('*', cors());

// -------------------------------------------------------------
// ORIGIN ISOLATION & DIRECT-TO-ORIGIN BYPASS HARDENING
// -------------------------------------------------------------
// Quando a variável ATHENA_ORIGIN_SECRET estiver configurada no Render:
// - Requisições da Cloudflare (com segredo de borda) são aceitas.
// - Requisições com Origin ou Referer legítimos da Athena são aceitas.
// - Preflights OPTIONS, healthchecks e webhooks de pagamento são permitidos.
// - Varreduras diretas ou scrapers sem relação com a aplicação são bloqueados com HTTP 403 (com headers CORS preservados).
const ATHENA_ORIGIN_SECRET = process.env.ATHENA_ORIGIN_SECRET;
if (ATHENA_ORIGIN_SECRET) {
  app.use((req, res, next) => {
    // Preflight OPTIONS nunca é barrado
    if (req.method === 'OPTIONS') {
      return next();
    }

    // Permite health checks internos do Render, ping e Webhooks legítimos de pagamento
    if (
      req.path === '/api/health' || 
      req.path === '/api/ping' || 
      req.path === '/health' || 
      req.path.startsWith('/api/payments/webhook') ||
      req.headers['user-agent']?.includes('Render/')
    ) {
      return next();
    }

    const incomingSecret = req.headers['x-athena-origin-secret'];
    const origin = req.headers['origin'];
    const referer = req.headers['referer'];

    const isAthenaReferer = referer && (
      referer.startsWith('https://www.athenaconsultoria.com.br') ||
      referer.startsWith('https://athenaconsultoria.com.br')
    );

    if ((incomingSecret && incomingSecret === ATHENA_ORIGIN_SECRET) || isOriginAllowed(origin) || isAthenaReferer) {
      return next();
    }

    const realIp = getClientIp(req);
    logSecurityEvent({
      event: 'ORIGIN_BYPASS_BLOCKED',
      ip: realIp,
      userAgent: req.headers['user-agent'],
      outcome: 'BLOCKED',
      reason: 'Tentativa de acesso direto ao Origin (onrender.com) sem passar pelo proxy ou origem autorizada',
      details: {
        path: req.originalUrl || req.path,
        method: req.method,
        origin: origin || null
      }
    });
    return res.status(403).json({
      error: 'Acesso direto à origem proibido. Todas as requisições devem transitar pela borda autorizada da Cloudflare ou domínios oficiais.'
    });
  });
}


// General API Rate Limiter against DoS Flooding Attacks
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requests per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getClientIp(req),
  validate: { xForwardedForHeader: false },
  message: { error: 'Muitas requisições originadas deste IP. Por favor, aguarde alguns minutos.' }
});

// Progressive Delay Limiter against Brute-Force:
// Tentativas 1 a 3: Sem delay (resposta instantânea)
// Tentativa 4 em diante: Começa com 1s e acumula +1s a cada tentativa (até o teto de 4s)
const loginSlowDown = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutos
  delayAfter: 3, // Começa o delay a partir da 4ª requisição
  delayMs: (hits) => (hits - 3) * 1000, // 4ª = 1s, 5ª = 2s, 6ª = 3s, etc.
  maxDelayMs: 4000, // Teto máximo de 4 segundos
  keyGenerator: (req) => getClientIp(req),
  validate: { xForwardedForHeader: false }
});

// Strict Rate Limiter against Password Attacks (Backstop)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Max 15 failed attempts per 15 min per IP
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getClientIp(req),
  validate: { xForwardedForHeader: false },
  message: { error: 'Muitas tentativas de login incorretas deste endereço. Acesso bloqueado temporariamente por 15 minutos por segurança.' }
});

// Dedicated Strict Limiter for Forgot Password / Google SMTP (Prevents Mailgun/Gmail socket exhaustion)
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 requests per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getClientIp(req),
  validate: { xForwardedForHeader: false },
  message: { error: 'Muitas solicitações de recuperação de senha deste endereço. Por segurança, aguarde 15 minutos antes de tentar novamente.' }
});

app.use('/api/', apiLimiter);

// OWASP DoS Protection: High payload limit strictly for media upload endpoint, 10MB globally for products with variants
app.use('/api/upload', express.json({ limit: '50mb' }));
app.use('/api/upload', express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Ultra-fast Healthcheck & Pre-Warming Endpoints (Sub-5ms response, wakes up cold Render containers)
app.get('/api/ping', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.get('/api/health', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.json({ 
    status: 'healthy',
    database: Boolean(pool),
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// -------------------------------------------------------------
// SITEMAP ROUTE FOR SEARCH ENGINES & CRAWLERS (/sitemap.xml)
// -------------------------------------------------------------
app.get('/sitemap.xml', (req, res) => {
  const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
  if (fs.existsSync(sitemapPath)) {
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    return res.sendFile(sitemapPath);
  }
  return res.status(404).send('Sitemap not found');
});

// -------------------------------------------------------------
// ACTIVE CYBER DECEPTION & HONEYPOT TRAP SYSTEM (OWASP A05:2021 & MITRE D3FEND)
// -------------------------------------------------------------
function renderWpLoginHtml(attemptedUser = '', errorMessage = '') {
  const safeUser = String(attemptedUser || '').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <title>Acessar &lsaquo; Athena Soluções Automotivas &mdash; WordPress</title>
  <meta name='robots' content='max-image-preview:large, noindex, noarchive' />
  <style>
    body.login { background: #f0f0f1; color: #3c434a; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif; font-size: 13px; line-height: 1.4em; min-height: 100vh; margin: 0; display: flex; align-items: center; justify-content: center; }
    #login { width: 320px; padding: 20px; }
    .login h1 { text-align: center; margin-bottom: 24px; }
    .login h1 a { background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="%232271b1"/><path fill="%23fff" d="M11 50a39 39 0 0 0 63 31L42 21A39 39 0 0 0 11 50zm73 9A39 39 0 0 0 68 14l20 54zM50 11a39 39 0 0 0-21 6l28 72 13-39c2-6 3-11 3-15 0-9-7-14-15-14zm-14 36c2 0 3-2 3-5 0-2-1-3-3-3-2 0-3 1-3 3s1 5 3 5z"/></svg>'); background-size: 84px 84px; background-position: center top; background-repeat: no-repeat; color: transparent; height: 84px; width: 84px; text-decoration: none; display: inline-block; }
    .login form { background: #fff; border: 1px solid #c3c4c7; box-shadow: 0 1px 3px rgba(0,0,0,.04); padding: 26px 24px 34px; border-radius: 4px; }
    .login label { font-size: 14px; line-height: 1.5; color: #3c434a; margin-bottom: 3px; display: block; }
    .login .input { font-size: 15px; width: 100%; padding: 6px 10px; margin: 2px 0 16px; border: 1px solid #8c8f94; border-radius: 4px; box-sizing: border-box; outline: 0; }
    .login .input:focus { border-color: #2271b1; box-shadow: 0 0 0 1px #2271b1; }
    .login .button-primary { background: #2271b1; border-color: #2271b1; color: #fff; padding: 0 14px; font-size: 13px; font-weight: 500; min-height: 34px; border-radius: 3px; cursor: pointer; float: right; border-width: 1px; border-style: solid; }
    .login .button-primary:hover { background: #135e96; border-color: #135e96; }
    #login_error { border-left: 4px solid #d63638; background: #fff; box-shadow: 0 1px 1px 0 rgba(0,0,0,.04); margin-bottom: 20px; padding: 12px; font-size: 13px; line-height: 1.5; border-radius: 2px; }
    .login #backtoblog, .login #nav { font-size: 13px; padding: 0 24px; margin: 16px 0 0; text-align: left; }
    .login #backtoblog a, .login #nav a { color: #50575e; text-decoration: none; }
    .login #backtoblog a:hover, .login #nav a:hover { color: #135e96; }
    .forgetmenot { float: left; font-weight: 400; font-size: 12px; margin-top: 4px; }
    .forgetmenot input { margin-right: 4px; }
  </style>
</head>
<body class="login js login-action-login wp-core-ui">
  <div id="login">
    <h1><a href="https://wordpress.org/">Powered by WordPress</a></h1>
    ${errorMessage ? `<div id="login_error">${errorMessage}</div>` : ''}
    <form name="loginform" id="loginform" action="/wp-login.php" method="post">
      <p>
        <label for="user_login">Nome de usuário ou endereço de e-mail</label>
        <input type="text" name="log" id="user_login" class="input" value="${safeUser}" size="20" autocapitalize="off" autocomplete="username" required />
      </p>
      <p>
        <label for="user_pass">Senha</label>
        <input type="password" name="pwd" id="user_pass" class="input" value="" size="20" autocomplete="current-password" required />
      </p>
      <p class="forgetmenot"><label for="rememberme"><input name="rememberme" type="checkbox" id="rememberme" value="forever" /> Lembrar-me</label></p>
      <p class="submit">
        <input type="submit" name="wp-submit" id="wp-submit" class="button button-primary button-large" value="Acessar" />
      </p>
    </form>
    <p id="nav"><a href="/wp-login.php?action=lostpassword">Perdeu a senha?</a></p>
    <p id="backtoblog"><a href="/">&larr; Ir para Athena Soluções Automotivas</a></p>
  </div>
</body>
</html>`;
}

// 1. WordPress REST API Decoy (/wp-json/ e sub-rotas)
app.get(['/wp-json', '/wp-json/'], (req, res) => {
  return res.json({
    name: 'Athena Soluções Automotivas',
    description: 'Catálogo de Equipamentos Automotivos e Ferramentas Profissionais',
    url: 'https://www.athenaconsultoria.com.br',
    home: 'https://www.athenaconsultoria.com.br',
    namespaces: ['oembed/1.0', 'wp/v2'],
    authentication: {},
    routes: {
      '/': { namespace: '', methods: ['GET'] },
      '/wp/v2': { namespace: 'wp/v2', methods: ['GET'] },
      '/oembed/1.0': { namespace: 'oembed/1.0', methods: ['GET'] }
    }
  });
});

app.get('/wp-json/wp/v2/users', async (req, res) => {
  const clientIp = getClientIp(req);
  const userAgent = req.headers['user-agent'] || 'Desconhecido';
  
  // Tarpit anti-scanner (1.5s delay)
  await new Promise(r => setTimeout(r, 1500));
  
  logSecurityEvent({
    event: 'HONEYPOT_USER_ENUMERATION_ATTEMPT',
    ip: clientIp,
    userAgent,
    outcome: 'BLOCKED',
    reason: 'Scanner tentou enumeração de usuários WordPress via /wp-json/wp/v2/users'
  });

  ipSecurityTracker.set(clientIp, { failedAttempts: 99, isBlocked: true, blockedAt: new Date() });
  sendHoneypotAlertEmail(clientIp, '/wp-json/wp/v2/users [USER ENUMERATION]', userAgent);

  return res.status(401).json({
    code: 'rest_cannot_access',
    message: 'Somente usuários autenticados possuem permissão para listar usuários.',
    data: { status: 401 }
  });
});

// 2. Windows Live Writer Decoy (/wp-includes/wlwmanifest.xml)
app.get('/wp-includes/wlwmanifest.xml', (req, res) => {
  res.setHeader('Content-Type', 'text/xml; charset=utf-8');
  return res.send(`<?xml version="1.0" encoding="utf-8" ?>
<manifest xmlns="http://schemas.microsoft.com/wlw/manifest/weblog">
  <weblog>
    <serviceName>WordPress</serviceName>
    <homepageLinkText>Ver site</homepageLinkText>
    <adminLinkText>Painel de administração</adminLinkText>
    <adminUrl>https://www.athenaconsultoria.com.br/wp-admin/</adminUrl>
    <postEditingUrl>https://www.athenaconsultoria.com.br/wp-admin/post.php</postEditingUrl>
  </weblog>
</manifest>`);
});

// 3. XML-RPC Decoy (/xmlrpc.php)
app.get('/xmlrpc.php', (req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  return res.send('XML-RPC server accepts POST requests only.');
});

app.post('/xmlrpc.php', async (req, res) => {
  const clientIp = getClientIp(req);
  const userAgent = req.headers['user-agent'] || 'Desconhecido';

  // Tarpit anti-brute-force (2.5s delay)
  await new Promise(r => setTimeout(r, 2500));

  logSecurityEvent({
    event: 'HONEYPOT_XMLRPC_ATTACK',
    ip: clientIp,
    userAgent,
    outcome: 'BLOCKED',
    reason: 'Ataque ou probe contra XML-RPC WordPress interceptado pelo Honeypot'
  });

  ipSecurityTracker.set(clientIp, { failedAttempts: 99, isBlocked: true, blockedAt: new Date() });
  sendHoneypotAlertEmail(clientIp, '/xmlrpc.php [XML-RPC PROBE/ATTACK]', userAgent);

  res.setHeader('Content-Type', 'text/xml; charset=utf-8');
  return res.status(405).send(`<?xml version="1.0"?>
<methodResponse>
  <fault>
    <value>
      <struct>
        <member>
          <name>faultCode</name>
          <value><int>405</int></value>
        </member>
        <member>
          <name>faultString</name>
          <value><string>XML-RPC server accepts POST requests only.</string></value>
        </member>
      </struct>
    </value>
  </fault>
</methodResponse>`);
});

// 4. WordPress Interactive Login Honeypot (/wp-login.php, /wp-admin, /wp-admin/)
app.get(['/wp-login.php', '/wp-admin', '/wp-admin/'], (req, res) => {
  const clientIp = getClientIp(req);
  const userAgent = req.headers['user-agent'] || 'Desconhecido';

  logSecurityEvent({
    event: 'HONEYPOT_WP_LOGIN_PROBE',
    ip: clientIp,
    userAgent,
    outcome: 'MONITORED',
    reason: `Scanner acessou página de login simulada do WordPress: ${req.originalUrl}`
  });

  sendHoneypotAlertEmail(clientIp, req.originalUrl, userAgent);

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.send(renderWpLoginHtml());
});

app.post(['/wp-login.php', '/wp-admin', '/wp-admin/'], async (req, res) => {
  const clientIp = getClientIp(req);
  const userAgent = req.headers['user-agent'] || 'Desconhecido';
  const attemptedUser = req.body.log || req.body.username || req.body.user || '';
  const attemptedPwd = req.body.pwd || req.body.password || '';

  // Tarpit defensivo ativo: retarda ataques automatizados de força bruta por 2.5 segundos
  await new Promise(r => setTimeout(r, 2500));

  logSecurityEvent({
    event: 'HONEYPOT_WP_LOGIN_ATTEMPT',
    ip: clientIp,
    userAgent,
    outcome: 'BLOCKED',
    reason: `Tentativa de login capturada no WordPress Decoy: usuário "${attemptedUser}"`,
    details: { attemptedUser, attemptedPwd: attemptedPwd ? '***' : '(vazio)' }
  });

  // Bloqueio no tracker de memória
  ipSecurityTracker.set(clientIp, { failedAttempts: 99, isBlocked: true, blockedAt: new Date() });

  // Bloqueio permanente no PostgreSQL se não for tráfego local
  if (pool && !isInfrastructureOrPrivateIp(clientIp)) {
    try {
      await pool.query(`
        INSERT INTO security_ip_blocklist (ip, failed_attempts, is_blocked, blocked_at, blocked_reason, updated_at)
        VALUES ($1, 99, true, CURRENT_TIMESTAMP, $2, CURRENT_TIMESTAMP)
        ON CONFLICT (ip) DO UPDATE SET 
          failed_attempts = 99,
          is_blocked = true,
          blocked_at = CURRENT_TIMESTAMP,
          blocked_reason = $2,
          updated_at = CURRENT_TIMESTAMP
      `, [clientIp, `Honeypot WP-Login: tentou usuário "${attemptedUser}"`]);
    } catch (e) {
      console.warn('[Honeypot DB Block] Erro ao gravar IP no blocklist:', e.message);
    }
  }

  // Notificação com as credenciais testadas
  sendHoneypotAlertEmail(clientIp, '/wp-login.php [CREDS HARVESTED]', userAgent, {
    user: attemptedUser,
    password: attemptedPwd
  });

  // Resposta idêntica ao WordPress autêntico (simulando falha de autenticação legítima)
  const safeUser = String(attemptedUser || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const errorMsg = `<strong>Erro:</strong> O nome de usuário <strong>${safeUser || 'informado'}</strong> não está registrado neste site. Se você não tem certeza do seu nome de usuário, tente seu endereço de e-mail.<br>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(200).send(renderWpLoginHtml(attemptedUser, errorMsg));
});

// 5. Outras rotas críticas de exploração (scanner genérico, .env, .git, etc.)
const HONEYPOT_PATHS = [
  '/.env',
  '/.git',
  '/.git/config',
  '/.aws/credentials',
  '/phpmyadmin',
  '/pma',
  '/admin.php',
  '/config.json',
  '/boaform/admin/formLogin',
  '/actuator/gateway/routes',
  '/api/.env'
];

app.use((req, res, next) => {
  const pathLower = req.path.toLowerCase();
  const isHoneypot = HONEYPOT_PATHS.some(p => pathLower === p || pathLower.startsWith(p + '/'));

  if (isHoneypot) {
    const clientIp = getClientIp(req);
    const userAgent = req.headers['user-agent'] || 'Desconhecido';

    logSecurityEvent({
      event: 'HONEYPOT_TRAP_TRIGGERED',
      ip: clientIp,
      userAgent,
      outcome: 'BLOCKED',
      reason: `Bot tentou explorar rota-armadilha: ${req.originalUrl}`
    });

    ipSecurityTracker.set(clientIp, {
      failedAttempts: 99,
      isBlocked: true,
      blockedAt: new Date()
    });

    sendHoneypotAlertEmail(clientIp, req.originalUrl, userAgent);

    return res.status(404).send('Not Found');
  }

  next();
});

// -------------------------------------------------------------
// SECURE PROTECTED SWAGGER DOCUMENTATION SETUP (/api-docs)
// -------------------------------------------------------------
const SWAGGER_USER = process.env.SWAGGER_USER || 'admin';
const SWAGGER_PASSWORD = process.env.SWAGGER_PASSWORD || 'AthenaAdmin2026!';

const swaggerAuth = basicAuth({
  users: { [SWAGGER_USER]: SWAGGER_PASSWORD },
  challenge: true,
  realm: 'Athena API Documentation Restricted Access'
});

const swaggerDocument = require('./swaggerDocument');

app.use('/api-docs', swaggerAuth, swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/docs', swaggerAuth, swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Public OpenAPI spec endpoint for Hermes Agent, AGY and Developer Tools
app.get('/api/openapi.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json(swaggerDocument);
});

// =============================================================
// ATHENA OS v2.1 — OPERATIONS, WEBHOOKS & LOGISTICS ROUTERS
// =============================================================
app.use('/api/internal/ops', opsRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/admin', authenticateToken, requireStaff, opsAdminRoutes);
app.use('/api/admin/ops', authenticateToken, requireStaff, opsAdminRoutes);
app.use('/api/admin/orders', authenticateToken, requireStaff, opsAdminRoutes);
app.use('/api/admin/fulfillment', authenticateToken, requireStaff, opsAdminRoutes);
app.use('/api/admin/activations', authenticateToken, requireStaff, opsAdminRoutes);
app.use('/api/customer/orders', authenticateToken, customerOrderRoutes);
app.use('/api/customer/orders-v2', authenticateToken, customerOrderRoutes);

// -------------------------------------------------------------
// POSTGRESQL POOL SETUP & USERS TABLE (IPV4 COMPLIANT POOLER)
// -------------------------------------------------------------
const dbConnectionString = process.env.DATABASE_URL;

let pool = null;
if (dbConnectionString) {
  pool = new Pool({
    connectionString: dbConnectionString,
    ssl: { rejectUnauthorized: false }
  });
  console.log('PostgreSQL athena-db conectado via DATABASE_URL');
}

// Helper for safe password comparison (handles plain text and bcrypt hashes safely)
function checkPassword(inputPassword, storedPassword) {
  if (!inputPassword || !storedPassword) return false;
  if (inputPassword === storedPassword) return true;
  try {
    return bcrypt.compareSync(inputPassword, storedPassword);
  } catch (err) {
    return false;
  }
}

// Asynchronous password comparison (Uses libuv threadpool without blocking event loop)
async function checkPasswordAsync(inputPassword, storedPassword) {
  if (!inputPassword || !storedPassword) return false;
  if (inputPassword === storedPassword) return true;
  try {
    return await bcrypt.compare(inputPassword, storedPassword);
  } catch (err) {
    return false;
  }
}

async function initDb() {
  if (pool) {
    try {
      // Create Users Table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(100) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL DEFAULT 'vendedor',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Initialize Super Admin User if no users exist
      const adminEmail = (process.env.ADMIN_EMAIL || 'administracao@athenaconsultoria.com.br').trim().toLowerCase();
      const adminPassword = process.env.ADMIN_PASSWORD || 'Athena16/10*';
      const adminName = process.env.ADMIN_NAME || 'Administrador Geral';

      const userCheck = await pool.query('SELECT id FROM users LIMIT 1');
      if (userCheck.rows.length === 0) {
        console.log(`Criando usuario Administrador inicial (${adminEmail})...`);
        const adminHash = bcrypt.hashSync(adminPassword, 10);
        await pool.query(`
          INSERT INTO users (id, name, email, password_hash, role) 
          VALUES ($1, $2, $3, $4, $5)
        `, ['user_admin_default', adminName, adminEmail, adminHash, 'admin']);
      }

      await pool.query(`
        CREATE TABLE IF NOT EXISTS departments (
          id VARCHAR(100) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          short_name VARCHAR(100),
          icon VARCHAR(100),
          "order" INT DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS categories (
          id VARCHAR(100) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255),
          description TEXT,
          icon VARCHAR(100),
          "order" INT DEFAULT 0,
          department_id VARCHAR(100)
        );

        ALTER TABLE categories ADD COLUMN IF NOT EXISTS department_id VARCHAR(100);

        CREATE TABLE IF NOT EXISTS brands (
          id VARCHAR(100) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255),
          description TEXT,
          logo TEXT,
          website_url TEXT,
          "order" INT DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS products (
          id VARCHAR(100) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255),
          category_id VARCHAR(100) REFERENCES categories(id) ON DELETE CASCADE,
          brand_id VARCHAR(100) REFERENCES brands(id) ON DELETE CASCADE,
          price NUMERIC(12,2) DEFAULT 0,
          price_negotiable BOOLEAN DEFAULT TRUE,
          badge VARCHAR(100),
          status VARCHAR(50) DEFAULT 'published',
          is_featured BOOLEAN DEFAULT FALSE,
          image TEXT,
          images JSONB,
          alt_text TEXT,
          description TEXT,
          specs JSONB,
          attachments JSONB,
          in_stock BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Ensure is_featured, images, video_url, custom_tabs exist on products
      await pool.query(`
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images JSONB;
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS video_url TEXT;
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS custom_tabs JSONB;
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS product_type VARCHAR(20) DEFAULT 'physical';
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS a_points INTEGER DEFAULT 0;
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb;
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS compatible_product_ids JSONB DEFAULT '[]'::jsonb;
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS recommended_product_ids JSONB DEFAULT '[]'::jsonb;
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb;
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS model_3d JSONB DEFAULT NULL;

        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS document VARCHAR(50);
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS address JSONB;
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS a_points INTEGER DEFAULT 0;
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT FALSE;
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT FALSE;
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS locked_at TIMESTAMP DEFAULT NULL;
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP DEFAULT NULL;
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS magic_token VARCHAR(255) DEFAULT NULL;
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS magic_token_expires TIMESTAMP DEFAULT NULL;
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS locked_reason VARCHAR(255) DEFAULT NULL;
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS unlocked_by VARCHAR(100) DEFAULT NULL;
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS unlocked_at TIMESTAMP DEFAULT NULL;
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

        CREATE TABLE IF NOT EXISTS security_ip_blocklist (
          ip VARCHAR(64) PRIMARY KEY,
          failed_attempts INTEGER DEFAULT 0,
          is_blocked BOOLEAN DEFAULT FALSE,
          locked_until TIMESTAMP DEFAULT NULL,
          blocked_at TIMESTAMP DEFAULT NULL,
          blocked_reason VARCHAR(255) DEFAULT NULL,
          unblocked_by VARCHAR(100) DEFAULT NULL,
          unblocked_at TIMESTAMP DEFAULT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        ALTER TABLE security_ip_blocklist ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP DEFAULT NULL;
      `);

      // Create Email Verifications Table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS email_verifications (
          id VARCHAR(100) PRIMARY KEY,
          user_id VARCHAR(100),
          email VARCHAR(255) NOT NULL,
          code VARCHAR(20) NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          verified BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create Password Resets Table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS password_resets (
          id VARCHAR(100) PRIMARY KEY,
          email VARCHAR(255) NOT NULL,
          token VARCHAR(255) NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          used BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create Customer Orders & Quotes Table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS orders (
          id VARCHAR(100) PRIMARY KEY,
          user_id VARCHAR(100) REFERENCES users(id) ON DELETE SET NULL,
          user_email VARCHAR(255),
          user_name VARCHAR(255),
          items JSONB NOT NULL,
          total_amount NUMERIC(12,2) DEFAULT 0,
          discount_amount NUMERIC(12,2) DEFAULT 0,
          coupon_code VARCHAR(100),
          status VARCHAR(50) DEFAULT 'em_analise',
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create Coupons Table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS coupons (
          id VARCHAR(100) PRIMARY KEY,
          code VARCHAR(100) UNIQUE NOT NULL,
          description TEXT,
          discount_type VARCHAR(20) DEFAULT 'percentage',
          discount_value NUMERIC(12,2) NOT NULL,
          max_discount NUMERIC(12,2),
          scope_type VARCHAR(20) DEFAULT 'all',
          target_product_ids JSONB DEFAULT '[]',
          target_category_ids JSONB DEFAULT '[]',
          target_brand_ids JSONB DEFAULT '[]',
          min_order_amount NUMERIC(12,2) DEFAULT 0,
          min_item_quantity INTEGER DEFAULT 0,
          customer_type VARCHAR(30) DEFAULT 'all',
          specific_email VARCHAR(255),
          max_usage_total INTEGER DEFAULT 0,
          max_usage_per_customer INTEGER DEFAULT 1,
          used_count INTEGER DEFAULT 0,
          used_by JSONB DEFAULT '[]',
          expires_at TIMESTAMP,
          status VARCHAR(20) DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create A-Points Transactions Table & Ledger Extensions
      await pool.query(`
        CREATE TABLE IF NOT EXISTS a_points_transactions (
          id VARCHAR(100) PRIMARY KEY,
          user_id VARCHAR(100) REFERENCES users(id) ON DELETE SET NULL,
          customer_document VARCHAR(50),
          customer_email VARCHAR(255),
          customer_name VARCHAR(255),
          order_id VARCHAR(100),
          order_value NUMERIC(12,2) DEFAULT 0,
          points_earned INTEGER DEFAULT 0,
          source VARCHAR(50) DEFAULT 'omie',
          type VARCHAR(30) DEFAULT 'EARN',
          status VARCHAR(30) DEFAULT 'available',
          reward_id VARCHAR(100),
          expires_at TIMESTAMP,
          points_reversed INTEGER DEFAULT 0,
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Ensure extensions on existing tables
        ALTER TABLE public.a_points_transactions ADD COLUMN IF NOT EXISTS type VARCHAR(30) DEFAULT 'EARN';
        ALTER TABLE public.a_points_transactions ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'available';
        ALTER TABLE public.a_points_transactions ADD COLUMN IF NOT EXISTS reward_id VARCHAR(100);
        ALTER TABLE public.a_points_transactions ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;
        ALTER TABLE public.a_points_transactions ADD COLUMN IF NOT EXISTS points_reversed INTEGER DEFAULT 0;
        ALTER TABLE public.a_points_transactions ADD COLUMN IF NOT EXISTS notes TEXT;

        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sku VARCHAR(100);
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS omie_product_id BIGINT;
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS omie_code VARCHAR(100);
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS omie_last_sync TIMESTAMP;
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS omie_codigo_produto BIGINT;
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS estoque_quantidade INTEGER DEFAULT 0;
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS preco_venda NUMERIC(12,2) DEFAULT 0;
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

        CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
        CREATE INDEX IF NOT EXISTS idx_products_omie_codigo_produto ON public.products(omie_codigo_produto);
        CREATE INDEX IF NOT EXISTS idx_products_estoque_quantidade ON public.products(estoque_quantidade);
        CREATE INDEX IF NOT EXISTS idx_products_preco_venda ON public.products(preco_venda);

        UPDATE public.products 
        SET sku = omie_code 
        WHERE (sku IS NULL OR sku = '') AND omie_code IS NOT NULL AND omie_code != '';
        CREATE INDEX IF NOT EXISTS idx_users_lower_email ON public.users (LOWER(email));
        CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
        CREATE INDEX IF NOT EXISTS idx_products_brand_id ON public.products(brand_id);
        CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
        CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products(is_featured);

        -- Create Loyalty Rewards Table
        CREATE TABLE IF NOT EXISTS loyalty_rewards (
          id VARCHAR(100) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          category VARCHAR(100) DEFAULT 'accessories',
          points_cost INTEGER NOT NULL,
          cash_cost NUMERIC(12,2) DEFAULT 0,
          image TEXT,
          stock_quantity INTEGER DEFAULT -1,
          product_id VARCHAR(100) REFERENCES products(id) ON DELETE SET NULL,
          is_active BOOLEAN DEFAULT TRUE,
          "order" INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        -- Create System Settings Table
        CREATE TABLE IF NOT EXISTS system_settings (
          key VARCHAR(100) PRIMARY KEY,
          value TEXT NOT NULL,
          description TEXT,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Create Home Banners Table
        CREATE TABLE IF NOT EXISTS home_banners (
          id VARCHAR(100) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          desktop_image TEXT NOT NULL,
          mobile_image TEXT,
          link_url TEXT,
          target_blank BOOLEAN DEFAULT FALSE,
          is_active BOOLEAN DEFAULT TRUE,
          "order" INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Seed starter home banners if table is empty
      try {
        const bannerCheck = await pool.query('SELECT COUNT(*) FROM home_banners');
        if (parseInt(bannerCheck.rows[0].count, 10) === 0) {
          await pool.query(`
            INSERT INTO home_banners (id, title, desktop_image, mobile_image, link_url, target_blank, is_active, "order") VALUES
            ('bnr_launch_scanners', 'Scanners Automotivos Profissionais Launch com IA', 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=1920&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80', '/marca/launch', false, true, 1),
            ('bnr_elevadores_mahovi', 'Linha Completa de Elevadores Automotivos Hidráulicos', 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1920&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&auto=format&fit=crop&q=80', '/categoria/elevadores-automotivos', false, true, 2);
          `);
        }
      } catch (errBnr) {
        console.warn('Aviso ao popular home_banners:', errBnr.message);
      }

      // Seed starter loyalty rewards if table is empty
      try {
        const rewardCheck = await pool.query('SELECT COUNT(*) FROM loyalty_rewards');
        if (parseInt(rewardCheck.rows[0].count, 10) === 0) {
          await pool.query(`
            INSERT INTO loyalty_rewards (id, name, description, category, points_cost, cash_cost, image, "order") VALUES
            ('rw_espuma_cera', 'Espuma Aplicadora de Cera 100mm', 'Espuma macia de alta densidade para aplicação uniforme de ceras e selantes.', 'consumables', 50, 0, 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/espuma-aplicadora.webp', 1),
            ('rw_toalha_microfibra', 'Toalha de Microfibra Especial 40x40cm', 'Toalha de alta gramatura anti-risco para secagem e acabamento automotivo.', 'accessories', 100, 0, 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/toalha-microfibra.webp', 2),
            ('rw_luva_microfibra', 'Luva de Lavagem Automotiva em Microfibra', 'Luva anatômica de microfibra macia com punho elástico para lavagem segura.', 'accessories', 150, 0, 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/luva-lavagem.webp', 3),
            ('rw_kit_soquetes', 'Jogo de Soquetes e Bits Especiais 10 Peças', 'Conjunto compacto de ferramentas em cromo-vanádio para bancada e oficina.', 'tools', 300, 0, 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/jogo-soquetes.webp', 4),
            ('rw_cupom_300', 'Voucher R$ 300 em Novos Equipamentos', 'Desconto direto de R$ 300 na aquisição de elevadores, desmontadoras ou scanners.', 'vouchers', 600, 0, 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/voucher-300.webp', 5),
            ('rw_cupom_600', 'Voucher R$ 600 em Equipamentos Premium', 'Desconto direto de R$ 600 na compra de alinhadores 3D ou recicladoras de ar condicionado.', 'vouchers', 1200, 0, 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/voucher-600.webp', 6);
          `);
        }
      } catch (errRew) {
        console.warn('Aviso ao popular loyalty_rewards:', errRew.message);
      }

      // Seed default notification settings if not existing
      try {
        const defaultAdmin = process.env.ADMIN_EMAIL || 'administracao@athenaconsultoria.com.br';
        const defaultSettings = [
          { key: 'receipt_notification_email', value: defaultAdmin, desc: 'E-mail para recebimento de comprovantes de compras e resgates' },
          { key: 'loyalty_notification_email', value: '', desc: 'E-mail específico para alertas de resgate de fidelidade (opcional)' },
          { key: 'purchase_notification_email', value: '', desc: 'E-mail específico para alertas de compras / faturamento (opcional)' },
          { key: 'email_notifications_enabled', value: 'true', desc: 'Habilita envio de alertas por e-mail' },
          { key: 'send_customer_copy', value: 'true', desc: 'Envia cópia do comprovante para o e-mail do cliente' }
        ];

        for (const s of defaultSettings) {
          await pool.query(`
            INSERT INTO system_settings (key, value, description)
            VALUES ($1, $2, $3)
            ON CONFLICT (key) DO NOTHING
          `, [s.key, s.value, s.desc]);
        }
      } catch (errSet) {
        console.warn('Aviso ao inicializar system_settings:', errSet.message);
      }

      // Ensure Row Level Security (RLS) on all public tables in Supabase
      try {
        await pool.query(`
          ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
          ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
          ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
          ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
          ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
          ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
          ALTER TABLE public.a_points_transactions ENABLE ROW LEVEL SECURITY;
          ALTER TABLE public.loyalty_rewards ENABLE ROW LEVEL SECURITY;
          ALTER TABLE public.email_verifications ENABLE ROW LEVEL SECURITY;
          ALTER TABLE public.password_resets ENABLE ROW LEVEL SECURITY;
          ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
        `);
      } catch (rlsErr) {
        console.warn('Aviso ao aplicar RLS:', rlsErr.message);
      }

      const catCheck = await pool.query('SELECT COUNT(*) FROM categories');
      if (parseInt(catCheck.rows[0].count, 10) === 0) {
        await pool.query(`
          INSERT INTO categories (id, name, slug, description, icon, "order") VALUES
          ('cat_elevadores', 'Elevadores', 'elevadores', 'Elevadores hidráulicos de 2 colunas, 4 colunas e tesoura para automóveis e utilitários.', 'Layers', 1),
          ('cat_scanners', 'Scanners', 'scanners', 'Scanners e leitores de diagnóstico automotivo multimarca de última geração com IA.', 'Cpu', 2),
          ('cat_alinhadores', 'Alinhadores', 'alinhadores', 'Sistemas de alinhamento de direção 3D computadorizados com câmeras de alta precisão.', 'Target', 3),
          ('cat_desmontadoras', 'Desmontadoras & Balanceadoras', 'desmontadoras', 'Equipamentos para serviços de borracharia, desmontadoras pneumáticas e balanceadoras de rodas.', 'Disc', 4),
          ('cat_ferramentas', 'Ferramentas & Armários', 'ferramentas-armarios', 'Kits de soquetes, ferramentas pneumáticas, chaves de impacto e armários modulares para oficina.', 'Wrench', 5);
        `);
      }

      const brandCheck = await pool.query('SELECT COUNT(*) FROM brands');
      if (parseInt(brandCheck.rows[0].count, 10) === 0) {
        await pool.query(`
          INSERT INTO brands (id, name, slug, description, logo, website_url, "order") VALUES
          ('brand_mahovi', 'Mahovi', 'mahovi', 'Líder nacional em elevadores automotivos, alinhadores 3D e desmontadoras.', 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/marcas/mahovi-d2fca4c6358b.webp', 'https://mahovi.com.br', 1),
          ('brand_delta', 'Delta Ferramentas', 'delta', 'Referência em equipamentos de teste, canetas de polaridade e teste de baterias.', 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/marcas/delta-47d4582fff78.webp', 'https://deltaferramentas.com.br', 2),
          ('brand_starkx', 'Stärkx', 'starkx', 'Scanners de diagnóstico profissional multimarca e testadores com IA Thinkcar.', 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/marcas/starkx-5e830ec912b7.webp', 'https://starkx.com.br', 3),
          ('brand_wolfcar', 'Wolfcar', 'wolfcar', 'Móveis modulares premium, bancadas em inox e armários para centro automotivo.', 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/marcas/wolfcar-63a7bd61556f.webp', 'https://wolfcar.com.br', 4),
          ('brand_sigmatools', 'Sigma Tools', 'sigma-tools', 'Chaves de impacto pneumáticas, soquetes especiais em Cr-Mo e carrinhos ergonômicos.', 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/marcas/sigma-tools-7ceda13e30aa.webp', 'https://sigmatools.com.br', 5);
        `);
      } else {
        // Atualiza marcas existentes para garantir logos R2 oficiais
        await pool.query(`
          UPDATE brands SET logo = 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/marcas/mahovi-d2fca4c6358b.webp' WHERE (id = 'brand_mahovi' OR slug = 'mahovi') AND (logo LIKE '%unsplash%' OR logo = '' OR logo IS NULL);
          UPDATE brands SET logo = 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/marcas/delta-47d4582fff78.webp' WHERE (id = 'brand_delta' OR slug = 'delta' OR slug = 'delta-ferramentas') AND (logo LIKE '%unsplash%' OR logo = '' OR logo IS NULL);
          UPDATE brands SET logo = 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/marcas/starkx-5e830ec912b7.webp' WHERE (id = 'brand_starkx' OR slug = 'starkx') AND (logo LIKE '%unsplash%' OR logo = '' OR logo IS NULL);
          UPDATE brands SET logo = 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/marcas/wolfcar-63a7bd61556f.webp' WHERE (id = 'brand_wolfcar' OR slug = 'wolfcar') AND (logo LIKE '%unsplash%' OR logo = '' OR logo IS NULL);
          UPDATE brands SET logo = 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/marcas/sigma-tools-7ceda13e30aa.webp' WHERE (id = 'brand_sigmatools' OR slug = 'sigma-tools') AND (logo LIKE '%unsplash%' OR logo = '' OR logo IS NULL);
        `);
      }
      // Ensure automatic updated_at trigger on products table for dynamic catalog versioning
      try {
        await pool.query(`
          CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
          RETURNS TRIGGER AS $$
          BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
          END;
          $$ LANGUAGE plpgsql;

          DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
          CREATE TRIGGER trg_products_updated_at
          BEFORE UPDATE ON products
          FOR EACH ROW
          EXECUTE FUNCTION set_updated_at_timestamp();
        `);
      } catch (trgErr) {
        console.warn('[Trigger Notice]:', trgErr.message);
      }

      // Migrate any stale/broken images.athenaconsultoria.com.br URLs back to the canonical public R2 endpoint
      try {
        await pool.query(`
          UPDATE products 
          SET image = REPLACE(image, 'https://images.athenaconsultoria.com.br', 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev')
          WHERE image LIKE '%images.athenaconsultoria.com.br%';
        `);
        await pool.query(`
          UPDATE products 
          SET images = (
            SELECT jsonb_agg(to_jsonb(REPLACE(elem, 'https://images.athenaconsultoria.com.br', 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev')))
            FROM jsonb_array_elements_text(COALESCE(images, '[]'::jsonb)) AS elem
          )
          WHERE images::text LIKE '%images.athenaconsultoria.com.br%';
        `);
        await pool.query(`
          UPDATE brands 
          SET logo = REPLACE(logo, 'https://images.athenaconsultoria.com.br', 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev')
          WHERE logo LIKE '%images.athenaconsultoria.com.br%';
        `);
        console.log('[CDN Migration] Imagens verificadas e migradas para endpoint canônico R2 no PostgreSQL!');
      } catch (migErr) {
        console.warn('[CDN Migration Notice]:', migErr.message);
      }

      console.log('PostgreSQL athena-db pronto!');

    } catch (err) {
      console.error('Erro na inicialização do PostgreSQL:', err);
    }
  } else {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(DB_PATH)) {
      const initialData = {
        users: [
          { id: 'user_admin_default', name: 'Administrador Geral', email: 'admin@athena.com.br', passwordHash: 'admin123', role: 'admin' }
        ],
        categories: [
          { id: 'cat_elevadores', name: 'Elevadores', slug: 'elevadores', description: 'Elevadores hidráulicos', icon: 'Layers', order: 1 }
        ],
        brands: [
          { id: 'brand_engecass', name: 'Engecass', slug: 'engecass', description: 'Líder nacional', logo: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=200&auto=format&fit=crop&q=80', websiteUrl: 'https://engecass.com.br', order: 1 }
        ],
        products: []
      };
      fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
    }
  }
}

function readDbJson() {
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(DB_PATH)) return { users: [], categories: [], brands: [], products: [], coupons: [], orders: [], aPointsTransactions: [] };
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    const data = JSON.parse(raw);
    if (!Array.isArray(data.coupons)) data.coupons = [];
    if (!Array.isArray(data.orders)) data.orders = [];
    if (!Array.isArray(data.users)) data.users = [];
    if (!Array.isArray(data.products)) data.products = [];
    if (!Array.isArray(data.categories)) data.categories = [];
    if (!Array.isArray(data.brands)) data.brands = [];
    if (!Array.isArray(data.aPointsTransactions)) data.aPointsTransactions = [];
    if (!Array.isArray(data.banners)) data.banners = [];
    if (data.banners.length === 0) {
      data.banners = [
        {
          id: 'bnr_launch_scanners',
          title: 'Scanners Automotivos Profissionais Launch com IA',
          desktopImage: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=1920&auto=format&fit=crop&q=80',
          mobileImage: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80',
          linkUrl: '/marca/launch',
          targetBlank: false,
          isActive: true,
          order: 1
        },
        {
          id: 'bnr_elevadores_mahovi',
          title: 'Linha Completa de Elevadores Automotivos Hidráulicos',
          desktopImage: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1920&auto=format&fit=crop&q=80',
          mobileImage: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&auto=format&fit=crop&q=80',
          linkUrl: '/categoria/elevadores-automotivos',
          targetBlank: false,
          isActive: true,
          order: 2
        }
      ];
    }
    return data;
  } catch (e) {
    return { users: [], categories: [], brands: [], products: [], coupons: [], orders: [], aPointsTransactions: [], banners: [] };
  }
}

function writeDbJson(data) {
  if (pool) return;
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Aviso: Falha ao persistir athena-db.json local (não-crítico com PostgreSQL):', err.message);
  }
}

initDb();

// =============================================================
// SYSTEM SETTINGS & NOTIFICATION SERVICES
// =============================================================

function normalizeEmailList(raw) {
  if (!raw) return '';
  return String(raw)
    .split(/[,;]+/)
    .map(e => e.trim().toLowerCase())
    .filter(e => e.length > 3 && e.includes('@'))
    .join(', ');
}

function formatBrlNumber(val) {
  return Number(val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatBrtDate(d = new Date()) {
  try {
    return new Date(d).toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return new Date(d).toISOString();
  }
}

async function getSystemSetting(key, defaultValue = '') {
  if (pool) {
    try {
      const res = await pool.query('SELECT value FROM system_settings WHERE key = $1 LIMIT 1', [key]);
      if (res.rows.length > 0 && res.rows[0].value !== null) {
        return res.rows[0].value;
      }
    } catch (e) {
      console.warn(`[SETTINGS] Falha ao consultar configuração "${key}":`, e.message);
    }
  }
  const db = readDbJson();
  if (db.systemSettings && db.systemSettings[key] !== undefined) {
    return db.systemSettings[key];
  }
  return defaultValue;
}

async function setSystemSetting(key, value, description = '') {
  const strVal = String(value ?? '');
  if (pool) {
    try {
      await pool.query(`
        INSERT INTO system_settings (key, value, description, updated_at)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (key) DO UPDATE
        SET value = EXCLUDED.value, description = COALESCE(EXCLUDED.description, system_settings.description), updated_at = NOW()
      `, [key, strVal, description]);
    } catch (e) {
      console.error(`[SETTINGS] Falha ao salvar configuração "${key}":`, e.message);
    }
  }
  const db = readDbJson();
  if (!db.systemSettings) db.systemSettings = {};
  db.systemSettings[key] = strVal;
  writeDbJson(db);
}

async function getNotificationSettings() {
  const defaultAdmin = process.env.ADMIN_EMAIL || 'administracao@athenaconsultoria.com.br';
  const receiptEmail = (await getSystemSetting('receipt_notification_email', defaultAdmin)).trim();
  const loyaltyEmail = (await getSystemSetting('loyalty_notification_email', '')).trim();
  const purchaseEmail = (await getSystemSetting('purchase_notification_email', '')).trim();
  const enabledStr = (await getSystemSetting('email_notifications_enabled', 'true')).trim().toLowerCase();
  const sendCustomerCopyStr = (await getSystemSetting('send_customer_copy', 'true')).trim().toLowerCase();

  const rawResend = process.env.RESEND_API_KEY || (await getSystemSetting('resend_api_key', '')) || '';
  const resendApiKey = rawResend.trim();
  const resendFromEmail = (await getSystemSetting('resend_from_email', process.env.RESEND_FROM || '')).trim();

  const rawBrevo = process.env.BREVO_API_KEY || (await getSystemSetting('brevo_api_key', '')) || '';
  const brevoApiKey = rawBrevo.trim();
  const brevoSenderEmail = (await getSystemSetting('brevo_sender_email', process.env.BREVO_SENDER || 'athena.consultoria.automotiva@gmail.com')).trim();

  let activeProvider = 'log';
  if (resendApiKey) activeProvider = 'resend';
  else if (brevoApiKey) activeProvider = 'brevo';
  else if (mailTransporter) activeProvider = 'smtp';

  return {
    receiptNotificationEmail: receiptEmail || defaultAdmin,
    loyaltyNotificationEmail: loyaltyEmail,
    purchaseNotificationEmail: purchaseEmail,
    emailNotificationsEnabled: enabledStr !== 'false',
    sendCustomerCopy: sendCustomerCopyStr !== 'false',
    resendApiKey: resendApiKey ? (resendApiKey.slice(0, 5) + '••••••••' + resendApiKey.slice(-4)) : '',
    hasResendApiKey: Boolean(resendApiKey),
    resendFromEmail,
    brevoApiKey: brevoApiKey ? (brevoApiKey.slice(0, 5) + '••••••••' + brevoApiKey.slice(-4)) : '',
    hasBrevoApiKey: Boolean(brevoApiKey),
    brevoSenderEmail,
    activeProvider,
    smtpConfigured: !!mailTransporter,
    smtpUser: SMTP_USER,
    smtpSender: SMTP_FROM
  };
}

// -------------------------------------------------------------
// CENTRAL EMAIL DISPATCHER (HTTP REST APIs & SMTP Fallback)
// Suporta Resend API e Brevo API (HTTP Porta 443 - Imunes a bloqueios de portas SMTP do Render Free tier)
// com fallback para Nodemailer SMTP do Gmail (Porta 587)
// -------------------------------------------------------------
async function sendDispatchedEmail({ to, subject, html, replyTo, from }) {
  const recipients = normalizeEmailList(to);
  if (!recipients) {
    console.log('[EMAIL] Nenhum destinatário válido informado para:', subject);
    return { success: false, reason: 'no_recipient' };
  }

  // 1. Provedor Resend API (HTTP Port 443 - Recomendado para nuvem / Render)
  let resendKey = process.env.RESEND_API_KEY || '';
  if (!resendKey) {
    try {
      resendKey = (await getSystemSetting('resend_api_key', '')) || '';
    } catch (_) {}
  }
  resendKey = resendKey.trim();

  if (resendKey) {
    try {
      const toList = recipients.split(',').map(e => e.trim()).filter(Boolean);
      let resendFrom = process.env.RESEND_FROM || '';
      if (!resendFrom) {
        try {
          resendFrom = (await getSystemSetting('resend_from_email', '')) || '';
        } catch (_) {}
      }
      resendFrom = resendFrom.trim() || 'Athena Soluções Automotivas <onboarding@resend.dev>';

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: resendFrom,
          to: toList,
          subject,
          html,
          reply_to: replyTo || 'contato@athenaconsultoria.com.br'
        })
      });

      const resData = await response.json();
      if (response.ok && resData?.id) {
        console.log(`[EMAIL RESEND SUCESSO] Para: ${recipients} | Assunto: ${subject} | ID: ${resData.id}`);
        return { success: true, provider: 'resend', messageId: resData.id };
      } else {
        const errorMsg = resData?.message || resData?.error || JSON.stringify(resData);
        console.error(`[EMAIL RESEND ERRO] Falha no envio para ${recipients}:`, errorMsg);
        return { success: false, provider: 'resend', error: errorMsg };
      }
    } catch (rErr) {
      console.error(`[EMAIL RESEND EXCEÇÃO] Falha na requisição:`, rErr.message);
      return { success: false, provider: 'resend', error: rErr.message };
    }
  }

  // 2. Provedor Brevo / Sendinblue API (HTTP Port 443)
  let brevoKey = process.env.BREVO_API_KEY || '';
  if (!brevoKey) {
    try {
      brevoKey = (await getSystemSetting('brevo_api_key', '')) || '';
    } catch (_) {}
  }
  brevoKey = brevoKey.trim();

  if (brevoKey) {
    try {
      const toObjects = recipients.split(',').map(e => ({ email: e.trim() })).filter(x => x.email);
      let brevoSender = process.env.BREVO_SENDER || '';
      if (!brevoSender) {
        try {
          brevoSender = (await getSystemSetting('brevo_sender_email', '')) || '';
        } catch (_) {}
      }
      brevoSender = brevoSender.trim() || SMTP_USER || 'athena.consultoria.automotiva@gmail.com';

      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': brevoKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sender: {
            name: 'Athena Soluções Automotivas',
            email: brevoSender
          },
          to: toObjects,
          subject,
          htmlContent: html,
          replyTo: { email: replyTo || 'contato@athenaconsultoria.com.br' }
        })
      });

      const resData = await response.json();
      if (response.ok && (resData?.messageId || resData?.messageIds)) {
        console.log(`[EMAIL BREVO SUCESSO] Para: ${recipients} | Assunto: ${subject} | ID: ${resData.messageId || JSON.stringify(resData.messageIds)}`);
        return { success: true, provider: 'brevo', messageId: resData.messageId || 'brevo-sent' };
      } else {
        const errorMsg = resData?.message || resData?.error || JSON.stringify(resData);
        console.error(`[EMAIL BREVO ERRO] Falha no envio para ${recipients}:`, errorMsg);
        return { success: false, provider: 'brevo', error: errorMsg };
      }
    } catch (bErr) {
      console.error(`[EMAIL BREVO EXCEÇÃO] Falha na requisição:`, bErr.message);
      return { success: false, provider: 'brevo', error: bErr.message };
    }
  }

  // 3. Fallback: Servidor SMTP Nodemailer (Gmail / Hospedagem)
  if (mailTransporter) {
    try {
      const info = await mailTransporter.sendMail({
        from: from || SMTP_FROM,
        to: recipients,
        replyTo: replyTo || 'contato@athenaconsultoria.com.br',
        subject,
        html
      });
      console.log(`[EMAIL SMTP ENVIADO COM SUCESSO] Para: ${recipients} | Assunto: ${subject} | ID: ${info.messageId}`);
      return { success: true, provider: 'smtp', messageId: info.messageId };
    } catch (err) {
      const isTimeout = err.message && (err.message.includes('timeout') || err.message.includes('ETIMEDOUT') || err.code === 'ETIMEDOUT');
      let friendlyError = err.message;
      if (isTimeout) {
        friendlyError = `Connection timeout no SMTP (Portas 587/465 bloqueadas na nuvem Render Free tier). Para enviar sem bloqueio, cadastre uma chave gratuita do Resend ou Brevo no painel em Configurações.`;
      }
      console.error(`[EMAIL ERRO] Falha no envio para ${recipients}:`, friendlyError);
      return { success: false, provider: 'smtp', error: friendlyError, isTimeout };
    }
  }

  console.log(`[DEBUG EMAIL LOG] Para: ${recipients} | Assunto: ${subject}`);
  return { success: true, provider: 'log', method: 'log' };
}

async function sendGenericNotificationEmail({ to, subject, htmlContent, replyTo }) {
  return await sendDispatchedEmail({
    to,
    subject,
    html: htmlContent,
    replyTo
  });
}

// Map de controle de cooldown para alertas (evita rajadas e estouro de cota SMTP)
const alertCooldownMap = new Map(); // key -> timestamp

function isAlertInCooldown(key, cooldownMinutes = 60) {
  const lastSent = alertCooldownMap.get(key);
  if (lastSent && (Date.now() - lastSent) < cooldownMinutes * 60 * 1000) {
    return true;
  }
  alertCooldownMap.set(key, Date.now());
  return false;
}

async function sendHoneypotAlertEmail(clientIp, targetPath, userAgent, extraDetails = null) {
  const cooldownKey = `honeypot_${clientIp}`;
  if (isAlertInCooldown(cooldownKey, 60)) {
    return; // Já alertou este IP na última hora, silencia para não floodar
  }

  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'administracao@athenaconsultoria.com.br';
    
    let extraRows = '';
    if (extraDetails && (extraDetails.user || extraDetails.password)) {
      const safeU = String(extraDetails.user || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const safeP = String(extraDetails.password || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      extraRows = `
        <tr>
          <td style="padding: 6px 0; color: #b91c1c; font-weight: 600;">Credenciais Testadas:</td>
          <td style="padding: 6px 0; color: #b91c1c; font-family: monospace; font-weight: bold;">
            Usuário: &quot;${safeU}&quot; | Senha: &quot;${safeP}&quot;
          </td>
        </tr>
      `;
    }

    const htmlContent = buildAthenaEmailHtml({
      maxWidth: 580,
      badgeText: '🛡️ Honeypot Ativado • Atacante Bloqueado',
      badgeBg: '#fef2f2',
      badgeColor: '#b91c1c',
      badgeBorder: '#fecaca',
      title: 'Tentativa de Invasão Capturada no Honeypot',
      subtitle: 'Um bot ou atacante tentou explorar rota-armadilha simulada (WordPress decoy) e foi bloqueado preventivamente.',
      bodyHtml: `
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 600; width: 140px;">Endereço IP:</td>
              <td style="padding: 6px 0; color: #0f172a; font-family: monospace; font-weight: bold;">${clientIp}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Rota Explorada:</td>
              <td style="padding: 6px 0; color: #dc2626; font-family: monospace; font-weight: bold;">${targetPath}</td>
            </tr>
            ${extraRows}
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Data e Hora:</td>
              <td style="padding: 6px 0; color: #0f172a;">${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 600;">User-Agent:</td>
              <td style="padding: 6px 0; color: #334155; font-size: 11px; word-break: break-all;">${userAgent}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Ação do Sistema:</td>
              <td style="padding: 6px 0; color: #15803d; font-weight: bold;">IP Quarentenado • Tarpit Aplicado • Bloqueio Ativo</td>
            </tr>
          </table>
        </div>
        <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 0; text-align: center;">
          💡 <em>Não é necessária nenhuma ação manual no momento. O honeypot da Athena mitigou a ameaça e bloqueou o atacante.</em>
        </p>
      `
    });

    await sendDispatchedEmail({
      to: adminEmail,
      subject: `🚨 [Segurança Athena] Honeypot Capturou Tentativa de Invasão: IP ${clientIp} em "${targetPath}"`,
      html: htmlContent
    });
  } catch (err) {
    console.error('[Honeypot Alert] Falha ao enviar e-mail de alerta:', err.message);
  }
}

async function sendCriticalErrorAlertEmail(err, req, clientIp) {
  const routeKey = `error_${req.method}_${req.path}`;
  if (isAlertInCooldown(routeKey, 10)) {
    return; // Silencia se o mesmo erro disparar em menos de 10 minutos
  }

  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'administracao@athenaconsultoria.com.br';
    const errStack = (err.stack || err.message || 'Sem stack trace disponível').substring(0, 1500);

    const htmlContent = buildAthenaEmailHtml({
      maxWidth: 620,
      badgeText: '🚨 Erro Crítico 500 Detectado',
      badgeBg: '#fef2f2',
      badgeColor: '#b91c1c',
      badgeBorder: '#fecaca',
      title: 'Exceção Não Tratada na API',
      subtitle: 'O sistema capturou uma falha interna na API durante uma requisição de usuário.',
      bodyHtml: `
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 600; width: 140px;">Endpoint / Rota:</td>
              <td style="padding: 6px 0; color: #0f172a; font-family: monospace; font-weight: bold;">${req.method} ${req.originalUrl}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Mensagem de Erro:</td>
              <td style="padding: 6px 0; color: #dc2626; font-weight: bold;">${err.message || 'Erro sem mensagem'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Data e Hora:</td>
              <td style="padding: 6px 0; color: #0f172a;">${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 600;">IP de Origem:</td>
              <td style="padding: 6px 0; color: #0f172a; font-family: monospace;">${clientIp}</td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom: 20px;">
          <span style="font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; display: block; margin-bottom: 6px;">Stack Trace (Trecho):</span>
          <pre style="background-color: #0f172a; color: #e2e8f0; padding: 14px; border-radius: 10px; font-size: 11px; overflow-x: auto; white-space: pre-wrap; font-family: monospace;">${errStack}</pre>
        </div>
      `
    });

    await sendDispatchedEmail({
      to: adminEmail,
      subject: `🚨 [Alerta API Athena] Erro 500 em ${req.method} ${req.path}: ${err.message}`,
      html: htmlContent
    });
  } catch (alertErr) {
    console.error('[Critical Error Alert] Falha ao enviar e-mail de alerta:', alertErr.message);
  }
}

// -------------------------------------------------------------
// COMPROVANTE DE RESGATE DE PONTOS (LOYALTY REDEMPTION)
// -------------------------------------------------------------
async function sendLoyaltyRedemptionReceiptNotification({
  txId,
  reward,
  customerName = 'Cliente',
  customerCpfCnpj = '',
  customerEmail = '',
  customerPhone = '',
  previousPoints = 0,
  remainingPoints = 0,
  deliveryMethod = 'shipping',
  shippingAddress = null,
  addressSummary = '',
  deliveryNotes = '',
  notes = ''
}) {
  try {
    const config = await getNotificationSettings();
    if (!config.emailNotificationsEnabled) {
      console.log('[NOTIFICAÇÕES] Disparos por e-mail desativados nas configurações.');
      return { skipped: true, reason: 'disabled' };
    }

    const adminDestination = config.loyaltyNotificationEmail || config.receiptNotificationEmail;
    const cleanPhone = (customerPhone || '').replace(/\D/g, '');
    const waLink = cleanPhone.length >= 10 
      ? `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(`Olá, ${customerName}! Recebemos a sua solicitação de resgate da recompensa "${reward.name}" no Programa de Fidelidade Athena (Protocolo: ${txId}).`)}`
      : null;
    const formattedDate = formatBrtDate();

    // Formatação de Entrega / Despacho
    let deliveryLabel = 'Envio para Endereço';
    let deliveryActionText = 'Separe o item no estoque e providencie a remessa para o endereço de entrega indicado.';
    let isVoucher = reward?.category === 'vouchers' || deliveryMethod === 'commercial_discount' || deliveryMethod === 'voucher';

    if (deliveryMethod === 'pickup') {
      deliveryLabel = 'Retirada na Sede Athena (Arniqueira / Park Way - DF)';
      deliveryActionText = 'Aguarde o comparecimento do cliente na sede física da Athena para retirada do item no balcão, ou confirme agendamento via WhatsApp.';
    } else if (deliveryMethod === 'with_order') {
      deliveryLabel = 'Despachar Junto com Próximo Pedido de Equipamentos';
      deliveryActionText = 'Avise o vendedor responsável para incluir este brinde na nota/remessa do próximo pedido faturado do cliente.';
    } else if (isVoucher) {
      deliveryLabel = 'Voucher Digital / Abatimento Comercial';
      deliveryActionText = 'Abatimento registrado no extrato do cliente. Confirme a dedução correspondente no pedido de venda do Omie ERP.';
    }

    // Resolve endereço formatado se não foi passado como string
    let resolvedAddress = addressSummary;
    if (!resolvedAddress && shippingAddress && typeof shippingAddress === 'object') {
      const p = [];
      if (shippingAddress.street) p.push(`${shippingAddress.street}, ${shippingAddress.number || 'S/N'}${shippingAddress.complement ? ' (' + shippingAddress.complement + ')' : ''}`);
      if (shippingAddress.neighborhood) p.push(shippingAddress.neighborhood);
      if (shippingAddress.city && shippingAddress.state) p.push(`${shippingAddress.city} - ${shippingAddress.state}`);
      else if (shippingAddress.city) p.push(shippingAddress.city);
      if (shippingAddress.cep) p.push(`CEP: ${shippingAddress.cep}`);
      resolvedAddress = p.join(' • ');
    }

    // 1. E-mail detalhado para a Administração / Equipe Athena
    const adminSubject = `[Athena Fidelidade] Resgate de Recompensa: ${reward.name} — ${customerName}`;
    const adminHtml = buildAthenaEmailHtml({
      maxWidth: 600,
      badgeText: 'Resgate de Fidelidade A-Points',
      badgeBg: '#fffbeb',
      badgeColor: '#b45309',
      badgeBorder: '#fde68a',
      title: 'Novo Resgate de Recompensa',
      subtitle: `Solicitação registrada no site por <strong>${customerName}</strong>`,
      bodyHtml: `
        <div style="background-color: #f8fafc; border-radius: 12px; border-left: 4px solid #f59e0b; padding: 16px 18px; margin-bottom: 22px;">
          <p style="margin: 0; color: #0f172a; font-size: 14px; font-weight: 600; line-height: 1.5;">
            O cliente <strong>${customerName}</strong> efetuou o resgate de um brinde utilizando saldo de A-Points.
          </p>
          <p style="margin: 4px 0 0 0; color: #64748b; font-size: 12px;">
            Protocolo da Operação: <code style="color: #b45309; background-color: #fffbeb; padding: 2px 6px; border-radius: 6px; font-weight: 700; border: 1px solid #fde68a;">${txId}</code>
          </p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 22px; font-size: 13px; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
          <tbody>
            <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 11px 16px; color: #64748b; font-weight: 600; width: 38%;">Item Resgatado</td>
              <td style="padding: 11px 16px; color: #0f172a; font-weight: 800; font-size: 14px;">${reward.name}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 11px 16px; color: #64748b; font-weight: 600;">Custo em Pontos</td>
              <td style="padding: 11px 16px; color: #dc2626; font-weight: 800;">- ${reward.points_cost} A-Points</td>
            </tr>
            <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 11px 16px; color: #64748b; font-weight: 600;">Saldo Anterior</td>
              <td style="padding: 11px 16px; color: #475569; font-weight: 600;">${previousPoints} pontos</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 11px 16px; color: #64748b; font-weight: 600;">Novo Saldo Disponível</td>
              <td style="padding: 11px 16px; color: #059669; font-weight: 800;">${remainingPoints} pontos</td>
            </tr>
            <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 11px 16px; color: #64748b; font-weight: 600;">Cliente</td>
              <td style="padding: 11px 16px; color: #0f172a; font-weight: 700;">${customerName}</td>
            </tr>
            ${customerCpfCnpj ? `
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 11px 16px; color: #64748b; font-weight: 600;">CPF / CNPJ</td>
              <td style="padding: 11px 16px; color: #334155; font-family: monospace;">${customerCpfCnpj}</td>
            </tr>` : ''}
            ${customerEmail ? `
            <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 11px 16px; color: #64748b; font-weight: 600;">E-mail do Cliente</td>
              <td style="padding: 11px 16px; color: #334155;">${customerEmail}</td>
            </tr>` : ''}
            ${customerPhone ? `
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 11px 16px; color: #64748b; font-weight: 600;">Telefone / WhatsApp</td>
              <td style="padding: 11px 16px; color: #334155;">${customerPhone}</td>
            </tr>` : ''}
            <tr style="background-color: #f8fafc;">
              <td style="padding: 11px 16px; color: #64748b; font-weight: 600;">Data e Horário</td>
              <td style="padding: 11px 16px; color: #64748b;">${formattedDate} (Brasília)</td>
            </tr>
          </tbody>
        </table>

        <!-- Dados de Entrega / Despacho -->
        <div style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; padding: 18px 20px; margin-bottom: 20px;">
          <p style="margin: 0 0 10px 0; color: #b45309; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
            🚚 Dados de Entrega / Despacho
          </p>
          <div style="margin-bottom: 8px;">
            <span style="color: #64748b; font-size: 12px; font-weight: 600;">Modalidade Escolhida:</span>
            <span style="display: inline-block; margin-left: 6px; padding: 3px 10px; border-radius: 6px; background-color: #e0f2fe; color: #0369a1; font-size: 12px; font-weight: 800; border: 1px solid #bae6fd;">
              ${deliveryLabel}
            </span>
          </div>
          ${deliveryMethod === 'shipping' && resolvedAddress ? `
            <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; margin-top: 8px;">
              <span style="color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 700; display: block; margin-bottom: 4px;">Endereço de Destino:</span>
              <p style="margin: 0; color: #0f172a; font-size: 13px; font-weight: 600; line-height: 1.5;">
                ${resolvedAddress}
              </p>
            </div>
          ` : ''}
          ${deliveryNotes ? `
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #475569; font-style: italic; background-color: #ffffff; border: 1px solid #e2e8f0; padding: 10px 12px; border-radius: 8px;">
              <strong style="color: #b45309;">Observação do Cliente:</strong> "${deliveryNotes}"
            </p>
          ` : ''}
        </div>

        <!-- Próxima Ação Recomendada -->
        <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-left: 4px solid #0284c7; border-radius: 10px; padding: 16px 18px; margin-bottom: 24px;">
          <p style="margin: 0; color: #0369a1; font-size: 13px; font-weight: 800;">
            📌 Próxima Ação da Equipe:
          </p>
          <p style="margin: 6px 0 0 0; color: #0c4a6e; font-size: 12px; line-height: 1.5;">
            ${deliveryActionText}
          </p>
        </div>

        <!-- Botões -->
        <div style="text-align: center;">
          ${waLink ? `
            <a href="${waLink}" style="display: inline-block; background-color: #25d366; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 13px; padding: 12px 22px; border-radius: 10px; margin-right: 8px; margin-bottom: 8px; box-shadow: 0 2px 8px rgba(37, 211, 102, 0.25);">
              💬 Falar no WhatsApp com o Cliente
            </a>
          ` : ''}
          <a href="https://athenaconsultoria.com.br/admin" style="display: inline-block; background-color: #f59e0b; color: #0f172a; text-decoration: none; font-weight: 800; font-size: 13px; padding: 12px 22px; border-radius: 10px; margin-bottom: 8px; box-shadow: 0 2px 8px rgba(245, 158, 11, 0.25);">
            Acessar Painel Admin Athena
          </a>
        </div>
      `
    });

    await sendGenericNotificationEmail({
      to: adminDestination,
      subject: adminSubject,
      htmlContent: adminHtml
    });

    // 2. Cópia de Comprovante para o Cliente
    if (config.sendCustomerCopy && customerEmail && customerEmail.includes('@')) {
      const custSubject = `Comprovante de Resgate — Athena Soluções Automotivas (#${txId.slice(-6)})`;
      const custHtml = buildAthenaEmailHtml({
        maxWidth: 580,
        badgeText: 'Resgate Confirmado com Sucesso',
        badgeBg: '#ecfdf5',
        badgeColor: '#047857',
        badgeBorder: '#a7f3d0',
        title: 'Comprovante de Resgate de Pontos',
        bodyHtml: `
          <p style="margin: 0 0 12px 0; font-size: 15px; color: #0f172a;">
            Olá, <strong>${customerName}</strong>!
          </p>
          <p style="margin: 0 0 20px 0; font-size: 13px; color: #475569; line-height: 1.6;">
            Recebemos com sucesso a solicitação de resgate da sua recompensa com seus A-Points! Guarde este comprovante para seu acompanhamento e controle:
          </p>

          <!-- Card do Benefício Resgatado -->
          <div style="background-color: #f8fafc; border-radius: 14px; padding: 20px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
            <p style="margin: 0 0 6px 0; font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px;">Recompensa Resgatada</p>
            <p style="margin: 0 0 8px 0; font-size: 20px; font-weight: 900; color: #0f172a;">${reward.name}</p>
            <p style="margin: 0 0 14px 0; font-size: 14px; color: #dc2626; font-weight: 800;">- ${reward.points_cost} A-Points debitados</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 12px 0;" />
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <tr>
                <td style="color: #64748b;">Seu saldo atual: <strong style="color: #059669; font-size: 13px;">${remainingPoints} pontos</strong></td>
                <td style="text-align: right; color: #64748b;">Protocolo: <strong style="color: #0f172a;">${txId}</strong></td>
              </tr>
            </table>
          </div>

          <!-- Box de Entrega -->
          <div style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; padding: 18px 20px; margin-bottom: 20px;">
            <p style="margin: 0 0 6px 0; font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px;">Forma de Recebimento</p>
            <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 800; color: #0284c7;">${deliveryLabel}</p>
            ${deliveryMethod === 'shipping' && resolvedAddress ? `
              <p style="margin: 6px 0 0 0; font-size: 12px; color: #475569; line-height: 1.5;">
                ${resolvedAddress}
              </p>
            ` : ''}
          </div>

          <!-- Próximos Passos -->
          <div style="background-color: #ecfdf5; border-radius: 12px; padding: 14px 18px; margin-bottom: 24px; border: 1px solid #a7f3d0;">
            <p style="margin: 0; color: #065f46; font-size: 12px; line-height: 1.6;">
              🚀 <strong>O que acontece agora?</strong> Nossa equipe de atendimento e expedição já recebeu a sua solicitação para providenciar a remessa ou liberação do item conforme a modalidade escolhida.
            </p>
          </div>

          <!-- CTA -->
          <div style="text-align: center;">
            <a href="https://athenaconsultoria.com.br/minha-conta" style="display: inline-block; background-color: #f59e0b; color: #0f172a; text-decoration: none; font-weight: 800; font-size: 13px; padding: 13px 30px; border-radius: 10px; box-shadow: 0 2px 8px rgba(245, 158, 11, 0.25);">
              Acessar Minha Conta Athena
            </a>
          </div>
        `
      });

      await sendGenericNotificationEmail({
        to: customerEmail,
        subject: custSubject,
        htmlContent: custHtml
      });
    }

    return { success: true };
  } catch (err) {
    console.error('[ERRO AO DISPARAR EMAIL RESGATE]:', err.message);
    return { success: false, error: err.message };
  }
}

// -------------------------------------------------------------
// COMPROVANTE DE COMPRA & ACÚMULO DE PONTOS (PURCHASE & EARN)
// -------------------------------------------------------------
async function sendPurchaseReceiptNotification({
  orderId = '',
  orderTotal = 0,
  eligibleAmount = 0,
  pointsEarned = 0,
  customerName = 'Cliente',
  customerCpfCnpj = '',
  customerEmail = '',
  customerPhone = '',
  source = 'Omie ERP',
  status = 'faturado',
  notes = ''
}) {
  try {
    const config = await getNotificationSettings();
    if (!config.emailNotificationsEnabled) {
      console.log('[NOTIFICAÇÕES] Disparos por e-mail desativados nas configurações.');
      return { skipped: true, reason: 'disabled' };
    }

    const adminDestination = config.purchaseNotificationEmail || config.receiptNotificationEmail;
    const formattedDate = formatBrtDate();
    const formattedTotal = formatBrlNumber(orderTotal);
    const formattedEligible = formatBrlNumber(eligibleAmount || orderTotal);

    // 1. E-mail de Comprovante de Compra para Administração
    const adminSubject = `[Athena Comprovante] Compra Faturada (#${orderId}) +${pointsEarned} pts — ${customerName || 'Cliente'}`;
    const adminHtml = buildAthenaEmailHtml({
      maxWidth: 600,
      badgeText: 'Comprovante de Faturamento & Pontos',
      badgeBg: '#ecfdf5',
      badgeColor: '#047857',
      badgeBorder: '#a7f3d0',
      title: 'Nova Venda Faturada',
      subtitle: `Faturamento registrado no canal <strong>${source}</strong>`,
      bodyHtml: `
        <div style="background-color: #f8fafc; border-radius: 12px; border-left: 4px solid #059669; padding: 16px 18px; margin-bottom: 22px;">
          <p style="margin: 0; color: #0f172a; font-size: 14px; font-weight: 600; line-height: 1.5;">
            Venda confirmada de <strong>${customerName || 'Cliente'}</strong>.
          </p>
          <p style="margin: 4px 0 0 0; color: #64748b; font-size: 12px;">
            Pedido: <code style="color: #059669; background-color: #ecfdf5; padding: 2px 6px; border-radius: 6px; font-weight: 700; border: 1px solid #a7f3d0;">#${orderId}</code> • Origem: <strong>${source}</strong>
          </p>
        </div>

        <!-- Métricas em Grid -->
        <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 22px;">
          <tr>
            <td style="width: 50%; padding-right: 6px; vertical-align: top;">
              <div style="background-color: #f8fafc; border-radius: 12px; padding: 18px; border: 1px solid #e2e8f0; text-align: center;">
                <p style="margin: 0 0 6px 0; color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px;">Valor Total Faturado</p>
                <p style="margin: 0; color: #0f172a; font-size: 24px; font-weight: 900;">${formattedTotal}</p>
              </div>
            </td>
            <td style="width: 50%; padding-left: 6px; vertical-align: top;">
              <div style="background-color: #ecfdf5; border-radius: 12px; padding: 18px; border: 1px solid #a7f3d0; text-align: center;">
                <p style="margin: 0 0 6px 0; color: #047857; font-size: 11px; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px;">A-Points Gerados</p>
                <p style="margin: 0; color: #059669; font-size: 24px; font-weight: 900;">+${pointsEarned} pts</p>
              </div>
            </td>
          </tr>
        </table>

        <!-- Tabela de Detalhes -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
          <tbody>
            <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 11px 16px; color: #64748b; font-weight: 600; width: 40%;">Número do Pedido / NF</td>
              <td style="padding: 11px 16px; color: #0f172a; font-weight: 800;">#${orderId}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 11px 16px; color: #64748b; font-weight: 600;">Valor Elegível (sem frete)</td>
              <td style="padding: 11px 16px; color: #334155; font-weight: 600;">${formattedEligible}</td>
            </tr>
            <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 11px 16px; color: #64748b; font-weight: 600;">Regra de Pontuação</td>
              <td style="padding: 11px 16px; color: #b45309; font-weight: 700;">R$ 50,00 = 1 A-Point</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 11px 16px; color: #64748b; font-weight: 600;">Cliente</td>
              <td style="padding: 11px 16px; color: #0f172a; font-weight: 700;">${customerName}</td>
            </tr>
            ${customerCpfCnpj ? `
            <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 11px 16px; color: #64748b; font-weight: 600;">CPF / CNPJ</td>
              <td style="padding: 11px 16px; color: #334155; font-family: monospace;">${customerCpfCnpj}</td>
            </tr>` : ''}
            ${customerEmail ? `
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 11px 16px; color: #64748b; font-weight: 600;">E-mail do Cliente</td>
              <td style="padding: 11px 16px; color: #334155;">${customerEmail}</td>
            </tr>` : ''}
            ${customerPhone ? `
            <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 11px 16px; color: #64748b; font-weight: 600;">Telefone</td>
              <td style="padding: 11px 16px; color: #334155;">${customerPhone}</td>
            </tr>` : ''}
            <tr>
              <td style="padding: 11px 16px; color: #64748b; font-weight: 600;">Data e Horário</td>
              <td style="padding: 11px 16px; color: #64748b;">${formattedDate} (Brasília)</td>
            </tr>
          </tbody>
        </table>

        <div style="text-align: center;">
          <a href="https://athenaconsultoria.com.br/admin" style="display: inline-block; background-color: #f59e0b; color: #0f172a; text-decoration: none; font-weight: 800; font-size: 13px; padding: 13px 28px; border-radius: 10px; box-shadow: 0 2px 8px rgba(245, 158, 11, 0.25);">
            Ver Transações no Painel Admin
          </a>
        </div>
      `
    });

    await sendGenericNotificationEmail({
      to: adminDestination,
      subject: adminSubject,
      htmlContent: adminHtml
    });

    // 2. Cópia / Notificação de Compra e Pontos para o Cliente
    // REGRA DE HOMOLOGAÇÃO: Vendas do Omie ERP são redirecionadas para yagovictorbotafogo@gmail.com para testes.
    // Compras feitas na loja online do site são enviadas diretamente para o cliente real.
    const isOmieSource = String(source || '').toLowerCase().includes('omie');
    const actualCustomerRecipient = isOmieSource ? 'yagovictorbotafogo@gmail.com' : customerEmail;

    if (config.sendCustomerCopy && actualCustomerRecipient && actualCustomerRecipient.includes('@')) {
      const custSubject = isOmieSource
        ? `[Athena Fidelidade] Você conquistou +${pointsEarned} A-Points com sua última compra! 🏆`
        : `Você conquistou +${pointsEarned} A-Points com sua última compra! 🏆 — Athena Soluções Automotivas`;

      const omieTestBadge = isOmieSource ? `
        <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-left: 4px solid #2563eb; border-radius: 10px; padding: 12px 16px; margin-bottom: 20px;">
          <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #1d4ed8; letter-spacing: 0.5px;">
            🧪 Teste de Integração Omie ERP → A-Points
          </p>
          <p style="margin: 0; font-size: 12px; line-height: 1.4; color: #1e40af;">
            Cópia de validação técnica enviada para: <strong>${actualCustomerRecipient}</strong><br/>
            Cliente identificado no ERP: <strong>${customerName}</strong> (${customerEmail || 'E-mail não cadastrado no Omie'})
          </p>
        </div>
      ` : '';

      const custHtml = buildAthenaEmailHtml({
        maxWidth: 580,
        badgeText: 'Programa de Fidelidade A-Points',
        badgeBg: '#fffbeb',
        badgeColor: '#b45309',
        badgeBorder: '#fde68a',
        title: `Novos A-Points na sua Conta! 🎉`,
        subtitle: `Sua preferência pela Athena Soluções Automotivas vale recompensas exclusivas.`,
        bodyHtml: `
          ${omieTestBadge}

          <p style="margin: 0 0 14px 0; font-size: 15px; color: #0f172a; line-height: 1.6;">
            Olá, <strong>${customerName}</strong>!
          </p>

          <p style="margin: 0 0 20px 0; font-size: 14px; color: #475569; line-height: 1.6;">
            Com a confirmação da sua última compra faturada (Pedido <strong>#${orderId}</strong>), você acabou de acumular novos pontos no nosso programa de fidelidade exclusivo!
          </p>

          <!-- Card Dourado de Pontos Conquistados -->
          <div style="background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border-radius: 16px; padding: 26px 20px; border: 2px dashed #f59e0b; text-align: center; margin-bottom: 24px;">
            <p style="margin: 0 0 6px 0; font-size: 11px; color: #92400e; text-transform: uppercase; font-weight: 800; letter-spacing: 1px;">
              ✨ Pontos Adquiridos Nesta Compra
            </p>
            <p style="margin: 0 0 6px 0; font-size: 42px; font-weight: 900; color: #b45309; letter-spacing: -1px;">
              +${pointsEarned} A-Points
            </p>
            <p style="margin: 0; font-size: 12px; color: #92400e; font-weight: 600;">
              Regra Oficial Athena: a cada R$ 50,00 faturados = 1 A-Point acumulado
            </p>
          </div>

          <!-- Box Explicativo de Vantagens -->
          <div style="background-color: #f8fafc; border-radius: 12px; padding: 18px 20px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
            <p style="margin: 0 0 8px 0; font-size: 12px; color: #0f172a; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px;">
              🎁 O que você pode fazer com seus A-Points:
            </p>
            <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #475569; line-height: 1.6;">
              <li style="margin-bottom: 4px;">Trocar por <strong>ferramentas e equipamentos automotivos</strong> das melhores marcas.</li>
              <li style="margin-bottom: 4px;">Resgatar <strong>descontos especiais</strong> em suas próximas aquisições.</li>
              <li>Acessar vantagens exclusivas para parceiros e oficinas cadastradas.</li>
            </ul>
          </div>

          <!-- Botão CTA Centralizado -->
          <div style="text-align: center; margin-bottom: 8px;">
            <a href="https://athenaconsultoria.com.br/minha-conta" style="display: inline-block; background-color: #f59e0b; color: #0f172a; text-decoration: none; font-weight: 800; font-size: 14px; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 14px rgba(245, 158, 11, 0.35);">
              Ver Meu Saldo & Resgatar Prêmios →
            </a>
          </div>
          <p style="text-align: center; margin: 10px 0 0 0; font-size: 11px; color: #94a3b8;">
            Acesse sua conta para conferir seu extrato completo e o catálogo de recompensas.
          </p>
        `
      });

      await sendGenericNotificationEmail({
        to: actualCustomerRecipient,
        subject: custSubject,
        htmlContent: custHtml
      });
    }

    return { success: true };
  } catch (err) {
    console.error('[ERRO AO DISPARAR EMAIL DE COMPRA]:', err.message);
    return { success: false, error: err.message };
  }
}

// -------------------------------------------------------------
// COMPROVANTE DE PEDIDO REALIZADO NO SITE (NOVO CHECKOUT ONLINE)
// -------------------------------------------------------------
async function sendOrderPlacedReceiptNotification({
  orderId = '',
  customerName = 'Cliente',
  customerEmail = '',
  customerPhone = '',
  customerCpfCnpj = '',
  items = [],
  totalAmount = 0,
  discountAmount = 0,
  billingType = 'PIX',
  pix = null,
  bankSlipUrl = '',
  invoiceUrl = ''
}) {
  try {
    const config = await getNotificationSettings();
    if (!config.emailNotificationsEnabled) return { skipped: true };

    const formattedDate = formatBrtDate();
    const formattedTotal = formatBrlNumber(totalAmount);
    const estimatedPoints = Math.floor(totalAmount / 50);

    let paymentMethodDescription = 'PIX Instantâneo';
    if (billingType === 'CREDIT_CARD') paymentMethodDescription = 'Cartão de Crédito';
    else if (billingType === 'BOLETO') paymentMethodDescription = 'Boleto Bancário';
    else if (billingType === 'FREE') paymentMethodDescription = 'Pedido Bonificado / Gratuito';

    // Itens HTML Table
    const itemsRowsHtml = (items && items.length > 0)
      ? items.map((it, idx) => `
          <tr style="border-bottom: 1px solid #f1f5f9; ${idx % 2 === 1 ? 'background-color: #fafafa;' : ''}">
            <td style="padding: 10px 14px; color: #0f172a; font-size: 13px;">
              <strong>${it.name || it.description || 'Equipamento'}</strong>
              ${it.sku ? `<br/><span style="font-size: 11px; color: #64748b;">SKU: ${it.sku}</span>` : ''}
            </td>
            <td style="padding: 10px 14px; color: #475569; font-size: 13px; text-align: center;">${it.quantity || 1}x</td>
            <td style="padding: 10px 14px; color: #0f172a; font-size: 13px; font-weight: 700; text-align: right;">${formatBrlNumber((it.price || it.unitPrice || 0) * (it.quantity || 1))}</td>
          </tr>
        `).join('')
      : `
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 14px; color: #0f172a; font-size: 13px;" colspan="2">Equipamentos e Serviços Automotivos</td>
            <td style="padding: 10px 14px; color: #0f172a; font-size: 13px; font-weight: 700; text-align: right;">${formattedTotal}</td>
          </tr>
        `;

    // Bloco específico de pagamento (PIX copia e cola, boleto etc)
    let paymentDetailsHtml = '';
    if (billingType === 'PIX' && pix?.payload) {
      paymentDetailsHtml = `
        <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 20px; margin-bottom: 22px; text-align: center;">
          <span style="display: inline-block; padding: 3px 10px; border-radius: 9999px; background-color: #059669; color: #ffffff; font-size: 10px; font-weight: 800; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 0.5px;">
            Pagamento via PIX Instantâneo
          </span>
          <p style="margin: 0 0 10px 0; font-size: 13px; color: #065f46; font-weight: 700;">
            Copie o código PIX Copia e Cola abaixo para pagar:
          </p>
          <div style="background-color: #ffffff; border: 1px dashed #059669; border-radius: 8px; padding: 12px; margin-bottom: 10px; word-break: break-all; font-family: monospace; font-size: 11px; color: #065f46; user-select: all;">
            ${pix.payload}
          </div>
          <p style="margin: 0; font-size: 11px; color: #047857;">
            ⏱ A compensação do PIX é imediata e seu pedido é aprovado na hora!
          </p>
        </div>
      `;
    } else if (billingType === 'BOLETO' && bankSlipUrl) {
      paymentDetailsHtml = `
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 22px; text-align: center;">
          <p style="margin: 0 0 12px 0; font-size: 14px; color: #0f172a; font-weight: 700;">
            Boleto Bancário Gerado com Sucesso
          </p>
          <a href="${bankSlipUrl}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 13px; padding: 12px 24px; border-radius: 10px; box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);">
            📄 Abrir Boleto para Pagamento
          </a>
          <p style="margin: 10px 0 0 0; font-size: 11px; color: #64748b;">
            A compensação bancária do boleto ocorre em até 1 a 2 dias úteis.
          </p>
        </div>
      `;
    }

    // 1. Envia para o Cliente
    if (config.sendCustomerCopy && customerEmail && customerEmail.includes('@')) {
      const custSubject = `Recebemos seu Pedido #${orderId}! — Athena Soluções Automotivas`;
      const custHtml = buildAthenaEmailHtml({
        maxWidth: 600,
        badgeText: 'Pedido Registrado na Loja Online',
        badgeBg: '#e0f2fe',
        badgeColor: '#0369a1',
        badgeBorder: '#bae6fd',
        title: 'Recebemos seu Pedido!',
        subtitle: `Identificador: <strong>#${orderId}</strong>`,
        bodyHtml: `
          <p style="margin: 0 0 10px 0; font-size: 15px; color: #0f172a;">
            Olá, <strong>${customerName}</strong>!
          </p>
          <p style="margin: 0 0 20px 0; font-size: 13px; color: #475569; line-height: 1.6;">
            Recebemos seu pedido <strong>#${orderId}</strong> na loja online Athena! Abaixo estão os detalhes dos itens adquiridos e as orientações de pagamento:
          </p>

          ${paymentDetailsHtml}

          <!-- Tabela de Itens -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background-color: #ffffff; border-radius: 10px; overflow: hidden; border: 1px solid #e2e8f0;">
            <thead>
              <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                <th style="padding: 10px 14px; text-align: left; font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 800;">Produto</th>
                <th style="padding: 10px 14px; text-align: center; font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 800;">Qtd</th>
                <th style="padding: 10px 14px; text-align: right; font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 800;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRowsHtml}
            </tbody>
          </table>

          <!-- Totais -->
          <div style="background-color: #f8fafc; border-radius: 12px; padding: 16px 20px; border: 1px solid #e2e8f0; margin-bottom: 22px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 6px 0; color: #64748b;">Forma de Pagamento:</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: 700; text-align: right;">${paymentMethodDescription}</td>
              </tr>
              ${discountAmount > 0 ? `
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 6px 0; color: #059669;">Desconto Aplicado:</td>
                <td style="padding: 6px 0; color: #059669; font-weight: 700; text-align: right;">- ${formatBrlNumber(discountAmount)}</td>
              </tr>` : ''}
              <tr>
                <td style="padding: 10px 0 4px 0; color: #0f172a; font-weight: 800; font-size: 15px;">Valor Total:</td>
                <td style="padding: 10px 0 4px 0; color: #b45309; font-weight: 900; font-size: 16px; text-align: right;">${formattedTotal}</td>
              </tr>
            </table>
          </div>

          <!-- Estimativa A-Points -->
          <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; text-align: center;">
            <p style="margin: 0 0 4px 0; font-size: 13px; font-weight: 800; color: #92400e;">
              🎁 Pontos a Ganhar no Programa A-Points:
            </p>
            <p style="margin: 0; font-size: 12px; color: #b45309; line-height: 1.5;">
              Após a aprovação do pagamento, você acumulará aproximadamente <strong style="color: #d97706;">+${estimatedPoints} A-Points</strong> para resgatar brindes e vantagens exclusivas!
            </p>
          </div>

          <div style="text-align: center;">
            <a href="https://athenaconsultoria.com.br/minha-conta" style="display: inline-block; background-color: #f59e0b; color: #0f172a; text-decoration: none; font-weight: 800; font-size: 13px; padding: 13px 30px; border-radius: 10px; box-shadow: 0 2px 8px rgba(245, 158, 11, 0.25);">
              Acompanhar Meu Pedido
            </a>
          </div>
        `
      });

      await sendGenericNotificationEmail({
        to: customerEmail,
        subject: custSubject,
        htmlContent: custHtml
      });
    }

    // 2. Envia para a Administração (Alerta de Novo Pedido no Site)
    const adminDest = config.purchaseNotificationEmail || config.receiptNotificationEmail;
    const adminSubject = `[Athena Loja Online] Novo Pedido Criado (#${orderId}) — ${customerName} (${formattedTotal})`;
    const adminHtml = buildAthenaEmailHtml({
      maxWidth: 560,
      badgeText: 'Alerta de Venda no Site',
      badgeBg: '#e0f2fe',
      badgeColor: '#0369a1',
      badgeBorder: '#bae6fd',
      title: 'Novo Pedido na Loja Online Athena',
      bodyHtml: `
        <p style="color: #334155; font-size: 14px; margin-bottom: 18px;">
          O cliente <strong>${customerName}</strong> fechou o pedido <strong>#${orderId}</strong> na loja online.
        </p>
        <div style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; padding: 16px 20px; margin-bottom: 22px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 7px 0; color: #64748b;">Total do Pedido:</td><td style="padding: 7px 0; color: #0f172a; font-weight: 800; text-align: right;">${formattedTotal}</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 7px 0; color: #64748b;">Pagamento:</td><td style="padding: 7px 0; color: #0f172a; font-weight: 700; text-align: right;">${paymentMethodDescription}</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 7px 0; color: #64748b;">E-mail:</td><td style="padding: 7px 0; color: #334155; text-align: right;">${customerEmail}</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 7px 0; color: #64748b;">Telefone:</td><td style="padding: 7px 0; color: #334155; text-align: right;">${customerPhone || 'Não informado'}</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 7px 0; color: #64748b;">CPF/CNPJ:</td><td style="padding: 7px 0; color: #334155; text-align: right;">${customerCpfCnpj || 'Não informado'}</td></tr>
            <tr><td style="padding: 7px 0; color: #64748b;">Data:</td><td style="padding: 7px 0; color: #334155; text-align: right;">${formattedDate}</td></tr>
          </table>
        </div>
        <div style="text-align: center;">
          <a href="https://athenaconsultoria.com.br/admin" style="display: inline-block; background-color: #f59e0b; color: #0f172a; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 800; font-size: 13px; box-shadow: 0 2px 8px rgba(245, 158, 11, 0.25);">
            Acessar Painel de Pedidos
          </a>
        </div>
      `
    });

    await sendGenericNotificationEmail({
      to: adminDest,
      subject: adminSubject,
      htmlContent: adminHtml
    });

    return { success: true };
  } catch (err) {
    console.error('[ERRO AO DISPARAR EMAIL NOVO PEDIDO]:', err.message);
    return { success: false, error: err.message };
  }
}

// -------------------------------------------------------------
// ENVIO DE E-MAIL DE TESTE (PAINEL ADMIN)
// -------------------------------------------------------------
async function sendTestNotificationEmail({ targetEmail, testType = 'general' }) {
  const defaultAdmin = process.env.ADMIN_EMAIL || 'administracao@athenaconsultoria.com.br';
  const to = targetEmail || defaultAdmin;

  if (testType === 'redemption') {
    return await sendLoyaltyRedemptionReceiptNotification({
      txId: `apt_teste_${Date.now().toString(36)}`,
      reward: {
        id: 'rw_teste_espuma',
        name: 'Espuma Aplicadora de Cera 100mm (SIMULAÇÃO DE TESTE)',
        points_cost: 50
      },
      customerName: 'Cliente Exemplo Ltda',
      customerCpfCnpj: '01.234.567/0001-89',
      customerEmail: to,
      customerPhone: '(61) 98765-4321',
      previousPoints: 250,
      remainingPoints: 200,
      notes: 'Disparo de teste executado através do Painel Admin Athena'
    });
  }

  if (testType === 'purchase') {
    return await sendPurchaseReceiptNotification({
      orderId: 'TESTE-9999',
      orderTotal: 2500.00,
      eligibleAmount: 2500.00,
      pointsEarned: 50,
      customerName: 'Cliente Exemplo Ltda',
      customerCpfCnpj: '01.234.567/0001-89',
      customerEmail: to,
      customerPhone: '(61) 98765-4321',
      source: 'Omie ERP (Simulação de Teste)',
      status: 'faturado'
    });
  }

  // General connection test
  const subject = '[Athena Teste] Validação de Envio & Notificações de Comprovantes';
  const html = buildAthenaEmailHtml({
    maxWidth: 560,
    badgeText: 'Teste de Comunicação Transacional',
    badgeBg: '#ecfdf5',
    badgeColor: '#047857',
    badgeBorder: '#a7f3d0',
    title: 'Canal de E-mails Validado com Sucesso',
    bodyHtml: `
      <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 18px 20px; margin-bottom: 22px; text-align: left;">
        <p style="margin: 0 0 6px 0; font-size: 15px; font-weight: 800; color: #065f46;">
          ✅ Transmissão Operacional Concluída!
        </p>
        <p style="margin: 0; font-size: 13px; color: #047857; line-height: 1.5;">
          O canal de e-mails transacionais da <strong>Athena Soluções Automotivas</strong> está 100% configurado e apto a enviar comprovantes de faturamento, pedidos da loja e resgates de fidelidade A-Points.
        </p>
      </div>

      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Destinatário de Teste:</td>
            <td style="padding: 8px 0; color: #0f172a; font-weight: 700; text-align: right;">${to}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Data e Horário:</td>
            <td style="padding: 8px 0; color: #0f172a; font-weight: 700; text-align: right;">${formatBrtDate()} (Brasília)</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Status do Disparo:</td>
            <td style="padding: 8px 0; color: #059669; font-weight: 800; text-align: right;">✓ Autorizado e Entregue</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center;">
        <a href="https://athenaconsultoria.com.br/admin" style="display: inline-block; background-color: #f59e0b; color: #0f172a; text-decoration: none; font-weight: 800; font-size: 13px; padding: 12px 28px; border-radius: 10px; box-shadow: 0 2px 8px rgba(245, 158, 11, 0.25);">
          Acessar Painel Admin Athena
        </a>
      </div>
    `
  });
  return await sendGenericNotificationEmail({ to, subject, htmlContent: html });
}

// -------------------------------------------------------------
// CLOUDFLARE R2 / CLOUDINARY UPLOAD ENDPOINT (AUTO-WEBP)
// -------------------------------------------------------------
app.post('/api/upload', authenticateToken, requireStaff, async (req, res) => {
  try {
    const { file, folder, filename } = req.body;
    if (!file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }

    // 1. Try Cloudflare R2 (Primary & Fast with automatic WebP conversion)
    if (isR2Configured) {
      try {
        const r2Result = await uploadToR2({
          file,
          folder: folder || 'produtos',
          filename: filename || `upload-${Date.now()}`
        });

        return res.json({
          url: r2Result.url,
          publicId: r2Result.key,
          format: r2Result.format,
          bytes: r2Result.bytes,
          provider: 'cloudflare-r2'
        });
      } catch (r2Error) {
        console.warn('Falha no upload R2, tentando fallback Cloudinary:', r2Error.message);
      }
    }

    // 2. Fallback to Cloudinary if R2 not available
    const uploadResponse = await cloudinary.uploader.upload(file, {
      folder: folder || 'athena_automotivas',
      resource_type: 'auto'
    });

    return res.json({
      url: uploadResponse.secure_url,
      publicId: uploadResponse.public_id,
      format: uploadResponse.format,
      bytes: uploadResponse.bytes,
      provider: 'cloudinary'
    });
  } catch (error) {
    console.error('Erro no upload de imagem:', error);
    return res.status(500).json({ error: 'Erro ao fazer upload da imagem/arquivo para a nuvem.' });
  }
});

// Endpoint para listar a biblioteca de imagens do Cloudflare R2 com paginação infinita e busca
app.get('/api/upload/library', authenticateToken, requireStaff, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 36;
    const search = (req.query.search || '').trim();
    const folder = (req.query.folder || '').trim();

    const result = await listR2Objects({ page, limit, search, folder });
    return res.json(result);
  } catch (error) {
    console.error('Erro ao listar biblioteca de imagens:', error);
    return res.status(500).json({ error: 'Falha ao buscar imagens da biblioteca.' });
  }
});

// Endpoint para excluir imagem do Cloudflare R2
// Endpoint para excluir imagem (ou lote de imagens) do Cloudflare R2
app.post('/api/upload/delete', authenticateToken, requireStaff, async (req, res) => {
  try {
    const rawUrls = req.body.urls || (req.body.url ? [req.body.url] : []);
    const urls = Array.isArray(rawUrls) ? rawUrls.filter(Boolean) : [];
    if (urls.length === 0) {
      return res.status(400).json({ error: 'Nenhuma URL informada para exclusão.' });
    }

    let totalDeleted = 0;
    let cleanedProductsCount = 0;
    let cleanedBrandsCount = 0;

    // 1. Tenta excluir do Cloudflare R2 / Storage
    for (const url of urls) {
      const isR2Url = isR2Configured && (
        url.includes('.r2.dev') ||
        url.includes('.r2.cloudflarestorage.com') ||
        url.includes('images.athenaconsultoria.com.br') ||
        (process.env.R2_PUBLIC_URL && url.includes(new URL(process.env.R2_PUBLIC_URL).hostname))
      );

      if (isR2Url) {
        const ok = await deleteFromR2(url);
        if (ok) totalDeleted++;
      } else if (url.includes('cloudinary.com')) {
        try {
          const parts = url.split('/');
          const fileWithExt = parts.slice(-2).join('/');
          const publicId = fileWithExt.replace(/\.[^/.]+$/, '');
          await cloudinary.uploader.destroy(publicId);
          totalDeleted++;
        } catch (cErr) {
          console.warn('Aviso ao excluir do Cloudinary:', cErr.message);
        }
      }
    }

    // 2. Extrai nomes de arquivos para desvincular produtos e marcas no banco com precisão de token
    const filenames = urls.map(u => {
      const clean = u.split('?')[0].split('#')[0];
      return clean.split('/').pop() || '';
    }).filter(f => f.length > 3);

    if (pool) {
      try {
        for (const url of urls) {
          const clean = url.split('?')[0].split('#')[0];
          const filename = clean.split('/').pop() || '';

          // Desvincula marcas
          const brandRes = await pool.query(`
            UPDATE brands 
            SET logo = '' 
            WHERE logo = $1 
               OR ($2 != '' AND (logo LIKE '%' || $2 OR logo = $2))
          `, [url, filename]);
          cleanedBrandsCount += (brandRes.rowCount || 0);

          // Desvincula produto (imagem principal)
          await pool.query(`
            UPDATE products
            SET image = CASE 
              WHEN jsonb_typeof(images) = 'array' AND jsonb_array_length(images) > 1 AND (images->>0 = $1 OR ($2 != '' AND images->>0 LIKE '%' || $2)) THEN COALESCE(images->>1, '')
              WHEN jsonb_typeof(images) = 'array' AND jsonb_array_length(images) > 0 AND NOT (images->>0 = $1 OR ($2 != '' AND images->>0 LIKE '%' || $2)) THEN COALESCE(images->>0, '')
              ELSE ''
            END
            WHERE image = $1 OR ($2 != '' AND image LIKE '%' || $2)
          `, [url, filename]);

          // Desvincula produto (galeria de imagens)
          const updateRes = await pool.query(`
            UPDATE products
            SET images = COALESCE((
              SELECT jsonb_agg(to_jsonb(elem)) FROM jsonb_array_elements_text(COALESCE(images, '[]'::jsonb)) AS elem 
              WHERE elem != $1 AND ($2 = '' OR elem NOT LIKE '%' || $2)
            ), '[]'::jsonb)
            WHERE jsonb_typeof(images) = 'array' AND EXISTS (
              SELECT 1 FROM jsonb_array_elements_text(images) elem 
              WHERE elem = $1 OR ($2 != '' AND elem LIKE '%' || $2)
            )
          `, [url, filename]);
          cleanedProductsCount += (updateRes.rowCount || 0);

          // Desvincula imagens de variações de produtos que usavam esta imagem
          await pool.query(`
            UPDATE products
            SET variants = (
              SELECT jsonb_agg(
                CASE 
                  WHEN elem->>'image' = $1 OR ($2 != '' AND elem->>'image' LIKE '%' || $2) 
                  THEN jsonb_set(elem, '{image}', '""'::jsonb)
                  ELSE elem
                END
              )
              FROM jsonb_array_elements(COALESCE(variants, '[]'::jsonb)) AS elem
            )
            WHERE jsonb_typeof(variants) = 'array' AND EXISTS (
              SELECT 1 FROM jsonb_array_elements(variants) elem 
              WHERE elem->>'image' = $1 OR ($2 != '' AND elem->>'image' LIKE '%' || $2)
            )
          `, [url, filename]).catch(() => {});
        }
      } catch (dbErr) {
        console.warn('Aviso ao desvincular imagens de produtos/marcas no PG:', dbErr.message);
      }
    }

    // Fallback/Sincronização com db.json
    const db = readDbJson();
    let updatedDb = false;

    const matchesAnyDeleted = (testUrl) => {
      if (!testUrl || typeof testUrl !== 'string') return false;
      const cleanTest = testUrl.split('?')[0].split('#')[0];
      const testFile = cleanTest.split('/').pop() || '';
      return urls.includes(testUrl) || urls.includes(cleanTest) || (testFile.length > 3 && filenames.includes(testFile));
    };

    (db.products || []).forEach(prod => {
      let changed = false;
      if (Array.isArray(prod.images) && prod.images.some(matchesAnyDeleted)) {
        prod.images = prod.images.filter(u => !matchesAnyDeleted(u));
        changed = true;
      }
      if (matchesAnyDeleted(prod.image)) {
        prod.image = (Array.isArray(prod.images) && prod.images[0]) || '';
        changed = true;
      }
      if (Array.isArray(prod.variants)) {
        prod.variants.forEach(v => {
          if (v && matchesAnyDeleted(v.image)) {
            v.image = '';
            changed = true;
          }
        });
      }
      if (changed) {
        cleanedProductsCount++;
        updatedDb = true;
      }
    });

    (db.brands || []).forEach(brand => {
      if (matchesAnyDeleted(brand.logo)) {
        brand.logo = '';
        cleanedBrandsCount++;
        updatedDb = true;
      }
    });

    if (updatedDb) {
      writeDbJson(db);
    }

    return res.json({ 
      success: true, 
      deletedCount: totalDeleted,
      affectedProducts: cleanedProductsCount,
      affectedBrands: cleanedBrandsCount
    });
  } catch (error) {
    console.error('Erro ao excluir mídia do storage:', error);
    return res.status(500).json({ error: 'Erro ao remover imagem do storage.' });
  }
});

// Endpoint para disparar a migração em lote de imagens do Cloudinary para o Cloudflare R2
app.post('/api/admin/migrate-r2', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { runMigration } = require('./migrateCloudinaryToR2');
    // Executa em segundo plano para não travar a requisição HTTP
    runMigration().catch(err => console.error('Erro na migração R2:', err));
    return res.json({ message: 'Migração para Cloudflare R2 iniciada em segundo plano no servidor!' });
  } catch (error) {
    console.error('Erro ao iniciar migração:', error);
    return res.status(500).json({ error: 'Falha ao iniciar processo de migração.' });
  }
});

// -------------------------------------------------------------
// STRUCTURED SECURITY AUDIT LOGGING (OWASP A09:2021)
// -------------------------------------------------------------
function logSecurityEvent({ event, userId = null, email = null, ip = null, userAgent = null, outcome = 'SUCCESS', reason = null, details = {} }) {
  try {
    const sanitizedDetails = { ...details };
    // Zero-leakage policy: jamais registrar senhas, tokens brutos, segredos ou hashes
    delete sanitizedDetails.password;
    delete sanitizedDetails.token;
    delete sanitizedDetails.magicToken;
    delete sanitizedDetails.rawToken;
    delete sanitizedDetails.passwordHash;
    delete sanitizedDetails.secret;

    const payload = {
      type: 'SECURITY_AUDIT',
      timestamp: new Date().toISOString(),
      event,
      outcome, // 'SUCCESS' | 'FAILURE' | 'BLOCKED' | 'CHALLENGE_REQUIRED' | 'CHALLENGE_FAILED'
      userId: userId || null,
      email: email ? String(email).toLowerCase().trim() : null,
      ip: ip || null,
      userAgent: userAgent ? String(userAgent).substring(0, 250) : null,
      reason: reason || null,
      details: sanitizedDetails
    };

    console.info(`[SECURITY_AUDIT] ${JSON.stringify(payload)}`);
  } catch (err) {
    console.error('Falha ao emitir log de auditoria de segurança:', err.message);
  }
}

// -------------------------------------------------------------
// CLOUDFLARE TURNSTILE & ADVANCED SECURITY HELPERS
// -------------------------------------------------------------
const ipSecurityTracker = new Map(); // ip -> { failedAttempts: number, isBlocked: boolean, blockedAt: Date }
// In-Memory Fast-Path Cache for Locked Accounts & IP Cooldowns
// Cache local do processo (redução de carga): descarta requisições contra contas travadas antes de consultar o PostgreSQL ou rodar Bcrypt
const lockedAccountsMemory = new Map(); // lowercase_email -> { lockedUntil: Date, isLocked: boolean }

async function verifyCloudflareTurnstile(token, clientIp) {
  const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    console.warn('⚠️ [Turnstile] CLOUDFLARE_TURNSTILE_SECRET_KEY não configurada no ambiente.');
    return { success: process.env.NODE_ENV !== 'production' };
  }
  if (!token || typeof token !== 'string') {
    return { success: false, error: 'Token do Cloudflare Turnstile não fornecido.' };
  }

  try {
    const params = new URLSearchParams();
    params.append('secret', secretKey);
    params.append('response', token);
    if (clientIp) {
      params.append('remoteip', clientIp);
    }

    const response = await axios.post(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      params.toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 6000
      }
    );

    if (response.data && response.data.success) {
      return { success: true };
    }

    console.warn('[Turnstile siteverify falhou]:', response.data);
    return {
      success: false,
      error: 'Validação do Cloudflare Turnstile rejeitada. Por favor, marque o desafio novamente.',
      codes: response.data?.['error-codes'] || []
    };
  } catch (err) {
    console.error('[Turnstile Network Error]:', err.message);
    return { success: false, error: 'Falha ao validar desafio junto à Cloudflare. Tente novamente.' };
  }
}

async function getIpSecurityRecord(ip) {
  // IPs internos, privados ou de loopback (Render internal router, localhost, Docker) NUNCA são bloqueados
  if (isPrivateOrInternalIp(ip)) {
    return { failedAttempts: 0, isBlocked: false, lockedUntil: null, blockedAt: null };
  }

  let mem = ipSecurityTracker.get(ip);
  if (mem) return mem;

  if (pool) {
    try {
      const res = await pool.query('SELECT ip, failed_attempts, is_blocked, locked_until, blocked_at FROM security_ip_blocklist WHERE ip = $1', [ip]);
      if (res.rows.length > 0) {
        const row = res.rows[0];
        mem = {
          failedAttempts: row.failed_attempts || 0,
          isBlocked: Boolean(row.is_blocked),
          lockedUntil: row.locked_until,
          blockedAt: row.blocked_at
        };
        ipSecurityTracker.set(ip, mem);
        return mem;
      }
    } catch (e) {
      console.warn('Erro ao consultar security_ip_blocklist:', e.message);
    }
  }

  mem = { failedAttempts: 0, isBlocked: false, lockedUntil: null, blockedAt: null };
  ipSecurityTracker.set(ip, mem);
  return mem;
}

async function recordFailedIpAttempt(ip, reason = 'Tentativas repetidas de login incorretas') {
  // IPs internos, privados ou de loopback (Render internal router, localhost, Docker) NUNCA são bloqueados
  if (isPrivateOrInternalIp(ip)) {
    return { failedAttempts: 0, isBlocked: false, lockedUntil: null, blockedAt: null };
  }

  const rec = await getIpSecurityRecord(ip);
  rec.failedAttempts = (rec.failedAttempts || 0) + 1;
  if (rec.failedAttempts === 7) {
    // 7ª falha: Pausa de segurança de 24 horas
    rec.lockedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
    rec.blockedAt = new Date();
  } else if (rec.failedAttempts >= 8) {
    // 8ª falha em diante: Bloqueio total e permanente
    rec.isBlocked = true;
    rec.lockedUntil = null;
    rec.blockedAt = new Date();
  }
  ipSecurityTracker.set(ip, rec);

  if (pool) {
    try {
      await pool.query(`
        INSERT INTO security_ip_blocklist (ip, failed_attempts, is_blocked, locked_until, blocked_at, blocked_reason, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
        ON CONFLICT (ip)
        DO UPDATE SET 
          failed_attempts = $2, 
          is_blocked = CASE WHEN $3 = true THEN true ELSE security_ip_blocklist.is_blocked END, 
          locked_until = $4,
          blocked_at = CASE WHEN $3 = true OR $4 IS NOT NULL THEN COALESCE(security_ip_blocklist.blocked_at, CURRENT_TIMESTAMP) ELSE security_ip_blocklist.blocked_at END,
          blocked_reason = $6,
          updated_at = CURRENT_TIMESTAMP
      `, [ip, rec.failedAttempts, rec.isBlocked, rec.lockedUntil, rec.blockedAt, reason]);
    } catch (e) {
      console.warn('Erro ao persistir falha de IP no PostgreSQL:', e.message);
    }
  }
  return rec;
}

async function resetIpAttempts(ip) {
  if (isInfrastructureOrPrivateIp(ip)) return;
  const rec = await getIpSecurityRecord(ip);
  // POLÍTICA ESTRITA ANTI-ENGENHARIA SOCIAL:
  // Se o IP já atingiu 8 falhas e foi bloqueado, NENHUM login ou requisição web pode desbloqueá-lo!
  // O desbloqueio deve ser feito EXCLUSIVAMENTE via acesso direto ao banco de dados PostgreSQL.
  if (rec.isBlocked) {
    return;
  }
  rec.failedAttempts = 0;
  ipSecurityTracker.set(ip, rec);

  if (pool) {
    try {
      await pool.query(`
        UPDATE security_ip_blocklist 
        SET failed_attempts = 0, updated_at = CURRENT_TIMESTAMP
        WHERE ip = $1 AND is_blocked = false
      `, [ip]);
    } catch (e) {}
  }
}

async function unblockIpRecord(ip, unblockedBy = 'Admin') {
  ipSecurityTracker.set(ip, { failedAttempts: 0, isBlocked: false, blockedAt: null });
  if (pool) {
    try {
      await pool.query(`
        UPDATE security_ip_blocklist 
        SET is_blocked = false, failed_attempts = 0, unblocked_by = $1, unblocked_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE ip = $2
      `, [unblockedBy, ip]);
    } catch (e) {}
  }
}

// -------------------------------------------------------------
// AUTH & USER ROLES ENDPOINTS
// -------------------------------------------------------------

// Login (Protected by progressive loginSlowDown and strict loginLimiter rate limiting)
app.post('/api/auth/login', loginSlowDown, loginLimiter, async (req, res) => {
  try {
    const clientIp = getClientIp(req);
    const { email, password, turnstileToken } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Informe e-mail e senha.' });
    }

    // OWASP Hardening: Bound input lengths against memory exhaustion & regex DoS attacks
    if (typeof email !== 'string' || typeof password !== 'string' || email.length > 254 || password.length > 256) {
      return res.status(400).json({ error: 'Credenciais com formato inválido.' });
    }

    const inputEmail = email.trim().toLowerCase();

    // 0. FAST-PATH SHORT-CIRCUIT (IN-MEMORY): Cache local do processo para rejeitar contas bloqueadas antes do banco
    const memLock = lockedAccountsMemory.get(inputEmail);
    if (memLock) {
      const isCooldown = memLock.lockedUntil && new Date(memLock.lockedUntil) > new Date();
      if (memLock.isLocked || isCooldown) {
        logSecurityEvent({
          event: 'LOGIN_ATTEMPT',
          email: inputEmail,
          ip: clientIp,
          userAgent: req.headers['user-agent'],
          outcome: 'BLOCKED',
          reason: 'Conta em cache local de bloqueio/cooldown temporário'
        });
        return res.status(403).json({
          error: 'Conta temporariamente bloqueada por motivos de segurança após repetidas tentativas. Entre em contato com nosso time de suporte para solucionar seu caso.',
          isAccountLocked: true,
          isLocked: true,
          attemptsLeft: 0
        });
      } else {
        lockedAccountsMemory.delete(inputEmail);
      }
    }

    // 1. CHECAGEM PRÉVIA: O IP ESTÁ BLOQUEADO OU EM PAUSA DE 24H?
    const ipRecord = await getIpSecurityRecord(clientIp);
    const isIpCooldown = ipRecord.lockedUntil && new Date(ipRecord.lockedUntil) > new Date();

    if (ipRecord.isBlocked || isIpCooldown) {
      logSecurityEvent({
        event: 'LOGIN_ATTEMPT',
        email: inputEmail,
        ip: clientIp,
        userAgent: req.headers['user-agent'],
        outcome: 'BLOCKED',
        reason: ipRecord.isBlocked ? 'Endereço IP na blocklist permanente de segurança (8+ falhas)' : 'Endereço IP em pausa temporária de segurança de 24 horas (7 falhas)'
      });
      return res.status(403).json({
        error: 'Conta ou endereço IP bloqueado por motivos de segurança após repetidas tentativas. Entre em contato com nosso time de suporte para solucionar seu caso e liberar seu acesso seguro.',
        isIpBlocked: true,
        isLocked: true
      });
    }

    // 2. BUSCA DO USUÁRIO NO BANCO DE DADOS
    let foundUser = null;
    if (pool) {
      try {
        const result = await pool.query(
          `SELECT id, name, email, password_hash as "passwordHash", role, phone, document, 
                  company_name as "companyName", address, is_verified as "isVerified", 
                  COALESCE(must_change_password, false) as "mustChangePassword", 
                  COALESCE(failed_login_attempts, 0) as "failedAttempts", 
                  COALESCE(is_locked, false) as "isLocked",
                  locked_until as "lockedUntil",
                  locked_at as "lockedAt",
                  locked_reason as "lockedReason" 
           FROM users 
           WHERE LOWER(email) = $1`,
          [inputEmail]
        );
        if (result.rows && result.rows.length > 0) {
          foundUser = result.rows[0];
        }
      } catch (e) {
        console.error('PostgreSQL query error no login, recorrendo ao JSON local:', e.message);
      }
    }

    // Fallback to Local JSON DB if not found in PG or if PG query failed
    if (!foundUser) {
      const db = readDbJson();
      const user = (db.users || []).find(u => (u.email || '').toLowerCase() === inputEmail);
      if (user) {
        foundUser = {
          id: user.id,
          name: user.name,
          email: user.email,
          passwordHash: user.passwordHash || user.password_hash,
          role: user.role || 'cliente',
          phone: user.phone || '',
          document: user.document || '',
          companyName: user.companyName || user.company_name || '',
          address: user.address || null,
          isVerified: Boolean(user.isVerified || user.is_verified || false),
          mustChangePassword: Boolean(user.mustChangePassword || user.must_change_password || false),
          failedAttempts: user.failed_login_attempts || user.failedAttempts || 0,
          isLocked: Boolean(user.is_locked || user.isLocked || false),
          lockedUntil: user.locked_until || user.lockedUntil || null
        };
      }
    }

    // 3. CHECAGEM PRÉVIA: A CONTA ESTÁ BLOQUEADA OU EM PAUSA DE SEGURANÇA (24H)?
    if (foundUser) {
      const isUserCooldown = foundUser.lockedUntil && new Date(foundUser.lockedUntil) > new Date();

      if (foundUser.isLocked || isUserCooldown) {
        lockedAccountsMemory.set(inputEmail, {
          lockedUntil: foundUser.lockedUntil,
          isLocked: foundUser.isLocked
        });
        logSecurityEvent({
          event: 'LOGIN_ATTEMPT',
          userId: foundUser.id,
          email: inputEmail,
          ip: clientIp,
          userAgent: req.headers['user-agent'],
          outcome: 'BLOCKED',
          reason: foundUser.isLocked ? 'Conta travada com bloqueio permanente (8+ falhas)' : 'Conta em pausa temporária de segurança de 24 horas (7 falhas)'
        });
        return res.status(403).json({
          error: 'Conta ou endereço IP bloqueado por motivos de segurança após repetidas tentativas. Entre em contato com nosso time de suporte para solucionar seu caso e liberar seu acesso seguro.',
          isAccountLocked: true,
          isLocked: true
        });
      }
    }

    // 4. REGRA DE CAPTCHA CLOUDFLARE TURNSTILE (APÓS 5 TENTATIVAS FALHAS)
    const currentFailures = Math.max(foundUser?.failedAttempts || 0, ipRecord.failedAttempts || 0);
    const requiresCaptcha = currentFailures >= 5;

    if (requiresCaptcha) {
      if (!turnstileToken) {
        logSecurityEvent({
          event: 'TURNSTILE_CHALLENGE',
          userId: foundUser?.id,
          email: inputEmail,
          ip: clientIp,
          userAgent: req.headers['user-agent'],
          outcome: 'CHALLENGE_REQUIRED',
          reason: 'Token Turnstile não fornecido'
        });
        return res.status(400).json({
          error: 'Por favor, complete a verificação de segurança (CAPTCHA) para continuar.',
          requiresCaptcha: true
        });
      }

      const turnstileVerification = await verifyCloudflareTurnstile(turnstileToken, clientIp);
      if (!turnstileVerification.success) {
        logSecurityEvent({
          event: 'TURNSTILE_CHALLENGE',
          userId: foundUser?.id,
          email: inputEmail,
          ip: clientIp,
          userAgent: req.headers['user-agent'],
          outcome: 'CHALLENGE_FAILED',
          reason: turnstileVerification.error || 'Falha na verificação Cloudflare Turnstile'
        });
        return res.status(400).json({
          error: turnstileVerification.error || 'Verificação de segurança falhou. Tente novamente.',
          requiresCaptcha: true
        });
      }
    }

    // 5. VALIDAÇÃO DAS CREDENCIAIS (MASTER ADMIN OU USUÁRIO CADASTRADO)
    const envAdminEmail = (process.env.ADMIN_EMAIL || 'administracao@athenaconsultoria.com.br').trim().toLowerCase();
    const envAdminPassword = process.env.ADMIN_PASSWORD || 'Athena16/10*';
    const envAdminName = process.env.ADMIN_NAME || 'Administrador Geral';

    const isMasterAdminEmail = (
      inputEmail === envAdminEmail ||
      inputEmail === 'administracao@athenaconsultoria.com.br' ||
      inputEmail === 'admin@athena.com.br'
    );
    const isMasterAdmin = isMasterAdminEmail && (password === envAdminPassword);

    let isPasswordValid = false;
    let authUser = null;

    if (isMasterAdmin) {
      isPasswordValid = true;
      authUser = {
        id: 'user_admin_default',
        name: envAdminName,
        email: envAdminEmail,
        role: 'admin',
        isVerified: true
      };
    } else if (foundUser) {
      isPasswordValid = await checkPasswordAsync(password, foundUser.passwordHash);
      if (isPasswordValid) {
        authUser = foundUser;
      }
    }

    // 6. TRATAMENTO DE SUCESSO: ZERA CONTADORES DE FALHA
    if (isPasswordValid && authUser) {
      // Zera cache em memória
      lockedAccountsMemory.delete(inputEmail);

      // Zera falhas do IP
      resetIpAttempts(clientIp).catch(() => {});

      // Zera falhas do Usuário no PostgreSQL
      if (foundUser && pool) {
        pool.query('UPDATE users SET failed_login_attempts = 0, locked_until = NULL, is_locked = false WHERE id = $1', [foundUser.id]).catch(() => {});
      }
      // Zera no JSON DB se aplicável
      const db = readDbJson();
      const uIdx = (db.users || []).findIndex(u => (u.email || '').toLowerCase() === inputEmail);
      if (uIdx !== -1) {
        db.users[uIdx].failed_login_attempts = 0;
        db.users[uIdx].failedAttempts = 0;
        db.users[uIdx].locked_until = null;
        db.users[uIdx].is_locked = false;
        writeDbJson(db);
      }

      // Auto-upgrade legacy plaintext password to secure bcrypt hash in background
      if (foundUser && foundUser.passwordHash === password) {
        bcrypt.hash(password, 10).then(upgradedHash => {
          if (pool) {
            pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [upgradedHash, foundUser.id]).catch(() => {});
          }
          const freshDb = readDbJson();
          const fIdx = (freshDb.users || []).findIndex(u => u.id === foundUser.id);
          if (fIdx !== -1) {
            freshDb.users[fIdx].passwordHash = upgradedHash;
            writeDbJson(freshDb);
          }
        }).catch(() => {});
      }

      const userRole = authUser.role || 'cliente';
      const isVerified = Boolean(authUser.isVerified || authUser.is_verified || userRole === 'admin');

      const { token, expiresAt } = generateToken({
        id: authUser.id,
        name: authUser.name,
        email: authUser.email,
        role: userRole,
        isVerified
      });

      logSecurityEvent({
        event: 'LOGIN_ATTEMPT',
        userId: authUser.id,
        email: inputEmail,
        ip: clientIp,
        userAgent: req.headers['user-agent'],
        outcome: 'SUCCESS',
        details: { role: userRole }
      });

      return res.json({
        id: authUser.id,
        name: authUser.name,
        email: authUser.email,
        role: userRole,
        phone: authUser.phone || '',
        document: authUser.document || '',
        companyName: authUser.companyName || '',
        address: authUser.address || null,
        isVerified,
        mustChangePassword: Boolean(authUser.mustChangePassword || authUser.must_change_password || false),
        token,
        expiresAt
      });
    }

    // 7. TRATAMENTO DE FALHA (INCREMENTO ATÔMICO CONTRA RACE CONDITIONS)
    const updatedIp = await recordFailedIpAttempt(clientIp);
    let updatedUserFailures = (foundUser?.failedAttempts || 0) + 1;
    let isNowLocked = false;
    let isNowCooldown = false;
    let lockedUntilDate = null;

    if (foundUser) {
      if (pool) {
        try {
          // Incremento Atômico no PostgreSQL: Garante ordenação perfeita sem corrida de concorrência
          const updateRes = await pool.query(`
            UPDATE users 
            SET failed_login_attempts = failed_login_attempts + 1,
                locked_until = CASE 
                  WHEN failed_login_attempts + 1 = 7 THEN CURRENT_TIMESTAMP + INTERVAL '24 hours' 
                  ELSE locked_until 
                END,
                is_locked = CASE 
                  WHEN failed_login_attempts + 1 >= 8 THEN true 
                  ELSE is_locked 
                END,
                locked_at = CASE 
                  WHEN failed_login_attempts + 1 >= 7 THEN CURRENT_TIMESTAMP 
                  ELSE locked_at 
                END,
                locked_reason = CASE 
                  WHEN failed_login_attempts + 1 = 7 THEN 'Pausa temporária de segurança de 24 horas (7 falhas)'
                  WHEN failed_login_attempts + 1 >= 8 THEN 'Excesso de tentativas incorretas de login (8+ falhas)'
                  ELSE locked_reason 
                END
            WHERE id = $1
            RETURNING failed_login_attempts as "failedAttempts", is_locked as "isLocked", locked_until as "lockedUntil"
          `, [foundUser.id]);

          if (updateRes.rows && updateRes.rows.length > 0) {
            const row = updateRes.rows[0];
            updatedUserFailures = row.failedAttempts;
            isNowLocked = Boolean(row.isLocked);
            lockedUntilDate = row.lockedUntil;
            if (row.lockedUntil && new Date(row.lockedUntil) > new Date()) {
              isNowCooldown = true;
            }
          }
        } catch (e) {
          console.error('Erro ao atualizar falhas de login de forma atômica no Postgres:', e.message);
        }
      }

      const db = readDbJson();
      const uIdx = (db.users || []).findIndex(u => u.id === foundUser.id);
      if (uIdx !== -1) {
        db.users[uIdx].failed_login_attempts = updatedUserFailures;
        db.users[uIdx].failedAttempts = updatedUserFailures;
        if (updatedUserFailures === 7) {
          const cd = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
          db.users[uIdx].locked_until = cd;
          lockedUntilDate = cd;
          isNowCooldown = true;
        } else if (updatedUserFailures >= 8) {
          db.users[uIdx].is_locked = true;
          db.users[uIdx].isLocked = true;
          isNowLocked = true;
        }
        writeDbJson(db);
      }

      // Se entrou em cooldown de 24h ou bloqueio total, grava no cache de memória local
      if (isNowCooldown || isNowLocked) {
        lockedAccountsMemory.set(inputEmail, {
          lockedUntil: lockedUntilDate,
          isLocked: isNowLocked
        });
      }
    }

    // 1. Se atingiu 8+ falhas (Bloqueio Total e Permanente do Usuário ou IP):
    if (isNowLocked || updatedIp.isBlocked || updatedUserFailures >= 8 || updatedIp.failedAttempts >= 8) {
      logSecurityEvent({
        event: 'ACCOUNT_LOCKOUT',
        userId: foundUser?.id,
        email: inputEmail,
        ip: clientIp,
        userAgent: req.headers['user-agent'],
        outcome: 'BLOCKED',
        reason: 'Bloqueio total e permanente acionado (8+ falhas)',
        details: { failedAttempts: updatedUserFailures, isIpBlocked: Boolean(updatedIp.isBlocked) }
      });

      return res.status(403).json({
        error: 'Conta ou endereço IP bloqueado por motivos de segurança após repetidas tentativas. Entre em contato com nosso time de suporte para solucionar seu caso e liberar seu acesso seguro.',
        isLocked: true,
        isAccountLocked: Boolean(foundUser),
        isIpBlocked: Boolean(updatedIp.isBlocked)
      });
    }

    // 2. Se atingiu 7 falhas (Pausa de Segurança de 24 Horas no banco, mensagem visual idêntica):
    if (isNowCooldown || updatedUserFailures === 7 || updatedIp.failedAttempts === 7 || updatedIp.lockedUntil) {
      logSecurityEvent({
        event: 'ACCOUNT_COOLDOWN',
        userId: foundUser?.id,
        email: inputEmail,
        ip: clientIp,
        userAgent: req.headers['user-agent'],
        outcome: 'BLOCKED',
        reason: 'Pausa temporária de segurança de 24 horas acionada (7 falhas)',
        details: { failedAttempts: updatedUserFailures, isIpBlocked: false }
      });

      return res.status(403).json({
        error: 'Conta ou endereço IP bloqueado por motivos de segurança após repetidas tentativas. Entre em contato com nosso time de suporte para solucionar seu caso e liberar seu acesso seguro.',
        isLocked: true,
        isAccountLocked: Boolean(foundUser),
        isIpBlocked: Boolean(updatedIp.lockedUntil)
      });
    }

    // 3. Falhas normais (Tentativas 1 a 6): Sem dar pistas ou countdown ao atacante
    const currentFailuresCount = Math.max(updatedUserFailures, updatedIp.failedAttempts || 0);
    const nextRequiresCaptcha = currentFailuresCount >= 5;

    logSecurityEvent({
      event: 'LOGIN_ATTEMPT',
      userId: foundUser?.id,
      email: inputEmail,
      ip: clientIp,
      userAgent: req.headers['user-agent'],
      outcome: 'FAILURE',
      reason: 'Credenciais incorretas',
      details: { requiresCaptcha: nextRequiresCaptcha }
    });

    return res.status(401).json({
      error: 'E-mail ou senha incorretos.',
      requiresCaptcha: nextRequiresCaptcha
    });
  } catch (err) {
    console.error('Erro inesperado no login:', err);
    return res.status(500).json({ error: 'Erro interno ao processar login.' });
  }
});

// Login Emergencial via Magic Link de Uso Único (Cliente acessa, mas porta de senha continua bloqueada)
app.post('/api/auth/magic-login', async (req, res) => {
  try {
    const { magicToken } = req.body;
    if (!magicToken || typeof magicToken !== 'string') {
      return res.status(400).json({ error: 'Link de acesso inválido ou expirado.' });
    }

    const tokenHash = crypto.createHash('sha256').update(magicToken.trim()).digest('hex');

    // USO ÚNICO ATÔMICO CONTRA RACE CONDITIONS (Mitigação do Teste 6 - Concorrência de Replay):
    // Queima o token e obtém os dados do usuário em uma única instrução SQL atômica com Row-Level Lock.
    // Se 2 requisições paralelas concorrentes chegarem no mesmo milissegundo:
    // A primeira queima o token e recebe a linha; a segunda encontra 0 linhas e é rejeitada com 401.
    let matchedUser = null;
    if (pool) {
      const updateRes = await pool.query(`
        UPDATE users 
        SET magic_token = NULL, magic_token_expires = NULL 
        WHERE magic_token = $1 AND magic_token_expires > CURRENT_TIMESTAMP
        RETURNING id, name, email, role, phone, document, company_name as "companyName", 
                  address, is_verified as "isVerified", COALESCE(must_change_password, false) as "mustChangePassword",
                  locked_until as "lockedUntil", is_locked as "isLocked"
      `, [tokenHash]);
      if (updateRes.rows && updateRes.rows.length > 0) {
        matchedUser = updateRes.rows[0];
      }
    } else {
      const db = readDbJson();
      const uIdx = (db.users || []).findIndex(u => 
        u.magic_token === tokenHash && 
        u.magic_token_expires && 
        new Date(u.magic_token_expires) > new Date()
      );
      if (uIdx !== -1) {
        matchedUser = { ...db.users[uIdx] };
        db.users[uIdx].magic_token = null;
        db.users[uIdx].magic_token_expires = null;
        writeDbJson(db);
      }
    }

    if (!matchedUser) {
      logSecurityEvent({
        event: 'MAGIC_LINK_AUTH',
        ip: getClientIp(req),
        userAgent: req.headers['user-agent'],
        outcome: 'FAILURE',
        reason: 'Token de uso único já consumido, inválido ou expirado (Proteção Atômica Anti-Replay)'
      });
      return res.status(401).json({ error: 'Este link de acesso expirou ou já foi utilizado. Solicite um novo link ao time de suporte.' });
    }

    // OBSERVAÇÃO CRÍTICA (Requisito de Segurança): NÃO zeramos locked_until nem failed_login_attempts!
    // O cliente legítimo fica autenticado e usa o sistema normalmente via token JWT,
    // mas a rota de login por senha continua barrando o invasor pelas 24 horas.

    const userRole = matchedUser.role || 'cliente';
    const isVerified = Boolean(matchedUser.isVerified || userRole === 'admin');

    const { token, expiresAt } = generateToken({
      id: matchedUser.id,
      name: matchedUser.name,
      email: matchedUser.email,
      role: userRole,
      isVerified,
      isMagicLinkSession: true
    });

    logSecurityEvent({
      event: 'MAGIC_LINK_AUTH',
      userId: matchedUser.id,
      email: matchedUser.email,
      ip: getClientIp(req),
      userAgent: req.headers['user-agent'],
      outcome: 'SUCCESS',
      details: { role: userRole }
    });

    return res.json({
      success: true,
      message: `Bem-vindo de volta, ${matchedUser.name}! Seu acesso seguro emergencial foi autenticado.`,
      id: matchedUser.id,
      name: matchedUser.name,
      email: matchedUser.email,
      role: userRole,
      phone: matchedUser.phone || '',
      document: matchedUser.document || '',
      companyName: matchedUser.companyName || '',
      address: matchedUser.address || null,
      isVerified,
      mustChangePassword: Boolean(matchedUser.mustChangePassword),
      isMagicLinkSession: true,
      token,
      expiresAt
    });
  } catch (err) {
    console.error('Erro no login via magic link:', err);
    return res.status(500).json({ error: 'Erro interno ao validar link de acesso.' });
  }
});

// Standard Password Security Validator
function validatePasswordStandard(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'A senha é obrigatória.' };
  }
  if (password.length < 8) {
    return { valid: false, message: 'A senha deve conter no mínimo 8 caracteres.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'A senha deve conter ao menos uma letra maiúscula (A-Z).' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'A senha deve conter ao menos uma letra minúscula (a-z).' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'A senha deve conter ao menos um número (0-9).' };
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/.test(password)) {
    return { valid: false, message: 'A senha deve conter ao menos um caractere especial (!@#$%...).' };
  }
  return { valid: true };
}

// Register New Customer (Self-Registration)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, document, companyName, address } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, E-mail e Senha são obrigatórios para cadastro.' });
    }

    // Password Security Standards
    const pwdCheck = validatePasswordStandard(password);
    if (!pwdCheck.valid) {
      return res.status(400).json({ error: pwdCheck.message });
    }

    const inputEmail = email.trim().toLowerCase();

    // Check if email already exists in PostgreSQL
    if (pool) {
      try {
        const check = await pool.query('SELECT id FROM users WHERE LOWER(email) = $1', [inputEmail]);
        if (check.rows.length > 0) {
          return res.status(400).json({ error: 'Este e-mail já está cadastrado. Faça login ou recupere sua senha.' });
        }
      } catch (e) {
        console.error('Erro ao verificar e-mail duplicado no PG:', e.message);
      }
    }

    // Check if email already exists in local DB
    try {
      const db = readDbJson();
      if (Array.isArray(db.users) && db.users.some(u => u && u.email && u.email.toLowerCase() === inputEmail)) {
        return res.status(400).json({ error: 'Este e-mail já está cadastrado. Faça login ou recupere sua senha.' });
      }
    } catch (dbCheckErr) {
      console.warn('Aviso ao consultar usuários no DB JSON:', dbCheckErr.message);
    }

    const newUserId = `user_cli_${Date.now()}`;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const cleanUser = {
      id: newUserId,
      name: name.trim(),
      email: inputEmail,
      passwordHash: hashedPassword,
      role: 'cliente',
      phone: phone ? phone.trim() : '',
      document: document ? document.trim() : '',
      companyName: companyName ? companyName.trim() : '',
      company_name: companyName ? companyName.trim() : '',
      address: address || null,
      createdAt: new Date().toISOString()
    };

    // Save to Local DB JSON (safely wrapped)
    try {
      const db = readDbJson();
      if (!Array.isArray(db.users)) db.users = [];

      // Retroactive link for A-Points in JSON DB
      if (Array.isArray(db.aPointsTransactions)) {
        const cleanDoc = (cleanUser.document || '').replace(/\D/g, '');
        let retroactivePoints = 0;
        db.aPointsTransactions.forEach(t => {
          if (!t.userId && (
            (t.customerEmail && t.customerEmail.toLowerCase() === cleanUser.email) ||
            (cleanDoc && t.customerDocument && t.customerDocument.replace(/\D/g, '') === cleanDoc)
          )) {
            t.userId = cleanUser.id;
            retroactivePoints += (Number(t.pointsEarned) || 0);
          }
        });
        if (retroactivePoints > 0) {
          cleanUser.aPoints = (cleanUser.aPoints || 0) + retroactivePoints;
        }
      }

      db.users.push(cleanUser);
      writeDbJson(db);
    } catch (jsonErr) {
      console.warn('Aviso ao registrar usuário no athena-db.json:', jsonErr.message);
    }

    // Save to PostgreSQL
    if (pool) {
      try {
        await pool.query(`
          INSERT INTO public.users (id, name, email, password_hash, role, phone, document, company_name, address, a_points, is_verified)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [
          cleanUser.id,
          cleanUser.name,
          cleanUser.email,
          cleanUser.passwordHash,
          cleanUser.role,
          cleanUser.phone,
          cleanUser.document,
          cleanUser.companyName,
          cleanUser.address ? JSON.stringify(cleanUser.address) : null,
          cleanUser.aPoints || 0,
          false
        ]);
      } catch (pgErr) {
        console.error('Erro crítico ao inserir cliente no PostgreSQL:', pgErr);
        return res.status(500).json({ error: 'Erro ao cadastrar usuário no banco de dados. Tente novamente.' });
      }

      // Retroactive link for A-Points earned prior to creating an account
      try {
        const cleanDoc = (cleanUser.document || '').replace(/\D/g, '');
        const pRes = await pool.query(`
          SELECT id, points_earned FROM a_points_transactions 
          WHERE user_id IS NULL AND (LOWER(customer_email) = $1 OR (customer_document = $2 AND $2 != ''))
        `, [cleanUser.email, cleanDoc]);

        if (pRes.rows.length > 0) {
          const retroactivePoints = pRes.rows.reduce((acc, row) => acc + (Number(row.points_earned) || 0), 0);
          await pool.query(`
            UPDATE a_points_transactions 
            SET user_id = $1 
            WHERE user_id IS NULL AND (LOWER(customer_email) = $2 OR (customer_document = $3 AND $3 != ''))
          `, [cleanUser.id, cleanUser.email, cleanDoc]);
          await pool.query(`UPDATE users SET a_points = $1 WHERE id = $2`, [retroactivePoints, cleanUser.id]);
          console.log(`[A-POINTS] Resgatou ${retroactivePoints} pontos retroativos para o novo usuário ${cleanUser.id}`);
        }
      } catch (pointsErr) {
        console.warn('Aviso ao vincular pontos retroativos no registro:', pointsErr.message);
      }
    }

    const { token, expiresAt } = generateToken({
      id: cleanUser.id,
      name: cleanUser.name,
      email: cleanUser.email,
      role: 'cliente',
      isVerified: false
    });

    return res.status(201).json({
      id: cleanUser.id,
      name: cleanUser.name,
      email: cleanUser.email,
      role: 'cliente',
      phone: cleanUser.phone,
      document: cleanUser.document,
      companyName: cleanUser.companyName,
      address: cleanUser.address,
      isVerified: false,
      token,
      expiresAt,
      message: 'Cadastro realizado com sucesso!'
    });
  } catch (err) {
    console.error('Erro no cadastro de cliente:', err);
    return res.status(500).json({ error: err.message || 'Erro interno ao realizar cadastro.' });
  }
});

// Forgot Password - Send Google SMTP Email with Reset Code (Protected by dedicated rate limiter)
app.post('/api/auth/forgot-password', forgotPasswordLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Informe seu e-mail cadastrado.' });
    }

    const inputEmail = email.trim().toLowerCase();
    let foundUser = null;

    if (pool) {
      try {
        const userRes = await pool.query('SELECT id, name, email FROM users WHERE email = $1', [inputEmail]);
        if (userRes.rows.length > 0) {
          foundUser = userRes.rows[0];
        }
      } catch (e) {}
    }

    if (!foundUser) {
      const db = readDbJson();
      foundUser = (db.users || []).find(u => u.email.toLowerCase() === inputEmail);
    }

    logSecurityEvent({
      event: 'PASSWORD_RESET_REQUEST',
      email: inputEmail,
      ip: getClientIp(req),
      userAgent: req.headers['user-agent'],
      outcome: 'SUCCESS',
      details: { accountFound: Boolean(foundUser) }
    });

    if (!foundUser) {
      // Segurança: Não divulga se o e-mail existe ou não (prevenção de enumeração de contas)
      return res.json({
        success: true,
        message: 'E-mail enviado! Se o endereço estiver cadastrado em nosso sistema, você receberá o código de recuperação em instantes.'
      });
    }

    // Generate cryptographically secure 6-digit code (CSPRNG)
    const resetCode = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes TTL
    const resetId = `reset_${Date.now()}`;

    if (pool) {
      try {
        await pool.query(`
          INSERT INTO password_resets (id, email, token, expires_at, used)
          VALUES ($1, $2, $3, $4, $5)
        `, [resetId, inputEmail, resetCode, expiresAt, false]);
      } catch (e) {
        console.error('Erro ao registrar reset no PostgreSQL:', e.message);
      }
    }

    const db = readDbJson();
    if (!db.password_resets) db.password_resets = [];
    db.password_resets.push({
      id: resetId,
      email: inputEmail,
      token: resetCode,
      expiresAt: expiresAt.toISOString(),
      used: false
    });
    writeDbJson(db);

    // Send email via Google SMTP
    const emailResult = await sendPasswordResetEmail(inputEmail, resetCode, foundUser.name);

    return res.json({
      success: true,
      message: 'E-mail enviado! Se o endereço estiver cadastrado em nosso sistema, você receberá o código de recuperação em instantes.',
      delivery: emailResult.method,
      // In dev/test without SMTP configured, returns code for instant test preview
      ...(emailResult.method === 'log' ? { devCode: resetCode } : {})
    });
  } catch (err) {
    console.error('Erro ao processar esqueci minha senha:', err);
    return res.status(500).json({ error: 'Erro interno ao processar recuperação de senha.' });
  }
});

// Reset Password - Verify Code and Set New Password
const passwordResetAttempts = new Map(); // email -> { failedCount: number, lockedUntil: Date }

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'E-mail, código de verificação e nova senha são obrigatórios.' });
    }

    const pwdCheck = validatePasswordStandard(newPassword);
    if (!pwdCheck.valid) {
      return res.status(400).json({ error: pwdCheck.message });
    }

    const inputEmail = email.trim().toLowerCase();
    const inputCode = code.trim();

    // Checagem anti-força bruta: 5 erros bloqueiam a tentativa por 15 minutos
    const lockInfo = passwordResetAttempts.get(inputEmail);
    if (lockInfo && lockInfo.lockedUntil && new Date(lockInfo.lockedUntil) > new Date()) {
      const waitMinutes = Math.ceil((new Date(lockInfo.lockedUntil) - Date.now()) / (60 * 1000));
      logSecurityEvent({
        event: 'PASSWORD_RESET_LOCKED',
        email: inputEmail,
        ip: getClientIp(req),
        userAgent: req.headers['user-agent'],
        outcome: 'BLOCKED',
        reason: 'Tentativa de redefinição de senha com conta em cooldown anti-força bruta'
      });
      return res.status(429).json({ error: `Muitas tentativas incorretas. Por segurança, tente novamente em ${waitMinutes} minutos.` });
    }

    let validReset = null;

    if (pool) {
      try {
        const check = await pool.query(`
          SELECT id, email, token, expires_at, used 
          FROM password_resets 
          WHERE email = $1 AND token = $2 AND used = FALSE AND expires_at > NOW()
          ORDER BY created_at DESC LIMIT 1
        `, [inputEmail, inputCode]);
        if (check.rows.length > 0) {
          validReset = check.rows[0];
        }
      } catch (e) {}
    }

    if (!validReset) {
      const db = readDbJson();
      const nowIso = new Date().toISOString();
      validReset = (db.password_resets || []).find(r => 
        r.email.toLowerCase() === inputEmail && 
        r.token === inputCode && 
        !r.used && 
        r.expiresAt > nowIso
      );
    }

    if (!validReset) {
      const currentFailed = (lockInfo?.failedCount || 0) + 1;
      if (currentFailed >= 5) {
        passwordResetAttempts.set(inputEmail, {
          failedCount: currentFailed,
          lockedUntil: new Date(Date.now() + 15 * 60 * 1000)
        });
        if (pool) {
          try {
            await pool.query('UPDATE password_resets SET used = TRUE WHERE email = $1', [inputEmail]);
          } catch (e) {}
        }
        logSecurityEvent({
          event: 'PASSWORD_RESET_BRUTEFORCE_BLOCKED',
          email: inputEmail,
          ip: getClientIp(req),
          userAgent: req.headers['user-agent'],
          outcome: 'BLOCKED',
          reason: '5 tentativas consecutivas incorretas de código de recuperação: token invalidado'
        });
        return res.status(429).json({ error: 'Limite de 5 tentativas incorretas excedido. O código foi cancelado por segurança. Solicite um novo código.' });
      } else {
        passwordResetAttempts.set(inputEmail, {
          failedCount: currentFailed,
          lockedUntil: null
        });
      }

      logSecurityEvent({
        event: 'PASSWORD_RESET_SUBMIT',
        email: inputEmail,
        ip: getClientIp(req),
        userAgent: req.headers['user-agent'],
        outcome: 'FAILURE',
        reason: `Código inválido ou expirado (Tentativa ${currentFailed}/5)`
      });
      return res.status(400).json({ error: `Código inválido ou expirado (${currentFailed}/5 tentativas). Solicite um novo código se necessário.` });
    }

    // Sucesso: limpa tracker de falhas
    passwordResetAttempts.delete(inputEmail);

    // Update password hash
    const newHash = bcrypt.hashSync(newPassword, 10);

    if (pool) {
      try {
        await pool.query('UPDATE users SET password_hash = $1 WHERE email = $2', [newHash, inputEmail]);
        await pool.query('UPDATE password_resets SET used = TRUE WHERE id = $1', [validReset.id]);
      } catch (e) {
        console.error('Erro ao atualizar senha no PG:', e.message);
      }
    }

    const db = readDbJson();
    const uIdx = (db.users || []).findIndex(u => u.email.toLowerCase() === inputEmail);
    if (uIdx !== -1) {
      db.users[uIdx].passwordHash = newHash;
      db.users[uIdx].password_hash = newHash;
    }
    const rIdx = (db.password_resets || []).findIndex(r => r.id === validReset.id);
    if (rIdx !== -1) {
      db.password_resets[rIdx].used = true;
    }
    writeDbJson(db);

    logSecurityEvent({
      event: 'PASSWORD_RESET_SUCCESS',
      email: inputEmail,
      ip: getClientIp(req),
      userAgent: req.headers['user-agent'],
      outcome: 'SUCCESS'
    });

    return res.json({
      success: true,
      message: 'Sua senha foi redefinida com sucesso! Você já pode entrar com a nova senha.'
    });
  } catch (err) {
    console.error('Erro ao redefinir senha:', err);
    return res.status(500).json({ error: 'Erro interno ao redefinir senha.' });
  }
});

// Force Change Temporary Password (After Support Reset)
app.post('/api/auth/force-change-password', authenticateToken, async (req, res) => {
  try {
    // OWASP Hardening: Sessões geradas via Magic Link não têm autorização para trocar senhas sem reautenticação
    if (req.user?.isMagicLinkSession) {
      logSecurityEvent({
        event: 'SENSITIVE_ACTION_BLOCKED',
        userId: req.user.id,
        email: req.user.email,
        ip: getClientIp(req),
        userAgent: req.headers['user-agent'],
        outcome: 'BLOCKED',
        reason: 'Tentativa de alteração de senha definitiva via sessão de Magic Link'
      });
      return res.status(403).json({
        error: 'Sessões autenticadas via Link de Acesso Emergencial não possuem autorização para alterar senhas. Por segurança, acesse sua conta usando suas credenciais completas.'
      });
    }

    const { newPassword } = req.body;
    if (!newPassword) {
      return res.status(400).json({ error: 'A nova senha definitiva é obrigatória.' });
    }

    const pwdCheck = validatePasswordStandard(newPassword);
    if (!pwdCheck.valid) {
      return res.status(400).json({ error: pwdCheck.message });
    }

    const userId = req.user.id;
    const newHash = bcrypt.hashSync(newPassword, 10);

    if (pool) {
      try {
        await pool.query('UPDATE users SET password_hash = $1, must_change_password = FALSE, updated_at = NOW() WHERE id = $2', [newHash, userId]);
      } catch (e) {
        console.error('Erro ao atualizar senha definitiva no PostgreSQL:', e.message);
      }
    }

    const db = readDbJson();
    const uIdx = (db.users || []).findIndex(u => u.id === userId);
    if (uIdx !== -1) {
      db.users[uIdx].passwordHash = newHash;
      db.users[uIdx].password_hash = newHash;
      db.users[uIdx].mustChangePassword = false;
      db.users[uIdx].must_change_password = false;
      writeDbJson(db);
    }

    logSecurityEvent({
      event: 'PASSWORD_CHANGED',
      userId: req.user.id,
      email: req.user.email,
      ip: getClientIp(req),
      userAgent: req.headers['user-agent'],
      outcome: 'SUCCESS'
    });

    return res.json({
      success: true,
      message: 'Senha definitiva definida com sucesso! Você já pode navegar normalmente no site.'
    });
  } catch (err) {
    console.error('Erro ao processar troca obrigatória de senha:', err);
    return res.status(500).json({ error: 'Erro ao cadastrar nova senha definitiva.' });
  }
});

// -------------------------------------------------------------
// EMAIL VERIFICATION ENDPOINTS (6-DIGIT ALPHANUMERIC OTP)
// -------------------------------------------------------------

// Send 6-Character Alphanumeric Email Verification Code
app.post('/api/auth/send-verification-code', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = (req.user.email || '').toLowerCase().trim();
    const userName = req.user.name || 'Cliente Athena';

    if (!userEmail) {
      return res.status(400).json({ error: 'E-mail do usuário não encontrado na sessão.' });
    }

    // Check if user is already verified
    let isAlreadyVerified = false;
    if (pool) {
      try {
        const uCheck = await pool.query('SELECT is_verified FROM users WHERE id = $1', [userId]);
        if (uCheck.rows.length > 0 && uCheck.rows[0].is_verified) {
          isAlreadyVerified = true;
        }
      } catch (e) {}
    } else {
      const db = readDbJson();
      const u = (db.users || []).find(usr => usr.id === userId);
      if (u && (u.isVerified || u.is_verified)) isAlreadyVerified = true;
    }

    if (isAlreadyVerified) {
      return res.json({
        success: true,
        alreadyVerified: true,
        message: 'Seu e-mail já está confirmado e verificado.'
      });
    }

    // Generate 6-character alphanumeric code (letters and numbers mixed, never pure numeric)
    const verificationCode = generateAlphanumericOtp(6);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes validity
    const verificationId = `vcode_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    if (pool) {
      try {
        await pool.query(`
          INSERT INTO email_verifications (id, user_id, email, code, expires_at, verified)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [verificationId, userId, userEmail, verificationCode, expiresAt, false]);
      } catch (e) {
        console.error('Erro ao registrar verificação no PG:', e.message);
      }
    }

    const db = readDbJson();
    if (!db.email_verifications) db.email_verifications = [];
    db.email_verifications.push({
      id: verificationId,
      userId,
      email: userEmail,
      code: verificationCode,
      expiresAt: expiresAt.toISOString(),
      verified: false,
      createdAt: new Date().toISOString()
    });
    writeDbJson(db);

    // Send email via Google SMTP
    const emailResult = await sendVerificationEmail(userEmail, verificationCode, userName);

    return res.json({
      success: true,
      message: 'Código de verificação enviado para o seu e-mail!',
      delivery: emailResult.method,
      expiresInMinutes: 30,
      ...(emailResult.method === 'log' ? { devCode: verificationCode } : {})
    });
  } catch (err) {
    console.error('Erro ao enviar código de verificação:', err);
    return res.status(500).json({ error: 'Erro interno ao gerar código de verificação.' });
  }
});

// Verify 6-Character Alphanumeric Email Code
app.post('/api/auth/verify-email-code', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = (req.user.email || '').toLowerCase().trim();
    const { code } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Por favor, informe o código de 6 dígitos recebido por e-mail.' });
    }

    const cleanCode = code.trim().toUpperCase();
    if (cleanCode.length !== 6) {
      return res.status(400).json({ error: 'O código de verificação deve conter exatamente 6 caracteres.' });
    }

    let isValid = false;
    let recordId = null;

    if (pool) {
      try {
        const checkRes = await pool.query(`
          SELECT id FROM email_verifications
          WHERE (user_id = $1 OR email = $2)
            AND code = $3
            AND verified = FALSE
            AND expires_at > NOW()
          ORDER BY created_at DESC
          LIMIT 1
        `, [userId, userEmail, cleanCode]);

        if (checkRes.rows.length > 0) {
          isValid = true;
          recordId = checkRes.rows[0].id;
        }
      } catch (e) {
        console.error('Erro ao validar verificação no PG:', e.message);
      }
    }

    if (!isValid) {
      const db = readDbJson();
      const records = db.email_verifications || [];
      const match = records.find(r => 
        (r.userId === userId || r.email === userEmail) &&
        r.code === cleanCode &&
        !r.verified &&
        new Date(r.expiresAt) > new Date()
      );
      if (match) {
        isValid = true;
        recordId = match.id;
      }
    }

    if (!isValid) {
      return res.status(400).json({
        error: 'Código inválido ou expirado (validade de 30 minutos). Verifique os caracteres ou solicite um novo código.'
      });
    }

    // Mark code as verified
    if (pool) {
      try {
        if (recordId) {
          await pool.query('UPDATE email_verifications SET verified = TRUE WHERE id = $1', [recordId]);
        }
        await pool.query('UPDATE users SET is_verified = TRUE WHERE id = $1', [userId]);
      } catch (e) {
        console.error('Erro ao atualizar status verificado no PG:', e.message);
      }
    }

    const db = readDbJson();
    if (db.email_verifications) {
      const rec = db.email_verifications.find(r => r.id === recordId);
      if (rec) rec.verified = true;
    }
    const uIdx = (db.users || []).findIndex(u => u.id === userId);
    if (uIdx !== -1) {
      db.users[uIdx].isVerified = true;
      db.users[uIdx].is_verified = true;
      writeDbJson(db);
    }

    return res.json({
      success: true,
      isVerified: true,
      message: 'E-mail verificado com sucesso! Suas ações foram liberadas.'
    });
  } catch (err) {
    console.error('Erro ao validar código de verificação:', err);
    return res.status(500).json({ error: 'Erro interno ao validar código.' });
  }
});

// Update Customer Profile & Address
app.put('/api/customer/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, document, companyName, address, currentPassword, newPassword } = req.body;

    const db = readDbJson();
    let existingUser = (db.users || []).find(u => u.id === userId);

    if (pool) {
      try {
        const uRes = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
        if (uRes.rows.length > 0) {
          existingUser = {
            ...existingUser,
            ...uRes.rows[0],
            passwordHash: uRes.rows[0].password_hash
          };
        }
      } catch (e) {}
    }

    if (!existingUser) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    // OWASP Hardening: Sessões geradas via Magic Link não têm autorização para trocar senhas ou dados sensíveis sem reautenticação
    if (req.user?.isMagicLinkSession && (newPassword || (req.body.email && req.body.email.toLowerCase().trim() !== (existingUser.email || '').toLowerCase().trim()))) {
      logSecurityEvent({
        event: 'SENSITIVE_ACTION_BLOCKED',
        userId: req.user.id,
        email: existingUser.email,
        ip: getClientIp(req),
        userAgent: req.headers['user-agent'],
        outcome: 'BLOCKED',
        reason: 'Tentativa de alteração de credenciais sensíveis via sessão de Magic Link em /api/customer/profile'
      });
      return res.status(403).json({
        error: 'Sessões autenticadas via Link de Acesso Emergencial não possuem autorização para alterar senhas ou dados permanentes de acesso. Por segurança, realize login com suas credenciais completas.'
      });
    }

    // Password change check if requested
    let updatedHash = existingUser.passwordHash || existingUser.password_hash;
    if (newPassword) {
      if (!currentPassword || !checkPassword(currentPassword, updatedHash)) {
        return res.status(400).json({ error: 'Senha atual incorreta.' });
      }
      const pwdCheck = validatePasswordStandard(newPassword);
      if (!pwdCheck.valid) {
        return res.status(400).json({ error: pwdCheck.message });
      }
      updatedHash = bcrypt.hashSync(newPassword, 10);
    }

    const updatedName = name !== undefined ? name.trim() : existingUser.name;
    const updatedPhone = phone !== undefined ? phone.trim() : (existingUser.phone || '');
    const updatedDocument = document !== undefined ? document.trim() : (existingUser.document || '');
    const updatedCompanyName = companyName !== undefined ? companyName.trim() : (existingUser.company_name || existingUser.companyName || '');
    const updatedAddress = address !== undefined ? address : (existingUser.address || null);

    if (pool) {
      try {
        await pool.query(`
          UPDATE users 
          SET name = $1, phone = $2, document = $3, company_name = $4, address = $5, password_hash = $6
          WHERE id = $7
        `, [
          updatedName,
          updatedPhone,
          updatedDocument,
          updatedCompanyName,
          updatedAddress ? JSON.stringify(updatedAddress) : null,
          updatedHash,
          userId
        ]);
      } catch (e) {
        console.error('Erro ao atualizar perfil do cliente no PG:', e.message);
      }
    }

    const uIdx = (db.users || []).findIndex(u => u.id === userId);
    if (uIdx !== -1) {
      db.users[uIdx] = {
        ...db.users[uIdx],
        name: updatedName,
        phone: updatedPhone,
        document: updatedDocument,
        companyName: updatedCompanyName,
        company_name: updatedCompanyName,
        address: updatedAddress,
        passwordHash: updatedHash
      };
      writeDbJson(db);
    }

    return res.json({
      success: true,
      message: 'Dados atualizados com sucesso!',
      user: {
        id: userId,
        name: updatedName,
        email: existingUser.email,
        phone: updatedPhone,
        document: updatedDocument,
        companyName: updatedCompanyName,
        address: updatedAddress,
        role: existingUser.role || 'cliente',
        isVerified: Boolean(existingUser.is_verified || existingUser.isVerified || existingUser.role === 'admin')
      }
    });
  } catch (err) {
    console.error('Erro ao atualizar perfil:', err);
    return res.status(500).json({ error: 'Erro interno ao atualizar perfil.' });
  }
});

// Get Customer Orders & Quotes
app.get('/api/customer/orders', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    if (pool) {
      try {
        const query = req.user.role === 'admin' 
          ? 'SELECT id, user_id as "userId", user_email as "userEmail", user_name as "userName", items, total_amount::float as "totalAmount", status, notes, created_at as "createdAt" FROM orders ORDER BY created_at DESC'
          : 'SELECT id, user_id as "userId", user_email as "userEmail", user_name as "userName", items, total_amount::float as "totalAmount", status, notes, created_at as "createdAt" FROM orders WHERE user_id = $1 OR user_email = $2 ORDER BY created_at DESC';
        const params = req.user.role === 'admin' ? [] : [userId, userEmail];
        const result = await pool.query(query, params);
        return res.json(result.rows);
      } catch (e) {
        console.error('Erro ao buscar pedidos no PG:', e.message);
      }
    }

    const db = readDbJson();
    const ordersList = db.orders || [];
    if (req.user.role === 'admin') {
      return res.json(ordersList);
    }
    const filtered = ordersList.filter(o => o.userId === userId || o.userEmail === userEmail);
    return res.json(filtered);
  } catch (err) {
    console.error('Erro ao buscar pedidos:', err);
    return res.status(500).json({ error: 'Erro ao buscar pedidos.' });
  }
});

// Create Customer Order or Quote
app.post('/api/customer/orders', async (req, res) => {
  try {
    const { userId, userEmail, userName, items, totalAmount, notes } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Lista de equipamentos/itens obrigatória.' });
    }

    // Se houver sessão JWT ativa, vincula com segurança à conta do usuário autenticado para evitar spoofing
    let safeUserId = userId || null;
    let safeEmail = userEmail || '';
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded?.id) {
          safeUserId = decoded.id;
          safeEmail = decoded.email || safeEmail;
        }
      } catch (e) {}
    }

    const orderId = `athena_ped_${Date.now().toString().slice(-6)}`;
    const newOrder = {
      id: orderId,
      userId: safeUserId,
      userEmail: safeEmail,
      userName: userName || 'Cliente',
      items,
      totalAmount: Math.max(0, Number(totalAmount) || 0),
      total_amount: Math.max(0, Number(totalAmount) || 0),
      status: 'em_analise', // Sempre em análise; status faturado apenas via pagamento aprovado
      notes: notes || '',
      createdAt: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    if (pool) {
      try {
        await pool.query(`
          INSERT INTO orders (id, user_id, user_email, user_name, items, total_amount, status, notes)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          newOrder.id,
          newOrder.userId,
          newOrder.userEmail,
          newOrder.userName,
          JSON.stringify(newOrder.items),
          newOrder.totalAmount,
          newOrder.status,
          newOrder.notes
        ]);
      } catch (e) {
        console.error('Erro ao salvar pedido no PG:', e.message);
      }
    }

    const db = readDbJson();
    if (!db.orders) db.orders = [];
    db.orders.unshift(newOrder);
    writeDbJson(db);

    return res.status(201).json(newOrder);
  } catch (err) {
    console.error('Erro ao criar pedido:', err);
    return res.status(500).json({ error: 'Erro interno ao criar pedido.' });
  }
});

// -------------------------------------------------------------
// ASAAS PAYMENT GATEWAY INTEGRATION (PIX, BOLETO & CARTÃO)
// -------------------------------------------------------------
const ASAAS_API_KEY = process.env.ASAAS_API_KEY || process.env.VITE_ASAAS_API_KEY || '';
const ASAAS_IS_SANDBOX = (process.env.ASAAS_SANDBOX === 'true' || process.env.VITE_ASAAS_SANDBOX === 'true') && !ASAAS_API_KEY.startsWith('$aact_prod_');
const ASAAS_BASE_URL = ASAAS_IS_SANDBOX 
  ? 'https://sandbox.asaas.com/api/v3' 
  : 'https://api.asaas.com/v3';
const ASAAS_WEBHOOK_SECRET = process.env.ASAAS_WEBHOOK_SECRET || process.env.VITE_ASAAS_WEBHOOK_SECRET || '';

// Keep-Alive routine: Runs every 5 days to ensure the API key never expires due to inactivity
async function pingAsaasKeepAlive() {
  if (!ASAAS_API_KEY) return;
  try {
    const axios = require('axios');
    const res = await axios.get(`${ASAAS_BASE_URL}/finance/balance`, {
      headers: { 'access_token': ASAAS_API_KEY }
    });
    console.log(`[Asaas Keep-Alive] Conexao ativa! Saldo: R$ ${res.data?.totalBalance || 0} (Chave de API validada)`);
  } catch (err) {
    console.warn(`[Asaas Keep-Alive] Aviso ao consultar Asaas:`, err.response?.data?.errors?.[0]?.description || err.message);
  }
}
setTimeout(pingAsaasKeepAlive, 10000);
setInterval(pingAsaasKeepAlive, 5 * 24 * 60 * 60 * 1000);

// -------------------------------------------------------------
// COUPONS & DISCOUNT ENGINE (WITH STRICT R$ 5,00 GATEWAY RULE)
// -------------------------------------------------------------

function evaluateCoupon(coupon, items = [], customerEmail = '', customerCpfCnpj = '') {
  if (!coupon) return { valid: false, error: 'Cupom de desconto não encontrado.' };
  if (coupon.status !== 'active') return { valid: false, error: 'Este cupom está pausado ou inativo.' };

  // 1. Expiration check
  if (coupon.expiresAt || coupon.expires_at) {
    const expDate = new Date(coupon.expiresAt || coupon.expires_at);
    if (expDate < new Date()) {
      return { valid: false, error: 'Este cupom de desconto expirou em ' + expDate.toLocaleDateString('pt-BR') + '.' };
    }
  }

  // 2. Total global usage limit
  const maxTotal = Number(coupon.maxUsageTotal || coupon.max_usage_total || 0);
  const usedCount = Number(coupon.usedCount || coupon.used_count || 0);
  if (maxTotal > 0 && usedCount >= maxTotal) {
    return { valid: false, error: 'Este cupom atingiu o limite máximo de utilizações.' };
  }

  // 3. Customer usage limit
  const maxPerCustomer = Number(coupon.maxUsagePerCustomer || coupon.max_usage_per_customer || 1);
  const usedBy = coupon.usedBy || coupon.used_by || [];
  const cleanEmail = (customerEmail || '').toLowerCase().trim();
  const cleanDoc = (customerCpfCnpj || '').replace(/[^0-9a-zA-Z]/g, '').toUpperCase();

  if (maxPerCustomer > 0 && (cleanEmail || cleanDoc)) {
    const customerUsageCount = usedBy.filter(u => 
      (cleanEmail && (u.email || '').toLowerCase().trim() === cleanEmail) ||
      (cleanDoc && (u.document || '').replace(/[^0-9a-zA-Z]/g, '').toUpperCase() === cleanDoc)
    ).length;

    if (customerUsageCount >= maxPerCustomer) {
      return { valid: false, error: 'Você já utilizou este cupom de desconto o número máximo de vezes permitido.' };
    }
  }

  // 4. Target specific customer email restriction
  const customerType = coupon.customerType || coupon.customer_type || 'all';
  const specificEmail = (coupon.specificEmail || coupon.specific_email || '').toLowerCase().trim();
  if (customerType === 'specific_email' && specificEmail) {
    if (!cleanEmail) {
      return { valid: false, error: 'Informe seu e-mail para validar este cupom exclusivo.', requiresEmail: true };
    }
    if (cleanEmail !== specificEmail) {
      return { valid: false, error: 'Este cupom é exclusivo e intransferível para o e-mail ' + specificEmail + '.' };
    }
  }

  // 5. Items eligibility check (only products with price > 0 and not negotiable)
  const validItems = items.filter(it => (Number(it.price) || 0) > 0 && !it.priceNegotiable);
  if (validItems.length === 0) {
    return { valid: false, error: 'Cupons só podem ser aplicados em produtos com preço de compra direta cadastrado.' };
  }

  const scopeType = coupon.scopeType || coupon.scope_type || 'all';
  const targetProductIds = coupon.targetProductIds || coupon.target_product_ids || [];
  const targetCategoryIds = coupon.targetCategoryIds || coupon.target_category_ids || [];
  const targetBrandIds = coupon.targetBrandIds || coupon.target_brand_ids || [];

  const eligibleItems = validItems.filter(it => {
    if (scopeType === 'all') return true;
    if (scopeType === 'products') return targetProductIds.includes(it.productId || it.id);
    if (scopeType === 'categories') return targetCategoryIds.includes(it.categoryId);
    if (scopeType === 'brands') return targetBrandIds.includes(it.brandId);
    return false;
  });

  if (eligibleItems.length === 0) {
    return { valid: false, error: 'Este cupom não é aplicável aos produtos selecionados no pedido.' };
  }

  // 6. Minimum purchase amount & minimum item quantity
  const eligibleSubtotal = eligibleItems.reduce((sum, it) => sum + (Number(it.price) * (Number(it.quantity) || 1)), 0);
  const totalQuantity = eligibleItems.reduce((sum, it) => sum + (Number(it.quantity) || 1), 0);

  const minOrderAmount = Number(coupon.minOrderAmount || coupon.min_order_amount || 0);
  if (minOrderAmount > 0 && eligibleSubtotal < minOrderAmount) {
    return { valid: false, error: `Este cupom exige um valor mínimo de compra de R$ ${minOrderAmount.toFixed(2).replace('.', ',')}. Subtotal atual: R$ ${eligibleSubtotal.toFixed(2).replace('.', ',')}.` };
  }

  const minItemQuantity = Number(coupon.minItemQuantity || coupon.min_item_quantity || 0);
  if (minItemQuantity > 0 && totalQuantity < minItemQuantity) {
    return { valid: false, error: `Este cupom exige uma quantidade mínima de ${minItemQuantity} itens elegíveis no carrinho.` };
  }

  // 7. Calculate Discount Amount
  const discountType = coupon.discountType || coupon.discount_type || 'percentage';
  const discountVal = Number(coupon.discountValue || coupon.discount_value || 0);
  const maxDiscount = Number(coupon.maxDiscount || coupon.max_discount || 0);

  let rawDiscount = 0;
  if (discountType === 'percentage') {
    rawDiscount = (eligibleSubtotal * discountVal) / 100;
    if (maxDiscount > 0 && rawDiscount > maxDiscount) {
      rawDiscount = maxDiscount;
    }
  } else {
    // Fixed amount (R$)
    rawDiscount = discountVal;
  }

  // Full cart subtotal
  const totalCartSubtotal = validItems.reduce((sum, it) => sum + (Number(it.price) * (Number(it.quantity) || 1)), 0);
  const discountAmount = Math.min(rawDiscount, totalCartSubtotal);
  const finalPayable = Math.max(0, Math.round((totalCartSubtotal - discountAmount) * 100) / 100);

  // 8. STRICT R$ 5,00 GATEWAY RULE
  // If not 100% free (finalPayable === 0), it MUST be at least R$ 5,00!
  if (finalPayable > 0 && finalPayable < 5.00) {
    return {
      valid: false,
      error: `O desconto deste cupom deixaria o valor final a pagar em R$ ${finalPayable.toFixed(2).replace('.', ',')}, que fica abaixo do mínimo permitido pelo sistema (R$ 5,00). Adicione mais produtos ou utilize um cupom de 100%.`
    };
  }

  return {
    valid: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      description: coupon.description,
      discountType,
      discountValue: discountVal,
      maxDiscount
    },
    discountAmount,
    subtotal: totalCartSubtotal,
    finalPayable,
    isFreeOrder: finalPayable === 0
  };
}

// -------------------------------------------------------------
// COUPON CRUD & VALIDATION ENDPOINTS
// -------------------------------------------------------------

// List All Coupons (Admin or active overview)
app.get('/api/coupons', async (req, res) => {
  try {
    if (pool) {
      const result = await pool.query(`
        SELECT 
          id, code, description, 
          discount_type as "discountType", 
          discount_value as "discountValue", 
          max_discount as "maxDiscount", 
          scope_type as "scopeType", 
          target_product_ids as "targetProductIds", 
          target_category_ids as "targetCategoryIds", 
          target_brand_ids as "targetBrandIds", 
          min_order_amount as "minOrderAmount", 
          min_item_quantity as "minItemQuantity", 
          customer_type as "customerType", 
          specific_email as "specificEmail", 
          max_usage_total as "maxUsageTotal", 
          max_usage_per_customer as "maxUsagePerCustomer", 
          used_count as "usedCount", 
          used_by as "usedBy", 
          expires_at as "expiresAt", 
          status, 
          created_at as "createdAt", 
          updated_at as "updatedAt"
        FROM coupons 
        ORDER BY created_at DESC
      `);
      return res.json(result.rows || []);
    }

    const db = readDbJson();
    return res.json(db.coupons || []);
  } catch (err) {
    console.error('Erro ao listar cupons:', err);
    return res.status(500).json({ error: 'Erro ao carregar cupons.' });
  }
});

// Create New Coupon (Admin Only)
app.post('/api/coupons', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      code,
      description,
      discountType = 'percentage',
      discountValue,
      maxDiscount,
      scopeType = 'all',
      targetProductIds = [],
      targetCategoryIds = [],
      targetBrandIds = [],
      minOrderAmount = 0,
      minItemQuantity = 0,
      customerType = 'all',
      specificEmail = '',
      maxUsageTotal = 0,
      maxUsagePerCustomer = 1,
      expiresAt = null,
      status = 'active'
    } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ error: 'O código do cupom é obrigatório.' });
    }

    const cleanCode = code.trim().toUpperCase().replace(/\s+/g, '');
    const numDiscountValue = Number(discountValue);

    if (isNaN(numDiscountValue) || numDiscountValue <= 0) {
      return res.status(400).json({ error: 'Informe um valor de desconto válido e positivo.' });
    }

    if (discountType === 'percentage' && numDiscountValue > 100) {
      return res.status(400).json({ error: 'Desconto em porcentagem não pode exceder 100%.' });
    }

    const couponId = `coupon_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const newCoupon = {
      id: couponId,
      code: cleanCode,
      description: description || '',
      discountType,
      discountValue: numDiscountValue,
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      scopeType,
      targetProductIds: Array.isArray(targetProductIds) ? targetProductIds : [],
      targetCategoryIds: Array.isArray(targetCategoryIds) ? targetCategoryIds : [],
      targetBrandIds: Array.isArray(targetBrandIds) ? targetBrandIds : [],
      minOrderAmount: Number(minOrderAmount) || 0,
      minItemQuantity: Number(minItemQuantity) || 0,
      customerType,
      specificEmail: specificEmail ? specificEmail.toLowerCase().trim() : null,
      maxUsageTotal: Number(maxUsageTotal) || 0,
      maxUsagePerCustomer: Number(maxUsagePerCustomer) || 1,
      usedCount: 0,
      usedBy: [],
      expiresAt: expiresAt || null,
      status: status || 'active',
      createdAt: now,
      updatedAt: now
    };

    if (pool) {
      try {
        await pool.query(`
          INSERT INTO coupons (
            id, code, description, discount_type, discount_value, max_discount,
            scope_type, target_product_ids, target_category_ids, target_brand_ids,
            min_order_amount, min_item_quantity, customer_type, specific_email,
            max_usage_total, max_usage_per_customer, used_count, used_by,
            expires_at, status, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
        `, [
          newCoupon.id, newCoupon.code, newCoupon.description, newCoupon.discountType, newCoupon.discountValue, newCoupon.maxDiscount,
          newCoupon.scopeType, JSON.stringify(newCoupon.targetProductIds), JSON.stringify(newCoupon.targetCategoryIds), JSON.stringify(newCoupon.targetBrandIds),
          newCoupon.minOrderAmount, newCoupon.minItemQuantity, newCoupon.customerType, newCoupon.specificEmail,
          newCoupon.maxUsageTotal, newCoupon.maxUsagePerCustomer, 0, JSON.stringify([]),
          newCoupon.expiresAt, newCoupon.status, now, now
        ]);
      } catch (pgErr) {
        if (pgErr.code === '23505') {
          return res.status(400).json({ error: `Já existe um cupom com o código "${cleanCode}".` });
        }
        throw pgErr;
      }
    }

    const db = readDbJson();
    if ((db.coupons || []).some(c => c.code === cleanCode)) {
      return res.status(400).json({ error: `Já existe um cupom com o código "${cleanCode}".` });
    }
    db.coupons = [newCoupon, ...(db.coupons || [])];
    writeDbJson(db);

    return res.status(201).json(newCoupon);
  } catch (err) {
    console.error('Erro ao criar cupom:', err);
    return res.status(500).json({ error: 'Erro ao cadastrar cupom no sistema.' });
  }
});

// Update Coupon / Toggle Pause (Admin Only)
app.put('/api/coupons/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const couponId = req.params.id;
    const updates = req.body;
    const now = new Date().toISOString();

    let existing = null;
    const db = readDbJson();
    const idx = (db.coupons || []).findIndex(c => c.id === couponId);
    if (idx !== -1) {
      existing = db.coupons[idx];
    }

    if (pool) {
      const resPg = await pool.query('SELECT * FROM coupons WHERE id = $1', [couponId]);
      if (resPg.rows && resPg.rows.length > 0) {
        existing = existing || resPg.rows[0];
      }
    }

    if (!existing) {
      return res.status(404).json({ error: 'Cupom não encontrado.' });
    }

    const updatedCoupon = {
      ...existing,
      ...updates,
      code: updates.code ? updates.code.trim().toUpperCase().replace(/\s+/g, '') : existing.code,
      updatedAt: now
    };

    if (pool) {
      await pool.query(`
        UPDATE coupons SET
          code = $1, description = $2, discount_type = $3, discount_value = $4, max_discount = $5,
          scope_type = $6, target_product_ids = $7, target_category_ids = $8, target_brand_ids = $9,
          min_order_amount = $10, min_item_quantity = $11, customer_type = $12, specific_email = $13,
          max_usage_total = $14, max_usage_per_customer = $15, status = $16, expires_at = $17, updated_at = $18
        WHERE id = $19
      `, [
        updatedCoupon.code, updatedCoupon.description, updatedCoupon.discountType, updatedCoupon.discountValue, updatedCoupon.maxDiscount,
        updatedCoupon.scopeType, JSON.stringify(updatedCoupon.targetProductIds), JSON.stringify(updatedCoupon.targetCategoryIds), JSON.stringify(updatedCoupon.targetBrandIds),
        updatedCoupon.minOrderAmount, updatedCoupon.minItemQuantity, updatedCoupon.customerType, updatedCoupon.specificEmail,
        updatedCoupon.maxUsageTotal, updatedCoupon.maxUsagePerCustomer, updatedCoupon.status, updatedCoupon.expiresAt, now, couponId
      ]);
    }

    if (idx !== -1) {
      db.coupons[idx] = updatedCoupon;
      writeDbJson(db);
    }

    return res.json(updatedCoupon);
  } catch (err) {
    console.error('Erro ao atualizar cupom:', err);
    return res.status(500).json({ error: 'Erro ao atualizar cupom.' });
  }
});

// Delete Coupon (Admin Only)
app.delete('/api/coupons/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const couponId = req.params.id;

    if (pool) {
      await pool.query('DELETE FROM coupons WHERE id = $1', [couponId]);
    }

    const db = readDbJson();
    db.coupons = (db.coupons || []).filter(c => c.id !== couponId);
    writeDbJson(db);

    return res.json({ success: true, message: 'Cupom removido com sucesso.' });
  } catch (err) {
    console.error('Erro ao excluir cupom:', err);
    return res.status(500).json({ error: 'Erro ao excluir cupom.' });
  }
});

// Validate Coupon in Checkout / Cart (Public)
app.post('/api/coupons/validate', async (req, res) => {
  try {
    const { code, items = [], customerEmail = '', customerCpfCnpj = '' } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ valid: false, error: 'Digite o código do cupom.' });
    }

    const cleanCode = code.trim().toUpperCase().replace(/\s+/g, '');
    let coupon = null;

    if (pool) {
      const result = await pool.query(`
        SELECT 
          id, code, description, 
          discount_type as "discountType", 
          discount_value as "discountValue", 
          max_discount as "maxDiscount", 
          scope_type as "scopeType", 
          target_product_ids as "targetProductIds", 
          target_category_ids as "targetCategoryIds", 
          target_brand_ids as "targetBrandIds", 
          min_order_amount as "minOrderAmount", 
          min_item_quantity as "minItemQuantity", 
          customer_type as "customerType", 
          specific_email as "specificEmail", 
          max_usage_total as "maxUsageTotal", 
          max_usage_per_customer as "maxUsagePerCustomer", 
          used_count as "usedCount", 
          used_by as "usedBy", 
          expires_at as "expiresAt", 
          status
        FROM coupons 
        WHERE UPPER(code) = $1
      `, [cleanCode]);

      if (result.rows && result.rows.length > 0) {
        coupon = result.rows[0];
      }
    }

    if (!coupon) {
      const db = readDbJson();
      coupon = (db.coupons || []).find(c => (c.code || '').toUpperCase() === cleanCode);
    }

    if (!coupon) {
      return res.status(404).json({ valid: false, error: `Cupom "${cleanCode}" não encontrado.` });
    }

    const evaluation = evaluateCoupon(coupon, items, customerEmail, customerCpfCnpj);
    return res.json(evaluation);

  } catch (err) {
    console.error('Erro na validação do cupom:', err);
    return res.status(500).json({ valid: false, error: 'Erro ao validar cupom.' });
  }
});

// -------------------------------------------------------------
// PAYMENT CHARGE, CART CHECKOUT & CRM CUSTOMER SYNC
// -------------------------------------------------------------

// 1. Create Payment Charge on Asaas or Free Order (PIX, BOLETO, CREDIT_CARD, FREE)
app.post('/api/payments/charge', async (req, res) => {
  try {
    const { 
      customerName, 
      customerEmail, 
      customerCpfCnpj, 
      customerPhone, 
      customerPassword,
      billingType, // 'PIX' | 'BOLETO' | 'CREDIT_CARD' | 'FREE'
      value, 
      items = [],
      couponCode,
      description,
      orderId: clientOrderId,
      creditCard, 
      creditCardHolderInfo
    } = req.body;

    if (!customerEmail || !customerCpfCnpj) {
      return res.status(400).json({ error: 'E-mail e CPF/CNPJ são obrigatórios para finalizar o pedido.' });
    }

    const cleanEmail = customerEmail.toLowerCase().trim();
    const cleanDoc = (customerCpfCnpj || '').replace(/[^0-9a-zA-Z]/g, '').toUpperCase();
    const cleanPhone = (customerPhone || '').replace(/\D/g, '');
    const cleanCompanyName = (req.body.customerCompanyName || '').trim();
    const orderId = clientOrderId || `athena_ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // ---------------------------------------------------------
    // A. CRM & USER ACCOUNT AUTO-SYNC
    // ---------------------------------------------------------
    let userId = null;
    const db = readDbJson();

    if (pool) {
      try {
        const userRes = await pool.query('SELECT id, password_hash FROM users WHERE email = $1', [cleanEmail]);
        if (userRes.rows && userRes.rows.length > 0) {
          userId = userRes.rows[0].id;
          await pool.query(`
            UPDATE users SET 
              name = COALESCE(NULLIF($1, ''), name),
              phone = COALESCE(NULLIF($2, ''), phone),
              document = COALESCE(NULLIF($3, ''), document),
              company_name = COALESCE(NULLIF($4, ''), company_name),
              updated_at = NOW()
            WHERE id = $5
          `, [customerName, cleanPhone, cleanDoc, cleanCompanyName, userId]);
        } else {
          userId = `user_cust_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          const initialPass = customerPassword || 'ClienteAthena2026!';
          const passHash = bcrypt.hashSync(initialPass, 10);
          await pool.query(`
            INSERT INTO users (id, name, email, password_hash, role, phone, document, company_name, created_at)
            VALUES ($1, $2, $3, $4, 'cliente', $5, $6, $7, NOW())
          `, [userId, customerName || 'Cliente Athena', cleanEmail, passHash, cleanPhone, cleanDoc, cleanCompanyName]);
        }
      } catch (userErr) {
        console.warn('Aviso no sync de usuário PG:', userErr.message);
      }
    }

    // Local JSON user sync fallback
    let localUser = (db.users || []).find(u => (u.email || '').toLowerCase() === cleanEmail);
    if (!localUser) {
      userId = userId || `user_cust_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const initialPass = customerPassword || 'ClienteAthena2026!';
      const passHash = bcrypt.hashSync(initialPass, 10);
      localUser = {
        id: userId,
        name: customerName || 'Cliente Athena',
        email: cleanEmail,
        passwordHash: passHash,
        role: 'cliente',
        phone: cleanPhone,
        document: cleanDoc,
        createdAt: new Date().toISOString()
      };
      db.users.push(localUser);
      writeDbJson(db);
    }

    // ---------------------------------------------------------
    // B. SERVER-SIDE PRICE VALIDATION & COUPON EVALUATION
    // ---------------------------------------------------------
    const parsedValue = Number(value);
    if (isNaN(parsedValue) || parsedValue < 0) {
      return res.status(400).json({ error: 'Valor da transação inválido.' });
    }

    // Validação de integridade de preços dos produtos contra o banco de dados
    if (Array.isArray(items) && items.length > 0) {
      const productIds = items.map(i => i.id || i.productId).filter(Boolean);
      if (productIds.length > 0) {
        let dbProducts = [];
        if (pool) {
          try {
            const pRes = await pool.query('SELECT id, price, variants FROM products WHERE id = ANY($1::varchar[])', [productIds]);
            dbProducts = pRes.rows || [];
          } catch (e) {}
        }
        if (dbProducts.length === 0) {
          dbProducts = (db.products || []).filter(p => productIds.includes(p.id));
        }

        let expectedSubtotal = 0;
        let hasCatalogPrice = false;
        for (const item of items) {
          const pId = item.id || item.productId;
          const dbProd = dbProducts.find(p => p.id === pId);
          const qty = Math.max(1, parseInt(item.quantity || 1, 10));
          if (dbProd && Number(dbProd.price) > 0) {
            hasCatalogPrice = true;
            let unitPrice = Number(dbProd.price);
            if (item.variantSku && Array.isArray(dbProd.variants)) {
              const v = dbProd.variants.find(va => va.sku === item.variantSku);
              if (v && Number(v.price) > 0) unitPrice = Number(v.price);
            }
            expectedSubtotal += unitPrice * qty;
          }
        }

        // Se produtos oficiais possuem preço fixado no catálogo, o valor enviado não pode ser adulterado
        if (hasCatalogPrice && expectedSubtotal > 0 && !couponCode) {
          const minAcceptable = expectedSubtotal * 0.70; // Margem para descontos de método (PIX à vista)
          if (parsedValue < minAcceptable) {
            logSecurityEvent({
              event: 'PRICE_TAMPERING_BLOCKED',
              email: cleanEmail,
              ip: getClientIp(req),
              userAgent: req.headers['user-agent'],
              outcome: 'BLOCKED',
              reason: `Tentativa de adulteração de preço: enviado R$ ${parsedValue}, catálogo exige mínimo R$ ${minAcceptable}`
            });
            return res.status(400).json({ error: 'O valor da cobrança foi modificado e não confere com os preços oficiais do catálogo.' });
          }
        }
      }
    }

    let appliedCoupon = null;
    let discountAmount = 0;
    let finalPayable = parsedValue;

    if (couponCode && couponCode.trim()) {
      const cleanCouponCode = couponCode.trim().toUpperCase().replace(/\s+/g, '');
      let foundCoupon = (db.coupons || []).find(c => (c.code || '').toUpperCase() === cleanCouponCode);

      if (pool) {
        const cRes = await pool.query('SELECT * FROM coupons WHERE UPPER(code) = $1', [cleanCouponCode]);
        if (cRes.rows && cRes.rows.length > 0) foundCoupon = cRes.rows[0];
      }

      if (foundCoupon) {
        const evalRes = evaluateCoupon(foundCoupon, items.length > 0 ? items : [{ price: parsedValue, quantity: 1 }], cleanEmail, cleanDoc);
        if (evalRes.valid) {
          appliedCoupon = foundCoupon;
          discountAmount = evalRes.discountAmount;
          finalPayable = evalRes.finalPayable;
        } else {
          return res.status(400).json({ error: evalRes.error });
        }
      }
    }

    // ---------------------------------------------------------
    // C. FREE ORDER (100% OFF / CORTESIA)
    // ---------------------------------------------------------
    if (finalPayable === 0) {
      if (!appliedCoupon || discountAmount <= 0) {
        logSecurityEvent({
          event: 'FREE_ORDER_TAMPERING_BLOCKED',
          email: cleanEmail,
          ip: getClientIp(req),
          userAgent: req.headers['user-agent'],
          outcome: 'BLOCKED',
          reason: 'Tentativa de criar pedido gratuito (R$ 0,00) sem cupom de desconto de 100%'
        });
        return res.status(400).json({ error: 'Pedidos com valor zerado são restritos exclusivamente a cupons oficiais de 100% de desconto.' });
      }

      // Record Free Order directly via Athena OS
      const shippingAddress = req.body.shippingAddress || req.body.shipping_address || {};
      let athenaFreeOrder = null;
      try {
        athenaFreeOrder = await orderService.createOrder({
          customerId: userId,
          orderType: 'sale',
          items: items.length > 0 ? items : [{ id: 'prod_free', name: description || 'Equipamento Cortesia', price: 0, quantity: 1 }],
          paymentMethod: 'FREE',
          shippingAddress,
          customerSnapshot: {
            name: customerName,
            email: cleanEmail,
            document: cleanDoc,
            phone: cleanPhone,
            companyName: cleanCompanyName
          },
          couponCode: appliedCoupon ? appliedCoupon.code : null,
          notes: 'Pedido Gratuito 100% OFF com Cupom ' + (appliedCoupon ? appliedCoupon.code : '')
        });
        await orderService.confirmOrderPayment(athenaFreeOrder.id);
      } catch (errFree) {
        console.warn('[ATHENA OS FREE ORDER CREATE WARNING]:', errFree.message);
      }

      const freeOrderRecord = {
        id: athenaFreeOrder ? athenaFreeOrder.id : orderId,
        order_number: athenaFreeOrder ? athenaFreeOrder.order_number : orderId,
        user_id: userId,
        user_email: cleanEmail,
        user_name: customerName,
        items: items.length > 0 ? items : [{ description: description || 'Equipamento Cortesia', price: 0, quantity: 1 }],
        total_amount: 0,
        discount_amount: discountAmount,
        coupon_code: appliedCoupon ? appliedCoupon.code : null,
        status: 'faturado',
        notes: 'Pedido Gratuito 100% OFF com Cupom ' + (appliedCoupon ? appliedCoupon.code : ''),
        created_at: new Date().toISOString()
      };

      if (pool) {
        try {
          await pool.query(`
            INSERT INTO orders (id, user_id, user_email, user_name, items, total_amount, discount_amount, coupon_code, status, notes)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          `, [
            freeOrderRecord.id, freeOrderRecord.user_id, freeOrderRecord.user_email, freeOrderRecord.user_name,
            JSON.stringify(freeOrderRecord.items), 0, discountAmount, appliedCoupon ? appliedCoupon.code : null, 'faturado', freeOrderRecord.notes
          ]);
        } catch (e) {}
      }

      db.orders = [freeOrderRecord, ...(db.orders || [])];

      // Increment coupon usage
      if (appliedCoupon) {
        const usageLog = { email: cleanEmail, document: cleanDoc, orderId, usedAt: new Date().toISOString(), discountAmount };
        if (pool) {
          try {
            await pool.query(`
              UPDATE coupons 
              SET used_count = used_count + 1, used_by = used_by || $1::jsonb, updated_at = NOW() 
              WHERE id = $2
            `, [JSON.stringify([usageLog]), appliedCoupon.id]);
          } catch (e) {}
        }
        const cIdx = (db.coupons || []).findIndex(c => c.id === appliedCoupon.id);
        if (cIdx !== -1) {
          db.coupons[cIdx].usedCount = (db.coupons[cIdx].usedCount || 0) + 1;
          db.coupons[cIdx].usedBy = [...(db.coupons[cIdx].usedBy || []), usageLog];
        }
      }
      writeDbJson(db);

      // Dispara comprovante de pedido registrado para o cliente e alerta para o admin
      sendOrderPlacedReceiptNotification({
        orderId,
        customerName: customerName || 'Cliente Athena',
        customerEmail: cleanEmail,
        customerPhone: cleanPhone,
        customerCpfCnpj: cleanDoc,
        items: freeOrderRecord.items,
        totalAmount: 0,
        discountAmount,
        billingType: 'FREE'
      }).catch(e => console.error('[NOTIF PEDIDO GRATUITO ERRO]:', e.message));

      return res.status(201).json({
        id: orderId,
        status: 'CONFIRMED',
        value: 0,
        discountAmount,
        billingType: 'FREE',
        isFreeOrder: true,
        message: 'Pedido 100% Gratuito confirmado e faturado com sucesso!'
      });
    }

    // ---------------------------------------------------------
    // D. PAID CHARGE (ASAAS GATEWAY - STRICT R$ 5,00 RULE)
    // ---------------------------------------------------------
    if (finalPayable < 5.00) {
      return res.status(400).json({ error: `O valor final da cobrança (R$ ${finalPayable.toFixed(2).replace('.', ',')}) é inferior ao valor mínimo de R$ 5,00 exigido para processamento.` });
    }

    if (!ASAAS_API_KEY) {
      return res.status(500).json({ error: 'Chave de API do Asaas não configurada no servidor.' });
    }

    // Find or Create Customer on Asaas
    let asaasCustomerId = null;
    const axios = require('axios');

    try {
      const searchRes = await axios.get(`${ASAAS_BASE_URL}/customers?email=${encodeURIComponent(cleanEmail)}`, {
        headers: { 'access_token': ASAAS_API_KEY }
      });
      if (searchRes.data?.data && searchRes.data.data.length > 0) {
        asaasCustomerId = searchRes.data.data[0].id;
      }
    } catch (e) {}

    if (!asaasCustomerId) {
      const createCustRes = await axios.post(`${ASAAS_BASE_URL}/customers`, {
        name: customerName || 'Cliente Athena',
        email: cleanEmail,
        cpfCnpj: cleanDoc,
        phone: cleanPhone || undefined,
        notificationDisabled: false
      }, {
        headers: { 'access_token': ASAAS_API_KEY }
      });
      asaasCustomerId = createCustRes.data.id;
    }

    // Create Payment on Asaas
    const dueDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 3 days due
    const paymentPayload = {
      customer: asaasCustomerId,
      billingType: billingType || 'PIX',
      value: finalPayable,
      dueDate,
      description: description || `Athena Soluções Automotivas - Pedido #${orderId}`,
      externalReference: orderId
    };

    if (billingType === 'CREDIT_CARD' && creditCard) {
      paymentPayload.creditCard = creditCard;
      paymentPayload.creditCardHolderInfo = creditCardHolderInfo;
    }

    const paymentRes = await axios.post(`${ASAAS_BASE_URL}/payments`, paymentPayload, {
      headers: { 'access_token': ASAAS_API_KEY }
    });

    const paymentData = paymentRes.data;

    // If PIX, fetch QR Code
    let pixData = null;
    if (billingType === 'PIX' && paymentData.id) {
      try {
        const pixRes = await axios.get(`${ASAAS_BASE_URL}/payments/${paymentData.id}/pixQrCode`, {
          headers: { 'access_token': ASAAS_API_KEY }
        });
        pixData = pixRes.data;
      } catch (pixErr) {
        console.warn('Aviso ao gerar PIX QR Code:', pixErr.message);
      }
    }

    // Save Order in Database via Athena OS Engine
    const shippingAddress = req.body.shippingAddress || req.body.shipping_address || {};
    let athenaOrder = null;
    try {
      athenaOrder = await orderService.createOrder({
        customerId: userId,
        orderType: 'sale',
        items: items.length > 0 ? items : [{ id: 'prod_custom', name: description || 'Equipamento Athena', price: finalPayable, quantity: 1 }],
        paymentMethod: billingType || 'PIX',
        shippingAddress,
        customerSnapshot: {
          name: customerName,
          email: cleanEmail,
          document: cleanDoc,
          phone: cleanPhone,
          companyName: cleanCompanyName
        },
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        notes: `Cobrança Asaas ID: ${paymentData.id} (${billingType})`
      });

      if (athenaOrder && paymentData.id && pool) {
        await pool.query('UPDATE orders SET asaas_payment_id = $1 WHERE id = $2', [paymentData.id, athenaOrder.id]);
      }
    } catch (orderErr) {
      console.warn('[ATHENA OS ORDER CREATE WARNING]:', orderErr.message);
    }

    const orderRecord = {
      id: athenaOrder ? athenaOrder.id : orderId,
      order_number: athenaOrder ? athenaOrder.order_number : orderId,
      user_id: userId,
      user_email: cleanEmail,
      user_name: customerName,
      items: items.length > 0 ? items : [{ description: description || 'Equipamento Athena', price: finalPayable, quantity: 1 }],
      total_amount: finalPayable,
      discount_amount: discountAmount,
      coupon_code: appliedCoupon ? appliedCoupon.code : null,
      status: 'em_analise',
      notes: `Cobrança Asaas ID: ${paymentData.id} (${billingType})`,
      created_at: new Date().toISOString()
    };

    if (pool) {
      try {
        await pool.query(`
          INSERT INTO orders (id, user_id, user_email, user_name, items, total_amount, discount_amount, coupon_code, status, notes)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          orderRecord.id, orderRecord.user_id, orderRecord.user_email, orderRecord.user_name,
          JSON.stringify(orderRecord.items), finalPayable, discountAmount, appliedCoupon ? appliedCoupon.code : null, 'em_analise', orderRecord.notes
        ]);
      } catch (e) {}
    }

    db.orders = [orderRecord, ...(db.orders || [])];

    // Increment coupon usage
    if (appliedCoupon) {
      const usageLog = { email: cleanEmail, document: cleanDoc, orderId, usedAt: new Date().toISOString(), discountAmount };
      if (pool) {
        try {
          await pool.query(`
            UPDATE coupons 
            SET used_count = used_count + 1, used_by = used_by || $1::jsonb, updated_at = NOW() 
            WHERE id = $2
          `, [JSON.stringify([usageLog]), appliedCoupon.id]);
        } catch (e) {}
      }
      const cIdx = (db.coupons || []).findIndex(c => c.id === appliedCoupon.id);
      if (cIdx !== -1) {
        db.coupons[cIdx].usedCount = (db.coupons[cIdx].usedCount || 0) + 1;
        db.coupons[cIdx].usedBy = [...(db.coupons[cIdx].usedBy || []), usageLog];
      }
    }
    writeDbJson(db);

    // Dispara comprovante de pedido registrado para o cliente (com PIX/Boleto) e alerta para admin
    sendOrderPlacedReceiptNotification({
      orderId,
      customerName: customerName || 'Cliente Athena',
      customerEmail: cleanEmail,
      customerPhone: cleanPhone,
      customerCpfCnpj: cleanDoc,
      items: orderRecord.items,
      totalAmount: finalPayable,
      discountAmount,
      billingType: paymentData.billingType,
      pix: pixData,
      bankSlipUrl: paymentData.bankSlipUrl,
      invoiceUrl: paymentData.invoiceUrl
    }).catch(e => console.error('[NOTIF PEDIDO ONLINE ERRO]:', e.message));

    return res.status(201).json({
      id: paymentData.id,
      orderId,
      status: paymentData.status,
      value: paymentData.value,
      discountAmount,
      billingType: paymentData.billingType,
      invoiceUrl: paymentData.invoiceUrl,
      bankSlipUrl: paymentData.bankSlipUrl,
      pix: pixData,
      dueDate: paymentData.dueDate,
      externalReference: paymentData.externalReference
    });

  } catch (err) {
    console.error('Erro ao processar cobrança Asaas:', err.response?.data || err.message);
    const errMsg = err.response?.data?.errors?.[0]?.description || 'Erro ao processar pagamento via Asaas.';
    return res.status(err.response?.status || 500).json({ error: errMsg });
  }
});

// 2. Query Payment Status on Asaas
app.get('/api/payments/charge/:id/status', async (req, res) => {
  try {
    const paymentId = req.params.id;
    if (!ASAAS_API_KEY) {
      return res.status(500).json({ error: 'Chave do Asaas não configurada.' });
    }
    const axios = require('axios');
    const response = await axios.get(`${ASAAS_BASE_URL}/payments/${paymentId}`, {
      headers: { 'access_token': ASAAS_API_KEY }
    });
    return res.json({
      id: response.data.id,
      status: response.data.status,
      value: response.data.value,
      confirmedDate: response.data.confirmedDate,
      paymentDate: response.data.paymentDate,
      clientPaymentDate: response.data.clientPaymentDate
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao consultar status no Asaas.' });
  }
});

// 3. Asaas Webhook Endpoint (Delegado para o processador resiliente do Athena OS v2.1)
app.post('/api/payments/webhook', (req, res) => {
  return webhookRoutes.handleAsaasWebhook(req, res);
});

// -------------------------------------------------------------
// 4. OMIE ERP WEBHOOK & A-POINTS LOYALTY SYSTEM
// -------------------------------------------------------------
const OMIE_APP_KEY = process.env.OMIE_APP_KEY;
const OMIE_APP_SECRET = process.env.OMIE_APP_SECRET;

async function callOmieApi(endpointUrl, callMethod, paramObj) {
  const appKey = process.env.OMIE_APP_KEY;
  const appSecret = process.env.OMIE_APP_SECRET;

  if (!appKey || !appSecret) {
    throw new Error('OMIE_APP_KEY e OMIE_APP_SECRET precisam estar configuradas nas variáveis de ambiente.');
  }

  const response = await axios.post(endpointUrl, {
    call: callMethod,
    app_key: appKey,
    app_secret: appSecret,
    param: [paramObj]
  });
  return response.data;
}

// Universal Helper: Credit, Debit or Adjust A-Points (Full Ledger Architecture)
async function creditCustomerAPoints({ 
  orderId = '', 
  orderTotal = 0, 
  points = null, 
  customerEmail = '', 
  customerCpfCnpj = '', 
  customerName = '', 
  customerPhone = '',
  source = 'omie',
  type = 'EARN',
  status = 'available',
  rewardId = null,
  expiresAt = null,
  notes = ''
}) {
  try {
    let cleanEmail = (customerEmail || '').trim().toLowerCase();
    const cleanDoc = (customerCpfCnpj || '').replace(/\D/g, '');
    
    // Regra Oficial do Programa: R$ 50,00 faturados = 1 ponto
    let pointsAmount = points != null 
      ? Number(points) 
      : Math.floor(Number(orderTotal || 0) / 50);

    // No caso de estorno (REVERSE), garante valor negativo
    if (type === 'REVERSE') {
      pointsAmount = -Math.abs(pointsAmount);
    }

    if (pointsAmount === 0 && type !== 'EXPIRE') {
      return { credited: false, reason: 'zero_points' };
    }

    // Validade padrão: 12 meses para acúmulos (EARN e BONUS)
    const finalExpiresAt = expiresAt || (
      ['EARN', 'BONUS'].includes(type)
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        : null
    );

    // Evita duplicidade de acúmulo para o mesmo pedido e mesmo tipo
    if (orderId && !String(orderId).startsWith('ajuste') && type === 'EARN') {
      if (pool) {
        try {
          const checkTx = await pool.query(
            "SELECT id FROM a_points_transactions WHERE order_id = $1 AND type = 'EARN' LIMIT 1", 
            [String(orderId)]
          );
          if (checkTx.rows.length > 0) {
            console.log(`[A-POINTS] Pontos de compra já creditados para o pedido ${orderId}`);
            return { credited: false, reason: 'already_credited' };
          }
        } catch (e) {}
      } else {
        const db = readDbJson();
        if ((db.aPointsTransactions || []).some(t => t.orderId === String(orderId) && t.type === 'EARN')) {
          console.log(`[A-POINTS] Pontos de compra já creditados para o pedido ${orderId}`);
          return { credited: false, reason: 'already_credited' };
        }
      }
    }

    const txId = `apt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    console.log(`[A-POINTS] ${type} | ${pointsAmount > 0 ? '+' : ''}${pointsAmount} pts para "${customerName}" (${cleanEmail || cleanDoc}) source: ${source} order: ${orderId}`);

    if (pool) {
      try {
        let matchedUser = null;
        if (cleanEmail) {
          const uRes = await pool.query('SELECT id, name, email, phone, document, a_points FROM users WHERE LOWER(email) = $1 LIMIT 1', [cleanEmail]);
          if (uRes.rows.length > 0) matchedUser = uRes.rows[0];
        }
        if (!matchedUser && cleanDoc) {
          const uRes = await pool.query("SELECT id, name, email, phone, document, a_points FROM users WHERE REPLACE(REPLACE(REPLACE(document, '.', ''), '-', ''), '/', '') = $1 LIMIT 1", [cleanDoc]);
          if (uRes.rows.length > 0) matchedUser = uRes.rows[0];
        }

        const matchedUserId = matchedUser ? matchedUser.id : null;
        if (matchedUser) {
          if (!customerName) customerName = matchedUser.name;
          if (!customerPhone && matchedUser.phone) customerPhone = matchedUser.phone;
          if (!cleanEmail && matchedUser.email) cleanEmail = matchedUser.email.toLowerCase();
        }

        await pool.query(`
          INSERT INTO a_points_transactions (
            id, user_id, customer_document, customer_email, customer_name, 
            order_id, order_value, points_earned, source, type, status, 
            reward_id, expires_at, notes
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        `, [
          txId, matchedUserId, cleanDoc, cleanEmail, customerName, 
          String(orderId || ''), Number(orderTotal || 0), pointsAmount, source, 
          type, status, rewardId, finalExpiresAt, notes
        ]);

        // Se a transação já estiver disponível, atualiza o saldo do usuário
        if (matchedUserId && status === 'available') {
          await pool.query(`
            UPDATE users 
            SET a_points = GREATEST(0, COALESCE(a_points, 0) + $1) 
            WHERE id = $2
          `, [pointsAmount, matchedUserId]);
        }
      } catch (e) {
        console.error('[A-POINTS] Erro ao salvar transação de fidelidade no Postgres:', e.message);
      }
    }

    // Local DB JSON fallback
    const db = readDbJson();
    if (!db.aPointsTransactions) db.aPointsTransactions = [];
    db.aPointsTransactions.push({
      id: txId,
      customerDocument: cleanDoc,
      customerEmail: cleanEmail,
      customerName,
      customerPhone,
      orderId: String(orderId || ''),
      orderValue: Number(orderTotal || 0),
      pointsEarned: pointsAmount,
      source,
      type,
      status,
      rewardId,
      expiresAt: finalExpiresAt,
      notes,
      createdAt: new Date().toISOString()
    });

    if (db.users && status === 'available') {
      const u = db.users.find(usr => 
        (cleanEmail && usr.email && usr.email.toLowerCase() === cleanEmail) ||
        (cleanDoc && usr.document && usr.document.replace(/\D/g, '') === cleanDoc)
      );
      if (u) {
        u.aPoints = Math.max(0, (u.aPoints || 0) + pointsAmount);
      }
    }
    writeDbJson(db);

    // Se for compra faturada com pontos gerados, envia comprovante de compra e acúmulo por e-mail
    if (type === 'EARN' && pointsAmount > 0) {
      sendPurchaseReceiptNotification({
        orderId: String(orderId || ''),
        orderTotal: Number(orderTotal || 0),
        eligibleAmount: Number(orderTotal || 0),
        pointsEarned: pointsAmount,
        customerName: customerName || 'Cliente',
        customerCpfCnpj: cleanDoc,
        customerEmail: cleanEmail,
        customerPhone,
        source: source === 'omie' ? 'Omie ERP (Vendas / Balcão)' : (source === 'site_asaas' ? 'Loja Online Athena' : source),
        status,
        notes
      }).catch(errNotif => console.error('[A-POINTS NOTIFICATION ERROR]:', errNotif.message));
    }

    return { credited: true, pointsEarned: pointsAmount, txId, type, status };
  } catch (err) {
    console.error('[A-POINTS] Erro em creditCustomerAPoints:', err.message);
    return { credited: false, error: err.message };
  }
}

// Function to process an Omie sale or cancellation event
async function processOmieSaleEvent(body) {
  try {
    console.log('[OMIE WEBHOOK] Processing payload:', JSON.stringify(body));
    const topic = (body.topic || '').toLowerCase();
    const event = body.event || body.data || body;

    const orderId = event.idPedido || event.codigo_pedido || event.codigo_pedido_integracao || body.idPedido;
    let clientId = event.idCliente || event.codigo_cliente || body.idCliente;
    let orderTotal = Number(event.valorTotal || event.valor_total || event.valorTotalPedido || 0);
    let freightAmount = 0;

    let customerCpfCnpj = '';
    let customerEmail = '';
    let customerName = '';
    let customerPhone = '';

    // Verifica se é evento de cancelamento ou estorno
    const isCancellation = 
      topic.includes('cancelad') || 
      topic.includes('devolv') || 
      topic.includes('excluid') || 
      event.etapa === '90';

    // Consulta detalhes do pedido no Omie para dados de produtos e frete
    if (orderId && (!orderTotal || !clientId || isCancellation)) {
      try {
        const orderData = await callOmieApi(
          'https://app.omie.com.br/api/v1/produtos/pedido/',
          'ConsultarPedido',
          { codigo_pedido: Number(orderId) }
        );
        if (orderData) {
          if (!orderTotal) orderTotal = Number(orderData.total_pedido?.valor_total_pedido || 0);
          if (!clientId) clientId = orderData.cabecalho?.codigo_cliente;
          freightAmount = Number(orderData.total_pedido?.valor_frete || 0);
        }
      } catch (e) {
        console.warn('[OMIE] Não foi possível obter detalhes do pedido no Omie:', e.message);
      }
    }

    // Consulta dados cadastrais do cliente no Omie (CPF/CNPJ e Email)
    if (clientId) {
      try {
        const clientData = await callOmieApi(
          'https://app.omie.com.br/api/v1/geral/clientes/',
          'ConsultarCliente',
          { codigo_cliente_omie: Number(clientId) }
        );
        if (clientData) {
          customerCpfCnpj = (clientData.cnpj_cpf || '').replace(/\D/g, '');
          customerEmail = (clientData.email || '').trim().toLowerCase();
          customerName = clientData.nome_fantasia || clientData.razao_social || '';
          const phoneDdd = (clientData.telefone1_ddd || '').trim();
          const phoneNum = (clientData.telefone1_numero || '').trim();
          customerPhone = phoneDdd && phoneNum ? `(${phoneDdd}) ${phoneNum}` : (phoneNum || clientData.contato || '');
        }
      } catch (e) {
        console.warn('[OMIE] Não foi possível obter detalhes do cliente no Omie:', e.message);
      }
    }

    // Valor elegível da compra (exclui frete conforme regra de fidelidade)
    const eligibleAmount = Math.max(0, orderTotal - freightAmount);

    if (isCancellation) {
      // Evento de estorno / reversão de pontos
      console.log(`[OMIE WEBHOOK] Estorno detectado para o pedido ${orderId}. Revertendo pontos...`);
      await creditCustomerAPoints({
        orderId,
        orderTotal: eligibleAmount,
        customerEmail,
        customerCpfCnpj,
        customerName,
        customerPhone,
        source: 'omie',
        type: 'REVERSE',
        status: 'available',
        notes: `Estorno automático via webhook Omie (${topic || 'Cancelamento'})`
      });
    } else {
      // Evento de acúmulo de pontos regular (R$ 50 = 1 ponto)
      await creditCustomerAPoints({
        orderId,
        orderTotal: eligibleAmount,
        customerEmail,
        customerCpfCnpj,
        customerName,
        customerPhone,
        source: 'omie',
        type: 'EARN',
        status: 'available',
        notes: `Faturamento no Omie ERP (Total elegível: R$ ${eligibleAmount.toFixed(2)})`
      });
    }

  } catch (err) {
    console.error('[OMIE] Erro ao processar evento de webhook:', err);
  }
}

// Health check endpoint for Omie Webhook
app.get('/api/webhooks/omie', (req, res) => {
  res.json({
    status: 'online',
    message: 'Athena Omie Webhook Receiver is ready to process sales events.',
    service: 'A-Points Loyalty System (R$ 50 = 1 pt)'
  });
});

// Omie Webhook Receiver (POST) - Roteamento Inteligente de Eventos
app.post('/api/webhooks/omie', async (req, res) => {
  // Retorna 200 OK imediatamente para o Omie para evitar timeout de entrega
  res.status(200).json({ received: true, timestamp: new Date().toISOString() });

  const body = req.body || {};
  const topic = String(body.topic || '').toLowerCase();
  const event = body.event || body.data || {};

  // 1. Detecta primeiro se e evento de VENDA / PEDIDO / FATURAMENTO (A-Points & Comprovante de Compra)
  // Topicos Omie: VendaProduto.Faturada, VendaProduto.Cancelada, VendaProduto.Devolvida, etc.
  const isSaleEvent = 
    topic.startsWith('vendaproduto.') || 
    topic.startsWith('ordemservico.') ||
    topic.includes('faturad') ||
    topic.includes('pedido') ||
    Boolean(event.idPedido || event.codigo_pedido || event.codigo_pedido_integracao);

  // 2. Detecta se e evento de CATALOGO DE PRODUTOS / PRECO / SALDO DE ESTOQUE
  // Topicos Omie: Produto.Alterado, Produto.Incluido, Produto.AjusteEstoque, Produto.MovimentacaoEstoque, TabelaPrecoItem.*
  const isProductOrStockEvent = !isSaleEvent && (
    topic.startsWith('produto.') || 
    topic.startsWith('tabelapreco') ||
    topic.includes('estoque') || 
    topic.includes('movimento') || 
    topic.includes('mercadoria') ||
    Boolean(event.codigo_produto || event.id_produto || event.saldo_fisico || event.saldo_atual)
  );

  if (isSaleEvent) {
    // Evento de faturamento / venda para A-Points e recibo oficial
    processOmieSaleEvent(body).catch(err =>
      console.error('[OMIE SALE WEBHOOK BG ERROR]:', err.message)
    );
  } else if (isProductOrStockEvent) {
    // Evento de catalogo de produtos ou saldo de estoque (Supabase Cache-Aside)
    processOmieProductWebhook(pool, body).catch(err => 
      console.error('[OMIE PRODUCT WEBHOOK BG ERROR]:', err.message)
    );
  } else {
    console.log(`[OMIE WEBHOOK] Evento recebido sem acao necessaria: "${topic}"`);
  }
});

// Endpoint dedicado exclusivo para Webhooks de Produtos e Estoque do Omie
app.post('/api/webhooks/omie/products', async (req, res) => {
  res.status(200).json({ received: true, timestamp: new Date().toISOString() });
  processOmieProductWebhook(pool, req.body).catch(err => 
    console.error('[OMIE PRODUCT WEBHOOK BG ERROR]:', err.message)
  );
});

// Diagnostic route to check Omie connection
app.get('/api/omie/status', async (req, res) => {
  try {
    const clientTest = await callOmieApi(
      'https://app.omie.com.br/api/v1/geral/clientes/',
      'ListarClientes',
      { pagina: 1, registros_por_pagina: 1, apenas_importado_api: 'N' }
    );
    return res.json({
      status: 'connected',
      totalClients: clientTest.total_de_registros,
      appKey: OMIE_APP_KEY ? `${OMIE_APP_KEY.slice(0, 4)}...` : 'not_set'
    });
  } catch (e) {
    return res.status(500).json({
      status: 'error',
      error: e.response ? e.response.data : e.message
    });
  }
});

// -------------------------------------------------------------
// ENDPOINTS DO PROGRAMA DE FIDELIDADE (A-POINTS) & RESGATES
// -------------------------------------------------------------

// User points & transactions endpoint (Área do Cliente)
app.get('/api/points/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = (req.user.email || '').toLowerCase();
    const userDoc = (req.user.document || '').replace(/\D/g, '');

    let pointsAvailable = 0;
    let pointsPending = 0;
    let transactions = [];
    let rewards = [];

    if (pool) {
      try {
        const uRes = await pool.query('SELECT a_points FROM users WHERE id = $1', [userId]);
        if (uRes.rows.length > 0) pointsAvailable = uRes.rows[0].a_points || 0;

        const tRes = await pool.query(`
          SELECT id, order_id as "orderId", order_value as "orderValue", 
                 points_earned as "pointsEarned", source, type, status, 
                 reward_id as "rewardId", expires_at as "expiresAt", notes,
                 created_at as "createdAt"
          FROM a_points_transactions
          WHERE user_id = $1 OR customer_email = $2 OR (customer_document = $3 AND $3 != '')
          ORDER BY created_at DESC
          LIMIT 50
        `, [userId, userEmail, userDoc]);
        transactions = tRes.rows;

        // Calcula pontos pendentes se houver
        const pendingRows = transactions.filter(t => t.status === 'pending' && Number(t.pointsEarned) > 0);
        pointsPending = pendingRows.reduce((acc, t) => acc + Number(t.pointsEarned), 0);

        // Busca recompensas ativas
        const rRes = await pool.query(`
          SELECT id, name, description, category, points_cost as "pointsCost", 
                 cash_cost as "cashCost", image, is_active as "isActive", "order"
          FROM loyalty_rewards
          WHERE is_active = TRUE
          ORDER BY "order" ASC, points_cost ASC
        `);
        rewards = rRes.rows;
      } catch (e) {
        console.error('Erro ao buscar pontos no PG:', e.message);
      }
    } else {
      const db = readDbJson();
      const u = (db.users || []).find(usr => usr.id === userId);
      pointsAvailable = u?.aPoints || 0;
      transactions = (db.aPointsTransactions || []).filter(t => 
        t.userId === userId || 
        (userEmail && t.customerEmail === userEmail) ||
        (userDoc && t.customerDocument === userDoc)
      ).reverse().slice(0, 50);

      pointsPending = transactions
        .filter(t => t.status === 'pending' && Number(t.pointsEarned) > 0)
        .reduce((acc, t) => acc + Number(t.pointsEarned), 0);
    }

    return res.json({ 
      points: pointsAvailable, 
      pointsAvailable,
      pointsPending, 
      transactions,
      rewards
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// Catálogo Público de Recompensas
app.get('/api/rewards', async (req, res) => {
  try {
    if (pool) {
      const result = await pool.query(`
        SELECT id, name, description, category, points_cost as "pointsCost", 
               cash_cost as "cashCost", image, stock_quantity as "stockQuantity",
               is_active as "isActive", "order"
        FROM loyalty_rewards
        WHERE is_active = TRUE
        ORDER BY "order" ASC, points_cost ASC
      `);
      return res.json(result.rows);
    }
    return res.json([
      { id: 'rw_espuma_cera', name: 'Espuma Aplicadora de Cera 100mm', pointsCost: 50, cashCost: 0, category: 'consumables' },
      { id: 'rw_toalha_microfibra', name: 'Toalha de Microfibra Especial 40x40cm', pointsCost: 100, cashCost: 0, category: 'accessories' },
      { id: 'rw_luva_microfibra', name: 'Luva de Lavagem em Microfibra', pointsCost: 150, cashCost: 0, category: 'accessories' },
      { id: 'rw_cupom_300', name: 'Voucher R$ 300 em Novos Equipamentos', pointsCost: 600, cashCost: 0, category: 'vouchers' }
    ]);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao listar recompensas.' });
  }
});

// Endpoint de Resgate de Recompensa (Cliente autenticado)
app.post('/api/rewards/redeem', authenticateToken, async (req, res) => {
  try {
    const { 
      rewardId, 
      deliveryMethod = 'shipping', 
      shippingAddress = null, 
      deliveryNotes = '',
      saveAsDefaultAddress = true 
    } = req.body;

    if (!rewardId) {
      return res.status(400).json({ error: 'Informe a recompensa desejada.' });
    }

    const userId = req.user.id;
    let userPoints = 0;
    let reward = null;

    if (pool) {
      const uRes = await pool.query('SELECT a_points, email, name, document, phone, address FROM users WHERE id = $1', [userId]);
      if (uRes.rows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado.' });
      userPoints = Number(uRes.rows[0].a_points || 0);

      const rRes = await pool.query('SELECT * FROM loyalty_rewards WHERE id = $1 AND is_active = TRUE', [rewardId]);
      if (rRes.rows.length === 0) return res.status(404).json({ error: 'Recompensa não disponível.' });
      reward = rRes.rows[0];

      if (userPoints < reward.points_cost) {
        return res.status(400).json({ 
          error: `Saldo insuficiente. Você possui ${userPoints} pontos e a recompensa requer ${reward.points_cost} pontos.` 
        });
      }

      // Se passou endereço e marcou salvar endereço padrão, atualiza no cadastro do usuário
      if (shippingAddress && typeof shippingAddress === 'object' && shippingAddress.street && saveAsDefaultAddress) {
        try {
          await pool.query('UPDATE users SET address = $1 WHERE id = $2', [JSON.stringify(shippingAddress), userId]);
        } catch (errAddr) {
          console.warn('[REDEEM] Não foi possível salvar endereço padrão do usuário:', errAddr.message);
        }
      }

      // Constrói resumo textual do endereço para o log e ledger
      let addressSummary = '';
      if (shippingAddress && typeof shippingAddress === 'object') {
        const parts = [];
        if (shippingAddress.street) parts.push(`${shippingAddress.street}, ${shippingAddress.number || 'S/N'}${shippingAddress.complement ? ' (' + shippingAddress.complement + ')' : ''}`);
        if (shippingAddress.neighborhood) parts.push(shippingAddress.neighborhood);
        if (shippingAddress.city && shippingAddress.state) parts.push(`${shippingAddress.city}/${shippingAddress.state}`);
        else if (shippingAddress.city) parts.push(shippingAddress.city);
        if (shippingAddress.cep) parts.push(`CEP ${shippingAddress.cep}`);
        addressSummary = parts.join(' - ');
      }

      let deliveryLabel = 'Envio para Endereço';
      if (deliveryMethod === 'pickup') deliveryLabel = 'Retirada na Sede Athena (DF)';
      if (deliveryMethod === 'with_order') deliveryLabel = 'Despachar com Próximo Pedido';
      if (reward.category === 'vouchers') deliveryLabel = 'Voucher Digital';

      let finalNotes = `Resgate: ${reward.name} | Entrega: ${deliveryLabel}`;
      if (deliveryMethod === 'shipping' && addressSummary) {
        finalNotes += ` | Endereço: ${addressSummary}`;
      }
      if (deliveryNotes && String(deliveryNotes).trim()) {
        finalNotes += ` | Obs: ${String(deliveryNotes).trim()}`;
      }

      // Debita pontos via ledger
      const debitResult = await creditCustomerAPoints({
        orderId: `RESGATE_${reward.id.slice(0, 10)}`,
        orderTotal: 0,
        points: -reward.points_cost,
        customerEmail: uRes.rows[0].email,
        customerCpfCnpj: uRes.rows[0].document,
        customerName: uRes.rows[0].name,
        customerPhone: uRes.rows[0].phone || '',
        source: 'resgate_site',
        type: 'REDEEM',
        status: 'available',
        rewardId: reward.id,
        notes: finalNotes
      });

      const updatedPoints = Math.max(0, userPoints - reward.points_cost);

      // Registra o pedido de resgate no Athena OS para a expedição/fulfillment
      let redemptionOrder = null;
      try {
        redemptionOrder = await orderService.createOrder({
          customerId: userId,
          orderType: 'points_redemption',
          items: [{
            id: reward.id,
            product_id: reward.product_id || reward.id,
            name: reward.name,
            quantity: 1,
            points_price: reward.points_cost,
            fulfillment_type: reward.category === 'vouchers' ? 'digital' : 'physical'
          }],
          paymentMethod: 'POINTS',
          shippingAddress: shippingAddress || {},
          customerSnapshot: {
            name: uRes.rows[0].name || 'Cliente',
            email: uRes.rows[0].email,
            document: uRes.rows[0].document,
            phone: uRes.rows[0].phone
          },
          notes: finalNotes
        });

        if (redemptionOrder) {
          await orderService.confirmOrderPayment(redemptionOrder.id);
        }
      } catch (ordErr) {
        console.warn('[REDEEM ORDER FULFILLMENT WARNING]:', ordErr.message);
      }

      // Dispara envio de comprovante de resgate de fidelidade por e-mail
      sendLoyaltyRedemptionReceiptNotification({
        txId: debitResult.txId,
        reward,
        customerName: uRes.rows[0].name || 'Cliente',
        customerCpfCnpj: uRes.rows[0].document || '',
        customerEmail: uRes.rows[0].email || '',
        customerPhone: uRes.rows[0].phone || '',
        previousPoints: userPoints,
        remainingPoints: updatedPoints,
        deliveryMethod,
        shippingAddress,
        addressSummary,
        deliveryNotes,
        notes: finalNotes
      }).catch(errNotif => console.error('[RESGATE NOTIFICATION ERROR]:', errNotif.message));

      return res.json({
        success: true,
        message: `Resgate de "${reward.name}" realizado com sucesso!`,
        reward: {
          id: reward.id,
          name: reward.name,
          pointsCost: reward.points_cost,
          cashCost: reward.cash_cost
        },
        remainingPoints: updatedPoints,
        transactionId: debitResult.txId,
        deliveryMethod,
        addressSummary
      });
    }

    return res.status(500).json({ error: 'Operação temporariamente indisponível.' });
  } catch (err) {
    console.error('Erro ao resgatar recompensa:', err);
    return res.status(500).json({ error: err.message || 'Erro ao processar resgate.' });
  }
});

// -------------------------------------------------------------
// HERMES AGENT & AUTOMATIONS GATEWAY API
// -------------------------------------------------------------

function validateHermesAuth(req, res, next) {
  const secretKey = process.env.HERMES_SECRET_KEY;
  if (!secretKey) {
    // Permite acesso se chave não estiver configurada no .env
    return next();
  }
  const providedKey = req.headers['x-hermes-key'] || req.query.key || req.headers['authorization']?.replace('Bearer ', '');
  if (providedKey !== secretKey) {
    return res.status(401).json({ error: 'Acesso não autorizado para o Hermes. Chave inválida ou não informada.' });
  }
  next();
}

// Hermes Root Dispatcher & Healthcheck (Suporta chamadas diretas à URL base ATHENA_API_BASE)
app.all('/api/hermes', validateHermesAuth, async (req, res) => {
  try {
    const search = req.query.search || req.query.query || req.query.q || req.body?.search || req.body?.query || req.body?.q;
    if (search) {
      const cleanSearch = String(search).trim();
      const numLimit = Math.min(50, Math.max(1, Number(req.query.limit || req.body?.limit) || 20));
      const forceOmie = req.query.forceOmie === 'true' || req.query.forceOmie === true || Boolean(req.body?.forceOmie);
      const result = await searchHermesProducts({
        pool,
        search: cleanSearch,
        limit: numLimit,
        forceOmie
      });
      return res.json(result);
    }

    if (req.method === 'POST') {
      const action = req.body?.action;
      if (action === 'sync-omie' || action === 'sync') {
        const result = await syncProductFromOmie(pool, req.body || {});
        return res.json(result);
      }
      if (action === 'update' && req.body?.id) {
        const result = await updateProductByHermes(pool, req.body.id, req.body);
        return res.json(result);
      }
    }

    let clientsCount = 0;
    let rewardsCount = 0;
    let productsCount = 0;

    if (pool) {
      const cRes = await pool.query('SELECT COUNT(*) FROM users');
      clientsCount = parseInt(cRes.rows[0].count, 10);
      const rRes = await pool.query('SELECT COUNT(*) FROM loyalty_rewards WHERE is_active = TRUE');
      rewardsCount = parseInt(rRes.rows[0].count, 10);
      const pRes = await pool.query('SELECT COUNT(*) FROM products WHERE status = $1', ['published']);
      productsCount = parseInt(pRes.rows[0].count, 10);
    }

    return res.json({
      status: 'online',
      service: 'Athena Hermes Intelligence Bridge',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      stats: {
        totalClients: clientsCount,
        activeRewards: rewardsCount,
        publishedProducts: productsCount
      },
      pointsRatio: 'R$ 50 = 1 A-Point',
      endpoints: [
        'GET /api/hermes',
        'GET /api/hermes/status',
        'GET /api/hermes/customers',
        'GET /api/hermes/customers/:identifier',
        'POST /api/hermes/customers/:identifier/debit',
        'GET /api/hermes/rewards',
        'GET /api/hermes/products',
        'GET /api/hermes/produtos',
        'POST /api/hermes/products',
        'POST /api/hermes/produtos',
        'PUT /api/hermes/products/:id',
        'PUT /api/hermes/produtos/:id',
        'POST /api/hermes/products/sync-omie',
        'GET /api/hermes/loyalty/insights'
      ]
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Hermes Healthcheck & Status
app.get('/api/hermes/status', validateHermesAuth, async (req, res) => {
  try {
    let clientsCount = 0;
    let rewardsCount = 0;
    let productsCount = 0;

    if (pool) {
      const cRes = await pool.query('SELECT COUNT(*) FROM users');
      clientsCount = parseInt(cRes.rows[0].count, 10);
      const rRes = await pool.query('SELECT COUNT(*) FROM loyalty_rewards WHERE is_active = TRUE');
      rewardsCount = parseInt(rRes.rows[0].count, 10);
      const pRes = await pool.query('SELECT COUNT(*) FROM products WHERE status = $1', ['published']);
      productsCount = parseInt(pRes.rows[0].count, 10);
    }

    return res.json({
      status: 'online',
      service: 'Athena Hermes Intelligence Bridge',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      stats: {
        totalClients: clientsCount,
        activeRewards: rewardsCount,
        publishedProducts: productsCount
      },
      pointsRatio: 'R$ 50 = 1 A-Point',
      endpoints: [
        'GET /api/hermes',
        'GET /api/hermes/status',
        'GET /api/hermes/customers',
        'GET /api/hermes/customers/:identifier',
        'POST /api/hermes/customers/:identifier/debit',
        'GET /api/hermes/rewards',
        'GET /api/hermes/products',
        'GET /api/hermes/produtos',
        'POST /api/hermes/products',
        'POST /api/hermes/produtos',
        'PUT /api/hermes/products/:id',
        'PUT /api/hermes/produtos/:id',
        'POST /api/hermes/products/sync-omie',
        'GET /api/hermes/loyalty/insights'
      ]
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Hermes: Listar e Pesquisar Clientes com Saldo de Pontos
app.get('/api/hermes/customers', validateHermesAuth, async (req, res) => {
  try {
    const { search = '', minPoints = 0, limit = 50 } = req.query;
    const cleanSearch = String(search).trim().toLowerCase();
    const cleanDoc = cleanSearch.replace(/\D/g, '');
    const numLimit = Math.min(100, Math.max(1, Number(limit) || 50));
    const numMinPoints = Number(minPoints) || 0;

    if (pool) {
      let query = `
        SELECT id, name, company_name as "companyName", email, phone, document, 
               COALESCE(a_points, 0) as "aPoints", created_at as "createdAt", updated_at as "updatedAt"
        FROM users
        WHERE COALESCE(a_points, 0) >= $1
      `;
      const params = [numMinPoints];

      if (cleanSearch) {
        params.push(`%${cleanSearch}%`);
        const searchIdx = params.length;
        if (cleanDoc.length >= 4) {
          params.push(`%${cleanDoc}%`);
          const docIdx = params.length;
          query += ` AND (LOWER(name) LIKE $${searchIdx} OR LOWER(email) LIKE $${searchIdx} OR REPLACE(REPLACE(REPLACE(document, '.', ''), '-', ''), '/', '') LIKE $${docIdx} OR phone LIKE $${searchIdx})`;
        } else {
          query += ` AND (LOWER(name) LIKE $${searchIdx} OR LOWER(email) LIKE $${searchIdx} OR phone LIKE $${searchIdx})`;
        }
      }

      query += ` ORDER BY a_points DESC, updated_at DESC LIMIT ${numLimit}`;
      const result = await pool.query(query, params);
      return res.json({
        total: result.rows.length,
        customers: result.rows
      });
    }

    const db = readDbJson();
    let customers = (db.users || []).map(u => ({
      id: u.id,
      name: u.name,
      companyName: u.companyName || '',
      email: u.email,
      phone: u.phone || '',
      document: u.document || '',
      aPoints: u.aPoints || 0
    }));

    if (numMinPoints > 0) {
      customers = customers.filter(c => c.aPoints >= numMinPoints);
    }
    if (cleanSearch) {
      customers = customers.filter(c => 
        (c.name && c.name.toLowerCase().includes(cleanSearch)) ||
        (c.email && c.email.toLowerCase().includes(cleanSearch)) ||
        (c.document && c.document.includes(cleanDoc || cleanSearch))
      );
    }
    return res.json({ total: customers.length, customers: customers.slice(0, numLimit) });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Erro ao buscar clientes para o Hermes.' });
  }
});

// Hermes: Consulta Aprofundada de um Cliente Específico (com recompensas e extrato)
app.get('/api/hermes/customers/:identifier', validateHermesAuth, async (req, res) => {
  try {
    const rawId = req.params.identifier;
    const cleanEmail = rawId.trim().toLowerCase();
    const cleanDigits = rawId.replace(/\D/g, '');

    let customer = null;
    let recentTransactions = [];
    let activeRewards = [];

    if (pool) {
      // 1. Busca usuário por ID, Email, Documento, Telefone ou Nome/Razão Social
      const uRes = await pool.query(`
        SELECT id, name, company_name as "companyName", email, phone, document, 
               COALESCE(a_points, 0) as "aPoints", created_at as "createdAt", updated_at as "updatedAt"
        FROM users
        WHERE id = $1 
           OR LOWER(email) = $2 
           OR ($3 <> '' AND REPLACE(REPLACE(REPLACE(document, '.', ''), '-', ''), '/', '') = $3)
           OR ($3 <> '' AND REPLACE(REPLACE(REPLACE(REPLACE(phone, '(', ''), ')', ''), '-', ''), ' ', '') LIKE '%' || $3)
           OR (LENGTH($1) >= 3 AND (LOWER(name) ILIKE '%' || LOWER($1) || '%' OR LOWER(company_name) ILIKE '%' || LOWER($1) || '%'))
        ORDER BY 
           CASE 
             WHEN id = $1 THEN 1
             WHEN LOWER(email) = $2 THEN 2
             WHEN ($3 <> '' AND REPLACE(REPLACE(REPLACE(document, '.', ''), '-', ''), '/', '') = $3) THEN 3
             ELSE 4
           END
        LIMIT 1
      `, [rawId, cleanEmail, cleanDigits]);

      if (uRes.rows.length === 0) {
        // Tenta buscar se o identificador é um código de transação / protocolo de resgate (ex: apt_...)
        const txCheck = await pool.query(`
          SELECT user_id, customer_email, customer_document 
          FROM a_points_transactions 
          WHERE id = $1 OR order_id = $1 
          LIMIT 1
        `, [rawId]);
        
        if (txCheck.rows.length > 0) {
          const txUser = txCheck.rows[0];
          const uRes2 = await pool.query(`
            SELECT id, name, company_name as "companyName", email, phone, document, COALESCE(a_points, 0) as "aPoints"
            FROM users 
            WHERE id = $1 OR (email <> '' AND LOWER(email) = LOWER($2))
            LIMIT 1
          `, [txUser.user_id, txUser.customer_email || '']);
          if (uRes2.rows.length > 0) {
            customer = uRes2.rows[0];
          }
        }
      } else {
        customer = uRes.rows[0];
      }

      if (!customer) {
        return res.status(404).json({ error: `Cliente ou protocolo "${rawId}" não localizado na base Athena.` });
      }

      // 2. Extrato recente de pontos
      const tRes = await pool.query(`
        SELECT id, order_id as "orderId", order_value as "orderValue", points_earned as "pointsEarned", 
               source, type, status, notes, created_at as "createdAt"
        FROM a_points_transactions
        WHERE user_id = $1 OR (customer_email <> '' AND LOWER(customer_email) = LOWER($2)) OR (customer_document <> '' AND customer_document = $3)
        ORDER BY created_at DESC
        LIMIT 15
      `, [customer.id, customer.email || '', customer.document?.replace(/\D/g, '') || '']);
      recentTransactions = tRes.rows;

      // 3. Catálogo de recompensas
      const rRes = await pool.query(`
        SELECT id, name, description, category, points_cost as "pointsCost", image
        FROM loyalty_rewards
        WHERE is_active = TRUE
        ORDER BY points_cost ASC
      `);
      activeRewards = rRes.rows;
    } else {
      const db = readDbJson();
      customer = (db.users || []).find(u => 
        u.id === rawId || 
        (u.email && u.email.toLowerCase() === cleanEmail) ||
        (cleanDigits && u.document && u.document.replace(/\D/g, '') === cleanDigits) ||
        (rawId.length >= 3 && (u.name?.toLowerCase().includes(rawId.toLowerCase()) || u.companyName?.toLowerCase().includes(rawId.toLowerCase())))
      );
      if (!customer) return res.status(404).json({ error: `Cliente "${rawId}" não localizado.` });
    }

    const customerPoints = Number(customer.aPoints || 0);

    // Recompensas que ele já pode resgatar agora
    const canRedeemNow = activeRewards.filter(r => r.pointsCost <= customerPoints);
    
    // Próxima recompensa que ele pode alcançar
    const nextReward = activeRewards.find(r => r.pointsCost > customerPoints);
    const pointsToNext = nextReward ? (nextReward.pointsCost - customerPoints) : 0;

    // Identifica resgates realizados
    const lastRedemption = recentTransactions.find(t => t.type === 'REDEEM') || null;
    const allRedemptions = recentTransactions.filter(t => t.type === 'REDEEM');

    return res.json({
      customer: {
        id: customer.id,
        name: customer.name,
        companyName: customer.companyName,
        email: customer.email,
        phone: customer.phone,
        document: customer.document,
        aPoints: customerPoints
      },
      loyaltySummary: {
        currentBalance: customerPoints,
        canRedeemCount: canRedeemNow.length,
        canRedeemItems: canRedeemNow,
        hasRecentRedemption: !!lastRedemption,
        lastRedemption: lastRedemption ? {
          transactionId: lastRedemption.id,
          pointsDebited: Math.abs(Number(lastRedemption.pointsEarned || 0)),
          description: lastRedemption.notes,
          redeemedAt: lastRedemption.createdAt,
          status: lastRedemption.status
        } : null,
        totalRedemptionsCount: allRedemptions.length,
        nextGoalReward: nextReward ? {
          reward: nextReward,
          pointsNeeded: pointsToNext,
          spendNeededInBrl: pointsToNext * 50 // R$ 50 = 1 pt
        } : null
      },
      recentTransactions
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Hermes: Debitar Pontos Comercial / Desconto Negociado por Vendedor
app.post('/api/hermes/customers/:identifier/debit', validateHermesAuth, async (req, res) => {
  try {
    const rawId = req.params.identifier;
    const { points, reason, orderId, salesperson = 'Vendedor Hermes' } = req.body;

    const pointsToDebit = parseInt(points, 10);
    if (!pointsToDebit || pointsToDebit <= 0) {
      return res.status(400).json({ error: 'Informe uma quantidade válida de pontos para débito (maior que zero).' });
    }

    const cleanEmail = rawId.trim().toLowerCase();
    const cleanDigits = rawId.replace(/\D/g, '');

    let customer = null;

    if (pool) {
      const uRes = await pool.query(`
        SELECT id, name, company_name as "companyName", email, phone, document, 
               COALESCE(a_points, 0) as "aPoints"
        FROM users
        WHERE id = $1 
           OR LOWER(email) = $2 
           OR ($3 <> '' AND REPLACE(REPLACE(REPLACE(document, '.', ''), '-', ''), '/', '') = $3)
           OR ($3 <> '' AND REPLACE(REPLACE(REPLACE(REPLACE(phone, '(', ''), ')', ''), '-', ''), ' ', '') LIKE '%' || $3)
           OR (LENGTH($1) >= 3 AND (LOWER(name) ILIKE '%' || LOWER($1) || '%' OR LOWER(company_name) ILIKE '%' || LOWER($1) || '%'))
        ORDER BY 
           CASE 
             WHEN id = $1 THEN 1
             WHEN LOWER(email) = $2 THEN 2
             WHEN ($3 <> '' AND REPLACE(REPLACE(REPLACE(document, '.', ''), '-', ''), '/', '') = $3) THEN 3
             ELSE 4
           END
        LIMIT 1
      `, [rawId, cleanEmail, cleanDigits]);

      if (uRes.rows.length === 0) {
        return res.status(404).json({ error: `Cliente "${rawId}" não foi localizado no sistema Athena.` });
      }

      customer = uRes.rows[0];
    } else {
      const db = readDbJson();
      customer = (db.users || []).find(u => 
        u.id === rawId || 
        (u.email && u.email.toLowerCase() === cleanEmail) || 
        (cleanDigits && u.document && u.document.replace(/\D/g, '') === cleanDigits)
      );
      if (!customer) {
        return res.status(404).json({ error: `Cliente "${rawId}" não foi localizado.` });
      }
      customer.aPoints = Number(customer.aPoints || 0);
    }

    const currentPoints = Number(customer.aPoints || customer.a_points || 0);
    if (currentPoints < pointsToDebit) {
      return res.status(400).json({
        error: `Saldo insuficiente para débito. O cliente possui ${currentPoints} A-Points, mas a solicitação tentou debitar ${pointsToDebit} pontos.`,
        currentPoints,
        requestedDebit: pointsToDebit
      });
    }

    const discountEstimate = (pointsToDebit / 2).toFixed(2); // Regra de equivalência padrão: 2 pts = R$ 1,00
    const finalReason = reason || `Desconto comercial negociado via Hermes (${salesperson}): R$ ${discountEstimate}`;
    const txOrderId = orderId ? `PED_OMIE_${orderId}` : `DESC_COMERCIAL_${Date.now()}`;

    const debitResult = await creditCustomerAPoints({
      orderId: txOrderId,
      orderTotal: 0,
      points: -pointsToDebit,
      customerEmail: customer.email,
      customerCpfCnpj: customer.document,
      customerName: customer.name,
      customerPhone: customer.phone,
      source: 'vendedor_hermes',
      type: 'DISCOUNT',
      status: 'available',
      notes: `${finalReason} | Autorizado por: ${salesperson}`
    });

    const remainingPoints = Math.max(0, currentPoints - pointsToDebit);

    // Dispara envio de notificação por e-mail para auditoria e controle
    sendLoyaltyRedemptionReceiptNotification({
      txId: debitResult.txId,
      reward: {
        name: `Abatimento Comercial / Desconto (${pointsToDebit} pts)`,
        points_cost: pointsToDebit,
        category: 'vouchers'
      },
      customerName: customer.name || 'Cliente',
      customerCpfCnpj: customer.document || '',
      customerEmail: customer.email || '',
      customerPhone: customer.phone || '',
      previousPoints: currentPoints,
      remainingPoints,
      deliveryMethod: 'commercial_discount',
      notes: `${finalReason} | Pedido Omie: ${orderId || 'Negociação Direta'}`
    }).catch(errNotif => console.error('[HERMES DEBIT NOTIF ERROR]:', errNotif.message));

    return res.json({
      success: true,
      protocol: debitResult.txId,
      message: `Sucesso: ${pointsToDebit} A-Points foram debitados da conta de ${customer.name}. Saldo restante: ${remainingPoints} pontos. Protocolo: ${debitResult.txId}`,
      customer: {
        id: customer.id,
        name: customer.name,
        companyName: customer.companyName,
        email: customer.email,
        document: customer.document
      },
      debitedPoints: pointsToDebit,
      previousPoints: currentPoints,
      remainingPoints,
      orderId: orderId || null,
      reason: finalReason
    });
  } catch (err) {
    console.error('Erro ao debitar pontos via Hermes:', err);
    return res.status(500).json({ error: err.message || 'Erro ao processar débito de pontos.' });
  }
});

// Hermes: Creditar Pontos Comercial / Bonificação ou Ajuste Fiscal de Pedido
app.post('/api/hermes/customers/:identifier/credit', validateHermesAuth, async (req, res) => {
  try {
    const rawId = req.params.identifier;
    const { points, reason, orderId, saleRealValue, salesperson = 'Vendedor Hermes' } = req.body;

    const pointsToCredit = parseInt(points, 10);
    if (!pointsToCredit || pointsToCredit <= 0) {
      return res.status(400).json({ error: 'Informe uma quantidade válida de pontos para crédito (maior que zero).' });
    }

    const cleanEmail = rawId.trim().toLowerCase();
    const cleanDigits = rawId.replace(/\D/g, '');

    let customer = null;

    if (pool) {
      const uRes = await pool.query(`
        SELECT id, name, company_name as "companyName", email, phone, document, 
               COALESCE(a_points, 0) as "aPoints"
        FROM users
        WHERE id = $1 
           OR LOWER(email) = $2 
           OR ($3 <> '' AND REPLACE(REPLACE(REPLACE(document, '.', ''), '-', ''), '/', '') = $3)
           OR ($3 <> '' AND REPLACE(REPLACE(REPLACE(REPLACE(phone, '(', ''), ')', ''), '-', ''), ' ', '') LIKE '%' || $3)
           OR (LENGTH($1) >= 3 AND (LOWER(name) ILIKE '%' || LOWER($1) || '%' OR LOWER(company_name) ILIKE '%' || LOWER($1) || '%'))
        ORDER BY 
           CASE 
             WHEN id = $1 THEN 1
             WHEN LOWER(email) = $2 THEN 2
             WHEN ($3 <> '' AND REPLACE(REPLACE(REPLACE(document, '.', ''), '-', ''), '/', '') = $3) THEN 3
             ELSE 4
           END
        LIMIT 1
      `, [rawId, cleanEmail, cleanDigits]);

      if (uRes.rows.length === 0) {
        return res.status(404).json({ error: `Cliente "${rawId}" não foi localizado no sistema Athena.` });
      }

      customer = uRes.rows[0];
    } else {
      const db = readDbJson();
      customer = (db.users || []).find(u => 
        u.id === rawId || 
        (u.email && u.email.toLowerCase() === cleanEmail) || 
        (cleanDigits && u.document && u.document.replace(/\D/g, '') === cleanDigits)
      );
      if (!customer) {
        return res.status(404).json({ error: `Cliente "${rawId}" não foi localizado.` });
      }
      customer.aPoints = Number(customer.aPoints || 0);
    }

    const currentPoints = Number(customer.aPoints || customer.a_points || 0);
    const finalReason = reason || `Bonificação / Ajuste fiscal de venda (${salesperson})${saleRealValue ? ` - Valor Real: R$ ${saleRealValue}` : ''}`;
    const txOrderId = orderId ? `CRED_OMIE_${orderId}` : `BONUS_HERMES_${Date.now()}`;

    const creditResult = await creditCustomerAPoints({
      orderId: txOrderId,
      orderTotal: Number(saleRealValue || 0),
      points: pointsToCredit,
      customerEmail: customer.email,
      customerCpfCnpj: customer.document,
      customerName: customer.name,
      customerPhone: customer.phone,
      source: 'vendedor_hermes',
      type: 'BONUS',
      status: 'available',
      notes: `${finalReason} | Autorizado por: ${salesperson}`
    });

    const newPoints = currentPoints + pointsToCredit;

    // Dispara notificação de compra / acúmulo de pontos
    sendPurchaseReceiptNotification({
      orderId: orderId || txOrderId,
      orderTotal: Number(saleRealValue || 0),
      eligibleAmount: Number(saleRealValue || 0),
      pointsEarned: pointsToCredit,
      customerName: customer.name || 'Cliente',
      customerCpfCnpj: customer.document || '',
      customerEmail: customer.email || '',
      customerPhone: customer.phone || '',
      source: `Hermes AI (${salesperson})`,
      status: 'creditado',
      notes: `${finalReason} | Autorizado por: ${salesperson}`
    }).catch(errNotif => console.error('[HERMES CREDIT NOTIF ERROR]:', errNotif.message));

    return res.json({
      success: true,
      protocol: creditResult.txId,
      message: `Sucesso: ${pointsToCredit} A-Points foram creditados na conta de ${customer.name}. Novo saldo: ${newPoints} pontos. Protocolo: ${creditResult.txId}`,
      customer: {
        id: customer.id,
        name: customer.name,
        companyName: customer.companyName,
        email: customer.email,
        document: customer.document
      },
      creditedPoints: pointsToCredit,
      previousPoints: currentPoints,
      newPoints,
      orderId: orderId || null,
      reason: finalReason
    });
  } catch (err) {
    console.error('Erro ao creditar pontos via Hermes:', err);
    return res.status(500).json({ error: err.message || 'Erro ao processar crédito de pontos.' });
  }
});

// Admin / Vendedor: Debitar Pontos Comercial Assistido
app.post('/api/admin/loyalty/debit', authenticateToken, async (req, res) => {
  try {
    const userRole = req.user?.role;
    if (!['admin', 'vendedor'].includes(userRole)) {
      return res.status(403).json({ error: 'Acesso restrito à equipe comercial e administrativa.' });
    }

    const { customerId, customerIdentifier, points, reason, orderId } = req.body;
    const pointsToDebit = parseInt(points, 10);
    if (!pointsToDebit || pointsToDebit <= 0) {
      return res.status(400).json({ error: 'Informe uma quantidade válida de pontos para débito (maior que zero).' });
    }

    const targetId = customerId || customerIdentifier;
    if (!targetId) {
      return res.status(400).json({ error: 'Informe o cliente para o débito de pontos.' });
    }

    const cleanEmail = String(targetId).trim().toLowerCase();
    const cleanDigits = String(targetId).replace(/\D/g, '');

    let customer = null;
    if (pool) {
      const uRes = await pool.query(`
        SELECT id, name, company_name as "companyName", email, phone, document, 
               COALESCE(a_points, 0) as "aPoints"
        FROM users
        WHERE id = $1 
           OR LOWER(email) = $2 
           OR ($3 <> '' AND REPLACE(REPLACE(REPLACE(document, '.', ''), '-', ''), '/', '') = $3)
           OR (LENGTH($1) >= 3 AND (LOWER(name) ILIKE '%' || LOWER($1) || '%' OR LOWER(company_name) ILIKE '%' || LOWER($1) || '%'))
        LIMIT 1
      `, [String(targetId), cleanEmail, cleanDigits]);

      if (uRes.rows.length === 0) {
        return res.status(404).json({ error: 'Cliente não encontrado.' });
      }
      customer = uRes.rows[0];
    } else {
      const db = readDbJson();
      customer = (db.users || []).find(u => 
        u.id === targetId || 
        (u.email && u.email.toLowerCase() === cleanEmail) || 
        (cleanDigits && u.document && u.document.replace(/\D/g, '') === cleanDigits)
      );
      if (!customer) return res.status(404).json({ error: 'Cliente não encontrado.' });
      customer.aPoints = Number(customer.aPoints || 0);
    }

    const currentPoints = Number(customer.aPoints || customer.a_points || 0);
    if (currentPoints < pointsToDebit) {
      return res.status(400).json({
        error: `Saldo insuficiente. O cliente possui ${currentPoints} A-Points e a operação tentou debitar ${pointsToDebit} pontos.`
      });
    }

    const operatorName = req.user?.name || req.user?.email || 'Mesa de Vendas';
    const discountEstimate = (pointsToDebit / 2).toFixed(2);
    const finalReason = reason || `Desconto comercial negociado no balcão/vendas (R$ ${discountEstimate})`;
    const txOrderId = orderId ? `PED_OMIE_${orderId}` : `DESC_ADMIN_${Date.now()}`;

    const debitResult = await creditCustomerAPoints({
      orderId: txOrderId,
      orderTotal: 0,
      points: -pointsToDebit,
      customerEmail: customer.email,
      customerCpfCnpj: customer.document,
      customerName: customer.name,
      customerPhone: customer.phone,
      source: 'admin_comercial',
      type: 'DISCOUNT',
      status: 'available',
      notes: `${finalReason} | Operador: ${operatorName}`
    });

    const remainingPoints = Math.max(0, currentPoints - pointsToDebit);

    // Dispara notificação por email
    sendLoyaltyRedemptionReceiptNotification({
      txId: debitResult.txId,
      reward: {
        name: `Abatimento Comercial / Desconto (${pointsToDebit} pts)`,
        points_cost: pointsToDebit,
        category: 'vouchers'
      },
      customerName: customer.name || 'Cliente',
      customerCpfCnpj: customer.document || '',
      customerEmail: customer.email || '',
      customerPhone: customer.phone || '',
      previousPoints: currentPoints,
      remainingPoints,
      deliveryMethod: 'commercial_discount',
      notes: `${finalReason} | Pedido Omie: ${orderId || 'Venda Assistida'}`
    }).catch(errNotif => console.error('[ADMIN DEBIT NOTIF ERROR]:', errNotif.message));

    return res.json({
      success: true,
      protocol: debitResult.txId,
      message: `${pointsToDebit} A-Points debitados com sucesso de ${customer.name}. Novo saldo: ${remainingPoints} pts.`,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        document: customer.document
      },
      debitedPoints: pointsToDebit,
      previousPoints: currentPoints,
      remainingPoints,
      orderId: orderId || null,
      reason: finalReason
    });
  } catch (err) {
    console.error('Erro ao debitar pontos no admin:', err);
    return res.status(500).json({ error: err.message || 'Erro ao processar débito.' });
  }
});

// Admin / Vendedor: Creditar Pontos Comercial Assistido / Bonificação / Ajuste Fiscal de Pedido
app.post('/api/admin/loyalty/credit', authenticateToken, async (req, res) => {
  try {
    const userRole = req.user?.role;
    if (!['admin', 'vendedor'].includes(userRole)) {
      return res.status(403).json({ error: 'Acesso restrito à equipe comercial e administrativa.' });
    }

    const { customerId, customerIdentifier, points, reason, orderId, saleRealValue } = req.body;
    const pointsToCredit = parseInt(points, 10);
    if (!pointsToCredit || pointsToCredit <= 0) {
      return res.status(400).json({ error: 'Informe uma quantidade válida de pontos para crédito (maior que zero).' });
    }

    const targetId = customerId || customerIdentifier;
    if (!targetId) {
      return res.status(400).json({ error: 'Informe o cliente para creditar os pontos.' });
    }

    const cleanEmail = String(targetId).trim().toLowerCase();
    const cleanDigits = String(targetId).replace(/\D/g, '');

    let customer = null;
    if (pool) {
      const uRes = await pool.query(`
        SELECT id, name, company_name as "companyName", email, phone, document, 
               COALESCE(a_points, 0) as "aPoints"
        FROM users
        WHERE id = $1 
           OR LOWER(email) = $2 
           OR ($3 <> '' AND REPLACE(REPLACE(REPLACE(document, '.', ''), '-', ''), '/', '') = $3)
           OR (LENGTH($1) >= 3 AND (LOWER(name) ILIKE '%' || LOWER($1) || '%' OR LOWER(company_name) ILIKE '%' || LOWER($1) || '%'))
        LIMIT 1
      `, [String(targetId), cleanEmail, cleanDigits]);

      if (uRes.rows.length === 0) {
        return res.status(404).json({ error: 'Cliente não encontrado.' });
      }
      customer = uRes.rows[0];
    } else {
      const db = readDbJson();
      customer = (db.users || []).find(u => 
        u.id === targetId || 
        (u.email && u.email.toLowerCase() === cleanEmail) || 
        (cleanDigits && u.document && u.document.replace(/\D/g, '') === cleanDigits)
      );
      if (!customer) return res.status(404).json({ error: 'Cliente não encontrado.' });
      customer.aPoints = Number(customer.aPoints || 0);
    }

    const currentPoints = Number(customer.aPoints || customer.a_points || 0);
    const operatorName = req.user?.name || req.user?.email || 'Mesa de Vendas';
    const finalReason = reason || (saleRealValue 
      ? `Ajuste comercial de pontuação - Venda real R$ ${saleRealValue}`
      : 'Bonificação comercial / Ajuste manual de pontos');
    const txOrderId = orderId ? `CRED_OMIE_${orderId}` : `BONUS_ADMIN_${Date.now()}`;

    const creditResult = await creditCustomerAPoints({
      orderId: txOrderId,
      orderTotal: Number(saleRealValue || 0),
      points: pointsToCredit,
      customerEmail: customer.email,
      customerCpfCnpj: customer.document,
      customerName: customer.name,
      customerPhone: customer.phone,
      source: 'admin_comercial',
      type: 'BONUS',
      status: 'available',
      notes: `${finalReason} | Operador: ${operatorName}`
    });

    const newBalance = currentPoints + pointsToCredit;

    // Dispara envio de notificação por e-mail para auditoria e controle
    sendPurchaseReceiptNotification({
      orderId: orderId || txOrderId,
      orderTotal: Number(saleRealValue || 0),
      eligibleAmount: Number(saleRealValue || 0),
      pointsEarned: pointsToCredit,
      customerName: customer.name || 'Cliente',
      customerCpfCnpj: customer.document || '',
      customerEmail: customer.email || '',
      customerPhone: customer.phone || '',
      source: 'Mesa de Vendas / Ajuste Comercial',
      status: 'creditado',
      notes: `${finalReason} | Operador: ${operatorName}`
    }).catch(errNotif => console.error('[ADMIN CREDIT NOTIF ERROR]:', errNotif.message));

    return res.json({
      success: true,
      protocol: creditResult.txId,
      message: `${pointsToCredit} A-Points creditados com sucesso para ${customer.name}. Novo saldo: ${newBalance} pts.`,
      customer: {
        id: customer.id,
        name: customer.name,
        companyName: customer.companyName,
        email: customer.email,
        document: customer.document
      },
      creditedPoints: pointsToCredit,
      previousPoints: currentPoints,
      newBalance,
      orderId: orderId || null,
      reason: finalReason
    });
  } catch (err) {
    console.error('Erro ao creditar pontos no admin:', err);
    return res.status(500).json({ error: err.message || 'Erro ao processar crédito de pontos.' });
  }
});

// Hermes: Catálogo de Recompensas de Fidelidade
app.get('/api/hermes/rewards', validateHermesAuth, async (req, res) => {
  try {
    if (pool) {
      const result = await pool.query(`
        SELECT id, name, description, category, points_cost as "pointsCost", 
               cash_cost as "cashCost", image, stock_quantity as "stockQuantity"
        FROM loyalty_rewards
        WHERE is_active = TRUE
        ORDER BY points_cost ASC
      `);
      return res.json({
        total: result.rows.length,
        rewards: result.rows
      });
    }
    return res.json({
      total: 4,
      rewards: [
        { id: 'rw_espuma_cera', name: 'Espuma Aplicadora de Cera 100mm', pointsCost: 50, category: 'consumables' },
        { id: 'rw_toalha_microfibra', name: 'Toalha de Microfibra Especial 40x40cm', pointsCost: 100, category: 'accessories' },
        { id: 'rw_luva_microfibra', name: 'Luva de Lavagem em Microfibra', pointsCost: 150, category: 'accessories' },
        { id: 'rw_cupom_300', name: 'Voucher R$ 300 em Novos Equipamentos', pointsCost: 600, category: 'vouchers' }
      ]
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Hermes: Busca Inteligente de Produtos (Cache-Aside: PostgreSQL -> Omie Fallback)
app.get(['/api/hermes/products', '/api/hermes/produtos'], validateHermesAuth, async (req, res) => {
  try {
    const { search = '', query = '', q = '', limit = 20, forceOmie = false } = req.query;
    const cleanSearch = String(search || query || q || '').trim();
    const numLimit = Math.min(50, Math.max(1, Number(limit) || 20));

    const result = await searchHermesProducts({
      pool,
      search: cleanSearch,
      limit: numLimit,
      forceOmie: forceOmie === 'true' || forceOmie === true
    });

    return res.json(result);
  } catch (err) {
    console.error('[HERMES PRODUCTS GET ERROR]:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Hermes: Busca de Produtos via POST (Compatível com chamadas de Tools do Gemini / Agentes)
app.post(['/api/hermes/products', '/api/hermes/produtos'], validateHermesAuth, async (req, res) => {
  try {
    const { search = '', query = '', q = '', limit = 20, forceOmie = false } = req.body || {};
    const cleanSearch = String(search || query || q || '').trim();
    const numLimit = Math.min(50, Math.max(1, Number(limit) || 20));

    const result = await searchHermesProducts({
      pool,
      search: cleanSearch,
      limit: numLimit,
      forceOmie: Boolean(forceOmie)
    });

    return res.json(result);
  } catch (err) {
    console.error('[HERMES PRODUCTS POST ERROR]:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Hermes: Atualizar Produto no Catálogo (Preço, Estoque ou Status)
app.put(['/api/hermes/products/:id', '/api/hermes/produtos/:id'], validateHermesAuth, async (req, res) => {
  try {
    const result = await updateProductByHermes(pool, req.params.id, req.body || {});
    return res.json(result);
  } catch (err) {
    console.error('[HERMES PRODUCT PUT ERROR]:', err.message);
    const isNotFound = err.message && err.message.includes('não encontrado');
    return res.status(isNotFound ? 404 : 500).json({ error: err.message });
  }
});

// Hermes: Criar Produto / Rascunho no Catálogo
app.post(['/api/hermes/products/create', '/api/hermes/produtos/create'], validateHermesAuth, async (req, res) => {
  try {
    const result = await createProductByHermes(pool, req.body || {});
    return res.status(201).json(result);
  } catch (err) {
    console.error('[HERMES PRODUCT CREATE ERROR]:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// Hermes: Sincronizar / Criar Produto a partir do Omie ERP
app.post(['/api/hermes/products/sync-omie', '/api/hermes/produtos/sync-omie'], validateHermesAuth, async (req, res) => {
  try {
    const result = await syncProductFromOmie(pool, req.body || {});
    return res.json(result);
  } catch (err) {
    console.error('[HERMES OMIE SYNC ERROR]:', err.message);
    const isNotFound = err.message && err.message.includes('não localizado');
    return res.status(isNotFound ? 404 : 500).json({ error: err.message });
  }
});

// Hermes: Tool Declaration para agentes Gemini AI
app.get('/api/hermes/tool-declaration', validateHermesAuth, (req, res) => {
  res.json({
    tool: hermesGeminiToolDeclaration,
    tools: hermesGeminiTools,
    endpoints: {
      search: 'https://athenaconsultoria.com.br/api/hermes/products',
      update: 'https://athenaconsultoria.com.br/api/hermes/products/:id',
      syncOmie: 'https://athenaconsultoria.com.br/api/hermes/products/sync-omie'
    }
  });
});

// Hermes: Oportunidades e Automações de Fidelidade
app.get('/api/hermes/loyalty/insights', validateHermesAuth, async (req, res) => {
  try {
    let inactiveWithPoints = [];
    let nearReward = [];
    let topLoyaltyClients = [];

    if (pool) {
      // 1. Clientes inativos com saldo acumulado (potencial de reativação)
      const inactRes = await pool.query(`
        SELECT id, name, email, phone, document, a_points as "aPoints", updated_at as "lastActivity"
        FROM users
        WHERE a_points >= 50
        ORDER BY a_points DESC
        LIMIT 20
      `);
      inactiveWithPoints = inactRes.rows;

      // 2. Clientes próximos do primeiro patamar de recompensa (100 pontos)
      const nearRes = await pool.query(`
        SELECT id, name, email, phone, a_points as "aPoints", (100 - a_points) as "pointsNeeded"
        FROM users
        WHERE a_points >= 60 AND a_points < 100
        ORDER BY a_points DESC
        LIMIT 20
      `);
      nearReward = nearRes.rows;

      // 3. Clientes VIP de alto valor
      const vipRes = await pool.query(`
        SELECT id, name, email, company_name as "companyName", phone, a_points as "aPoints"
        FROM users
        WHERE a_points >= 500
        ORDER BY a_points DESC
        LIMIT 20
      `);
      topLoyaltyClients = vipRes.rows;
    }

    return res.json({
      status: 'active',
      generatedAt: new Date().toISOString(),
      stats: {
        totalInactiveWithPoints: inactiveWithPoints.length,
        totalNearReward: nearReward.length,
        totalVipClients: topLoyaltyClients.length
      },
      inactiveWithPoints,
      nearReward,
      topLoyaltyClients
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao gerar dados para o Hermes.' });
  }
});

// -------------------------------------------------------------
// RECONCILIAÇÃO E SINCRONIZAÇÃO OMIE ERP
// -------------------------------------------------------------

// Status da sincronização dos produtos Omie ↔ Site
app.get('/api/admin/omie/sync-status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    let totalProducts = 0;
    let linkedProducts = 0;
    let linkedViaVariants = 0;
    let unlinkedProducts = [];

    if (pool) {
      const totRes = await pool.query('SELECT COUNT(*) FROM products');
      totalProducts = parseInt(totRes.rows[0].count, 10);

      // Produtos com omie_product_id direto no pai
      const linkRes = await pool.query('SELECT COUNT(*) FROM products WHERE omie_product_id IS NOT NULL');
      linkedProducts = parseInt(linkRes.rows[0].count, 10);

      // Produtos que não têm omie_product_id no pai, mas têm variações conectadas
      const linkVarRes = await pool.query(`
        SELECT COUNT(*) FROM products 
        WHERE omie_product_id IS NULL
          AND variants IS NOT NULL 
          AND jsonb_typeof(variants) = 'array'
          AND EXISTS (
            SELECT 1 FROM jsonb_array_elements(variants) elem 
            WHERE (elem->>'omieProductId') IS NOT NULL OR (elem->>'omieCode') IS NOT NULL
          )
      `);
      linkedViaVariants = parseInt(linkVarRes.rows[0].count, 10);

      // Produtos pendentes (sem vínculo nem no pai nem nas variações)
      const unRes = await pool.query(`
        SELECT id, name, sku, brand_id as "brandId", price::float, COALESCE(variants, '[]'::jsonb) as "variants"
        FROM products 
        WHERE omie_product_id IS NULL
          AND (
            variants IS NULL 
            OR jsonb_typeof(variants) != 'array' 
            OR NOT EXISTS (
              SELECT 1 FROM jsonb_array_elements(variants) elem 
              WHERE (elem->>'omieProductId') IS NOT NULL OR (elem->>'omieCode') IS NOT NULL
            )
          )
        ORDER BY name ASC
        LIMIT 50
      `);
      unlinkedProducts = unRes.rows;
    }

    const effectiveLinked = linkedProducts + linkedViaVariants;
    return res.json({
      totalProducts,
      linkedProducts: effectiveLinked,
      linkedDirectly: linkedProducts,
      linkedViaVariants,
      unlinkedCount: Math.max(0, totalProducts - effectiveLinked),
      matchPercentage: totalProducts > 0 ? ((effectiveLinked / totalProducts) * 100).toFixed(1) : 0,
      unlinkedProducts
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Dispara reconciliação de produtos sob demanda
app.post('/api/admin/omie/reconcile', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { reconcileProducts } = require('./scripts/reconcile_omie_products.cjs');
    const result = await reconcileProducts({ isDryRun: false });
    return res.json({
      success: true,
      message: `Reconciliação executada com sucesso! ${result.matchedCount} produtos vinculados.`,
      result
    });
  } catch (err) {
    console.error('Erro ao executar reconciliação:', err);
    return res.status(500).json({ error: err.message || 'Erro ao executar reconciliação.' });
  }
});

// Vínculo manual individual de produto (ou variação específica)
app.post('/api/admin/omie/link-product', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { athenaProductId, variantId, omieProductId, omieCode } = req.body;
    if (!athenaProductId || !omieProductId) {
      return res.status(400).json({ error: 'IDs de produto Athena e Omie são obrigatórios.' });
    }

    if (pool) {
      if (variantId) {
        // Vínculo de variação específica
        const findRes = await pool.query('SELECT variants FROM products WHERE id = $1', [athenaProductId]);
        if (findRes.rows.length > 0) {
          const variants = Array.isArray(findRes.rows[0].variants) ? findRes.rows[0].variants : [];
          const idx = variants.findIndex(v => v.id === variantId);
          if (idx !== -1) {
            variants[idx] = {
              ...variants[idx],
              omieProductId: Number(omieProductId),
              omieCode: omieCode || String(omieProductId)
            };
            await pool.query(`
              UPDATE products
              SET variants = $1::jsonb, omie_last_sync = CURRENT_TIMESTAMP
              WHERE id = $2
            `, [JSON.stringify(variants), athenaProductId]);
            return res.json({ success: true, message: `Variação "${variants[idx].name}" vinculada com sucesso ao Omie!` });
          }
        }
      }

      // Vínculo no produto pai
      await pool.query(`
        UPDATE products
        SET omie_product_id = $1, omie_code = $2, omie_last_sync = CURRENT_TIMESTAMP
        WHERE id = $3
      `, [omieProductId, omieCode || '', athenaProductId]);
    }

    return res.json({ success: true, message: 'Produto vinculado com sucesso!' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Verify active session & token endpoint
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  return res.json({
    user: req.user,
    valid: true
  });
});

// List Users (Restricted to Staff: Admin, Vendedor, Editor)
app.get('/api/users', authenticateToken, requireStaff, async (req, res) => {
  const isPaginated = req.query.page !== undefined || req.query.limit !== undefined;

  if (pool) {
    try {
      const conditions = [];
      const values = [];
      let paramIdx = 1;

      if (req.query.role && typeof req.query.role === 'string') {
        conditions.push(`role = $${paramIdx++}`);
        values.push(req.query.role.trim().slice(0, 50));
      }

      if (req.query.search && typeof req.query.search === 'string') {
        const sanitizedSearch = req.query.search.trim().slice(0, 100).replace(/[%_\\]/g, '\\$&');
        if (sanitizedSearch.length > 0) {
          conditions.push(`(name ILIKE $${paramIdx} OR email ILIKE $${paramIdx} OR document ILIKE $${paramIdx} OR company_name ILIKE $${paramIdx})`);
          values.push(`%${sanitizedSearch}%`);
          paramIdx++;
        }
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const baseSelect = `
        SELECT id, name, email, role, phone, document, company_name as "companyName", 
               a_points as "aPoints", COALESCE(must_change_password, false) as "mustChangePassword", 
               COALESCE(is_locked, false) as "isLocked",
               COALESCE(failed_login_attempts, 0) as "failedAttempts",
               locked_until as "lockedUntil",
               locked_at as "lockedAt",
               locked_reason as "lockedReason",
               created_at as "createdAt" 
        FROM users 
        ${whereClause}
        ORDER BY created_at DESC
      `;

      if (isPaginated) {
        const page = Math.max(1, Math.min(1000000, parseInt(req.query.page, 10) || 1));
        const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 20));
        const offset = (page - 1) * limit;

        const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`;
        const [countRes, dataRes] = await Promise.all([
          pool.query(countQuery, values),
          pool.query(`${baseSelect} LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`, [...values, limit, offset])
        ]);

        const total = parseInt(countRes.rows[0]?.total || countRes.rows[0]?.count, 10) || 0;
        return res.json({
          data: dataRes.rows,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
          }
        });
      } else {
        const result = await pool.query(baseSelect, values);
        return res.json(result.rows);
      }
    } catch (e) {
      console.error('Erro ao listar usuários do PostgreSQL:', e.message);
    }
  }
  const db = readDbJson();
  let cleanUsers = (db.users || []).map(({ passwordHash, password_hash, ...rest }) => ({
    ...rest,
    aPoints: rest.aPoints || rest.a_points || 0,
    mustChangePassword: Boolean(rest.mustChangePassword || rest.must_change_password || false),
    isLocked: Boolean(rest.is_locked || rest.isLocked || false),
    failedAttempts: rest.failed_login_attempts || rest.failedAttempts || 0,
    lockedUntil: rest.locked_until || rest.lockedUntil || null,
    lockedAt: rest.locked_at || rest.lockedAt || null,
    lockedReason: rest.locked_reason || rest.lockedReason || null
  }));

  if (req.query.role) {
    cleanUsers = cleanUsers.filter(u => u.role === req.query.role);
  }
  if (req.query.search) {
    const q = req.query.search.toLowerCase();
    cleanUsers = cleanUsers.filter(u => 
      (u.name && u.name.toLowerCase().includes(q)) || 
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.companyName && u.companyName.toLowerCase().includes(q))
    );
  }

  if (isPaginated) {
    const page = Math.max(1, Math.min(1000000, parseInt(req.query.page, 10) || 1));
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 20));
    const offset = (page - 1) * limit;
    const total = cleanUsers.length;
    return res.json({
      data: cleanUsers.slice(offset, offset + limit),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  }

  res.json(cleanUsers);
});

// Suporte / Admin: Gerar Senha Temporária para Cliente (Força troca no próximo login)
app.post('/api/admin/users/:id/generate-temp-password', authenticateToken, requireStaff, async (req, res) => {
  try {
    const targetId = req.params.id;
    let targetUser = null;

    if (pool) {
      const uRes = await pool.query('SELECT id, name, email, role FROM users WHERE id = $1', [targetId]);
      if (uRes.rows.length > 0) targetUser = uRes.rows[0];
    } else {
      const db = readDbJson();
      targetUser = (db.users || []).find(u => u.id === targetId);
    }

    if (!targetUser) {
      return res.status(404).json({ error: 'Usuário não encontrado no sistema.' });
    }

    // Não permite resetar master admin ou outro admin por vendedor
    if (targetUser.role === 'admin' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Você não tem permissão para alterar a senha de um administrador.' });
    }

    // Gera senha temporária amigável e segura (ex: Athena@4928)
    const randomPin = Math.floor(1000 + Math.random() * 9000);
    const tempPass = `Athena@${randomPin}`;
    const tempHash = bcrypt.hashSync(tempPass, 10);

    if (pool) {
      try {
        await pool.query('UPDATE users SET password_hash = $1, must_change_password = TRUE, updated_at = NOW() WHERE id = $2', [tempHash, targetId]);
      } catch (e) {
        console.error('Erro ao salvar senha temporária no PG:', e.message);
      }
    }

    const db = readDbJson();
    const uIdx = (db.users || []).findIndex(u => u.id === targetId);
    if (uIdx !== -1) {
      db.users[uIdx].passwordHash = tempHash;
      db.users[uIdx].password_hash = tempHash;
      db.users[uIdx].mustChangePassword = true;
      db.users[uIdx].must_change_password = true;
      writeDbJson(db);
    }

    return res.json({
      success: true,
      temporaryPassword: tempPass,
      userId: targetUser.id,
      userName: targetUser.name,
      userEmail: targetUser.email,
      message: `Senha temporária gerada com sucesso para ${targetUser.name}: ${tempPass}`
    });
  } catch (err) {
    console.error('Erro ao gerar senha temporária no admin:', err);
    return res.status(500).json({ error: 'Erro ao gerar senha temporária.' });
  }
});

// Suporte / Admin: Gerar Link de Acesso Emergencial (Magic Link) para Cliente
app.post('/api/admin/users/:id/generate-magic-link', authenticateToken, requireStaff, async (req, res) => {
  try {
    const targetId = req.params.id;
    const adminName = req.user?.name || req.user?.email || 'Administrador';

    let targetUser = null;
    if (pool) {
      const uRes = await pool.query('SELECT id, name, email, phone, role, is_locked, locked_until FROM users WHERE id = $1', [targetId]);
      if (uRes.rows.length > 0) targetUser = uRes.rows[0];
    } else {
      const db = readDbJson();
      targetUser = (db.users || []).find(u => u.id === targetId);
    }

    if (!targetUser) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    // Gera token criptográfico de 32 bytes
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 horas

    if (pool) {
      await pool.query(`
        UPDATE users 
        SET magic_token = $1, magic_token_expires = $2 
        WHERE id = $3
      `, [tokenHash, expiresAt, targetId]);
    }

    const db = readDbJson();
    const uIdx = (db.users || []).findIndex(u => u.id === targetId);
    if (uIdx !== -1) {
      db.users[uIdx].magic_token = tokenHash;
      db.users[uIdx].magic_token_expires = expiresAt.toISOString();
      writeDbJson(db);
    }

    const origin = req.headers.origin || req.headers.referer?.replace(/\/$/, '') || 'https://athenaconsultoria.com.br';
    const magicUrl = `${origin}/login?magic_token=${rawToken}`;
    
    let whatsappUrl = null;
    const cleanPhone = (targetUser.phone || '').replace(/\D/g, '');
    if (cleanPhone) {
      const msg = encodeURIComponent(`Olá ${targetUser.name}! Segue o seu link de acesso seguro e emergencial à sua conta Athena: ${magicUrl}\n\nEste link é de uso único e expira em 2 horas.`);
      whatsappUrl = `https://wa.me/55${cleanPhone}?text=${msg}`;
    }

    logSecurityEvent({
      event: 'MAGIC_LINK_GENERATED',
      userId: req.user?.id,
      email: targetUser.email,
      ip: getClientIp(req),
      userAgent: req.headers['user-agent'],
      outcome: 'SUCCESS',
      details: {
        adminId: req.user?.id,
        adminName,
        targetUserId: targetId,
        expiresInMinutes: 120
      }
    });

    return res.json({
      success: true,
      magicUrl,
      whatsappUrl,
      expiresInMinutes: 120,
      userName: targetUser.name,
      userEmail: targetUser.email,
      userPhone: targetUser.phone,
      message: `Link de acesso emergencial gerado com sucesso por ${adminName}!`
    });
  } catch (err) {
    console.error('Erro ao gerar magic link no admin:', err);
    return res.status(500).json({ error: 'Erro ao gerar link de acesso emergencial.' });
  }
});

// Suporte / Admin: Desbloquear Acesso de Usuário Bloqueado por Tentativas
app.post('/api/admin/users/:id/unlock', authenticateToken, requireStaff, async (req, res) => {
  try {
    const targetId = req.params.id;
    const adminName = req.user?.name || req.user?.email || 'Administrador';

    let targetUser = null;
    if (pool) {
      const uRes = await pool.query('SELECT id, name, email, role, is_locked, failed_login_attempts FROM users WHERE id = $1', [targetId]);
      if (uRes.rows.length > 0) targetUser = uRes.rows[0];
    } else {
      const db = readDbJson();
      targetUser = (db.users || []).find(u => u.id === targetId);
    }

    if (!targetUser) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    if (pool) {
      try {
        await pool.query(`
          UPDATE users 
          SET is_locked = false,
              locked_until = NULL,
              failed_login_attempts = 0,
              unlocked_by = $1,
              unlocked_at = CURRENT_TIMESTAMP,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `, [adminName, targetId]);
      } catch (e) {
        console.error('Erro ao desbloquear usuário no PostgreSQL:', e.message);
      }
    }

    const db = readDbJson();
    const uIdx = (db.users || []).findIndex(u => u.id === targetId);
    if (uIdx !== -1) {
      db.users[uIdx].is_locked = false;
      db.users[uIdx].isLocked = false;
      db.users[uIdx].locked_until = null;
      db.users[uIdx].failed_login_attempts = 0;
      db.users[uIdx].failedAttempts = 0;
      db.users[uIdx].unlocked_by = adminName;
      db.users[uIdx].unlocked_at = new Date().toISOString();
      writeDbJson(db);
    }

    if (targetUser.email) {
      lockedAccountsMemory.delete(targetUser.email.toLowerCase());
    }

    logSecurityEvent({
      event: 'ADMIN_UNLOCK',
      userId: req.user?.id,
      email: targetUser.email,
      ip: getClientIp(req),
      userAgent: req.headers['user-agent'],
      outcome: 'SUCCESS',
      details: {
        adminId: req.user?.id,
        adminName,
        targetUserId: targetId
      }
    });

    return res.json({
      success: true,
      message: `Acesso do usuário ${targetUser.name} desbloqueado com sucesso por ${adminName}!`,
      userId: targetUser.id,
      unlockedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Erro ao desbloquear usuário:', err);
    return res.status(500).json({ error: 'Erro ao desbloquear usuário.' });
  }
});

// Suporte / Admin: Listar IPs bloqueados
app.get('/api/admin/security/blocked-ips', authenticateToken, requireAdmin, async (req, res) => {
  try {
    if (pool) {
      const result = await pool.query('SELECT * FROM security_ip_blocklist WHERE is_blocked = true ORDER BY blocked_at DESC');
      return res.json(result.rows);
    }
    const memList = [];
    for (const [ip, data] of ipSecurityTracker.entries()) {
      if (data.isBlocked) memList.push({ ip, ...data });
    }
    return res.json(memList);
  } catch (e) {
    return res.status(500).json({ error: 'Erro ao listar IPs bloqueados.' });
  }
});

// Suporte / Admin: Desbloquear IP bloqueado
// POLÍTICA ESTRITA ANTI-ENGENHARIA SOCIAL:
// Desbloqueio de IPs bloqueados é proibido via web/API para impedir ataques de persuasão/engenharia social contra atendentes ou administradores.
// O desbloqueio de um IP com 8 erros consecutivos só pode ser executado diretamente no banco de dados PostgreSQL.
app.post('/api/admin/security/unblock-ip', authenticateToken, requireAdmin, async (req, res) => {
  logSecurityEvent({
    event: 'ADMIN_UNBLOCK_IP_REJECTED',
    userId: req.user?.id,
    ip: req.body?.ip,
    userAgent: req.headers['user-agent'],
    outcome: 'BLOCKED',
    reason: 'Tentativa de desbloqueio de IP via API rejeitada por política estrita anti-engenharia social'
  });
  return res.status(403).json({
    error: 'Por política estrita de segurança contra engenharia social, o desbloqueio de IPs bloqueados é desativado via painel/API e requer execução direta no banco de dados PostgreSQL.'
  });
});

// Suporte / Admin: Reenviar E-mail com Código de Redefinição de Senha
app.post('/api/admin/users/:id/send-reset-email', authenticateToken, requireStaff, async (req, res) => {
  try {
    const targetId = req.params.id;
    let targetUser = null;

    if (pool) {
      const uRes = await pool.query('SELECT id, name, email, role FROM users WHERE id = $1', [targetId]);
      if (uRes.rows.length > 0) targetUser = uRes.rows[0];
    } else {
      const db = readDbJson();
      targetUser = (db.users || []).find(u => u.id === targetId);
    }

    if (!targetUser) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const inputEmail = targetUser.email.trim().toLowerCase();
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const resetId = `reset_${Date.now()}`;

    if (pool) {
      try {
        await pool.query(`
          INSERT INTO password_resets (id, email, token, expires_at, used)
          VALUES ($1, $2, $3, $4, $5)
        `, [resetId, inputEmail, resetCode, expiresAt, false]);
      } catch (e) {
        console.error('Erro ao salvar reset de senha pelo admin:', e.message);
      }
    }

    const db = readDbJson();
    if (!db.password_resets) db.password_resets = [];
    db.password_resets.push({
      id: resetId,
      email: inputEmail,
      token: resetCode,
      expiresAt: expiresAt.toISOString(),
      used: false
    });
    writeDbJson(db);

    const emailResult = await sendPasswordResetEmail(inputEmail, resetCode, targetUser.name);

    return res.json({
      success: true,
      message: `E-mail de recuperação enviado com sucesso para ${inputEmail}!`,
      delivery: emailResult.method,
      ...(emailResult.method === 'log' ? { devCode: resetCode } : {})
    });
  } catch (err) {
    console.error('Erro ao reenviar e-mail de redefinição pelo admin:', err);
    return res.status(500).json({ error: 'Erro ao enviar e-mail de redefinição.' });
  }
});

// Admin / CRM: Buscar Perfil Completo, Histórico de Pedidos e Extrato de Pontos do Cliente
app.get('/api/admin/users/:id/history', authenticateToken, requireStaff, async (req, res) => {
  try {
    const targetId = req.params.id;
    let targetUser = null;
    let orders = [];
    let transactions = [];

    if (pool) {
      try {
        const uRes = await pool.query(`
          SELECT id, name, email, role, phone, document, company_name as "companyName", 
                 COALESCE(a_points, 0) as "aPoints", 
                 COALESCE(must_change_password, false) as "mustChangePassword", 
                 created_at as "createdAt", updated_at as "updatedAt"
          FROM users WHERE id = $1
        `, [targetId]);
        if (uRes.rows.length > 0) targetUser = uRes.rows[0];

        if (targetUser) {
          const userEmail = (targetUser.email || '').trim().toLowerCase();
          const userDoc = (targetUser.document || '').replace(/\D/g, '');

          const oRes = await pool.query(`
            SELECT id, user_id as "userId", user_email as "userEmail", user_name as "userName", 
                   items, total_amount::float as "totalAmount", status, notes, created_at as "createdAt"
            FROM orders 
            WHERE user_id = $1 OR user_email = $2
            ORDER BY created_at DESC
          `, [targetId, userEmail]);
          orders = oRes.rows || [];

          const tRes = await pool.query(`
            SELECT id, order_id as "orderId", order_value as "orderValue", 
                   points_earned as "pointsEarned", source, type, status, 
                   reward_id as "rewardId", notes, created_at as "createdAt"
            FROM a_points_transactions
            WHERE user_id = $1 OR customer_email = $2 OR (customer_document = $3 AND $3 != '')
            ORDER BY created_at DESC
          `, [targetId, userEmail, userDoc]);
          transactions = tRes.rows || [];
        }
      } catch (pgErr) {
        console.error('Erro ao buscar histórico no PG:', pgErr.message);
      }
    }

    if (!targetUser) {
      const db = readDbJson();
      targetUser = (db.users || []).find(u => u.id === targetId);
      if (targetUser) {
        const userEmail = (targetUser.email || '').trim().toLowerCase();
        const userDoc = (targetUser.document || '').replace(/\D/g, '');

        orders = (db.orders || []).filter(o => 
          o.userId === targetId || (userEmail && (o.userEmail || '').toLowerCase() === userEmail)
        );

        transactions = (db.aPointsTransactions || []).filter(t => 
          t.userId === targetId || 
          (userEmail && (t.customerEmail || '').toLowerCase() === userEmail) ||
          (userDoc && (t.customerDocument || '').replace(/\D/g, '') === userDoc)
        ).reverse();
      }
    }

    if (!targetUser) {
      return res.status(404).json({ error: 'Cliente não encontrado.' });
    }

    const totalSpent = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    const pointsEarnedTotal = transactions
      .filter(t => Number(t.pointsEarned) > 0)
      .reduce((sum, t) => sum + Number(t.pointsEarned), 0);
    const pointsRedeemedTotal = transactions
      .filter(t => Number(t.pointsEarned) < 0)
      .reduce((sum, t) => sum + Math.abs(Number(t.pointsEarned)), 0);

    return res.json({
      user: targetUser,
      orders,
      transactions,
      summary: {
        totalOrders: orders.length,
        totalSpent,
        pointsEarnedTotal,
        pointsRedeemedTotal,
        currentPoints: Number(targetUser.aPoints || 0)
      }
    });
  } catch (err) {
    console.error('Erro ao consultar histórico do cliente:', err);
    return res.status(500).json({ error: 'Erro ao buscar dados do cliente.' });
  }
});

// Admin: List All A-Points Transactions
app.get('/api/admin/points/transactions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    if (pool) {
      try {
        const result = await pool.query(`
          SELECT id, user_id as "userId", customer_document as "customerDocument", 
                 customer_email as "customerEmail", customer_name as "customerName", 
                 order_id as "orderId", order_value as "orderValue", points_earned as "pointsEarned", 
                 source, type, status, reward_id as "rewardId", notes, created_at as "createdAt"
          FROM a_points_transactions
          ORDER BY created_at DESC
          LIMIT 100
        `);
        return res.json(result.rows);
      } catch (e) {
        console.error('Erro ao listar transações de pontos no PG:', e.message);
      }
    }
    const db = readDbJson();
    const list = (db.aPointsTransactions || []).slice().reverse().slice(0, 100);
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao listar transações de pontos.' });
  }
});

// Admin: Manually Adjust or Credit Points for a Customer
app.post('/api/admin/points/adjust', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId, userEmail, points, reason } = req.body;
    const numPoints = Number(points);
    if (isNaN(numPoints) || numPoints === 0) {
      return res.status(400).json({ error: 'Informe uma quantidade válida de pontos (positiva ou negativa).' });
    }

    let targetEmail = (userEmail || '').trim().toLowerCase();
    let targetName = 'Cliente';
    let targetDoc = '';

    if (pool) {
      try {
        const uRes = userId 
          ? await pool.query('SELECT * FROM users WHERE id = $1', [userId])
          : await pool.query('SELECT * FROM users WHERE LOWER(email) = $1', [targetEmail]);
        if (uRes.rows.length > 0) {
          const u = uRes.rows[0];
          targetEmail = u.email;
          targetName = u.name;
          targetDoc = u.document || '';
        }
      } catch (e) {}
    }

    const result = await creditCustomerAPoints({
      orderId: reason ? `Ajuste: ${reason.slice(0, 50)}` : 'ajuste_manual',
      orderTotal: 0,
      points: numPoints,
      customerEmail: targetEmail,
      customerCpfCnpj: targetDoc,
      customerName: targetName,
      source: 'admin_manual'
    });

    return res.json({ success: true, message: 'Pontos atualizados com sucesso!', result });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Erro ao ajustar pontos.' });
  }
});

// -------------------------------------------------------------
// ADMIN: NOTIFICATION & RECEIPT EMAIL SETTINGS
// -------------------------------------------------------------

// Obter configurações de e-mail e comprovantes
app.get('/api/admin/settings/notifications', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const config = await getNotificationSettings();
    return res.json({
      ...config,
      smtpConfigured: !!mailTransporter,
      smtpSender: SMTP_FROM,
      hermesSecretKey: process.env.HERMES_SECRET_KEY || 'athena_hermes_prod_2026_key',
      hermesApiUrl: 'https://athenaconsultoria.com.br/api/hermes'
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao obter configurações de e-mail.' });
  }
});

// Atualizar configurações de e-mail e comprovantes
app.post('/api/admin/settings/notifications', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { 
      receiptNotificationEmail, 
      loyaltyNotificationEmail, 
      purchaseNotificationEmail, 
      emailNotificationsEnabled,
      sendCustomerCopy 
    } = req.body;

    if (receiptNotificationEmail !== undefined) {
      await setSystemSetting('receipt_notification_email', normalizeEmailList(receiptNotificationEmail), 'E-mail para recebimento de comprovantes de compras e resgates');
    }
    if (loyaltyNotificationEmail !== undefined) {
      await setSystemSetting('loyalty_notification_email', normalizeEmailList(loyaltyNotificationEmail), 'E-mail específico para alertas de resgate de fidelidade (opcional)');
    }
    if (purchaseNotificationEmail !== undefined) {
      await setSystemSetting('purchase_notification_email', normalizeEmailList(purchaseNotificationEmail), 'E-mail específico para alertas de compras / faturamento (opcional)');
    }
    if (emailNotificationsEnabled !== undefined) {
      await setSystemSetting('email_notifications_enabled', emailNotificationsEnabled ? 'true' : 'false', 'Habilita envio de alertas por e-mail');
    }
    if (sendCustomerCopy !== undefined) {
      await setSystemSetting('send_customer_copy', sendCustomerCopy ? 'true' : 'false', 'Envia cópia do comprovante para o e-mail do cliente');
    }
    if (req.body.resendApiKey !== undefined && !req.body.resendApiKey.includes('••••')) {
      await setSystemSetting('resend_api_key', req.body.resendApiKey.trim(), 'Chave de API Resend HTTP (Porta 443)');
    }
    if (req.body.resendFromEmail !== undefined) {
      await setSystemSetting('resend_from_email', req.body.resendFromEmail.trim(), 'Remetente Resend');
    }
    if (req.body.brevoApiKey !== undefined && !req.body.brevoApiKey.includes('••••')) {
      await setSystemSetting('brevo_api_key', req.body.brevoApiKey.trim(), 'Chave de API Brevo HTTP (Porta 443)');
    }
    if (req.body.brevoSenderEmail !== undefined) {
      await setSystemSetting('brevo_sender_email', req.body.brevoSenderEmail.trim(), 'Remetente Brevo');
    }

    const updatedConfig = await getNotificationSettings();
    return res.json({
      success: true,
      message: 'Configurações de e-mail atualizadas com sucesso!',
      settings: updatedConfig
    });
  } catch (err) {
    console.error('Erro ao atualizar configurações de notificação:', err);
    return res.status(500).json({ error: err.message || 'Erro ao atualizar configurações.' });
  }
});

// Disparo de teste para verificar entrega na caixa de entrada
app.post('/api/admin/settings/test-email', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { targetEmail, testType } = req.body;
    const config = await getNotificationSettings();
    const destination = targetEmail || config.receiptNotificationEmail;

    if (!destination) {
      return res.status(400).json({ error: 'Informe um e-mail de destino para o teste.' });
    }

    const result = await sendTestNotificationEmail({ targetEmail: destination, testType: testType || 'general' });
    if (!result.success && result.reason === 'no_recipient') {
      return res.status(400).json({ error: 'Destinatário inválido informado.' });
    }
    if (!result.success && result.error) {
      const errHeader = result.provider ? `Erro no envio (${result.provider.toUpperCase()})` : 'Erro no envio';
      return res.status(500).json({ 
        error: `${errHeader}: ${result.error}`,
        provider: result.provider,
        isTimeout: result.isTimeout
      });
    }

    const providerLabel = result.provider ? result.provider.toUpperCase() : 'servidor';
    return res.json({
      success: true,
      provider: result.provider,
      message: `E-mail de teste (${testType || 'geral'}) enviado com sucesso para "${destination}" via ${providerLabel}!`
    });
  } catch (err) {
    console.error('Erro ao enviar e-mail de teste:', err);
    return res.status(500).json({ error: err.message || 'Falha ao enviar e-mail de teste.' });
  }
});

// Create Employee User (Restricted to Administrator)
app.post('/api/users', authenticateToken, requireAdmin, async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nome, E-mail e Senha são obrigatórios.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres.' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = {
    id: `user_${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash: hashedPassword,
    role: role || 'vendedor'
  };

  // Sync to local JSON as safety buffer
  const db = readDbJson();
  if (!db.users) db.users = [];
  if (db.users.some(u => u.email.toLowerCase() === newUser.email)) {
    return res.status(400).json({ error: 'Este e-mail já está cadastrado.' });
  }
  db.users.push(newUser);
  writeDbJson(db);

  if (pool) {
    try {
      await pool.query(
        'INSERT INTO users (id, name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5)',
        [newUser.id, newUser.name, newUser.email, newUser.passwordHash, newUser.role]
      );
    } catch (e) {
      console.error('Aviso ao sincronizar usuário no PostgreSQL:', e.message);
      if (e.code === '23505') {
        return res.status(400).json({ error: 'Este e-mail já está cadastrado.' });
      }
    }
  }

  res.status(201).json({ id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role });
});

// Update User Profile & Password (Authenticated: Admin or Account Owner)
app.put('/api/users/:id', authenticateToken, async (req, res) => {
  const { name, email, currentPassword, newPassword, role } = req.body;
  const userId = req.params.id;

  // Authorization: Only admin or the user themselves can update their profile
  if (req.user.role !== 'admin' && req.user.id !== userId) {
    return res.status(403).json({ error: 'Permissão negada para atualizar este perfil.' });
  }

  let existingUser = null;
  let userIdx = -1;
  const db = readDbJson();

  if (pool) {
    try {
      const uRes = await pool.query('SELECT id, name, email, password_hash as "passwordHash", role FROM users WHERE id = $1', [userId]);
      if (uRes.rows && uRes.rows.length > 0) {
        existingUser = uRes.rows[0];
      }
    } catch (e) {}
  }

  userIdx = (db.users || []).findIndex(u => u.id === userId);
  if (!existingUser && userIdx !== -1) {
    existingUser = db.users[userIdx];
  }

  // OWASP Hardening: Sessões geradas via Magic Link não têm autorização para alterar senhas ou privilégios
  if (req.user?.isMagicLinkSession && (newPassword || (email && email.toLowerCase().trim() !== (existingUser?.email || '').toLowerCase().trim()) || role)) {
    logSecurityEvent({
      event: 'SENSITIVE_ACTION_BLOCKED',
      userId: req.user.id,
      email: req.user.email,
      ip: getClientIp(req),
      userAgent: req.headers['user-agent'],
      outcome: 'BLOCKED',
      reason: 'Tentativa de alteração de credenciais/perfil via Magic Link em /api/users/:id'
    });
    return res.status(403).json({
      error: 'Sessões temporárias de Link Emergencial não têm autorização para modificar senhas, e-mails ou privilégios.'
    });
  }

  // Se o usuário estiver alterando a senha e não for admin, a senha atual é OBRIGATÓRIA e validada
  if (newPassword && req.user.role !== 'admin') {
    if (!currentPassword) {
      return res.status(400).json({ error: 'A senha atual é obrigatória para definir uma nova senha.' });
    }
    const currentHash = existingUser?.passwordHash || existingUser?.password_hash;
    if (!currentHash || !checkPassword(currentPassword, currentHash)) {
      return res.status(400).json({ error: 'Senha atual incorreta.' });
    }
  } else if (currentPassword) {
    const currentHash = existingUser?.passwordHash || existingUser?.password_hash;
    if (currentHash && !checkPassword(currentPassword, currentHash)) {
      return res.status(400).json({ error: 'Senha atual incorreta.' });
    }
  }

  const updatedName = name ? name.trim() : (existingUser?.name || 'Usuário');
  const updatedEmail = email ? email.trim().toLowerCase() : (existingUser?.email || '');
  const updatedPassword = newPassword ? bcrypt.hashSync(newPassword, 10) : (existingUser?.passwordHash || existingUser?.password_hash);
  
  // Usuários não-administradores NÃO podem alterar o próprio cargo (padrão seguro: cliente)
  const updatedRole = (req.user.role === 'admin' && role) ? role : (existingUser?.role || 'cliente');

  if (userIdx !== -1) {
    db.users[userIdx] = {
      ...db.users[userIdx],
      name: updatedName,
      email: updatedEmail,
      passwordHash: updatedPassword,
      role: updatedRole
    };
    writeDbJson(db);
  }

  if (pool) {
    try {
      await pool.query(
        'UPDATE users SET name = $1, email = $2, password_hash = $3, role = $4 WHERE id = $5',
        [updatedName, updatedEmail, updatedPassword, updatedRole, userId]
      );
    } catch (e) {
      console.error('Aviso ao atualizar no PostgreSQL:', e.message);
    }
  }

  return res.json({
    id: userId,
    name: updatedName,
    email: updatedEmail,
    role: updatedRole,
    message: 'Credenciais atualizadas com sucesso!'
  });
});

// Delete / Revoke Employee Access (Restricted to Administrator)
app.delete('/api/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  if (pool) {
    try {
      await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    } catch (e) {
      console.error('Aviso ao deletar usuário do PostgreSQL:', e.message);
    }
  }
  const db = readDbJson();
  db.users = (db.users || []).filter((u) => u.id !== req.params.id);
  writeDbJson(db);
  res.json({ success: true, id: req.params.id });
});

// -------------------------------------------------------------
// REST API ENDPOINTS (CATEGORIES, BRANDS, PRODUCTS)
// -------------------------------------------------------------

// 1. CATEGORIES
app.get('/api/categories', async (req, res) => {
  if (pool) {
    try {
      const result = await pool.query('SELECT id, name, slug, description, icon, "order", department_id AS "departmentId" FROM categories ORDER BY "order" ASC, name ASC');
      return res.json(result.rows);
    } catch (e) {
      console.error(e);
    }
  }
  const db = readDbJson();
  res.json(db.categories || []);
});

app.get('/api/categories/:identifier', async (req, res) => {
  const { identifier } = req.params;
  if (!identifier) return res.status(400).json({ error: 'Identificador obrigatório.' });
  const cleanId = String(identifier).trim().slice(0, 150);

  if (pool) {
    try {
      const result = await pool.query(
        'SELECT id, name, slug, description, icon, "order", department_id AS "departmentId" FROM categories WHERE id = $1 OR slug = $1 LIMIT 1',
        [cleanId]
      );
      if (result.rows.length > 0) {
        return res.json(result.rows[0]);
      }
    } catch (e) {
      console.error('Erro ao buscar categoria unitária no PostgreSQL:', e.message);
    }
  }

  const db = readDbJson();
  const cat = (db.categories || []).find(c => c.id === cleanId || c.slug === cleanId);
  if (cat) return res.json(cat);
  return res.status(404).json({ error: 'Categoria não encontrada.' });
});

app.post('/api/categories', authenticateToken, requireStaff, async (req, res) => {
  const newCat = { id: req.body.id || `cat_${Date.now()}`, ...req.body };
  if (pool) {
    try {
      await pool.query(
        'INSERT INTO categories (id, name, slug, description, icon, "order", department_id) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO UPDATE SET name=$2, slug=$3, description=$4, icon=$5, "order"=$6, department_id=$7',
        [newCat.id, newCat.name, newCat.slug || '', newCat.description || '', newCat.icon || 'Layers', newCat.order || 0, newCat.departmentId || null]
      );
      return res.status(201).json(newCat);
    } catch (e) {
      console.error(e);
    }
  }
  const db = readDbJson();
  db.categories.push(newCat);
  writeDbJson(db);
  res.status(201).json(newCat);
});

app.put('/api/categories/reorder', authenticateToken, requireStaff, async (req, res) => {
  const { categories: orderedCats } = req.body;
  if (!Array.isArray(orderedCats)) {
    return res.status(400).json({ error: 'Array de categorias obrigatório.' });
  }
  if (orderedCats.length > 500) {
    return res.status(400).json({ error: 'Limite de itens para reordenação excedido.' });
  }
  if (pool && orderedCats.length > 0) {
    try {
      const ids = orderedCats.map(c => String(c.id));
      const orders = orderedCats.map((_, idx) => idx + 1);
      await pool.query(`
        UPDATE categories AS c
        SET "order" = v.new_order
        FROM (SELECT unnest($1::varchar[]) AS id, unnest($2::int[]) AS new_order) AS v
        WHERE c.id = v.id
      `, [ids, orders]);
    } catch (e) {
      console.error('Erro ao reordenar categorias no PostgreSQL:', e.message);
    }
  }
  const db = readDbJson();
  const catMap = new Map((db.categories || []).map(c => [c.id, c]));
  const reordered = [];
  orderedCats.forEach((c, idx) => {
    const existing = catMap.get(c.id) || c;
    existing.order = idx + 1;
    reordered.push(existing);
    catMap.delete(c.id);
  });
  catMap.forEach(c => reordered.push(c));
  db.categories = reordered;
  writeDbJson(db);
  res.json({ success: true, count: orderedCats.length });
});

app.put('/api/categories/:id', authenticateToken, requireStaff, async (req, res) => {
  const updatedCat = { id: req.params.id, ...req.body };
  if (pool) {
    try {
      await pool.query(
        'UPDATE categories SET name=$1, slug=$2, description=$3, icon=$4, "order"=$5, department_id=$6 WHERE id=$7',
        [updatedCat.name, updatedCat.slug || '', updatedCat.description || '', updatedCat.icon || 'Layers', updatedCat.order || 0, updatedCat.departmentId || null, req.params.id]
      );
      return res.json(updatedCat);
    } catch (e) {
      console.error('Erro ao atualizar categoria no PostgreSQL:', e.message);
    }
  }
  const db = readDbJson();
  const index = (db.categories || []).findIndex((c) => c.id === req.params.id);
  if (index !== -1) {
    db.categories[index] = { ...db.categories[index], ...req.body };
    writeDbJson(db);
    return res.json(db.categories[index]);
  }
  res.status(404).json({ error: 'Categoria não encontrada' });
});

app.delete('/api/categories/:id', authenticateToken, requireStaff, async (req, res) => {
  if (pool) {
    try {
      await pool.query('DELETE FROM categories WHERE id = $1', [req.params.id]);
      return res.json({ success: true, id: req.params.id });
    } catch (e) {
      console.error(e);
    }
  }
  const db = readDbJson();
  db.categories = (db.categories || []).filter((c) => c.id !== req.params.id);
  writeDbJson(db);
  res.json({ success: true, id: req.params.id });
});

// 1.5 DEPARTMENTS / MACRO-CATEGORIES
app.get('/api/departments', async (req, res) => {
  if (pool) {
    try {
      const result = await pool.query('SELECT id, name, short_name AS "shortName", icon, "order" FROM departments ORDER BY "order" ASC, name ASC');
      return res.json(result.rows);
    } catch (e) {
      console.error('Erro ao buscar departamentos no PostgreSQL:', e.message);
    }
  }
  const db = readDbJson();
  res.json(db.departments || []);
});

app.post('/api/departments', authenticateToken, requireStaff, async (req, res) => {
  const newDept = {
    id: req.body.id || `dept_${Date.now()}`,
    name: (req.body.name || '').trim(),
    shortName: (req.body.shortName || req.body.name || '').trim(),
    icon: req.body.icon || 'Layers',
    order: req.body.order || 0
  };

  if (pool) {
    try {
      await pool.query(
        'INSERT INTO departments (id, name, short_name, icon, "order") VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO UPDATE SET name=$2, short_name=$3, icon=$4, "order"=$5',
        [newDept.id, newDept.name, newDept.shortName, newDept.icon, newDept.order]
      );
      return res.status(201).json(newDept);
    } catch (e) {
      console.error('Erro ao criar departamento no PostgreSQL:', e.message);
    }
  }

  const db = readDbJson();
  if (!Array.isArray(db.departments)) db.departments = [];
  db.departments.push(newDept);
  writeDbJson(db);
  res.status(201).json(newDept);
});

app.put('/api/departments/:id', authenticateToken, requireStaff, async (req, res) => {
  const updatedDept = {
    id: req.params.id,
    name: (req.body.name || '').trim(),
    shortName: (req.body.shortName || req.body.name || '').trim(),
    icon: req.body.icon || 'Layers',
    order: req.body.order !== undefined ? req.body.order : 0
  };

  if (pool) {
    try {
      await pool.query(
        'UPDATE departments SET name=$1, short_name=$2, icon=$3, "order"=$4 WHERE id=$5',
        [updatedDept.name, updatedDept.shortName, updatedDept.icon, updatedDept.order, req.params.id]
      );
      return res.json(updatedDept);
    } catch (e) {
      console.error('Erro ao atualizar departamento no PostgreSQL:', e.message);
    }
  }

  const db = readDbJson();
  if (!Array.isArray(db.departments)) db.departments = [];
  const idx = db.departments.findIndex(d => d.id === req.params.id);
  if (idx !== -1) {
    db.departments[idx] = { ...db.departments[idx], ...updatedDept };
    writeDbJson(db);
    return res.json(db.departments[idx]);
  }
  res.status(404).json({ error: 'Departamento não encontrado.' });
});

app.delete('/api/departments/:id', authenticateToken, requireStaff, async (req, res) => {
  if (pool) {
    try {
      // Set department_id = NULL on any categories that belonged to this department
      await pool.query('UPDATE categories SET department_id = NULL WHERE department_id = $1', [req.params.id]);
      await pool.query('DELETE FROM departments WHERE id = $1', [req.params.id]);
      return res.json({ success: true, id: req.params.id });
    } catch (e) {
      console.error('Erro ao deletar departamento no PostgreSQL:', e.message);
    }
  }

  const db = readDbJson();
  if (Array.isArray(db.departments)) {
    db.departments = db.departments.filter(d => d.id !== req.params.id);
    if (Array.isArray(db.categories)) {
      db.categories = db.categories.map(c => c.departmentId === req.params.id ? { ...c, departmentId: null } : c);
    }
    writeDbJson(db);
  }
  res.json({ success: true, id: req.params.id });
});

// 2. BRANDS
app.get('/api/brands', async (req, res) => {
  if (pool) {
    try {
      const result = await pool.query('SELECT id, name, slug, description, logo, website_url as "websiteUrl", "order" FROM brands ORDER BY "order" ASC, name ASC');
      return res.json(result.rows);
    } catch (e) {
      console.error(e);
    }
  }
  const db = readDbJson();
  res.json(db.brands || []);
});

app.get('/api/brands/:identifier', async (req, res) => {
  const { identifier } = req.params;
  if (!identifier) return res.status(400).json({ error: 'Identificador obrigatório.' });
  const cleanId = String(identifier).trim().slice(0, 150);

  if (pool) {
    try {
      const result = await pool.query(
        'SELECT id, name, slug, description, logo, website_url as "websiteUrl", "order" FROM brands WHERE id = $1 OR slug = $1 LIMIT 1',
        [cleanId]
      );
      if (result.rows.length > 0) {
        return res.json(result.rows[0]);
      }
    } catch (e) {
      console.error('Erro ao buscar marca unitária no PostgreSQL:', e.message);
    }
  }

  const db = readDbJson();
  const brand = (db.brands || []).find(b => b.id === cleanId || b.slug === cleanId);
  if (brand) return res.json(brand);
  return res.status(404).json({ error: 'Marca não encontrada.' });
});

app.post('/api/brands', authenticateToken, requireStaff, async (req, res) => {
  const newBrand = { id: req.body.id || `brand_${Date.now()}`, ...req.body };
  if (pool) {
    try {
      await pool.query(
        'INSERT INTO brands (id, name, slug, description, logo, website_url, "order") VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO UPDATE SET name=$2, slug=$3, description=$4, logo=$5, website_url=$6, "order"=$7',
        [newBrand.id, newBrand.name, newBrand.slug || '', newBrand.description || '', newBrand.logo || '', newBrand.websiteUrl || '', newBrand.order || 0]
      );
      return res.status(201).json(newBrand);
    } catch (e) {
      console.error(e);
    }
  }
  const db = readDbJson();
  db.brands.push(newBrand);
  writeDbJson(db);
  res.status(201).json(newBrand);
});

app.put('/api/brands/reorder', authenticateToken, requireStaff, async (req, res) => {
  const { brands: orderedBrands } = req.body;
  if (!Array.isArray(orderedBrands)) {
    return res.status(400).json({ error: 'Array de marcas obrigatório.' });
  }
  if (orderedBrands.length > 500) {
    return res.status(400).json({ error: 'Limite de itens para reordenação excedido.' });
  }
  if (pool && orderedBrands.length > 0) {
    try {
      const ids = orderedBrands.map(b => String(b.id));
      const orders = orderedBrands.map((_, idx) => idx + 1);
      await pool.query(`
        UPDATE brands AS b
        SET "order" = v.new_order
        FROM (SELECT unnest($1::varchar[]) AS id, unnest($2::int[]) AS new_order) AS v
        WHERE b.id = v.id
      `, [ids, orders]);
    } catch (e) {
      console.error('Erro ao reordenar marcas no PostgreSQL:', e.message);
    }
  }
  const db = readDbJson();
  const brandMap = new Map((db.brands || []).map(b => [b.id, b]));
  const reordered = [];
  orderedBrands.forEach((b, idx) => {
    const existing = brandMap.get(b.id) || b;
    existing.order = idx + 1;
    reordered.push(existing);
    brandMap.delete(b.id);
  });
  brandMap.forEach(b => reordered.push(b));
  db.brands = reordered;
  writeDbJson(db);
  res.json({ success: true, count: orderedBrands.length });
});

app.put('/api/brands/:id', authenticateToken, requireStaff, async (req, res) => {
  const updatedBrand = { id: req.params.id, ...req.body };
  if (pool) {
    try {
      await pool.query(
        'UPDATE brands SET name=$1, slug=$2, description=$3, logo=$4, website_url=$5, "order"=$6 WHERE id=$7',
        [updatedBrand.name, updatedBrand.slug || '', updatedBrand.description || '', updatedBrand.logo || '', updatedBrand.websiteUrl || '', updatedBrand.order || 0, req.params.id]
      );
      return res.json(updatedBrand);
    } catch (e) {
      console.error(e);
    }
  }
  const db = readDbJson();
  const index = db.brands.findIndex((b) => b.id === req.params.id);
  if (index !== -1) {
    db.brands[index] = { ...db.brands[index], ...req.body };
    writeDbJson(db);
    return res.json(db.brands[index]);
  }
  res.status(404).json({ error: 'Marca não encontrada' });
});

app.delete('/api/brands/:id', authenticateToken, requireStaff, async (req, res) => {
  if (pool) {
    try {
      await pool.query('DELETE FROM brands WHERE id = $1', [req.params.id]);
      return res.json({ success: true, id: req.params.id });
    } catch (e) {
      console.error(e);
    }
  }
  const db = readDbJson();
  db.brands = db.brands.filter((b) => b.id !== req.params.id);
  writeDbJson(db);
  res.json({ success: true, id: req.params.id });
});

// 2.5 HOME BANNERS (CAROUSEL)
app.get('/api/banners', async (req, res) => {
  const includeAll = req.query.all === 'true';
  if (pool) {
    try {
      const query = includeAll
        ? 'SELECT id, title, desktop_image as "desktopImage", mobile_image as "mobileImage", link_url as "linkUrl", target_blank as "targetBlank", is_active as "isActive", "order" FROM home_banners ORDER BY "order" ASC, created_at ASC'
        : 'SELECT id, title, desktop_image as "desktopImage", mobile_image as "mobileImage", link_url as "linkUrl", target_blank as "targetBlank", is_active as "isActive", "order" FROM home_banners WHERE is_active = true ORDER BY "order" ASC, created_at ASC';
      const result = await pool.query(query);
      return res.json(result.rows);
    } catch (e) {
      console.error('Erro ao buscar banners no PostgreSQL:', e.message);
    }
  }
  const db = readDbJson();
  const list = db.banners || [];
  const filtered = includeAll ? list : list.filter(b => b.isActive !== false);
  filtered.sort((a, b) => (a.order || 0) - (b.order || 0));
  res.json(filtered);
});

app.post('/api/banners', authenticateToken, requireStaff, async (req, res) => {
  const newBanner = {
    id: req.body.id || `bnr_${Date.now()}`,
    title: req.body.title || 'Banner Athena',
    desktopImage: req.body.desktopImage || req.body.desktop_image || '',
    mobileImage: req.body.mobileImage || req.body.mobile_image || '',
    linkUrl: req.body.linkUrl || req.body.link_url || '',
    targetBlank: Boolean(req.body.targetBlank !== undefined ? req.body.targetBlank : req.body.target_blank),
    isActive: req.body.isActive !== undefined ? Boolean(req.body.isActive) : true,
    order: parseInt(req.body.order || 0, 10)
  };

  if (!newBanner.desktopImage) {
    return res.status(400).json({ error: 'A imagem para desktop é obrigatória.' });
  }

  if (pool) {
    try {
      await pool.query(
        `INSERT INTO home_banners (id, title, desktop_image, mobile_image, link_url, target_blank, is_active, "order")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO UPDATE SET title=$2, desktop_image=$3, mobile_image=$4, link_url=$5, target_blank=$6, is_active=$7, "order"=$8, updated_at=NOW()`,
        [newBanner.id, newBanner.title, newBanner.desktopImage, newBanner.mobileImage, newBanner.linkUrl, newBanner.targetBlank, newBanner.isActive, newBanner.order]
      );
      return res.status(201).json(newBanner);
    } catch (e) {
      console.error('Erro ao criar banner no PostgreSQL:', e.message);
    }
  }
  const db = readDbJson();
  if (!Array.isArray(db.banners)) db.banners = [];
  db.banners.push(newBanner);
  writeDbJson(db);
  res.status(201).json(newBanner);
});

app.put('/api/banners/reorder', authenticateToken, requireStaff, async (req, res) => {
  const { banners: orderedBanners } = req.body;
  if (!Array.isArray(orderedBanners)) {
    return res.status(400).json({ error: 'Array de banners obrigatório.' });
  }
  if (orderedBanners.length > 500) {
    return res.status(400).json({ error: 'Limite de itens para reordenação excedido.' });
  }
  if (pool && orderedBanners.length > 0) {
    try {
      const ids = orderedBanners.map(b => String(b.id));
      const orders = orderedBanners.map((_, idx) => idx + 1);
      await pool.query(`
        UPDATE home_banners AS b
        SET "order" = v.new_order
        FROM (SELECT unnest($1::varchar[]) AS id, unnest($2::int[]) AS new_order) AS v
        WHERE b.id = v.id
      `, [ids, orders]);
    } catch (e) {
      console.error('Erro ao reordenar banners no PostgreSQL:', e.message);
    }
  }
  const db = readDbJson();
  if (!Array.isArray(db.banners)) db.banners = [];
  const bnrMap = new Map(db.banners.map(b => [b.id, b]));
  const reordered = [];
  orderedBanners.forEach((b, idx) => {
    const existing = bnrMap.get(b.id) || b;
    existing.order = idx + 1;
    reordered.push(existing);
    bnrMap.delete(b.id);
  });
  bnrMap.forEach(b => reordered.push(b));
  db.banners = reordered;
  writeDbJson(db);
  res.json({ success: true, count: orderedBanners.length });
});

app.put('/api/banners/:id', authenticateToken, requireStaff, async (req, res) => {
  const updatedBanner = {
    id: req.params.id,
    title: req.body.title || 'Banner Athena',
    desktopImage: req.body.desktopImage || req.body.desktop_image || '',
    mobileImage: req.body.mobileImage || req.body.mobile_image || '',
    linkUrl: req.body.linkUrl || req.body.link_url || '',
    targetBlank: Boolean(req.body.targetBlank !== undefined ? req.body.targetBlank : req.body.target_blank),
    isActive: req.body.isActive !== undefined ? Boolean(req.body.isActive) : true,
    order: parseInt(req.body.order || 0, 10)
  };

  if (!updatedBanner.desktopImage) {
    return res.status(400).json({ error: 'A imagem para desktop é obrigatória.' });
  }

  if (pool) {
    try {
      await pool.query(
        `UPDATE home_banners SET title=$1, desktop_image=$2, mobile_image=$3, link_url=$4, target_blank=$5, is_active=$6, "order"=$7, updated_at=NOW() WHERE id=$8`,
        [updatedBanner.title, updatedBanner.desktopImage, updatedBanner.mobileImage, updatedBanner.linkUrl, updatedBanner.targetBlank, updatedBanner.isActive, updatedBanner.order, req.params.id]
      );
      return res.json(updatedBanner);
    } catch (e) {
      console.error('Erro ao atualizar banner no PostgreSQL:', e.message);
    }
  }
  const db = readDbJson();
  if (!Array.isArray(db.banners)) db.banners = [];
  const idx = db.banners.findIndex(b => b.id === req.params.id);
  if (idx !== -1) {
    db.banners[idx] = { ...db.banners[idx], ...updatedBanner };
    writeDbJson(db);
    return res.json(db.banners[idx]);
  }
  res.status(404).json({ error: 'Banner não encontrado.' });
});

app.delete('/api/banners/:id', authenticateToken, requireStaff, async (req, res) => {
  if (pool) {
    try {
      await pool.query('DELETE FROM home_banners WHERE id = $1', [req.params.id]);
      return res.json({ success: true, id: req.params.id });
    } catch (e) {
      console.error('Erro ao deletar banner no PostgreSQL:', e.message);
    }
  }
  const db = readDbJson();
  if (!Array.isArray(db.banners)) db.banners = [];
  db.banners = db.banners.filter(b => b.id !== req.params.id);
  writeDbJson(db);
  res.json({ success: true, id: req.params.id });
});

// Dynamic Catalog Versioning & SWR Cache Invalidation Endpoint
app.get(['/api/catalog/version', '/api/catalogo/versao'], async (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  if (pool) {
    try {
      const result = await pool.query(`
        SELECT COUNT(*) as total, EXTRACT(EPOCH FROM MAX(updated_at))::bigint as last_updated
        FROM products
      `);
      const row = result.rows[0] || {};
      const total = parseInt(row.total || 0, 10);
      const lastUpdated = parseInt(row.last_updated || 0, 10);
      const version = `${total}-${lastUpdated}`;

      return res.json({
        version,
        total,
        lastUpdated,
        serverTime: Date.now()
      });
    } catch (e) {
      console.error('[Catalog Version Error]:', e.message);
      return res.status(500).json({ error: 'Erro ao verificar versão do catálogo' });
    }
  }

  return res.json({
    version: `fallback-${Date.now()}`,
    total: 0,
    lastUpdated: 0,
    serverTime: Date.now()
  });
});

// 3. PRODUCTS
app.get(['/api/products', '/api/produtos'], async (req, res) => {
  const isPaginated = req.query.page !== undefined || req.query.limit !== undefined;

  if (pool) {
    try {
      const conditions = [];
      const values = [];
      let paramIdx = 1;

      // Status filter (bounded to 50 chars)
      if (req.query.status && typeof req.query.status === 'string') {
        conditions.push(`p.status = $${paramIdx++}`);
        values.push(req.query.status.trim().slice(0, 50));
      }

      // Category filter (bounded to 100 chars)
      if (req.query.category || req.query.categoryId) {
        const cat = String(req.query.category || req.query.categoryId).trim().slice(0, 100);
        conditions.push(`p.category_id = $${paramIdx++}`);
        values.push(cat);
      }

      // Brand filter (bounded to 100 chars)
      if (req.query.brand || req.query.brandId) {
        const br = String(req.query.brand || req.query.brandId).trim().slice(0, 100);
        conditions.push(`p.brand_id = $${paramIdx++}`);
        values.push(br);
      }

      // Featured filter
      if (req.query.featured !== undefined) {
        conditions.push(`p.is_featured = $${paramIdx++}`);
        values.push(req.query.featured === 'true' || req.query.featured === '1');
      }

      // Search filter (OWASP: Sanitized against LIKE wildcard DoS & bounded to 100 chars)
      if (req.query.search && typeof req.query.search === 'string') {
        const sanitizedSearch = req.query.search.trim().slice(0, 100).replace(/[%_\\]/g, '\\$&');
        if (sanitizedSearch.length > 0) {
          conditions.push(`(p.name ILIKE $${paramIdx} OR p.description ILIKE $${paramIdx} OR p.slug ILIKE $${paramIdx} OR p.badge ILIKE $${paramIdx})`);
          values.push(`%${sanitizedSearch}%`);
          paramIdx++;
        }
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Base query with LEFT JOINs to categories and brands to eliminate N+1 queries
      const baseSelect = `
        SELECT 
          p.id, p.name, p.slug, 
          p.category_id as "categoryId", 
          c.name as "categoryName",
          c.slug as "categorySlug",
          p.brand_id as "brandId", 
          b.name as "brandName",
          b.slug as "brandSlug",
          p.price::float, 
          COALESCE(p.preco_venda, p.price, 0)::float as "precoVenda",
          p.price_negotiable as "priceNegotiable", 
          p.sku,
          p.omie_code as "omieCode",
          p.omie_codigo_produto as "omieCodigoProduto",
          COALESCE(p.estoque_quantidade, 0) as "stock",
          COALESCE(p.estoque_quantidade, 0) as "estoqueQuantidade",
          p.badge, p.tags, 
          p.compatible_product_ids as "compatibleProductIds", 
          p.recommended_product_ids as "recommendedProductIds", 
          p.status, 
          p.is_featured as "isFeatured", 
          p.image, p.images, 
          p.alt_text as "altText", 
          p.description, p.specs, 
          p.attachments, 
          p.in_stock as "inStock", 
          p.video_url as "videoUrl", 
          p.custom_tabs as "customTabs", 
          p.product_type as "productType", 
          p.a_points as "aPoints", 
          p.model_3d as "model3d",
          COALESCE(p.variants, '[]'::jsonb) as "variants",
          p.created_at
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN brands b ON p.brand_id = b.id
        ${whereClause}
        ORDER BY p.is_featured DESC, p.created_at DESC
      `;

      if (isPaginated) {
        // Strict boundary validation against integer overflow / DoS
        const page = Math.max(1, Math.min(1000000, parseInt(req.query.page, 10) || 1));
        const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 24));
        const offset = (page - 1) * limit;

        const countQuery = `SELECT COUNT(*) as total FROM products p ${whereClause}`;
        const [countRes, dataRes] = await Promise.all([
          pool.query(countQuery, values),
          pool.query(`${baseSelect} LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`, [...values, limit, offset])
        ]);

        const total = parseInt(countRes.rows[0]?.total || countRes.rows[0]?.count, 10) || 0;
        return res.json({
          data: dataRes.rows,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
          }
        });
      } else {
        const result = await pool.query(baseSelect, values);
        return res.json(result.rows);
      }
    } catch (e) {
      console.error('Erro ao buscar produtos no PostgreSQL:', e.message);
    }
  }

  // Fallback to local JSON DB
  const db = readDbJson();
  let products = db.products || [];

  if (req.query.category || req.query.categoryId) {
    const cat = String(req.query.category || req.query.categoryId).toLowerCase();
    products = products.filter(p => (p.categoryId || p.category_id || '').toLowerCase() === cat);
  }
  if (req.query.brand || req.query.brandId) {
    const br = String(req.query.brand || req.query.brandId).toLowerCase();
    products = products.filter(p => (p.brandId || p.brand_id || '').toLowerCase() === br);
  }
  if (req.query.status) {
    products = products.filter(p => (p.status || 'published') === req.query.status);
  }
  if (req.query.search) {
    const q = req.query.search.toLowerCase();
    products = products.filter(p => (p.name && p.name.toLowerCase().includes(q)) || (p.description && p.description.toLowerCase().includes(q)));
  }

  if (isPaginated) {
    const page = Math.max(1, Math.min(1000000, parseInt(req.query.page, 10) || 1));
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 24));
    const offset = (page - 1) * limit;
    const total = products.length;
    return res.json({
      data: products.slice(offset, offset + limit),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  }

  res.json(products);
});

app.get(['/api/products/:identifier', '/api/produtos/:identifier'], async (req, res) => {
  const { identifier } = req.params;
  if (!identifier) return res.status(400).json({ error: 'Identificador do produto obrigatório.' });
  const cleanId = String(identifier).trim().slice(0, 200);

  if (pool) {
    try {
      const result = await pool.query(`
        SELECT 
          p.id, p.name, p.slug, 
          p.category_id as "categoryId", 
          c.name as "categoryName",
          c.slug as "categorySlug",
          p.brand_id as "brandId", 
          b.name as "brandName",
          b.slug as "brandSlug",
          p.price::float, 
          COALESCE(p.preco_venda, p.price, 0)::float as "precoVenda",
          p.price_negotiable as "priceNegotiable", 
          p.sku,
          p.omie_code as "omieCode",
          p.omie_codigo_produto as "omieCodigoProduto",
          COALESCE(p.estoque_quantidade, 0) as "stock",
          COALESCE(p.estoque_quantidade, 0) as "estoqueQuantidade",
          p.badge, p.tags, 
          p.compatible_product_ids as "compatibleProductIds", 
          p.recommended_product_ids as "recommendedProductIds", 
          p.status, 
          p.is_featured as "isFeatured", 
          p.image, p.images, 
          p.alt_text as "altText", 
          p.description, p.specs, 
          p.attachments, 
          p.in_stock as "inStock", 
          p.video_url as "videoUrl", 
          p.custom_tabs as "customTabs", 
          p.product_type as "productType", 
          p.a_points as "aPoints", 
          p.model_3d as "model3d",
          COALESCE(p.variants, '[]'::jsonb) as "variants",
          p.created_at
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN brands b ON p.brand_id = b.id
        WHERE p.id = $1 OR p.slug = $1
        LIMIT 1
      `, [cleanId]);

      if (result.rows.length > 0) {
        return res.json(result.rows[0]);
      }
    } catch (e) {
      console.error('Erro ao buscar produto unitário no PostgreSQL:', e.message);
    }
  }

  const db = readDbJson();
  const prod = (db.products || []).find(p => p.id === cleanId || p.slug === cleanId);
  if (prod) {
    const cat = (db.categories || []).find(c => c.id === prod.categoryId);
    const br = (db.brands || []).find(b => b.id === prod.brandId);
    return res.json({
      ...prod,
      categoryName: cat?.name || null,
      categorySlug: cat?.slug || null,
      brandName: br?.name || null,
      brandSlug: br?.slug || null
    });
  }

  return res.status(404).json({ error: 'Equipamento não encontrado.' });
});

function hasAnyValidProductImage(product) {
  if (!product || typeof product !== 'object') return false;
  if (product.image && typeof product.image === 'string' && product.image.trim() !== '') return true;
  if (Array.isArray(product.images) && product.images.some(img => typeof img === 'string' && img.trim() !== '')) return true;
  if (Array.isArray(product.variants) && product.variants.some(v => v && typeof v.image === 'string' && v.image.trim() !== '')) return true;
  return false;
}

app.post('/api/products', authenticateToken, requireStaff, async (req, res) => {
  const rawSku = (req.body.sku || '').trim();
  const autoSku = extractSkuFromTitle(req.body.name);
  const finalSku = rawSku || autoSku || (req.body.omieCode || '').trim() || null;
  const stockQty = req.body.stock != null 
    ? Math.max(0, parseInt(req.body.stock, 10)) 
    : (req.body.estoqueQuantidade != null ? Math.max(0, parseInt(req.body.estoqueQuantidade, 10)) : 0);
  const inStock = stockQty > 0 || req.body.inStock !== false;

  let finalStatus = req.body.status || 'published';
  if (finalStatus === 'published' && !hasAnyValidProductImage(req.body)) {
    finalStatus = 'draft';
  }

  const newProduct = { 
    id: req.body.id || `prod_${Date.now()}`, 
    ...req.body,
    status: finalStatus,
    sku: finalSku,
    omieCode: finalSku,
    stock: stockQty,
    estoqueQuantidade: stockQty,
    inStock
  };

  if (pool) {
    try {
      await pool.query(`
        INSERT INTO products (
          id, name, slug, category_id, brand_id, price, preco_venda, 
          price_negotiable, badge, tags, compatible_product_ids, recommended_product_ids, 
          status, is_featured, image, images, alt_text, description, specs, 
          attachments, in_stock, video_url, custom_tabs, product_type, a_points,
          sku, estoque_quantidade, omie_code, variants, model_3d
        )
        VALUES (
          $1, $2, $3, $4, $5, $6::numeric, $6::numeric, 
          $7, $8, $9::jsonb, $10::jsonb, $11::jsonb, 
          $12, $13, $14, $15::jsonb, $16, $17, $18::jsonb, 
          $19::jsonb, $20, $21, $22::jsonb, $23, $24,
          $25, $26, $27, $28::jsonb, $29::jsonb
        )
        ON CONFLICT (id) DO UPDATE SET 
          name=$2, slug=$3, category_id=$4, brand_id=$5, price=$6::numeric, preco_venda=$6::numeric, 
          price_negotiable=$7, badge=$8, tags=$9::jsonb, compatible_product_ids=$10::jsonb, 
          recommended_product_ids=$11::jsonb, status=$12, is_featured=$13, image=$14, 
          images=$15::jsonb, alt_text=$16, description=$17, specs=$18::jsonb, 
          attachments=$19::jsonb, in_stock=$20, video_url=$21, custom_tabs=$22::jsonb, 
          product_type=$23, a_points=$24, sku=$25, estoque_quantidade=$26, omie_code=$27,
          variants=$28::jsonb, model_3d=$29::jsonb, updated_at=NOW()
      `, [
        newProduct.id,
        newProduct.name,
        newProduct.slug || '',
        newProduct.categoryId,
        newProduct.brandId,
        newProduct.price != null ? Number(newProduct.price) : 0,
        newProduct.priceNegotiable !== undefined ? newProduct.priceNegotiable : true,
        newProduct.badge || '',
        JSON.stringify(Array.isArray(newProduct.tags) ? newProduct.tags : (newProduct.tags ? [newProduct.tags] : [])),
        JSON.stringify(Array.isArray(newProduct.compatibleProductIds) ? newProduct.compatibleProductIds : []),
        JSON.stringify(Array.isArray(newProduct.recommendedProductIds) ? newProduct.recommendedProductIds : []),
        newProduct.status || 'published',
        !!newProduct.isFeatured,
        newProduct.image || '',
        JSON.stringify(newProduct.images || []),
        newProduct.altText || '',
        newProduct.description || '',
        JSON.stringify(newProduct.specs || []),
        JSON.stringify(newProduct.attachments || []),
        inStock,
        newProduct.videoUrl || newProduct.youtubeVideoUrl || '',
        JSON.stringify(newProduct.customTabs || []),
        newProduct.productType || 'physical',
        newProduct.aPoints != null ? parseInt(newProduct.aPoints, 10) : null,
        finalSku,
        stockQty,
        finalSku,
        JSON.stringify(Array.isArray(newProduct.variants) ? newProduct.variants : []),
        newProduct.model3d ? JSON.stringify(newProduct.model3d) : null
      ]);

      // Sincronização com Omie ERP em segundo plano (Site -> Omie)
      syncProductToOmie(pool, newProduct).catch(err => 
        console.error('[Omie Post-Create Sync Error]:', err.message)
      );

      return res.status(201).json(newProduct);
    } catch (e) {
      console.error('Erro ao salvar produto no PostgreSQL:', e.message);
      return res.status(500).json({ error: 'Falha ao salvar produto no banco de dados.' });
    }
  }
  const db = readDbJson();
  db.products.unshift(newProduct);
  writeDbJson(db);
  res.status(201).json(newProduct);
});

app.put('/api/products/reorder', authenticateToken, requireStaff, async (req, res) => {
  const { products: orderedProducts } = req.body;
  if (!Array.isArray(orderedProducts)) {
    return res.status(400).json({ error: 'Array de produtos obrigatório.' });
  }
  if (orderedProducts.length > 500) {
    return res.status(400).json({ error: 'Limite de produtos excedido.' });
  }
  const db = readDbJson();
  const prodMap = new Map((db.products || []).map(p => [p.id, p]));
  const reordered = [];
  orderedProducts.forEach((p) => {
    const existing = prodMap.get(p.id) || p;
    reordered.push(existing);
    prodMap.delete(p.id);
  });
  prodMap.forEach(p => reordered.push(p));
  db.products = reordered;
  writeDbJson(db);
  res.json({ success: true, count: orderedProducts.length });
});

app.put('/api/products/:id', authenticateToken, requireStaff, async (req, res) => {
  const rawSku = (req.body.sku || '').trim();
  const autoSku = extractSkuFromTitle(req.body.name);
  const finalSku = rawSku || autoSku || (req.body.omieCode || '').trim() || null;
  const stockQty = req.body.stock != null 
    ? Math.max(0, parseInt(req.body.stock, 10)) 
    : (req.body.estoqueQuantidade != null ? Math.max(0, parseInt(req.body.estoqueQuantidade, 10)) : 0);
  const inStock = stockQty > 0 || req.body.inStock !== false;

  let finalStatus = req.body.status || 'published';
  if (finalStatus === 'published' && !hasAnyValidProductImage(req.body)) {
    finalStatus = 'draft';
  }

  const updatedProduct = { 
    id: req.params.id, 
    ...req.body,
    status: finalStatus,
    sku: finalSku,
    omieCode: finalSku,
    stock: stockQty,
    estoqueQuantidade: stockQty,
    inStock
  };

  if (pool) {
    try {
      await pool.query(`
        UPDATE products SET 
          name=$1, slug=$2, category_id=$3, brand_id=$4, price=$5::numeric, 
          preco_venda=COALESCE(NULLIF($5::numeric, 0::numeric), preco_venda, $5::numeric), 
          price_negotiable=$6, badge=$7, tags=$8::jsonb, compatible_product_ids=$9::jsonb, 
          recommended_product_ids=$10::jsonb, status=$11, is_featured=$12, image=$13, 
          images=$14::jsonb, alt_text=$15, description=$16, specs=$17::jsonb, 
          attachments=$18::jsonb, in_stock=$19, video_url=$20, custom_tabs=$21::jsonb, 
          product_type=$22, a_points=$23, sku=$24, estoque_quantidade=$25,
          omie_code=COALESCE(NULLIF($26, ''), omie_code),
          variants=$27::jsonb,
          model_3d=$28::jsonb,
          updated_at=NOW()
        WHERE id=$29
      `, [
        updatedProduct.name,
        updatedProduct.slug || '',
        updatedProduct.categoryId,
        updatedProduct.brandId,
        updatedProduct.price != null ? Number(updatedProduct.price) : 0,
        updatedProduct.priceNegotiable !== undefined ? updatedProduct.priceNegotiable : true,
        updatedProduct.badge || '',
        JSON.stringify(Array.isArray(updatedProduct.tags) ? updatedProduct.tags : (updatedProduct.tags ? [updatedProduct.tags] : [])),
        JSON.stringify(Array.isArray(updatedProduct.compatibleProductIds) ? updatedProduct.compatibleProductIds : []),
        JSON.stringify(Array.isArray(updatedProduct.recommendedProductIds) ? updatedProduct.recommendedProductIds : []),
        updatedProduct.status || 'published',
        !!updatedProduct.isFeatured,
        updatedProduct.image || '',
        JSON.stringify(updatedProduct.images || []),
        updatedProduct.altText || '',
        updatedProduct.description || '',
        JSON.stringify(updatedProduct.specs || []),
        JSON.stringify(updatedProduct.attachments || []),
        inStock,
        updatedProduct.videoUrl || updatedProduct.youtubeVideoUrl || '',
        JSON.stringify(updatedProduct.customTabs || []),
        updatedProduct.productType || 'physical',
        updatedProduct.aPoints != null ? parseInt(updatedProduct.aPoints, 10) : null,
        finalSku,
        stockQty,
        finalSku,
        JSON.stringify(Array.isArray(updatedProduct.variants) ? updatedProduct.variants : []),
        updatedProduct.model3d ? JSON.stringify(updatedProduct.model3d) : null,
        req.params.id
      ]);

      // Sincronização com Omie ERP em segundo plano (Site -> Omie)
      syncProductToOmie(pool, updatedProduct).catch(err => 
        console.error('[Omie Post-Update Sync Error]:', err.message)
      );

      return res.json(updatedProduct);
    } catch (e) {
      console.error('Erro ao atualizar produto no PostgreSQL:', e.message);
      return res.status(500).json({ error: 'Falha ao atualizar produto no banco de dados.' });
    }
  }
  const db = readDbJson();
  const index = db.products.findIndex((p) => p.id === req.params.id);
  if (index !== -1) {
    db.products[index] = { ...db.products[index], ...updatedProduct };
    writeDbJson(db);
    return res.json(db.products[index]);
  }
  res.status(404).json({ error: 'Produto não encontrado' });
});

app.delete('/api/products/:id', authenticateToken, requireStaff, async (req, res) => {
  const productId = req.params.id;
  let productToDelete = null;

  if (pool) {
    try {
      const selectRes = await pool.query('SELECT * FROM products WHERE id = $1', [productId]);
      if (selectRes.rows && selectRes.rows.length > 0) {
        productToDelete = selectRes.rows[0];
      }
    } catch (e) {
      console.error('[Delete Product DB Select Error]:', e.message);
    }
  }

  if (!productToDelete) {
    const db = readDbJson();
    productToDelete = (db.products || []).find((p) => p.id === productId);
  }

  // 1. Exclui imediatamente do PostgreSQL
  if (pool) {
    try {
      await pool.query('DELETE FROM products WHERE id = $1', [productId]);
      console.log(`[Product Delete] Produto ${productId} excluído com sucesso do PostgreSQL.`);
    } catch (dbErr) {
      console.error('[Product Delete DB Error]:', dbErr.message);
      return res.status(500).json({ error: 'Falha ao excluir produto do banco de dados.', details: dbErr.message });
    }
  }

  // 2. Sincroniza exclusão no athena-db.json local
  try {
    const db = readDbJson();
    if (db && Array.isArray(db.products)) {
      db.products = db.products.filter((p) => p.id !== productId);
      writeDbJson(db);
    }
  } catch (jsonErr) {
    console.warn('[Product Delete JSON Sync Notice]:', jsonErr.message);
  }

  // 3. Responde imediatamente ao cliente (evita timeout na rede / Render)
  res.json({ success: true, id: productId });

  // 4. Limpeza de imagens e anexos em segundo plano (não bloqueia o usuário)
  if (productToDelete) {
    const imagesToDelete = [];
    if (productToDelete.image) imagesToDelete.push(productToDelete.image);
    if (Array.isArray(productToDelete.images)) {
      productToDelete.images.forEach(img => {
        if (img && typeof img === 'string') imagesToDelete.push(img);
      });
    }
    if (Array.isArray(productToDelete.attachments)) {
      productToDelete.attachments.forEach(att => {
        if (att && att.url && typeof att.url === 'string') imagesToDelete.push(att.url);
      });
    }

    const uniqueUrls = [...new Set(imagesToDelete)].filter(u => u && typeof u === 'string');

    if (uniqueUrls.length > 0) {
      setImmediate(async () => {
        for (const url of uniqueUrls) {
          try {
            // Verifica se outro produto ainda utiliza esta imagem antes de deletar do R2
            if (pool) {
              const inUse = await pool.query(
                'SELECT 1 FROM products WHERE image = $1 OR images::text LIKE $2 LIMIT 1',
                [url, `%"${url}"%`]
              );
              if (inUse.rows.length > 0) {
                console.log(`[Storage Delete] Imagem mantida pois ainda está em uso por outro produto: ${url}`);
                continue;
              }
            }

            if (isR2Configured && (url.includes('.r2.dev') || url.includes('.r2.cloudflarestorage.com') || url.includes('athenaconsultoria.com.br'))) {
              await deleteFromR2(url);
              console.log(`[Product Delete] Imagem removida do Cloudflare R2: ${url}`);
            } else if (url.includes('cloudinary.com')) {
              try {
                const parts = url.split('/');
                const fileWithExt = parts.slice(-2).join('/');
                const publicId = fileWithExt.replace(/\.[^/.]+$/, '');
                await cloudinary.uploader.destroy(publicId);
                console.log(`[Product Delete] Imagem removida do Cloudinary: ${publicId}`);
              } catch (cErr) {
                console.warn('[Cloudinary Delete Warning]:', cErr.message);
              }
            }
          } catch (err) {
            console.warn(`[Storage Delete Warning] Falha ao excluir ${url}:`, err.message);
          }
        }
      });
    }
  }
});

// -------------------------------------------------------------
// CENTRALIZED GLOBAL ERROR HANDLER & CRITICAL FAILURE ALERTING
// -------------------------------------------------------------
app.use((err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;
  const clientIp = getClientIp(req);

  console.error(`[CRITICAL_API_ERROR] ${req.method} ${req.originalUrl} - Status ${statusCode}:`, err);

  if (statusCode >= 500) {
    sendCriticalErrorAlertEmail(err, req, clientIp);
  }

  return res.status(statusCode).json({
    error: statusCode >= 500 
      ? 'Ocorreu um erro interno nos nossos servidores. Nossos sistemas registraram o ocorrido e o suporte técnico já foi notificado.' 
      : (err.message || 'Erro ao processar requisição.')
  });
});

if (require.main === module) {
  const { startWebhookWorker } = require('./services/webhookWorker');
  startWebhookWorker(5000);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Athena API Backend rodando em http://0.0.0.0:${PORT}`);
    console.log(`Swagger API Docs protegida em: http://localhost:${PORT}/api-docs`);
  });
}

module.exports = {
  app,
  validatePasswordStandard,
  evaluateCoupon,
  isOriginAllowed,
  requireAdmin,
  requireStaff,
  getClientIp,
  isInfrastructureOrPrivateIp
};

