-- Migration 016: Soft delete for customers and suppliers
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

ALTER TABLE suppliers
ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

ALTER TABLE customers
ADD COLUMN IF NOT EXISTS credit_limit numeric(10,2);
