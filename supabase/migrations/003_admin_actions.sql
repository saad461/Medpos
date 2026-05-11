CREATE TABLE admin_actions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    uuid NOT NULL,
  action      text NOT NULL,
  target_type text NOT NULL,   -- 'tenant', 'medicine', 'user'
  target_id   uuid,
  target_name text,            -- store name etc (denormalized for deleted records)
  details     jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Note: This table bypasses RLS as it is only accessed via service role for platform auditing.
