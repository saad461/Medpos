import { NextResponse } from 'next/server'
import {
  createAdminClient,
  logCronRun,
  hasJobRunToday
} from '@/lib/cron/helpers'
import {
  createNotificationForAllUsers,
  NOTIFICATION_TYPES
} from '@/lib/notifications/create'
import {
  sendLowStockDigestEmail,
  sendSupplierReorderEmail
} from '@/lib/notifications/email'

export async function GET(request: Request) {
  // 1. Verify CRON_SECRET
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Deduplication check (only run on Mondays or if forced by admin)
  const isMonday = new Date().getDay() === 1
  if (isMonday && await hasJobRunToday('low-stock-digest')) {
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
    const { data: tenants } = await supabase
      .from('tenants')
      .select('id, name, owner_email')
      .eq('status', 'active')

    for (const tenant of tenants || []) {
      try {
        await processLowStockForTenant(tenant, supabase, results)
        results.tenants_processed++
      } catch (err) {
        results.errors.push(`Tenant ${tenant.id}: ${String(err)}`)
      }
    }

    await logCronRun('low-stock-digest', results)
    return NextResponse.json({ success: true, results })
  } catch (error) {
    await logCronRun('low-stock-digest', results, String(error))
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}

async function processLowStockForTenant(tenant: any, supabase: any, results: any) {
  // Get medicines below reorder level
  const { data: lowStockMedicines } = await supabase
    .from('store_medicines')
    .select(`
      id, stock_qty, reorder_level, supplier_id,
      medicines (name, generic_name, unit),
      suppliers (name, email, phone)
    `)
    .eq('tenant_id', tenant.id)
    .eq('is_active', true)
    .order('stock_qty', { ascending: true })

  const filteredLowStock = lowStockMedicines?.filter((m: any) => m.stock_qty <= m.reorder_level) || []

  if (filteredLowStock.length === 0) return

  // Separate out of stock vs low stock
  const outOfStock = filteredLowStock.filter((m: any) => m.stock_qty === 0)
  const lowStock = filteredLowStock.filter((m: any) => m.stock_qty > 0)

  // Send email digest
  await sendLowStockDigestEmail({
    storeName: tenant.name,
    ownerEmail: tenant.owner_email,
    outOfStock,
    lowStock,
  })
  results.emails_sent++

  // Create in-app notification with deduplication (already handled by cron only running on Mondays, but extra safety)
  const totalCount = filteredLowStock.length
  const { data: existing } = await supabase
    .from('notifications')
    .select('id')
    .eq('tenant_id', tenant.id)
    .in('type', [NOTIFICATION_TYPES.LOW_STOCK, NOTIFICATION_TYPES.OUT_OF_STOCK])
    .gte('created_at', startOfDay(new Date()).toISOString())
    .limit(1)

  if (!existing || existing.length === 0) {
    await createNotificationForAllUsers(tenant.id, {
      type: outOfStock.length > 0 ? NOTIFICATION_TYPES.OUT_OF_STOCK : NOTIFICATION_TYPES.LOW_STOCK,
      title: `Weekly Stock Alert: ${totalCount} medicine(s) need reordering`,
      message: `${outOfStock.length} out of stock, ${lowStock.length} below reorder level`,
      data: {
        out_of_stock_count: outOfStock.length,
        low_stock_count: lowStock.length,
      },
    })
    results.notifications_created++
  }

  // Auto-email suppliers
  await notifySuppliers(tenant, filteredLowStock, supabase)
}

async function notifySuppliers(tenant: any, medicines: any[], supabase: any) {
  const bySupplier = medicines.reduce((acc, medicine) => {
    if (!medicine.supplier_id || !medicine.suppliers?.email) return acc
    const supplierId = medicine.supplier_id
    if (!acc[supplierId]) {
      acc[supplierId] = {
        supplier: medicine.suppliers,
        medicines: [],
      }
    }
    acc[supplierId].medicines.push(medicine)
    return acc
  }, {} as Record<string, { supplier: any, medicines: any[] }>)

  for (const [supplierId, { supplier, medicines }] of Object.entries(bySupplier)) {
    await sendSupplierReorderEmail({
      supplierName: supplier.name,
      supplierEmail: supplier.email,
      storeName: tenant.name,
      medicines: medicines.map((m: any) => ({
        name: m.medicines.name,
        currentStock: m.stock_qty,
        reorderLevel: m.reorder_level,
        suggestedOrderQty: Math.max(
          m.reorder_level - m.stock_qty + Math.ceil(m.reorder_level * 0.5),
          0
        ),
        unit: m.medicines.unit,
      })),
    })
  }
}
