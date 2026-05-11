-- Restore stock function
CREATE OR REPLACE FUNCTION increment_stock(
  p_store_medicine_id uuid,
  p_qty int,
  p_tenant_id uuid
)
RETURNS void AS $$
BEGIN
  UPDATE store_medicines
  SET stock_qty = stock_qty + p_qty, updated_at = now()
  WHERE id = p_store_medicine_id
    AND tenant_id = p_tenant_id;
END;
$$ LANGUAGE plpgsql;
