-- ==============================================================================
-- ATHENA BLOG MODULE — BASELINE DE IMPLEMENTAÇÃO BLINDADO (5 TABELAS)
-- Branch: blog (Isolamento total de schema em relação ao e-commerce)
-- Arquivo: backend/migrations/2026_11_10_blog_module_baseline.sql
-- ==============================================================================
-- Este script implementa as 5 entidades do blog da Athena com conformidade LGPD,
-- integridade referencial estrita, moderação de comentários com proteção PII,
-- publicação programada, controle de concorrência e RLS administrativo.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 0. FUNÇÕES AUXILIARES DE SUPORTE (SEGURANÇA & INTEGRIDADE)
-- ------------------------------------------------------------------------------

-- Função para verificar se o ator possui privilégios de Administrador ou Editor
CREATE OR REPLACE FUNCTION public.is_blog_admin_or_editor()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
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

-- Nota: A coluna slug já possui índice implícito criado pela constraint UNIQUE
CREATE INDEX IF NOT EXISTS idx_blog_categories_order ON public.blog_categories(display_order ASC);

-- Trigger de atualização automática de timestamp
DROP TRIGGER IF EXISTS trg_blog_categories_updated_at ON public.blog_categories;
CREATE TRIGGER trg_blog_categories_updated_at
    BEFORE UPDATE ON public.blog_categories
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_timestamp();

-- ------------------------------------------------------------------------------
-- 2. TABELA: blog_posts (Artigos, Guias Técnicos e Tutoriais)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL CHECK (char_length(trim(title)) >= 3),
    slug VARCHAR(280) NOT NULL UNIQUE CHECK (char_length(trim(slug)) >= 3),
    excerpt TEXT,
    content JSONB NOT NULL DEFAULT '[]'::jsonb,
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

-- Nota: A coluna slug já possui índice implícito criado pela constraint UNIQUE
CREATE INDEX IF NOT EXISTS idx_blog_posts_status_published 
    ON public.blog_posts(status, published_at DESC) 
    WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON public.blog_posts(author_id);

-- Trigger de atualização automática de timestamp
DROP TRIGGER IF EXISTS trg_blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER trg_blog_posts_updated_at
    BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_timestamp();

-- ------------------------------------------------------------------------------
-- 3. TABELA: blog_post_categories (Relacionamento N:N entre Posts e Categorias)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blog_post_categories (
    post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.blog_categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (post_id, category_id)
);

-- Nota: Chave primária composta já indexa (post_id, category_id). Indexamos category_id para buscas reversas:
CREATE INDEX IF NOT EXISTS idx_blog_post_categories_cat ON public.blog_post_categories(category_id);

-- ------------------------------------------------------------------------------
-- 4. TABELA: blog_comments (Comentários com Threading e Moderação)
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

-- Trigger de atualização automática de timestamp
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
-- 5. TABELA: blog_post_revisions (Auditoria, Versionamento e Rollback)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blog_post_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    excerpt TEXT,
    content JSONB NOT NULL,
    cover_image_key VARCHAR(255),
    meta_title VARCHAR(150),
    meta_description VARCHAR(250),
    edited_by VARCHAR(100) REFERENCES public.users(id) ON DELETE SET NULL,
    change_summary VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_revisions_post_id ON public.blog_post_revisions(post_id, created_at DESC);

-- ------------------------------------------------------------------------------
-- 6. VIEW PÚBLICA SEGURA: blog_comments_public (Proteção PII / LGPD de E-mails)
-- ------------------------------------------------------------------------------
-- Impede vazamento público de author_email, author_ip ou moderated_by.
CREATE OR REPLACE VIEW public.blog_comments_public AS
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
-- 7. POLÍTICAS DE ROW LEVEL SECURITY (RLS) IDEMPOTENTES & REAPLICÁVEIS
-- ------------------------------------------------------------------------------
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
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
-- Leitura pública apenas para artigos publicados com data de publicação válida (não futura)
DROP POLICY IF EXISTS p_blog_posts_public_read ON public.blog_posts;
CREATE POLICY p_blog_posts_public_read ON public.blog_posts
    FOR SELECT USING (status = 'published' AND published_at <= NOW());

-- Acesso administrativo irrestrito (leitura de rascunhos, agendados, criação e edição)
DROP POLICY IF EXISTS p_blog_posts_admin_all ON public.blog_posts;
CREATE POLICY p_blog_posts_admin_all ON public.blog_posts
    FOR ALL 
    USING (public.is_blog_admin_or_editor())
    WITH CHECK (public.is_blog_admin_or_editor());

-- --- C. BLOG_POST_CATEGORIES ---
DROP POLICY IF EXISTS p_blog_post_categories_public_read ON public.blog_post_categories;
CREATE POLICY p_blog_post_categories_public_read ON public.blog_post_categories
    FOR SELECT USING (true);

DROP POLICY IF EXISTS p_blog_post_categories_admin_all ON public.blog_post_categories;
CREATE POLICY p_blog_post_categories_admin_all ON public.blog_post_categories
    FOR ALL 
    USING (public.is_blog_admin_or_editor())
    WITH CHECK (public.is_blog_admin_or_editor());

-- --- D. BLOG_COMMENTS ---
-- Proteção de dados: O leitor comum consulta preferencialmente a VIEW blog_comments_public.
-- Na tabela base, a leitura é permitida se aprovado OU se for administrador
DROP POLICY IF EXISTS p_blog_comments_read ON public.blog_comments;
CREATE POLICY p_blog_comments_read ON public.blog_comments
    FOR SELECT 
    USING (status = 'approved' OR public.is_blog_admin_or_editor());

-- Inserção pública com travas estritas:
-- 1. Status inicial deve ser obrigatoriamente 'pending';
-- 2. is_official não pode ser forjado como true por anônimos;
-- 3. O artigo de destino DEVE estar publicado e com data <= NOW().
DROP POLICY IF EXISTS p_blog_comments_public_insert ON public.blog_comments;
CREATE POLICY p_blog_comments_public_insert ON public.blog_comments
    FOR INSERT 
    WITH CHECK (
        status = 'pending' 
        AND is_official = false
        AND EXISTS (
            SELECT 1 FROM public.blog_posts 
            WHERE id = post_id 
              AND status = 'published' 
              AND published_at <= NOW()
        )
    );

-- Gestão administrativa de comentários (aprovação, rejeição, respostas oficiais, exclusão)
DROP POLICY IF EXISTS p_blog_comments_admin_all ON public.blog_comments;
CREATE POLICY p_blog_comments_admin_all ON public.blog_comments
    FOR ALL 
    USING (public.is_blog_admin_or_editor())
    WITH CHECK (public.is_blog_admin_or_editor());

-- --- E. BLOG_POST_REVISIONS ---
-- Histórico de revisões é 100% restrito a administradores e editores (leitura pública proibida)
DROP POLICY IF EXISTS p_blog_revisions_admin_all ON public.blog_post_revisions;
CREATE POLICY p_blog_revisions_admin_all ON public.blog_post_revisions
    FOR ALL 
    USING (public.is_blog_admin_or_editor())
    WITH CHECK (public.is_blog_admin_or_editor());

-- ------------------------------------------------------------------------------
-- 8. PRIVILÉGIOS DE ACESSO A NÍVEL DE BANCO (GRANTS & REVOKES)
-- ------------------------------------------------------------------------------
-- Garante acesso de leitura da view pública para anon e authenticated
GRANT SELECT ON public.blog_comments_public TO anon, authenticated;
-- Revoga leitura direta de author_email por anon/authenticated na tabela base
REVOKE SELECT (author_email) ON public.blog_comments FROM anon, authenticated;
