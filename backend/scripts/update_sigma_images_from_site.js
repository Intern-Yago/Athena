const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

function cleanForMatch(str) {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[″”"'\`]/g, ' ')
    .replace(/\//g, ' ')
    .replace(/&quot;/g, ' ')
    .replace(/&amp;/g, ' ')
    .replace(/&#8211;/g, ' ')
    .replace(/&#8243;/g, ' ')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getSignificantTokens(str) {
  const stopWords = new Set([
    'SIGMA', 'TOOLS', 'SGT', 'DE', 'PARA', 'COM', 'SEM', 'EM', 'DO', 'DA', 'DOS', 'DAS',
    'E', 'O', 'A', 'OS', 'AS', 'UM', 'UMA', 'UNS', 'UMAS', 'PRO', 'AUTOMOTIVA', 'PROFISSIONAL'
  ]);
  return cleanForMatch(str).split(' ').filter(w => w.length >= 2 && !stopWords.has(w));
}

async function run() {
  console.log('===============================================================');
  console.log(' ATUALIZAÇÃO DE IMAGENS SIGMA TOOLS ➔ ATHENA VIA SITE OFICIAL ');
  console.log('===============================================================\n');

  // 1. Carregar sitemaps baixados do site oficial da Sigma
  const sm1Path = path.join(__dirname, '../data/sigma_sitemap1.xml');
  const sm2Path = path.join(__dirname, '../data/sigma_sitemap2.xml');

  if (!fs.existsSync(sm1Path) || !fs.existsSync(sm2Path)) {
    throw new Error('Arquivos de sitemap não encontrados em backend/data/');
  }

  const sm1 = fs.readFileSync(sm1Path, 'utf8');
  const sm2 = fs.readFileSync(sm2Path, 'utf8');

  const blocks = [...sm1.split('<url>').slice(1), ...sm2.split('<url>').slice(1)];
  const sigmaSiteProducts = [];

  for (const b of blocks) {
    const locMatch = b.match(/<loc>(.*?)<\/loc>/);
    if (!locMatch || !locMatch[1].includes('/produto/')) continue;
    
    const url = locMatch[1];
    const slug = url.replace('https://www.sigmatools.com.br/site/produto/', '').replace(/\/$/, '');
    const imgMatches = [...b.matchAll(/<image:loc>(.*?)<\/image:loc>/g)].map(m => m[1]);
    
    if (imgMatches.length > 0) {
      sigmaSiteProducts.push({
        url,
        slug,
        mainImage: imgMatches[0],
        images: imgMatches
      });
    }
  }

  console.log(`📦 Produtos com imagens carregados do site oficial da Sigma: ${sigmaSiteProducts.length}`);

  // 2. Indexar produtos do site Sigma
  const siteBySlug = new Map();
  const siteByModel = new Map();

  for (const sp of sigmaSiteProducts) {
    siteBySlug.set(sp.slug.toLowerCase(), sp);
    const mMatch = cleanForMatch(sp.slug).match(/\b(SGT\s*[0-9]+[A-Z0-9]*|MXT\s*[0-9]+[A-Z0-9]*|PWR\s*[0-9]+[A-Z0-9]*|CAR\s*[0-9]+)\b/);
    if (mMatch) {
      const code = mMatch[1].replace(/\s+/g, '');
      if (code.length >= 4 && !siteByModel.has(code)) {
        siteByModel.set(code, sp);
      }
    }
  }

  // 3. Buscar produtos Sigma na Athena
  const athenaProds = (await pool.query(`
    SELECT id, name, slug, sku, omie_code, image, images
    FROM products
    WHERE (brand_id = 'brand_sigmatools' OR name ILIKE '%sigma%' OR sku ILIKE 'SGT%' OR id LIKE 'prod_sigma_%')
      AND status = 'published'
    ORDER BY name ASC
  `)).rows;

  console.log(`📦 Produtos Sigma Tools publicados no catálogo da Athena: ${athenaProds.length}\n`);

  let updatedCount = 0;
  let alreadyIdentical = 0;
  let unmatchedCount = 0;
  const sampleUpdates = [];

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const ap of athenaProds) {
      const apSlug = String(ap.slug || '').toLowerCase();
      let found = siteBySlug.get(apSlug);
      let matchMethod = 'slug_exato';

      // Match por código oficial (SGT-xxxx / MXT-xxxx / PWR-xxxx / CAR-xx)
      if (!found) {
        const mMatch = cleanForMatch(`${ap.sku} ${ap.name} ${ap.slug}`).match(/\b(SGT\s*[0-9]+[A-Z0-9]*|MXT\s*[0-9]+[A-Z0-9]*|PWR\s*[0-9]+[A-Z0-9]*|CAR\s*[0-9]+)\b/);
        if (mMatch) {
          const targetCode = mMatch[1].replace(/\s+/g, '');
          if (siteByModel.has(targetCode)) {
            found = siteByModel.get(targetCode);
            matchMethod = `codigo_${targetCode}`;
          }
        }
      }

      // Match por similaridade de tokens de título
      if (!found) {
        const apTokens = getSignificantTokens(ap.name);
        if (apTokens.length >= 3) {
          let bestScore = 0;
          let bestSp = null;
          for (const sp of sigmaSiteProducts) {
            const spTokens = new Set(getSignificantTokens(sp.slug.replace(/-/g, ' ')));
            let common = 0;
            for (const t of apTokens) {
              if (spTokens.has(t)) common++;
            }
            const score = common / apTokens.length;
            if (score > bestScore && common >= 3) {
              bestScore = score;
              bestSp = sp;
            }
          }
          if (bestScore >= 0.6 && bestSp) {
            found = bestSp;
            matchMethod = `tokens_${Math.round(bestScore * 100)}%`;
          }
        }
      }

      if (found) {
        const curImg = ap.image;
        const newImg = found.mainImage;
        const newImagesJson = JSON.stringify(found.images);

        // Se a imagem for diferente ou estiver vazia/nula, atualiza
        if (curImg !== newImg) {
          await client.query(`
            UPDATE products
            SET image = $1, images = $2::jsonb, updated_at = NOW()
            WHERE id = $3
          `, [newImg, newImagesJson, ap.id]);

          updatedCount++;
          if (sampleUpdates.length < 10) {
            sampleUpdates.push({
              id: ap.id,
              name: ap.name,
              oldImage: curImg,
              newImage: newImg,
              matchMethod
            });
          }
        } else {
          // Atualiza o array de imagens caso esteja nulo ou vazio
          if (!ap.images || (Array.isArray(ap.images) && ap.images.length <= 1 && found.images.length > 1)) {
            await client.query(`
              UPDATE products
              SET images = $1::jsonb, updated_at = NOW()
              WHERE id = $2
            `, [newImagesJson, ap.id]);
          }
          alreadyIdentical++;
        }
      } else {
        unmatchedCount++;
      }
    }

    await client.query('COMMIT');
    console.log('---------------------------------------------------------------');
    console.log(`✅ Imagens atualizadas com sucesso: ${updatedCount}`);
    console.log(`✅ Imagens que já estavam 100% idênticas ao site oficial: ${alreadyIdentical}`);
    console.log(`ℹ️  Produtos sem correspondência no site atual: ${unmatchedCount}`);
    console.log('---------------------------------------------------------------\n');

    console.log('Exemplos de produtos com imagem modernizada:');
    for (const s of sampleUpdates) {
      console.log(`- [${s.matchMethod}] ${s.name}`);
      console.log(`   De:   ${s.oldImage}`);
      console.log(`   Para: ${s.newImage}\n`);
    }

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Erro durante atualização:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(console.error);
