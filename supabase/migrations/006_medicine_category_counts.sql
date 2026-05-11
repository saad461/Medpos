-- Function to get medicine counts by category
CREATE OR REPLACE FUNCTION get_medicine_counts_by_category()
RETURNS TABLE (category text, count bigint) AS $$
  SELECT category, count(*) FROM medicines GROUP BY category;
$$ LANGUAGE sql;
