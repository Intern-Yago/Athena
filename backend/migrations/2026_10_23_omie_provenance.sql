-- Migration: 2026_10_23_omie_provenance.sql
-- Rastreabilidade de origem de dados para Preço e Estoque (Omie ERP vs Edição Manual)

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price_source VARCHAR(20) DEFAULT 'manual';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_source VARCHAR(20) DEFAULT 'manual';

CREATE INDEX IF NOT EXISTS idx_products_price_source ON public.products(price_source);
CREATE INDEX IF NOT EXISTS idx_products_stock_source ON public.products(stock_source);

UPDATE public.products 
SET price_source = 'omie', stock_source = 'omie' 
WHERE (omie_codigo_produto IS NOT NULL OR omie_product_id IS NOT NULL) 
  AND (price_source IS NULL OR price_source = 'manual')
  AND omie_last_sync IS NOT NULL;
