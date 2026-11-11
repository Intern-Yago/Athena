/**
 * api/blog-og.js
 * 
 * Vercel Serverless Function para renderização no Edge/SSR leve do Blog da Athena.
 * - Serve para 100% dos visitantes (Zero cloaking).
 * - Intercepta /blog/:slug e injeta metatags Open Graph, Twitter Cards e JSON-LD.
 * - Requisito (5): Escapa o caractere '<' e perigosos no JSON-LD para neutralizar script breakouts.
 * - Escape estrito de atributos HTML em meta tags contra XSS.
 * - Timeout resiliente de 3.5s com fallback automático para o index.html padrão se o backend demorar.
 * - Cache CDN com s-maxage=3600 e stale-while-revalidate=86400.
 * - Suporta geração dinâmica do sitemap XML (/sitemap-blog.xml).
 */

const fs = require('fs');
const path = require('path');

// URL do backend resolvida via ambiente com fallback para a instância de produção da Athena
const BACKEND_URL = process.env.BACKEND_URL || process.env.VITE_BACKEND_URL || 'https://athena-backend-hu1m.onrender.com';
const SITE_URL = process.env.SITE_URL || 'https://athena.com.br';

function escapeHtmlAttr(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeHtmlText(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Requisito (5): Escapa caracteres perigosos no JSON-LD para prevenir quebra de script
 */
function safeJsonLd(data) {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

// Carrega o index.html compilado ou fallback
let cachedIndexHtml = null;
function getBaseHtml() {
  if (cachedIndexHtml) return cachedIndexHtml;

  const possiblePaths = [
    path.join(process.cwd(), 'dist', 'index.html'),
    path.join(process.cwd(), 'index.html'),
    path.join(__dirname, '..', 'dist', 'index.html')
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      cachedIndexHtml = fs.readFileSync(p, 'utf8');
      return cachedIndexHtml;
    }
  }

  // Shell HTML mínimo caso o arquivo dist/index.html não esteja montado no filesystem
  return `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!-- INJECT_HEAD -->
  </head>
  <body>
    <div id="root"><!-- INJECT_BODY --></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`;
}

module.exports = async function handler(req, res) {
  const { slug, sitemap } = req.query;

  // ---------------------------------------------------------------------------
  // 1. ROTA DE SITEMAP DINÂMICO (/sitemap-blog.xml)
  // ---------------------------------------------------------------------------
  if (sitemap === 'true') {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const resp = await fetch(`${BACKEND_URL}/api/blog/sitemap-data`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!resp.ok) throw new Error(`Backend retornou ${resp.status}`);
      const data = await resp.json();

      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

      // URLs dos posts
      for (const post of (data.posts || [])) {
        const lastMod = post.updated_at || post.published_at || new Date().toISOString();
        xml += `  <url>\n`;
        xml += `    <loc>${SITE_URL}/blog/${escapeHtmlText(post.slug)}</loc>\n`;
        xml += `    <lastmod>${new Date(lastMod).toISOString()}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        xml += `  </url>\n`;
      }

      // URLs das categorias
      for (const cat of (data.categories || [])) {
        const lastMod = cat.updated_at || new Date().toISOString();
        xml += `  <url>\n`;
        xml += `    <loc>${SITE_URL}/blog/categoria/${escapeHtmlText(cat.slug)}</loc>\n`;
        xml += `    <lastmod>${new Date(lastMod).toISOString()}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.6</priority>\n`;
        xml += `  </url>\n`;
      }

      xml += '</urlset>';

      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.setHeader('Cache-Control', 'public, s-maxage=7200, stale-while-revalidate=86400');
      return res.status(200).send(xml);
    } catch (err) {
      console.error('[SITEMAP ERROR]', err.message);
      return res.status(500).send('<error>Erro ao gerar sitemap do blog</error>');
    }
  }

  // ---------------------------------------------------------------------------
  // 2. ROTA DE PRERENDER UNIVERSAL DO ARTIGO (/blog/:slug)
  // ---------------------------------------------------------------------------
  if (!slug) {
    return res.status(400).send('Slug não informado.');
  }

  const baseHtml = getBaseHtml();

  try {
    // Timeout resiliente de 3.5 segundos para tolerar cold-start sem travar o cliente
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const backendEndpoint = `${BACKEND_URL}/api/blog/posts/${encodeURIComponent(slug)}/seo`;
    const response = await fetch(backendEndpoint, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    clearTimeout(timeoutId);

    // Se o backend apontar redirecionamento 301 de alias, redireciona na borda
    if (response.status === 301) {
      const redirectData = await response.json();
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.redirect(301, `/blog/${redirectData.targetSlug}`);
    }

    if (response.status === 404) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      // Injeta aviso de noindex para artigos despublicados / não encontrados
      let notFoundHtml = baseHtml.replace('</head>', '<meta name="robots" content="noindex, follow" /></head>');
      return res.status(404).send(notFoundHtml);
    }

    if (!response.ok) {
      throw new Error(`Backend retornou status ${response.status}`);
    }

    const post = await response.json();

    // Montagem segura dos dados de SEO com escape de atributos
    const postTitle = post.meta_title || post.title || 'Blog Athena Soluções';
    const postDesc = post.meta_description || post.excerpt || 'Artigo técnico sobre soluções para oficinas automotivas.';
    const canonicalUrl = `${SITE_URL}/blog/${post.slug}`;
    const coverUrl = post.cover_image_key 
      ? (post.cover_image_key.startsWith('http') ? post.cover_image_key : `https://images.athenaconsultoria.com.br/${post.cover_image_key}`)
      : `${SITE_URL}/logo-athena.png`;

    // Schema estruturado JSON-LD com escape estrito de '<' (Requisito 5)
    const jsonLdData = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": postTitle,
      "description": postDesc,
      "image": coverUrl,
      "datePublished": post.published_at,
      "dateModified": post.updated_at || post.published_at,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": canonicalUrl
      },
      "publisher": {
        "@type": "Organization",
        "name": "Athena Soluções Automotivas",
        "logo": {
          "@type": "ImageObject",
          "url": `${SITE_URL}/logo-athena.png`
        }
      }
    };
    const safeJsonLdString = safeJsonLd(jsonLdData);

    const headTags = `
    <title>${escapeHtmlText(postTitle)} | Athena Blog</title>
    <meta name="description" content="${escapeHtmlAttr(postDesc)}" />
    <link rel="canonical" href="${escapeHtmlAttr(canonicalUrl)}" />
    
    <!-- Open Graph / WhatsApp / Facebook -->
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${escapeHtmlAttr(postTitle)}" />
    <meta property="og:description" content="${escapeHtmlAttr(postDesc)}" />
    <meta property="og:url" content="${escapeHtmlAttr(canonicalUrl)}" />
    <meta property="og:image" content="${escapeHtmlAttr(coverUrl)}" />
    <meta property="og:site_name" content="Athena Soluções Automotivas" />
    ${post.published_at ? `<meta property="article:published_time" content="${escapeHtmlAttr(post.published_at)}" />` : ''}

    <!-- Twitter Cards -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtmlAttr(postTitle)}" />
    <meta name="twitter:description" content="${escapeHtmlAttr(postDesc)}" />
    <meta name="twitter:image" content="${escapeHtmlAttr(coverUrl)}" />

    <!-- Schema.org JSON-LD (com escape seguro de <) -->
    <script type="application/ld+json">${safeJsonLdString}</script>
    `;

    // Injeção no HTML do Vite
    let renderedHtml = baseHtml;

    // Substitui ou injeta o <title> e tags no <head>
    if (renderedHtml.includes('<!-- INJECT_HEAD -->')) {
      renderedHtml = renderedHtml.replace('<!-- INJECT_HEAD -->', headTags);
    } else if (renderedHtml.includes('</head>')) {
      renderedHtml = renderedHtml.replace('</head>', `${headTags}</head>`);
    }

    // Injeta o HTML pré-renderizado no container <div id="root">
    const bodyContent = post.content_html || `<article class="athena-prerendered-article"><h1>${escapeHtmlText(postTitle)}</h1><p>${escapeHtmlText(postDesc)}</p></article>`;
    if (renderedHtml.includes('<!-- INJECT_BODY -->')) {
      renderedHtml = renderedHtml.replace('<!-- INJECT_BODY -->', bodyContent);
    } else if (renderedHtml.includes('<div id="root"></div>')) {
      renderedHtml = renderedHtml.replace('<div id="root"></div>', `<div id="root">${bodyContent}</div>`);
    }

    // Cache no Edge da Vercel
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).send(renderedHtml);

  } catch (err) {
    // Fallback Gracioso: se o Render estiver em cold start ou timeout, entrega o index.html padrão
    console.warn(`[PRERENDER FALLBACK] Slug: ${slug} - Motivo: ${err.message}. Entregando shell estático.`);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=60'); // Cache curto no fallback
    return res.status(200).send(baseHtml);
  }
};
