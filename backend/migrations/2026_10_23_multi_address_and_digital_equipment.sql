-- Migration: Multi-Address and Equipment Info for Orders and Digital Activations
-- Date: 2026-10-23

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS requires_equipment_serial BOOLEAN DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS addresses JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS equipment_info JSONB;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_address JSONB;
ALTER TABLE public.digital_activations ADD COLUMN IF NOT EXISTS equipment_model VARCHAR(255);
ALTER TABLE public.digital_activations ADD COLUMN IF NOT EXISTS equipment_serial VARCHAR(255);
