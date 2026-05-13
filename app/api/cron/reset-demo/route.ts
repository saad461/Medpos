import { NextResponse } from 'next/server'
import { createAdminClient, startOfDay, logCronRun } from '@/lib/cron/helpers'
import { createNotification, NOTIFICATION_TYPES } from '@/lib/notifications/create'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const results = {
    sales_deleted: 0,
    stock_reset: 0,
    notifications_deleted: 0,
    credits_reset: 0,
    transactions_deleted: 0,
  }

  try {
    // 1. Find demo tenant
    const { data: demoTenant } = await supabase
      .from('tenants')
      .select('id')
      .eq('slug', 'demo-pharmacy')
      .single()

    if (!demoTenant) {
      return NextResponse.json({ error: 'Demo tenant not found' }, { status: 404 })
    }

    const tenantId = demoTenant.id
    const todayStart = startOfDay(new Date()).toISOString()

    // 2. Delete today's sales and items
    const { data: todaySales } = await supabase
      .from('sales')
      .select('id')
      .eq('tenant_id', tenantId)
      .gte('created_at', todayStart)

    if (todaySales && todaySales.length > 0) {
      const saleIds = todaySales.map((s: any) => s.id)
      await supabase.from('sale_items').delete().in('sale_id', saleIds)
      await supabase.from('sales').delete().in('id', saleIds)
      results.sales_deleted = todaySales.length
    }

    // 3. Reset stock quantities to original demo values
    const { DEMO_MEDICINES } = await import('@/lib/demo-seed')
    for (const medicine of DEMO_MEDICINES) {
      const { data: sm } = await supabase
        .from('store_medicines')
        .select('id, medicines!inner(name)')
        .eq('tenant_id', tenantId)
        .eq('medicines.name', medicine.name)
        .single()

      if (sm) {
        await supabase
          .from('store_medicines')
          .update({ stock_qty: medicine.stock_qty })
          .eq('id', sm.id)
        results.stock_reset++
      }
    }

    // 4. Delete today's notifications
    const { count: notifCount } = await supabase
      .from('notifications')
      .delete({ count: 'exact' })
      .eq('tenant_id', tenantId)
      .gte('created_at', todayStart)
    results.notifications_deleted = notifCount || 0

    // ADD for Step 14: also reset is_read status on older notifications
    await supabase
      .from('notifications')
      .update({ is_read: false })
      .eq('tenant_id', tenantId)
      .lt('created_at', todayStart)

    // After reset, create fresh demo notifications
    await createNotification({
      tenant_id: tenantId,
      type: NOTIFICATION_TYPES.EXPIRY_ALERT,
      title: '3 medicines expiring this week',
      message: 'Augmentin 625mg, Insulin Mixtard, Azithromycin 500mg',
    })

    await createNotification({
      tenant_id: tenantId,
      type: NOTIFICATION_TYPES.LOW_STOCK,
      title: '2 medicines below reorder level',
      message: 'ORS Sachet (3 left), Ciprofloxacin 500mg (5 left)',
    })

    // 5. Delete today's credit transactions (from Step 13)
    const { count: transCount } = await supabase
      .from('credit_transactions')
      .delete({ count: 'exact' })
      .eq('tenant_id', tenantId)
      .gte('created_at', todayStart)
    results.transactions_deleted = transCount || 0

    // 6. Reset credit balances for demo customers
    const { count: creditsCount } = await supabase
      .from('customers')
      .update({ credit_balance: 0, total_spent: 0 })
      .eq('tenant_id', tenantId)
    results.credits_reset = creditsCount || 0

    // Recalculate total_spent from remaining sales for demo customers
    const { data: remainingSales } = await supabase
      .from('sales')
      .select('customer_id, total')
      .eq('tenant_id', tenantId)
      .not('customer_id', 'is', null)

    if (remainingSales) {
      const customerSpent: Record<string, number> = {}
      remainingSales.forEach((s: any) => {
        customerSpent[s.customer_id] = (customerSpent[s.customer_id] || 0) + Number(s.total)
      })

      for (const [customerId, total] of Object.entries(customerSpent)) {
        await supabase
          .from('customers')
          .update({ total_spent: total })
          .eq('id', customerId)
      }
    }

    await logCronRun('reset-demo', results)
    return NextResponse.json({
      success: true,
      message: 'Demo account reset successfully',
      results,
    })

  } catch (error) {
    console.error('Demo reset failed:', error)
    await logCronRun('reset-demo', results, String(error))
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
