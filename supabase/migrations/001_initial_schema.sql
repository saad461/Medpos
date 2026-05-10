-- SECTION 1: EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- for fuzzy medicine name search
CREATE EXTENSION IF NOT EXISTS "unaccent";   -- for Urdu/English name normalization

-- SECTION 2: ENUMS
CREATE TYPE tenant_status AS ENUM (
  'pending_admin_approval',
  'active',
  'suspended',
  'cancelled'
);

CREATE TYPE user_role AS ENUM (
  'super_admin',
  'owner',
  'admin',
  'pharmacist',
  'cashier'
);

CREATE TYPE plan_type AS ENUM (
  'starter',
  'professional',
  'business'
);

CREATE TYPE medicine_scope AS ENUM (
  'global',
  'private',
  'pending_review',
  'rejected'
);

CREATE TYPE payment_method AS ENUM (
  'cash',
  'card',
  'credit'
);

CREATE TYPE subscription_status AS ENUM (
  'trialing',
  'active',
  'past_due',
  'cancelled'
);

CREATE TYPE purchase_order_status AS ENUM (
  'draft',
  'sent',
  'received',
  'cancelled'
);

CREATE TYPE stock_adjustment_reason AS ENUM (
  'received_stock',
  'damaged',
  'counted',
  'disposed',
  'returned_to_supplier',
  'other'
);

-- SECTION 3: TABLES

-- TABLE 1: tenants
CREATE TABLE tenants (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text NOT NULL,
  slug              text UNIQUE NOT NULL,
  plan              plan_type NOT NULL DEFAULT 'starter',
  status            tenant_status NOT NULL DEFAULT 'pending_admin_approval',
  trial_ends_at     timestamptz,
  stripe_customer_id text,
  owner_email       text NOT NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- TABLE 2: users
CREATE TABLE users (
  id                uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id         uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email             text NOT NULL,
  name              text NOT NULL,
  phone             text,
  role              user_role NOT NULL DEFAULT 'cashier',
  is_active         boolean NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- TABLE 3: store_settings
CREATE TABLE store_settings (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid UNIQUE NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  logo_url          text,
  theme             text NOT NULL DEFAULT 'light',
  receipt_header    text,
  receipt_footer    text DEFAULT 'Thank you for your business!',
  gst_rate          numeric(5,2) NOT NULL DEFAULT 0.00,
  currency          text NOT NULL DEFAULT 'PKR',
  address           text,
  phone             text,
  city              text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- TABLE 4: subscriptions
CREATE TABLE subscriptions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  stripe_sub_id     text UNIQUE,
  plan              plan_type NOT NULL,
  status            subscription_status NOT NULL DEFAULT 'trialing',
  period_start      timestamptz,
  period_end        timestamptz,
  cancelled_at      timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- TABLE 5: medicines
CREATE TABLE medicines (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text NOT NULL,
  generic_name      text,
  category          text,
  company           text,
  unit              text,
  drap_mrp          numeric(10,2),
  scope             medicine_scope NOT NULL DEFAULT 'global',
  submitted_by      uuid REFERENCES tenants(id),
  is_controlled     boolean NOT NULL DEFAULT false,
  description       text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- TABLE 6: store_medicines
CREATE TABLE store_medicines (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  medicine_id       uuid NOT NULL REFERENCES medicines(id),
  stock_qty         integer NOT NULL DEFAULT 0,
  sale_price        numeric(10,2) NOT NULL DEFAULT 0.00,
  purchase_price    numeric(10,2),
  reorder_level     integer NOT NULL DEFAULT 10,
  expiry_date       date,
  barcode           text,
  location          text,
  is_active         boolean NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, medicine_id)
);

-- TABLE 7: stock_adjustments
CREATE TABLE stock_adjustments (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  store_medicine_id uuid NOT NULL REFERENCES store_medicines(id),
  user_id           uuid NOT NULL REFERENCES users(id),
  qty_before        integer NOT NULL,
  qty_change        integer NOT NULL,
  qty_after         integer NOT NULL,
  reason            stock_adjustment_reason NOT NULL,
  notes             text,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- TABLE 8: customers
CREATE TABLE customers (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name              text NOT NULL,
  phone             text,
  cnic              text,
  credit_balance    numeric(10,2) NOT NULL DEFAULT 0.00,
  total_spent       numeric(10,2) NOT NULL DEFAULT 0.00,
  notes             text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- TABLE 9: suppliers
CREATE TABLE suppliers (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name              text NOT NULL,
  phone             text,
  email             text,
  address           text,
  city              text,
  ntn               text,
  balance_due       numeric(10,2) NOT NULL DEFAULT 0.00,
  notes             text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- TABLE 10: purchase_orders
CREATE TABLE purchase_orders (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  supplier_id       uuid REFERENCES suppliers(id),
  invoice_no        text,
  total_amount      numeric(10,2) NOT NULL DEFAULT 0.00,
  status            purchase_order_status NOT NULL DEFAULT 'draft',
  notes             text,
  ordered_at        timestamptz,
  received_at       timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- TABLE 11: purchase_order_items
CREATE TABLE purchase_order_items (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  purchase_order_id uuid NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  store_medicine_id uuid REFERENCES store_medicines(id),
  medicine_name     text NOT NULL,
  qty               integer NOT NULL,
  unit_price        numeric(10,2) NOT NULL,
  subtotal          numeric(10,2) NOT NULL,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- TABLE 12: sales
CREATE TABLE sales (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id           uuid NOT NULL REFERENCES users(id),
  customer_id       uuid REFERENCES customers(id),
  invoice_no        text NOT NULL,
  subtotal          numeric(10,2) NOT NULL,
  discount          numeric(10,2) NOT NULL DEFAULT 0.00,
  tax               numeric(10,2) NOT NULL DEFAULT 0.00,
  total             numeric(10,2) NOT NULL,
  payment_method    payment_method NOT NULL DEFAULT 'cash',
  amount_received   numeric(10,2),
  change_given      numeric(10,2),
  is_return         boolean NOT NULL DEFAULT false,
  original_sale_id  uuid REFERENCES sales(id),
  notes             text,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- TABLE 13: sale_items
CREATE TABLE sale_items (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  sale_id           uuid NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  store_medicine_id uuid REFERENCES store_medicines(id),
  medicine_name     text NOT NULL,
  qty               integer NOT NULL,
  unit_price        numeric(10,2) NOT NULL,
  discount          numeric(10,2) NOT NULL DEFAULT 0.00,
  subtotal          numeric(10,2) NOT NULL,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- TABLE 14: audit_logs
CREATE TABLE audit_logs (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id           uuid REFERENCES users(id),
  action            text NOT NULL,
  table_name        text NOT NULL,
  record_id         uuid,
  old_value         jsonb,
  new_value         jsonb,
  ip_address        inet,
  user_agent        text,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- TABLE 15: price_change_log
CREATE TABLE price_change_log (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medicine_id       uuid NOT NULL REFERENCES medicines(id),
  old_drap_mrp      numeric(10,2),
  new_drap_mrp      numeric(10,2),
  changed_at        timestamptz NOT NULL DEFAULT now(),
  sync_run_at       timestamptz NOT NULL DEFAULT now()
);

-- TABLE 16: notifications
CREATE TABLE notifications (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id           uuid REFERENCES users(id),
  type              text NOT NULL,
  title             text NOT NULL,
  message           text NOT NULL,
  is_read           boolean NOT NULL DEFAULT false,
  data              jsonb,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- SECTION 4: INDEXES
CREATE INDEX idx_medicines_name_gin ON medicines USING GIN (to_tsvector('english', name));
CREATE INDEX idx_medicines_name_trgm ON medicines USING GIN (name gin_trgm_ops);

CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_store_medicines_tenant_id ON store_medicines(tenant_id);
CREATE INDEX idx_store_medicines_medicine_id ON store_medicines(medicine_id);
CREATE INDEX idx_store_medicines_barcode ON store_medicines(barcode) WHERE barcode IS NOT NULL;
CREATE INDEX idx_store_medicines_expiry ON store_medicines(expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX idx_store_medicines_low_stock ON store_medicines(tenant_id, stock_qty, reorder_level);
CREATE INDEX idx_sales_tenant_id ON sales(tenant_id);
CREATE INDEX idx_sales_created_at ON sales(tenant_id, created_at DESC);
CREATE INDEX idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX idx_sale_items_tenant_id ON sale_items(tenant_id);
CREATE INDEX idx_customers_tenant_id ON customers(tenant_id);
CREATE INDEX idx_customers_phone ON customers(tenant_id, phone);
CREATE INDEX idx_suppliers_tenant_id ON suppliers(tenant_id);
CREATE INDEX idx_audit_logs_tenant_id ON audit_logs(tenant_id, created_at DESC);
CREATE INDEX idx_notifications_tenant_user ON notifications(tenant_id, user_id, is_read);
CREATE INDEX idx_medicines_scope ON medicines(scope);
CREATE INDEX idx_medicines_submitted_by ON medicines(submitted_by) WHERE submitted_by IS NOT NULL;

-- SECTION 5: UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_store_settings_updated_at BEFORE UPDATE ON store_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medicines_updated_at BEFORE UPDATE ON medicines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_store_medicines_updated_at BEFORE UPDATE ON store_medicines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- SECTION 6: FUNCTIONS & TRIGGERS

-- Invoice Generator
CREATE OR REPLACE FUNCTION generate_invoice_no(p_tenant_id uuid)
RETURNS text AS $$
DECLARE
  today text := to_char(now(), 'YYYYMMDD');
  count integer;
BEGIN
  SELECT COUNT(*) + 1 INTO count
  FROM sales
  WHERE tenant_id = p_tenant_id
    AND DATE(created_at) = CURRENT_DATE;
  RETURN 'INV-' || today || '-' || LPAD(count::text, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- Claims Sync
CREATE OR REPLACE FUNCTION sync_user_claims()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data =
    raw_app_meta_data ||
    jsonb_build_object(
      'tenant_id', NEW.tenant_id,
      'role', NEW.role
    )
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_created_or_updated
  AFTER INSERT OR UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION sync_user_claims();

-- Default Settings
CREATE OR REPLACE FUNCTION create_default_store_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO store_settings (tenant_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_tenant_created
  AFTER INSERT ON tenants
  FOR EACH ROW EXECUTE FUNCTION create_default_store_settings();

-- SECTION 7: ROW LEVEL SECURITY
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_change_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- POLIES

-- tenants
CREATE POLICY "tenant_isolation" ON tenants
  FOR ALL USING (
    id = (auth.jwt() ->> 'tenant_id')::uuid
    OR (auth.jwt() ->> 'role') = 'super_admin'
  );

-- users
CREATE POLICY "users_tenant_isolation" ON users
  FOR ALL USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    OR (auth.jwt() ->> 'role') = 'super_admin'
  );

-- store_settings
CREATE POLICY "settings_tenant_isolation" ON store_settings
  FOR ALL USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    OR (auth.jwt() ->> 'role') = 'super_admin'
  );

-- subscriptions
CREATE POLICY "subscriptions_tenant_isolation" ON subscriptions
  FOR ALL USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    OR (auth.jwt() ->> 'role') = 'super_admin'
  );

-- medicines
CREATE POLICY "medicines_read" ON medicines
  FOR SELECT USING (
    scope = 'global'
    OR submitted_by = (auth.jwt() ->> 'tenant_id')::uuid
    OR (auth.jwt() ->> 'role') = 'super_admin'
  );

CREATE POLICY "medicines_insert" ON medicines
  FOR INSERT WITH CHECK (
    (auth.jwt() ->> 'role') = 'super_admin'
    OR (scope = 'private' AND submitted_by = (auth.jwt() ->> 'tenant_id')::uuid)
    OR (scope = 'pending_review' AND submitted_by = (auth.jwt() ->> 'tenant_id')::uuid)
  );

CREATE POLICY "medicines_update" ON medicines
  FOR UPDATE USING (
    (auth.jwt() ->> 'role') = 'super_admin'
    OR (
      submitted_by = (auth.jwt() ->> 'tenant_id')::uuid
      AND scope IN ('private', 'pending_review', 'rejected')
    )
  );

CREATE POLICY "medicines_delete" ON medicines
  FOR DELETE USING (
    (auth.jwt() ->> 'role') = 'super_admin'
    OR (
      submitted_by = (auth.jwt() ->> 'tenant_id')::uuid
      AND scope = 'private'
    )
  );

-- store_medicines
CREATE POLICY "store_medicines_tenant_isolation" ON store_medicines
  FOR ALL USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    OR (auth.jwt() ->> 'role') = 'super_admin'
  );

-- stock_adjustments
CREATE POLICY "stock_adjustments_isolation" ON stock_adjustments
  FOR ALL USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    OR (auth.jwt() ->> 'role') = 'super_admin'
  );

-- customers
CREATE POLICY "customers_isolation" ON customers
  FOR ALL USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    OR (auth.jwt() ->> 'role') = 'super_admin'
  );

-- suppliers
CREATE POLICY "suppliers_isolation" ON suppliers
  FOR ALL USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    OR (auth.jwt() ->> 'role') = 'super_admin'
  );

-- purchase_orders
CREATE POLICY "purchase_orders_isolation" ON purchase_orders
  FOR ALL USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    OR (auth.jwt() ->> 'role') = 'super_admin'
  );

-- purchase_order_items
CREATE POLICY "purchase_order_items_isolation" ON purchase_order_items
  FOR ALL USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    OR (auth.jwt() ->> 'role') = 'super_admin'
  );

-- sales
CREATE POLICY "sales_isolation" ON sales
  FOR ALL USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    OR (auth.jwt() ->> 'role') = 'super_admin'
  );

-- sale_items
CREATE POLICY "sale_items_isolation" ON sale_items
  FOR ALL USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    OR (auth.jwt() ->> 'role') = 'super_admin'
  );

-- audit_logs
CREATE POLICY "audit_logs_isolation" ON audit_logs
  FOR ALL USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    OR (auth.jwt() ->> 'role') = 'super_admin'
  );

-- price_change_log
CREATE POLICY "price_change_log_super_admin" ON price_change_log
  FOR ALL USING (
    (auth.jwt() ->> 'role') = 'super_admin'
  );

-- notifications
CREATE POLICY "notifications_isolation" ON notifications
  FOR ALL USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    OR (auth.jwt() ->> 'role') = 'super_admin'
  );
