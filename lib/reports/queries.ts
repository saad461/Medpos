import { createClient } from '@/lib/supabase/server'
import { DateRange, getPreviousPeriod, PK_TIMEZONE } from './date-utils'

export async function getSalesSummary(tenantId: string, range: DateRange) {
  const supabase = await createClient()

  const { data: current, error: currentError } = await supabase
    .from('sales')
    .select('total, tax, subtotal, discount')
    .eq('tenant_id', tenantId)
    .gte('created_at', range.from.toISOString())
    .lte('created_at', range.to.toISOString())

  if (currentError) throw currentError

  const prevRange = getPreviousPeriod(range)
  const { data: previous, error: prevError } = await supabase
    .from('sales')
    .select('total')
    .eq('tenant_id', tenantId)
    .gte('created_at', prevRange.from.toISOString())
    .lte('created_at', prevRange.to.toISOString())

  if (prevError) throw prevError

  const currentRevenue = current.reduce((sum, s) => sum + Number(s.total), 0)
  const prevRevenue = previous.reduce((sum, s) => sum + Number(s.total), 0)
  const revenueTrend = prevRevenue === 0 ? 100 : ((currentRevenue - prevRevenue) / prevRevenue) * 100

  const currentCount = current.length
  const prevCount = previous.length
  const countTrend = prevCount === 0 ? 100 : ((currentCount - prevCount) / prevCount) * 100

  return {
    revenue: currentRevenue,
    revenueTrend,
    count: currentCount,
    countTrend,
    avgSale: currentCount === 0 ? 0 : currentRevenue / currentCount,
    totalTax: current.reduce((sum, s) => sum + Number(s.tax), 0),
  }
}

export async function getSalesByDay(tenantId: string, range: DateRange) {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_sales_by_day', {
    p_tenant_id: tenantId,
    p_from: range.from.toISOString(),
    p_to: range.to.toISOString(),
    p_timezone: PK_TIMEZONE
  })
  if (error) throw error
  return data
}

export async function getSalesByWeek(tenantId: string, range: DateRange) {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_sales_by_week', {
    p_tenant_id: tenantId,
    p_from: range.from.toISOString(),
    p_to: range.to.toISOString(),
    p_timezone: PK_TIMEZONE
  })
  if (error) throw error
  return data
}

export async function getSalesByMonth(tenantId: string, range: DateRange) {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_sales_by_month', {
    p_tenant_id: tenantId,
    p_from: range.from.toISOString(),
    p_to: range.to.toISOString(),
    p_timezone: PK_TIMEZONE
  })
  if (error) throw error
  return data
}

export async function getTopMedicines(tenantId: string, range: DateRange, limit = 10) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sale_items')
    .select('medicine_name, qty, subtotal')
    .eq('tenant_id', tenantId)
    .gte('created_at', range.from.toISOString())
    .lte('created_at', range.to.toISOString())

  if (error) throw error

  const grouped = data.reduce((acc: any, item) => {
    if (!acc[item.medicine_name]) {
      acc[item.medicine_name] = { name: item.medicine_name, qty: 0, revenue: 0 }
    }
    acc[item.medicine_name].qty += item.qty
    acc[item.medicine_name].revenue += Number(item.subtotal)
    return acc
  }, {})

  return Object.values(grouped)
    .sort((a: any, b: any) => b.qty - a.qty)
    .slice(0, limit)
}

export async function getTopCategories(tenantId: string, range: DateRange) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sale_items')
    .select(`
      subtotal,
      store_medicines!inner(
        medicines!inner(category)
      )
    `)
    .eq('tenant_id', tenantId)
    .gte('created_at', range.from.toISOString())
    .lte('created_at', range.to.toISOString())

  if (error) throw error

  const grouped = data.reduce((acc: any, item: any) => {
    const category = item.store_medicines.medicines.category || 'Uncategorized'
    if (!acc[category]) {
      acc[category] = { name: category, revenue: 0 }
    }
    acc[category].revenue += Number(item.subtotal)
    return acc
  }, {})

  return Object.values(grouped).sort((a: any, b: any) => b.revenue - a.revenue)
}

export async function getPaymentMethodBreakdown(tenantId: string, range: DateRange) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sales')
    .select('payment_method, total')
    .eq('tenant_id', tenantId)
    .gte('created_at', range.from.toISOString())
    .lte('created_at', range.to.toISOString())

  if (error) throw error

  return data.reduce((acc: any, sale) => {
    acc[sale.payment_method] = (acc[sale.payment_method] || 0) + Number(sale.total)
    return acc
  }, { cash: 0, card: 0, credit: 0 })
}

export async function getProfitLoss(tenantId: string, range: DateRange) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('sale_items')
    .select(`
      qty,
      subtotal,
      store_medicines!inner(purchase_price, medicines!inner(name))
    `)
    .eq('tenant_id', tenantId)
    .gte('created_at', range.from.toISOString())
    .lte('created_at', range.to.toISOString())

  if (error) throw error

  let revenue = 0
  let cogs = 0
  const missingPrices: string[] = []

  data.forEach((item: any) => {
    revenue += Number(item.subtotal)
    const pPrice = item.store_medicines.purchase_price
    if (pPrice === null || pPrice === undefined) {
      if (!missingPrices.includes(item.store_medicines.medicines.name)) {
        missingPrices.push(item.store_medicines.medicines.name)
      }
    } else {
      cogs += Number(item.qty) * Number(pPrice)
    }
  })

  return {
    revenue,
    cogs,
    profit: revenue - cogs,
    margin: revenue === 0 ? 0 : ((revenue - cogs) / revenue) * 100,
    missingPrices
  }
}

export async function getInventoryValuation(tenantId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('store_medicines')
    .select('stock_qty, purchase_price, sale_price')
    .eq('tenant_id', tenantId)
    .eq('is_active', true)

  if (error) throw error

  const totalItems = data.length
  let stockValue = 0
  let retailValue = 0

  data.forEach(item => {
    stockValue += (item.stock_qty || 0) * (Number(item.purchase_price) || 0)
    retailValue += (item.stock_qty || 0) * (Number(item.sale_price) || 0)
  })

  return {
    totalItems,
    stockValue,
    retailValue,
    potentialProfit: retailValue - stockValue,
    updatedAt: new Date()
  }
}

export async function getExpiryReport(tenantId: string, daysAhead: number | null) {
  const supabase = await createClient()
  let query = supabase
    .from('store_medicines')
    .select(`
      id, stock_qty, expiry_date, purchase_price,
      medicines!inner(name, category)
    `)
    .eq('tenant_id', tenantId)
    .not('expiry_date', 'is', null)

  const today = new Date()
  if (daysAhead === null) {
    // Expired
    query = query.lt('expiry_date', today.toISOString().split('T')[0])
  } else {
    const future = new Date()
    future.setDate(today.getDate() + daysAhead)
    query = query.gte('expiry_date', today.toISOString().split('T')[0]).lte('expiry_date', future.toISOString().split('T')[0])
  }

  const { data, error } = await query.order('expiry_date', { ascending: true })
  if (error) throw error
  return data
}

export async function getLowStockReport(tenantId: string) {
  const supabase = await createClient()

  // Fetch and filter in JS due to complex comparison
  const { data: all, error: allErr } = await supabase
    .from('store_medicines')
    .select(`
      id, stock_qty, reorder_level,
      medicines!inner(name)
    `)
    .eq('tenant_id', tenantId)

  if (allErr) throw allErr
  return all.filter(m => m.stock_qty < m.reorder_level)
}

export async function getCustomerSummary(tenantId: string, range: DateRange) {
  const supabase = await createClient()
  const { count: totalCustomers } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)

  const { data: activeData } = await supabase
    .from('sales')
    .select('customer_id')
    .eq('tenant_id', tenantId)
    .not('customer_id', 'is', null)
    .gte('created_at', range.from.toISOString())
    .lte('created_at', range.to.toISOString())

  const activeCount = new Set(activeData?.map(s => s.customer_id)).size

  const { data: creditData } = await supabase
    .from('customers')
    .select('credit_balance')
    .eq('tenant_id', tenantId)
    .gt('credit_balance', 0)

  const totalCredit = creditData?.reduce((sum, c) => sum + Number(c.credit_balance), 0) || 0

  return {
    totalCustomers: totalCustomers || 0,
    activeCustomers: activeCount,
    totalCredit,
  }
}

export async function getTaxReport(tenantId: string, range: DateRange) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sales')
    .select('created_at, invoice_no, subtotal, discount, tax, total')
    .eq('tenant_id', tenantId)
    .gte('created_at', range.from.toISOString())
    .lte('created_at', range.to.toISOString())
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

export async function getCashierPerformance(tenantId: string, range: DateRange) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sales')
    .select(`
      total,
      is_return,
      users!inner(name)
    `)
    .eq('tenant_id', tenantId)
    .gte('created_at', range.from.toISOString())
    .lte('created_at', range.to.toISOString())

  if (error) throw error

  const grouped = data.reduce((acc: any, sale: any) => {
    const name = sale.users.name
    if (!acc[name]) {
      acc[name] = { name, count: 0, revenue: 0, returns: 0 }
    }
    acc[name].count += 1
    if (sale.is_return) {
      acc[name].returns += Number(sale.total)
    } else {
      acc[name].revenue += Number(sale.total)
    }
    return acc
  }, {})

  return Object.values(grouped)
}

export async function getAuditLog(tenantId: string, range: DateRange, filters: { action?: string, userId?: string, tableName?: string }) {
  const supabase = await createClient()
  let query = supabase
    .from('audit_logs')
    .select(`
      *,
      users(name)
    `)
    .eq('tenant_id', tenantId)
    .gte('created_at', range.from.toISOString())
    .lte('created_at', range.to.toISOString())

  if (filters.action) query = query.eq('action', filters.action)
  if (filters.userId) query = query.eq('user_id', filters.userId)
  if (filters.tableName) query = query.eq('table_name', filters.tableName)

  const { data, error } = await query.order('created_at', { ascending: false }).limit(1000)
  if (error) throw error
  return data
}

export async function getHourlyHeatmap(tenantId: string, range: DateRange) {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_hourly_heatmap', {
    p_tenant_id: tenantId,
    p_from: range.from.toISOString(),
    p_to: range.to.toISOString(),
    p_timezone: PK_TIMEZONE
  })
  if (error) throw error
  return data
}
