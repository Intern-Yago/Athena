const { uploadToR2 } = require('../r2Service');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const BASE_URL = 'https://www.athenaconsultoria.com.br';
const DEFAULT_BRAND = 'Athena Soluções Automotivas';

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe.toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
}

async function run() {
  const query = `
    SELECT p.id, p.name, p.slug, p.sku, p.description, p.price, p.preco_venda, p.price_negotiable, p.in_stock, p.image, p.images, b.name as brand_name
    FROM products p
    LEFT JOIN brands b ON p.brand_id = b.id
    WHERE p.status = 'published'
    ORDER BY p.updated_at DESC
  `;
  const { rows: products } = await pool.query(query);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">\n  <channel>\n    <title>Athena Soluções Automotivas - Catálogo Oficial</title>\n    <link>${BASE_URL}</link>\n    <description>Catálogo de ferramentas, elevadores, scanners e equipamentos automotivos Athena</description>\n`;

  for (const p of products) {
    const sku = (p.sku && p.sku.trim()) || p.id;
    const title = escapeXml(p.name);
    const rawDesc = stripHtml(p.description) || `${p.name} - Athena Soluções Automotivas.`;
    const cleanDesc = escapeXml(rawDesc.slice(0, 5000));
    const brand = escapeXml(p.brand_name || DEFAULT_BRAND);
    const image = p.image || (Array.isArray(p.images) && p.images[0]) || `${BASE_URL}/logo-athena.png`;
    const isSobConsulta = (p.price_negotiable === true || !p.price || Number(p.price) <= 0);
    const targetLink = isSobConsulta
      ? `${BASE_URL}/produto/${p.slug}?utm_source=facebook_marketplace&utm_medium=catalog&action=wpp`
      : `${BASE_URL}/produto/${p.slug}?utm_source=facebook_marketplace&utm_medium=catalog`;
    const numPrice = Number(p.price || p.preco_venda || 0);
    const formattedPrice = `${numPrice > 0 ? numPrice.toFixed(2) : '0.00'} BRL`;

    xml += `    <item>\n      <g:id>${escapeXml(sku)}</g:id>\n      <g:title>${title}</g:title>\n      <g:description>${cleanDesc}</g:description>\n      <g:link>${escapeXml(targetLink)}</g:link>\n      <g:image_link>${escapeXml(image)}</g:image_link>\n      <g:brand>${brand}</g:brand>\n      <g:condition>new</g:condition>\n      <g:availability>in stock</g:availability>\n      <g:price>${formattedPrice}</g:price>\n      <g:custom_label_0>${isSobConsulta ? 'sob_consulta' : 'venda_direta'}</g:custom_label_0>\n      <g:custom_label_1>${isSobConsulta ? 'whatsapp' : 'checkout_site'}</g:custom_label_1>\n    </item>\n`;
  }
  xml += `  </channel>\n</rss>`;

  const xmlBuffer = Buffer.from(xml, 'utf-8');
  console.log(`Generated XML: ${xmlBuffer.length} bytes for ${products.length} products`);

  const { url } = await uploadToR2({
    file: xmlBuffer,
    folder: 'feeds',
    filename: 'facebook-catalog',
    contentType: 'application/xml'
  });

  console.log('✅ Uploaded feed to R2 URL:', url);
  await pool.end();
}

run().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
