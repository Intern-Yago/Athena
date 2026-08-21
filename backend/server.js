const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const cloudinary = require('cloudinary').v2;
const swaggerUi = require('swagger-ui-express');
const basicAuth = require('express-basic-auth');

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
// POSTGRESQL POOL SETUP & USERS TABLE
// -------------------------------------------------------------
let pool = null;
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  console.log('🐘 PostgreSQL athena-db conectado via DATABASE_URL');
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
      const adminEmail = (process.env.ADMIN_EMAIL || 'admin@athena.com.br').trim().toLowerCase();
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
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
          image TEXT,
          alt_text TEXT,
          description TEXT,
          specs JSONB,
          attachments JSONB,
          in_stock BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
          ('cat_ferramentas', 'Ferramentas Especiais', 'ferramentas', 'Kits de sincronismo, saca-filtros, prensas hidráulicas e ferramentas para centro automotivo.', 'Wrench', 5);
        `);
      }

      const brandCheck = await pool.query('SELECT COUNT(*) FROM brands');
      if (parseInt(brandCheck.rows[0].count, 10) === 0) {
        await pool.query(`
          INSERT INTO brands (id, name, slug, description, logo, website_url, "order") VALUES
          ('brand_engecass', 'Engecass', 'engecass', 'Líder nacional em elevadores automotivos de alta resistência.', 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=200&auto=format&fit=crop&q=80', 'https://engecass.com.br', 1),
          ('brand_launch', 'Launch', 'launch', 'Tecnologia global em scanners de diagnóstico e codificação de módulos.', 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=200&auto=format&fit=crop&q=80', 'https://www.launchtech.com.br', 2),
          ('brand_raven', 'Raven', 'raven', 'Referência em ferramentas especiais e diagnóstico para oficinas.', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200&auto=format&fit=crop&q=80', 'https://www.ravenferramentas.com.br', 3),
          ('brand_napro', 'Napro', 'napro', 'Pioneira em sistemas informatizados de diagnóstico automotivo.', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=200&auto=format&fit=crop&q=80', 'https://www.napro.com.br', 4),
          ('brand_sun', 'Sun Equipment', 'sun-equipment', 'Sistemas de alinhamento 3D e diagnóstico premium.', 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=200&auto=format&fit=crop&q=80', 'https://www.sun.com.br', 5);
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
// CLOUDINARY UPLOAD ENDPOINT
// -------------------------------------------------------------
app.post('/api/upload', async (req, res) => {
  try {
    const { file, folder } = req.body;
    if (!file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }

    const uploadResponse = await cloudinary.uploader.upload(file, {
      folder: folder || 'athena_automotivas',
      resource_type: 'auto'
    });

    return res.json({
      url: uploadResponse.secure_url,
      publicId: uploadResponse.public_id,
      format: uploadResponse.format,
      bytes: uploadResponse.bytes
    });
  } catch (error) {
    console.error('Erro no upload Cloudinary:', error);
    return res.status(500).json({ error: 'Erro ao fazer upload da imagem/arquivo para a nuvem.' });
  }
});

// -------------------------------------------------------------
// AUTH & USER ROLES ENDPOINTS
// -------------------------------------------------------------

// Login (Protected by strict loginLimiter rate limiting)
app.post('/api/auth/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Informe e-mail e senha.' });
  }

  const inputEmail = email.trim().toLowerCase();
  const envAdminEmail = (process.env.ADMIN_EMAIL || 'admin@athena.com.br').trim().toLowerCase();
  const envAdminPassword = process.env.ADMIN_PASSWORD || 'AthenaAdmin2026!';
  const envAdminName = process.env.ADMIN_NAME || 'Administrador Geral';

  // Direct ENV Super Admin match check (Guarantees instant login with environment variables)
  if (inputEmail === envAdminEmail && (password === envAdminPassword || bcrypt.compareSync(password, envAdminPassword))) {
    if (pool) {
      try {
        await pool.query(`
          INSERT INTO users (id, name, email, password_hash, role) 
          VALUES ($1, $2, $3, $4, $5) 
          ON CONFLICT (email) 
          DO UPDATE SET password_hash = $4, name = $2, role = 'admin'
        `, ['user_admin_default', envAdminName, envAdminEmail, envAdminPassword, 'admin']);
      } catch (e) {
        console.error('Erro ao auto-sync admin:', e);
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

  if (pool) {
    try {
      const result = await pool.query('SELECT id, name, email, password_hash as "passwordHash", role FROM users WHERE email = $1', [inputEmail]);
      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
      }
      const user = result.rows[0];
      const isMatch = bcrypt.compareSync(password, user.passwordHash) || user.passwordHash === password;
      if (!isMatch) {
        return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
      }
      return res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: `token_${user.id}_${Date.now()}`
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Erro ao autenticar.' });
    }
  }

  const db = readDbJson();
  const user = (db.users || []).find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user || user.passwordHash !== password) {
    return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
  }
  return res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: `token_${user.id}_${Date.now()}`
  });
});

// List Users
app.get('/api/users', async (req, res) => {
  if (pool) {
    try {
      const result = await pool.query('SELECT id, name, email, role, created_at as "createdAt" FROM users ORDER BY created_at DESC');
      return res.json(result.rows);
    } catch (e) {
      console.error(e);
    }
  }
  const db = readDbJson();
  const cleanUsers = (db.users || []).map(({ passwordHash, ...rest }) => rest);
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

  if (pool) {
    try {
      await pool.query(
        'INSERT INTO users (id, name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5)',
        [newUser.id, newUser.name, newUser.email, newUser.passwordHash, newUser.role]
      );
      return res.status(201).json({ id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role });
    } catch (e) {
      console.error(e);
      if (e.code === '23505') {
        return res.status(400).json({ error: 'Este e-mail já está cadastrado.' });
      }
      return res.status(500).json({ error: 'Erro ao criar funcionário.' });
    }
  }

  const db = readDbJson();
  if (!db.users) db.users = [];
  if (db.users.some(u => u.email.toLowerCase() === newUser.email)) {
    return res.status(400).json({ error: 'Este e-mail já está cadastrado.' });
  }

  db.users.push(newUser);
  writeDbJson(db);
  res.status(201).json({ id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role });
});

// Update User Profile & Password
app.put('/api/users/:id', async (req, res) => {
  const { name, email, currentPassword, newPassword, role } = req.body;
  const userId = req.params.id;

  if (pool) {
    try {
      const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
      if (userRes.rows.length === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }
      const existingUser = userRes.rows[0];

      if (currentPassword && existingUser.password_hash !== currentPassword) {
        return res.status(400).json({ error: 'Senha atual incorreta.' });
      }

      const updatedName = name ? name.trim() : existingUser.name;
      const updatedEmail = email ? email.trim().toLowerCase() : existingUser.email;
      const updatedPassword = newPassword ? newPassword : existingUser.password_hash;
      const updatedRole = role ? role : existingUser.role;

      await pool.query(
        'UPDATE users SET name = $1, email = $2, password_hash = $3, role = $4 WHERE id = $5',
        [updatedName, updatedEmail, updatedPassword, updatedRole, userId]
      );

      return res.json({
        id: userId,
        name: updatedName,
        email: updatedEmail,
        role: updatedRole,
        message: 'Credenciais atualizadas com sucesso!'
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Erro ao atualizar dados do usuário.' });
    }
  }

  const db = readDbJson();
  const userIdx = (db.users || []).findIndex(u => u.id === userId);
  if (userIdx === -1) {
    return res.status(404).json({ error: 'Usuário não encontrado.' });
  }

  const existingUser = db.users[userIdx];
  if (currentPassword && existingUser.passwordHash !== currentPassword) {
    return res.status(400).json({ error: 'Senha atual incorreta.' });
  }

  if (name) existingUser.name = name.trim();
  if (email) existingUser.email = email.trim().toLowerCase();
  if (newPassword) existingUser.passwordHash = newPassword;
  if (role) existingUser.role = role;

  writeDbJson(db);
  res.json({
    id: existingUser.id,
    name: existingUser.name,
    email: existingUser.email,
    role: existingUser.role,
    message: 'Credenciais atualizadas com sucesso!'
  });
});

// Delete / Revoke Employee Access
app.delete('/api/users/:id', async (req, res) => {
  if (pool) {
    try {
      await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
      return res.json({ success: true, id: req.params.id });
    } catch (e) {
      console.error(e);
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
  db.categories = db.categories.filter((c) => c.id !== req.params.id);
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
        SELECT id, name, slug, category_id as "categoryId", brand_id as "brandId", price::float, price_negotiable as "priceNegotiable", badge, status, image, alt_text as "altText", description, specs, attachments, in_stock as "inStock", created_at
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
        INSERT INTO products (id, name, slug, category_id, brand_id, price, price_negotiable, badge, status, image, alt_text, description, specs, attachments, in_stock)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        ON CONFLICT (id) DO UPDATE SET 
          name=$2, slug=$3, category_id=$4, brand_id=$5, price=$6, price_negotiable=$7, badge=$8, status=$9, image=$10, alt_text=$11, description=$12, specs=$13, attachments=$14, in_stock=$15
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
        newProduct.image || '',
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

app.put('/api/products/:id', async (req, res) => {
  const updatedProduct = { id: req.params.id, ...req.body };
  if (pool) {
    try {
      await pool.query(`
        UPDATE products SET 
          name=$1, slug=$2, category_id=$3, brand_id=$4, price=$5, price_negotiable=$6, badge=$7, status=$8, image=$9, alt_text=$10, description=$11, specs=$12, attachments=$13, in_stock=$14
        WHERE id=$15
      `, [
        updatedProduct.name,
        updatedProduct.slug || '',
        updatedProduct.categoryId,
        updatedProduct.brandId,
        updatedProduct.price || 0,
        updatedProduct.priceNegotiable !== undefined ? updatedProduct.priceNegotiable : true,
        updatedProduct.badge || 'Disponível',
        updatedProduct.status || 'published',
        updatedProduct.image || '',
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
