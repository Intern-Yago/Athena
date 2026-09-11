-- ==============================================================================
-- ATHENA ERP / OMIE INTEGRATION MIGRATION: CACHE-ASIDE READ REPLICA
-- ==============================================================================
-- Adiciona colunas para sincronizacao de alta performance com o ERP Omie.
-- Estas colunas sao invisiveis para o catalogo publico do frontend e atendem
-- as consultas ultra-rapidas do agente de IA Hermes e rotinas de estoque/preco.

-- 1. Criacao das novas colunas na tabela products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS omie_codigo_produto BIGINT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS estoque_quantidade INTEGER DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS preco_venda NUMERIC(12,2) DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS omie_last_sync TIMESTAMP;

-- 2. Sincronizacao e compatibilidade com dados existentes
UPDATE public.products 
SET omie_codigo_produto = omie_product_id 
WHERE omie_codigo_produto IS NULL AND omie_product_id IS NOT NULL;

UPDATE public.products 
SET preco_venda = price 
WHERE (preco_venda IS NULL OR preco_venda = 0) AND price > 0;

-- 3. Indices de alta performance para busca e reconciliacao
CREATE INDEX IF NOT EXISTS idx_products_omie_codigo_produto ON public.products(omie_codigo_produto);
CREATE INDEX IF NOT EXISTS idx_products_omie_code ON public.products(omie_code);
CREATE INDEX IF NOT EXISTS idx_products_estoque_quantidade ON public.products(estoque_quantidade);
CREATE INDEX IF NOT EXISTS idx_products_preco_venda ON public.products(preco_venda);

-- 4. Extensao e indices para busca textual/fuzzy otimizada
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON public.products USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_slug_trgm ON public.products USING gin(slug gin_trgm_ops);
