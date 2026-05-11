import { Card, CardContent } from '@/components/ui/card';
import { Package, IndianRupee, AlertTriangle, Clock } from 'lucide-react';
import { formatPKR } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface StatsProps {
  total: number;
  value: number;
  lowStock: number;
  expiring: number;
}

export function MedicineStatsBar({ total, value, lowStock, expiring }: StatsProps) {
  const stats = [
    { label: 'Total Medicines', value: total, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Stock Value', value: formatPKR(value), icon: IndianRupee, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Low Stock', value: lowStock, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Expiring Soon', value: expiring, icon: Clock, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <Card key={i} className="border-none shadow-sm overflow-hidden">
          <CardContent className="p-4 flex items-center gap-4">
            <div className={cn("p-3 rounded-xl", stat.bg)}>
              <stat.icon className={cn("w-5 h-5", stat.color)} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
