export const APP_NAME = "MedPOS"
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL

export const ROLES = ['super_admin', 'owner', 'admin', 'pharmacist', 'cashier'] as const

export const MEDICINE_SCOPES = ['global', 'private', 'pending_review', 'rejected'] as const

export const TENANT_STATUSES = ['pending_admin_approval', 'active', 'suspended', 'cancelled'] as const

export const PAYMENT_METHODS = ['cash', 'card', 'credit'] as const

export const STOCK_STATUSES = ['in_stock', 'low_stock', 'out_of_stock', 'expiring_soon', 'expired'] as const

export const COLORS = {
  primary: '#1E3A5F',
  accent: '#0EA5E9',
  success: '#059669',
  warning: '#D97706',
  danger: '#DC2626',
  surface: '#F8FAFC',
} as const
