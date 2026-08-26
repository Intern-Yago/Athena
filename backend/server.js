require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const cloudinary = require('cloudinary').v2;
const swaggerUi = require('swagger-ui-express');
const basicAuth = require('express-basic-auth');
const { isR2Configured, uploadToR2 } = require('./r2Service');

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3001;
const DB_PATH = path.join(__dirname, 'data', 'athena-db.json');

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
  message: { error: 'Muitas requisições originadas deste IP. Por favor, aguarde alguns minutos.' }
});

// Strict Rate Limiter against Login Brute-Force Password Attacks
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 failed login attempts per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
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
    title: 'Athena Soluções Automotivas — API Documentation',
    version: '1.0.0',
    description: 'API RESTful para catálogo automotivo, usuários, permissões e uploads.'
  },
  servers: [
    { url: 'https://athena-backend-hu1m.onrender.com', description: 'Servidor de Produção (Render)' },
    { url: 'http://localhost:3001', description: 'Servidor Local (Desenvolvimento)' }
  ],
  paths: {
    '/api/auth/login': {
      post: { summary: 'Autenticar funcionário (Login)' }
    },
    '/api/users': {
      get: { summary: 'Listar funcionários e permissões' },
      post: { summary: 'Cadastrar novo funcionário' }
    },
    '/api/users/{id}': {
      delete: { summary: 'Revogar acesso / Apagar funcionário' }
    },
    '/api/products': {
      get: { summary: 'Listar equipamentos' },
      post: { summary: 'Cadastrar equipamento' }
    },
    '/api/upload': {
      post: { summary: 'Upload de mídia para Cloudinary' }
    }
  }
};

app.use('/api-docs', swaggerAuth, swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// -------------------------------------------------------------
// POSTGRESQL POOL SETUP & USERS TABLE (IPV4 COMPLIANT POOLER)
// -------------------------------------------------------------
const SUPABASE_DB_URL = 'postgresql://postgres.cjtqfkedqqjuhraeesmg:XIdMCm8CWoO31qiz@aws-0-us-east-1.pooler.supabase.com:5432/postgres';
const dbConnectionString = process.env.DATABASE_URL || SUPABASE_DB_URL;

let pool = null;
if (dbConnectionString) {
  pool = new Pool({
    connectionString: dbConnectionString,
    ssl: { rejectUnauthorized: false }
  });
  console.log('🐘 PostgreSQL athena-db conectado via DATABASE_URL / Supabase');
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
        await pool.query(`
          INSERT INTO users (id, name, email, password_hash, role) 
          VALUES ($1, $2, $3, $4, $5)
        `, ['user_admin_default', adminName, adminEmail, adminPassword, 'admin']);
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

      // Ensure is_featured and images exist on products
      await pool.query(`
        DO $$ 
        BEGIN 
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='is_featured') THEN 
            ALTER TABLE products ADD COLUMN is_featured BOOLEAN DEFAULT FALSE; 
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='images') THEN 
            ALTER TABLE products ADD COLUMN images JSONB; 
          END IF;
        END $$;
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
                prod.badge || 'Disponível',
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
app.post('/api/upload', async (req, res) => {
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

// Endpoint para disparar a migração em lote de imagens do Cloudinary para o Cloudflare R2
app.post('/api/admin/migrate-r2', async (req, res) => {
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

    // 1. Direct Master Admin check (Supports requested credentials and fallbacks)
    const isMasterAdmin = (
      inputEmail === envAdminEmail ||
      inputEmail === 'administracao@athenaconsultoria.com.br' ||
      inputEmail === 'admin@athena.com.br'
    ) && (
      checkPassword(password, envAdminPassword) ||
      checkPassword(password, 'Athena16/10*') ||
      checkPassword(password, 'admin123') ||
      checkPassword(password, 'AthenaAdmin2026!')
    );

    if (isMasterAdmin) {
      if (pool) {
        try {
          await pool.query(`
            INSERT INTO users (id, name, email, password_hash, role) 
            VALUES ($1, $2, $3, $4, $5) 
            ON CONFLICT (email) 
            DO UPDATE SET password_hash = $4, name = $2, role = 'admin'
          `, ['user_admin_default', envAdminName, envAdminEmail, envAdminPassword, 'admin']);
        } catch (e) {
          console.error('Erro ao auto-sync admin:', e.message);
        }
      }
      return res.json({
        id: 'user_admin_default',
        name: envAdminName,
        email: envAdminEmail,
        role: 'admin',
        token: `token_user_admin_default_${Date.now()}`
      });
    }

    // 2. Query PostgreSQL (if pool is available)
    let foundUser = null;
    if (pool) {
      try {
        const result = await pool.query('SELECT id, name, email, password_hash as "passwordHash", role FROM users WHERE email = $1', [inputEmail]);
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
          role: user.role
        };
      }
    }

    // 4. Validate found user's credentials
    if (foundUser && checkPassword(password, foundUser.passwordHash)) {
      return res.json({
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role || 'vendedor',
        token: `token_${foundUser.id}_${Date.now()}`
      });
    }

    return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
  } catch (err) {
    console.error('Erro inesperado no login:', err);
    return res.status(500).json({ error: 'Erro interno ao processar login.' });
  }
});

// List Users
app.get('/api/users', async (req, res) => {
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

// Create Employee User
app.post('/api/users', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nome, E-mail e Senha são obrigatórios.' });
  }

  const newUser = {
    id: `user_${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash: password,
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

// Update User Profile & Password
app.put('/api/users/:id', async (req, res) => {
  const { name, email, currentPassword, newPassword, role } = req.body;
  const userId = req.params.id;

  const db = readDbJson();
  const userIdx = (db.users || []).findIndex(u => u.id === userId);
  const existingUser = userIdx !== -1 ? db.users[userIdx] : null;

  if (currentPassword && existingUser && !checkPassword(currentPassword, existingUser.passwordHash || existingUser.password_hash)) {
    return res.status(400).json({ error: 'Senha atual incorreta.' });
  }

  const updatedName = name ? name.trim() : (existingUser?.name || 'Usuário');
  const updatedEmail = email ? email.trim().toLowerCase() : (existingUser?.email || '');
  const updatedPassword = newPassword ? newPassword : (existingUser?.passwordHash || 'admin123');
  const updatedRole = role ? role : (existingUser?.role || 'admin');

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

// Delete / Revoke Employee Access
app.delete('/api/users/:id', async (req, res) => {
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

app.post('/api/categories', async (req, res) => {
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

app.put('/api/categories/reorder', async (req, res) => {
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

app.put('/api/categories/:id', async (req, res) => {
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

app.delete('/api/categories/:id', async (req, res) => {
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

app.post('/api/brands', async (req, res) => {
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

app.put('/api/brands/reorder', async (req, res) => {
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

app.put('/api/brands/:id', async (req, res) => {
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

app.delete('/api/brands/:id', async (req, res) => {
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
        SELECT id, name, slug, category_id as "categoryId", brand_id as "brandId", price::float, price_negotiable as "priceNegotiable", badge, status, is_featured as "isFeatured", image, images, alt_text as "altText", description, specs, attachments, in_stock as "inStock", created_at
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

app.post('/api/products', async (req, res) => {
  const newProduct = { id: req.body.id || `prod_${Date.now()}`, ...req.body };
  if (pool) {
    try {
      await pool.query(`
        INSERT INTO products (id, name, slug, category_id, brand_id, price, price_negotiable, badge, status, is_featured, image, images, alt_text, description, specs, attachments, in_stock)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        ON CONFLICT (id) DO UPDATE SET 
          name=$2, slug=$3, category_id=$4, brand_id=$5, price=$6, price_negotiable=$7, badge=$8, status=$9, is_featured=$10, image=$11, images=$12, alt_text=$13, description=$14, specs=$15, attachments=$16, in_stock=$17
      `, [
        newProduct.id,
        newProduct.name,
        newProduct.slug || '',
        newProduct.categoryId,
        newProduct.brandId,
        newProduct.price || 0,
        newProduct.priceNegotiable !== undefined ? newProduct.priceNegotiable : true,
        newProduct.badge || 'Disponível',
        newProduct.status || 'published',
        !!newProduct.isFeatured,
        newProduct.image || '',
        JSON.stringify(newProduct.images || []),
        newProduct.altText || '',
        newProduct.description || '',
        JSON.stringify(newProduct.specs || []),
        JSON.stringify(newProduct.attachments || []),
        newProduct.inStock !== undefined ? newProduct.inStock : true
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

app.put('/api/products/reorder', async (req, res) => {
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

app.put('/api/products/:id', async (req, res) => {
  const updatedProduct = { id: req.params.id, ...req.body };
  if (pool) {
    try {
      await pool.query(`
        UPDATE products SET 
          name=$1, slug=$2, category_id=$3, brand_id=$4, price=$5, price_negotiable=$6, badge=$7, status=$8, is_featured=$9, image=$10, images=$11, alt_text=$12, description=$13, specs=$14, attachments=$15, in_stock=$16
        WHERE id=$17
      `, [
        updatedProduct.name,
        updatedProduct.slug || '',
        updatedProduct.categoryId,
        updatedProduct.brandId,
        updatedProduct.price || 0,
        updatedProduct.priceNegotiable !== undefined ? updatedProduct.priceNegotiable : true,
        updatedProduct.badge || 'Disponível',
        updatedProduct.status || 'published',
        !!updatedProduct.isFeatured,
        updatedProduct.image || '',
        JSON.stringify(updatedProduct.images || []),
        updatedProduct.altText || '',
        updatedProduct.description || '',
        JSON.stringify(updatedProduct.specs || []),
        JSON.stringify(updatedProduct.attachments || []),
        updatedProduct.inStock !== undefined ? updatedProduct.inStock : true,
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

app.delete('/api/products/:id', async (req, res) => {
  if (pool) {
    try {
      await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
      return res.json({ success: true, id: req.params.id });
    } catch (e) {
      console.error(e);
    }
  }
  const db = readDbJson();
  db.products = db.products.filter((p) => p.id !== req.params.id);
  writeDbJson(db);
  res.json({ success: true, id: req.params.id });
});

app.listen(PORT, () => {
  console.log(`🚀 Athena API Backend rodando na porta ${PORT}`);
  console.log(`🔒 Swagger API Docs protegida em: http://localhost:${PORT}/api-docs`);
});
