export const MEDICINE_CATEGORIES = [
  { id: 'analgesic', label: 'Analgesic', description: 'Pain relief medicines' },
  { id: 'antibiotic', label: 'Antibiotic', description: 'Bacterial infection treatment' },
  { id: 'antacid', label: 'Antacid / GI', description: 'Stomach and digestive medicines' },
  { id: 'antidiabetic', label: 'Antidiabetic', description: 'Diabetes management' },
  { id: 'antihypertensive', label: 'Antihypertensive', description: 'Blood pressure medicines' },
  { id: 'antihistamine', label: 'Antihistamine', description: 'Allergy medicines' },
  { id: 'anti_inflammatory', label: 'Anti-inflammatory', description: 'Inflammation and swelling' },
  { id: 'antidepressant', label: 'Antidepressant', description: 'Depression and mood disorders' },
  { id: 'antifungal', label: 'Antifungal', description: 'Fungal infection treatment' },
  { id: 'antiviral', label: 'Antiviral', description: 'Viral infection treatment' },
  { id: 'anxiolytic', label: 'Anxiolytic', description: 'Anxiety and sleep disorders' },
  { id: 'beta_blocker', label: 'Beta Blocker', description: 'Heart rate and blood pressure' },
  { id: 'corticosteroid', label: 'Corticosteroid', description: 'Inflammation and immune response' },
  { id: 'dermatology', label: 'Dermatology', description: 'Skin conditions and treatment' },
  { id: 'electrolytes', label: 'Electrolytes / ORS', description: 'Rehydration and minerals' },
  { id: 'ent', label: 'ENT', description: 'Ear, nose, and throat' },
  { id: 'eye', label: 'Eye Care', description: 'Eye drops and ointments' },
  { id: 'respiratory', label: 'Respiratory', description: 'Breathing and lung medicines' },
  { id: 'statin', label: 'Statin', description: 'Cholesterol management' },
  { id: 'supplement', label: 'Supplement', description: 'Minerals and health supplements' },
  { id: 'vitamin', label: 'Vitamin', description: 'Vitamins and micronutrients' },
  { id: 'antiplatelet', label: 'Antiplatelet', description: 'Blood thinning medicines' },
  { id: 'anticoagulant', label: 'Anticoagulant', description: 'Blood clot prevention' },
  { id: 'controlled', label: 'Controlled Substance', description: 'Requires special prescription' },
  { id: 'gi', label: 'Gastrointestinal', description: 'Digestive system medicines' },
  { id: 'cardiac', label: 'Cardiac', description: 'Heart medicines' },
  { id: 'hormonal', label: 'Hormonal', description: 'Hormones and endocrine' },
  { id: 'neurological', label: 'Neurological', description: 'Nervous system medicines' },
  { id: 'obstetrics', label: 'Obstetrics / Gynecology', description: 'Women health medicines' },
  { id: 'other', label: 'Other', description: 'Miscellaneous medicines' },
] as const

export type MedicineCategoryId = typeof MEDICINE_CATEGORIES[number]['id']

export const MEDICINE_UNITS = [
  'Tablet', 'Capsule', 'Syrup', 'Injection', 'Inhaler',
  'Cream', 'Ointment', 'Gel', 'Drops', 'Spray',
  'Sachet', 'Vial', 'Ampoule', 'Suppository', 'Patch',
  'Lotion', 'Shampoo', 'Solution', 'Suspension', 'Powder',
] as const

export function mapDRAPToCategory(name: string, composition: string): string {
  const text = `${name} ${composition}`.toLowerCase()
  if (text.match(/paracetamol|ibuprofen|diclofenac|aspirin|tramadol|morphine|codeine|mefenamic|ketorolac|naproxen|celecoxib|etoricoxib/)) return 'analgesic'
  if (text.match(/amoxicillin|ciprofloxacin|azithromycin|metronidazole|clarithromycin|doxycycline|cephalexin|cefixime|ceftriaxone|levofloxacin|clindamycin|erythromycin/)) return 'antibiotic'
  if (text.match(/omeprazole|lansoprazole|pantoprazole|esomeprazole|ranitidine|famotidine|domperidone|metoclopramide|ondansetron|loperamide|bisacodyl|lactulose/)) return 'antacid'
  if (text.match(/metformin|glibenclamide|gliclazide|glimepiride|sitagliptin|insulin|pioglitazone|empagliflozin|dapagliflozin/)) return 'antidiabetic'
  if (text.match(/amlodipine|losartan|valsartan|enalapril|lisinopril|ramipril|bisoprolol|metoprolol|atenolol|furosemide|hydrochlorothiazide|spironolactone|nifedipine|telmisartan/)) return 'antihypertensive'
  if (text.match(/cetirizine|loratadine|fexofenadine|chlorphenamine|diphenhydramine|promethazine/)) return 'antihistamine'
  if (text.match(/betamethasone|hydrocortisone|clobetasol|clotrimazole|miconazole|ketoconazole|fusidic|mupirocin|tretinoin/)) return 'dermatology'
  if (text.match(/salbutamol|ipratropium|montelukast|theophylline|fluticasone|budesonide|formoterol|salmeterol/)) return 'respiratory'
  if (text.match(/atorvastatin|rosuvastatin|simvastatin/)) return 'statin'
  if (text.match(/vitamin|folic|ferrous|calcium|zinc|magnesium|omega|multivitamin/)) return 'vitamin'
  if (text.match(/diazepam|alprazolam|clonazepam|lorazepam|phenobarbitone|phenytoin|carbamazepine|zolpidem|pregabalin|gabapentin/)) return 'anxiolytic'
  if (text.match(/warfarin|heparin|clopidogrel|aspirin.*75|aspirin.*100/)) return 'antiplatelet'
  if (text.match(/levothyroxine|insulin|progesterone|clomiphene|contraceptive/)) return 'hormonal'
  if (text.match(/eye|ophthal|ocular|conjunctiv/)) return 'eye'
  if (text.match(/ear|nasal|ent|otitis|rhinitis/)) return 'ent'
  if (text.match(/escitalopram|sertraline|fluoxetine|amitriptyline|venlafaxine|mirtazapine/)) return 'antidepressant'
  if (text.match(/fluconazole|itraconazole|terbinafine|nystatin/)) return 'antifungal'
  if (text.match(/acyclovir|oseltamivir|valacyclovir/)) return 'antiviral'
  if (text.match(/mebendazole|albendazole|ivermectin|chloroquine|artemether/)) return 'gi'
  if (text.match(/dexamethasone|prednisolone|methylprednisolone|cortisone/)) return 'corticosteroid'
  if (text.match(/digoxin|amiodarone|isosorbide|nitroglycerin/)) return 'cardiac'
  if (text.match(/haloperidol|risperidone|olanzapine|quetiapine/)) return 'neurological'
  return 'other'
}

export function isControlledSubstance(name: string, composition: string): boolean {
  const text = `${name} ${composition}`.toLowerCase()
  return !!text.match(/tramadol|morphine|codeine|pethidine|buprenorphine|diazepam|alprazolam|clonazepam|lorazepam|phenobarbitone|zolpidem|methylphenidate|pregabalin|gabapentin|warfarin/)
}
