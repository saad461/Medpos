export const DEMO_CREDENTIALS = {
  email: 'demo@medpos.pk',
  password: 'Demo@1234',
  url: 'https://app.medpos.pk/login',
}

export const DEMO_TENANT = {
  name: 'Demo Pharmacy',
  slug: 'demo-pharmacy',
  plan: 'professional' as const,
  status: 'active' as const,
  owner_email: 'demo@medpos.pk',
}

export const DEMO_MEDICINES = [
  // Analgesics
  { name: 'Panadol 500mg', generic_name: 'Paracetamol', category: 'Analgesic', company: 'GSK', unit: 'Tablet', sale_price: 3.50, purchase_price: 2.80, stock_qty: 500, expiry_date: '2027-12-31', reorder_level: 50 },
  { name: 'Panadol Extra', generic_name: 'Paracetamol+Caffeine', category: 'Analgesic', company: 'GSK', unit: 'Tablet', sale_price: 5.00, purchase_price: 4.00, stock_qty: 200, expiry_date: '2027-06-30', reorder_level: 30 },
  { name: 'Disprin 300mg', generic_name: 'Aspirin', category: 'Analgesic', company: 'Reckitt', unit: 'Tablet', sale_price: 3.00, purchase_price: 2.40, stock_qty: 0, expiry_date: '2027-03-31', reorder_level: 20 },
  { name: 'Brufen 400mg', generic_name: 'Ibuprofen', category: 'Analgesic/Anti-inflammatory', company: 'Abbott', unit: 'Tablet', sale_price: 8.00, purchase_price: 6.50, stock_qty: 150, expiry_date: '2026-09-30', reorder_level: 25 },
  { name: 'Voltaren 50mg', generic_name: 'Diclofenac', category: 'Anti-inflammatory', company: 'Novartis', unit: 'Tablet', sale_price: 15.00, purchase_price: 12.00, stock_qty: 80, expiry_date: '2027-08-31', reorder_level: 15 },

  // Antibiotics
  { name: 'Augmentin 625mg', generic_name: 'Amoxicillin/Clavulanate', category: 'Antibiotic', company: 'GSK', unit: 'Tablet', sale_price: 90.00, purchase_price: 72.00, stock_qty: 8, expiry_date: '2025-03-31', reorder_level: 20 },
  { name: 'Amoxil 500mg', generic_name: 'Amoxicillin', category: 'Antibiotic', company: 'GSK', unit: 'Capsule', sale_price: 25.00, purchase_price: 20.00, stock_qty: 120, expiry_date: '2027-05-31', reorder_level: 30 },
  { name: 'Flagyl 400mg', generic_name: 'Metronidazole', category: 'Antibiotic', company: 'Sanofi', unit: 'Tablet', sale_price: 14.00, purchase_price: 11.00, stock_qty: 200, expiry_date: '2027-11-30', reorder_level: 20 },
  { name: 'Ciprofloxacin 500mg', generic_name: 'Ciprofloxacin', category: 'Antibiotic', company: 'Bayer', unit: 'Tablet', sale_price: 35.00, purchase_price: 28.00, stock_qty: 60, expiry_date: '2027-07-31', reorder_level: 15 },
  { name: 'Azithromycin 500mg', generic_name: 'Azithromycin', category: 'Antibiotic', company: 'Pfizer', unit: 'Tablet', sale_price: 120.00, purchase_price: 96.00, stock_qty: 40, expiry_date: '2025-04-30', reorder_level: 10 },

  // Antacids & GI
  { name: 'Risek 20mg', generic_name: 'Omeprazole', category: 'Antacid', company: 'AGP', unit: 'Capsule', sale_price: 22.00, purchase_price: 17.50, stock_qty: 180, expiry_date: '2027-10-31', reorder_level: 30 },
  { name: 'Gaviscon Syrup', generic_name: 'Alginate/Antacid', category: 'Antacid', company: 'Reckitt', unit: 'Syrup', sale_price: 180.00, purchase_price: 144.00, stock_qty: 25, expiry_date: '2026-12-31', reorder_level: 10 },
  { name: 'Motilium 10mg', generic_name: 'Domperidone', category: 'GI', company: 'Janssen', unit: 'Tablet', sale_price: 12.00, purchase_price: 9.60, stock_qty: 100, expiry_date: '2027-09-30', reorder_level: 20 },
  { name: 'ORS Sachet', generic_name: 'Oral Rehydration Salts', category: 'Electrolytes', company: 'Otsuka', unit: 'Sachet', sale_price: 28.00, purchase_price: 22.00, stock_qty: 3, expiry_date: '2027-06-30', reorder_level: 20 },

  // Vitamins & Supplements
  { name: 'Vitamin C 500mg', generic_name: 'Ascorbic Acid', category: 'Vitamin', company: 'Abbott', unit: 'Tablet', sale_price: 5.00, purchase_price: 4.00, stock_qty: 300, expiry_date: '2028-01-31', reorder_level: 50 },
  { name: 'Calcium Sandoz', generic_name: 'Calcium Gluconate', category: 'Supplement', company: 'Sandoz', unit: 'Tablet', sale_price: 18.00, purchase_price: 14.00, stock_qty: 90, expiry_date: '2027-04-30', reorder_level: 20 },
  { name: 'Neurobion Forte', generic_name: 'B-Complex', category: 'Vitamin', company: 'Merck', unit: 'Tablet', sale_price: 12.00, purchase_price: 9.50, stock_qty: 150, expiry_date: '2027-08-31', reorder_level: 25 },
  { name: 'Zincovit', generic_name: 'Zinc+Vitamins', category: 'Supplement', company: 'Apex', unit: 'Tablet', sale_price: 10.00, purchase_price: 8.00, stock_qty: 200, expiry_date: '2028-02-28', reorder_level: 30 },

  // Antidiabetics
  { name: 'Glucophage 500mg', generic_name: 'Metformin', category: 'Antidiabetic', company: 'Merck', unit: 'Tablet', sale_price: 8.00, purchase_price: 6.40, stock_qty: 250, expiry_date: '2027-11-30', reorder_level: 40 },
  { name: 'Diamicron 80mg', generic_name: 'Gliclazide', category: 'Antidiabetic', company: 'Servier', unit: 'Tablet', sale_price: 18.00, purchase_price: 14.40, stock_qty: 100, expiry_date: '2027-07-31', reorder_level: 20 },

  // Antihypertensives
  { name: 'Cozaar 50mg', generic_name: 'Losartan', category: 'Antihypertensive', company: 'MSD', unit: 'Tablet', sale_price: 25.00, purchase_price: 20.00, stock_qty: 180, expiry_date: '2027-09-30', reorder_level: 30 },
  { name: 'Amlodipine 5mg', generic_name: 'Amlodipine', category: 'Antihypertensive', company: 'Pfizer', unit: 'Tablet', sale_price: 12.00, purchase_price: 9.60, stock_qty: 220, expiry_date: '2027-12-31', reorder_level: 35 },
  { name: 'Concor 5mg', generic_name: 'Bisoprolol', category: 'Beta Blocker', company: 'Merck', unit: 'Tablet', sale_price: 22.00, purchase_price: 17.60, stock_qty: 130, expiry_date: '2027-06-30', reorder_level: 25 },

  // Respiratory
  { name: 'Ventolin Inhaler', generic_name: 'Salbutamol', category: 'Respiratory', company: 'GSK', unit: 'Inhaler', sale_price: 350.00, purchase_price: 280.00, stock_qty: 15, expiry_date: '2026-08-31', reorder_level: 5 },
  { name: 'Actifed Syrup', generic_name: 'Triprolidine/Pseudoephedrine', category: 'Respiratory', company: 'GSK', unit: 'Syrup', sale_price: 120.00, purchase_price: 96.00, stock_qty: 30, expiry_date: '2027-03-31', reorder_level: 10 },
  { name: 'Septran DS', generic_name: 'Co-trimoxazole', category: 'Antibiotic', company: 'GSK', unit: 'Tablet', sale_price: 12.00, purchase_price: 9.60, stock_qty: 200, expiry_date: '2027-10-31', reorder_level: 30 },

  // Eye/ENT
  { name: 'Chloramphenicol Eye Drops', generic_name: 'Chloramphenicol', category: 'Eye/ENT', company: 'Remington', unit: 'Drops', sale_price: 45.00, purchase_price: 36.00, stock_qty: 20, expiry_date: '2026-06-30', reorder_level: 5 },
  { name: 'Otrivin Nasal Spray', generic_name: 'Xylometazoline', category: 'ENT', company: 'Novartis', unit: 'Spray', sale_price: 120.00, purchase_price: 96.00, stock_qty: 18, expiry_date: '2027-02-28', reorder_level: 5 },

  // Skin
  { name: 'Betnovate Cream', generic_name: 'Betamethasone', category: 'Dermatology', company: 'GSK', unit: 'Cream', sale_price: 85.00, purchase_price: 68.00, stock_qty: 22, expiry_date: '2027-01-31', reorder_level: 8 },
  { name: 'Fucidin Cream', generic_name: 'Fusidic Acid', category: 'Dermatology', company: 'LEO Pharma', unit: 'Cream', sale_price: 220.00, purchase_price: 176.00, stock_qty: 12, expiry_date: '2026-11-30', reorder_level: 5 },

  // Remaining medicines
  { name: 'Panadol CF', generic_name: 'Paracetamol+Phenylephrine', category: 'Analgesic', company: 'GSK', unit: 'Tablet', sale_price: 7.00, purchase_price: 5.60, stock_qty: 300, expiry_date: '2027-05-31', reorder_level: 40 },
  { name: 'Claritin 10mg', generic_name: 'Loratadine', category: 'Antihistamine', company: 'MSD', unit: 'Tablet', sale_price: 18.00, purchase_price: 14.40, stock_qty: 80, expiry_date: '2027-08-31', reorder_level: 15 },
  { name: 'Allegra 120mg', generic_name: 'Fexofenadine', category: 'Antihistamine', company: 'Sanofi', unit: 'Tablet', sale_price: 35.00, purchase_price: 28.00, stock_qty: 60, expiry_date: '2027-06-30', reorder_level: 10 },
  { name: 'Insulin Mixtard 30', generic_name: 'Insulin', category: 'Antidiabetic', company: 'Novo Nordisk', unit: 'Vial', sale_price: 850.00, purchase_price: 680.00, stock_qty: 10, expiry_date: '2026-04-30', reorder_level: 3 },
  { name: 'Lipitor 20mg', generic_name: 'Atorvastatin', category: 'Statin', company: 'Pfizer', unit: 'Tablet', sale_price: 45.00, purchase_price: 36.00, stock_qty: 90, expiry_date: '2027-09-30', reorder_level: 20 },
  { name: 'Crestor 10mg', generic_name: 'Rosuvastatin', category: 'Statin', company: 'AstraZeneca', unit: 'Tablet', sale_price: 55.00, purchase_price: 44.00, stock_qty: 70, expiry_date: '2027-07-31', reorder_level: 15 },
  { name: 'Nexium 40mg', generic_name: 'Esomeprazole', category: 'Antacid', company: 'AstraZeneca', unit: 'Tablet', sale_price: 55.00, purchase_price: 44.00, stock_qty: 100, expiry_date: '2027-10-31', reorder_level: 20 },
  { name: 'Zantac 150mg', generic_name: 'Ranitidine', category: 'Antacid', company: 'GSK', unit: 'Tablet', sale_price: 15.00, purchase_price: 12.00, stock_qty: 160, expiry_date: '2027-04-30', reorder_level: 25 },
  { name: 'Imodium 2mg', generic_name: 'Loperamide', category: 'GI', company: 'Janssen', unit: 'Capsule', sale_price: 25.00, purchase_price: 20.00, stock_qty: 50, expiry_date: '2027-11-30', reorder_level: 10 },
  { name: 'Dulcolax 5mg', generic_name: 'Bisacodyl', category: 'GI', company: 'Boehringer', unit: 'Tablet', sale_price: 12.00, purchase_price: 9.60, stock_qty: 80, expiry_date: '2027-08-31', reorder_level: 15 },
  { name: 'Difene 75mg', generic_name: 'Diclofenac', category: 'Anti-inflammatory', company: 'Searle', unit: 'Tablet', sale_price: 18.00, purchase_price: 14.40, stock_qty: 120, expiry_date: '2027-05-31', reorder_level: 20 },
  { name: 'Arcoxia 90mg', generic_name: 'Etoricoxib', category: 'Anti-inflammatory', company: 'MSD', unit: 'Tablet', sale_price: 65.00, purchase_price: 52.00, stock_qty: 45, expiry_date: '2027-03-31', reorder_level: 10 },
  { name: 'Dexamethasone 0.5mg', generic_name: 'Dexamethasone', category: 'Corticosteroid', company: 'Pfizer', unit: 'Tablet', sale_price: 5.00, purchase_price: 4.00, stock_qty: 200, expiry_date: '2027-12-31', reorder_level: 30 },
  { name: 'Prednisolone 5mg', generic_name: 'Prednisolone', category: 'Corticosteroid', company: 'ICI', unit: 'Tablet', sale_price: 6.00, purchase_price: 4.80, stock_qty: 180, expiry_date: '2027-09-30', reorder_level: 25 },
  { name: 'Clopidogrel 75mg', generic_name: 'Clopidogrel', category: 'Antiplatelet', company: 'Sanofi', unit: 'Tablet', sale_price: 35.00, purchase_price: 28.00, stock_qty: 85, expiry_date: '2027-06-30', reorder_level: 15 },
  { name: 'Warfarin 5mg', generic_name: 'Warfarin', category: 'Anticoagulant', company: 'Sanofi', unit: 'Tablet', sale_price: 8.00, purchase_price: 6.40, stock_qty: 60, expiry_date: '2027-07-31', reorder_level: 10, is_controlled: true },
  { name: 'Alprazolam 0.5mg', generic_name: 'Alprazolam', category: 'Anxiolytic', company: 'Pfizer', unit: 'Tablet', sale_price: 12.00, purchase_price: 9.60, stock_qty: 40, expiry_date: '2027-05-31', reorder_level: 10, is_controlled: true },
  { name: 'Amitriptyline 25mg', generic_name: 'Amitriptyline', category: 'Antidepressant', company: 'Various', unit: 'Tablet', sale_price: 8.00, purchase_price: 6.40, stock_qty: 70, expiry_date: '2027-04-30', reorder_level: 15 },
  { name: 'Metoprolol 50mg', generic_name: 'Metoprolol', category: 'Beta Blocker', company: 'AstraZeneca', unit: 'Tablet', sale_price: 15.00, purchase_price: 12.00, stock_qty: 110, expiry_date: '2027-08-31', reorder_level: 20 },
  { name: 'Folic Acid 5mg', generic_name: 'Folic Acid', category: 'Vitamin', company: 'Various', unit: 'Tablet', sale_price: 3.00, purchase_price: 2.40, stock_qty: 400, expiry_date: '2028-03-31', reorder_level: 50 },
  { name: 'Ferrous Sulphate', generic_name: 'Iron Sulphate', category: 'Supplement', company: 'Various', unit: 'Tablet', sale_price: 4.00, purchase_price: 3.20, stock_qty: 350, expiry_date: '2028-01-31', reorder_level: 40 },
]

export const DEMO_CUSTOMERS = [
  { name: 'Muhammad Ali', phone: '0300-1234567', cnic: '35201-1234567-1' },
  { name: 'Fatima Bibi', phone: '0312-2345678', cnic: '35201-2345678-2' },
  { name: 'Ahmed Khan', phone: '0321-3456789', cnic: '35201-3456789-3' },
  { name: 'Ayesha Siddiqui', phone: '0333-4567890', cnic: '35201-4567890-4' },
  { name: 'Usman Tariq', phone: '0345-5678901', cnic: '35201-5678901-5' },
  { name: 'Zainab Ahmed', phone: '0301-6789012', cnic: '35201-6789012-6' },
  { name: 'Irfan Malik', phone: '0302-7890123', cnic: '35201-7890123-7' },
  { name: 'Sana Gul', phone: '0303-8901234', cnic: '35201-8901234-8' },
  { name: 'Bilal Hassan', phone: '0304-9012345', cnic: '35201-9012345-9' },
  { name: 'Hina Pervez', phone: '0305-0123456', cnic: '35201-0123456-0' },
  { name: 'Kamran Akmal', phone: '0306-1122334', cnic: '35201-1122334-1' },
  { name: 'Nadia Jamil', phone: '0307-2233445', cnic: '35201-2233445-2' },
  { name: 'Rizwan Ahmed', phone: '0308-3344556', cnic: '35201-3344556-3' },
  { name: 'Saira Bano', phone: '0309-4455667', cnic: '35201-4455667-4' },
  { name: 'Tahir Shah', phone: '0310-5566778', cnic: '35201-5566778-5' },
  { name: 'Waqar Younis', phone: '0311-6677889', cnic: '35201-6677889-6' },
  { name: 'Yasmin Rashid', phone: '0312-7788990', cnic: '35201-7788990-7' },
  { name: 'Zafar Iqbal', phone: '0313-8899001', cnic: '35201-8899001-8' },
  { name: 'Asma Jahangir', phone: '0314-9900112', cnic: '35201-9900112-9' },
  { name: 'Bashir Ahmed', phone: '0315-0011223', cnic: '35201-0011223-0' },
  { name: 'Fawad Khan', phone: '0316-1122334', cnic: '35201-1122334-7' },
  { name: 'Mehwish Hayat', phone: '0317-2233445', cnic: '35201-2233445-8' },
  { name: 'Hamza Ali Abbasi', phone: '0318-3344556', cnic: '35201-3344556-9' },
  { name: 'Sajal Aly', phone: '0319-4455667', cnic: '35201-4455667-0' },
  { name: 'Babar Azam', phone: '0320-5566778', cnic: '35201-5566778-1' },
]
