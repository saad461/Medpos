import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types';
import { MedicineStatsBar } from '@/components/inventory/medicine-stats-bar';
import { MedicineTable } from '@/components/inventory/medicine-table';
import { MedicineFilters } from '@/components/inventory/medicine-filters';
import { Button } from '@/components/ui/button';
import { Plus, Download, Upload, FileEdit } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const supabase = createServerComponentClient<Database>({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  const tenantId = session?.user.app_metadata.tenant_id;

  const thirtyDaysFromNow = format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');

  // Parallel Fetch Stats
  const [totalRes, lowStockRes, expiringRes, stockValueRes] = await Promise.all([
    supabase.from('store_medicines').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('is_active', true),
    supabase.from('store_medicines').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('is_active', true).filter('stock_qty', 'lte', 'reorder_level'),
    supabase.from('store_medicines').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('is_active', true).lte('expiry_date', thirtyDaysFromNow).gt('stock_qty', 0),
    supabase.from('store_medicines').select('stock_qty, purchase_price').eq('tenant_id', tenantId).eq('is_active', true)
  ]);

  const totalMedicines = totalRes.count || 0;
  const lowStockCount = lowStockRes.count || 0;
  const expiringSoonCount = expiringRes.count || 0;
  const totalStockValue = stockValueRes.data?.reduce((sum, item) => sum + (item.stock_qty * (item.purchase_price || 0)), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">Manage your pharmacy stock, prices, and expiry dates.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href="/api/inventory/export-csv" download>
              <Download className="w-4 h-4 mr-2" />
              Export
            </a>
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <FileEdit className="w-4 h-4 mr-2" />
            Bulk Update
          </Button>
          <Button size="sm" asChild>
            <Link href="/dashboard/inventory/add">
              <Plus className="w-4 h-4 mr-2" />
              Add Medicine
            </Link>
          </Button>
        </div>
      </div>

      <MedicineStatsBar
        total={totalMedicines}
        value={totalStockValue}
        lowStock={lowStockCount}
        expiring={expiringSoonCount}
      />

      <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
        <CardContent className="p-0">
          <MedicineFilters />
          <MedicineTable searchParams={searchParams} />
        </CardContent>
      </Card>
    </div>
  );
}
