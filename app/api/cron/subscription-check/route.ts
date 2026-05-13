import { NextResponse } from 'next/server'
import {
  createAdminClient,
  addDays,
  subDays,
  startOfDay,
  endOfDay,
  formatDate,
  logCronRun,
  hasJobRunToday
} from '@/lib/cron/helpers'
import {
  createNotificationForAllUsers,
  NOTIFICATION_TYPES
} from '@/lib/notifications/create'
import {
  sendSubscriptionExpiringEmail,
  sendSubscriptionExpiredEmail
} from '@/lib/notifications/email'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (await hasJobRunToday('subscription-check')) {
    return NextResponse.json({
      skipped: true,
      reason: 'Already ran successfully today',
    })
  }

  const supabase = createAdminClient()
  const today = new Date()
  const results = {
    expiring_7_day: 0,
    expiring_1_day: 0,
    expired_suspended: 0,
    past_due_suspended: 0,
    errors: [] as string[],
  }

  try {
    // 1. Find subscriptions expiring in exactly 7 days
    const in7Days = addDays(today, 7)
    const { data: expiring7 } = await supabase
      .from('subscriptions')
      .select('*, tenants(name, owner_email)')
      .eq('status', 'active')
      .gte('period_end', startOfDay(in7Days).toISOString())
      .lte('period_end', endOfDay(in7Days).toISOString())

    for (const sub of expiring7 || []) {
      await sendSubscriptionExpiringEmail({
        storeName: sub.tenants.name,
        ownerEmail: sub.tenants.owner_email,
        planName: sub.plan,
        expiryDate: formatDate(sub.period_end),
        daysLeft: 7,
        renewUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing`,
      })

      const { data: existing } = await supabase
        .from('notifications')
        .select('id')
        .eq('tenant_id', sub.tenant_id)
        .eq('type', NOTIFICATION_TYPES.SUBSCRIPTION_EXPIRING)
        .eq('data->>days_left', '7')
        .gte('created_at', startOfDay(new Date()).toISOString())
        .limit(1)

      if (!existing || existing.length === 0) {
        await createNotificationForAllUsers(sub.tenant_id, {
          type: NOTIFICATION_TYPES.SUBSCRIPTION_EXPIRING,
          title: 'Subscription expiring in 7 days',
          message: `Your ${sub.plan} plan expires on ${formatDate(sub.period_end)}. Renew to avoid interruption.`,
          data: { days_left: 7, period_end: sub.period_end },
        })
        results.expiring_7_day++
      }
    }

    // 2. Find subscriptions expiring in exactly 1 day
    const in1Day = addDays(today, 1)
    const { data: expiring1 } = await supabase
      .from('subscriptions')
      .select('*, tenants(name, owner_email)')
      .eq('status', 'active')
      .gte('period_end', startOfDay(in1Day).toISOString())
      .lte('period_end', endOfDay(in1Day).toISOString())

    for (const sub of expiring1 || []) {
      await sendSubscriptionExpiringEmail({
        storeName: sub.tenants.name,
        ownerEmail: sub.tenants.owner_email,
        planName: sub.plan,
        expiryDate: formatDate(sub.period_end),
        daysLeft: 1,
        renewUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing`,
      })

      const { data: existing } = await supabase
        .from('notifications')
        .select('id')
        .eq('tenant_id', sub.tenant_id)
        .eq('type', NOTIFICATION_TYPES.SUBSCRIPTION_EXPIRING)
        .eq('data->>days_left', '1')
        .gte('created_at', startOfDay(new Date()).toISOString())
        .limit(1)

      if (!existing || existing.length === 0) {
        await createNotificationForAllUsers(sub.tenant_id, {
          type: NOTIFICATION_TYPES.SUBSCRIPTION_EXPIRING,
          title: '⚠️ Subscription expires TOMORROW',
          message: 'Renew your subscription today to avoid losing dashboard access.',
          data: { days_left: 1, period_end: sub.period_end },
        })
        results.expiring_1_day++
      }
    }

    // 3. Find expired subscriptions — suspend tenant (with 2 day buffer)
    const twoDaysAgo = subDays(today, 2)
    const { data: expired } = await supabase
      .from('subscriptions')
      .select('*, tenants(id, name, owner_email, status)')
      .eq('status', 'active')
      .lt('period_end', twoDaysAgo.toISOString())

    for (const sub of expired || []) {
      if (sub.tenants.status === 'active') {
        await supabase
          .from('tenants')
          .update({ status: 'suspended' })
          .eq('id', sub.tenant_id)

        await supabase
          .from('subscriptions')
          .update({ status: 'cancelled' })
          .eq('id', sub.id)

        await sendSubscriptionExpiredEmail({
          storeName: sub.tenants.name,
          ownerEmail: sub.tenants.owner_email,
          planName: sub.plan,
          renewUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing`,
        })
        results.expired_suspended++
      }
    }

    // 4. Handle past_due subscriptions — 7 day grace period
    const gracePeriodEnd = subDays(today, 7)
    const { data: pastDue } = await supabase
      .from('subscriptions')
      .select('*, tenants(id, name, owner_email)')
      .eq('status', 'past_due')
      .lt('updated_at', gracePeriodEnd.toISOString())

    for (const sub of pastDue || []) {
      await supabase
        .from('tenants')
        .update({ status: 'suspended' })
        .eq('id', sub.tenant_id)
      results.past_due_suspended++
    }

    await logCronRun('subscription-check', results)
    return NextResponse.json({ success: true, results })
  } catch (error) {
    await logCronRun('subscription-check', results, String(error))
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
