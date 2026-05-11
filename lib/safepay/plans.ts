export const PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    safepay_plan_id_monthly: process.env.SAFEPAY_STARTER_PLAN_ID!,
    price_monthly: 1499,
    price_yearly: 14990,
    currency: 'PKR',
    trial_days: 14,
    limits: {
      users: 1,
      customers: 100,
      private_medicines_per_month: 10,
    },
    features: [
      'POS Billing',
      'Inventory + Expiry Tracking',
      'Daily & Monthly Reports',
      '100 Customers',
      'Basic PDF Invoices',
      '10 Private Medicines/month',
      'Email Support',
    ],
    not_included: [
      'Multiple Users',
      'Supplier Management',
      'Purchase Orders',
      'Full Reports + CSV Export',
      'Audit Log',
      'Bulk Price Update',
    ],
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    safepay_plan_id_monthly: process.env.SAFEPAY_PRO_PLAN_ID!,
    price_monthly: 2999,
    price_yearly: 29990,
    currency: 'PKR',
    trial_days: 14,
    is_popular: true,
    limits: {
      users: 5,
      customers: -1,          // -1 = unlimited
      private_medicines_per_month: -1,
    },
    features: [
      '5 Users',
      'POS Billing',
      'Inventory + Expiry Tracking',
      'Full Reports + CSV Export',
      'Unlimited Customers',
      'Supplier Management',
      'Purchase Orders',
      'Custom PDF Invoices + Branding',
      'Unlimited Private Medicines',
      'Submit to Global Medicine DB',
      'Multi-User Roles',
      'Audit Log',
      'Bulk Price Update',
      'Chat + Email Support',
    ],
    not_included: [],
  },
  business: {
    id: 'business',
    name: 'Business',
    safepay_plan_id_monthly: process.env.SAFEPAY_BUSINESS_PLAN_ID!,
    price_monthly: 5499,
    price_yearly: 54990,
    currency: 'PKR',
    trial_days: 14,
    limits: {
      users: 15,
      customers: -1,
      private_medicines_per_month: -1,
    },
    features: [
      '15 Users',
      'Everything in Professional',
      'Custom Logo on Receipts',
      'Shift Management',
      'Priority Support',
      'WhatsApp Support',
      'Dedicated Onboarding Call',
    ],
    not_included: [],
  },
} as const

export type PlanId = keyof typeof PLANS

export function getPlan(planId: PlanId) {
  return PLANS[planId]
}

export function formatPKR(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-PK')}`
}
