'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet';
import { useHeldSalesStore } from '@/stores/held-sales-store';
import { usePOSStore } from '@/stores/pos-store';
import { Button } from '@/components/ui/button';
import { Clock, User, Trash2, Play, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { formatPKR } from '@/lib/utils';
import { toast } from 'sonner';
import { calculateOrderTotals } from '@/lib/pos/calculations';

export function HoldSaleDrawer({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { heldSales, retrieveSale, deleteHeldSale } = useHeldSalesStore();
  const posState = usePOSStore();

  const handleResume = (id: string) => {
    if (posState.items.length > 0) {
      if (!confirm('This will replace your current cart. Continue?')) return;
    }

    const sale = retrieveSale(id);
    if (sale) {
      posState.clearCart();
      sale.items.forEach(item => {
        // Since store.items is an array and doesn't have an 'addCartItem' action for raw objects,
        // we'll just set the state directly or use the store actions
      });

      // Update store state with held sale data
      usePOSStore.setState({
        items: sale.items,
        customerId: sale.customerId,
        customerName: sale.customerName,
        orderDiscount: sale.orderDiscount,
        orderDiscountType: sale.orderDiscountType
      });

      onOpenChange(false);
      toast.success('Sale resumed');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="p-6 border-b bg-slate-50/50">
          <SheetTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Held Sales
          </SheetTitle>
          <SheetDescription>
            Resume suspended transactions or delete ones that are no longer needed.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {heldSales.length > 0 ? (
            heldSales.map((sale) => {
              const totals = calculateOrderTotals(sale.items, sale.orderDiscount, sale.orderDiscountType, 0);
              return (
                <div key={sale.id} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-primary/50 transition-all shadow-sm group">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-slate-900">{sale.label || 'Unnamed Sale'}</h4>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        Held {formatDistanceToNow(new Date(sale.heldAt))} ago
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-primary">{formatPKR(totals.total)}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{sale.items.length} Items</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded-full text-[10px] font-bold text-slate-600">
                      <User className="w-3 h-3" />
                      {sale.customerName || 'Walk-in'}
                    </div>
                  </div>

                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" className="flex-1 font-bold h-9 bg-primary" onClick={() => handleResume(sale.id)}>
                      <Play className="w-3.5 h-3.5 mr-1.5" />
                      Resume
                    </Button>
                    <Button variant="ghost" size="sm" className="h-9 px-3 text-rose-500 hover:text-rose-600 hover:bg-rose-50" onClick={() => deleteHeldSale(sale.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-20 text-center opacity-30">
              <AlertCircle className="w-12 h-12 mb-4" />
              <p className="font-bold uppercase tracking-widest text-xs">No Held Sales</p>
            </div>
          )}
        </div>

        <SheetFooter className="p-6 border-t bg-slate-50/50">
          <Button variant="outline" className="w-full font-bold h-11" onClick={() => onOpenChange(false)}>
            Close Drawer
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
