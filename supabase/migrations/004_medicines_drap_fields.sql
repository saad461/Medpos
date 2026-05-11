-- supabase/migrations/004_medicines_drap_fields.sql
ALTER TABLE medicines
ADD COLUMN IF NOT EXISTS registration_number text UNIQUE,
ADD COLUMN IF NOT EXISTS registration_date date,
ADD COLUMN IF NOT EXISTS dosage_form text;

CREATE INDEX IF NOT EXISTS idx_medicines_registration_number
ON medicines(registration_number) WHERE registration_number IS NOT NULL;
