-- ==============================================================================
-- ATHENA BLOG MODULE — STUBS DE TESTE PARA SUPABASE DESPOSITÁVEL
-- Arquivo: tests/sql/00_stubs.sql
-- NOTA: Este arquivo roda APENAS no banco de teste para simular o ambiente
-- de produção da Athena (tabela users e trigger set_updated_at_timestamp).
-- NUNCA deve ser incluído na migration versionada de produção.
-- ==============================================================================

-- 1. Tabela users (espelhada de backend/server.js:1069)
CREATE TABLE IF NOT EXISTS public.users (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'vendedor',
    first_login_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    last_login_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Trigger function set_updated_at_timestamp (espelhada de backend/server.js:1535)
CREATE OR REPLACE FUNCTION public.set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
