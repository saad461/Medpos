-- Migration 013: Customer Credit Transactions
CREATE TABLE IF NOT EXISTS credit_transactions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id     uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  type            text NOT NULL CHECK (type IN ('credit', 'payment', 'adjustment')),
  amount          numeric(10,2) NOT NULL,
  balance_after   numeric(10,2) NOT NULL,
  sale_id         uuid REFERENCES sales(id),
  payment_method  text,
  reference_no    text,
  notes           text,
  created_by      uuid REFERENCES users(id),
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_customer
  ON credit_transactions(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_tenant
  ON credit_transactions(tenant_id);

ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'credit_transactions_isolation'
    ) THEN
        CREATE POLICY "credit_transactions_isolation" ON credit_transactions
          FOR ALL USING (
            tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
            OR (auth.jwt() ->> 'role') = 'super_admin'
          );
    END IF;
END $$;
