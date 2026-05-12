'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, ArrowUpDown, Eye, Trash2, ExternalLink, AlertCircle } from 'lucide-react';
import { StockBadge } from './stock-badge';
import { formatPKR, cn } from '@/lib/utils';
import { differenceInDays, format } from 'date-fns';
import { MEDICINE_CATEGORIES } from '@/lib/medicines/categories';
import { Badge } from '@/components/ui/badge';
import { StockAdjustDialog } from './stock-adjust-dialog';
import { SubmitGlobalDialog } from './submit-global-dialog';
import { StoreMedicine, Medicine } from '@/types';

type StoreMedicineWithMedicine = StoreMedicine & { medicine: Medicine };

export function MedicineTable({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const [data, setData] = useState<StoreMedicineWithMedicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<StoreMedicineWithMedicine | null>(null);
  const [showAdjust, setShowAdjust] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
       const filteredParams = Object.fromEntries(
         Object.entries(searchParams).filter(([, v]) => v !== undefined)
       ) as Record<string, string>;
       const queryParams = new URLSearchParams(filteredParams);
      const res = await fetch(`/api/inventory?${queryParams.toString()}`);
      const json = await res.json();
      if (json.data) setData(json.data);
      setLoading(false);
    }
    fetchData();
  }, [searchParams]);

  const getCategoryLabel = (id: string) => {
    return MEDICINE_CATEGORIES.find(c => c.id === id)?.label || id;
  };

  const getExpiryColor = (dateStr?: string) => {
    if (!dateStr) return 'text-slate-400';
    const date = new Date(dateStr);
    const today = new Date();
    const days = differenceInDays(date, today);
    if (days < 0) return 'text-rose-600 font-bold';
    if (days < 30) return 'text-rose-600 font-bold';
    if (days < 90) return 'text-amber-600';
    return 'text-slate-500';
  };

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 w-full bg-slate-50 animate-pulse rounded-md"></div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <Eye className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">No medicines found</h3>
        <p className="text-slate-500 max-w-xs mt-1">
          Try adjusting your search or filters, or add a new medicine to your inventory.
        </p>
        <Button variant="outline" className="mt-6" onClick={() => router.push('/dashboard/inventory')}>
          Clear all filters
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
          <TableRow>
            <TableHead className="w-[300px]">Medicine Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Profit</TableHead>
            <TableHead>Expiry</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => {
            const profit = item.purchase_price
              ? (((item.sale_price - item.purchase_price) / item.purchase_price) * 100).toFixed(1)
              : null;

            return (
              <TableRow
                key={item.id}
                className="cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                onClick={() => router.push(`/dashboard/inventory/${item.id}`)}
              >
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{item.medicine.name}</span>
                    <span className="text-xs text-slate-500 line-clamp-1">{item.medicine.generic_name}</span>
                    {item.medicine.is_controlled && (
                      <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded uppercase dark:bg-rose-900/20 w-fit">
                        <AlertCircle className="w-2.5 h-2.5" />
                        Controlled
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-medium bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize">
                    {getCategoryLabel(item.medicine.category)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <span className="font-bold">{item.stock_qty}</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-tighter">{item.medicine.unit}s</span>
                    </div>
                    <StockBadge stockQty={item.stock_qty} reorderLevel={item.reorder_level} expiryDate={item.expiry_date} />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold">{formatPKR(item.sale_price)}</span>
                    {item.medicine.drap_mrp && (
                      <span className={cn(
                        "text-[10px] flex items-center gap-1",
                        item.sale_price > item.medicine.drap_mrp ? "text-amber-600 font-bold" : "text-slate-400"
                      )}>
                        DRAP: {formatPKR(item.medicine.drap_mrp)}
                        {item.sale_price > item.medicine.drap_mrp && <AlertCircle className="w-2.5 h-2.5" />}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {profit ? (
                    <span className={cn(
                      "text-xs font-bold",
                      Number(profit) > 20 ? "text-emerald-600" : Number(profit) > 10 ? "text-amber-600" : "text-rose-600"
                    )}>
                      {profit}%
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">N/A</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className={cn("text-xs font-medium", getExpiryColor(item.expiry_date))}>
                    {item.expiry_date ? format(new Date(item.expiry_date), 'MMM d, yyyy') : 'N/A'}
                  </span>
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => router.push(`/dashboard/inventory/${item.id}/edit`)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Medicine
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setSelectedItem(item); setShowAdjust(true); }}>
                        <ArrowUpDown className="mr-2 h-4 w-4" />
                        Adjust Stock
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => router.push(`/dashboard/inventory/${item.id}`)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      {item.medicine.scope === 'private' && (
                        <DropdownMenuItem className="text-primary" onClick={() => { setSelectedItem(item); setShowSubmit(true); }}>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Submit to Global
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-rose-600 focus:text-rose-600 focus:bg-rose-50">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {selectedItem && (
        <>
          <StockAdjustDialog
            open={showAdjust}
            onOpenChange={setShowAdjust}
            item={selectedItem}
            onSuccess={() => router.refresh()}
          />
          <SubmitGlobalDialog
            open={showSubmit}
            onOpenChange={setShowSubmit}
            medicineId={selectedItem.medicine_id}
            medicineName={selectedItem.medicine.name}
          />
        </>
      )}
    </div>
  );
}
