const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'athena-db.json');
const SITEMAP_PATH = path.join(__dirname, '..', 'public', 'sitemap.xml');
const BASE_URL = 'https://www.athenaconsultoria.com.br';

function generateSitemap() {
  console.log('Gerando sitemap.xml oficial para SEO...');
  const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));

  const categories = data.categories || [];
  const brands = data.brands || [];
  const products = data.products || [];

  const today = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

  // 1. Home / Catalog
  xml += `  <url>\n`;
  xml += `    <loc>${BASE_URL}/</loc>\n`;
  xml += `    <lastmod>${today}</lastmod>\n`;
  xml += `    <changefreq>daily</changefreq>\n`;
  xml += `    <priority>1.0</priority>\n`;
  xml += `  </url>\n`;

  // 2. Sobre
  xml += `  <url>\n`;
  xml += `    <loc>${BASE_URL}/sobre</loc>\n`;
  xml += `    <lastmod>${today}</lastmod>\n`;
  xml += `    <changefreq>monthly</changefreq>\n`;
  xml += `    <priority>0.7</priority>\n`;
  xml += `  </url>\n`;

  // 3. Categories
  for (const cat of categories) {
    if (!cat.slug) continue;
    xml += `  <url>\n`;
    xml += `    <loc>${BASE_URL}/categoria/${cat.slug}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.9</priority>\n`;
    xml += `  </url>\n`;
  }

  // 4. Brands
  for (const brand of brands) {
    if (!brand.slug) continue;
    xml += `  <url>\n`;
    xml += `    <loc>${BASE_URL}/marca/${brand.slug}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;
  }

  // 5. Products (Only published)
  for (const prod of products) {
    if (prod.status === 'draft') continue;
    const slug = prod.slug || `produto-${prod.id}`;
    xml += `  <url>\n`;
    xml += `    <loc>${BASE_URL}/produto/${slug}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.85</priority>\n`;
    if (prod.image) {
      xml += `    <image:image>\n`;
      xml += `      <image:loc>${prod.image}</image:loc>\n`;
      xml += `      <image:title>${(prod.name || '').replace(/[<>&'"]/g, '')}</image:title>\n`;
      xml += `    </image:image>\n`;
    }
    xml += `  </url>\n`;
  }

  xml += `</urlset>\n`;

  fs.writeFileSync(SITEMAP_PATH, xml, 'utf8');
  console.log(`sitemap.xml gerado com sucesso em: ${SITEMAP_PATH} com ${categories.length} categorias, ${brands.length} marcas e ${products.length} produtos!`);
}

generateSitemap();
