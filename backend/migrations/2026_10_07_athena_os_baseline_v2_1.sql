-- ==============================================================================
-- ATHENA OS v2.1 — BASELINE DE IMPLEMENTAÇÃO (FASE 1A)
-- ==============================================================================
-- Este script implementa as 10 entidades relacionais que formam o núcleo operacional
-- do Athena OS: Vendas, Logística, Ativação Técnica, Fidelidade, Auditoria e Segurança.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. TABELA: orders (Evolução / Adequação do Cabeçalho Central do Pedido)
-- ------------------------------------------------------------------------------
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_number VARCHAR(30);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_id VARCHAR(100);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_type VARCHAR(20) DEFAULT 'sale';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(30) DEFAULT 'pending';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS fulfillment_status VARCHAR(30) DEFAULT 'unfulfilled';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS subtotal_amount NUMERIC(12,2) DEFAULT 0.00;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(12,2) DEFAULT 0.00;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_amount NUMERIC(12,2) DEFAULT 0.00;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS points_spent INTEGER DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS points_earned INTEGER DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(30);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS asaas_payment_id VARCHAR(100);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS omie_pedido_id VARCHAR(100);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS omie_nfe_number VARCHAR(50);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS omie_nfe_url TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_address JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_snapshot JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.orders ALTER COLUMN items DROP NOT NULL;
ALTER TABLE public.orders ALTER COLUMN items SET DEFAULT '[]'::jsonb;

-- Backfill seguro para dados pré-existentes
UPDATE public.orders 
SET order_number = COALESCE(order_number, id),
    customer_id = COALESCE(customer_id, user_id),
    subtotal_amount = COALESCE(subtotal_amount, total_amount, 0.00),
    payment_status = CASE 
        WHEN status IN ('pago', 'faturado') THEN 'paid'
        WHEN status IN ('cancelado') THEN 'cancelled'
        ELSE 'pending'
    END,
    fulfillment_status = CASE 
        WHEN status IN ('entregue') THEN 'fulfilled'
        ELSE 'unfulfilled'
    END
WHERE order_number IS NULL OR customer_id IS NULL;

-- Garante constraint UNIQUE no order_number após o backfill
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_orders_order_number'
    ) THEN
        ALTER TABLE public.orders ADD CONSTRAINT uq_orders_order_number UNIQUE (order_number);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status_dims ON public.orders(status, payment_status, fulfillment_status);
CREATE INDEX IF NOT EXISTS idx_orders_order_type ON public.orders(order_type);

-- ------------------------------------------------------------------------------
-- 2. TABELA: order_items (Itens de Pedidos com fulfillment_status Unificado)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id VARCHAR(100) NOT NULL,
    product_id VARCHAR(100) NOT NULL,
    variant_sku VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    total_price NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    points_price INTEGER DEFAULT 0,
    fulfillment_type VARCHAR(20) NOT NULL CHECK (fulfillment_type IN ('physical', 'digital')),
    fulfillment_status VARCHAR(30) NOT NULL DEFAULT 'pending'
        CHECK (fulfillment_status IN (
            'pending',
            'picking', 'packed', 'shipped', 'delivered',
            'awaiting_activation', 'contacted', 'activating', 'activated',
            'cancelled'
        )),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- ------------------------------------------------------------------------------
-- 3. TABELA: inventory_reservations (Reserva Temporária de Estoque com TTL)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.inventory_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id VARCHAR(100) NOT NULL,
    product_id VARCHAR(100) NOT NULL,
    variant_sku VARCHAR(100),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'reserved' 
        CHECK (status IN ('reserved', 'confirmed', 'released')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    released_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reservations_status_expires ON public.inventory_reservations(status, expires_at);
CREATE INDEX IF NOT EXISTS idx_reservations_order_id ON public.inventory_reservations(order_id);

-- ------------------------------------------------------------------------------
-- 4. TABELA: shipments (Expedição, Múltiplos Volumes e Rastreio Auditado)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_number VARCHAR(40) UNIQUE NOT NULL,
    order_id VARCHAR(100) NOT NULL,
    carrier VARCHAR(100) NOT NULL,
    service_code VARCHAR(50),
    tracking_code VARCHAR(100),
    tracking_url TEXT,
    volumes_count INTEGER NOT NULL DEFAULT 1 CHECK (volumes_count > 0),
    weight_kg NUMERIC(8,2),
    status VARCHAR(30) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'ready', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'cancelled')),
    picking_by VARCHAR(100),
    checked_by VARCHAR(100),
    shipped_by VARCHAR(100),
    is_manual_delivery BOOLEAN DEFAULT FALSE,
    manual_delivery_reason TEXT,
    checked_at TIMESTAMP WITH TIME ZONE,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shipments_order_id ON public.shipments(order_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON public.shipments(status);

-- ------------------------------------------------------------------------------
-- 5. TABELA: digital_activations (Fila Operacional de Ativação Técnica)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.digital_activations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id VARCHAR(100) NOT NULL,
    order_item_id UUID NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
    software_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'awaiting_activation'
        CHECK (status IN ('awaiting_activation', 'contacted', 'activating', 'activated', 'cancelled')),
    assigned_technician_id VARCHAR(100),
    license_key TEXT,
    remote_tool VARCHAR(50),
    activated_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activations_order_id ON public.digital_activations(order_id);
CREATE INDEX IF NOT EXISTS idx_activations_status ON public.digital_activations(status);

-- ------------------------------------------------------------------------------
-- 6. TABELA: activation_attempts (Histórico Relacional de Tentativas e SLA)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.activation_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activation_id UUID NOT NULL REFERENCES public.digital_activations(id) ON DELETE CASCADE,
    attempted_by VARCHAR(100) NOT NULL,
    method VARCHAR(30) NOT NULL CHECK (method IN ('whatsapp', 'phone_call', 'email')),
    result VARCHAR(30) NOT NULL CHECK (result IN ('answered', 'no_answer', 'rescheduled', 'invalid_phone')),
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attempts_activation_id ON public.activation_attempts(activation_id);
CREATE INDEX IF NOT EXISTS idx_attempts_created_at ON public.activation_attempts(created_at);

-- ------------------------------------------------------------------------------
-- 7. TABELA: a_points_ledger (Ledger Imutável de Auditoria de Fidelidade)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.a_points_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id VARCHAR(100) NOT NULL,
    order_id VARCHAR(100),
    reference_type VARCHAR(50) NOT NULL,
    reference_id VARCHAR(120) NOT NULL,
    transaction_type VARCHAR(30) NOT NULL 
        CHECK (transaction_type IN ('purchase_credit', 'redemption_debit', 'manual_adjustment', 'refund_reversal', 'bonus')),
    points_amount INTEGER NOT NULL CHECK (points_amount != 0),
    balance_after INTEGER NOT NULL,
    description TEXT NOT NULL,
    created_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_points_idempotency UNIQUE (reference_type, reference_id, transaction_type)
);

CREATE INDEX IF NOT EXISTS idx_ledger_customer_id ON public.a_points_ledger(customer_id);
CREATE INDEX IF NOT EXISTS idx_ledger_created_at ON public.a_points_ledger(created_at);

-- ------------------------------------------------------------------------------
-- 8. TABELA: integration_webhook_events (Event Store de Webhooks Externos)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.integration_webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider VARCHAR(30) NOT NULL CHECK (provider IN ('asaas', 'omie', 'whatsapp')),
    external_event_id VARCHAR(120) NOT NULL,
    event_type VARCHAR(80) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'received'
        CHECK (status IN ('received', 'validated', 'queued', 'processing', 'processed', 'failed')),
    attempts_count INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 5,
    last_error TEXT,
    next_retry_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_webhook_provider_event UNIQUE (provider, external_event_id)
);

CREATE INDEX IF NOT EXISTS idx_webhook_status_provider ON public.integration_webhook_events(status, provider);
CREATE INDEX IF NOT EXISTS idx_webhook_received_at ON public.integration_webhook_events(received_at);
CREATE INDEX IF NOT EXISTS idx_webhook_retry ON public.integration_webhook_events(status, next_retry_at);

-- ------------------------------------------------------------------------------
-- 9. TABELA: order_events (Timeline de Domínio & Histórico do Pedido)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_events (
    id VARCHAR(120) PRIMARY KEY,
    order_id VARCHAR(100) NOT NULL,
    event_type VARCHAR(60) NOT NULL,
    actor_id VARCHAR(100),
    actor_type VARCHAR(20) NOT NULL CHECK (actor_type IN ('system', 'customer', 'staff')),
    actor_name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_events_order_timeline ON public.order_events(order_id, created_at);

-- ------------------------------------------------------------------------------
-- 10. TABELA: security_audit_events (Auditoria de Segurança & Investigação)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.security_audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(80) NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'info' 
        CHECK (severity IN ('info', 'low', 'medium', 'high', 'critical')),
    actor_id VARCHAR(100),
    actor_email VARCHAR(150),
    actor_ip VARCHAR(60),
    user_agent TEXT,
    target_resource VARCHAR(120),
    action_attempted VARCHAR(100) NOT NULL,
    decision VARCHAR(20) NOT NULL DEFAULT 'blocked' CHECK (decision IN ('allowed', 'blocked', 'flagged')),
    reason TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_audit_severity ON public.security_audit_events(severity, created_at);
CREATE INDEX IF NOT EXISTS idx_security_audit_actor ON public.security_audit_events(actor_id, created_at);
CREATE INDEX IF NOT EXISTS idx_security_audit_type ON public.security_audit_events(event_type);
