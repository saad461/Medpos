import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { History, ArrowLeftRight, User, Calendar, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default async function AdjustmentsLogPage() {
  const supabase = createServerComponentClient<Database>({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  const tenantId = session?.user.app_metadata.tenant_id;

  const { data: adjustments } = await supabase
    .from('stock_adjustments')
    .select('*, store_medicine:store_medicines(medicine:medicines(name)), user:users(name)')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Stock Adjustments Log</h1>
        <p className="text-muted-foreground">Historical record of all manual stock changes in your store.</p>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              <CardTitle className="text-base font-bold uppercase tracking-wider text-slate-500">Adjustment History</CardTitle>
            </div>
            <Badge variant="outline" className="font-bold">{adjustments?.length || 0} Records</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/30">
                <TableRow>
                  <TableHead className="w-[180px]"><div className="flex items-center gap-2"><Calendar className="w-3 h-3" /> Date</div></TableHead>
                  <TableHead><div className="flex items-center gap-2"><Tag className="w-3 h-3" /> Medicine</div></TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-right"><div className="flex items-center justify-end gap-2"><ArrowLeftRight className="w-3 h-3" /> Change</div></TableHead>
                  <TableHead className="text-right">Before/After</TableHead>
                  <TableHead><div className="flex items-center gap-2"><User className="w-3 h-3" /> Performed By</div></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adjustments && adjustments.length > 0 ? (
                  adjustments.map((adj: any) => (
                    <TableRow key={adj.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-medium">{format(new Date(adj.created_at), 'MMM d, h:mm a')}</TableCell>
                      <TableCell className="font-bold text-slate-900">{adj.store_medicine?.medicine?.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize text-[10px] py-0 font-medium">
                          {adj.reason.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className={cn("text-right font-black", adj.qty_change > 0 ? "text-emerald-600" : "text-rose-600")}>
                        {adj.qty_change > 0 ? `+${adj.qty_change}` : adj.qty_change}
                      </TableCell>
                      <TableCell className="text-right text-xs text-slate-500 font-medium">
                        {adj.qty_before} → <span className="text-slate-900 font-bold">{adj.qty_after}</span>
                      </TableCell>
                      <TableCell className="text-slate-600 text-xs font-semibold">{adj.user?.name}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-64 text-center text-slate-400 italic">
                      No stock adjustments have been recorded yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
