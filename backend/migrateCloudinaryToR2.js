require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { isR2Configured, uploadToR2, R2_PUBLIC_URL } = require('./r2Service');
const { Pool } = require('pg');

const DB_PATH = path.join(__dirname, 'data', 'athena-db.json');

// Initialize PostgreSQL pool if DATABASE_URL is set
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    })
  : null;

async function downloadImageAsBuffer(url) {
  const response = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 25000,
    headers: {
      'User-Agent': 'Mozilla/5.0 Athena-Migrator/1.0',
    },
  });
  return Buffer.from(response.data);
}

async function migrateSingleUrl(url, folder = 'produtos', namePrefix = 'item') {
  if (!url || typeof url !== 'string') return url;
  
  // If URL is already on R2, skip
  if (R2_PUBLIC_URL && url.includes(R2_PUBLIC_URL)) {
    return url;
  }
  if (url.includes('.r2.dev') || url.includes('.r2.cloudflarestorage.com')) {
    return url;
  }

  // Handle base64, external URLs (Cloudinary/Unsplash), and local public files
  try {
    let buffer;
    if (url.startsWith('data:image')) {
      const base64Data = url.replace(/^data:image\/\w+;base64,/, '');
      buffer = Buffer.from(base64Data, 'base64');
    } else if (url.startsWith('http://') || url.startsWith('https://')) {
      buffer = await downloadImageAsBuffer(url);
    } else if (url.startsWith('/')) {
      const cleanPath = url.replace(/^\//, '');
      const localFilePath = path.join(__dirname, '..', 'public', cleanPath);
      if (fs.existsSync(localFilePath)) {
        buffer = fs.readFileSync(localFilePath);
      } else {
        return url;
      }
    } else {
      return url;
    }

    const cleanPrefix = namePrefix.toLowerCase().replace(/[^a-z0-9-_]/g, '-').slice(0, 30);
    const result = await uploadToR2({
      file: buffer,
      folder,
      filename: `${cleanPrefix}`
    });

    return result.url;
  } catch (error) {
    console.error(`Falha ao migrar URL "${url.slice(0, 60)}...":`, error.message);
    return url; // Keep original if failed
  }
}

async function runMigration() {
  console.log('---------------------------------------------------------');
  console.log('INICIANDO MIGRAÇÃO AUTOMÁTICA CLOUDINARY -> CLOUDFLARE R2');
  console.log('---------------------------------------------------------');

  if (!isR2Configured) {
    console.error('ERRO: Credenciais do Cloudflare R2 não foram encontradas no .env!');
    process.exit(1);
  }

  let dbData = { products: [], categories: [], brands: [] };

  // 1. Read from PostgreSQL or JSON file
  let isPg = false;
  if (pool) {
    try {
      const client = await pool.connect();
      const resProds = await client.query('SELECT * FROM products ORDER BY id ASC');
      const resCats = await client.query('SELECT * FROM categories ORDER BY id ASC');
      const resBrands = await client.query('SELECT * FROM brands ORDER BY id ASC');
      client.release();
      dbData.products = resProds.rows;
      dbData.categories = resCats.rows;
      dbData.brands = resBrands.rows;
      isPg = true;
      console.log(`Conectado ao PostgreSQL. ${dbData.products.length} produtos encontrados.`);
    } catch (e) {
      console.log('PostgreSQL não conectado. Usando athena-db.json local.');
    }
  }

  if (!isPg && fs.existsSync(DB_PATH)) {
    try {
      const raw = fs.readFileSync(DB_PATH, 'utf8');
      dbData = JSON.parse(raw);
      console.log(`Arquivo local carregado: ${dbData.products?.length || 0} produtos.`);
    } catch (e) {
      console.error('Erro ao ler athena-db.json:', e.message);
    }
  }

  const products = dbData.products || [];
  const brands = dbData.brands || [];
  let totalMigrated = 0;

  // 2. Migrate Product Images
  console.log(`\nProcessando ${products.length} produtos...`);
  for (let i = 0; i < products.length; i++) {
    const prod = products[i];
    let changed = false;

    // Cover Image
    if (prod.image && !prod.image.includes('.r2.dev') && !prod.image.includes('.r2.cloudflarestorage.com')) {
      const newUrl = await migrateSingleUrl(prod.image, 'produtos', prod.slug || prod.name || `prod-${prod.id}`);
      if (newUrl !== prod.image) {
        prod.image = newUrl;
        changed = true;
        totalMigrated++;
      }
    }

    // Gallery Images Array
    if (Array.isArray(prod.images) && prod.images.length > 0) {
      const newGallery = [];
      for (let g = 0; g < prod.images.length; g++) {
        const imgUrl = prod.images[g];
        if (imgUrl && !imgUrl.includes('.r2.dev') && !imgUrl.includes('.r2.cloudflarestorage.com')) {
          const newUrl = await migrateSingleUrl(imgUrl, 'produtos', `${prod.slug || 'prod'}-galeria-${g + 1}`);
          newGallery.push(newUrl);
          if (newUrl !== imgUrl) {
            changed = true;
            totalMigrated++;
          }
        } else {
          newGallery.push(imgUrl);
        }
      }
      prod.images = newGallery;
    }

    if (changed && (i + 1) % 5 === 0) {
      console.log(`[Progresso] ${i + 1}/${products.length} produtos processados... (${totalMigrated} imagens migradas para WebP no R2)`);
    }
  }

  // 3. Migrate Brand Logos
  console.log(`\nProcessando ${brands.length} marcas...`);
  for (let b = 0; b < brands.length; b++) {
    const brand = brands[b];
    if (brand.logo && !brand.logo.includes('.r2.dev') && !brand.logo.includes('.r2.cloudflarestorage.com')) {
      const newLogo = await migrateSingleUrl(brand.logo, 'marcas', brand.slug || brand.name || `brand-${brand.id}`);
      if (newLogo !== brand.logo) {
        brand.logo = newLogo;
        totalMigrated++;
      }
    }
  }

  // 4. Save updated data back
  if (isPg && pool) {
    const client = await pool.connect();
    for (const p of products) {
      await client.query(
        'UPDATE products SET image = $1, images = $2 WHERE id = $3',
        [p.image, JSON.stringify(p.images || []), p.id]
      );
    }
    for (const b of brands) {
      await client.query('UPDATE brands SET logo = $1 WHERE id = $2', [b.logo, b.id]);
    }
    client.release();
    console.log('Banco de dados PostgreSQL atualizado com sucesso com as novas URLs do Cloudflare R2!');
  } else {
    fs.writeFileSync(DB_PATH, JSON.stringify(dbData, null, 2), 'utf8');
    console.log(`Arquivo local ${DB_PATH} atualizado com sucesso!`);
  }

  // Also sync frontend src/data/initialData.js
  const INITIAL_DATA_PATH = path.join(__dirname, '..', 'src', 'data', 'initialData.js');
  if (fs.existsSync(INITIAL_DATA_PATH)) {
    const initialDataContent = `export const INITIAL_CATEGORIES = ${JSON.stringify(dbData.categories || [], null, 2)};\n\nexport const INITIAL_BRANDS = ${JSON.stringify(dbData.brands || [], null, 2)};\n\nexport const INITIAL_PRODUCTS = ${JSON.stringify(dbData.products || [], null, 2)};\n`;
    fs.writeFileSync(INITIAL_DATA_PATH, initialDataContent, 'utf8');
    console.log(`Arquivo frontend src/data/initialData.js sincronizado com sucesso!`);
  }

  console.log('---------------------------------------------------------');
  console.log(`MIGRAÇÃO CONCLUÍDA COM SUCESSO!`);
  console.log(`Total de imagens convertidas para WebP e enviadas ao R2: ${totalMigrated}`);
  console.log('---------------------------------------------------------');
}

if (require.main === module) {
  runMigration()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Erro fatal na migração:', err);
      process.exit(1);
    });
}

module.exports = { runMigration };
