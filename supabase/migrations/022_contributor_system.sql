-- Migration 022: Contributor System and Medicine Submissions

-- 1. Update store_settings table
ALTER TABLE store_settings
ADD COLUMN IF NOT EXISTS contributor_count integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_contributor boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS first_contribution_at timestamptz,
ADD COLUMN IF NOT EXISTS last_contribution_at timestamptz;

-- 2. Create medicine_submissions table
CREATE TABLE IF NOT EXISTS medicine_submissions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  medicine_id       uuid NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
  submitted_by_user uuid REFERENCES users(id) ON DELETE SET NULL,
  status            text NOT NULL DEFAULT 'pending_review'
                    CHECK (status IN ('pending_review', 'approved', 'rejected', 'cancelled')),
  rejection_reason  text,
  reviewed_by       uuid REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at       timestamptz,
  notes             text,
  admin_notes       text,
  submitted_at      timestamptz NOT NULL DEFAULT now(),
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- 3. Add indexes
CREATE INDEX IF NOT EXISTS idx_medicine_submissions_tenant
  ON medicine_submissions(tenant_id, submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_medicine_submissions_medicine
  ON medicine_submissions(medicine_id);
CREATE INDEX IF NOT EXISTS idx_medicine_submissions_status
  ON medicine_submissions(status);

-- 4. Enable RLS
ALTER TABLE medicine_submissions ENABLE ROW LEVEL SECURITY;

-- 5. Add Policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'medicine_submissions'
    AND policyname = 'submissions_tenant_isolation'
  ) THEN
    CREATE POLICY "submissions_tenant_isolation" ON medicine_submissions
      FOR ALL USING (
        tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
        OR (auth.jwt() ->> 'role') = 'super_admin'
      );
  END IF;
END $$;
