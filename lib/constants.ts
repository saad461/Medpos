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

export const PAKISTAN_CITIES = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Sialkot',
  'Gujranwala',
  'Hyderabad',
  'Bahawalpur',
  'Sargodha',
  'Sukkur',
  'Larkana',
  'Sheikhupura',
  'Rahim Yar Khan',
  'Jhang',
  'Dera Ghazi Khan',
  'Gujrat',
  'muzaffargarh',
  'Other',
] as const

export type PakistanCity = typeof PAKISTAN_CITIES[number]

// Help & Support Constants
// TODO: Replace with actual MedPOS Urdu tutorial video ID before launch
export const TUTORIAL_VIDEO_ID = 'dQw4w9WgXcQ'
export const TUTORIAL_VIDEO_URL = `https://www.youtube.com/watch?v=${TUTORIAL_VIDEO_ID}`
export const TUTORIAL_EMBED_URL = `https://www.youtube.com/embed/${TUTORIAL_VIDEO_ID}`

export const SUPPORT_WHATSAPP = '923001234567' // TODO: Replace with real number
export const SUPPORT_WHATSAPP_URL = `https://wa.me/${SUPPORT_WHATSAPP}`
export const SUPPORT_EMAIL = 'support@medpos.pk'
export const SUPPORT_HOURS = 'Monday - Saturday, 9 AM - 11 PM Pakistan Time'
