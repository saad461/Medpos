-- Migration to add NTN and STRN to store_settings
ALTER TABLE store_settings
ADD COLUMN IF NOT EXISTS ntn text,
ADD COLUMN IF NOT EXISTS strn text;

COMMENT ON COLUMN store_settings.ntn IS 'National Tax Number';
COMMENT ON COLUMN store_settings.strn IS 'Sales Tax Registration Number';
