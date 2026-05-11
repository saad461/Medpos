-- Add global medicine search by trigram for auto-linking
CREATE OR REPLACE FUNCTION search_medicines_trigram(
  p_query text,
  p_limit int DEFAULT 1
)
RETURNS TABLE (
  id uuid,
  name text,
  similarity float
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.name,
    similarity(m.name, p_query) as similarity
  FROM medicines m
  WHERE m.scope = 'global'
    AND m.name % p_query
  ORDER BY similarity DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
