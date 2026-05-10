export interface Tenant {
  id: string
  name: string
  slug: string
  plan: 'starter' | 'professional' | 'business'
  status: 'pending_admin_approval' | 'active' | 'suspended' | 'cancelled'
  trial_ends_at: string
  created_at: string
}

export interface User {
  id: string
  tenant_id: string
  email: string
  role: 'super_admin' | 'owner' | 'admin' | 'pharmacist' | 'cashier'
  name: string
  phone?: string
  created_at: string
}

export interface Medicine {
  id: string
  name: string
  generic_name?: string
  category?: string
  company?: string
  unit?: string
  drap_mrp?: number
  scope: 'global' | 'private' | 'pending_review' | 'rejected'
  submitted_by?: string
  is_controlled: boolean
  created_at: string
}

export interface StoreMedicine {
  id: string
  tenant_id: string
  medicine_id: string
  stock_qty: number
  sale_price: number
  purchase_price?: number
  reorder_level: number
  expiry_date?: string
  barcode?: string
  medicine?: Medicine
}

export interface StoreSettings {
  id: string
  tenant_id: string
  logo_url?: string
  theme: 'light' | 'dark'
  receipt_header?: string
  receipt_footer?: string
  gst_rate: number
  currency: string
  address?: string
  phone?: string
}

export interface Sale {
  id: string
  tenant_id: string
  user_id: string
  customer_id?: string
  invoice_no: string
  subtotal: number
  discount: number
  tax: number
  total: number
  payment_method: 'cash' | 'card' | 'credit'
  created_at: string
  items?: SaleItem[]
}

export interface SaleItem {
  id: string
  sale_id: string
  store_medicine_id: string
  qty: number
  unit_price: number
  discount: number
  subtotal: number
  store_medicine?: StoreMedicine
}

export interface Customer {
  id: string
  tenant_id: string
  name: string
  phone?: string
  cnic?: string
  credit_balance: number
  total_spent: number
  created_at: string
}

export interface Supplier {
  id: string
  tenant_id: string
  name: string
  phone?: string
  email?: string
  address?: string
  ntn?: string
  balance_due: number
  created_at: string
}

export interface PurchaseOrder {
  id: string
  tenant_id: string
  supplier_id: string
  total_amount: number
  status: 'draft' | 'sent' | 'received' | 'cancelled'
  created_at: string
}

export interface Subscription {
  id: string
  tenant_id: string
  stripe_sub_id: string
  plan: 'starter' | 'professional' | 'business'
  status: 'active' | 'past_due' | 'cancelled' | 'trialing'
  period_start: string
  period_end: string
  cancelled_at?: string
}

export interface AuditLog {
  id: string
  tenant_id: string
  user_id: string
  action: string
  table_name: string
  record_id: string
  old_value?: Record<string, unknown>
  new_value?: Record<string, unknown>
  ip_address?: string
  created_at: string
}

export interface CartItem {
  store_medicine_id: string
  medicine_name: string
  qty: number
  unit_price: number
  discount: number
  subtotal: number
  stock_qty: number
}
