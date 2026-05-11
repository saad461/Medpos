'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle2, ChevronRight, Package2 } from 'lucide-react';
import { Database, StoreMedicine } from '@/types';
import Link from 'next/link';

export function LowStockWidget({ tenantId }: { tenantId: string }) {
  const [medicines, setMedicines] = useState<(StoreMedicine & { medicine: { name: string, company: string } })[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    async function fetchLowStock() {
      // In a real app, you might use a joined query with a filter on stock_qty <= reorder_level
      // For this widget, we'll fetch them all and filter or use an RPC if complex
      const { data } = await supabase
        .from('store_medicines')
        .select('*, medicine:medicines(name, company)')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .order('stock_qty', { ascending: true })
        .limit(20);

      if (data) {
        const filtered = (data as any[]).filter(m => m.stock_qty <= m.reorder_level);
        setMedicines(filtered.slice(0, 10));
      }
      setLoading(false);
    }

    if (tenantId) fetchLowStock();
  }, [tenantId, supabase]);

  if (loading) return <div className="h-[400px] w-full bg-slate-100 animate-pulse rounded-xl"></div>;

  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b bg-slate-50/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Low Stock Alerts
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/inventory?status=low_stock">View All</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-100">
          {medicines.length > 0 ? (
            medicines.map(item => {
              const percentage = Math.min(100, (item.stock_qty / (item.reorder_level || 1)) * 100);
              return (
                <div key={item.id} className="p-4 hover:bg-slate-50/50 transition-colors group">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-bold truncate max-w-[200px]">{item.medicine?.name}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-tight">{item.medicine?.company}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-rose-600">{item.stock_qty} <span className="text-[10px] text-slate-400 font-normal italic">units left</span></p>
                      <p className="text-[10px] text-slate-400">Target: {item.reorder_level}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden flex-1">
                      <div
                        className={cn("h-full transition-all", percentage < 30 ? "bg-rose-500" : "bg-amber-500")}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" asChild>
                      <Link href={`/dashboard/inventory/${item.id}`}>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center px-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-3 opacity-20" />
              <p className="text-sm font-semibold text-slate-900">All Stocked Up!</p>
              <p className="text-xs text-slate-500">No medicines are currently running low.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
