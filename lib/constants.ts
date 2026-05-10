export const APP_NAME = "MedPOS"
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL

export const PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price_monthly: 1499,
    price_yearly: 1499 * 12 * 0.9, // 10% discount for example
    stripe_price_id: process.env.STRIPE_STARTER_PRICE_ID,
    features: ['Up to 500 medicines', 'Basic reporting', '1 user'],
    limits: {
      users: 1,
      customers: 500,
      private_medicines: 500,
    },
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    price_monthly: 2999,
    price_yearly: 2999 * 12 * 0.9,
    stripe_price_id: process.env.STRIPE_PRO_PRICE_ID,
    features: ['Unlimited medicines', 'Advanced reporting', '5 users', 'Expiry alerts'],
    limits: {
      users: 5,
      customers: 2000,
      private_medicines: 2000,
    },
  },
  business: {
    id: 'business',
    name: 'Business',
    price_monthly: 5499,
    price_yearly: 5499 * 12 * 0.9,
    stripe_price_id: process.env.STRIPE_BUSINESS_PRICE_ID,
    features: ['Everything in Professional', 'Unlimited users', 'Multi-store support', 'Custom branding'],
    limits: {
      users: 999,
      customers: 99999,
      private_medicines: 99999,
    },
  },
} as const

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
