CREATE TABLE cron_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name    text NOT NULL,
  started_at  timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  results     jsonb,
  error       text,
  success     boolean NOT NULL DEFAULT true
);

-- No RLS — only service role accesses this
-- Super admin can view via admin panel
ALTER TABLE cron_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can do everything on cron_logs"
  ON cron_logs
  FOR ALL
  USING ((auth.jwt() ->> 'role') = 'super_admin');
