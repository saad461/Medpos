-- Run these in Supabase SQL editor to verify RLS isolation
-- Switch JWT context to Tenant A then Tenant B and check results

-- Step 1: Simulate Tenant A JWT
SET request.jwt.claims TO '{"tenant_id": "00000000-0000-0000-0000-000000000001", "role": "owner"}';

-- Should return ONLY Apollo Pharmacy's store_medicines (5 rows)
SELECT sm.id, m.name, sm.sale_price, sm.stock_qty
FROM store_medicines sm JOIN medicines m ON m.id = sm.medicine_id;

-- Step 2: Switch to Tenant B JWT
SET request.jwt.claims TO '{"tenant_id": "00000000-0000-0000-0000-000000000002", "role": "owner"}';

-- Should return ONLY City Medical's store_medicines (5 rows, different prices)
SELECT sm.id, m.name, sm.sale_price, sm.stock_qty
FROM store_medicines sm JOIN medicines m ON m.id = sm.medicine_id;

-- Panadol price for Apollo = 3.50, for City Medical = 4.00
-- They must NEVER see each other's records
