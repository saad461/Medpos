-- SQL Functions for Sales Transactions

-- Atomic stock decrement
CREATE OR REPLACE FUNCTION decrement_stock(
  p_store_medicine_id uuid,
  p_qty int,
  p_tenant_id uuid
)
RETURNS void AS $$
BEGIN
  UPDATE store_medicines
  SET stock_qty = stock_qty - p_qty, updated_at = now()
  WHERE id = p_store_medicine_id
    AND tenant_id = p_tenant_id
    AND stock_qty >= p_qty;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock or invalid medicine ID';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Update customer total spent
CREATE OR REPLACE FUNCTION update_customer_spent(
  p_customer_id uuid,
  p_amount numeric
)
RETURNS void AS $$
BEGIN
  UPDATE customers
  SET total_spent = total_spent + p_amount, updated_at = now()
  WHERE id = p_customer_id;
END;
$$ LANGUAGE plpgsql;
