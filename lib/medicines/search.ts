import { Medicine, StoreMedicine, MedicineSearchResult } from '@/types';

export function buildSearchQuery(q: string): {
  prefixQuery: string
  fulltextQuery: string
  isBarcodeQuery: boolean
} {
  const cleaned = q.trim().toLowerCase()
  const isBarcodeQuery = /^\d{6,}$/.test(cleaned)

  return {
    prefixQuery: `${cleaned}%`,
    fulltextQuery: cleaned.replace(/\s+/g, ' & '),
    isBarcodeQuery,
  }
}

export function formatMedicineResult(
  sm: StoreMedicine & { medicine: Medicine }
): MedicineSearchResult {
  const profitMargin = sm.purchase_price
    ? (((sm.sale_price - sm.purchase_price) / sm.purchase_price) * 100).toFixed(1)
    : null

  return {
    id: sm.id,
    medicine_id: sm.medicine_id,
    name: sm.medicine!.name,
    generic_name: sm.medicine!.generic_name,
    category: sm.medicine!.category,
    company: sm.medicine!.company,
    unit: sm.medicine!.unit,
    drap_mrp: sm.medicine!.drap_mrp,
    sale_price: sm.sale_price,
    purchase_price: sm.purchase_price,
    stock_qty: sm.stock_qty,
    expiry_date: sm.expiry_date,
    barcode: sm.barcode,
    reorder_level: sm.reorder_level,
    is_controlled: sm.medicine!.is_controlled,
    is_low_stock: sm.stock_qty <= sm.reorder_level,
    is_out_of_stock: sm.stock_qty === 0,
    is_expiring_soon: sm.expiry_date
      ? new Date(sm.expiry_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      : false,
    profit_margin: profitMargin,
  }
}
