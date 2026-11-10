-- ==============================================================================
-- ATHENA BLOG MODULE — BASELINE DE IMPLEMENTAÇÃO V2 BLINDADO (5 TABELAS + VIEW + ALIASES)
-- Branch: blog (Isolamento total de schema em relação ao e-commerce)
-- Arquivo: backend/migrations/2026_11_10_blog_module_baseline.sql
-- ==============================================================================
-- Conformidade: LGPD, BlockNote JSON + HTML pré-renderizado para SEO/OpenGraph,
-- proteção estrita de PII contra vazamento de author_email, moderação antispam,
-- integridade de threading de comentários, histórico automático por trigger e RLS.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 0. FUNÇÕES AUXILIARES DE SUPORTE (SEGURANÇA & INTEGRIDADE)
-- ------------------------------------------------------------------------------

-- Função para verificar privilégios de Administrador ou Editor
-- Blindada contra sequestro de search_path (public, pg_temp)
CREATE OR REPLACE FUNCTION public.is_blog_admin_or_editor()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT (
    -- Acesso via superusuário / backend service role
    current_user IN ('postgres', 'service_role')
    OR (auth.jwt() ->> 'role') = 'service_role'
    -- Acesso via Supabase Auth mapeado para a tabela users
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE (id = auth.uid()::text OR id = (auth.jwt() ->> 'sub'))
        AND role IN ('admin', 'editor', 'edicao')
    )
  );
$$;

-- ------------------------------------------------------------------------------
-- 1. TABELA: blog_categories (Categorias Temáticas do Blog)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blog_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL CHECK (char_length(trim(name)) >= 2),
    slug VARCHAR(120) NOT NULL UNIQUE CHECK (char_length(trim(slug)) >= 2),
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0 CHECK (display_order >= 0),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_categories_order ON public.blog_categories(display_order ASC);

DROP TRIGGER IF EXISTS trg_blog_categories_updated_at ON public.blog_categories;
CREATE TRIGGER trg_blog_categories_updated_at
    BEFORE UPDATE ON public.blog_categories
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_timestamp();

-- ------------------------------------------------------------------------------
-- 2. TABELA: blog_posts (Artigos com BlockNote JSON + HTML para SEO e WhatsApp)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL CHECK (char_length(trim(title)) >= 3),
    slug VARCHAR(280) NOT NULL UNIQUE CHECK (char_length(trim(slug)) >= 3),
    excerpt TEXT,
    content JSONB NOT NULL DEFAULT '[]'::jsonb,
    content_html TEXT, -- HTML pré-renderizado e sanitizado para SEO, Googlebot e WhatsApp previews
    status VARCHAR(20) NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'published', 'archived')),
    author_id VARCHAR(100) REFERENCES public.users(id) ON DELETE SET NULL,
    cover_image_key VARCHAR(255),
    meta_title VARCHAR(150),
    meta_description VARCHAR(250),
    reading_time_minutes INTEGER NOT NULL DEFAULT 5 CHECK (reading_time_minutes > 0),
    view_count INTEGER NOT NULL DEFAULT 0 CHECK (view_count >= 0),
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_blog_posts_published_date 
        CHECK (status != 'published' OR published_at IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_status_published 
    ON public.blog_posts(status, published_at DESC) 
    WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON public.blog_posts(author_id);

DROP TRIGGER IF EXISTS trg_blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER trg_blog_posts_updated_at
    BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_timestamp();

-- ------------------------------------------------------------------------------
-- 3. TABELA: blog_slug_aliases (Redirecionamento 301 Automático quando o Slug Mudar)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blog_slug_aliases (
    old_slug VARCHAR(280) PRIMARY KEY,
    target_post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    target_slug VARCHAR(280) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_slug_aliases_target ON public.blog_slug_aliases(target_post_id);

-- ------------------------------------------------------------------------------
-- 4. TABELA: blog_post_categories (Relacionamento N:N entre Posts e Categorias)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blog_post_categories (
    post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.blog_categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (post_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_blog_post_categories_cat ON public.blog_post_categories(category_id);

-- ------------------------------------------------------------------------------
-- 5. TABELA: blog_comments (Comentários com Threading e Moderação)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blog_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.blog_comments(id) ON DELETE CASCADE,
    author_name VARCHAR(100) NOT NULL CHECK (char_length(trim(author_name)) >= 2),
    author_email VARCHAR(150) NOT NULL CHECK (
        char_length(trim(author_email)) >= 5 AND 
        author_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    ),
    content TEXT NOT NULL CHECK (char_length(trim(content)) >= 2),
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected', 'spam')),
    is_official BOOLEAN NOT NULL DEFAULT FALSE,
    moderated_by VARCHAR(100) REFERENCES public.users(id) ON DELETE SET NULL,
    moderated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_comments_post_status ON public.blog_comments(post_id, status);
CREATE INDEX IF NOT EXISTS idx_blog_comments_parent ON public.blog_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_status ON public.blog_comments(status, created_at DESC);

DROP TRIGGER IF EXISTS trg_blog_comments_updated_at ON public.blog_comments;
CREATE TRIGGER trg_blog_comments_updated_at
    BEFORE UPDATE ON public.blog_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_timestamp();

-- Trigger de Integridade Referencial do Threading:
-- Impede categoricamente respostas vinculadas a comentários de outros artigos
CREATE OR REPLACE FUNCTION public.validate_blog_comment_thread()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    IF NEW.parent_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.blog_comments 
            WHERE id = NEW.parent_id AND post_id = NEW.post_id
        ) THEN
            RAISE EXCEPTION 'Violação de integridade: o comentário pai (parent_id) pertence a outro artigo ou inexiste.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_blog_comment_thread ON public.blog_comments;
CREATE TRIGGER trg_validate_blog_comment_thread
    BEFORE INSERT OR UPDATE OF parent_id, post_id
    ON public.blog_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_blog_comment_thread();

-- ------------------------------------------------------------------------------
-- 6. TABELA: blog_post_revisions (Histórico Automático por Trigger)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blog_post_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    excerpt TEXT,
    content JSONB NOT NULL,
    content_html TEXT,
    cover_image_key VARCHAR(255),
    meta_title VARCHAR(150),
    meta_description VARCHAR(250),
    edited_by VARCHAR(100) REFERENCES public.users(id) ON DELETE SET NULL,
    change_summary VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_revisions_post_id ON public.blog_post_revisions(post_id, created_at DESC);

-- Trigger Automática de Criação de Revisão ao Atualizar Artigo:
-- Garante que nenhum caminho de escrita escape do versionamento
CREATE OR REPLACE FUNCTION public.record_blog_post_revision()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Dispara revisão somente quando houver alteração substancial no conteúdo ou metadados
    IF (OLD.title IS DISTINCT FROM NEW.title OR
        OLD.content IS DISTINCT FROM NEW.content OR
        OLD.excerpt IS DISTINCT FROM NEW.excerpt OR
        OLD.cover_image_key IS DISTINCT FROM NEW.cover_image_key OR
        OLD.meta_title IS DISTINCT FROM NEW.meta_title OR
        OLD.meta_description IS DISTINCT FROM NEW.meta_description) THEN
        
        INSERT INTO public.blog_post_revisions (
            post_id,
            title,
            excerpt,
            content,
            content_html,
            cover_image_key,
            meta_title,
            meta_description,
            edited_by,
            change_summary,
            created_at
        ) VALUES (
            OLD.id,
            OLD.title,
            OLD.excerpt,
            OLD.content,
            OLD.content_html,
            OLD.cover_image_key,
            OLD.meta_title,
            OLD.meta_description,
            NEW.author_id,
            'Snapshot automático pré-atualização',
            NOW()
        );
    END IF;

    -- Se o slug mudou, registra alias de redirecionamento 301 automaticamente
    IF (OLD.slug IS DISTINCT FROM NEW.slug) THEN
        INSERT INTO public.blog_slug_aliases (old_slug, target_post_id, target_slug, created_at)
        VALUES (OLD.slug, NEW.id, NEW.slug, NOW())
        ON CONFLICT (old_slug) DO UPDATE
            SET target_slug = EXCLUDED.target_slug;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_record_blog_post_revision ON public.blog_posts;
CREATE TRIGGER trg_record_blog_post_revision
    AFTER UPDATE ON public.blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION public.record_blog_post_revision();

-- ------------------------------------------------------------------------------
-- 7. FUNÇÃO RPC: increment_blog_post_view (Contador Atômico de Visualizações)
-- ------------------------------------------------------------------------------
-- Impede visitantes de alterar arbitrariamente view_count por UPDATE direto
CREATE OR REPLACE FUNCTION public.increment_blog_post_view(p_post_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    UPDATE public.blog_posts
    SET view_count = view_count + 1
    WHERE id = p_post_id AND status = 'published' AND published_at <= NOW();
END;
$$;

-- ------------------------------------------------------------------------------
-- 8. VIEW PÚBLICA SEGURA: blog_comments_public (Com security_barrier e sem PII)
-- ------------------------------------------------------------------------------
-- Blindada contra vazamento de author_email, IP e moderadores
CREATE OR REPLACE VIEW public.blog_comments_public
WITH (security_barrier = true) AS
SELECT 
    id,
    post_id,
    parent_id,
    author_name,
    content,
    status,
    is_official,
    created_at,
    updated_at
FROM public.blog_comments
WHERE status = 'approved';

-- ------------------------------------------------------------------------------
-- 9. POLÍTICAS DE ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------------------------
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_slug_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_revisions ENABLE ROW LEVEL SECURITY;

-- --- A. BLOG_CATEGORIES ---
DROP POLICY IF EXISTS p_blog_categories_public_read ON public.blog_categories;
CREATE POLICY p_blog_categories_public_read ON public.blog_categories
    FOR SELECT USING (true);

DROP POLICY IF EXISTS p_blog_categories_admin_all ON public.blog_categories;
CREATE POLICY p_blog_categories_admin_all ON public.blog_categories
    FOR ALL 
    USING (public.is_blog_admin_or_editor())
    WITH CHECK (public.is_blog_admin_or_editor());

-- --- B. BLOG_POSTS ---
-- Leitura pública estritamente para posts publicados com data <= NOW()
DROP POLICY IF EXISTS p_blog_posts_public_read ON public.blog_posts;
CREATE POLICY p_blog_posts_public_read ON public.blog_posts
    FOR SELECT USING (status = 'published' AND published_at <= NOW());

-- Acesso administrativo integral
DROP POLICY IF EXISTS p_blog_posts_admin_all ON public.blog_posts;
CREATE POLICY p_blog_posts_admin_all ON public.blog_posts
    FOR ALL 
    USING (public.is_blog_admin_or_editor())
    WITH CHECK (public.is_blog_admin_or_editor());

-- --- C. BLOG_SLUG_ALIASES ---
-- Leitura pública para resolução de redirecionamentos 301
DROP POLICY IF EXISTS p_blog_slug_aliases_public_read ON public.blog_slug_aliases;
CREATE POLICY p_blog_slug_aliases_public_read ON public.blog_slug_aliases
    FOR SELECT USING (true);

DROP POLICY IF EXISTS p_blog_slug_aliases_admin_all ON public.blog_slug_aliases;
CREATE POLICY p_blog_slug_aliases_admin_all ON public.blog_slug_aliases
    FOR ALL 
    USING (public.is_blog_admin_or_editor())
    WITH CHECK (public.is_blog_admin_or_editor());

-- --- D. BLOG_POST_CATEGORIES ---
-- Leitura pública restrita a posts publicados (evita vazamento de temas de rascunhos)
DROP POLICY IF EXISTS p_blog_post_categories_public_read ON public.blog_post_categories;
CREATE POLICY p_blog_post_categories_public_read ON public.blog_post_categories
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.blog_posts p 
            WHERE p.id = post_id 
              AND p.status = 'published' 
              AND p.published_at <= NOW()
        )
    );

DROP POLICY IF EXISTS p_blog_post_categories_admin_all ON public.blog_post_categories;
CREATE POLICY p_blog_post_categories_admin_all ON public.blog_post_categories
    FOR ALL 
    USING (public.is_blog_admin_or_editor())
    WITH CHECK (public.is_blog_admin_or_editor());

-- --- E. BLOG_COMMENTS ---
-- Acesso administrativo e por service_role na tabela base
DROP POLICY IF EXISTS p_blog_comments_admin_all ON public.blog_comments;
CREATE POLICY p_blog_comments_admin_all ON public.blog_comments
    FOR ALL 
    USING (public.is_blog_admin_or_editor())
    WITH CHECK (public.is_blog_admin_or_editor());

-- Leitura na tabela base restrita apenas a aprovados para usuários autenticados
DROP POLICY IF EXISTS p_blog_comments_read_approved ON public.blog_comments;
CREATE POLICY p_blog_comments_read_approved ON public.blog_comments
    FOR SELECT 
    USING (status = 'approved');

-- Inserção pública com todas as blindagens (moderated_by e moderated_at nulos obrigatórios)
DROP POLICY IF EXISTS p_blog_comments_public_insert ON public.blog_comments;
CREATE POLICY p_blog_comments_public_insert ON public.blog_comments
    FOR INSERT 
    WITH CHECK (
        status = 'pending' 
        AND is_official = false
        AND moderated_by IS NULL
        AND moderated_at IS NULL
        AND EXISTS (
            SELECT 1 FROM public.blog_posts 
            WHERE id = post_id 
              AND status = 'published' 
              AND published_at <= NOW()
        )
    );

-- --- F. BLOG_POST_REVISIONS ---
-- Histórico 100% blindado contra acesso público
DROP POLICY IF EXISTS p_blog_revisions_admin_all ON public.blog_post_revisions;
CREATE POLICY p_blog_revisions_admin_all ON public.blog_post_revisions
    FOR ALL 
    USING (public.is_blog_admin_or_editor())
    WITH CHECK (public.is_blog_admin_or_editor());

-- ------------------------------------------------------------------------------
-- 10. PRIVILÉGIOS DE ACESSO A NÍVEL DE BANCO (GRANTS & REVOKES ESTRITOS)
-- ------------------------------------------------------------------------------
-- 1. Leitura pública permitida apenas na view desidentificada (sem author_email)
GRANT SELECT ON public.blog_comments_public TO anon, authenticated;

-- 2. Revogação integral de SELECT geral na tabela base de comentários
REVOKE ALL ON public.blog_comments FROM anon, authenticated;

-- 3. Concessão cirúrgica de SELECT apenas nas colunas não sensíveis da tabela base
GRANT SELECT (id, post_id, parent_id, author_name, content, status, is_official, created_at, updated_at)
    ON public.blog_comments TO anon, authenticated;

-- 4. Permissão de inserção pública (para envio de comentários com status pending)
GRANT INSERT (post_id, parent_id, author_name, author_email, content, status, is_official)
    ON public.blog_comments TO anon, authenticated;

-- 5. RPC de visualização liberada publicamente
GRANT EXECUTE ON FUNCTION public.increment_blog_post_view(UUID) TO anon, authenticated;

-- 6. Total privilégio para o service_role (backend da Athena)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role;
