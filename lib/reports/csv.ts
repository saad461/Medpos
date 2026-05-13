import Papa from 'papaparse'
import { formatPKDate, formatPKDateTime } from './date-utils'

export function generateSalesCSV(sales: any[]): string {
  const data = sales.map(s => ({
    'Invoice Number': s.invoice_no,
    'Date & Time': formatPKDateTime(s.created_at),
    'Subtotal': s.subtotal,
    'Discount': s.discount,
    'Tax': s.tax,
    'Total': s.total,
    'Payment Method': s.payment_method?.toUpperCase(),
  }))
  return Papa.unparse(data)
}

export function generateAuditCSV(logs: any[]): string {
  const data = logs.map(l => ({
    'Date & Time': formatPKDateTime(l.created_at),
    'User': l.users?.name || 'System',
    'Action': l.action,
    'Description': l.description,
    'Table': l.table_name,
    'IP Address': l.ip_address,
  }))
  return Papa.unparse(data)
}

export function generateInventoryCSV(medicines: any[]): string {
  const data = medicines.map(m => ({
    'Medicine Name': m.medicines?.name || m.name,
    'Category': m.medicines?.category || m.category,
    'Stock Quantity': m.stock_qty,
    'Purchase Price': m.purchase_price,
    'Sale Price': m.sale_price,
    'Expiry Date': m.expiry_date ? formatPKDate(m.expiry_date) : 'N/A',
    'Reorder Level': m.reorder_level,
  }))
  return Papa.unparse(data)
}

export function generateCustomerCSV(customers: any[]): string {
  const data = customers.map(c => ({
    'Customer Name': c.name,
    'Phone': c.phone,
    'CNIC': c.cnic,
    'Total Spent': c.total_spent,
    'Credit Balance': c.credit_balance,
    'Created At': formatPKDate(c.created_at),
  }))
  return Papa.unparse(data)
}

export function generateTaxCSV(taxData: any[]): string {
  const data = taxData.map(t => ({
    'Date': formatPKDate(t.created_at),
    'Invoice Number': t.invoice_no,
    'Pre-Tax Amount': Number(t.subtotal) - Number(t.discount),
    'Tax Amount': t.tax,
    'Total Amount': t.total,
  }))
  return Papa.unparse(data)
}

export function generateProfitCSV(profitData: any[]): string {
  // Assuming profitData is an array of daily profit records
  const data = profitData.map(p => ({
    'Date': p.date,
    'Revenue': p.revenue,
    'COGS': p.cogs,
    'Gross Profit': p.profit,
    'Margin %': p.margin?.toFixed(2),
  }))
  return Papa.unparse(data)
}

export function generateShiftCSV(shiftData: any[]): string {
  const data = shiftData.map(c => ({
    'Cashier Name': c.name,
    'Total Sales': c.count,
    'Revenue': c.revenue,
    'Returns': c.returns,
    'Net Revenue': Number(c.revenue) - Number(c.returns),
  }))
  return Papa.unparse(data)
}

export function generateSupplierCSV(suppliers: any[]): string {
  const data = suppliers.map(s => ({
    'Supplier Name': s.name,
    'Phone': s.phone,
    'Total Orders': s.total_orders || 0,
    'Total Value': s.total_value || 0,
    'Balance Due': s.balance_due,
  }))
  return Papa.unparse(data)
}
