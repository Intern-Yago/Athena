-- Migration: 2026_10_23_idempotency_and_license_lifecycle.sql
-- Adiciona tabela de chaves de idempotência para blindagem de pagamentos
-- Adiciona campos de ciclo de vida e validade para licenças digitais (SGW e Scanners)

-- 1. Tabela de Idempotência de Pagamentos
CREATE TABLE IF NOT EXISTS payment_idempotency_keys (
  key VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255),
  request_hash VARCHAR(64) NOT NULL,
  billing_type VARCHAR(50),
  amount NUMERIC(12, 2),
  status VARCHAR(50) NOT NULL DEFAULT 'PROCESSING', -- 'PROCESSING', 'COMPLETED', 'FAILED'
  response_status INT,
  response_body JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
);

CREATE INDEX IF NOT EXISTS idx_payment_idempotency_created ON payment_idempotency_keys(created_at);
CREATE INDEX IF NOT EXISTS idx_payment_idempotency_hash ON payment_idempotency_keys(request_hash);

-- 2. Ciclo de Vida e Expiração em digital_activations
ALTER TABLE digital_activations ADD COLUMN IF NOT EXISTS validity_days INT DEFAULT 365;
ALTER TABLE digital_activations ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE digital_activations ADD COLUMN IF NOT EXISTS renewal_status VARCHAR(50) DEFAULT 'active';
ALTER TABLE digital_activations ADD COLUMN IF NOT EXISTS renewal_reminders_sent JSONB DEFAULT '[]'::jsonb;
ALTER TABLE digital_activations ADD COLUMN IF NOT EXISTS renewed_from_id INT;

CREATE INDEX IF NOT EXISTS idx_digital_activations_expires_at ON digital_activations(expires_at);
CREATE INDEX IF NOT EXISTS idx_digital_activations_renewal_status ON digital_activations(renewal_status);
