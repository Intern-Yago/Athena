const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const BASE_URL = 'https://www.athenaconsultoria.com.br';
const DEFAULT_BRAND = 'Athena Soluções Automotivas';
const WHATSAPP_PHONE = '5561983485671';

const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { r2Client, R2_BUCKET_NAME, isR2Configured } = require('../r2Service');

let lastR2SyncTime = 0;
async function backgroundSyncToR2(xmlContent, csvContent) {
  if (!isR2Configured || !r2Client) return;
  const now = Date.now();
  if (now - lastR2SyncTime < 15 * 60 * 1000) return; // Máximo uma sincronização a cada 15 minutos
  lastR2SyncTime = now;

  try {
    if (xmlContent) {
      await r2Client.send(new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: 'facebook-catalog.xml',
        Body: xmlContent,
        ContentType: 'application/xml; charset=utf-8',
        CacheControl: 'public, max-age=300'
      }));
    }
    if (csvContent) {
      await r2Client.send(new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: 'facebook-catalog.csv',
        Body: csvContent,
        ContentType: 'text/csv; charset=utf-8',
        CacheControl: 'public, max-age=300'
      }));
    }
    console.log('[Feed Service] Sincronização automática em background com Cloudflare R2 concluída com sucesso!');
  } catch (err) {
    console.warn('[Feed Service] Aviso na sincronização secundária do R2:', err.message);
  }
}

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

/**
 * GET /api/feeds/facebook-catalog.xml
 * Meta Commerce / Facebook Marketplace dynamic XML Product Feed
 */
router.get('/facebook-catalog.xml', async (req, res) => {
  try {
    const query = `
      SELECT 
        p.id,
        p.name,
        p.slug,
        p.sku,
        p.description,
        p.price,
        p.preco_venda,
        p.price_negotiable,
        p.in_stock,
        p.estoque_quantidade,
        p.image,
        p.images,
        p.brand_id,
        b.name as brand_name
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.status = 'published'
      ORDER BY p.updated_at DESC
    `;

    const { rows: products } = await pool.query(query);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">\n`;
    xml += `  <channel>\n`;
    xml += `    <title>Athena Soluções Automotivas - Catálogo Oficial</title>\n`;
    xml += `    <link>${BASE_URL}</link>\n`;
    xml += `    <description>Catálogo de ferramentas, elevadores, scanners e equipamentos automotivos Athena</description>\n`;

    for (const p of products) {
      const sku = (p.sku && p.sku.trim()) || p.id;
      const title = escapeXml(p.name);
      const rawDesc = stripHtml(p.description) || `${p.name} - Athena Soluções Automotivas. Alta performance e suporte técnico.`;
      const cleanDesc = escapeXml(rawDesc.slice(0, 5000));
      const brand = escapeXml(p.brand_name || DEFAULT_BRAND);
      const image = p.image || (Array.isArray(p.images) && p.images[0]) || `${BASE_URL}/logo-athena.png`;

      // Regra de direcionamento:
      // Se price_negotiable for true OU preço for nulo/zero -> Sob Consulta -> Direciona para WhatsApp
      // Se não -> Venda Direta -> Direciona para compra no site
      const isSobConsulta = (p.price_negotiable === true || !p.price || Number(p.price) <= 0);

      const targetLink = isSobConsulta
        ? `${BASE_URL}/produto/${p.slug}?utm_source=facebook_marketplace&utm_medium=catalog&action=wpp`
        : `${BASE_URL}/produto/${p.slug}?utm_source=facebook_marketplace&utm_medium=catalog`;

      // Formatação de preço para o Meta Commerce (requer número com duas casas decimais e moeda)
      const numPrice = Number(p.price || p.preco_venda || 0);
      const formattedPrice = `${numPrice > 0 ? numPrice.toFixed(2) : '0.00'} BRL`;

      // Para produtos de revenda / sem estoque imediato:
      // Mantém 'in stock' para não ocultar no Marketplace, permitindo venda sob encomenda
      const availability = 'in stock';

      xml += `    <item>\n`;
      xml += `      <g:id>${escapeXml(sku)}</g:id>\n`;
      xml += `      <g:title>${title}</g:title>\n`;
      xml += `      <g:description>${cleanDesc}</g:description>\n`;
      xml += `      <g:link>${escapeXml(targetLink)}</g:link>\n`;
      xml += `      <g:image_link>${escapeXml(image)}</g:image_link>\n`;
      xml += `      <g:brand>${brand}</g:brand>\n`;
      xml += `      <g:condition>new</g:condition>\n`;
      xml += `      <g:availability>${availability}</g:availability>\n`;
      xml += `      <g:price>${formattedPrice}</g:price>\n`;
      xml += `      <g:custom_label_0>${isSobConsulta ? 'sob_consulta' : 'venda_direta'}</g:custom_label_0>\n`;
      xml += `      <g:custom_label_1>${isSobConsulta ? 'whatsapp' : 'checkout_site'}</g:custom_label_1>\n`;
      xml += `    </item>\n`;
    }

    xml += `  </channel>\n`;
    xml += `</rss>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=1800, stale-while-revalidate=86400');
    backgroundSyncToR2(xml, null).catch(() => {});
    return res.status(200).send(xml);
  } catch (err) {
    console.error('Erro ao gerar feed do Facebook:', err);
    return res.status(500).json({ error: 'Erro ao gerar feed de catálogo', details: err.message });
  }
});

/**
 * GET /api/feeds/facebook-catalog.csv
 * CSV format alternative for Meta Commerce Manager
 */
router.get('/facebook-catalog.csv', async (req, res) => {
  try {
    const query = `
      SELECT 
        p.id, p.name, p.slug, p.sku, p.description, p.price, p.preco_venda,
        p.price_negotiable, p.in_stock, p.image, b.name as brand_name
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.status = 'published'
      ORDER BY p.updated_at DESC
    `;

    const { rows: products } = await pool.query(query);

    const headers = ['id', 'title', 'description', 'availability', 'condition', 'price', 'link', 'image_link', 'brand', 'custom_label_0', 'custom_label_1'];
    let csv = headers.join(',') + '\n';

    for (const p of products) {
      const sku = (p.sku && p.sku.trim()) || p.id;
      const title = `"${(p.name || '').replace(/"/g, '""')}"`;
      const rawDesc = stripHtml(p.description) || `${p.name} - Athena Soluções Automotivas.`;
      const desc = `"${rawDesc.slice(0, 5000).replace(/"/g, '""')}"`;
      const brand = `"${(p.brand_name || DEFAULT_BRAND).replace(/"/g, '""')}"`;
      const image = p.image || `${BASE_URL}/logo-athena.png`;

      const isSobConsulta = (p.price_negotiable === true || !p.price || Number(p.price) <= 0);
      const targetLink = isSobConsulta
        ? `${BASE_URL}/produto/${p.slug}?utm_source=facebook_marketplace&utm_medium=catalog&action=wpp`
        : `${BASE_URL}/produto/${p.slug}?utm_source=facebook_marketplace&utm_medium=catalog`;

      const numPrice = Number(p.price || p.preco_venda || 0);
      const price = `${numPrice > 0 ? numPrice.toFixed(2) : '0.00'} BRL`;

      const row = [
        sku,
        title,
        desc,
        'in stock',
        'new',
        price,
        targetLink,
        image,
        brand,
        isSobConsulta ? 'sob_consulta' : 'venda_direta',
        isSobConsulta ? 'whatsapp' : 'checkout_site'
      ];

      csv += row.join(',') + '\n';
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Disposition', 'inline; filename="facebook-catalog.csv"');
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=1800, stale-while-revalidate=86400');
    backgroundSyncToR2(null, csv).catch(() => {});
    return res.status(200).send(csv);
  } catch (err) {
    console.error('Erro ao gerar CSV do catálogo:', err);
    return res.status(500).json({ error: 'Erro ao gerar feed CSV', details: err.message });
  }
});

/**
 * GET /api/feeds/wpp/:identifier
 * Redirecionamento 302 direto para o WhatsApp oficial com mensagem pré-preenchida
 */
router.get('/wpp/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    const query = `
      SELECT p.id, p.name, p.sku, p.slug, p.price, p.price_negotiable, b.name as brand_name
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.sku = $1 OR p.slug = $1 OR p.id = $1
      LIMIT 1
    `;
    const { rows } = await pool.query(query, [identifier]);

    let text = `Olá Athena Soluções Automotivas! Gostaria de atendimento comercial.`;
    if (rows.length > 0) {
      const prod = rows[0];
      const brandStr = prod.brand_name ? ` da marca ${prod.brand_name}` : '';
      const skuStr = prod.sku ? ` (Cód: ${prod.sku})` : '';
      text = `Olá Athena Soluções Automotivas!\n\nVi o produto *${prod.name}*${brandStr}${skuStr} no Facebook Marketplace e gostaria de consultar valores, disponibilidade e opções de frete.`;
    }

    const waUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`;
    return res.redirect(302, waUrl);
  } catch (err) {
    console.error('Erro no redirect WhatsApp:', err);
    return res.redirect(302, `https://wa.me/${WHATSAPP_PHONE}`);
  }
});

/**
 * GET /api/feeds/status
 * Estatísticas do catálogo
 */
router.get('/status', async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_published,
        COUNT(CASE WHEN price_negotiable = true OR price IS NULL OR price <= 0 THEN 1 END) as sob_consulta,
        COUNT(CASE WHEN price_negotiable = false AND price > 0 THEN 1 END) as venda_direta,
        COUNT(CASE WHEN image IS NOT NULL AND image != '' THEN 1 END) as com_imagem
      FROM products
      WHERE status = 'published'
    `);

    return res.json({
      status: 'active',
      endpoints: {
        xml_feed: `${BASE_URL}/api/feeds/facebook-catalog.xml`,
        csv_feed: `${BASE_URL}/api/feeds/facebook-catalog.csv`,
        wpp_redirect_example: `${BASE_URL}/api/feeds/wpp/DT-TBD01`
      },
      stats: stats.rows[0],
      generated_at: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
