-- Tenant A: Apollo Pharmacy Lahore
INSERT INTO tenants (id, name, slug, plan, status, owner_email, trial_ends_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Apollo Pharmacy Lahore',
  'apollo-pharmacy-lahore',
  'professional',
  'active',
  'apollo@test.com',
  now() + interval '14 days'
);

-- Tenant B: City Medical Store Karachi
INSERT INTO tenants (id, name, slug, plan, status, owner_email, trial_ends_at)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'City Medical Store Karachi',
  'city-medical-karachi',
  'starter',
  'active',
  'citymedical@test.com',
  now() + interval '14 days'
);

-- 5 sample global medicines (Pakistan medicines)
INSERT INTO medicines (name, generic_name, category, company, unit, drap_mrp, scope, is_controlled)
VALUES
  ('Panadol 500mg', 'Paracetamol', 'Analgesic', 'GSK', 'Tablet', 3.00, 'global', false),
  ('Augmentin 625mg', 'Amoxicillin/Clavulanate', 'Antibiotic', 'GSK', 'Tablet', 85.00, 'global', false),
  ('Disprin 300mg', 'Aspirin', 'Analgesic', 'Reckitt', 'Tablet', 2.50, 'global', false),
  ('Flagyl 400mg', 'Metronidazole', 'Antibiotic', 'Sanofi', 'Tablet', 12.00, 'global', false),
  ('ORS Sachet', 'Oral Rehydration Salts', 'Electrolytes', 'Otsuka', 'Sachet', 25.00, 'global', false);

-- Apollo Pharmacy sets THEIR OWN prices (different from DRAP MRP)
INSERT INTO store_medicines (tenant_id, medicine_id, stock_qty, sale_price, purchase_price, reorder_level, expiry_date)
SELECT
  '00000000-0000-0000-0000-000000000001',
  id,
  CASE name
    WHEN 'Panadol 500mg' THEN 500
    WHEN 'Augmentin 625mg' THEN 120
    ELSE 200
  END,
  CASE name
    WHEN 'Panadol 500mg' THEN 3.50    -- Apollo charges Rs. 3.50
    WHEN 'Augmentin 625mg' THEN 90.00
    WHEN 'Disprin 300mg' THEN 3.00
    WHEN 'Flagyl 400mg' THEN 14.00
    ELSE 28.00
  END,
  CASE name
    WHEN 'Panadol 500mg' THEN 2.80
    WHEN 'Augmentin 625mg' THEN 72.00
    ELSE 10.00
  END,
  10,
  '2027-12-31'
FROM medicines WHERE scope = 'global';

-- City Medical sets THEIR OWN prices (completely independent)
INSERT INTO store_medicines (tenant_id, medicine_id, stock_qty, sale_price, purchase_price, reorder_level, expiry_date)
SELECT
  '00000000-0000-0000-0000-000000000002',
  id,
  CASE name
    WHEN 'Panadol 500mg' THEN 300
    ELSE 150
  END,
  CASE name
    WHEN 'Panadol 500mg' THEN 4.00    -- City Medical charges Rs. 4.00 (different city, different price)
    WHEN 'Augmentin 625mg' THEN 88.00
    WHEN 'Disprin 300mg' THEN 2.80
    WHEN 'Flagyl 400mg' THEN 13.00
    ELSE 26.00
  END,
  CASE name
    WHEN 'Panadol 500mg' THEN 3.20
    ELSE 8.00
  END,
  5,
  '2027-06-30'
FROM medicines WHERE scope = 'global';
