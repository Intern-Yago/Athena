const { Pool } = require('./backend/node_modules/pg');
const fs = require('fs');

const SUPABASE_URL = 'postgresql://postgres:XIdMCm8CWoO31qiz@db.cjtqfkedqqjuhraeesmg.supabase.co:5432/postgres';

const pool = new Pool({
  connectionString: SUPABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function migrate() {
  console.log('🚀 Iniciando conexão e migração para o Supabase PostgreSQL...');

  try {
    const client = await pool.connect();
    console.log('✅ Conexão com o Supabase estabelecida com sucesso!');

    // 1. Criar Tabelas no Supabase
    console.log('📦 Criando tabelas no Supabase...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'vendedor',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

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

    // Ensure is_featured column exists if table already existed
    await client.query(`
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

    console.log('✅ Estrutura de tabelas criada e validada no Supabase!');

    // 2. Ler os dados atualizados do banco local
    const dbPath = fs.existsSync('./data/athena-db.json') ? './data/athena-db.json' : './backend/data/athena-db.json';
    const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

    // 3. Migrar Usuários
    console.log(`👤 Migrando ${dbData.users.length} usuário(s)...`);
    for (const u of dbData.users) {
      await client.query(`
        INSERT INTO users (id, name, email, password_hash, role)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (email) DO UPDATE SET
          name = $2, password_hash = $4, role = $5
      `, [u.id, u.name, u.email.toLowerCase(), u.passwordHash, u.role || 'admin']);
    }

    // 4. Migrar Categorias
    console.log(`🗂️ Migrando ${dbData.categories.length} categoria(s)...`);
    for (const c of dbData.categories) {
      await client.query(`
        INSERT INTO categories (id, name, slug, description, icon, "order")
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET
          name = $2, slug = $3, description = $4, icon = $5, "order" = $6
      `, [c.id, c.name, c.slug, c.description, c.icon || 'Layers', c.order || 0]);
    }

    // 5. Migrar Marcas
    console.log(`🏷️ Migrando ${dbData.brands.length} marca(s)...`);
    for (const b of dbData.brands) {
      await client.query(`
        INSERT INTO brands (id, name, slug, description, logo, website_url, "order")
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO UPDATE SET
          name = $2, slug = $3, description = $4, logo = $5, website_url = $6, "order" = $7
      `, [b.id, b.name, b.slug, b.description, b.logo, b.websiteUrl || '', b.order || 0]);
    }

    // 6. Migrar Produtos
    console.log(`📦 Migrando ${dbData.products.length} produto(s)...`);
    for (const p of dbData.products) {
      await client.query(`
        INSERT INTO products (
          id, name, slug, category_id, brand_id, price, price_negotiable, badge, status, is_featured, image, images, alt_text, description, specs, attachments, in_stock
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
        )
        ON CONFLICT (id) DO UPDATE SET
          name = $2,
          slug = $3,
          category_id = $4,
          brand_id = $5,
          price = $6,
          price_negotiable = $7,
          badge = $8,
          status = $9,
          is_featured = $10,
          image = $11,
          images = $12,
          alt_text = $13,
          description = $14,
          specs = $15,
          attachments = $16,
          in_stock = $17
      `, [
        p.id,
        p.name,
        p.slug || '',
        p.categoryId,
        p.brandId,
        p.price || 0,
        p.priceNegotiable !== undefined ? p.priceNegotiable : true,
        p.badge || 'Disponível',
        p.status || 'published',
        !!p.isFeatured,
        p.image || '',
        JSON.stringify(p.images || []),
        p.altText || '',
        p.description || '',
        JSON.stringify(p.specs || []),
        JSON.stringify(p.attachments || []),
        p.inStock !== undefined ? p.inStock : true
      ]);
    }

    // 7. Validação Final
    const usersCount = await client.query('SELECT COUNT(*) FROM users');
    const catsCount = await client.query('SELECT COUNT(*) FROM categories');
    const brandsCount = await client.query('SELECT COUNT(*) FROM brands');
    const prodsCount = await client.query('SELECT COUNT(*) FROM products');
    const featCount = await client.query('SELECT COUNT(*) FROM products WHERE is_featured = TRUE');

    console.log('\n=============================================');
    console.log('🎉 MIGRAÇÃO PARA O SUPABASE CONCLUÍDA!');
    console.log(`👤 Usuários no Supabase: ${usersCount.rows[0].count}`);
    console.log(`🗂️ Categorias no Supabase: ${catsCount.rows[0].count}`);
    console.log(`🏷️ Marcas no Supabase: ${brandsCount.rows[0].count}`);
    console.log(`📦 Produtos no Supabase: ${prodsCount.rows[0].count}`);
    console.log(`⭐ Destaques no Supabase: ${featCount.rows[0].count}`);
    console.log('=============================================\n');

    client.release();
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro na migração para o Supabase:', err);
    process.exit(1);
  }
}

migrate();
