const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const PUBLIC_SITEMAP_PATH = path.join(__dirname, '..', 'public', 'sitemap.xml');
const DIST_SITEMAP_PATH = path.join(__dirname, '..', 'dist', 'sitemap.xml');
const BASE_URL = 'https://www.athenaconsultoria.com.br';

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function generateSitemap() {
  console.log('🔄 Conectando ao PostgreSQL para gerar sitemap.xml atualizado...');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const today = new Date().toISOString().split('T')[0];

    // 1. Categorias
    const categoriesRes = await pool.query(`
      SELECT id, name, slug 
      FROM categories 
      WHERE slug IS NOT NULL AND slug != ''
      ORDER BY name ASC
    `);
    const categories = categoriesRes.rows;

    // 2. Marcas
    const brandsRes = await pool.query(`
      SELECT id, name, slug 
      FROM brands 
      WHERE slug IS NOT NULL AND slug != ''
      ORDER BY name ASC
    `);
    const brands = brandsRes.rows;

    // 3. Produtos Publicados
    const productsRes = await pool.query(`
      SELECT id, name, slug, image, updated_at 
      FROM products 
      WHERE status = 'published'
      ORDER BY name ASC
    `);
    const products = productsRes.rows;

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

    // 1. Home / Catálogo Geral
    xml += `  <url>\n`;
    xml += `    <loc>${BASE_URL}/</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>1.0</priority>\n`;
    xml += `  </url>\n`;

    // 2. Páginas Institucionais & Legais
    const institutionalPages = [
      { path: '/sobre', changefreq: 'monthly', priority: '0.7' },
      { path: '/termos-de-uso', changefreq: 'monthly', priority: '0.5' },
      { path: '/politica-de-privacidade', changefreq: 'monthly', priority: '0.5' },
      { path: '/politica-de-cookies', changefreq: 'monthly', priority: '0.5' }
    ];

    for (const p of institutionalPages) {
      xml += `  <url>\n`;
      xml += `    <loc>${BASE_URL}${p.path}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>${p.changefreq}</changefreq>\n`;
      xml += `    <priority>${p.priority}</priority>\n`;
      xml += `  </url>\n`;
    }

    // 3. Categorias
    for (const cat of categories) {
      const lastMod = cat.updated_at ? new Date(cat.updated_at).toISOString().split('T')[0] : today;
      xml += `  <url>\n`;
      xml += `    <loc>${BASE_URL}/categoria/${escapeXml(cat.slug)}</loc>\n`;
      xml += `    <lastmod>${lastMod}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.9</priority>\n`;
      xml += `  </url>\n`;
    }

    // 4. Marcas
    for (const brand of brands) {
      const lastMod = brand.updated_at ? new Date(brand.updated_at).toISOString().split('T')[0] : today;
      xml += `  <url>\n`;
      xml += `    <loc>${BASE_URL}/marca/${escapeXml(brand.slug)}</loc>\n`;
      xml += `    <lastmod>${lastMod}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.85</priority>\n`;
      xml += `  </url>\n`;
    }

    // 5. Produtos
    for (const prod of products) {
      const slug = prod.slug || `produto-${prod.id}`;
      const lastMod = prod.updated_at ? new Date(prod.updated_at).toISOString().split('T')[0] : today;
      xml += `  <url>\n`;
      xml += `    <loc>${BASE_URL}/produto/${escapeXml(slug)}</loc>\n`;
      xml += `    <lastmod>${lastMod}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      if (prod.image && prod.image.startsWith('http')) {
        xml += `    <image:image>\n`;
        xml += `      <image:loc>${escapeXml(prod.image)}</image:loc>\n`;
        xml += `      <image:title>${escapeXml(prod.name || '')}</image:title>\n`;
        xml += `    </image:image>\n`;
      }
      xml += `  </url>\n`;
    }

    xml += `</urlset>\n`;

    fs.writeFileSync(PUBLIC_SITEMAP_PATH, xml, 'utf8');
    console.log(`✅ sitemap.xml salvo em: ${PUBLIC_SITEMAP_PATH}`);

    if (fs.existsSync(path.dirname(DIST_SITEMAP_PATH))) {
      fs.writeFileSync(DIST_SITEMAP_PATH, xml, 'utf8');
      console.log(`✅ sitemap.xml sincronizado também em: ${DIST_SITEMAP_PATH}`);
    }

    console.log(`🎉 Sucesso! Sitemap gerado com:`);
    console.log(`   - 5 páginas institucionais e legais`);
    console.log(`   - ${categories.length} categorias`);
    console.log(`   - ${brands.length} marcas`);
    console.log(`   - ${products.length} produtos publicados com imagens`);
  } catch (err) {
    console.error('❌ Erro ao gerar sitemap:', err);
  } finally {
    await pool.end();
  }
}

generateSitemap();
