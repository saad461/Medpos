-- Migration 017: PO updates
ALTER TYPE purchase_order_status ADD VALUE IF NOT EXISTS 'partial';

ALTER TABLE purchase_orders
ADD COLUMN IF NOT EXISTS po_number text UNIQUE;

ALTER TABLE purchase_order_items
ADD COLUMN IF NOT EXISTS qty_received integer NOT NULL DEFAULT 0;

-- PO Number Generator Function
CREATE OR REPLACE FUNCTION generate_po_number(p_tenant_id uuid)
RETURNS text AS $$
DECLARE
  today text := to_char(now(), 'YYYYMMDD');
  count integer;
BEGIN
  SELECT COUNT(*) + 1 INTO count
  FROM purchase_orders
  WHERE tenant_id = p_tenant_id
    AND DATE(created_at) = CURRENT_DATE;
  RETURN 'PO-' || today || '-' || LPAD(count::text, 5, '0');
END;
$$ LANGUAGE plpgsql;
