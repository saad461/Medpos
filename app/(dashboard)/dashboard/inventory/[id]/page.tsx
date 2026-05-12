export const dynamic = 'force-dynamic'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types';
import { Button } from '@/components/ui/button';
import { ChevronLeft, IndianRupee, Package, AlertTriangle, TrendingUp, History, BarChart3, Info } from 'lucide-react';
import Link from 'next/link';
import { StockBadge } from '@/components/inventory/stock-badge';
import { formatPKR, cn } from '@/lib/utils';
import { format, differenceInDays } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MEDICINE_CATEGORIES } from '@/lib/medicines/categories';
import { InventoryDetailActions } from './inventory-detail-actions';

export default async function MedicineDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServerComponentClient<Database>({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  const tenantId = session?.user.app_metadata.tenant_id;

  const { data: item, error } = await supabase
    .from('store_medicines')
    .select(`
      *,
      medicine:medicines(*),
      adjustments:stock_adjustments(*),
      sales:sale_items(
        *,
        sale:sales(*)
      )
    `)
    .eq('id', params.id)
    .eq('tenant_id', tenantId)
    .single();

  if (error || !item) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Medicine Not Found</h2>
        <p className="text-slate-500 mt-2">This medicine does not exist in your inventory.</p>
        <Button className="mt-6" asChild>
          <Link href="/dashboard/inventory">Back to Inventory</Link>
        </Button>
      </div>
    );
  }

  const profitMargin = item.purchase_price
    ? (((item.sale_price - item.purchase_price) / item.purchase_price) * 100).toFixed(1)
    : null;

  const daysToExpiry = item.expiry_date ? differenceInDays(new Date(item.expiry_date), new Date()) : null;

  return (
    <div className="space-y-8 pb-20 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full shrink-0">
            <Link href="/dashboard/inventory">
              <ChevronLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{item.medicine.name}</h1>
              <StockBadge stockQty={item.stock_qty} reorderLevel={item.reorder_level} expiryDate={item.expiry_date} />
            </div>
            <p className="text-lg text-muted-foreground">{item.medicine.generic_name} • {item.medicine.company} • {item.medicine.unit}</p>
          </div>
        </div>
        <InventoryDetailActions item={item} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm border-none bg-white dark:bg-slate-900">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center text-blue-600">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Current Stock</p>
              <p className="text-2xl font-black">{item.stock_qty} <span className="text-xs font-normal text-slate-400 uppercase">{item.medicine.unit}s</span></p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-none bg-white dark:bg-slate-900">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 flex items-center justify-center text-emerald-600">
              <IndianRupee className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Sale Price</p>
              <p className="text-2xl font-black">{formatPKR(item.sale_price)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-none bg-white dark:bg-slate-900">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/10 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">DRAP MRP</p>
              <p className="text-2xl font-black">{item.medicine.drap_mrp ? formatPKR(item.medicine.drap_mrp) : 'N/A'}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-none bg-white dark:bg-slate-900">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-900/10 flex items-center justify-center text-rose-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Profit Margin</p>
              <p className="text-2xl font-black">{profitMargin ? `${profitMargin}%` : 'N/A'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="shadow-sm">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" />
                Information Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                <DetailRow label="Purchase Price" value={item.purchase_price ? formatPKR(item.purchase_price) : 'Not recorded'} />
                <DetailRow label="Reorder Level" value={`${item.reorder_level} units`} />
                <DetailRow
                  label="Expiry Date"
                  value={item.expiry_date ? `${format(new Date(item.expiry_date), 'MMMM d, yyyy')} (${daysToExpiry} days left)` : 'No date set'}
                  highlight={daysToExpiry !== null && daysToExpiry < 90}
                />
                <DetailRow label="Barcode" value={item.barcode || 'N/A'} />
                <DetailRow label="Storage Location" value={item.location || 'N/A'} />
                <DetailRow label="Category" value={MEDICINE_CATEGORIES.find(c => c.id === item.medicine.category)?.label || item.medicine.category} />
                <DetailRow
                  label="Is Controlled"
                  value={item.medicine.is_controlled ? 'YES (Prescription Required)' : 'No'}
                  color={item.medicine.is_controlled ? 'text-rose-600 font-bold' : ''}
                />
                <DetailRow label="Added to Inventory" value={format(new Date(item.created_at), 'MMMM d, yyyy')} />
              </div>
            </CardContent>
          </Card>

          {/* Stock History */}
          <Card className="shadow-sm">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <History className="w-4 h-4 text-primary" />
                Stock Adjustment History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Reason</th>
                      <th className="px-6 py-3 text-right">Change</th>
                      <th className="px-6 py-3 text-right">After</th>
                      <th className="px-6 py-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {item.adjustments && item.adjustments.length > 0 ? (
                      item.adjustments.map((adj: any) => (
                        <tr key={adj.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap font-medium">{format(new Date(adj.created_at), 'MMM d, yyyy h:mm a')}</td>
                          <td className="px-6 py-4 capitalize">{adj.reason.replace(/_/g, ' ')}</td>
                          <td className={cn("px-6 py-4 text-right font-bold", adj.qty_change > 0 ? "text-emerald-600" : "text-rose-600")}>
                            {adj.qty_change > 0 ? `+${adj.qty_change}` : adj.qty_change}
                          </td>
                          <td className="px-6 py-4 text-right font-bold">{adj.qty_after}</td>
                          <td className="px-6 py-4 text-slate-500 italic max-w-[200px] truncate">{adj.notes || '-'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">No adjustments recorded yet</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Sales Summary */}
        <div className="space-y-8">
          <Card className="shadow-sm">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                Sales Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Total Sold (Overall)</p>
                  <p className="text-3xl font-black text-primary">
                    {item.sales?.reduce((sum: number, s: any) => sum + s.qty, 0) || 0}
                    <span className="text-sm font-normal ml-2 opacity-60">units</span>
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase text-slate-400 px-1 tracking-widest">Recent Transactions</h4>
                  {item.sales && item.sales.length > 0 ? (
                    item.sales.slice(0, 5).map((saleItem: any) => (
                      <div key={saleItem.id} className="flex items-center justify-between p-3 border border-slate-50 rounded-lg hover:bg-slate-50 transition-colors">
                        <div>
                          <p className="text-xs font-bold">{saleItem.sale?.invoice_no || 'Manual Entry'}</p>
                          <p className="text-[10px] text-slate-500">{format(new Date(saleItem.created_at), 'MMM d, yyyy')}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black">+{saleItem.qty}</p>
                          <p className="text-[10px] text-emerald-600 font-bold">{formatPKR(saleItem.subtotal)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-slate-400 italic text-xs">No sales recorded yet</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {item.medicine.scope === 'private' && (
            <Card className="shadow-sm border-dashed border-primary/30 bg-primary/5">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-primary text-sm">Contribute to Global DB</h4>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed px-4">
                    Is this medicine accurate? Submit it for review to make it available to all Pakistani pharmacies.
                  </p>
                </div>
                <Button className="w-full font-bold">Submit for Review</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, color, highlight }: { label: string; value: string; color?: string; highlight?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
      <span className={cn("text-sm font-semibold text-slate-900 dark:text-slate-200", color, highlight && "text-rose-600")}>{value}</span>
    </div>
  );
}
