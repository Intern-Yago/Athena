require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const cloudinary = require('cloudinary').v2;
const swaggerUi = require('swagger-ui-express');
const basicAuth = require('express-basic-auth');
const { isR2Configured, uploadToR2, deleteFromR2 } = require('./r2Service');

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3001;
const DB_PATH = path.join(__dirname, 'data', 'athena-db.json');

// -------------------------------------------------------------
// GOOGLE SMTP & NODEMAILER CONFIGURATION (GMAIL EMAIL SERVICE)
// -------------------------------------------------------------
const SMTP_USER = process.env.SMTP_USER || process.env.GMAIL_USER || 'athena.consultoria.automotiva@gmail.com';
const SMTP_PASS = process.env.SMTP_PASS || process.env.GMAIL_PASS || process.env.GMAIL_APP_PASSWORD || '';
const SMTP_FROM = process.env.SMTP_FROM || `"Athena Soluções Automotivas" <${SMTP_USER}>`;

let mailTransporter = null;
if (SMTP_PASS) {
  mailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });
  console.log('📧 Google SMTP (Gmail) configurado com sucesso para:', SMTP_USER);
} else {
  console.log('ℹ️ Google SMTP em modo log (Defina GMAIL_APP_PASSWORD no .env para envio real).');
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
        subject: 'Código de Recuperação de Senha — Athena Soluções Automotivas',
        html: htmlContent
      });
      return { success: true, method: 'smtp' };
    } catch (err) {
      console.error('Erro no envio SMTP:', err.message);
    }
  }

  console.log(`🔑 [DEBUG CÓDIGO DE RECUPERAÇÃO] E-mail: ${toEmail} | Código: ${resetCode}`);
  return { success: true, method: 'log', code: resetCode };
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
  console.log('🐘 PostgreSQL athena-db conectado via DATABASE_URL');
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
        console.log(`👤 Criando usuário Administrador inicial (${adminEmail})...`);
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
        DO $$ 
        BEGIN 
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='is_featured') THEN 
            ALTER TABLE products ADD COLUMN is_featured BOOLEAN DEFAULT FALSE; 
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='images') THEN 
            ALTER TABLE products ADD COLUMN images JSONB; 
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='video_url') THEN 
            ALTER TABLE products ADD COLUMN video_url TEXT; 
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='custom_tabs') THEN 
            ALTER TABLE products ADD COLUMN custom_tabs JSONB; 
          END IF;
          -- Customer fields on users table
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='phone') THEN 
            ALTER TABLE users ADD COLUMN phone VARCHAR(50); 
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='document') THEN 
            ALTER TABLE users ADD COLUMN document VARCHAR(50); 
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='company_name') THEN 
            ALTER TABLE users ADD COLUMN company_name VARCHAR(255); 
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='address') THEN 
            ALTER TABLE users ADD COLUMN address JSONB; 
          END IF;
        END $$;
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
          status VARCHAR(50) DEFAULT 'em_analise',
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

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
            console.log(`📦 Seeded ${dbData.products.length} produtos do athena-db.json no PostgreSQL!`);
          }
        } catch (seedErr) {
          console.error('Erro ao sincronizar produtos do JSON para PostgreSQL:', seedErr);
        }
      }

      console.log('✅ PostgreSQL athena-db pronto!');

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
  if (!fs.existsSync(DB_PATH)) return { users: [], categories: [], brands: [], products: [] };
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}

function writeDbJson(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

initDb();

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

// Endpoint para excluir imagem do Cloudflare R2
app.post('/api/upload/delete', authenticateToken, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'Nenhuma URL informada para exclusão.' });
    }

    // 1. Tenta excluir do Cloudflare R2
    if (isR2Configured && (url.includes('.r2.dev') || url.includes('.r2.cloudflarestorage.com'))) {
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
        role: 'admin'
      });

      return res.json({
        id: 'user_admin_default',
        name: envAdminName,
        email: envAdminEmail,
        role: 'admin',
        token,
        expiresAt
      });
    }

    // 2. Query PostgreSQL (if pool is available)
    let foundUser = null;
    if (pool) {
      try {
        const result = await pool.query('SELECT id, name, email, password_hash as "passwordHash", role, phone, document, company_name as "companyName", address FROM users WHERE email = $1', [inputEmail]);
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
          address: user.address || null
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

      const { token, expiresAt } = generateToken({
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        role: userRole
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

// Register New Customer (Self-Registration)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, document, companyName, address } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, E-mail e Senha são obrigatórios para cadastro.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres.' });
    }

    const inputEmail = email.trim().toLowerCase();

    // Check if email already exists
    if (pool) {
      try {
        const check = await pool.query('SELECT id FROM users WHERE email = $1', [inputEmail]);
        if (check.rows.length > 0) {
          return res.status(400).json({ error: 'Este e-mail já está cadastrado. Faça login ou recupere sua senha.' });
        }
      } catch (e) {
        console.error('Erro ao verificar e-mail duplicado no PG:', e.message);
      }
    }

    const db = readDbJson();
    if (!db.users) db.users = [];
    if (db.users.some(u => u.email.toLowerCase() === inputEmail)) {
      return res.status(400).json({ error: 'Este e-mail já está cadastrado. Faça login ou recupere sua senha.' });
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

    // Save to Local DB JSON
    db.users.push(cleanUser);
    writeDbJson(db);

    // Save to PostgreSQL
    if (pool) {
      try {
        await pool.query(`
          INSERT INTO users (id, name, email, password_hash, role, phone, document, company_name, address)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          cleanUser.id,
          cleanUser.name,
          cleanUser.email,
          cleanUser.passwordHash,
          cleanUser.role,
          cleanUser.phone,
          cleanUser.document,
          cleanUser.companyName,
          cleanUser.address ? JSON.stringify(cleanUser.address) : null
        ]);
      } catch (pgErr) {
        console.error('Erro ao inserir cliente no PostgreSQL:', pgErr.message);
      }
    }

    const { token, expiresAt } = generateToken({
      id: cleanUser.id,
      name: cleanUser.name,
      email: cleanUser.email,
      role: 'cliente'
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
      token,
      expiresAt,
      message: 'Cadastro realizado com sucesso!'
    });
  } catch (err) {
    console.error('Erro no cadastro de cliente:', err);
    return res.status(500).json({ error: 'Erro interno ao realizar cadastro.' });
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
      return res.status(404).json({ error: 'Nenhuma conta encontrada com este e-mail.' });
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
      message: 'Código de recuperação enviado para o seu e-mail!',
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

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'A nova senha deve ter no mínimo 6 caracteres.' });
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
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'A nova senha deve ter no mínimo 6 caracteres.' });
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
        role: existingUser.role || 'cliente'
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

// Verify active session & token endpoint
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  return res.json({
    user: req.user,
    valid: true
  });
});

// List Users (Restricted to Administrator)
app.get('/api/users', authenticateToken, requireAdmin, async (req, res) => {
  if (pool) {
    try {
      const result = await pool.query('SELECT id, name, email, role, created_at as "createdAt" FROM users ORDER BY created_at DESC');
      if (result.rows && result.rows.length > 0) {
        return res.json(result.rows);
      }
    } catch (e) {
      console.error('Erro ao listar usuários do PostgreSQL:', e.message);
    }
  }
  const db = readDbJson();
  const cleanUsers = (db.users || []).map(({ passwordHash, password_hash, ...rest }) => rest);
  res.json(cleanUsers);
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
        SELECT id, name, slug, category_id as "categoryId", brand_id as "brandId", price::float, price_negotiable as "priceNegotiable", badge, status, is_featured as "isFeatured", image, images, alt_text as "altText", description, specs, attachments, in_stock as "inStock", video_url as "videoUrl", custom_tabs as "customTabs", created_at
        FROM products 
        ORDER BY created_at DESC
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
        INSERT INTO products (id, name, slug, category_id, brand_id, price, price_negotiable, badge, status, is_featured, image, images, alt_text, description, specs, attachments, in_stock, video_url, custom_tabs)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        ON CONFLICT (id) DO UPDATE SET 
          name=$2, slug=$3, category_id=$4, brand_id=$5, price=$6, price_negotiable=$7, badge=$8, status=$9, is_featured=$10, image=$11, images=$12, alt_text=$13, description=$14, specs=$15, attachments=$16, in_stock=$17, video_url=$18, custom_tabs=$19
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
        JSON.stringify(newProduct.customTabs || [])
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
          name=$1, slug=$2, category_id=$3, brand_id=$4, price=$5, price_negotiable=$6, badge=$7, status=$8, is_featured=$9, image=$10, images=$11, alt_text=$12, description=$13, specs=$14, attachments=$15, in_stock=$16, video_url=$17, custom_tabs=$18
        WHERE id=$19
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
  console.log(`🚀 Athena API Backend rodando na porta ${PORT}`);
  console.log(`🔒 Swagger API Docs protegida em: http://localhost:${PORT}/api-docs`);
});
