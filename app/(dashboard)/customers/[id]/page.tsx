import { createClient } from '@/lib/supabase/server'
import {
  ChevronLeft,
  Edit,
  Trash2,
  MessageSquare,
  Phone,
  FileText,
  Calendar,
  Info
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ReportCard } from '@/components/reports/report-card'
import { formatPKR } from '@/lib/utils'
import { formatPKDate, formatPKDateTime } from '@/lib/reports/date-utils'
import { CreditPaymentDialog } from '@/components/customers/credit-payment-dialog'
import { ReportTable } from '@/components/reports/report-table'
import { subDays } from 'date-fns'

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const tenantId = user?.app_metadata?.tenant_id

  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('id', params.id)
    .eq('tenant_id', tenantId)
    .single()

  if (!customer) notFound()

  const [sales, creditHistory] = await Promise.all([
    supabase
      .from('sales')
      .select('*, sale_items(count)')
      .eq('customer_id', params.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('credit_transactions')
      .select('*')
      .eq('customer_id', params.id)
      .order('created_at', { ascending: false })
  ])

  const totalSpent = Number(customer.total_spent)
  const purchaseCount = sales.data?.length || 0
  const avgPurchase = purchaseCount > 0 ? totalSpent / purchaseCount : 0

  const isRegular = purchaseCount >= 5
  const isNew = new Date(customer.created_at) > subDays(new Date(), 30)

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/customers">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-primary">{customer.name}</h1>
              {isRegular && <Badge className="bg-indigo-500">Regular</Badge>}
              {isNew && <Badge className="bg-emerald-500">New</Badge>}
            </div>
            <div className="flex items-center gap-4 mt-1 text-muted-foreground text-sm">
              <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {customer.phone || 'No phone'}</span>
              <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> {customer.cnic || 'No CNIC'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {customer.phone && (
            <Link href={`https://wa.me/92${customer.phone.replace(/[^0-9]/g, '')}`} target="_blank">
              <Button variant="outline" size="sm" className="text-emerald-600 border-emerald-200 bg-emerald-50">
                <MessageSquare className="mr-2 h-4 w-4" />
                WhatsApp
              </Button>
            </Link>
          )}
          <CreditPaymentDialog
            customerId={customer.id}
            customerName={customer.name}
            currentBalance={Number(customer.credit_balance)}
          />
          <Link href={`/customers/${customer.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ReportCard
          title="Total Purchases"
          value={purchaseCount}
          format="number"
          icon={Calendar}
          iconColor="text-blue-500"
        />
        <ReportCard
          title="Total Spent"
          value={totalSpent}
          format="currency"
          icon={TrendingUp}
          iconColor="text-emerald-500"
        />
        <ReportCard
          title="Credit Balance"
          value={Number(customer.credit_balance)}
          format="currency"
          icon={CreditCard}
          iconColor={Number(customer.credit_balance) > 0 ? "text-amber-500" : "text-emerald-500"}
          subtitle={Number(customer.credit_balance) > 0 ? "Outstanding" : "Settled"}
        />
        <ReportCard
          title="Avg Purchase"
          value={avgPurchase}
          format="currency"
          icon={Info}
          iconColor="text-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Purchase History */}
        <div className="lg:col-span-2 space-y-8">
          <Card shadow-sm>
            <CardHeader>
              <CardTitle>Purchase History</CardTitle>
            </CardHeader>
            <CardContent>
              <ReportTable
                columns={[
                  {
                    accessorKey: 'created_at',
                    header: 'Date',
                    cell: ({ row }) => formatPKDate(row.getValue('created_at'))
                  },
                  {
                    accessorKey: 'invoice_no',
                    header: 'Invoice #',
                    cell: ({ row }) => <span className="font-mono font-bold text-primary">{row.getValue('invoice_no')}</span>
                  },
                  {
                    accessorKey: 'total',
                    header: 'Total',
                    cell: ({ row }) => <span className="font-bold">{formatPKR(row.getValue('total'))}</span>
                  },
                  {
                    accessorKey: 'payment_method',
                    header: 'Payment',
                    cell: ({ row }) => <Badge variant="outline" className="uppercase text-[10px]">{row.getValue('payment_method')}</Badge>
                  }
                ]}
                data={sales.data || []}
                pageSize={10}
              />
            </CardContent>
          </Card>

          <Card shadow-sm>
            <CardHeader>
              <CardTitle>Credit Ledger</CardTitle>
            </CardHeader>
            <CardContent>
              <ReportTable
                columns={[
                  {
                    accessorKey: 'created_at',
                    header: 'Date',
                    cell: ({ row }) => formatPKDateTime(row.getValue('created_at'))
                  },
                  {
                    accessorKey: 'type',
                    header: 'Type',
                    cell: ({ row }) => {
                      const type = row.getValue('type') as string
                      return (
                        <Badge className={
                          type === 'credit' ? 'bg-red-100 text-red-700' :
                          type === 'payment' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-blue-100 text-blue-700'
                        }>
                          {type.toUpperCase()}
                        </Badge>
                      )
                    }
                  },
                  {
                    accessorKey: 'amount',
                    header: 'Amount',
                    cell: ({ row }) => <span className="font-bold">{formatPKR(row.getValue('amount'))}</span>
                  },
                  {
                    accessorKey: 'balance_after',
                    header: 'Balance After',
                    cell: ({ row }) => <span className="text-muted-foreground">{formatPKR(row.getValue('balance_after'))}</span>
                  }
                ]}
                data={creditHistory.data || []}
                pageSize={10}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right: Info */}
        <div className="space-y-8">
          <Card shadow-sm>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground uppercase">Phone</Label>
                <p className="font-medium">{customer.phone || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase">CNIC</Label>
                <p className="font-medium">{customer.cnic || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase">Address</Label>
                <p className="font-medium">{customer.address || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase">Notes</Label>
                <p className="text-sm">{customer.notes || 'No notes available'}</p>
              </div>
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground">Customer since {formatPKDate(customer.created_at)}</p>
              </div>
            </CardContent>
          </Card>

          {Number(customer.credit_limit) > 0 && (
            <Card className="bg-slate-50 border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Info className="h-4 w-4" /> Credit Limit Info
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Limit:</span>
                    <span className="font-bold">{formatPKR(customer.credit_limit)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Used:</span>
                    <span className="font-bold text-amber-600">{formatPKR(Math.max(0, Number(customer.credit_balance)))}</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-amber-500 h-full"
                      style={{ width: `${Math.min(100, (Number(customer.credit_balance) / Number(customer.credit_limit)) * 100)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function Label({ children, className }: { children: React.ReactNode, className?: string }) {
  return <span className={`block font-semibold ${className}`}>{children}</span>
}
