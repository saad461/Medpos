-- Migration 015: Link medicines to suppliers
ALTER TABLE store_medicines
ADD COLUMN IF NOT EXISTS supplier_id uuid REFERENCES suppliers(id);

CREATE INDEX IF NOT EXISTS idx_store_medicines_supplier
ON store_medicines(supplier_id) WHERE supplier_id IS NOT NULL;
