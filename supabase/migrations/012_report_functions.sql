-- Add RPCs for report grouping

-- 1. Sales by Day
CREATE OR REPLACE FUNCTION get_sales_by_day(
  p_tenant_id uuid,
  p_from timestamptz,
  p_to timestamptz,
  p_timezone text
)
RETURNS TABLE (
  date text,
  revenue numeric,
  count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    to_char(created_at AT TIME ZONE p_timezone, 'YYYY-MM-DD') as date,
    COALESCE(SUM(total), 0) as revenue,
    COUNT(*) as count
  FROM sales
  WHERE tenant_id = p_tenant_id
    AND created_at >= p_from
    AND created_at <= p_to
  GROUP BY 1
  ORDER BY 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Sales by Week
CREATE OR REPLACE FUNCTION get_sales_by_week(
  p_tenant_id uuid,
  p_from timestamptz,
  p_to timestamptz,
  p_timezone text
)
RETURNS TABLE (
  date text,
  revenue numeric,
  count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    to_char(date_trunc('week', created_at AT TIME ZONE p_timezone), 'YYYY-MM-DD') as date,
    COALESCE(SUM(total), 0) as revenue,
    COUNT(*) as count
  FROM sales
  WHERE tenant_id = p_tenant_id
    AND created_at >= p_from
    AND created_at <= p_to
  GROUP BY 1
  ORDER BY 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Sales by Month
CREATE OR REPLACE FUNCTION get_sales_by_month(
  p_tenant_id uuid,
  p_from timestamptz,
  p_to timestamptz,
  p_timezone text
)
RETURNS TABLE (
  date text,
  revenue numeric,
  count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    to_char(date_trunc('month', created_at AT TIME ZONE p_timezone), 'YYYY-MM') as date,
    COALESCE(SUM(total), 0) as revenue,
    COUNT(*) as count
  FROM sales
  WHERE tenant_id = p_tenant_id
    AND created_at >= p_from
    AND created_at <= p_to
  GROUP BY 1
  ORDER BY 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Hourly Heatmap
CREATE OR REPLACE FUNCTION get_hourly_heatmap(
  p_tenant_id uuid,
  p_from timestamptz,
  p_to timestamptz,
  p_timezone text
)
RETURNS TABLE (
  day_of_week integer,
  hour_of_day integer,
  count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    EXTRACT(DOW FROM created_at AT TIME ZONE p_timezone)::integer as day_of_week,
    EXTRACT(HOUR FROM created_at AT TIME ZONE p_timezone)::integer as hour_of_day,
    COUNT(*) as count
  FROM sales
  WHERE tenant_id = p_tenant_id
    AND created_at >= p_from
    AND created_at <= p_to
  GROUP BY 1, 2
  ORDER BY 1, 2;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
