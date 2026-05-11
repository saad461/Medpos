import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getSalesSummary,
  getTaxReport,
  getInventoryValuation,
  getProfitLoss,
  getCustomerSummary,
  getCashierPerformance,
  getTopMedicines
} from '@/lib/reports/queries'
import {
  generateSalesCSV,
  generateInventoryCSV,
  generateCustomerCSV,
  generateTaxCSV,
  generateProfitCSV,
  generateShiftCSV,
  generateSupplierCSV
} from '@/lib/reports/csv'
import { renderToStream } from '@react-pdf/renderer'
import { ReportPDF, FBRTaxPDF } from '@/lib/reports/pdf'
import React from 'react'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new NextResponse('Unauthorized', { status: 401 })
    const tenantId = user.app_metadata.tenant_id

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const format = searchParams.get('format') || 'csv'

    const dateRange = {
      from: from ? new Date(from) : new Date(),
      to: to ? new Date(to) : new Date(),
    }

    const { data: storeSettings } = await supabase
      .from('store_settings')
      .select('*')
      .eq('tenant_id', tenantId)
      .single()

    let csvData = ''
    let pdfElement: React.ReactElement | null = null

    if (type === 'sales') {
      const sales = await getTaxReport(tenantId, dateRange)
      if (format === 'csv') {
        csvData = generateSalesCSV(sales)
      } else {
        const summary = await getSalesSummary(tenantId, dateRange)
        pdfElement = (
          <ReportPDF
            storeSettings={storeSettings}
            dateRange={dateRange}
            title="Sales Report"
            summary={[
              { label: 'Total Revenue', value: `Rs. ${summary.revenue}` },
              { label: 'Sales Count', value: summary.count },
              { label: 'Avg Sale', value: `Rs. ${summary.avgSale.toFixed(2)}` },
              { label: 'Total Tax', value: `Rs. ${summary.totalTax}` },
            ]}
            columns={['Invoice', 'Date', 'Subtotal', 'Tax', 'Total']}
            data={sales.map(s => [s.invoice_no, new Date(s.created_at).toLocaleDateString(), s.subtotal, s.tax, s.total])}
          />
        )
      }
    } else if (type === 'tax' || type === 'fbr') {
      const tax = await getTaxReport(tenantId, dateRange)
      if (format === 'csv') {
        csvData = generateTaxCSV(tax)
      } else {
        const summary = await getSalesSummary(tenantId, dateRange)
        pdfElement = (
          <FBRTaxPDF
            storeSettings={storeSettings}
            dateRange={dateRange}
            summary={{
              taxableSales: summary.revenue - summary.totalTax,
              taxCollected: summary.totalTax,
              netSales: summary.revenue
            }}
            data={tax}
          />
        )
      }
    } else if (type === 'inventory') {
      const { data: allInventory } = await supabase
        .from('store_medicines')
        .select('*, medicines(name, category)')
        .eq('tenant_id', tenantId)

      if (format === 'csv') {
        csvData = generateInventoryCSV(allInventory || [])
      } else {
        const valuation = await getInventoryValuation(tenantId)
        pdfElement = (
          <ReportPDF
            storeSettings={storeSettings}
            dateRange={dateRange}
            title="Inventory Report"
            summary={[
              { label: 'Total Items', value: valuation.totalItems },
              { label: 'Stock Value', value: `Rs. ${valuation.stockValue}` },
              { label: 'Retail Value', value: `Rs. ${valuation.retailValue}` },
              { label: 'Potential Profit', value: `Rs. ${valuation.potentialProfit}` },
            ]}
            columns={['Medicine', 'Category', 'Stock', 'Cost', 'Retail']}
            data={allInventory?.slice(0, 100).map(m => [m.medicines.name, m.medicines.category, m.stock_qty, m.purchase_price, m.sale_price]) || []}
          />
        )
      }
    } else if (type === 'profit') {
      const pl = await getProfitLoss(tenantId, dateRange)
      if (format === 'csv') {
        // Simple daily trend for CSV
        const { data: dailySales } = await supabase.rpc('get_sales_by_day', {
          p_tenant_id: tenantId,
          p_from: dateRange.from.toISOString(),
          p_to: dateRange.to.toISOString(),
          p_timezone: 'Asia/Karachi'
        })
        const profitData = (dailySales || []).map((d: any) => ({
          date: d.date,
          revenue: d.revenue,
          cogs: Number(d.revenue) * (1 - pl.margin / 100),
          profit: Number(d.revenue) * (pl.margin / 100),
          margin: pl.margin
        }))
        csvData = generateProfitCSV(profitData)
      } else {
        pdfElement = (
          <ReportPDF
            storeSettings={storeSettings}
            dateRange={dateRange}
            title="Profit & Loss Report"
            summary={[
              { label: 'Gross Revenue', value: `Rs. ${pl.revenue}` },
              { label: 'COGS', value: `Rs. ${pl.cogs}` },
              { label: 'Gross Profit', value: `Rs. ${pl.profit}` },
              { label: 'Margin', value: `${pl.margin.toFixed(1)}%` },
            ]}
            columns={['Metric', 'Amount']}
            data={[
              ['Gross Revenue', `Rs. ${pl.revenue}`],
              ['Cost of Goods Sold', `Rs. ${pl.cogs}`],
              ['Gross Profit', `Rs. ${pl.profit}`],
              ['Profit Margin', `${pl.margin.toFixed(1)}%`],
            ]}
          />
        )
      }
    } else if (type === 'customers') {
      const { data: customers } = await supabase.from('customers').select('*').eq('tenant_id', tenantId).order('total_spent', { ascending: false })
      if (format === 'csv') {
        csvData = generateCustomerCSV(customers || [])
      } else {
        const summary = await getCustomerSummary(tenantId, dateRange)
        pdfElement = (
          <ReportPDF
            storeSettings={storeSettings}
            dateRange={dateRange}
            title="Customer Report"
            summary={[
              { label: 'Total Customers', value: summary.totalCustomers },
              { label: 'Active in Period', value: summary.activeCustomers },
              { label: 'Outstanding Credit', value: `Rs. ${summary.totalCredit}` },
            ]}
            columns={['Name', 'Phone', 'Total Spent', 'Credit Balance']}
            data={customers?.slice(0, 100).map(c => [c.name, c.phone, c.total_spent, c.credit_balance]) || []}
          />
        )
      }
    } else if (type === 'suppliers') {
      const { data: suppliers } = await supabase.from('suppliers').select('*').eq('tenant_id', tenantId)
      if (format === 'csv') {
        csvData = generateSupplierCSV(suppliers || [])
      } else {
        const totalBalance = suppliers?.reduce((sum, s) => sum + Number(s.balance_due), 0) || 0
        pdfElement = (
          <ReportPDF
            storeSettings={storeSettings}
            dateRange={dateRange}
            title="Supplier Report"
            summary={[
              { label: 'Total Suppliers', value: suppliers?.length || 0 },
              { label: 'Total Balance Due', value: `Rs. ${totalBalance}` },
            ]}
            columns={['Name', 'Phone', 'Balance Due']}
            data={suppliers?.map(s => [s.name, s.phone, s.balance_due]) || []}
          />
        )
      }
    } else if (type === 'shift') {
      const cashiers = await getCashierPerformance(tenantId, dateRange)
      if (format === 'csv') {
        csvData = generateShiftCSV(cashiers)
      } else {
        pdfElement = (
          <ReportPDF
            storeSettings={storeSettings}
            dateRange={dateRange}
            title="Shift / Cashier Report"
            summary={[
              { label: 'Total Cashiers', value: cashiers.length },
              { label: 'Total Revenue', value: `Rs. ${cashiers.reduce((sum, c) => sum + c.revenue, 0)}` },
            ]}
            columns={['Cashier', 'Sales Count', 'Revenue', 'Returns']}
            data={cashiers.map(c => [c.name, c.count, c.revenue, c.returns])}
          />
        )
      }
    }

    if (format === 'csv') {
      return new NextResponse(csvData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${type}-report.csv"`,
        },
      })
    } else if (pdfElement) {
      const stream = await renderToStream(pdfElement)
      return new NextResponse(stream as any, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${type}-report.pdf"`,
        },
      })
    }

    return new NextResponse('Report type not supported for this format', { status: 400 })
  } catch (error: any) {
    console.error('Export Error:', error)
    return new NextResponse(error.message, { status: 500 })
  }
}
