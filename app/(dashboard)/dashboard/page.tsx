import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import {
  TrendingUp,
  Package,
  AlertTriangle,
  Clock,
  Plus,
  ShoppingCart,
  Users,
  BarChart3,
  ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';
import { Database } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExpiryWidget } from '@/components/inventory/expiry-widget';
import { LowStockWidget } from '@/components/inventory/low-stock-widget';
import { formatPKR, cn } from '@/lib/utils';
import { Logo } from '@/components/shared/logo';

export default async function DashboardPage() {
  const supabase = createServerComponentClient<Database>({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  const tenantId = session?.user.app_metadata.tenant_id;
  const today = format(new Date(), 'yyyy-MM-dd');
  const thirtyDaysFromNow = format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');

  // Fetch Summary Stats
  const [salesStats, medicineStats, lowStockStats, expiringStats, recentSales] = await Promise.all([
    supabase.from('sales')
      .select('total')
      .eq('tenant_id', tenantId)
      .gte('created_at', today),
    supabase.from('store_medicines')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('is_active', true),
    supabase.from('store_medicines')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .filter('stock_qty', 'lte', 'reorder_level'),
    supabase.from('store_medicines')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .lte('expiry_date', thirtyDaysFromNow)
      .gt('stock_qty', 0),
    supabase.from('sales')
      .select('*, customer:customers(name)')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(5)
  ]);

  const todaySalesTotal = salesStats.data?.reduce((sum, s) => sum + Number(s.total), 0) || 0;
  const totalMedicines = medicineStats.count || 0;
  const lowStockCount = lowStockStats.count || 0;
  const expiringCount = expiringStats.count || 0;

  const statCards = [
    {
      title: "Today's Sales",
      value: formatPKR(todaySalesTotal),
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-900/10",
      description: "Total revenue generated today"
    },
    {
      title: "Total Medicines",
      value: totalMedicines.toString(),
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/10",
      description: "Active items in inventory"
    },
    {
      title: "Low Stock Items",
      value: lowStockCount.toString(),
      icon: AlertTriangle,
      color: lowStockCount > 0 ? "text-amber-600" : "text-slate-400",
      bg: lowStockCount > 0 ? "bg-amber-50 dark:bg-amber-900/10" : "bg-slate-50 dark:bg-slate-800",
      border: lowStockCount > 0 ? "border-amber-200 dark:border-amber-900/50" : "",
      description: "Items below reorder level"
    },
    {
      title: "Expiring Soon",
      value: expiringCount.toString(),
      icon: Clock,
      color: expiringCount > 0 ? "text-rose-600" : "text-slate-400",
      bg: expiringCount > 0 ? "bg-rose-50 dark:bg-rose-900/10" : "bg-slate-50 dark:bg-slate-800",
      border: expiringCount > 0 ? "border-rose-200 dark:border-rose-900/50" : "",
      description: "Expiring within 30 days"
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-r from-primary to-primary/80 border-none shadow-lg text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Logo className="w-64 h-auto" />
        </div>
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold mb-2">Welcome to MedPOS, {session?.user.user_metadata?.store_name || 'Store'}! 👋</h2>
          <p className="text-primary-foreground/80 max-w-lg mb-6">
            Manage your pharmacy with ease. Check your stock levels, sales reports, and manage customer records all in one place.
          </p>
          <div className="flex wrap gap-3">
            <Button variant="secondary" asChild className="font-semibold">
              <Link href="/dashboard/pos">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Open POS Terminal
              </Link>
            </Button>
            <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white border border-white/20">
              Guided Tour
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <Card key={idx} className={cn("transition-all hover:shadow-md", card.border)}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">{card.title}</CardTitle>
              <div className={cn("p-2 rounded-lg", card.bg)}>
                <card.icon className={cn("w-4 h-4", card.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{card.value}</div>
              <p className="text-[10px] text-slate-400 mt-1 font-medium italic">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Row 3: Recent Sales & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Sales */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Sales</CardTitle>
              <CardDescription>The last 5 transactions from your store</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/reports">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSales.data && recentSales.data.length > 0 ? (
                recentSales.data.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-50 bg-slate-50/30 dark:bg-slate-900/30 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{sale.invoice_no}</p>
                        <p className="text-xs text-slate-500">{format(new Date(sale.created_at), 'h:mm a')} • {sale.payment_method}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{formatPKR(sale.total)}</p>
                      <p className="text-[10px] text-emerald-600 font-bold uppercase">{sale.customer?.name || 'Walk-in Customer'}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400 italic">No sales recorded yet today</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider px-1">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-4">
            <Button className="h-16 text-lg font-bold shadow-md hover:shadow-lg transition-all gap-4 justify-start px-6" asChild>
              <Link href="/dashboard/pos">
                <ShoppingCart className="w-6 h-6" />
                New Sale
                <ArrowRight className="ml-auto w-4 h-4 opacity-50" />
              </Link>
            </Button>
            <Button variant="outline" className="h-14 font-semibold justify-start px-6 gap-4" asChild>
              <Link href="/dashboard/inventory/add">
                <Plus className="w-5 h-5 text-primary" />
                Add Medicine
              </Link>
            </Button>
            <Button variant="outline" className="h-14 font-semibold justify-start px-6 gap-4" asChild>
              <Link href="/dashboard/customers/add">
                <Users className="w-5 h-5 text-primary" />
                Add Customer
              </Link>
            </Button>
            <Button variant="outline" className="h-14 font-semibold justify-start px-6 gap-4" asChild>
              <Link href="/dashboard/reports">
                <BarChart3 className="w-5 h-5 text-primary" />
                View Reports
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Row 4: Alert Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
        <ExpiryWidget tenantId={tenantId} />
        <LowStockWidget tenantId={tenantId} />
      </div>
    </div>
  );
}
