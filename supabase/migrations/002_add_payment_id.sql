ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS safepay_payment_id text UNIQUE,
ADD COLUMN IF NOT EXISTS billing_cycle text DEFAULT 'monthly';
