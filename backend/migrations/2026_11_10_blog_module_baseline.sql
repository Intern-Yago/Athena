-- ==============================================================================
-- ATHENA BLOG MODULE — BASELINE V4 BLINDADO & CIRÚRGICO
-- Branch: blog (Isolamento total em relação ao e-commerce da Athena)
-- Arquivo: backend/migrations/2026_11_10_blog_module_baseline.sql
-- ==============================================================================
-- Arquitetura de Defesa & Escopo:
-- 1. Perímetro Primário (Layer 1): Backend Node.js da Athena
--    - Autenticação e RBAC via middlewares (requireAdmin, requireStaff).
--    - Sanitização de HTML com allowlist estrita (DOMPurify/sanitize-html).
--    - Submissão de comentários exclusiva via endpoint com rate limit e honeypot.
-- 2. Perímetro Secundário (Layer 2): PostgreSQL RLS + Security Barrier View
--    - Defesa em profundidade caso o PostgREST seja exposto.
--    - Grants estritamente delimitados às tabelas do blog (zero impacto no e-commerce).
-- 3. Auditoria de Autoria Real:
--    - Trigger de revisão captura app.current_user_id via current_setting.
-- 4. Prevenção de Colisão e Sequestro de Slugs/Aliases.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 0. STUBS DE COMPATIBILIDADE SUPABASE (Para testes em Postgres local / Docker)
-- ------------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'auth') THEN
        CREATE SCHEMA auth;
    END IF;
END $$;

CREATE OR REPLACE FUNCTION auth.uid()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

CREATE OR REPLACE FUNCTION auth.jwt()
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    NULLIF(current_setting('request.jwt.claims', true), '')::jsonb,
    '{}'::jsonb
  );
$$;

-- ------------------------------------------------------------------------------
-- 1. FUNÇÕES AUXILIARES DE SUPORTE (SEGURANÇA & INTEGRIDADE)
-- ------------------------------------------------------------------------------

-- Função para verificar privilégios de Administrador ou Editor
-- Blindada contra sequestro de search_path e vazamento de privilégios para anon
CREATE OR REPLACE FUNCTION public.is_blog_admin_or_editor()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_role text;
  v_jwt_role text;
BEGIN
  v_role := current_setting('role', true);
  v_jwt_role := COALESCE(auth.jwt() ->> 'role', '');

  -- Bloqueio categórico: visitante anônimo NUNCA possui privilégio de admin/editor
  IF v_role = 'anon' OR v_jwt_role = 'anon' THEN
    RETURN FALSE;
  END IF;

  -- Acesso irrestrito concedido ao service_role do backend ou superusuário de sessão
  IF (
    v_role = 'service_role' 
    OR v_jwt_role = 'service_role'
    OR (v_role = 'none' AND SESSION_USER IN ('postgres', 'service_role'))
  ) THEN
    RETURN TRUE;
  END IF;

  -- Para sessões autenticadas via Supabase Auth (Layer 2), valida role na tabela users
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE (id = auth.uid()::text OR id = (auth.jwt() ->> 'sub'))
      AND role IN ('admin', 'editor', 'edicao')
  );
END;
$$;

-- ------------------------------------------------------------------------------
-- 2. TABELA: blog_categories (Categorias Temáticas do Blog)
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
-- 3. TABELA: blog_posts (Artigos com BlockNote JSON + content_html para SEO)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL CHECK (char_length(trim(title)) >= 3),
    slug VARCHAR(280) NOT NULL UNIQUE CHECK (char_length(trim(slug)) >= 3),
    excerpt TEXT,
    content JSONB NOT NULL DEFAULT '[]'::jsonb,
    content_html TEXT, -- Gerado no backend por allowlist sanitizada
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
-- 4. TABELA: blog_slug_aliases (Redirecionamento 301 Automático sem Loops)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blog_slug_aliases (
    old_slug VARCHAR(280) PRIMARY KEY,
    target_post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    target_slug VARCHAR(280) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_slug_aliases_target ON public.blog_slug_aliases(target_post_id);

-- Trigger de Prevenção de Colisão:
-- Impede que um post adote um slug que já é um alias ativo de outro artigo
CREATE OR REPLACE FUNCTION public.check_blog_slug_collision()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM public.blog_slug_aliases
        WHERE old_slug = NEW.slug AND target_post_id <> NEW.id
    ) THEN
        RAISE EXCEPTION 'Colisão de URL: O slug informado já é um alias ativo de redirecionamento de outro artigo.';
    END IF;

    -- Se o novo slug reivindicar um alias antigo do próprio artigo, remove o alias redundante
    DELETE FROM public.blog_slug_aliases
    WHERE old_slug = NEW.slug AND target_post_id = NEW.id;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_blog_slug_collision ON public.blog_posts;
CREATE TRIGGER trg_check_blog_slug_collision
    BEFORE INSERT OR UPDATE OF slug
    ON public.blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION public.check_blog_slug_collision();

-- ------------------------------------------------------------------------------
-- 5. TABELA: blog_post_categories (Relacionamento N:N entre Posts e Categorias)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blog_post_categories (
    post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.blog_categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (post_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_blog_post_categories_cat ON public.blog_post_categories(category_id);

-- ------------------------------------------------------------------------------
-- 6. TABELA: blog_comments (Comentários com Threading e Moderação)
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
-- Impede respostas vinculadas a comentários de outros artigos
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
-- 7. TABELA: blog_post_revisions (Auditoria com Identificação Real do Editor)
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

-- Trigger Automática: Executa APENAS quando há alteração de conteúdo ou metadados
-- Captura o editor ativo da sessão via app.current_user_id (com fallback para NEW.author_id)
CREATE OR REPLACE FUNCTION public.record_blog_post_revision()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_editor_id varchar(100);
BEGIN
  -- Obtém o ID do usuário que efetuou a requisição no backend via variável de sessão
  v_editor_id := COALESCE(
    NULLIF(current_setting('app.current_user_id', true), ''),
    NEW.author_id
  );

  -- Snapshot pré-edição
  INSERT INTO public.blog_post_revisions (
      post_id, title, excerpt, content, content_html,
      cover_image_key, meta_title, meta_description,
      edited_by, change_summary, created_at
  ) VALUES (
      OLD.id, OLD.title, OLD.excerpt, OLD.content, OLD.content_html,
      OLD.cover_image_key, OLD.meta_title, OLD.meta_description,
      v_editor_id, 'Snapshot automático pré-atualização', NOW()
  );

  -- Se o slug mudou, registra alias 301 e destrói loops reversos
  IF (OLD.slug IS DISTINCT FROM NEW.slug) THEN
      DELETE FROM public.blog_slug_aliases WHERE old_slug = NEW.slug;
      INSERT INTO public.blog_slug_aliases (old_slug, target_post_id, target_slug, created_at)
      VALUES (OLD.slug, NEW.id, NEW.slug, NOW())
      ON CONFLICT (old_slug) DO UPDATE SET target_slug = EXCLUDED.target_slug;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_record_blog_post_revision ON public.blog_posts;
CREATE TRIGGER trg_record_blog_post_revision
    AFTER UPDATE ON public.blog_posts
    FOR EACH ROW
    WHEN (
        OLD.title IS DISTINCT FROM NEW.title OR
        OLD.content IS DISTINCT FROM NEW.content OR
        OLD.content_html IS DISTINCT FROM NEW.content_html OR
        OLD.excerpt IS DISTINCT FROM NEW.excerpt OR
        OLD.cover_image_key IS DISTINCT FROM NEW.cover_image_key OR
        OLD.meta_title IS DISTINCT FROM NEW.meta_title OR
        OLD.meta_description IS DISTINCT FROM NEW.meta_description OR
        OLD.slug IS DISTINCT FROM NEW.slug
    )
    EXECUTE FUNCTION public.record_blog_post_revision();

-- ------------------------------------------------------------------------------
-- 8. FUNÇÃO RPC: increment_blog_post_view (Contador Atômico)
-- ------------------------------------------------------------------------------
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
-- 9. VIEW PÚBLICA SEGURA: blog_comments_public (Com Validação de Post Ativo)
-- ------------------------------------------------------------------------------
-- 1. security_barrier = true impede que filtros do chamador executem antes da view
-- 2. Filtra status = 'approved' E valida se o post pai está publicado no passado
-- NOTA ARQUITETURAL: Como a view roda com privilégios do criador, o EXISTS valida
-- os posts diretamente. O author_email é omitido na raiz da projeção (LGPD).
CREATE OR REPLACE VIEW public.blog_comments_public
WITH (security_barrier = true) AS
SELECT 
    c.id,
    c.post_id,
    c.parent_id,
    c.author_name,
    c.content,
    c.status,
    c.is_official,
    c.created_at,
    c.updated_at
FROM public.blog_comments c
WHERE c.status = 'approved'
  AND EXISTS (
      SELECT 1 FROM public.blog_posts p
      WHERE p.id = c.post_id 
        AND p.status = 'published' 
        AND p.published_at <= NOW()
  );

-- ------------------------------------------------------------------------------
-- 10. POLÍTICAS DE ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------------------------
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_slug_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_revisions ENABLE ROW LEVEL SECURITY;

-- Categorias
DROP POLICY IF EXISTS p_blog_categories_public_read ON public.blog_categories;
CREATE POLICY p_blog_categories_public_read ON public.blog_categories
    FOR SELECT USING (true);

DROP POLICY IF EXISTS p_blog_categories_admin_all ON public.blog_categories;
CREATE POLICY p_blog_categories_admin_all ON public.blog_categories
    FOR ALL USING (public.is_blog_admin_or_editor()) WITH CHECK (public.is_blog_admin_or_editor());

-- Artigos (Público lê apenas publicados no passado)
DROP POLICY IF EXISTS p_blog_posts_public_read ON public.blog_posts;
CREATE POLICY p_blog_posts_public_read ON public.blog_posts
    FOR SELECT USING (status = 'published' AND published_at <= NOW());

DROP POLICY IF EXISTS p_blog_posts_admin_all ON public.blog_posts;
CREATE POLICY p_blog_posts_admin_all ON public.blog_posts
    FOR ALL USING (public.is_blog_admin_or_editor()) WITH CHECK (public.is_blog_admin_or_editor());

-- Aliases 301
DROP POLICY IF EXISTS p_blog_slug_aliases_public_read ON public.blog_slug_aliases;
CREATE POLICY p_blog_slug_aliases_public_read ON public.blog_slug_aliases
    FOR SELECT USING (true);

DROP POLICY IF EXISTS p_blog_slug_aliases_admin_all ON public.blog_slug_aliases;
CREATE POLICY p_blog_slug_aliases_admin_all ON public.blog_slug_aliases
    FOR ALL USING (public.is_blog_admin_or_editor()) WITH CHECK (public.is_blog_admin_or_editor());

-- Relacionamento Post-Categoria
DROP POLICY IF EXISTS p_blog_post_categories_public_read ON public.blog_post_categories;
CREATE POLICY p_blog_post_categories_public_read ON public.blog_post_categories
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.blog_posts p 
            WHERE p.id = post_id AND p.status = 'published' AND p.published_at <= NOW()
        )
    );

DROP POLICY IF EXISTS p_blog_post_categories_admin_all ON public.blog_post_categories;
CREATE POLICY p_blog_post_categories_admin_all ON public.blog_post_categories
    FOR ALL USING (public.is_blog_admin_or_editor()) WITH CHECK (public.is_blog_admin_or_editor());

-- Comentários (Tabela Base)
-- Leitura pública proibida na tabela base; apenas service_role e admin
DROP POLICY IF EXISTS p_blog_comments_admin_all ON public.blog_comments;
CREATE POLICY p_blog_comments_admin_all ON public.blog_comments
    FOR ALL USING (public.is_blog_admin_or_editor()) WITH CHECK (public.is_blog_admin_or_editor());

-- Revisões (Histórico)
DROP POLICY IF EXISTS p_blog_revisions_admin_all ON public.blog_post_revisions;
CREATE POLICY p_blog_revisions_admin_all ON public.blog_post_revisions
    FOR ALL USING (public.is_blog_admin_or_editor()) WITH CHECK (public.is_blog_admin_or_editor());

-- ------------------------------------------------------------------------------
-- 11. PRIVILÉGIOS DE ACESSO CIRÚRGICOS (GRANTS & REVOKES ESTRITOS AO BLOG)
-- ------------------------------------------------------------------------------
-- 1. Acesso público (anon) limitado estritamente à leitura de dados aprovados/publicados
GRANT SELECT ON public.blog_categories TO anon, authenticated;
GRANT SELECT ON public.blog_posts TO anon, authenticated;
GRANT SELECT ON public.blog_post_categories TO anon, authenticated;
GRANT SELECT ON public.blog_slug_aliases TO anon, authenticated;
GRANT SELECT ON public.blog_comments_public TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_blog_post_view(UUID) TO anon, authenticated;

-- 2. Tabela base de comentários é 100% fechada contra acessos de visitantes
REVOKE ALL ON public.blog_comments FROM anon, authenticated;

-- 3. Grants administrativos para authenticated (Avaliados sob as RLS admin_all)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_slug_aliases TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_post_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_comments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_post_revisions TO authenticated;

-- 4. Permissões do backend service_role ESTRITAMENTE delimitadas às tabelas do blog
GRANT ALL ON TABLE public.blog_categories TO service_role;
GRANT ALL ON TABLE public.blog_posts TO service_role;
GRANT ALL ON TABLE public.blog_slug_aliases TO service_role;
GRANT ALL ON TABLE public.blog_post_categories TO service_role;
GRANT ALL ON TABLE public.blog_comments TO service_role;
GRANT ALL ON TABLE public.blog_post_revisions TO service_role;
GRANT ALL ON TABLE public.blog_comments_public TO service_role;

GRANT EXECUTE ON FUNCTION public.is_blog_admin_or_editor() TO service_role;
GRANT EXECUTE ON FUNCTION public.check_blog_slug_collision() TO service_role;
GRANT EXECUTE ON FUNCTION public.validate_blog_comment_thread() TO service_role;
GRANT EXECUTE ON FUNCTION public.record_blog_post_revision() TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_blog_post_view(UUID) TO service_role;
