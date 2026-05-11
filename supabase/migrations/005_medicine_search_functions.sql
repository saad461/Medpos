-- Add search functions for medicines

-- Search store medicines using Full Text Search
CREATE OR REPLACE FUNCTION search_store_medicines_fts(
  p_tenant_id uuid,
  p_query text,
  p_limit int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  tenant_id uuid,
  medicine_id uuid,
  stock_qty int,
  sale_price numeric,
  purchase_price numeric,
  reorder_level int,
  expiry_date date,
  barcode text,
  location text,
  is_active boolean,
  created_at timestamptz,
  updated_at timestamptz,
  medicine jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sm.id,
    sm.tenant_id,
    sm.medicine_id,
    sm.stock_qty,
    sm.sale_price,
    sm.purchase_price,
    sm.reorder_level,
    sm.expiry_date,
    sm.barcode,
    sm.location,
    sm.is_active,
    sm.created_at,
    sm.updated_at,
    to_jsonb(m.*) as medicine
  FROM store_medicines sm
  JOIN medicines m ON m.id = sm.medicine_id
  WHERE sm.tenant_id = p_tenant_id
    AND sm.is_active = true
    AND to_tsvector('english', m.name || ' ' || COALESCE(m.generic_name, '')) @@ to_tsquery('english', p_query)
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Search store medicines using Trigram Similarity
CREATE OR REPLACE FUNCTION search_store_medicines_trigram(
  p_tenant_id uuid,
  p_query text,
  p_limit int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  tenant_id uuid,
  medicine_id uuid,
  stock_qty int,
  sale_price numeric,
  purchase_price numeric,
  reorder_level int,
  expiry_date date,
  barcode text,
  location text,
  is_active boolean,
  created_at timestamptz,
  updated_at timestamptz,
  medicine jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sm.id,
    sm.tenant_id,
    sm.medicine_id,
    sm.stock_qty,
    sm.sale_price,
    sm.purchase_price,
    sm.reorder_level,
    sm.expiry_date,
    sm.barcode,
    sm.location,
    sm.is_active,
    sm.created_at,
    sm.updated_at,
    to_jsonb(m.*) as medicine
  FROM store_medicines sm
  JOIN medicines m ON m.id = sm.medicine_id
  WHERE sm.tenant_id = p_tenant_id
    AND sm.is_active = true
    AND (m.name % p_query OR m.generic_name % p_query)
  ORDER BY similarity(m.name, p_query) DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
