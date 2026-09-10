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
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const axios = require('axios');

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
    connectionTimeout: 20000,
    greetingTimeout: 15000,
    socketTimeout: 30000,
    tls: {
      rejectUnauthorized: false
    }
  });
  console.log('Google SMTP (Gmail Port 587 IPv4) configurado com sucesso para:', SMTP_USER, '| Remetente:', SMTP_FROM);
} else {
  console.log('Google SMTP em modo log (Defina GMAIL_APP_PASSWORD no .env para envio real).');
}

async function sendPasswordResetEmail(toEmail, resetCode, userName = 'Cliente') {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 40px 20px; text-align: center;">
      <div style="max-width: 500px; margin: 0 auto; background-color: #1e293b; border-radius: 20px; border: 1px solid #334155; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
        <div style="margin-bottom: 20px;">
          <h1 style="color: #f59e0b; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">ATHENA</h1>
          <p style="color: #94a3b8; font-size: 11px; margin: 4px 0 0 0; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">Soluções Automotivas</p>
        </div>
        <h2 style="color: #ffffff; font-size: 18px; margin-bottom: 12px;">Recuperação de Senha</h2>
        <p style="color: #cbd5e1; font-size: 13px; line-height: 1.5; margin-bottom: 24px;">
          Olá, <strong>${userName}</strong>! Recebemos uma solicitação para redefinir a senha da sua conta Athena. Utilize o código de verificação abaixo:
        </p>
        <div style="background-color: #0f172a; border: 2px dashed #f59e0b; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
          <span style="font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #fbbf24;">${resetCode}</span>
        </div>
        <p style="color: #94a3b8; font-size: 11px; margin-bottom: 24px;">
          Este código é válido por <strong>15 minutos</strong>. Se você não solicitou esta redefinição, ignore este e-mail.
        </p>
        <hr style="border: none; border-top: 1px solid #334155; margin: 24px 0;" />
        <p style="color: #64748b; font-size: 10px; margin: 0;">
          Athena Soluções Automotivas • Brasília - DF • (61) 98348-5671
        </p>
      </div>
    </div>
  `;

  if (mailTransporter) {
    try {
      await mailTransporter.sendMail({
        from: SMTP_FROM,
        to: toEmail,
        replyTo: 'contato@athenaconsultoria.com.br',
        subject: 'Código de Recuperação de Senha — Athena Soluções Automotivas',
        html: htmlContent
      });
      return { success: true, method: 'smtp' };
    } catch (err) {
      console.error('Erro no envio SMTP:', err.message);
    }
  }

  console.log(`[DEBUG CODIGO DE RECUPERACAO] E-mail: ${toEmail} | Codigo: ${resetCode}`);
  return { success: true, method: 'log', code: resetCode };
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
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 40px 20px; text-align: center;">
      <div style="max-width: 500px; margin: 0 auto; background-color: #1e293b; border-radius: 20px; border: 1px solid #334155; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
        <div style="margin-bottom: 20px;">
          <h1 style="color: #f59e0b; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">ATHENA</h1>
          <p style="color: #94a3b8; font-size: 11px; margin: 4px 0 0 0; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">Soluções Automotivas</p>
        </div>
        <div style="background-color: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 9999px; padding: 6px 14px; margin: 0 auto 16px auto; display: inline-block;">
          <span style="color: #fbbf24; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Verificação de Segurança</span>
        </div>
        <h2 style="color: #ffffff; font-size: 18px; margin-bottom: 12px; font-weight: 700;">Confirme seu E-mail</h2>
        <p style="color: #cbd5e1; font-size: 13px; line-height: 1.5; margin-bottom: 24px;">
          Olá, <strong>${userName}</strong>! Para validar suas solicitações de cotações, orçamentos e compras de equipamentos no portal Athena, utilize o código alfanumérico abaixo:
        </p>
        <div style="background-color: #0f172a; border: 2px dashed #f59e0b; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
          <span style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #fbbf24;">${code}</span>
        </div>
        <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin-bottom: 20px;">
          Este código de segurança é válido por <strong>30 minutos</strong> e deve ser informado na tela de verificação do site.
        </p>
        <hr style="border: none; border-top: 1px solid #334155; margin: 20px 0;" />
        <p style="color: #64748b; font-size: 10px; margin: 0;">
          Athena Soluções Automotivas • Brasília - DF • (61) 98348-5671
        </p>
      </div>
    </div>
  `;

  if (mailTransporter) {
    try {
      await mailTransporter.sendMail({
        from: SMTP_FROM,
        to: toEmail,
        replyTo: 'contato@athenaconsultoria.com.br',
        subject: `Código de Verificação Athena: ${code}`,
        html: htmlContent
      });
      return { success: true, method: 'smtp' };
    } catch (err) {
      console.error('Erro no envio SMTP de verificação:', err.message);
    }
  }

  console.log(`[VERIFICACAO EMAIL ATHENA] E-mail: ${toEmail} | Codigo: ${code} (Validade: 30 minutos)`);
  return { success: true, method: 'log', code };
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
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Permissão negada. Apenas administradores podem executar esta ação.' });
  }
  next();
}

// Require Staff / Internal Collaborator Role Middleware (Admin, Vendedor, Editor)
function requireStaff(req, res, next) {
  if (!req.user || !['admin', 'vendedor', 'editor', 'edicao'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Permissão negada. Acesso restrito à equipe interna.' });
  }
  next();
}

// Enable trust proxy for Render / Cloudflare / Heroku load balancers
app.set('trust proxy', 1);

// -------------------------------------------------------------
// OWASP SECURITY HARDENING & RATE LIMITING MIDDLEWARES
// -------------------------------------------------------------
app.use(helmet({
  contentSecurityPolicy: false, // Compatible with Cloudinary CDN & CORS
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// General API Rate Limiter against DoS Flooding Attacks
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requests per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: { error: 'Muitas requisições originadas deste IP. Por favor, aguarde alguns minutos.' }
});

// Strict Rate Limiter against Login Brute-Force Password Attacks
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 failed login attempts per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: { error: 'Muitas tentativas de login incorretas. Acesso bloqueado por 15 minutos por segurança contra ataques de força bruta.' }
});

app.use('/api/', apiLimiter);
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Athena Soluções Automotivas — API RESTful',
    version: '2.0.0',
    description: 'Documentação técnica oficial e interativa dos serviços de backend da Athena Soluções Automotivas. Inclui gestão de equipamentos, categorias, marcas, autenticação e armazenamento de mídia em alta performance com Cloudflare R2 e conversão automática para WebP.',
    contact: {
      name: 'Suporte Técnico Athena',
      email: 'athena.consultoria.automotiva@gmail.com',
      url: 'https://www.athenaconsultoria.com.br'
    }
  },
  servers: [
    { url: 'https://athena-backend-hu1m.onrender.com', description: 'Servidor de Produção (Render)' },
    { url: 'http://localhost:3001', description: 'Servidor Local (Desenvolvimento)' }
  ],
  tags: [
    { name: 'Equipamentos (Produtos)', description: 'Operações CRUD para gerenciamento do catálogo de produtos e máquinas.' },
    { name: 'Categorias', description: 'Gestão das linhas de produtos (Elevadores, Scanners, Alinhadores, etc).' },
    { name: 'Marcas Parceiras', description: 'Fabricantes e parceiros comerciais (Mahovi, Stärkx, Delta, etc).' },
    { name: 'Mídia & Cloudflare R2', description: 'Upload com conversão WebP instantânea via Sharp e exclusão física de objetos no R2.' },
    { name: 'Autenticação & Usuários', description: 'Controle de acesso, login de funcionários, perfis e redefinição de senhas.' }
  ],
  paths: {
    '/api/products': {
      get: {
        tags: ['Equipamentos (Produtos)'],
        summary: 'Listar todos os equipamentos do catálogo',
        description: 'Retorna a lista completa de produtos cadastrados no banco de dados PostgreSQL.',
        responses: {
          200: {
            description: 'Lista de produtos retornada com sucesso.',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Product' }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Equipamentos (Produtos)'],
        summary: 'Cadastrar novo equipamento',
        description: 'Cria um novo produto no banco de dados. Permite vincular imagens em WebP, especificações e manuais em PDF.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProductInput' }
            }
          }
        },
        responses: {
          201: {
            description: 'Equipamento cadastrado com sucesso.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Product' }
              }
            }
          },
          400: { description: 'Dados incompletos ou inválidos.' }
        }
      }
    },
    '/api/products/{id}': {
      put: {
        tags: ['Equipamentos (Produtos)'],
        summary: 'Atualizar equipamento existente',
        parameters: [
          { name: 'id', in: 'path', required: true, description: 'ID do produto (ex: prod_wolfcar_w1058)', schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProductInput' }
            }
          }
        },
        responses: {
          200: { description: 'Produto atualizado com sucesso.', content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } } },
          404: { description: 'Produto não encontrado.' }
        }
      },
      delete: {
        tags: ['Equipamentos (Produtos)'],
        summary: 'Excluir equipamento permanentemente',
        parameters: [
          { name: 'id', in: 'path', required: true, description: 'ID do produto', schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Produto excluído do banco de dados.', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, id: { type: 'string' } } } } } },
          404: { description: 'Produto não encontrado.' }
        }
      }
    },
    '/api/categories': {
      get: {
        tags: ['Categorias'],
        summary: 'Listar todas as categorias',
        responses: {
          200: {
            description: 'Lista de categorias retornada com sucesso.',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Category' }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Categorias'],
        summary: 'Criar nova categoria',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Category' }
            }
          }
        },
        responses: {
          201: { description: 'Categoria criada com sucesso.' }
        }
      }
    },
    '/api/brands': {
      get: {
        tags: ['Marcas Parceiras'],
        summary: 'Listar marcas de fabricantes',
        responses: {
          200: {
            description: 'Lista de marcas retornada com sucesso.',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Brand' }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Marcas Parceiras'],
        summary: 'Cadastrar nova marca parceira',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Brand' }
            }
          }
        },
        responses: {
          201: { description: 'Marca cadastrada com sucesso.' }
        }
      }
    },
    '/api/upload': {
      post: {
        tags: ['Mídia & Cloudflare R2'],
        summary: 'Upload de mídia (Conversão automática para WebP)',
        description: 'Recebe uma imagem em base64 ou binário, redimensiona via Sharp (máx 1200x1200px), converte para WebP (82% qualidade) e envia diretamente para o Cloudflare R2 com link de CDN global.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['file'],
                properties: {
                  file: { type: 'string', description: 'String base64 da imagem ou documento PDF' },
                  folder: { type: 'string', default: 'produtos', description: 'Subpasta no bucket R2' },
                  filename: { type: 'string', description: 'Nome original do arquivo para formação da URL' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Upload realizado com sucesso.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UploadResponse' }
              }
            }
          },
          400: { description: 'Nenhum arquivo enviado.' },
          500: { description: 'Erro interno no upload.' }
        }
      }
    },
    '/api/upload/delete': {
      post: {
        tags: ['Mídia & Cloudflare R2'],
        summary: 'Excluir arquivo físico do Cloudflare R2',
        description: 'Remove fisicamente o objeto do bucket no Cloudflare R2 a partir de sua URL pública.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['url'],
                properties: {
                  url: { type: 'string', description: 'URL pública completa do arquivo no R2' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Arquivo excluído do bucket.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    provider: { type: 'string', example: 'cloudflare-r2' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/auth/login': {
      post: {
        tags: ['Autenticação & Usuários'],
        summary: 'Autenticação de Funcionário (Login)',
        description: 'Valida as credenciais de e-mail e senha. Protegido por rate limiting estrito contra ataques de força bruta.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'administracao@athenaconsultoria.com.br' },
                  password: { type: 'string', example: 'Athena16/10*' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Autenticado com sucesso.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/components/schemas/User' }
                  }
                }
              }
            }
          },
          401: { description: 'Credenciais inválidas.' }
        }
      }
    },
    '/api/users': {
      get: {
        tags: ['Autenticação & Usuários'],
        summary: 'Listar usuários e colaboradores (Restrito a Administradores)',
        responses: {
          200: {
            description: 'Lista de colaboradores retornada com sucesso.',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/User' }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Autenticação & Usuários'],
        summary: 'Cadastrar novo colaborador',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password', 'role'],
                properties: {
                  name: { type: 'string', example: 'Vendedor João' },
                  email: { type: 'string', example: 'joao@athenaconsultoria.com.br' },
                  password: { type: 'string', example: 'SenhaForte2026!' },
                  role: { type: 'string', enum: ['admin', 'vendedor'], example: 'vendedor' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Colaborador cadastrado com sucesso.' }
        }
      }
    },
    '/api/users/{id}': {
      delete: {
        tags: ['Autenticação & Usuários'],
        summary: 'Revogar acesso / Excluir funcionário',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Acesso do usuário revogado com sucesso.' }
        }
      }
    }
  },
  components: {
    schemas: {
      Product: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'prod_wolfcar_w1058' },
          name: { type: 'string', example: 'Conjunto Modular de Armários 4915mm Wolfcar' },
          slug: { type: 'string', example: 'conjunto-modular-de-armarios-4915mm-wolfcar' },
          categoryId: { type: 'string', example: 'cat_ferramentas' },
          brandId: { type: 'string', example: 'brand_wolfcar' },
          price: { type: 'number', example: 0 },
          priceNegotiable: { type: 'boolean', example: true },
          badge: { type: 'string', example: 'Linha Pesada' },
          status: { type: 'string', enum: ['published', 'draft'], example: 'published' },
          isFeatured: { type: 'boolean', example: true },
          image: { type: 'string', example: 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/w1058-a1b2.webp' },
          images: { type: 'array', items: { type: 'string' } },
          altText: { type: 'string', example: 'Conjunto Modular Wolfcar Athena Soluções Automotivas' },
          description: { type: 'string', example: 'Estrutura reforçada em aço carbono com pintura eletrostática.' },
          specs: { type: 'array', items: { type: 'string' }, example: ['Comprimento Total: 4.915 mm', 'Garantia: 12 meses'] },
          attachments: { type: 'array', items: { type: 'object' } },
          inStock: { type: 'boolean', example: true }
        }
      },
      ProductInput: {
        type: 'object',
        required: ['name', 'categoryId', 'brandId'],
        properties: {
          name: { type: 'string', example: 'Elevador Hidráulico 4000kg Mahovi' },
          slug: { type: 'string', example: 'elevador-hidraulico-4000kg-mahovi' },
          categoryId: { type: 'string', example: 'cat_elevadores' },
          brandId: { type: 'string', example: 'brand_mahovi' },
          price: { type: 'number', example: 18500.00 },
          priceNegotiable: { type: 'boolean', example: false },
          badge: { type: 'string', example: 'Pronta Entrega' },
          status: { type: 'string', enum: ['published', 'draft'], example: 'published' },
          isFeatured: { type: 'boolean', example: true },
          image: { type: 'string', example: 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/elevador-4000kg.webp' },
          images: { type: 'array', items: { type: 'string' } },
          description: { type: 'string' },
          specs: { type: 'array', items: { type: 'string' } },
          attachments: { type: 'array', items: { type: 'object' } }
        }
      },
      Category: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'cat_elevadores' },
          name: { type: 'string', example: 'Elevadores' },
          slug: { type: 'string', example: 'elevadores' },
          description: { type: 'string', example: 'Elevadores hidráulicos de 2 colunas e tesoura.' },
          icon: { type: 'string', example: 'Layers' },
          order: { type: 'integer', example: 1 }
        }
      },
      Brand: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'brand_mahovi' },
          name: { type: 'string', example: 'Mahovi' },
          slug: { type: 'string', example: 'mahovi' },
          description: { type: 'string', example: 'Líder em elevadores automotivos e alinhadores 3D.' },
          logo: { type: 'string', example: 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/marcas/mahovi-logo.webp' },
          websiteUrl: { type: 'string', example: 'https://www.mahovi.com.br' },
          order: { type: 'integer', example: 1 }
        }
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'user_admin_default' },
          name: { type: 'string', example: 'Administrador Geral' },
          email: { type: 'string', example: 'administracao@athenaconsultoria.com.br' },
          role: { type: 'string', enum: ['admin', 'vendedor'], example: 'admin' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      UploadResponse: {
        type: 'object',
        properties: {
          url: { type: 'string', example: 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/scanner-x10.webp' },
          publicId: { type: 'string', example: 'produtos/scanner-x10-3f9a.webp' },
          format: { type: 'string', example: 'webp' },
          bytes: { type: 'integer', example: 184520 },
          provider: { type: 'string', example: 'cloudflare-r2' }
        }
      }
    }
  }
};

app.use('/api-docs', swaggerAuth, swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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
        CREATE TABLE IF NOT EXISTS categories (
          id VARCHAR(100) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255),
          description TEXT,
          icon VARCHAR(100),
          "order" INT DEFAULT 0
        );

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

        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS document VARCHAR(50);
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS address JSONB;
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS a_points INTEGER DEFAULT 0;
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT FALSE;
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
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

        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS omie_product_id BIGINT;
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS omie_code VARCHAR(100);
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS omie_last_sync TIMESTAMP;

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
      `);

      // Seed starter loyalty rewards if table is empty
      try {
        const rewardCheck = await pool.query('SELECT COUNT(*) FROM loyalty_rewards');
        if (parseInt(rewardCheck.rows[0].count, 10) === 0) {
          await pool.query(`
            INSERT INTO loyalty_rewards (id, name, description, category, points_cost, cash_cost, image, "order") VALUES
            ('rw_espuma_cera', 'Espuma Aplicadora de Cera 100mm', 'Espuma macia de alta densidade para aplicação uniforme de ceras e selantes.', 'consumables', 50, 0, 'https://images.athenaconsultoria.com.br/produtos/espuma-aplicadora.webp', 1),
            ('rw_toalha_microfibra', 'Toalha de Microfibra Especial 40x40cm', 'Toalha de alta gramatura anti-risco para secagem e acabamento automotivo.', 'accessories', 100, 0, 'https://images.athenaconsultoria.com.br/produtos/toalha-microfibra.webp', 2),
            ('rw_luva_microfibra', 'Luva de Lavagem Automotiva em Microfibra', 'Luva anatômica de microfibra macia com punho elástico para lavagem segura.', 'accessories', 150, 0, 'https://images.athenaconsultoria.com.br/produtos/luva-lavagem.webp', 3),
            ('rw_kit_soquetes', 'Jogo de Soquetes e Bits Especiais 10 Peças', 'Conjunto compacto de ferramentas em cromo-vanádio para bancada e oficina.', 'tools', 300, 0, 'https://images.athenaconsultoria.com.br/produtos/jogo-soquetes.webp', 4),
            ('rw_cupom_300', 'Voucher R$ 300 em Novos Equipamentos', 'Desconto direto de R$ 300 na aquisição de elevadores, desmontadoras ou scanners.', 'vouchers', 600, 0, 'https://images.athenaconsultoria.com.br/produtos/voucher-300.webp', 5),
            ('rw_cupom_600', 'Voucher R$ 600 em Equipamentos Premium', 'Desconto direto de R$ 600 na compra de alinhadores 3D ou recicladoras de ar condicionado.', 'vouchers', 1200, 0, 'https://images.athenaconsultoria.com.br/produtos/voucher-600.webp', 6);
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
          ('brand_mahovi', 'Mahovi', 'mahovi', 'Líder nacional em elevadores automotivos, alinhadores 3D e desmontadoras.', 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=200&auto=format&fit=crop&q=80', 'https://mahovi.com.br', 1),
          ('brand_delta', 'Delta Ferramentas', 'delta-ferramentas', 'Referência em equipamentos de teste, canetas de polaridade e teste de baterias.', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200&auto=format&fit=crop&q=80', 'https://deltaferramentas.com.br', 2),
          ('brand_starkx', 'Stärkx', 'starkx', 'Scanners de diagnóstico profissional multimarca e testadores com IA Thinkcar.', 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=200&auto=format&fit=crop&q=80', 'https://starkx.com.br', 3),
          ('brand_wolfcar', 'Wolfcar', 'wolfcar', 'Móveis modulares premium, bancadas em inox e armários para centro automotivo.', 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=200&auto=format&fit=crop&q=80', 'https://wolfcar.com.br', 4),
          ('brand_sigmatools', 'Sigma Tools', 'sigma-tools', 'Chaves de impacto pneumáticas, soquetes especiais em Cr-Mo e carrinhos ergonômicos.', 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=200&auto=format&fit=crop&q=80', 'https://sigmatools.com.br', 5);
        `);
      }

      const prodCheck = await pool.query('SELECT COUNT(*) FROM products');
      if (parseInt(prodCheck.rows[0].count, 10) === 0 && fs.existsSync(DB_PATH)) {
        try {
          const dbData = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
          if (dbData.products && Array.isArray(dbData.products) && dbData.products.length > 0) {
            for (const prod of dbData.products) {
              await pool.query(`
                INSERT INTO products (id, name, slug, category_id, brand_id, price, price_negotiable, badge, status, image, alt_text, description, specs, attachments, in_stock)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
                ON CONFLICT (id) DO UPDATE SET 
                  name=$2, slug=$3, category_id=$4, brand_id=$5, price=$6, price_negotiable=$7, badge=$8, status=$9, image=$10, alt_text=$11, description=$12, specs=$13, attachments=$14, in_stock=$15
              `, [
                prod.id,
                prod.name,
                prod.slug || '',
                prod.categoryId,
                prod.brandId,
                prod.price || 0,
                prod.priceNegotiable !== undefined ? prod.priceNegotiable : true,
                prod.badge || '',
                prod.status || 'published',
                prod.image || '',
                prod.altText || '',
                prod.description || '',
                JSON.stringify(prod.specs || []),
                JSON.stringify(prod.attachments || []),
                prod.inStock !== undefined ? prod.inStock : true
              ]);
            }
            console.log(`Seeded ${dbData.products.length} produtos do athena-db.json no PostgreSQL!`);
          }
        } catch (seedErr) {
          console.error('Erro ao sincronizar produtos do JSON para PostgreSQL:', seedErr);
        }
      }

      // Migrate existing image URLs in PostgreSQL to custom CDN domain
      try {
        await pool.query(`
          UPDATE products 
          SET image = REPLACE(image, 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev', 'https://images.athenaconsultoria.com.br')
          WHERE image LIKE '%pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev%';
        `);
        await pool.query(`
          UPDATE brands 
          SET logo = REPLACE(logo, 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev', 'https://images.athenaconsultoria.com.br')
          WHERE logo LIKE '%pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev%';
        `);
        console.log('[CDN Migration] Imagens migradas com sucesso para https://images.athenaconsultoria.com.br no PostgreSQL!');
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
    return data;
  } catch (e) {
    return { users: [], categories: [], brands: [], products: [], coupons: [], orders: [], aPointsTransactions: [] };
  }
}

function writeDbJson(data) {
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

  return {
    receiptNotificationEmail: receiptEmail || defaultAdmin,
    loyaltyNotificationEmail: loyaltyEmail,
    purchaseNotificationEmail: purchaseEmail,
    emailNotificationsEnabled: enabledStr !== 'false',
    sendCustomerCopy: sendCustomerCopyStr !== 'false'
  };
}

async function sendGenericNotificationEmail({ to, subject, htmlContent, replyTo }) {
  const recipients = normalizeEmailList(to);
  if (!recipients) {
    console.log('[EMAIL] Nenhum destinatário válido informado para:', subject);
    return { success: false, reason: 'no_recipient' };
  }

  if (mailTransporter) {
    try {
      const info = await mailTransporter.sendMail({
        from: SMTP_FROM,
        to: recipients,
        replyTo: replyTo || 'contato@athenaconsultoria.com.br',
        subject,
        html: htmlContent
      });
      console.log(`[EMAIL ENVIADO COM SUCESSO] Para: ${recipients} | Assunto: ${subject} | ID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error(`[EMAIL ERRO] Falha no envio para ${recipients}:`, err.message);
      return { success: false, error: err.message };
    }
  }

  console.log(`[DEBUG EMAIL LOG] Para: ${recipients} | Assunto: ${subject}`);
  return { success: true, method: 'log' };
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
    const adminHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b1120; color: #f8fafc; padding: 40px 16px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 20px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 20px 35px -5px rgba(0, 0, 0, 0.5);">
          
          <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 32px 32px 24px 32px; border-bottom: 1px solid #334155; text-align: center;">
            <span style="display: inline-block; padding: 5px 14px; border-radius: 9999px; background-color: #d97706; color: #ffffff; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px;">
              Resgate de Fidelidade A-Points
            </span>
            <h1 style="color: #f59e0b; margin: 0 0 6px 0; font-size: 26px; font-weight: 900; letter-spacing: -0.5px;">ATHENA</h1>
            <p style="color: #94a3b8; font-size: 11px; margin: 0; text-transform: uppercase; font-weight: 700; letter-spacing: 2px;">Soluções Automotivas • Notificação de Resgate</p>
          </div>

          <div style="padding: 32px;">
            <div style="background-color: #0f172a; border-radius: 14px; border-left: 4px solid #f59e0b; padding: 18px 20px; margin-bottom: 24px;">
              <p style="margin: 0; color: #f8fafc; font-size: 14px; font-weight: 600; line-height: 1.5;">
                Novo resgate de recompensa efetuado no site por <strong>${customerName}</strong>.
              </p>
              <p style="margin: 6px 0 0 0; color: #94a3b8; font-size: 12px;">
                Protocolo da Operação: <code style="color: #fbbf24; background-color: #1e293b; padding: 2px 6px; border-radius: 6px;">${txId}</code>
              </p>
            </div>

            <table style="width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 20px; font-size: 13px;">
              <tbody>
                <tr style="background-color: #0f172a;">
                  <td style="padding: 12px 16px; color: #94a3b8; font-weight: 600; border-top-left-radius: 10px; border-bottom: 1px solid #334155; width: 40%;">Item Resgatado</td>
                  <td style="padding: 12px 16px; color: #fbbf24; font-weight: 800; border-top-right-radius: 10px; border-bottom: 1px solid #334155;">${reward.name}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; color: #94a3b8; font-weight: 600; border-bottom: 1px solid #334155;">Custo em Pontos</td>
                  <td style="padding: 12px 16px; color: #ef4444; font-weight: 800; border-bottom: 1px solid #334155;">- ${reward.points_cost} A-Points</td>
                </tr>
                <tr style="background-color: #0f172a;">
                  <td style="padding: 12px 16px; color: #94a3b8; font-weight: 600; border-bottom: 1px solid #334155;">Saldo Anterior</td>
                  <td style="padding: 12px 16px; color: #cbd5e1; font-weight: 600; border-bottom: 1px solid #334155;">${previousPoints} pontos</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; color: #94a3b8; font-weight: 600; border-bottom: 1px solid #334155;">Novo Saldo Disponível</td>
                  <td style="padding: 12px 16px; color: #10b981; font-weight: 800; border-bottom: 1px solid #334155;">${remainingPoints} pontos</td>
                </tr>
                <tr style="background-color: #0f172a;">
                  <td style="padding: 12px 16px; color: #94a3b8; font-weight: 600; border-bottom: 1px solid #334155;">Cliente</td>
                  <td style="padding: 12px 16px; color: #ffffff; font-weight: 700; border-bottom: 1px solid #334155;">${customerName}</td>
                </tr>
                ${customerCpfCnpj ? `
                <tr>
                  <td style="padding: 12px 16px; color: #94a3b8; font-weight: 600; border-bottom: 1px solid #334155;">CPF / CNPJ</td>
                  <td style="padding: 12px 16px; color: #cbd5e1; font-family: monospace; border-bottom: 1px solid #334155;">${customerCpfCnpj}</td>
                </tr>` : ''}
                ${customerEmail ? `
                <tr style="background-color: #0f172a;">
                  <td style="padding: 12px 16px; color: #94a3b8; font-weight: 600; border-bottom: 1px solid #334155;">E-mail do Cliente</td>
                  <td style="padding: 12px 16px; color: #cbd5e1; border-bottom: 1px solid #334155;">${customerEmail}</td>
                </tr>` : ''}
                ${customerPhone ? `
                <tr>
                  <td style="padding: 12px 16px; color: #94a3b8; font-weight: 600; border-bottom: 1px solid #334155;">Telefone / WhatsApp</td>
                  <td style="padding: 12px 16px; color: #cbd5e1; border-bottom: 1px solid #334155;">${customerPhone}</td>
                </tr>` : ''}
                <tr style="background-color: #0f172a;">
                  <td style="padding: 12px 16px; color: #94a3b8; font-weight: 600; border-bottom-left-radius: 10px;">Data e Horário</td>
                  <td style="padding: 12px 16px; color: #94a3b8; border-bottom-right-radius: 10px;">${formattedDate} (Brasília)</td>
                </tr>
              </tbody>
            </table>

            {/* DADOS DE ENTREGA / DESPACHO */}
            <div style="background-color: #0f172a; border-radius: 14px; border: 1px solid #334155; padding: 20px; margin-bottom: 20px;">
              <p style="margin: 0 0 10px 0; color: #fbbf24; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                🚚 Dados de Entrega / Despacho
              </p>
              <div style="margin-bottom: 10px;">
                <span style="color: #94a3b8; font-size: 12px; font-weight: 600;">Modalidade Escolhida:</span>
                <span style="display: inline-block; margin-left: 6px; padding: 3px 10px; border-radius: 6px; background-color: #1e293b; color: #38bdf8; font-size: 12px; font-weight: 800; border: 1px solid #38bdf8/30;">
                  ${deliveryLabel}
                </span>
              </div>
              ${deliveryMethod === 'shipping' && resolvedAddress ? `
                <div style="background-color: #1e293b; border-radius: 10px; padding: 12px 14px; margin-top: 8px;">
                  <span style="color: #94a3b8; font-size: 11px; text-transform: uppercase; font-weight: 700; display: block; margin-bottom: 4px;">Endereço de Destino:</span>
                  <p style="margin: 0; color: #f8fafc; font-size: 13px; font-weight: 600; line-height: 1.5;">
                    ${resolvedAddress}
                  </p>
                </div>
              ` : ''}
              ${deliveryNotes ? `
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #cbd5e1; font-style: italic; background-color: #1e293b; padding: 10px 12px; border-radius: 8px;">
                  <strong style="color: #fbbf24;">Observação do Cliente:</strong> "${deliveryNotes}"
                </p>
              ` : ''}
            </div>

            <div style="background-color: #1e1b4b; border: 1px solid #4338ca; border-radius: 14px; padding: 18px 20px; margin-bottom: 24px;">
              <p style="margin: 0; color: #a5b4fc; font-size: 13px; font-weight: 700;">
                📌 Próxima ação recomendada:
              </p>
              <p style="margin: 6px 0 0 0; color: #e0e7ff; font-size: 12px; line-height: 1.5;">
                ${deliveryActionText}
              </p>
            </div>

            <div style="text-align: center;">
              ${waLink ? `
                <a href="${waLink}" style="display: inline-block; background-color: #25d366; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 13px; padding: 12px 24px; border-radius: 12px; margin-right: 8px; margin-bottom: 8px;">
                  💬 Falar no WhatsApp com o Cliente
                </a>
              ` : ''}
              <a href="https://athenaconsultoria.com.br/admin" style="display: inline-block; background-color: #f59e0b; color: #0f172a; text-decoration: none; font-weight: 800; font-size: 13px; padding: 12px 24px; border-radius: 12px; margin-bottom: 8px;">
                Acessar Painel Admin Athena
              </a>
            </div>
          </div>

          <div style="background-color: #0f172a; padding: 20px 32px; border-top: 1px solid #334155; text-align: center;">
            <p style="color: #64748b; font-size: 11px; margin: 0;">
              Athena Soluções Automotivas • SIA Trecho 3, Brasília - DF • (61) 98348-5671
            </p>
          </div>

        </div>
      </div>
    `;

    await sendGenericNotificationEmail({
      to: adminDestination,
      subject: adminSubject,
      htmlContent: adminHtml
    });

    // 2. Cópia de Comprovante para o Cliente
    if (config.sendCustomerCopy && customerEmail && customerEmail.includes('@')) {
      const custSubject = `Comprovante de Resgate — Athena Soluções Automotivas (#${txId.slice(-6)})`;
      const custHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b1120; color: #f8fafc; padding: 40px 16px;">
          <div style="max-width: 560px; margin: 0 auto; background-color: #1e293b; border-radius: 20px; border: 1px solid #334155; overflow: hidden;">
            
            <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 32px; text-align: center; border-bottom: 1px solid #334155;">
              <span style="display: inline-block; padding: 4px 12px; border-radius: 9999px; background-color: #10b981; color: #ffffff; font-size: 11px; font-weight: 800; text-transform: uppercase; margin-bottom: 12px;">
                Resgate Confirmado com Sucesso
              </span>
              <h1 style="color: #f59e0b; margin: 0 0 4px 0; font-size: 24px; font-weight: 900;">ATHENA</h1>
              <p style="color: #94a3b8; font-size: 11px; margin: 0; text-transform: uppercase; font-weight: 700; letter-spacing: 1.5px;">Soluções Automotivas</p>
            </div>

            <div style="padding: 28px;">
              <p style="margin: 0 0 16px 0; font-size: 15px; color: #f8fafc;">
                Olá, <strong>${customerName}</strong>!
              </p>
              <p style="margin: 0 0 20px 0; font-size: 13px; color: #cbd5e1; line-height: 1.6;">
                Recebemos com sucesso a solicitação de resgate da sua recompensa com seus A-Points! Guarde este comprovante para seu controle.
              </p>

              <div style="background-color: #0f172a; border-radius: 14px; padding: 20px; border: 1px solid #334155; margin-bottom: 20px;">
                <p style="margin: 0 0 10px 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: 700;">Detalhes do Benefício</p>
                <p style="margin: 0 0 6px 0; font-size: 18px; font-weight: 800; color: #fbbf24;">${reward.name}</p>
                <p style="margin: 0 0 12px 0; font-size: 13px; color: #ef4444; font-weight: 700;">- ${reward.points_cost} A-Points debitados</p>
                <hr style="border: none; border-top: 1px solid #334155; margin: 12px 0;" />
                <div style="display: flex; justify-content: space-between; font-size: 12px; color: #94a3b8;">
                  <span>Seu saldo atual: <strong style="color: #10b981;">${remainingPoints} pontos</strong></span>
                  <span>Protocolo: <strong style="color: #ffffff;">${txId}</strong></span>
                </div>
              </div>

              {/* Box de Entrega no Comprovante do Cliente */}
              <div style="background-color: #0f172a; border-radius: 14px; border: 1px solid #334155; padding: 18px; margin-bottom: 20px;">
                <p style="margin: 0 0 8px 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: 700;">Forma de Recebimento</p>
                <p style="margin: 0 0 6px 0; font-size: 14px; font-weight: 700; color: #38bdf8;">${deliveryLabel}</p>
                ${deliveryMethod === 'shipping' && resolvedAddress ? `
                  <p style="margin: 4px 0 0 0; font-size: 12px; color: #cbd5e1; line-height: 1.5;">
                    ${resolvedAddress}
                  </p>
                ` : ''}
              </div>

              <div style="background-color: #064e3b; border-radius: 12px; padding: 14px 18px; margin-bottom: 24px; border: 1px solid #059669;">
                <p style="margin: 0; color: #a7f3d0; font-size: 12px; line-height: 1.5;">
                  🚀 <strong>O que acontece agora?</strong> Nossa equipe logística e comercial já recebeu sua solicitação para providenciar o envio ou entrega conforme a forma escolhida.
                </p>
              </div>

              <div style="text-align: center;">
                <a href="https://athenaconsultoria.com.br/minha-conta" style="display: inline-block; background-color: #f59e0b; color: #0f172a; text-decoration: none; font-weight: 800; font-size: 13px; padding: 12px 28px; border-radius: 12px;">
                  Acessar Minha Conta Athena
                </a>
              </div>
            </div>

            <div style="background-color: #0f172a; padding: 20px 32px; border-top: 1px solid #334155; text-align: center;">
              <p style="color: #64748b; font-size: 11px; margin: 0;">
                Athena Soluções Automotivas • Dúvidas? Contate-nos pelo WhatsApp: (61) 98348-5671
              </p>
            </div>

          </div>
        </div>
      `;

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
    const adminHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b1120; color: #f8fafc; padding: 40px 16px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 20px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 20px 35px -5px rgba(0, 0, 0, 0.5);">
          
          <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 32px 32px 24px 32px; border-bottom: 1px solid #334155; text-align: center;">
            <span style="display: inline-block; padding: 5px 14px; border-radius: 9999px; background-color: #059669; color: #ffffff; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px;">
              Comprovante de Compra & Acúmulo de Pontos
            </span>
            <h1 style="color: #f59e0b; margin: 0 0 6px 0; font-size: 26px; font-weight: 900; letter-spacing: -0.5px;">ATHENA</h1>
            <p style="color: #94a3b8; font-size: 11px; margin: 0; text-transform: uppercase; font-weight: 700; letter-spacing: 2px;">Soluções Automotivas • Comprovante de Faturamento</p>
          </div>

          <div style="padding: 32px;">
            <div style="background-color: #0f172a; border-radius: 14px; border-left: 4px solid #10b981; padding: 18px 20px; margin-bottom: 24px;">
              <p style="margin: 0; color: #f8fafc; font-size: 14px; font-weight: 600; line-height: 1.5;">
                Nova venda confirmada de <strong>${customerName || 'Cliente'}</strong>.
              </p>
              <p style="margin: 6px 0 0 0; color: #94a3b8; font-size: 12px;">
                Identificador do Pedido: <code style="color: #10b981; background-color: #1e293b; padding: 2px 6px; border-radius: 6px;">#${orderId}</code> • Origem: <strong>${source}</strong>
              </p>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px;">
              <div style="background-color: #0f172a; border-radius: 14px; padding: 18px; border: 1px solid #334155; text-align: center;">
                <p style="margin: 0 0 6px 0; color: #94a3b8; font-size: 11px; text-transform: uppercase; font-weight: 700;">Valor Total Faturado</p>
                <p style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 900;">${formattedTotal}</p>
              </div>
              <div style="background-color: #0f172a; border-radius: 14px; padding: 18px; border: 1px solid #334155; text-align: center;">
                <p style="margin: 0 0 6px 0; color: #94a3b8; font-size: 11px; text-transform: uppercase; font-weight: 700;">A-Points Gerados</p>
                <p style="margin: 0; color: #10b981; font-size: 22px; font-weight: 900;">+${pointsEarned} pts</p>
              </div>
            </div>

            <table style="width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 24px; font-size: 13px;">
              <tbody>
                <tr style="background-color: #0f172a;">
                  <td style="padding: 12px 16px; color: #94a3b8; font-weight: 600; border-top-left-radius: 10px; border-bottom: 1px solid #334155; width: 40%;">Número do Pedido</td>
                  <td style="padding: 12px 16px; color: #ffffff; font-weight: 800; border-top-right-radius: 10px; border-bottom: 1px solid #334155;">#${orderId}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; color: #94a3b8; font-weight: 600; border-bottom: 1px solid #334155;">Valor Elegível (sem frete)</td>
                  <td style="padding: 12px 16px; color: #cbd5e1; font-weight: 600; border-bottom: 1px solid #334155;">${formattedEligible}</td>
                </tr>
                <tr style="background-color: #0f172a;">
                  <td style="padding: 12px 16px; color: #94a3b8; font-weight: 600; border-bottom: 1px solid #334155;">Regra de Pontuação</td>
                  <td style="padding: 12px 16px; color: #fbbf24; font-weight: 600; border-bottom: 1px solid #334155;">R$ 50,00 = 1 A-Point</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; color: #94a3b8; font-weight: 600; border-bottom: 1px solid #334155;">Cliente</td>
                  <td style="padding: 12px 16px; color: #ffffff; font-weight: 700; border-bottom: 1px solid #334155;">${customerName}</td>
                </tr>
                ${customerCpfCnpj ? `
                <tr style="background-color: #0f172a;">
                  <td style="padding: 12px 16px; color: #94a3b8; font-weight: 600; border-bottom: 1px solid #334155;">CPF / CNPJ</td>
                  <td style="padding: 12px 16px; color: #cbd5e1; font-family: monospace; border-bottom: 1px solid #334155;">${customerCpfCnpj}</td>
                </tr>` : ''}
                ${customerEmail ? `
                <tr>
                  <td style="padding: 12px 16px; color: #94a3b8; font-weight: 600; border-bottom: 1px solid #334155;">E-mail do Cliente</td>
                  <td style="padding: 12px 16px; color: #cbd5e1; border-bottom: 1px solid #334155;">${customerEmail}</td>
                </tr>` : ''}
                ${customerPhone ? `
                <tr style="background-color: #0f172a;">
                  <td style="padding: 12px 16px; color: #94a3b8; font-weight: 600; border-bottom: 1px solid #334155;">Telefone</td>
                  <td style="padding: 12px 16px; color: #cbd5e1; border-bottom: 1px solid #334155;">${customerPhone}</td>
                </tr>` : ''}
                <tr>
                  <td style="padding: 12px 16px; color: #94a3b8; font-weight: 600; border-bottom-left-radius: 10px;">Data e Horário</td>
                  <td style="padding: 12px 16px; color: #94a3b8; border-bottom-right-radius: 10px;">${formattedDate} (Brasília)</td>
                </tr>
              </tbody>
            </table>

            <div style="text-align: center;">
              <a href="https://athenaconsultoria.com.br/admin" style="display: inline-block; background-color: #f59e0b; color: #0f172a; text-decoration: none; font-weight: 800; font-size: 13px; padding: 12px 28px; border-radius: 12px;">
                Ver Transações no Painel Admin
              </a>
            </div>
          </div>

          <div style="background-color: #0f172a; padding: 20px 32px; border-top: 1px solid #334155; text-align: center;">
            <p style="color: #64748b; font-size: 11px; margin: 0;">
              Athena Soluções Automotivas • SIA Trecho 3, Brasília - DF • (61) 98348-5671
            </p>
          </div>

        </div>
      </div>
    `;

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
        ? `[HOMOLOGAÇÃO OMIE] Comprovante de Compra & A-Points (#${orderId}) — ${customerName}`
        : `Comprovante de Compra & Seus A-Points (#${orderId}) — Athena Soluções Automotivas`;

      const omieTestBadge = isOmieSource ? `
        <div style="background-color: #1e3a8a; border: 1px solid #3b82f6; border-radius: 12px; padding: 14px 18px; margin-bottom: 22px; color: #ffffff;">
          <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 800; text-transform: uppercase; color: #93c5fd; letter-spacing: 0.5px;">
            🧪 Modo de Homologação / Teste Omie ERP
          </p>
          <p style="margin: 0; font-size: 12px; line-height: 1.4; color: #e0f2fe;">
            Este comprovante foi redirecionado para seu e-mail para validação de conformidade.<br/>
            <strong>Cliente no ERP:</strong> ${customerName} | <strong>E-mail cadastrado:</strong> ${customerEmail || 'Não informado'} | <strong>Doc:</strong> ${customerCpfCnpj || 'N/A'}
          </p>
        </div>
      ` : '';

      const pointsBlockHtml = pointsEarned > 0 ? `
        <div style="background-color: #0f172a; border-radius: 14px; padding: 22px; border: 1px solid #334155; text-align: center; margin-bottom: 24px;">
          <p style="margin: 0 0 6px 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: 700;">Você acumulou no Programa de Fidelidade</p>
          <p style="margin: 0 0 6px 0; font-size: 34px; font-weight: 900; color: #10b981;">+${pointsEarned} A-Points</p>
          <p style="margin: 0; font-size: 12px; color: #cbd5e1;">(Regra: R$ 50,00 faturados = 1 A-Point)</p>
        </div>
      ` : `
        <div style="background-color: #0f172a; border-radius: 14px; padding: 18px; border: 1px solid #334155; text-align: center; margin-bottom: 24px;">
          <p style="margin: 0 0 4px 0; font-size: 13px; color: #f8fafc; font-weight: 700;">Compra Registrada com Sucesso</p>
          <p style="margin: 0; font-size: 12px; color: #94a3b8;">A cada R$ 50,00 faturados você acumula 1 ponto no programa A-Points.</p>
        </div>
      `;

      const custHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b1120; color: #f8fafc; padding: 40px 16px;">
          <div style="max-width: 580px; margin: 0 auto; background-color: #1e293b; border-radius: 20px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 20px 35px -5px rgba(0, 0, 0, 0.5);">
            
            <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 32px; text-align: center; border-bottom: 1px solid #334155;">
              <span style="display: inline-block; padding: 5px 14px; border-radius: 9999px; background-color: #10b981; color: #ffffff; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">
                Comprovante de Compra Confirmada
              </span>
              <h1 style="color: #f59e0b; margin: 0 0 4px 0; font-size: 26px; font-weight: 900; letter-spacing: -0.5px;">ATHENA</h1>
              <p style="color: #94a3b8; font-size: 11px; margin: 0; text-transform: uppercase; font-weight: 700; letter-spacing: 2px;">Soluções Automotivas • Comprovante do Cliente</p>
            </div>

            <div style="padding: 28px 32px;">
              ${omieTestBadge}

              <p style="margin: 0 0 12px 0; font-size: 16px; color: #f8fafc;">
                Olá, <strong>${customerName}</strong>!
              </p>
              <p style="margin: 0 0 22px 0; font-size: 13px; color: #cbd5e1; line-height: 1.6;">
                Seu faturamento recente no valor de <strong>${formattedTotal}</strong> foi processado e confirmado com sucesso. Guarde este comprovante para seu acompanhamento e controle.
              </p>

              ${pointsBlockHtml}

              <div style="background-color: #0f172a; border-radius: 14px; padding: 18px 20px; border: 1px solid #334155; margin-bottom: 24px;">
                <p style="margin: 0 0 10px 0; font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px;">Resumo do Pedido</p>
                <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px;">
                  <span style="color: #94a3b8;">Número do Pedido / NF:</span>
                  <span style="color: #ffffff; font-weight: 700;">#${orderId}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px;">
                  <span style="color: #94a3b8;">Valor Total:</span>
                  <span style="color: #ffffff; font-weight: 800;">${formattedTotal}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px;">
                  <span style="color: #94a3b8;">Canal de Faturamento:</span>
                  <span style="color: #cbd5e1;">${source}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b; pt-2; margin-top: 8px;">
                  <span>Data de Confirmação:</span>
                  <span>${formattedDate} (Brasília)</span>
                </div>
              </div>

              <div style="text-align: center; margin-bottom: 12px;">
                <a href="https://athenaconsultoria.com.br/minha-conta" style="display: inline-block; background-color: #f59e0b; color: #0f172a; text-decoration: none; font-weight: 800; font-size: 13px; padding: 13px 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);">
                  Acessar Minha Conta & Catálogo de Prêmios
                </a>
              </div>
            </div>

            <div style="background-color: #0f172a; padding: 20px 32px; border-top: 1px solid #334155; text-align: center;">
              <p style="color: #64748b; font-size: 11px; margin: 0 0 4px 0;">
                Athena Soluções Automotivas • ST SHA Arniqueira, Brasília - DF • (61) 98348-5671
              </p>
              <p style="color: #475569; font-size: 10px; margin: 0;">
                Este e-mail foi enviado automaticamente por no-reply@athenaconsultoria.com.br
              </p>
            </div>

          </div>
        </div>
      `;

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
      ? items.map(it => `
          <tr style="border-bottom: 1px solid #334155;">
            <td style="padding: 10px 14px; color: #f8fafc; font-size: 13px;">
              <strong>${it.name || it.description || 'Equipamento'}</strong>
              ${it.sku ? `<br/><span style="font-size: 11px; color: #94a3b8;">SKU: ${it.sku}</span>` : ''}
            </td>
            <td style="padding: 10px 14px; color: #cbd5e1; font-size: 13px; text-align: center;">${it.quantity || 1}x</td>
            <td style="padding: 10px 14px; color: #ffffff; font-size: 13px; font-weight: 700; text-align: right;">${formatBrlNumber((it.price || it.unitPrice || 0) * (it.quantity || 1))}</td>
          </tr>
        `).join('')
      : `
          <tr style="border-bottom: 1px solid #334155;">
            <td style="padding: 10px 14px; color: #f8fafc; font-size: 13px;" colspan="2">Equipamentos e Serviços Automotivos</td>
            <td style="padding: 10px 14px; color: #ffffff; font-size: 13px; font-weight: 700; text-align: right;">${formattedTotal}</td>
          </tr>
        `;

    // Bloco específico de pagamento (PIX copia e cola, boleto etc)
    let paymentDetailsHtml = '';
    if (billingType === 'PIX' && pix?.payload) {
      paymentDetailsHtml = `
        <div style="background-color: #064e3b; border: 1px solid #059669; border-radius: 14px; padding: 20px; margin-bottom: 24px; text-align: center;">
          <span style="display: inline-block; padding: 3px 10px; border-radius: 9999px; background-color: #10b981; color: #064e3b; font-size: 10px; font-weight: 800; text-transform: uppercase; margin-bottom: 10px;">
            Pagamento via PIX
          </span>
          <p style="margin: 0 0 10px 0; font-size: 13px; color: #a7f3d0; font-weight: 700;">
            Copie o código PIX abaixo e cole no seu aplicativo bancário:
          </p>
          <div style="background-color: #022c22; border: 1px dashed #10b981; border-radius: 8px; padding: 12px; margin-bottom: 12px; word-break: break-all; font-family: monospace; font-size: 11px; color: #6ee7b7; user-select: all;">
            ${pix.payload}
          </div>
          <p style="margin: 0; font-size: 11px; color: #6ee7b7;">
            ⏱ O pagamento é compensado instantaneamente e você receberá a confirmação em seguida!
          </p>
        </div>
      `;
    } else if (billingType === 'BOLETO' && bankSlipUrl) {
      paymentDetailsHtml = `
        <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 14px; padding: 20px; margin-bottom: 24px; text-align: center;">
          <p style="margin: 0 0 12px 0; font-size: 13px; color: #f8fafc; font-weight: 700;">
            Boleto Bancário Gerado com Sucesso
          </p>
          <a href="${bankSlipUrl}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 13px; padding: 12px 24px; border-radius: 10px;">
            📄 Abrir Boleto para Pagamento
          </a>
          <p style="margin: 10px 0 0 0; font-size: 11px; color: #94a3b8;">
            A compensação bancária do boleto ocorre em até 1 a 2 dias úteis.
          </p>
        </div>
      `;
    }

    // 1. Envia para o Cliente
    if (config.sendCustomerCopy && customerEmail && customerEmail.includes('@')) {
      const custSubject = `Recebemos seu Pedido #${orderId}! — Athena Soluções Automotivas`;
      const custHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b1120; color: #f8fafc; padding: 40px 16px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 20px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 20px 35px -5px rgba(0, 0, 0, 0.5);">
            
            <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 32px; text-align: center; border-bottom: 1px solid #334155;">
              <span style="display: inline-block; padding: 5px 14px; border-radius: 9999px; background-color: #2563eb; color: #ffffff; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">
                Pedido Registrado na Loja Online
              </span>
              <h1 style="color: #f59e0b; margin: 0 0 4px 0; font-size: 26px; font-weight: 900; letter-spacing: -0.5px;">ATHENA</h1>
              <p style="color: #94a3b8; font-size: 11px; margin: 0; text-transform: uppercase; font-weight: 700; letter-spacing: 2px;">Soluções Automotivas • Comprovante de Pedido</p>
            </div>

            <div style="padding: 28px 32px;">
              <p style="margin: 0 0 12px 0; font-size: 16px; color: #f8fafc;">
                Olá, <strong>${customerName}</strong>!
              </p>
              <p style="margin: 0 0 20px 0; font-size: 13px; color: #cbd5e1; line-height: 1.6;">
                Recebemos seu pedido <strong>#${orderId}</strong> em nossa loja online! Abaixo estão os detalhes dos produtos adquiridos e as informações de acompanhamento:
              </p>

              ${paymentDetailsHtml}

              <!-- Tabela de Itens -->
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background-color: #0f172a; border-radius: 12px; overflow: hidden; border: 1px solid #334155;">
                <thead>
                  <tr style="background-color: #1e293b; border-bottom: 1px solid #334155;">
                    <th style="padding: 10px 14px; text-align: left; font-size: 11px; color: #94a3b8; text-transform: uppercase;">Produto</th>
                    <th style="padding: 10px 14px; text-align: center; font-size: 11px; color: #94a3b8; text-transform: uppercase;">Qtd</th>
                    <th style="padding: 10px 14px; text-align: right; font-size: 11px; color: #94a3b8; text-transform: uppercase;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsRowsHtml}
                </tbody>
              </table>

              <!-- Totais -->
              <div style="background-color: #0f172a; border-radius: 12px; padding: 16px 20px; border: 1px solid #334155; margin-bottom: 24px;">
                <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px;">
                  <span style="color: #94a3b8;">Forma de Pagamento:</span>
                  <span style="color: #ffffff; font-weight: 700;">${paymentMethodDescription}</span>
                </div>
                ${discountAmount > 0 ? `
                  <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px;">
                    <span style="color: #10b981;">Desconto Aplicado:</span>
                    <span style="color: #10b981; font-weight: 700;">- ${formatBrlNumber(discountAmount)}</span>
                  </div>
                ` : ''}
                <div style="display: flex; justify-content: space-between; font-size: 16px; border-top: 1px solid #1e293b; padding-top: 8px; margin-top: 8px;">
                  <span style="color: #ffffff; font-weight: 800;">Valor Total:</span>
                  <span style="color: #fbbf24; font-weight: 900;">${formattedTotal}</span>
                </div>
              </div>

              <!-- Estimativa A-Points -->
              <div style="background-color: #1e1b4b; border: 1px solid #4338ca; border-radius: 14px; padding: 16px 20px; margin-bottom: 24px; text-align: center;">
                <p style="margin: 0 0 4px 0; font-size: 13px; font-weight: 800; color: #c7d2fe;">
                  🎁 Pontos a Ganhar no Programa A-Points:
                </p>
                <p style="margin: 0; font-size: 12px; color: #e0e7ff;">
                  Após a aprovação do pagamento, você acumulará aproximadamente <strong style="color: #38bdf8;">+${estimatedPoints} A-Points</strong> para resgatar brindes e vantagens exclusivas!
                </p>
              </div>

              <div style="text-align: center;">
                <a href="https://athenaconsultoria.com.br/minha-conta" style="display: inline-block; background-color: #f59e0b; color: #0f172a; text-decoration: none; font-weight: 800; font-size: 13px; padding: 13px 30px; border-radius: 12px;">
                  Acompanhar Meu Pedido
                </a>
              </div>
            </div>

            <div style="background-color: #0f172a; padding: 20px 32px; border-top: 1px solid #334155; text-align: center;">
              <p style="color: #64748b; font-size: 11px; margin: 0 0 4px 0;">
                Athena Soluções Automotivas • ST SHA Arniqueira, Brasília - DF • WhatsApp: (61) 98348-5671
              </p>
              <p style="color: #475569; font-size: 10px; margin: 0;">
                Enviado automaticamente por no-reply@athenaconsultoria.com.br
              </p>
            </div>

          </div>
        </div>
      `;

      await sendGenericNotificationEmail({
        to: customerEmail,
        subject: custSubject,
        htmlContent: custHtml
      });
    }

    // 2. Envia para a Administração (Alerta de Novo Pedido no Site)
    const adminDest = config.purchaseNotificationEmail || config.receiptNotificationEmail;
    const adminSubject = `[Athena Loja Online] Novo Pedido Criado (#${orderId}) — ${customerName} (${formattedTotal})`;
    const adminHtml = `
      <div style="font-family: sans-serif; background-color: #0b1120; color: #f8fafc; padding: 30px 16px;">
        <div style="max-width: 560px; margin: 0 auto; background-color: #1e293b; border-radius: 16px; border: 1px solid #334155; padding: 24px;">
          <h2 style="color: #f59e0b; margin-top: 0;">Novo Pedido na Loja Online Athena</h2>
          <p style="color: #cbd5e1; font-size: 13px;">O cliente <strong>${customerName}</strong> fechou o pedido <strong>#${orderId}</strong>.</p>
          <ul style="font-size: 13px; color: #94a3b8; line-height: 1.6;">
            <li><strong>Total:</strong> ${formattedTotal}</li>
            <li><strong>Pagamento:</strong> ${paymentMethodDescription}</li>
            <li><strong>E-mail:</strong> ${customerEmail}</li>
            <li><strong>Telefone:</strong> ${customerPhone || 'Não informado'}</li>
            <li><strong>CPF/CNPJ:</strong> ${customerCpfCnpj || 'Não informado'}</li>
            <li><strong>Data:</strong> ${formattedDate}</li>
          </ul>
          <a href="https://athenaconsultoria.com.br/admin" style="display: inline-block; background-color: #f59e0b; color: #0f172a; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 12px; margin-top: 10px;">
            Acessar Painel de Pedidos
          </a>
        </div>
      </div>
    `;

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
  const subject = '[Athena Teste] Verificação do Servidor SMTP & Alertas de Comprovantes';
  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #0b1120; color: #f8fafc; padding: 40px 16px;">
      <div style="max-width: 560px; margin: 0 auto; background-color: #1e293b; border-radius: 20px; border: 1px solid #334155; padding: 32px; text-align: center;">
        <h1 style="color: #f59e0b; margin: 0 0 6px 0; font-size: 24px; font-weight: 800;">ATHENA</h1>
        <p style="color: #94a3b8; font-size: 11px; margin: 0 0 24px 0; text-transform: uppercase; font-weight: 700; letter-spacing: 1.5px;">Soluções Automotivas • Teste de Notificações</p>
        <div style="background-color: #064e3b; border: 1px solid #059669; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
          <p style="margin: 0 0 6px 0; font-size: 16px; font-weight: 800; color: #34d399;">✅ Configuração Validada com Sucesso!</p>
          <p style="margin: 0; font-size: 13px; color: #a7f3d0; line-height: 1.5;">
            O servidor SMTP do Google está conectado e autorizado a enviar comprovantes de compras e resgates de pontos para este e-mail.
          </p>
        </div>
        <p style="color: #94a3b8; font-size: 12px; margin: 0;">
          Destinatário testado: <strong>${to}</strong> • Horário: ${formatBrtDate()}
        </p>
      </div>
    </div>
  `;
  return await sendGenericNotificationEmail({ to, subject, htmlContent: html });
}

// -------------------------------------------------------------
// CLOUDFLARE R2 / CLOUDINARY UPLOAD ENDPOINT (AUTO-WEBP)
// -------------------------------------------------------------
app.post('/api/upload', authenticateToken, async (req, res) => {
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
app.get('/api/upload/library', authenticateToken, async (req, res) => {
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
app.post('/api/upload/delete', authenticateToken, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'Nenhuma URL informada para exclusão.' });
    }

    // 1. Tenta excluir do Cloudflare R2 (suporta domínio customizado e r2.dev)
    const isR2Url = isR2Configured && (
      url.includes('.r2.dev') ||
      url.includes('.r2.cloudflarestorage.com') ||
      url.includes('images.athenaconsultoria.com.br') ||
      (process.env.R2_PUBLIC_URL && url.includes(new URL(process.env.R2_PUBLIC_URL).hostname))
    );

    if (isR2Url) {
      const deleted = await deleteFromR2(url);
      return res.json({ success: deleted, provider: 'cloudflare-r2' });
    }

    // 2. Se for Cloudinary, tenta excluir pelo public_id
    if (url.includes('cloudinary.com')) {
      try {
        const parts = url.split('/');
        const fileWithExt = parts.slice(-2).join('/');
        const publicId = fileWithExt.replace(/\.[^/.]+$/, '');
        await cloudinary.uploader.destroy(publicId);
      } catch (cErr) {
        console.warn('Aviso ao excluir do Cloudinary:', cErr.message);
      }
    }

    return res.json({ success: true });
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
// AUTH & USER ROLES ENDPOINTS
// -------------------------------------------------------------

// Login (Protected by strict loginLimiter rate limiting)
app.post('/api/auth/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Informe e-mail e senha.' });
    }

    const inputEmail = email.trim().toLowerCase();
    const envAdminEmail = (process.env.ADMIN_EMAIL || 'administracao@athenaconsultoria.com.br').trim().toLowerCase();
    const envAdminPassword = process.env.ADMIN_PASSWORD || 'Athena16/10*';
    const envAdminName = process.env.ADMIN_NAME || 'Administrador Geral';

    // 1. Direct Master Admin check (Environment based master credentials)
    const isMasterAdmin = (
      inputEmail === envAdminEmail ||
      inputEmail === 'administracao@athenaconsultoria.com.br' ||
      inputEmail === 'admin@athena.com.br'
    ) && checkPassword(password, envAdminPassword);

    if (isMasterAdmin) {
      const hashedAdminPass = bcrypt.hashSync(envAdminPassword, 10);
      if (pool) {
        try {
          await pool.query(`
            INSERT INTO users (id, name, email, password_hash, role) 
            VALUES ($1, $2, $3, $4, $5) 
            ON CONFLICT (email) 
            DO UPDATE SET password_hash = $4, name = $2, role = 'admin'
          `, ['user_admin_default', envAdminName, envAdminEmail, hashedAdminPass, 'admin']);
        } catch (e) {
          console.error('Erro ao auto-sync admin:', e.message);
        }
      }

      const { token, expiresAt } = generateToken({
        id: 'user_admin_default',
        name: envAdminName,
        email: envAdminEmail,
        role: 'admin',
        isVerified: true
      });

      return res.json({
        id: 'user_admin_default',
        name: envAdminName,
        email: envAdminEmail,
        role: 'admin',
        isVerified: true,
        token,
        expiresAt
      });
    }

    // 2. Query PostgreSQL (if pool is available)
    let foundUser = null;
    if (pool) {
      try {
        const result = await pool.query('SELECT id, name, email, password_hash as "passwordHash", role, phone, document, company_name as "companyName", address, is_verified as "isVerified", COALESCE(must_change_password, false) as "mustChangePassword" FROM users WHERE email = $1', [inputEmail]);
        if (result.rows && result.rows.length > 0) {
          foundUser = result.rows[0];
        }
      } catch (e) {
        console.error('PostgreSQL query error no login, recorrendo ao JSON local:', e.message);
      }
    }

    // 3. Fallback to Local JSON DB if not found in PG or if PG query failed
    if (!foundUser) {
      const db = readDbJson();
      const user = (db.users || []).find(u => u.email.toLowerCase() === inputEmail);
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
          mustChangePassword: Boolean(user.mustChangePassword || user.must_change_password || false)
        };
      }
    }

    // 4. Validate found user's credentials
    if (foundUser && checkPassword(password, foundUser.passwordHash)) {
      // Auto-upgrade legacy plaintext password to secure bcrypt hash
      if (foundUser.passwordHash === password) {
        const upgradedHash = bcrypt.hashSync(password, 10);
        if (pool) {
          try {
            await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [upgradedHash, foundUser.id]);
          } catch (e) {}
        }
        const db = readDbJson();
        const uIdx = (db.users || []).findIndex(u => u.id === foundUser.id);
        if (uIdx !== -1) {
          db.users[uIdx].passwordHash = upgradedHash;
          writeDbJson(db);
        }
      }

      const userRole = foundUser.role || 'cliente';
      const isVerified = Boolean(foundUser.isVerified || foundUser.is_verified || userRole === 'admin');

      const { token, expiresAt } = generateToken({
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        role: userRole,
        isVerified
      });

      return res.json({
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        role: userRole,
        phone: foundUser.phone || '',
        document: foundUser.document || '',
        companyName: foundUser.companyName || '',
        address: foundUser.address || null,
        isVerified,
        mustChangePassword: Boolean(foundUser.mustChangePassword || foundUser.must_change_password || false),
        token,
        expiresAt
      });
    }

    return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
  } catch (err) {
    console.error('Erro inesperado no login:', err);
    return res.status(500).json({ error: 'Erro interno ao processar login.' });
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

// Forgot Password - Send Google SMTP Email with Reset Code
app.post('/api/auth/forgot-password', async (req, res) => {
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

    if (!foundUser) {
      // Segurança: Não divulga se o e-mail existe ou não (prevenção de enumeração de contas)
      return res.json({
        success: true,
        message: 'E-mail enviado! Se o endereço estiver cadastrado em nosso sistema, você receberá o código de recuperação em instantes.'
      });
    }

    // Generate 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
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
      return res.status(400).json({ error: 'Código inválido ou expirado. Solicite um novo código de recuperação.' });
    }

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

    const orderId = `athena_ped_${Date.now().toString().slice(-6)}`;
    const newOrder = {
      id: orderId,
      userId: userId || null,
      userEmail: userEmail || '',
      userName: userName || 'Cliente',
      items,
      totalAmount: totalAmount || 0,
      total_amount: totalAmount || 0,
      status: 'em_analise',
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
    // B. COUPON EVALUATION & DISCOUNT CALCULATION
    // ---------------------------------------------------------
    let appliedCoupon = null;
    let discountAmount = 0;
    let finalPayable = Number(value);

    if (couponCode && couponCode.trim()) {
      const cleanCouponCode = couponCode.trim().toUpperCase().replace(/\s+/g, '');
      let foundCoupon = (db.coupons || []).find(c => (c.code || '').toUpperCase() === cleanCouponCode);

      if (pool) {
        const cRes = await pool.query('SELECT * FROM coupons WHERE UPPER(code) = $1', [cleanCouponCode]);
        if (cRes.rows && cRes.rows.length > 0) foundCoupon = cRes.rows[0];
      }

      if (foundCoupon) {
        const evalRes = evaluateCoupon(foundCoupon, items.length > 0 ? items : [{ price: Number(value), quantity: 1 }], cleanEmail, cleanDoc);
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
      // Record Free Order directly
      const freeOrderRecord = {
        id: orderId,
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

    // Save Order in Database
    const orderRecord = {
      id: orderId,
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

// 3. Asaas Webhook Endpoint
app.post('/api/payments/webhook', async (req, res) => {
  try {
    const asaasToken = req.headers['asaas-access-token'];
    if (ASAAS_WEBHOOK_SECRET && asaasToken && asaasToken !== ASAAS_WEBHOOK_SECRET) {
      return res.status(401).json({ error: 'Webhook token inválido.' });
    }

    const { event, payment } = req.body;
    console.log(`[Asaas Webhook] Evento: ${event} | Pagamento: ${payment?.id} | Status: ${payment?.status}`);

    if (payment && payment.externalReference) {
      const orderId = payment.externalReference;
      let newStatus = 'em_analise';

      if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
        newStatus = 'faturado';

        // Automatically credit A-Points for this confirmed order
        let orderForPoints = null;
        if (pool) {
          try {
            const oRes = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
            if (oRes.rows.length > 0) orderForPoints = oRes.rows[0];
          } catch (e) {}
        }
        if (!orderForPoints) {
          const dbCheck = readDbJson();
          orderForPoints = (dbCheck.orders || []).find(o => o.id === orderId);
        }
        if (orderForPoints) {
          await creditCustomerAPoints({
            orderId,
            orderTotal: orderForPoints.total_amount || orderForPoints.totalAmount || payment.value || 0,
            customerEmail: orderForPoints.user_email || orderForPoints.userEmail || '',
            customerName: orderForPoints.user_name || orderForPoints.userName || '',
            customerCpfCnpj: orderForPoints.customer_document || '',
            source: 'site_asaas'
          });
        }
      } else if (event === 'PAYMENT_OVERDUE') {
        newStatus = 'expirado';
      }

      if (pool) {
        try {
          await pool.query('UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2', [newStatus, orderId]);
        } catch (e) {}
      }

      const db = readDbJson();
      const oIdx = (db.orders || []).findIndex(o => o.id === orderId);
      if (oIdx !== -1) {
        db.orders[oIdx].status = newStatus;
        writeDbJson(db);
      }
    }

    return res.json({ received: true });
  } catch (err) {
    console.error('Erro no processamento de webhook Asaas:', err);
    return res.status(500).json({ error: 'Erro no webhook.' });
  }
});

// -------------------------------------------------------------
// 4. OMIE ERP WEBHOOK & A-POINTS LOYALTY SYSTEM
// -------------------------------------------------------------
const OMIE_APP_KEY = process.env.OMIE_APP_KEY || '7410462256197';
const OMIE_APP_SECRET = process.env.OMIE_APP_SECRET || '0a8c9d675963da05b8565eb75a167020';

async function callOmieApi(endpointUrl, callMethod, paramObj) {
  const response = await axios.post(endpointUrl, {
    call: callMethod,
    app_key: OMIE_APP_KEY,
    app_secret: OMIE_APP_SECRET,
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

// Omie Webhook Receiver (POST)
app.post('/api/webhooks/omie', async (req, res) => {
  // Retorna 200 OK imediatamente para o Omie confirmar entrega com sucesso
  res.status(200).json({ received: true, timestamp: new Date().toISOString() });

  // Processa em segundo plano
  processOmieSaleEvent(req.body);
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
        'GET /api/hermes/status',
        'GET /api/hermes/customers',
        'GET /api/hermes/customers/:identifier',
        'POST /api/hermes/customers/:identifier/debit',
        'GET /api/hermes/rewards',
        'GET /api/hermes/products',
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

// Hermes: Busca Rápida de Produtos no Catálogo Athena
app.get('/api/hermes/products', validateHermesAuth, async (req, res) => {
  try {
    const { search = '', limit = 20 } = req.query;
    const cleanSearch = String(search).trim().toLowerCase();
    const numLimit = Math.min(50, Math.max(1, Number(limit) || 20));

    if (pool) {
      let query = `
        SELECT p.id, p.name, p.slug, p.price, p.price_negotiable as "priceNegotiable", 
               p.badge, p.image, p.in_stock as "inStock", c.name as "categoryName", b.name as "brandName"
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN brands b ON p.brand_id = b.id
        WHERE p.status = 'published'
      `;
      const params = [];
      if (cleanSearch) {
        params.push(`%${cleanSearch}%`);
        query += ` AND (LOWER(p.name) LIKE $1 OR LOWER(c.name) LIKE $1 OR LOWER(b.name) LIKE $1)`;
      }
      query += ` ORDER BY p.name ASC LIMIT ${numLimit}`;
      const result = await pool.query(query, params);
      
      const productsWithUrls = result.rows.map(prod => ({
        ...prod,
        url: `https://athenaconsultoria.com.br/produto/${prod.slug || prod.id}`
      }));

      return res.json({
        total: productsWithUrls.length,
        products: productsWithUrls
      });
    }

    const db = readDbJson();
    let prods = (db.products || []).filter(p => p.status === 'published');
    if (cleanSearch) {
      prods = prods.filter(p => p.name && p.name.toLowerCase().includes(cleanSearch));
    }
    return res.json({
      total: prods.length,
      products: prods.slice(0, numLimit).map(p => ({
        ...p,
        url: `https://athenaconsultoria.com.br/produto/${p.slug || p.id}`
      }))
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
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
    let unlinkedProducts = [];

    if (pool) {
      const totRes = await pool.query('SELECT COUNT(*) FROM products');
      totalProducts = parseInt(totRes.rows[0].count, 10);

      const linkRes = await pool.query('SELECT COUNT(*) FROM products WHERE omie_product_id IS NOT NULL');
      linkedProducts = parseInt(linkRes.rows[0].count, 10);

      const unRes = await pool.query(`
        SELECT id, name, brand_id as "brandId", price::float
        FROM products 
        WHERE omie_product_id IS NULL
        ORDER BY name ASC
        LIMIT 50
      `);
      unlinkedProducts = unRes.rows;
    }

    return res.json({
      totalProducts,
      linkedProducts,
      unlinkedCount: Math.max(0, totalProducts - linkedProducts),
      matchPercentage: totalProducts > 0 ? ((linkedProducts / totalProducts) * 100).toFixed(1) : 0,
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

// Vínculo manual individual de produto
app.post('/api/admin/omie/link-product', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { athenaProductId, omieProductId, omieCode } = req.body;
    if (!athenaProductId || !omieProductId) {
      return res.status(400).json({ error: 'IDs de produto Athena e Omie são obrigatórios.' });
    }

    if (pool) {
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
  if (pool) {
    try {
      const result = await pool.query('SELECT id, name, email, role, phone, document, company_name as "companyName", a_points as "aPoints", COALESCE(must_change_password, false) as "mustChangePassword", created_at as "createdAt" FROM users ORDER BY created_at DESC');
      if (result.rows && result.rows.length > 0) {
        return res.json(result.rows);
      }
    } catch (e) {
      console.error('Erro ao listar usuários do PostgreSQL:', e.message);
    }
  }
  const db = readDbJson();
  const cleanUsers = (db.users || []).map(({ passwordHash, password_hash, ...rest }) => ({
    ...rest,
    aPoints: rest.aPoints || rest.a_points || 0,
    mustChangePassword: Boolean(rest.mustChangePassword || rest.must_change_password || false)
  }));
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

    const updatedConfig = await getNotificationSettings();
    return res.json({
      success: true,
      message: 'Configurações de e-mail atualizadas com sucesso!',
      settings: {
        ...updatedConfig,
        smtpConfigured: !!mailTransporter,
        smtpSender: SMTP_FROM
      }
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
      return res.status(500).json({ error: `Erro no servidor SMTP: ${result.error}` });
    }

    return res.json({
      success: true,
      message: `E-mail de teste (${testType || 'geral'}) enviado com sucesso para "${destination}"!`
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

  const db = readDbJson();
  const userIdx = (db.users || []).findIndex(u => u.id === userId);
  const existingUser = userIdx !== -1 ? db.users[userIdx] : null;

  if (currentPassword && existingUser && !checkPassword(currentPassword, existingUser.passwordHash || existingUser.password_hash)) {
    return res.status(400).json({ error: 'Senha atual incorreta.' });
  }

  const updatedName = name ? name.trim() : (existingUser?.name || 'Usuário');
  const updatedEmail = email ? email.trim().toLowerCase() : (existingUser?.email || '');
  const updatedPassword = newPassword ? bcrypt.hashSync(newPassword, 10) : (existingUser?.passwordHash || existingUser?.password_hash);
  
  // Non-admins cannot elevate their own role
  const updatedRole = (req.user.role === 'admin' && role) ? role : (existingUser?.role || 'vendedor');

  if (existingUser) {
    db.users[userIdx] = {
      ...existingUser,
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
      const result = await pool.query('SELECT id, name, slug, description, icon, "order" FROM categories ORDER BY "order" ASC, name ASC');
      return res.json(result.rows);
    } catch (e) {
      console.error(e);
    }
  }
  const db = readDbJson();
  res.json(db.categories || []);
});

app.post('/api/categories', authenticateToken, async (req, res) => {
  const newCat = { id: req.body.id || `cat_${Date.now()}`, ...req.body };
  if (pool) {
    try {
      await pool.query(
        'INSERT INTO categories (id, name, slug, description, icon, "order") VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO UPDATE SET name=$2, slug=$3, description=$4, icon=$5, "order"=$6',
        [newCat.id, newCat.name, newCat.slug || '', newCat.description || '', newCat.icon || 'Layers', newCat.order || 0]
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

app.put('/api/categories/reorder', authenticateToken, async (req, res) => {
  const { categories: orderedCats } = req.body;
  if (!Array.isArray(orderedCats)) {
    return res.status(400).json({ error: 'Array de categorias obrigatório.' });
  }
  if (pool) {
    try {
      for (let i = 0; i < orderedCats.length; i++) {
        const c = orderedCats[i];
        await pool.query('UPDATE categories SET "order" = $1 WHERE id = $2', [i + 1, c.id]);
      }
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

app.put('/api/categories/:id', authenticateToken, async (req, res) => {
  const updatedCat = { id: req.params.id, ...req.body };
  if (pool) {
    try {
      await pool.query(
        'UPDATE categories SET name=$1, slug=$2, description=$3, icon=$4, "order"=$5 WHERE id=$6',
        [updatedCat.name, updatedCat.slug || '', updatedCat.description || '', updatedCat.icon || 'Layers', updatedCat.order || 0, req.params.id]
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

app.delete('/api/categories/:id', authenticateToken, async (req, res) => {
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

app.post('/api/brands', authenticateToken, async (req, res) => {
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

app.put('/api/brands/reorder', authenticateToken, async (req, res) => {
  const { brands: orderedBrands } = req.body;
  if (!Array.isArray(orderedBrands)) {
    return res.status(400).json({ error: 'Array de marcas obrigatório.' });
  }
  if (pool) {
    try {
      for (let i = 0; i < orderedBrands.length; i++) {
        const b = orderedBrands[i];
        await pool.query('UPDATE brands SET "order" = $1 WHERE id = $2', [i + 1, b.id]);
      }
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

app.put('/api/brands/:id', authenticateToken, async (req, res) => {
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

app.delete('/api/brands/:id', authenticateToken, async (req, res) => {
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

// 3. PRODUCTS
app.get('/api/products', async (req, res) => {
  if (pool) {
    try {
      const result = await pool.query(`
        SELECT id, name, slug, category_id as "categoryId", brand_id as "brandId", price::float, price_negotiable as "priceNegotiable", badge, status, is_featured as "isFeatured", image, images, alt_text as "altText", description, specs, attachments, in_stock as "inStock", video_url as "videoUrl", custom_tabs as "customTabs", product_type as "productType", a_points as "aPoints", created_at
        FROM products 
        ORDER BY is_featured DESC, created_at DESC
      `);
      return res.json(result.rows);
    } catch (e) {
      console.error(e);
    }
  }
  const db = readDbJson();
  res.json(db.products || []);
});

app.post('/api/products', authenticateToken, async (req, res) => {
  const newProduct = { id: req.body.id || `prod_${Date.now()}`, ...req.body };
  if (pool) {
    try {
      await pool.query(`
        INSERT INTO products (id, name, slug, category_id, brand_id, price, price_negotiable, badge, status, is_featured, image, images, alt_text, description, specs, attachments, in_stock, video_url, custom_tabs, product_type, a_points)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
        ON CONFLICT (id) DO UPDATE SET 
          name=$2, slug=$3, category_id=$4, brand_id=$5, price=$6, price_negotiable=$7, badge=$8, status=$9, is_featured=$10, image=$11, images=$12, alt_text=$13, description=$14, specs=$15, attachments=$16, in_stock=$17, video_url=$18, custom_tabs=$19, product_type=$20, a_points=$21
      `, [
        newProduct.id,
        newProduct.name,
        newProduct.slug || '',
        newProduct.categoryId,
        newProduct.brandId,
        newProduct.price || 0,
        newProduct.priceNegotiable !== undefined ? newProduct.priceNegotiable : true,
        newProduct.badge || '',
        newProduct.status || 'published',
        !!newProduct.isFeatured,
        newProduct.image || '',
        JSON.stringify(newProduct.images || []),
        newProduct.altText || '',
        newProduct.description || '',
        JSON.stringify(newProduct.specs || []),
        JSON.stringify(newProduct.attachments || []),
        newProduct.inStock !== undefined ? newProduct.inStock : true,
        newProduct.videoUrl || newProduct.youtubeVideoUrl || '',
        JSON.stringify(newProduct.customTabs || []),
        newProduct.productType || 'physical',
        newProduct.aPoints != null ? parseInt(newProduct.aPoints, 10) : null
      ]);
      return res.status(201).json(newProduct);
    } catch (e) {
      console.error(e);
    }
  }
  const db = readDbJson();
  db.products.unshift(newProduct);
  writeDbJson(db);
  res.status(201).json(newProduct);
});

app.put('/api/products/reorder', authenticateToken, async (req, res) => {
  const { products: orderedProducts } = req.body;
  if (!Array.isArray(orderedProducts)) {
    return res.status(400).json({ error: 'Array de produtos obrigatório.' });
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

app.put('/api/products/:id', authenticateToken, async (req, res) => {
  const updatedProduct = { id: req.params.id, ...req.body };
  if (pool) {
    try {
      await pool.query(`
        UPDATE products SET 
          name=$1, slug=$2, category_id=$3, brand_id=$4, price=$5, price_negotiable=$6, badge=$7, status=$8, is_featured=$9, image=$10, images=$11, alt_text=$12, description=$13, specs=$14, attachments=$15, in_stock=$16, video_url=$17, custom_tabs=$18, product_type=$19, a_points=$20
        WHERE id=$21
      `, [
        updatedProduct.name,
        updatedProduct.slug || '',
        updatedProduct.categoryId,
        updatedProduct.brandId,
        updatedProduct.price || 0,
        updatedProduct.priceNegotiable !== undefined ? updatedProduct.priceNegotiable : true,
        updatedProduct.badge || '',
        updatedProduct.status || 'published',
        !!updatedProduct.isFeatured,
        updatedProduct.image || '',
        JSON.stringify(updatedProduct.images || []),
        updatedProduct.altText || '',
        updatedProduct.description || '',
        JSON.stringify(updatedProduct.specs || []),
        JSON.stringify(updatedProduct.attachments || []),
        updatedProduct.inStock !== undefined ? updatedProduct.inStock : true,
        updatedProduct.videoUrl || updatedProduct.youtubeVideoUrl || '',
        JSON.stringify(updatedProduct.customTabs || []),
        updatedProduct.productType || 'physical',
        updatedProduct.aPoints != null ? parseInt(updatedProduct.aPoints, 10) : null,
        req.params.id
      ]);
      return res.json(updatedProduct);
    } catch (e) {
      console.error(e);
    }
  }
  const db = readDbJson();
  const index = db.products.findIndex((p) => p.id === req.params.id);
  if (index !== -1) {
    db.products[index] = { ...db.products[index], ...req.body };
    writeDbJson(db);
    return res.json(db.products[index]);
  }
  res.status(404).json({ error: 'Produto não encontrado' });
});

app.delete('/api/products/:id', authenticateToken, async (req, res) => {
  const productId = req.params.id;
  let productToDelete = null;

  if (pool) {
    try {
      const selectRes = await pool.query('SELECT * FROM products WHERE id = $1', [productId]);
      if (selectRes.rows && selectRes.rows.length > 0) {
        productToDelete = selectRes.rows[0];
      }
    } catch (e) {
      console.error('[Delete Product DB Select Error]:', e);
    }
  }

  if (!productToDelete) {
    const db = readDbJson();
    productToDelete = (db.products || []).find((p) => p.id === productId);
  }

  // If product found, delete its images & attachments from Cloudflare R2 / Cloudinary
  if (productToDelete) {
    const imagesToDelete = [];

    // Main image
    if (productToDelete.image) {
      imagesToDelete.push(productToDelete.image);
    }

    // Gallery images
    if (Array.isArray(productToDelete.images)) {
      productToDelete.images.forEach(img => {
        if (img && typeof img === 'string') imagesToDelete.push(img);
      });
    }

    // PDF Attachments
    if (Array.isArray(productToDelete.attachments)) {
      productToDelete.attachments.forEach(att => {
        if (att && att.url && typeof att.url === 'string') imagesToDelete.push(att.url);
      });
    }

    // Remove duplicates
    const uniqueUrls = [...new Set(imagesToDelete)];

    for (const url of uniqueUrls) {
      try {
        if (isR2Configured && (url.includes('.r2.dev') || url.includes('.r2.cloudflarestorage.com'))) {
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
  }

  if (pool) {
    try {
      await pool.query('DELETE FROM products WHERE id = $1', [productId]);
      return res.json({ success: true, id: productId });
    } catch (e) {
      console.error(e);
    }
  }
  const db = readDbJson();
  db.products = (db.products || []).filter((p) => p.id !== productId);
  writeDbJson(db);
  res.json({ success: true, id: productId });
});

app.listen(PORT, () => {
  console.log(`Athena API Backend rodando na porta ${PORT}`);
  console.log(`Swagger API Docs protegida em: http://localhost:${PORT}/api-docs`);
});
