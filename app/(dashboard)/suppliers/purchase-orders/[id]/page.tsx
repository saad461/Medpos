export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import {
  ChevronLeft,
  ShoppingBag,
  Truck,
  Calendar,
  User,
  Info,
  Mail,
  XCircle,
  Clock
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatPKR } from '@/lib/utils'
import { formatPKDate } from '@/lib/reports/date-utils'
import { ReceiveStockDialog } from '@/components/suppliers/receive-stock-dialog'

export default async function PurchaseOrderDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const tenantId = user?.app_metadata?.tenant_id

  const { data: po } = await supabase
    .from('purchase_orders')
    .select('*, suppliers(*)')
    .eq('id', params.id)
    .eq('tenant_id', tenantId)
    .single()

  if (!po) notFound()

  const { data: items } = await supabase
    .from('purchase_order_items')
    .select('*')
    .eq('purchase_order_id', params.id)

  const totalQty = items?.reduce((sum, i) => sum + i.qty, 0) || 0
  const receivedQty = items?.reduce((sum, i) => sum + (i.qty_received || 0), 0) || 0

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/suppliers/purchase-orders">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-primary">{po.po_number || 'DRAFT PO'}</h1>
              <Badge className={
                po.status === 'draft' ? 'bg-slate-500' :
                po.status === 'sent' ? 'bg-blue-500' :
                po.status === 'received' ? 'bg-emerald-500' :
                po.status === 'partial' ? 'bg-amber-500' :
                'bg-red-500'
              }>
                {po.status.toUpperCase()}
              </Badge>
            </div>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <Truck className="h-4 w-4" /> {po.suppliers.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {['draft', 'sent', 'partial'].includes(po.status) && (
             <ReceiveStockDialog po={po} items={items || []} />
          )}
          {po.status === 'draft' && (
            <Button variant="outline">
               <Mail className="mr-2 h-4 w-4" /> Send Email
            </Button>
          )}
          {['draft', 'sent'].includes(po.status) && (
            <Button variant="ghost" className="text-red-500">
               <XCircle className="mr-2 h-4 w-4" /> Cancel PO
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card>
           <CardContent className="p-6 flex items-center gap-4">
             <div className="p-3 rounded-full bg-blue-50 text-blue-600">
               <Calendar className="h-6 w-6" />
             </div>
             <div>
               <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Ordered On</p>
               <p className="text-lg font-bold">{formatPKDate(po.created_at)}</p>
             </div>
           </CardContent>
         </Card>
         <Card>
           <CardContent className="p-6 flex items-center gap-4">
             <div className="p-3 rounded-full bg-emerald-50 text-emerald-600">
               <PackageCheck className="h-6 w-6" />
             </div>
             <div>
               <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Total Amount</p>
               <p className="text-lg font-bold text-primary">{formatPKR(po.total_amount)}</p>
             </div>
           </CardContent>
         </Card>
         <Card>
           <CardContent className="p-6 flex items-center gap-4">
             <div className="p-3 rounded-full bg-indigo-50 text-indigo-600">
               <ShoppingBag className="h-6 w-6" />
             </div>
             <div>
               <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Items Summary</p>
               <p className="text-lg font-bold">{items?.length} Types | {receivedQty}/{totalQty} Units</p>
             </div>
           </CardContent>
         </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b">
                <th className="px-4 py-3 text-left">Medicine</th>
                <th className="px-4 py-3 text-center">Ordered</th>
                <th className="px-4 py-3 text-center">Received</th>
                <th className="px-4 py-3 text-center">Unit Price</th>
                <th className="px-4 py-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items?.map((item) => (
                <tr key={item.id} className="border-b hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium">{item.medicine_name}</td>
                  <td className="px-4 py-3 text-center">{item.qty}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={item.qty_received >= item.qty ? 'default' : 'outline'}>
                       {item.qty_received || 0}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">{formatPKR(item.unit_price)}</td>
                  <td className="px-4 py-3 text-right font-bold">{formatPKR(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
               <tr className="font-bold text-lg">
                 <td colSpan={4} className="px-4 py-6 text-right">Total Order Value:</td>
                 <td className="px-4 py-6 text-right text-primary">{formatPKR(po.total_amount)}</td>
               </tr>
            </tfoot>
          </table>
        </CardContent>
      </Card>

      {po.notes && (
        <Card className="bg-slate-50 border-dashed">
          <CardContent className="p-4">
            <h4 className="text-xs font-bold text-muted-foreground uppercase mb-1">Notes / Reference</h4>
            <p className="text-sm">{po.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
