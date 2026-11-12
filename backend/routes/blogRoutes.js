/**
 * blogRoutes.js
 * 
 * Rotas públicas e administrativas para o Blog da Athena.
 * - Rotas públicas de leitura, SEO, sitemap e visualizações.
 * - Submissão de comentários com proteção antispam (Turnstile + Honeypot + Rate Limit).
 * - Rotas administrativas restritas à equipe (requireStaff) com auditoria real de sessão.
 */

const express = require('express');
const axios = require('axios');
const blogService = require('../services/blogService');
const { requireStaff } = require('../utils/authMiddlewares');

const router = express.Router();

// Helper para extração confiável de IP através de proxies (Cloudflare -> Render)
function getClientIp(req) {
  return (
    req.headers['cf-connecting-ip'] ||
    req.headers['x-real-ip'] ||
    (req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0].trim() : null) ||
    req.ip ||
    req.socket?.remoteAddress ||
    '127.0.0.1'
  );
}

// Helper de validação do Cloudflare Turnstile
async function verifyTurnstileToken(token, clientIp) {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  // Se não configurado em ambiente de desenvolvimento/teste, aceita
  if (!secretKey) return true;
  if (!token) return false;

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (clientIp) formData.append('remoteip', clientIp);

    const response = await axios.post('https://challenges.cloudflare.com/turnstile/v0/siteverify', formData.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 4000
    });

    return Boolean(response.data && response.data.success);
  } catch (err) {
    console.error('[TURNSTILE ERROR]', err.message);
    // Falha fechada em produção, tolerante se timeout
    return false;
  }
}

// =============================================================================
// ROTAS PÚBLICAS DO BLOG (/api/blog/...)
// =============================================================================

// Listagem pública paginada
router.get('/posts', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const categorySlug = req.query.category || null;

    const data = await blogService.getPublicPosts({ page, limit, categorySlug });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao carregar artigos do blog.', details: err.message });
  }
});

// Detalhes do post por slug (ou redirecionamento 301 se for alias)
router.get('/posts/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await blogService.getPublicPostBySlug(slug);

    if (!result) {
      return res.status(404).json({ error: 'Artigo não encontrado ou não publicado.' });
    }

    if (result.redirect === 301) {
      return res.status(301).json({
        redirect: true,
        targetSlug: result.targetSlug,
        targetUrl: `/blog/${result.targetSlug}`
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao consultar artigo.', details: err.message });
  }
});

// Endpoint SEO ultra-leve para Vercel Serverless / Crawlers
router.get('/posts/:slug/seo', async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await blogService.getSeoPostBySlug(slug);

    if (!result) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.status(404).json({ error: 'Artigo não encontrado.' });
    }

    if (result.redirect === 301) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.status(301).json({
        redirect: true,
        targetSlug: result.targetSlug
      });
    }

    // Cache no Edge da Vercel por 1 hora com stale-while-revalidate
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao carregar metadados SEO.', details: err.message });
  }
});

// Listagem de categorias públicas
router.get('/categories', async (req, res) => {
  try {
    const categories = await blogService.listCategories();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar categorias.', details: err.message });
  }
});

// Dados para sitemap dinâmico
router.get('/sitemap-data', async (req, res) => {
  try {
    const data = await blogService.getSitemapData();
    res.setHeader('Cache-Control', 'public, s-maxage=7200, stale-while-revalidate=86400');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao obter dados do sitemap.', details: err.message });
  }
});

// Submissão de comentário com antispam
router.post('/posts/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const { authorName, authorEmail, content, parentId, honeypot, turnstileToken } = req.body;
    const clientIp = getClientIp(req);

    // Validação de Turnstile se configurado
    if (process.env.TURNSTILE_SECRET_KEY && !honeypot) {
      const isValidCaptcha = await verifyTurnstileToken(turnstileToken, clientIp);
      if (!isValidCaptcha) {
        return res.status(400).json({ error: 'Falha na verificação de segurança (Turnstile). Tente novamente.' });
      }
    }

    const createdComment = await blogService.addComment(id, {
      authorName,
      authorEmail,
      content,
      parentId,
      honeypot
    }, clientIp);

    res.status(201).json({
      message: 'Comentário enviado com sucesso e encaminhado para moderação.',
      comment: createdComment
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Incremento atômico de visualização com deduplicação por IP
router.post('/posts/:id/view', async (req, res) => {
  try {
    const { id } = req.params;
    const clientIp = getClientIp(req);
    const incremented = await blogService.incrementPostView(id, clientIp);
    res.json({ success: true, counted: incremented });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao registrar visualização.' });
  }
});

// =============================================================================
// ROTAS ADMINISTRATIVAS DO BLOG (/api/admin/blog/...)
// =============================================================================

// Listagem administrativa de posts (inclui rascunhos)
router.get('/admin/posts', requireStaff, async (req, res) => {
  try {
    const { query: dbQuery } = require('../services/db');
    const posts = await dbQuery(`
      SELECT p.*, u.name as author_name,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object('id', c.id, 'name', c.name, 'slug', c.slug)) 
          FILTER (WHERE c.id IS NOT NULL), '[]'
        ) as categories
      FROM public.blog_posts p
      LEFT JOIN public.users u ON u.id = p.author_id
      LEFT JOIN public.blog_post_categories pc ON pc.post_id = p.id
      LEFT JOIN public.blog_categories c ON c.id = pc.category_id
      GROUP BY p.id, u.name
      ORDER BY p.created_at DESC;
    `);
    const formatted = posts.rows.map((post) => ({
      ...post,
      cover_image_url: blogService.resolveCoverImageUrl
        ? blogService.resolveCoverImageUrl(post.cover_image_key, post.slug)
        : post.cover_image_key,
      summary: post.excerpt || '',
      views_count: Number(post.view_count || 0)
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar artigos administrativos.', details: err.message });
  }
});

// Criação de artigo
router.post('/admin/posts', requireStaff, async (req, res) => {
  try {
    const authorId = req.user.id;
    const newPost = await blogService.createPost(req.body, authorId);
    res.status(201).json(newPost);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Atualização de artigo com auditoria de editor
router.put('/admin/posts/:id', requireStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.id;
    const updatedPost = await blogService.updatePost(id, req.body, currentUserId);
    res.json(updatedPost);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Exclusão de artigo
router.delete('/admin/posts/:id', requireStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await blogService.deletePost(id);
    if (!deleted) return res.status(404).json({ error: 'Artigo não encontrado.' });
    res.json({ message: 'Artigo excluído com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Moderação de comentários
router.get('/admin/comments', requireStaff, async (req, res) => {
  try {
    const status = req.query.status || null;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const comments = await blogService.listAdminComments({ status, page, limit });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar comentários.', details: err.message });
  }
});

router.patch('/admin/comments/:id/moderate', requireStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const moderatorId = req.user.id;

    const updated = await blogService.moderateComment(id, status, moderatorId);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Rotina manual ou agendada de expurgo de IPs de comentários (Requisito 3 - LGPD)
router.post('/admin/comments/purge-ips', requireStaff, async (req, res) => {
  try {
    const daysToRetain = parseInt(req.body.daysToRetain, 10) || 30;
    const purgedCount = await blogService.purgeOldCommentIps(daysToRetain);
    res.json({
      message: `Rotina de governança LGPD executada. IPs expurgados de ${purgedCount} comentário(s).`,
      purgedCount
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao executar expurgo de IPs.', details: err.message });
  }
});

// CRUD administrativo de categorias
router.post('/admin/categories', requireStaff, async (req, res) => {
  try {
    const category = await blogService.createCategory(req.body);
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/admin/categories/:id', requireStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await blogService.updateCategory(id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/admin/categories/:id', requireStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await blogService.deleteCategory(id);
    if (!deleted) return res.status(404).json({ error: 'Categoria não encontrada.' });
    res.json({ message: 'Categoria excluída com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
