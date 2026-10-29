import dotenv from 'dotenv';
dotenv.config({ path: 'backend/.env' });
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import crypto from 'crypto';
import axios from 'axios';
import pg from 'pg';

const { Pool } = pg;

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'athena-catalogo';
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev';

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
  console.error('[ERRO] Credenciais do Cloudflare R2 não encontradas no backend/.env');
  process.exit(1);
}

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Cache in-memory: urlOriginal -> urlR2
const urlCache = new Map();

async function checkObjectExistsInR2(key) {
  try {
    await r2Client.send(new HeadObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }));
    return true;
  } catch (err) {
    if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
      return false;
    }
    return false;
  }
}

async function uploadBufferToR2(webpBuffer, key) {
  await r2Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: webpBuffer,
      ContentType: 'image/webp',
      CacheControl: 'public, max-age=31536000, immutable',
    })
  );
}

async function migrateSigmaImage(url) {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('sigmatools.com.br')) return url;
  if (urlCache.has(url)) return urlCache.get(url);

  try {
    // Gera hash determinístico baseado na URL para evitar duplicatas
    const hash = crypto.createHash('md5').update(url).digest('hex').slice(0, 12);
    // Extrai o nome base amigável do arquivo
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const baseName = pathname.split('/').pop().replace(/\.[^/.]+$/, '').toLowerCase().replace(/[^a-z0-9_-]/g, '-').slice(0, 35);
    const key = `produtos/sigma-${baseName}-${hash}.webp`;
    const r2CanonicalUrl = `${R2_PUBLIC_URL}/${key}`;

    // Verifica se já foi enviado ao R2 anteriormente
    const exists = await checkObjectExistsInR2(key);
    if (exists) {
      urlCache.set(url, r2CanonicalUrl);
      return r2CanonicalUrl;
    }

    // Baixa a imagem original
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 20000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 AthenaCDN/1.0',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Referer': 'https://www.sigmatools.com.br/'
      },
      validateStatus: (status) => status === 200
    });

    const rawBuffer = Buffer.from(response.data);

    // Otimiza com sharp: converte para WebP com qualidade 82 e max dimension de 1200px
    const webpBuffer = await sharp(rawBuffer)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toBuffer();

    // Sobe para o R2
    await uploadBufferToR2(webpBuffer, key);
    urlCache.set(url, r2CanonicalUrl);

    return r2CanonicalUrl;
  } catch (err) {
    console.warn(`[WARN] Falha ao migrar imagem ${url}:`, err.message);
    return url; // Mantém a URL original em caso de falha transitória
  }
}

async function run() {
  console.log('--- Iniciando Migração de Imagens da Sigma Tools para o Cloudflare R2 ---');
  
  const { rows: products } = await pool.query(`
    SELECT id, name, image, images 
    FROM products 
    WHERE image ILIKE '%sigmatools.com.br%' OR images::text ILIKE '%sigmatools.com.br%'
    ORDER BY id ASC
  `);

  console.log(`Encontrados ${products.length} produtos para processamento.`);

  let migratedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    let updatedImage = p.image;
    let updatedImages = Array.isArray(p.images) ? [...p.images] : [];
    let hasChanges = false;

    // Migra imagem principal se for da Sigma
    if (p.image && p.image.includes('sigmatools.com.br')) {
      const newImg = await migrateSigmaImage(p.image);
      if (newImg && newImg !== p.image) {
        updatedImage = newImg;
        hasChanges = true;
      }
    }

    // Migra galeria de imagens secundárias
    if (Array.isArray(p.images)) {
      for (let j = 0; j < p.images.length; j++) {
        const itemImg = p.images[j];
        if (typeof itemImg === 'string' && itemImg.includes('sigmatools.com.br')) {
          const newImg = await migrateSigmaImage(itemImg);
          if (newImg && newImg !== itemImg) {
            updatedImages[j] = newImg;
            hasChanges = true;
          }
        }
      }
    }

    if (hasChanges) {
      try {
        await pool.query(
          `UPDATE products SET image = $1, images = $2, updated_at = NOW() WHERE id = $3`,
          [updatedImage, JSON.stringify(updatedImages), p.id]
        );
        migratedCount++;
        console.log(`[${i + 1}/${products.length}] ✅ [${p.id}] ${p.name.slice(0, 45)}... -> R2`);
      } catch (dbErr) {
        errorCount++;
        console.error(`[DB ERROR] Falha ao atualizar produto ${p.id}:`, dbErr.message);
      }
    } else {
      skippedCount++;
    }
  }

  console.log('--- Migração Concluída ---');
  console.log(`Total de produtos analisados: ${products.length}`);
  console.log(`Produtos atualizados para R2: ${migratedCount}`);
  console.log(`Inalterados/Ignorados: ${skippedCount}`);
  console.log(`Erros: ${errorCount}`);
  console.log(`Total de imagens únicas salvas no cache R2: ${urlCache.size}`);

  await pool.end();
}

run().catch((err) => {
  console.error('[FATAL] Erro na execução da migração:', err);
  process.exit(1);
});
