const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const SUPABASE_DB_URL = 'postgresql://postgres:XIdMCm8CWoO31qiz@db.cjtqfkedqqjuhraeesmg.supabase.co:5432/postgres';
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  console.log('🔄 Iniciando consolidação de produtos e sincronização do Banco de Dados...');

  // 1. Load extracted JSON files
  const deltaProds = JSON.parse(fs.readFileSync(path.join(__dirname, 'delta_extracted.json'), 'utf8'));
  const mahoviProds = JSON.parse(fs.readFileSync(path.join(__dirname, 'mahovi_extracted.json'), 'utf8'));
  const sigmaProds = JSON.parse(fs.readFileSync(path.join(__dirname, 'sigma_extracted.json'), 'utf8'));

  // Load Wolfcar & Starkx
  const wolfcarScript = JSON.parse(fs.readFileSync(path.join(__dirname, 'wolfcar_starkx_data.json'), 'utf8'));

  const allProductsMap = new Map();

  function addProducts(list) {
    for (const p of list) {
      if (!allProductsMap.has(p.id)) {
        allProductsMap.set(p.id, p);
      }
    }
  }

  addProducts(wolfcarScript.wolfcar || []);
  addProducts(wolfcarScript.starkx || []);
  addProducts(mahoviProds || []);
  addProducts(deltaProds || []);
  addProducts(sigmaProds || []);

  const mergedProducts = Array.from(allProductsMap.values());
  console.log(`📦 Total de produtos consolidados: ${mergedProducts.length}`);

  // 2. Update backend/data/athena-db.json
  const dbPath = path.join(__dirname, '..', 'backend', 'data', 'athena-db.json');
  let currentDb = { users: [], categories: [], brands: [], products: [] };
  if (fs.existsSync(dbPath)) {
    currentDb = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  }

  currentDb.products = mergedProducts;
  fs.writeFileSync(dbPath, JSON.stringify(currentDb, null, 2), 'utf8');
  console.log(`✅ athena-db.json atualizado com ${mergedProducts.length} produtos!`);

  // 3. Update src/data/initialData.js
  const initialDataPath = path.join(__dirname, '..', 'src', 'data', 'initialData.js');
  const initialDataContent = `export const INITIAL_CATEGORIES = ${JSON.stringify(currentDb.categories, null, 2)};\n\nexport const INITIAL_BRANDS = ${JSON.stringify(currentDb.brands, null, 2)};\n\nexport const INITIAL_PRODUCTS = ${JSON.stringify(mergedProducts, null, 2)};\n`;
  fs.writeFileSync(initialDataPath, initialDataContent, 'utf8');
  console.log(`✅ initialData.js atualizado com ${mergedProducts.length} produtos!`);

  // 4. Sync PostgreSQL Supabase Database
  try {
    console.log('🐘 Conectando ao PostgreSQL Supabase...');
    const client = await pool.connect();
    
    // Ensure tables exist
    await client.query(`
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

    // Upsert Categories
    for (const cat of currentDb.categories) {
      await client.query(`
        INSERT INTO categories (id, name, slug, description, icon, "order")
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          slug = EXCLUDED.slug,
          description = EXCLUDED.description,
          icon = EXCLUDED.icon,
          "order" = EXCLUDED."order";
      `, [cat.id, cat.name, cat.slug, cat.description, cat.icon, cat.order || 0]);
    }
    console.log('✅ Categorias sincronizadas no Supabase!');

    // Upsert Brands
    for (const brand of currentDb.brands) {
      await client.query(`
        INSERT INTO brands (id, name, slug, description, logo, website_url, "order")
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          slug = EXCLUDED.slug,
          description = EXCLUDED.description,
          logo = EXCLUDED.logo,
          website_url = EXCLUDED.website_url,
          "order" = EXCLUDED."order";
      `, [brand.id, brand.name, brand.slug, brand.description, brand.logo, brand.websiteUrl, brand.order || 0]);
    }
    console.log('✅ Marcas sincronizadas no Supabase!');

    // Batch upsert products
    console.log(`⏳ Gravando ${mergedProducts.length} produtos no Supabase...`);
    let count = 0;
    for (const prod of mergedProducts) {
      await client.query(`
        INSERT INTO products (
          id, name, slug, category_id, brand_id, price, price_negotiable,
          badge, status, is_featured, image, images, alt_text, description,
          specs, attachments, in_stock
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          slug = EXCLUDED.slug,
          category_id = EXCLUDED.category_id,
          brand_id = EXCLUDED.brand_id,
          price = EXCLUDED.price,
          price_negotiable = EXCLUDED.price_negotiable,
          badge = EXCLUDED.badge,
          status = EXCLUDED.status,
          is_featured = EXCLUDED.is_featured,
          image = EXCLUDED.image,
          images = EXCLUDED.images,
          alt_text = EXCLUDED.alt_text,
          description = EXCLUDED.description,
          specs = EXCLUDED.specs,
          attachments = EXCLUDED.attachments,
          in_stock = EXCLUDED.in_stock;
      `, [
        prod.id,
        prod.name,
        prod.slug,
        prod.categoryId,
        prod.brandId,
        prod.price || 0,
        prod.priceNegotiable !== false,
        prod.badge || 'Disponível',
        prod.status || 'published',
        !!prod.isFeatured,
        prod.image,
        JSON.stringify(prod.images || [prod.image]),
        prod.altText || prod.name,
        prod.description || '',
        JSON.stringify(prod.specs || []),
        JSON.stringify(prod.attachments || []),
        prod.inStock !== false
      ]);
      count++;
      if (count % 100 === 0) {
        console.log(`   ... ${count} / ${mergedProducts.length} produtos gravados no Supabase`);
      }
    }

    client.release();
    console.log(`🎉 SUCESSO! Todos os ${count} produtos estão sincronizados no PostgreSQL Supabase!`);
  } catch (err) {
    console.error('❌ Erro na sincronização com Supabase:', err);
  } finally {
    await pool.end();
  }
}

main();
