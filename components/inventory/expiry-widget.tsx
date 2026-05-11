'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, AlertCircle, CheckCircle2, ChevronRight, Package2 } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { Database, StoreMedicine } from '@/types';
import Link from 'next/link';

export function ExpiryWidget({ tenantId }: { tenantId: string }) {
  const [medicines, setMedicines] = useState<(StoreMedicine & { medicine: { name: string } })[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    async function fetchExpiring() {
      const ninetyDaysFromNow = format(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');

      const { data } = await supabase
        .from('store_medicines')
        .select('*, medicine:medicines(name)')
        .eq('tenant_id', tenantId)
        .lte('expiry_date', ninetyDaysFromNow)
        .gt('stock_qty', 0)
        .order('expiry_date', { ascending: true });

      if (data) setMedicines(data as any);
      setLoading(false);
    }

    if (tenantId) fetchExpiring();
  }, [tenantId, supabase]);

  const now = new Date();
  const expired = medicines.filter(m => m.expiry_date && new Date(m.expiry_date) < now);
  const next7Days = medicines.filter(m => m.expiry_date && differenceInDays(new Date(m.expiry_date), now) <= 7 && differenceInDays(new Date(m.expiry_date), now) >= 0);
  const next30Days = medicines.filter(m => m.expiry_date && differenceInDays(new Date(m.expiry_date), now) <= 30 && differenceInDays(new Date(m.expiry_date), now) > 7);
  const next90Days = medicines.filter(m => m.expiry_date && differenceInDays(new Date(m.expiry_date), now) <= 90 && differenceInDays(new Date(m.expiry_date), now) > 30);

  const groups = [
    { id: 'expired', label: 'Expired', count: expired.length, items: expired, color: 'text-rose-600', bg: 'bg-rose-50' },
    { id: '7days', label: '7 Days', count: next7Days.length, items: next7Days, color: 'text-orange-600', bg: 'bg-orange-50' },
    { id: '30days', label: '30 Days', count: next30Days.length, items: next30Days, color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: '90days', label: '90 Days', count: next90Days.length, items: next90Days, color: 'text-slate-500', bg: 'bg-slate-50' },
  ];

  if (loading) return <div className="h-[400px] w-full bg-slate-100 animate-pulse rounded-xl"></div>;

  return (
    <Card className="shadow-sm overflow-hidden">
      <CardHeader className="border-b bg-slate-50/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Expiry Alerts
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/inventory?status=expiring">View All</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="expired" className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-12 px-2 gap-2">
            {groups.map(group => (
              <TabsTrigger
                key={group.id}
                value={group.id}
                className="rounded-md data-[state=active]:bg-slate-100 data-[state=active]:shadow-none"
              >
                {group.label}
                <Badge variant={group.count > 0 ? "destructive" : "secondary"} className="ml-2 px-1.5 py-0 h-4 min-w-4 justify-center">
                  {group.count}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
          {groups.map(group => (
            <TabsContent key={group.id} value={group.id} className="m-0 focus-visible:ring-0">
              <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
                {group.items.length > 0 ? (
                  group.items.map(item => (
                    <div key={item.id} className="p-4 hover:bg-slate-50/50 flex items-center justify-between group transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", group.bg)}>
                          <AlertCircle className={cn("w-4 h-4", group.color)} />
                        </div>
                        <div>
                          <p className="text-sm font-bold truncate max-w-[150px]">{item.medicine?.name}</p>
                          <p className="text-[10px] text-slate-500 font-medium italic">
                            Stock: {item.stock_qty} units • Exp: {item.expiry_date}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" asChild>
                        <Link href={`/dashboard/inventory/${item.id}`}>
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-center px-4">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-3 opacity-20" />
                    <p className="text-sm font-semibold text-slate-900">All Clear!</p>
                    <p className="text-xs text-slate-500">No medicines expiring in this period.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
