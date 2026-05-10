// TODO: Replace with supabase gen types

export interface Tenant {
  id: string
  name: string
  slug: string
  plan: 'starter' | 'professional' | 'business'
  status: 'pending_admin_approval' | 'active' | 'suspended' | 'cancelled'
  trial_ends_at: string
  stripe_customer_id?: string
  owner_email: string
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  tenant_id: string
  email: string
  role: 'super_admin' | 'owner' | 'admin' | 'pharmacist' | 'cashier'
  name: string
  phone?: string
  is_active: boolean
  created_at: string
  updated_at: string
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
  city?: string
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  tenant_id: string
  stripe_sub_id?: string
  plan: 'starter' | 'professional' | 'business'
  status: 'trialing' | 'active' | 'past_due' | 'cancelled'
  period_start?: string
  period_end?: string
  cancelled_at?: string
  created_at: string
  updated_at: string
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
  description?: string
  created_at: string
  updated_at: string
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
  location?: string
  is_active: boolean
  created_at: string
  updated_at: string
  medicine?: Medicine
}

export interface StockAdjustment {
  id: string
  tenant_id: string
  store_medicine_id: string
  user_id: string
  qty_before: number
  qty_change: number
  qty_after: number
  reason: 'received_stock' | 'damaged' | 'counted' | 'disposed' | 'returned_to_supplier' | 'other'
  notes?: string
  created_at: string
}

export interface Customer {
  id: string
  tenant_id: string
  name: string
  phone?: string
  cnic?: string
  credit_balance: number
  total_spent: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface Supplier {
  id: string
  tenant_id: string
  name: string
  phone?: string
  email?: string
  address?: string
  city?: string
  ntn?: string
  balance_due: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface PurchaseOrder {
  id: string
  tenant_id: string
  supplier_id?: string
  invoice_no?: string
  total_amount: number
  status: 'draft' | 'sent' | 'received' | 'cancelled'
  notes?: string
  ordered_at?: string
  received_at?: string
  created_at: string
  updated_at: string
}

export interface PurchaseOrderItem {
  id: string
  tenant_id: string
  purchase_order_id: string
  store_medicine_id?: string
  medicine_name: string
  qty: number
  unit_price: number
  subtotal: number
  created_at: string
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
  amount_received?: number
  change_given?: number
  is_return: boolean
  original_sale_id?: string
  notes?: string
  created_at: string
  items?: SaleItem[]
}

export interface SaleItem {
  id: string
  sale_id: string
  tenant_id: string
  store_medicine_id?: string
  medicine_name: string
  qty: number
  unit_price: number
  discount: number
  subtotal: number
  created_at: string
  store_medicine?: StoreMedicine
}

export interface AuditLog {
  id: string
  tenant_id: string
  user_id?: string
  action: string
  table_name: string
  record_id?: string
  old_value?: Record<string, unknown>
  new_value?: Record<string, unknown>
  ip_address?: string
  user_agent?: string
  created_at: string
}

export interface PriceChangeLog {
  id: string
  medicine_id: string
  old_drap_mrp?: number
  new_drap_mrp?: number
  changed_at: string
  sync_run_at: string
}

export interface Notification {
  id: string
  tenant_id: string
  user_id?: string
  type: string
  title: string
  message: string
  is_read: boolean
  data?: Record<string, unknown>
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

export interface Database {
  public: {
    Tables: {
      tenants: { Row: Tenant; Insert: Omit<Tenant, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Tenant> }
      users: { Row: User; Insert: Omit<User, 'created_at' | 'updated_at'>; Update: Partial<User> }
      store_settings: { Row: StoreSettings; Insert: Omit<StoreSettings, 'id' | 'created_at' | 'updated_at'>; Update: Partial<StoreSettings> }
      subscriptions: { Row: Subscription; Insert: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Subscription> }
      medicines: { Row: Medicine; Insert: Omit<Medicine, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Medicine> }
      store_medicines: { Row: StoreMedicine; Insert: Omit<StoreMedicine, 'id' | 'created_at' | 'updated_at'>; Update: Partial<StoreMedicine> }
      stock_adjustments: { Row: StockAdjustment; Insert: Omit<StockAdjustment, 'id' | 'created_at'>; Update: Partial<StockAdjustment> }
      customers: { Row: Customer; Insert: Omit<Customer, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Customer> }
      suppliers: { Row: Supplier; Insert: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Supplier> }
      purchase_orders: { Row: PurchaseOrder; Insert: Omit<PurchaseOrder, 'id' | 'created_at' | 'updated_at'>; Update: Partial<PurchaseOrder> }
      purchase_order_items: { Row: PurchaseOrderItem; Insert: Omit<PurchaseOrderItem, 'id' | 'created_at'>; Update: Partial<PurchaseOrderItem> }
      sales: { Row: Sale; Insert: Omit<Sale, 'id' | 'created_at'>; Update: Partial<Sale> }
      sale_items: { Row: SaleItem; Insert: Omit<SaleItem, 'id' | 'created_at'>; Update: Partial<SaleItem> }
      audit_logs: { Row: AuditLog; Insert: Omit<AuditLog, 'id' | 'created_at'>; Update: Partial<AuditLog> }
      price_change_log: { Row: PriceChangeLog; Insert: Omit<PriceChangeLog, 'id'>; Update: Partial<PriceChangeLog> }
      notifications: { Row: Notification; Insert: Omit<Notification, 'id' | 'created_at'>; Update: Partial<Notification> }
    }
  }
}
