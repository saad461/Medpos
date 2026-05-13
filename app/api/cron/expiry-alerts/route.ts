import { NextResponse } from 'next/server'
import {
  createAdminClient,
  addDays,
  logCronRun,
  hasJobRunToday
} from '@/lib/cron/helpers'
import {
  createNotificationForAllUsers,
  NOTIFICATION_TYPES
} from '@/lib/notifications/create'
import { sendExpiryAlertEmail } from '@/lib/notifications/email'

export async function GET(request: Request) {
  // 1. Verify CRON_SECRET
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Deduplication check
  if (await hasJobRunToday('expiry-alerts')) {
    return NextResponse.json({
      skipped: true,
      reason: 'Already ran successfully today',
    })
  }

  const supabase = createAdminClient()
  const results = {
    tenants_processed: 0,
    emails_sent: 0,
    notifications_created: 0,
    errors: [] as string[],
  }

  try {
    // 3. Get all active tenants with their owner email
    const { data: tenants } = await supabase
      .from('tenants')
      .select('id, name, owner_email')
      .eq('status', 'active')

    for (const tenant of tenants || []) {
      try {
        await processExpiryAlertsForTenant(tenant, supabase, results)
        results.tenants_processed++
      } catch (err) {
        results.errors.push(`Tenant ${tenant.id}: ${String(err)}`)
      }
    }

    await logCronRun('expiry-alerts', results)
    return NextResponse.json({ success: true, results })
  } catch (error) {
    await logCronRun('expiry-alerts', results, String(error))
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}

async function processExpiryAlertsForTenant(tenant: any, supabase: any, results: any) {
  const today = new Date()
  const date90DaysOut = addDays(today, 90).toISOString().split('T')[0]

  // Query expiring medicines for this tenant
  const { data: expiringMedicines } = await supabase
    .from('store_medicines')
    .select(`
      id, stock_qty, expiry_date, sale_price, purchase_price,
      medicines (name, generic_name, category)
    `)
    .eq('tenant_id', tenant.id)
    .eq('is_active', true)
    .gt('stock_qty', 0)
    .not('expiry_date', 'is', null)
    .lte('expiry_date', date90DaysOut)
    .order('expiry_date', { ascending: true })

  if (!expiringMedicines || expiringMedicines.length === 0) return

  // Group by urgency
  const expired = expiringMedicines.filter((m: any) =>
    new Date(m.expiry_date) < today
  )
  const next7 = expiringMedicines.filter((m: any) => {
    const d = new Date(m.expiry_date)
    return d >= today && d <= addDays(today, 7)
  })
  const next30 = expiringMedicines.filter((m: any) => {
    const d = new Date(m.expiry_date)
    return d > addDays(today, 7) && d <= addDays(today, 30)
  })
  const next90 = expiringMedicines.filter((m: any) => {
    const d = new Date(m.expiry_date)
    return d > addDays(today, 30) && d <= addDays(today, 90)
  })

  // Only send email if there are urgent items (expired or next 7 days)
  // For 30/90 day items: only send on Mondays (weekly digest)
  const isMonday = today.getDay() === 1
  const shouldSendEmail = expired.length > 0 || next7.length > 0 ||
    (isMonday && next30.length > 0)

  if (shouldSendEmail) {
    await sendExpiryAlertEmail({
      storeName: tenant.name,
      ownerEmail: tenant.owner_email,
      expired,
      next7,
      next30: isMonday ? next30 : [],
    })
    results.emails_sent++
  }

  // In-app notifications with deduplication
  if (expired.length > 0) {
    // Expired medicines: every day until disposed
    await createNotificationForAllUsers(tenant.id, {
      type: NOTIFICATION_TYPES.EXPIRY_ALERT,
      title: `${expired.length} medicine(s) have expired`,
      message: `${expired.map((m: any) => m.medicines.name).slice(0, 3).join(', ')}${expired.length > 3 ? ` and ${expired.length - 3} more` : ''} — remove from stock immediately`,
      data: { expired_count: expired.length, medicine_ids: expired.map((m: any) => m.id) },
    })
    results.notifications_created++
  }

  if (next7.length > 0) {
    // Expiring in 7 days: ONCE (check if already exists today)
    const { data: existing } = await supabase
      .from('notifications')
      .select('id')
      .eq('tenant_id', tenant.id)
      .eq('type', NOTIFICATION_TYPES.EXPIRY_ALERT)
      .eq('data->>days', '7')
      .gte('created_at', startOfDay(new Date()).toISOString())
      .limit(1)

    if (!existing || existing.length === 0) {
      await createNotificationForAllUsers(tenant.id, {
        type: NOTIFICATION_TYPES.EXPIRY_ALERT,
        title: `${next7.length} medicine(s) expiring in 7 days`,
        message: `${next7.map((m: any) => m.medicines.name).slice(0, 3).join(', ')}${next7.length > 3 ? ` and ${next7.length - 3} more` : ''}`,
        data: { expiring_count: next7.length, days: 7 },
      })
      results.notifications_created++
    }
  }

  // 30-day alerts only on Mondays
  if (isMonday && next30.length > 0) {
    const { data: existing } = await supabase
      .from('notifications')
      .select('id')
      .eq('tenant_id', tenant.id)
      .eq('type', NOTIFICATION_TYPES.EXPIRY_ALERT)
      .eq('data->>days', '30')
      .gte('created_at', startOfDay(new Date()).toISOString())
      .limit(1)

    if (!existing || existing.length === 0) {
      await createNotificationForAllUsers(tenant.id, {
        type: NOTIFICATION_TYPES.EXPIRY_ALERT,
        title: `${next30.length} medicine(s) expiring this month`,
        message: `${next30.map((m: any) => m.medicines.name).slice(0, 3).join(', ')}${next30.length > 3 ? ` and ${next30.length - 3} more` : ''}`,
        data: { expiring_count: next30.length, days: 30 },
      })
      results.notifications_created++
    }
  }
}
