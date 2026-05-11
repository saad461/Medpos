'use client';

import { usePOSStore } from '@/stores/pos-store';
import { useHeldSalesStore } from '@/stores/held-sales-store';
import { MedicineSearch } from './medicine-search';
import { SearchResults } from './search-results';
import { Cart } from './cart';
import { CartSummary } from './cart-summary';
import { CheckoutPanel } from './checkout-panel';
import { Button } from '@/components/ui/button';
import {
  PauseCircle,
  History,
  RotateCcw,
  Plus,
  User as UserIcon,
  Clock
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useState } from 'react';
import { HoldSaleDrawer } from './hold-sale-drawer';
import { ReturnSaleDialog } from './return-sale-dialog';

export function POSLayout() {
  const { user } = useAuth();
  const { items, clearCart, orderDiscount, orderDiscountType } = usePOSStore();
  const { heldSales, holdCurrentSale } = useHeldSalesStore();
  const [showHeldDrawer, setShowHeldDrawer] = useState(false);
  const [showReturn, setShowReturn] = useState(false);

  const handleNewSale = () => {
    if (items.length > 0) {
      if (confirm('Are you sure you want to clear the current cart?')) {
        clearCart();
      }
    } else {
      clearCart();
    }
  };

  const handleHoldSale = () => {
    if (items.length === 0) return;
    holdCurrentSale('', {
      items,
      customerId: usePOSStore.getState().customerId,
      customerName: usePOSStore.getState().customerName,
      orderDiscount,
      orderDiscountType
    });
    clearCart();
    toast.success('Sale held successfully');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-white dark:bg-slate-950">
      {/* Top Bar */}
      <div className="h-12 border-b flex items-center justify-between px-4 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="font-bold text-sm text-slate-700 dark:text-slate-300">POS Billing</h2>
          <div className="h-4 w-px bg-slate-300"></div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <UserIcon className="w-3 h-3" />
            <span className="font-medium">{user?.name}</span>
            <span className="opacity-50">|</span>
            <Clock className="w-3 h-3" />
            <span>Shift started {format(new Date(), 'h:mm a')}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 gap-2 text-xs" onClick={handleHoldSale} disabled={items.length === 0}>
            <PauseCircle className="w-3.5 h-3.5" />
            Hold Sale
          </Button>
          <Button variant="ghost" size="sm" className="h-8 gap-2 text-xs relative" onClick={() => setShowHeldDrawer(true)}>
            <History className="w-3.5 h-3.5" />
            Held Sales
            {heldSales.length > 0 && (
              <Badge className="ml-1 px-1 min-w-[18px] h-4 flex items-center justify-center bg-primary text-[10px]">
                {heldSales.length}
              </Badge>
            )}
          </Button>
          <Button variant="ghost" size="sm" className="h-8 gap-2 text-xs" onClick={() => setShowReturn(true)}>
            <RotateCcw className="w-3.5 h-3.5" />
            Returns
          </Button>
          <div className="h-4 w-px bg-slate-300 mx-1"></div>
          <Button variant="default" size="sm" className="h-8 gap-2 text-xs bg-sky-600 hover:bg-sky-700" onClick={handleNewSale}>
            <Plus className="w-3.5 h-3.5" />
            New Sale (F1)
          </Button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        <div className="w-[60%] flex flex-col border-r overflow-hidden relative">
          <div className="p-4 shrink-0 bg-white dark:bg-slate-950 z-10">
            <MedicineSearch />
          </div>
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <SearchResults />
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-[40%] flex flex-col bg-slate-50/30 dark:bg-slate-900/10 overflow-hidden relative">
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <Cart />
          </div>
          <div className="shrink-0">
            <CartSummary />
            <CheckoutPanel />
          </div>
        </div>
      </div>

      <HoldSaleDrawer open={showHeldDrawer} onOpenChange={setShowHeldDrawer} />
      <ReturnSaleDialog open={showReturn} onOpenChange={setShowReturn} />
    </div>
  );
}
