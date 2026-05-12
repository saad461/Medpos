-- Migration 020: Add receipt settings columns to store_settings

ALTER TABLE store_settings
ADD COLUMN IF NOT EXISTS show_logo_on_receipt boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS show_drap_mrp boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS show_generic_name boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS show_profit_on_receipt boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS show_powered_by boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS receipt_width text NOT NULL DEFAULT '80mm',
ADD COLUMN IF NOT EXISTS receipt_font_size text NOT NULL DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS print_duplicate boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS whatsapp text,
ADD COLUMN IF NOT EXISTS store_email text,
ADD COLUMN IF NOT EXISTS contact_person text,
ADD COLUMN IF NOT EXISTS payment_terms text DEFAULT 'Net 30 Days',
ADD COLUMN IF NOT EXISTS credit_limit_enabled boolean NOT NULL DEFAULT false;
