import { createClient } from '@/lib/supabase/server'
import {
  ChevronLeft,
  Edit,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  History,
  MessageSquare,
  Package,
  Calendar,
  CreditCard,
  TrendingUp,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ReportCard } from '@/components/reports/report-card'
import { formatPKR } from '@/lib/utils'
import { formatPKDate } from '@/lib/reports/date-utils'
import { ReportTable } from '@/components/reports/report-table'

export default async function SupplierDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const tenantId = user?.app_metadata?.tenant_id

  const { data: supplier } = await supabase
    .from('suppliers')
    .select('*')
    .eq('id', params.id)
    .eq('tenant_id', tenantId)
    .single()

  if (!supplier) notFound()

  const [pos, medicines] = await Promise.all([
    supabase
      .from('purchase_orders')
      .select('*')
      .eq('supplier_id', params.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('store_medicines')
      .select('*, medicines(name, category)')
      .eq('supplier_id', params.id)
  ])

  const totalPurchased = pos.data?.reduce((sum, p) => sum + Number(p.total_amount), 0) || 0
  const orderCount = pos.data?.length || 0
  const avgOrder = orderCount > 0 ? totalPurchased / orderCount : 0

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/suppliers">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-primary">{supplier.name}</h1>
              <Badge variant="outline" className="text-muted-foreground">{supplier.city || 'No City'}</Badge>
            </div>
            <div className="flex items-center gap-4 mt-1 text-muted-foreground text-sm">
              <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {supplier.phone}</span>
              {supplier.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {supplier.email}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {supplier.phone && (
            <Link href={`https://wa.me/92${supplier.phone.replace(/[^0-9]/g, '')}`} target="_blank">
              <Button variant="outline" size="sm" className="text-emerald-600 border-emerald-200 bg-emerald-50">
                <MessageSquare className="mr-2 h-4 w-4" />
                WhatsApp
              </Button>
            </Link>
          )}
          <Link href={`/suppliers/purchase-orders/new?supplier=${supplier.id}`}>
            <Button size="sm">
              <ShoppingBag className="mr-2 h-4 w-4" />
              New PO
            </Button>
          </Link>
          <Link href={`/suppliers/${supplier.id}/edit`}>
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
          title="Total Orders"
          value={orderCount}
          format="number"
          icon={Calendar}
          iconColor="text-blue-500"
        />
        <ReportCard
          title="Total Purchased"
          value={totalPurchased}
          format="currency"
          icon={TrendingUp}
          iconColor="text-emerald-500"
        />
        <ReportCard
          title="Balance Due"
          value={Number(supplier.balance_due)}
          format="currency"
          icon={CreditCard}
          iconColor={Number(supplier.balance_due) > 0 ? "text-amber-500" : "text-emerald-500"}
          subtitle={Number(supplier.balance_due) > 0 ? "Outstanding" : "Settled"}
        />
        <ReportCard
          title="Avg Order Value"
          value={avgOrder}
          format="currency"
          icon={Package}
          iconColor="text-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Purchase Orders */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Purchase Orders</CardTitle>
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
                    accessorKey: 'po_number',
                    header: 'PO #',
                    cell: ({ row }) => <span className="font-mono font-bold text-primary">{row.getValue('po_number') || 'N/A'}</span>
                  },
                  {
                    accessorKey: 'total_amount',
                    header: 'Total',
                    cell: ({ row }) => <span className="font-bold">{formatPKR(row.getValue('total_amount'))}</span>
                  },
                  {
                    accessorKey: 'status',
                    header: 'Status',
                    cell: ({ row }) => {
                      const status = row.getValue('status') as string
                      return (
                        <Badge variant="outline" className={
                          status === 'draft' ? 'bg-slate-50 text-slate-700' :
                          status === 'sent' ? 'bg-blue-50 text-blue-700' :
                          status === 'received' ? 'bg-emerald-50 text-emerald-700' :
                          'bg-red-50 text-red-700'
                        }>
                          {status.toUpperCase()}
                        </Badge>
                      )
                    }
                  }
                ]}
                data={pos.data || []}
                pageSize={10}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Supplied Medicines</CardTitle>
            </CardHeader>
            <CardContent>
              <ReportTable
                columns={[
                  {
                    accessorKey: 'medicines.name',
                    header: 'Medicine',
                    cell: ({ row }) => <span className="font-bold">{(row.original as any).medicines?.name}</span>
                  },
                  {
                    accessorKey: 'stock_qty',
                    header: 'Stock',
                  },
                  {
                    accessorKey: 'purchase_price',
                    header: 'Cost Price',
                    cell: ({ row }) => formatPKR(row.getValue('purchase_price'))
                  }
                ]}
                data={medicines.data || []}
                pageSize={10}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right: Supplier Info */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground uppercase">Phone</Label>
                <p className="font-medium">{supplier.phone}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase">Email</Label>
                <p className="font-medium">{supplier.email || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase">NTN</Label>
                <p className="font-medium">{supplier.ntn || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase">Address</Label>
                <p className="font-medium">{supplier.address || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase">Notes</Label>
                <p className="text-sm">{supplier.notes || 'No notes available'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Label({ children, className }: { children: React.ReactNode, className?: string }) {
  return <span className={`block font-semibold ${className}`}>{children}</span>
}
