/**
 * blogService.js
 * 
 * Camada de serviço de negócios para o Blog da Athena.
 * - Operações ACID com PostgreSQL.
 * - Validação rigorosa de usuários e injeção transacional de app.current_user_id.
 * - Sanitização automática de HTML e cálculo de tempo de leitura.
 * - Controle de aliases 301 e integridade de comentários com antispam.
 * - Rotina de expurgo de author_ip em conformidade com LGPD.
 * - Deduplicação de visualizações por IP/Sessão.
 */

const { getPool, query, withTransaction } = require('./db');
const { slugify, isValidSlug } = require('../utils/slugify');
const { sanitizePostHtml, blockNoteToHtml } = require('../utils/blogSanitizer');

// Cache em memória para deduplicação de visualizações de posts (evita spam de view_count)
const recentViewsCache = new Map();
const VIEW_DEDUPLICATION_WINDOW_MS = 60 * 60 * 1000; // 1 hora

// Limpeza periódica do cache de views em memória (a cada 30 minutos)
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of recentViewsCache.entries()) {
    if (now - timestamp > VIEW_DEDUPLICATION_WINDOW_MS) {
      recentViewsCache.delete(key);
    }
  }
}, 30 * 60 * 1000).unref();

/**
 * Calcula o tempo estimado de leitura em minutos com base no texto
 */
function calculateReadingTime(textOrBlocks) {
  let wordCount = 0;
  if (typeof textOrBlocks === 'string') {
    wordCount = textOrBlocks.trim().split(/\s+/).filter(Boolean).length;
  } else if (Array.isArray(textOrBlocks)) {
    const rawText = JSON.stringify(textOrBlocks).replace(/["{},:[\]]/g, ' ');
    wordCount = rawText.trim().split(/\s+/).filter(Boolean).length;
  }
  return Math.max(1, Math.ceil(wordCount / 200));
}

/**
 * Normaliza e resolve o link público seguro para a imagem de capa
 */
function resolveCoverImageUrl(key) {
  if (!key) return null;
  if (key.startsWith('http://') || key.startsWith('https://')) return key;
  const baseUrl = process.env.R2_PUBLIC_URL || 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev';
  return `${baseUrl.replace(/\/$/, '')}/${key.replace(/^\//, '')}`;
}

// =============================================================================
// 1. GESTÃO DE CATEGORIAS
// =============================================================================

async function listCategories() {
  const res = await query(`
    SELECT id, name, slug, description, display_order, created_at, updated_at
    FROM public.blog_categories
    ORDER BY display_order ASC, name ASC;
  `);
  return res.rows;
}

async function createCategory({ name, slug, description, displayOrder }) {
  const cleanName = (name || '').trim();
  if (cleanName.length < 2) {
    throw new Error('O nome da categoria deve possuir no mínimo 2 caracteres.');
  }

  const finalSlug = slugify(slug || cleanName);
  if (!isValidSlug(finalSlug, 2)) {
    throw new Error('O slug da categoria é inválido ou contém caracteres não permitidos.');
  }

  const order = Number.isInteger(displayOrder) && displayOrder >= 0 ? displayOrder : 0;

  const res = await query(`
    INSERT INTO public.blog_categories (name, slug, description, display_order)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, slug, description, display_order, created_at, updated_at;
  `, [cleanName, finalSlug, description || null, order]);

  return res.rows[0];
}

async function updateCategory(id, { name, slug, description, displayOrder }) {
  const updates = [];
  const values = [id];
  let paramIdx = 2;

  if (name !== undefined) {
    const cleanName = name.trim();
    if (cleanName.length < 2) throw new Error('O nome da categoria deve ter no mínimo 2 caracteres.');
    updates.push(`name = $${paramIdx++}`);
    values.push(cleanName);
  }

  if (slug !== undefined) {
    const finalSlug = slugify(slug);
    if (!isValidSlug(finalSlug, 2)) throw new Error('Slug inválido.');
    updates.push(`slug = $${paramIdx++}`);
    values.push(finalSlug);
  }

  if (description !== undefined) {
    updates.push(`description = $${paramIdx++}`);
    values.push(description);
  }

  if (displayOrder !== undefined) {
    const order = Number(displayOrder);
    if (isNaN(order) || order < 0) throw new Error('display_order deve ser um número inteiro >= 0.');
    updates.push(`display_order = $${paramIdx++}`);
    values.push(order);
  }

  if (updates.length === 0) {
    throw new Error('Nenhum dado informado para atualização da categoria.');
  }

  const res = await query(`
    UPDATE public.blog_categories
    SET ${updates.join(', ')}
    WHERE id = $1
    RETURNING id, name, slug, description, display_order, created_at, updated_at;
  `, values);

  if (res.rows.length === 0) {
    throw new Error('Categoria não encontrada.');
  }

  return res.rows[0];
}

async function deleteCategory(id) {
  const res = await query(`
    DELETE FROM public.blog_categories WHERE id = $1 RETURNING id;
  `, [id]);
  return res.rows.length > 0;
}

// =============================================================================
// 2. GESTÃO DE ARTIGOS (POSTS)
// =============================================================================

async function createPost(postData, authorId) {
  const title = (postData.title || '').trim();
  if (title.length < 3) {
    throw new Error('O título do artigo deve possuir no mínimo 3 caracteres.');
  }

  // Validação obrigatória do autor na tabela users
  const authorRes = await query('SELECT id FROM public.users WHERE id = $1;', [authorId]);
  if (authorRes.rows.length === 0) {
    throw new Error(`Autor com ID '${authorId}' não encontrado no sistema.`);
  }

  const slug = slugify(postData.slug || title);
  if (!isValidSlug(slug, 3)) {
    throw new Error('Slug inválido. Deve conter apenas letras minúsculas, números e hífens.');
  }

  const contentBlocks = Array.isArray(postData.content) ? postData.content : [];
  const contentHtml = blockNoteToHtml(contentBlocks);
  const readingTime = calculateReadingTime(contentBlocks);
  const status = ['draft', 'published', 'archived'].includes(postData.status) ? postData.status : 'draft';

  // Se publicado, published_at é obrigatório por constraint (default: agora)
  let publishedAt = postData.publishedAt ? new Date(postData.publishedAt) : null;
  if (status === 'published' && !publishedAt) {
    publishedAt = new Date();
  }

  return await withTransaction(async (client) => {
    const postRes = await client.query(`
      INSERT INTO public.blog_posts (
        title, slug, excerpt, content, content_html,
        status, author_id, cover_image_key, meta_title,
        meta_description, reading_time_minutes, published_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *;
    `, [
      title,
      slug,
      postData.excerpt || null,
      JSON.stringify(contentBlocks),
      contentHtml,
      status,
      authorId,
      postData.coverImageKey || null,
      postData.metaTitle || null,
      postData.metaDescription || null,
      readingTime,
      publishedAt
    ]);

    const createdPost = postRes.rows[0];

    // Vínculo com categorias
    if (Array.isArray(postData.categoryIds) && postData.categoryIds.length > 0) {
      for (const catId of postData.categoryIds) {
        await client.query(`
          INSERT INTO public.blog_post_categories (post_id, category_id)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING;
        `, [createdPost.id, catId]);
      }
    }

    return createdPost;
  });
}

/**
 * Atualiza um artigo com injeção transacional segura de app.current_user_id
 * Requisito (2): Valida se currentUserId existe na tabela users antes de set_config
 */
async function updatePost(id, updateData, currentUserId) {
  return await withTransaction(async (client) => {
    // 1. Obter estado atual do post
    const currentPostRes = await client.query('SELECT * FROM public.blog_posts WHERE id = $1 FOR UPDATE;', [id]);
    if (currentPostRes.rows.length === 0) {
      throw new Error('Artigo não encontrado.');
    }
    const currentPost = currentPostRes.rows[0];

    // 2. Validação rigorosa do editor contra a tabela users (Requisito 2)
    let validEditorId = null;
    if (currentUserId) {
      const userRes = await client.query('SELECT id FROM public.users WHERE id = $1;', [currentUserId]);
      if (userRes.rows.length === 0) {
        throw new Error(`Falha de integridade: O usuário editor '${currentUserId}' não existe no banco.`);
      }
      validEditorId = userRes.rows[0].id;
      // Injeta na sessão da transação (is_local = true) para consumo seguro pela trigger
      await client.query("SELECT set_config('app.current_user_id', $1, true);", [validEditorId]);
    }

    // 3. Montagem dinâmica dos campos de atualização
    const updates = [];
    const values = [id];
    let paramIdx = 2;

    if (updateData.title !== undefined) {
      const title = updateData.title.trim();
      if (title.length < 3) throw new Error('Título deve ter pelo menos 3 caracteres.');
      updates.push(`title = $${paramIdx++}`);
      values.push(title);
    }

    if (updateData.slug !== undefined) {
      const newSlug = slugify(updateData.slug);
      if (!isValidSlug(newSlug, 3)) throw new Error('Slug inválido.');
      updates.push(`slug = $${paramIdx++}`);
      values.push(newSlug);
    }

    if (updateData.excerpt !== undefined) {
      updates.push(`excerpt = $${paramIdx++}`);
      values.push(updateData.excerpt);
    }

    if (updateData.content !== undefined) {
      const contentBlocks = Array.isArray(updateData.content) ? updateData.content : [];
      const contentHtml = blockNoteToHtml(contentBlocks);
      const readingTime = calculateReadingTime(contentBlocks);

      updates.push(`content = $${paramIdx++}`);
      values.push(JSON.stringify(contentBlocks));

      updates.push(`content_html = $${paramIdx++}`);
      values.push(contentHtml);

      updates.push(`reading_time_minutes = $${paramIdx++}`);
      values.push(readingTime);
    }

    if (updateData.status !== undefined) {
      if (!['draft', 'published', 'archived'].includes(updateData.status)) {
        throw new Error('Status inválido.');
      }
      updates.push(`status = $${paramIdx++}`);
      values.push(updateData.status);

      // Se mudou para publicado e não tinha published_at, define agora
      if (updateData.status === 'published' && !currentPost.published_at && !updateData.publishedAt) {
        updates.push(`published_at = $${paramIdx++}`);
        values.push(new Date());
      }
    }

    if (updateData.publishedAt !== undefined) {
      updates.push(`published_at = $${paramIdx++}`);
      values.push(updateData.publishedAt ? new Date(updateData.publishedAt) : null);
    }

    if (updateData.coverImageKey !== undefined) {
      updates.push(`cover_image_key = $${paramIdx++}`);
      values.push(updateData.coverImageKey);
    }

    if (updateData.metaTitle !== undefined) {
      updates.push(`meta_title = $${paramIdx++}`);
      values.push(updateData.metaTitle);
    }

    if (updateData.metaDescription !== undefined) {
      updates.push(`meta_description = $${paramIdx++}`);
      values.push(updateData.metaDescription);
    }

    if (updates.length > 0) {
      await client.query(`
        UPDATE public.blog_posts
        SET ${updates.join(', ')}
        WHERE id = $1;
      `, values);
    }

    // 4. Sincronização de categorias se fornecido
    if (Array.isArray(updateData.categoryIds)) {
      await client.query('DELETE FROM public.blog_post_categories WHERE post_id = $1;', [id]);
      for (const catId of updateData.categoryIds) {
        await client.query(`
          INSERT INTO public.blog_post_categories (post_id, category_id)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING;
        `, [id, catId]);
      }
    }

    // 5. Retorna o post atualizado com suas categorias
    const res = await client.query('SELECT * FROM public.blog_posts WHERE id = $1;', [id]);
    return res.rows[0];
  });
}

async function deletePost(id) {
  const res = await query('DELETE FROM public.blog_posts WHERE id = $1 RETURNING id;', [id]);
  return res.rows.length > 0;
}

// =============================================================================
// 3. CONSULTAS PÚBLICAS & SEO
// =============================================================================

async function getPublicPosts({ page = 1, limit = 10, categorySlug = null }) {
  const offset = (Math.max(1, page) - 1) * limit;
  const values = [limit, offset];
  let catFilter = '';

  if (categorySlug) {
    catFilter = `
      AND p.id IN (
        SELECT bpc.post_id 
        FROM public.blog_post_categories bpc
        JOIN public.blog_categories bc ON bc.id = bpc.category_id
        WHERE bc.slug = $3
      )
    `;
    values.push(categorySlug);
  }

  const postsRes = await query(`
    SELECT 
      p.id, p.title, p.slug, p.excerpt, p.cover_image_key,
      p.meta_title, p.meta_description, p.reading_time_minutes,
      p.view_count, p.published_at, p.created_at,
      COALESCE(
        json_agg(json_build_object('id', c.id, 'name', c.name, 'slug', c.slug)) 
        FILTER (WHERE c.id IS NOT NULL), '[]'
      ) as categories
    FROM public.blog_posts_public p
    LEFT JOIN public.blog_post_categories pc ON pc.post_id = p.id
    LEFT JOIN public.blog_categories c ON c.id = pc.category_id
    WHERE 1=1 ${catFilter}
    GROUP BY p.id, p.title, p.slug, p.excerpt, p.cover_image_key,
             p.meta_title, p.meta_description, p.reading_time_minutes,
             p.view_count, p.published_at, p.created_at
    ORDER BY p.published_at DESC
    LIMIT $1 OFFSET $2;
  `, values);

  const countRes = await query(`
    SELECT count(DISTINCT p.id) as total
    FROM public.blog_posts_public p
    ${categorySlug ? `
      JOIN public.blog_post_categories bpc ON bpc.post_id = p.id
      JOIN public.blog_categories bc ON bc.id = bpc.category_id AND bc.slug = $1
    ` : ''}
  `, categorySlug ? [categorySlug] : []);

  return {
    posts: postsRes.rows.map((post) => ({
      ...post,
      cover_image_url: resolveCoverImageUrl(post.cover_image_key)
    })),
    total: Number(countRes.rows[0]?.total || 0),
    page: Math.max(1, page),
    limit
  };
}

async function getPublicPostBySlug(slug) {
  const cleanSlug = (slug || '').trim();

  // 1. Busca na view pública (posts publicados no passado)
  const postRes = await query(`
    SELECT p.*,
      COALESCE(
        json_agg(DISTINCT jsonb_build_object('id', c.id, 'name', c.name, 'slug', c.slug)) 
        FILTER (WHERE c.id IS NOT NULL), '[]'
      ) as categories
    FROM public.blog_posts_public p
    LEFT JOIN public.blog_post_categories pc ON pc.post_id = p.id
    LEFT JOIN public.blog_categories c ON c.id = pc.category_id
    WHERE p.slug = $1
    GROUP BY p.id, p.title, p.slug, p.excerpt, p.content, p.content_html,
             p.cover_image_key, p.meta_title, p.meta_description,
             p.reading_time_minutes, p.view_count, p.published_at,
             p.created_at, p.updated_at;
  `, [cleanSlug]);

  if (postRes.rows.length > 0) {
    const post = {
      ...postRes.rows[0],
      cover_image_url: resolveCoverImageUrl(postRes.rows[0].cover_image_key)
    };

    // Busca comentários públicos aprovados
    const commentsRes = await query(`
      SELECT id, parent_id, author_name, content, is_official, created_at
      FROM public.blog_comments_public
      WHERE post_id = $1
      ORDER BY created_at ASC;
    `, [post.id]);

    return {
      post,
      comments: commentsRes.rows
    };
  }

  // 2. Se não encontrou, verifica se é um alias ativo de redirecionamento 301
  const aliasRes = await query(`
    SELECT target_slug FROM public.blog_slug_aliases WHERE old_slug = $1;
  `, [cleanSlug]);

  if (aliasRes.rows.length > 0) {
    return {
      redirect: 301,
      targetSlug: aliasRes.rows[0].target_slug
    };
  }

  return null;
}

/**
 * Endpoint ultra-rápido para Vercel Serverless / Crawlers
 * Retorna exclusivamente metadados públicos e HTML pré-renderizado
 */
async function getSeoPostBySlug(slug) {
  const cleanSlug = (slug || '').trim();

  const res = await query(`
    SELECT slug, meta_title, meta_description, cover_image_key,
           title, excerpt, content_html, published_at, updated_at
    FROM public.blog_posts_public
    WHERE slug = $1;
  `, [cleanSlug]);

  if (res.rows.length > 0) {
    return {
      ...res.rows[0],
      cover_image_url: resolveCoverImageUrl(res.rows[0].cover_image_key)
    };
  }

  // Verifica se é alias 301
  const aliasRes = await query(`
    SELECT target_slug FROM public.blog_slug_aliases WHERE old_slug = $1;
  `, [cleanSlug]);

  if (aliasRes.rows.length > 0) {
    return {
      redirect: 301,
      targetSlug: aliasRes.rows[0].target_slug
    };
  }

  return null;
}

async function getSitemapData() {
  const posts = await query(`
    SELECT slug, updated_at, published_at
    FROM public.blog_posts_public
    ORDER BY published_at DESC;
  `);

  const categories = await query(`
    SELECT slug, updated_at
    FROM public.blog_categories
    ORDER BY name ASC;
  `);

  return {
    posts: posts.rows,
    categories: categories.rows
  };
}

// =============================================================================
// 4. COMENTÁRIOS & MODERAÇÃO ANTISPAM
// =============================================================================

async function addComment(postId, { authorName, authorEmail, content, parentId, honeypot }, clientIp) {
  // 1. Defesa Honeypot: Se o campo invisível estiver preenchido, responde sucesso falso
  if (honeypot && String(honeypot).trim().length > 0) {
    return {
      id: '00000000-0000-0000-0000-000000000000',
      status: 'pending',
      author_name: authorName,
      created_at: new Date()
    };
  }

  // 2. Validações de integridade
  const name = (authorName || '').trim();
  const email = (authorEmail || '').trim().toLowerCase();
  const text = (content || '').trim();

  if (name.length < 2) throw new Error('Nome deve ter pelo menos 2 caracteres.');
  if (text.length < 2) throw new Error('Conteúdo do comentário deve ter pelo menos 2 caracteres.');
  if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) {
    throw new Error('Formato de e-mail inválido.');
  }

  // 3. Valida se o post existe e está publicado no passado
  const postCheck = await query(`
    SELECT id FROM public.blog_posts 
    WHERE id = $1 AND status = 'published' AND published_at <= NOW();
  `, [postId]);

  if (postCheck.rows.length === 0) {
    throw new Error('Comentários só podem ser submetidos para artigos publicados.');
  }

  // 4. Se for resposta (thread), valida parent_id
  if (parentId) {
    const parentCheck = await query(`
      SELECT id FROM public.blog_comments 
      WHERE id = $1 AND post_id = $2;
    `, [parentId, postId]);

    if (parentCheck.rows.length === 0) {
      throw new Error('Comentário pai inexistente ou associado a outro artigo.');
    }
  }

  // 5. Inserção com status pendente e author_ip para governança
  const res = await query(`
    INSERT INTO public.blog_comments (
      post_id, parent_id, author_name, author_email, author_ip, content, status
    ) VALUES ($1, $2, $3, $4, $5, $6, 'pending')
    RETURNING id, post_id, parent_id, author_name, content, status, created_at;
  `, [postId, parentId || null, name, email, clientIp || null, text]);

  return res.rows[0];
}

async function listAdminComments({ status = null, page = 1, limit = 20 }) {
  const offset = (Math.max(1, page) - 1) * limit;
  const values = [limit, offset];
  let filter = '';

  if (status) {
    filter = 'WHERE c.status = $3';
    values.push(status);
  }

  const res = await query(`
    SELECT c.*, p.title as post_title, p.slug as post_slug
    FROM public.blog_comments c
    JOIN public.blog_posts p ON p.id = c.post_id
    ${filter}
    ORDER BY c.created_at DESC
    LIMIT $1 OFFSET $2;
  `, values);

  return res.rows;
}

async function moderateComment(commentId, newStatus, moderatorUserId) {
  if (!['approved', 'rejected', 'spam'].includes(newStatus)) {
    throw new Error('Status de moderação inválido. Permitidos: approved, rejected, spam.');
  }

  const modCheck = await query('SELECT id FROM public.users WHERE id = $1;', [moderatorUserId]);
  if (modCheck.rows.length === 0) {
    throw new Error('Moderador inválido.');
  }

  const res = await query(`
    UPDATE public.blog_comments
    SET status = $1, moderated_by = $2, moderated_at = NOW()
    WHERE id = $3
    RETURNING *;
  `, [newStatus, moderatorUserId, commentId]);

  if (res.rows.length === 0) {
    throw new Error('Comentário não encontrado.');
  }

  return res.rows[0];
}

/**
 * Rotina Real de Expurgo de author_ip (Requisito 3 - LGPD)
 * Remove author_ip após o ciclo de moderação ou tempo limite para contenção de spam
 */
async function purgeOldCommentIps(daysToRetain = 30) {
  const daysApproved = Math.min(daysToRetain, 7); // Aprovados/rejeitados expurgam em até 7 dias
  const daysTotal = daysToRetain; // Pendentes/spam expurgam após 30 dias

  const res = await query(`
    UPDATE public.blog_comments
    SET author_ip = NULL
    WHERE author_ip IS NOT NULL
      AND (
        (status IN ('approved', 'rejected') AND created_at < NOW() - ($1 || ' days')::interval)
        OR created_at < NOW() - ($2 || ' days')::interval
      );
  `, [String(daysApproved), String(daysTotal)]);

  return res.rowCount;
}

/**
 * Incrementa contador de visualização atômico com deduplicação em memória por IP
 */
async function incrementPostView(postId, clientIp = 'unknown') {
  const cacheKey = `${postId}:${clientIp}`;
  const lastSeen = recentViewsCache.get(cacheKey);
  const now = Date.now();

  if (lastSeen && (now - lastSeen < VIEW_DEDUPLICATION_WINDOW_MS)) {
    return false; // Visualização deduplicada, não incrementa
  }

  recentViewsCache.set(cacheKey, now);

  await query('SELECT public.increment_blog_post_view($1);', [postId]);
  return true;
}

module.exports = {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createPost,
  updatePost,
  deletePost,
  getPublicPosts,
  getPublicPostBySlug,
  getSeoPostBySlug,
  getSitemapData,
  addComment,
  listAdminComments,
  moderateComment,
  purgeOldCommentIps,
  incrementPostView,
  calculateReadingTime
};
