-- Add bulk price update function
CREATE OR REPLACE FUNCTION bulk_update_prices(p_updates jsonb)
RETURNS void AS $$
DECLARE
  item jsonb;
BEGIN
  FOR item IN SELECT * FROM jsonb_array_elements(p_updates)
  LOOP
    UPDATE store_medicines
    SET sale_price = (item->>'sale_price')::numeric, updated_at = now()
    WHERE id = (item->>'id')::uuid;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
