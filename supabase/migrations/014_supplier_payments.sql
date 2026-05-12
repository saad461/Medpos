-- Migration 014: Supplier Payments Tracking
CREATE TABLE IF NOT EXISTS supplier_payments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  supplier_id     uuid NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  amount          numeric(10,2) NOT NULL,
  payment_method  text NOT NULL,
  reference_no    text,
  notes           text,
  payment_date    date NOT NULL DEFAULT CURRENT_DATE,
  created_by      uuid REFERENCES users(id),
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_supplier_payments_supplier
  ON supplier_payments(supplier_id, payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_supplier_payments_tenant
  ON supplier_payments(tenant_id);

ALTER TABLE supplier_payments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'supplier_payments_isolation'
    ) THEN
        CREATE POLICY "supplier_payments_isolation" ON supplier_payments
          FOR ALL USING (
            tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
            OR (auth.jwt() ->> 'role') = 'super_admin'
          );
    END IF;
END $$;
