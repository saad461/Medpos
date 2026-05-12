import { createAdminClient, startOfDay } from '@/lib/cron/helpers'

export const NOTIFICATION_TYPES = {
  EXPIRY_ALERT: 'expiry_alert',
  LOW_STOCK: 'low_stock',
  OUT_OF_STOCK: 'out_of_stock',
  DRAP_UPDATE: 'drap_update',
  MEDICINE_APPROVED: 'medicine_approved',
  MEDICINE_REJECTED: 'medicine_rejected',
  SUBSCRIPTION_EXPIRING: 'subscription_expiring',
  SUBSCRIPTION_EXPIRED: 'subscription_expired',
  PAYMENT_FAILED: 'payment_failed',
  ACCOUNT_APPROVED: 'account_approved',
  NEW_TEAM_MEMBER: 'new_team_member',
  STOCK_RECEIVED: 'stock_received',
} as const

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES]

export const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  expiry_alert: '⏰',
  low_stock: '📦',
  out_of_stock: '🚫',
  drap_update: '💊',
  medicine_approved: '✅',
  medicine_rejected: '❌',
  subscription_expiring: '🔔',
  subscription_expired: '⚠️',
  payment_failed: '💳',
  account_approved: '🎉',
  new_team_member: '👥',
  stock_received: '📥',
}

export const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  expiry_alert: 'warning',
  low_stock: 'warning',
  out_of_stock: 'danger',
  drap_update: 'accent',
  medicine_approved: 'success',
  medicine_rejected: 'danger',
  subscription_expiring: 'warning',
  subscription_expired: 'danger',
  payment_failed: 'danger',
  account_approved: 'success',
  new_team_member: 'accent',
  stock_received: 'success',
}

export const NOTIFICATION_NAVIGATION: Record<NotificationType, string> = {
  expiry_alert:           '/dashboard/inventory?status=expiring',
  low_stock:              '/dashboard/inventory?status=low_stock',
  out_of_stock:           '/dashboard/inventory?status=out_of_stock',
  drap_update:            '/dashboard/inventory',
  medicine_approved:      '/dashboard/inventory',
  medicine_rejected:      '/dashboard/inventory',
  subscription_expiring:  '/dashboard/settings/billing',
  subscription_expired:   '/dashboard/settings/billing',
  payment_failed:         '/dashboard/settings/billing',
  account_approved:       '/dashboard',
  new_team_member:        '/dashboard/settings/users',
  stock_received:         '/dashboard/inventory/adjustments',
}

export interface CreateNotificationInput {
  tenant_id: string
  user_id?: string | null
  type: NotificationType
  title: string
  message: string
  data?: any
}

export async function createNotification({
  tenant_id,
  user_id,
  type,
  title,
  message,
  data,
}: CreateNotificationInput): Promise<void> {
  const supabase = createAdminClient()

  // Deduplication check
  const { data: existing } = await supabase
    .from('notifications')
    .select('id')
    .eq('tenant_id', tenant_id)
    .eq('type', type)
    .eq('title', title) // Also check title for more specific deduplication
    .gte('created_at', startOfDay(new Date()).toISOString())
    .limit(1)

  if (existing && existing.length > 0) {
    return
  }

  await supabase.from('notifications').insert({
    tenant_id,
    user_id: user_id || null,
    type,
    title,
    message,
    data,
  })
}

export async function createNotificationForAllUsers(
  tenant_id: string,
  notification: Omit<CreateNotificationInput, 'tenant_id' | 'user_id'>
): Promise<void> {
  await createNotification({
    ...notification,
    tenant_id,
    user_id: null,
  })
}

export async function createBulkNotifications(
  notifications: CreateNotificationInput[]
): Promise<void> {
  const supabase = createAdminClient()
  await supabase.from('notifications').insert(notifications)
}

export async function createNotificationsForAllTenants(
  notification: Omit<CreateNotificationInput, 'tenant_id' | 'user_id'>
): Promise<void> {
  const supabase = createAdminClient()
  const { data: tenants } = await supabase
    .from('tenants')
    .select('id')
    .eq('status', 'active')

  if (!tenants) return

  const notifications = tenants.map((tenant) => ({
    ...notification,
    tenant_id: tenant.id,
    user_id: null,
  }))

  await createBulkNotifications(notifications)
}
