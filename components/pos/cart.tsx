'use client';

import { usePOSStore } from '@/stores/pos-store';
import { CartItem } from './cart-item';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function Cart() {
  const { items, clearCart } = usePOSStore();

  if (items.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 py-10 opacity-40">
        <ShoppingCart className="w-16 h-16 mb-4 stroke-[1.5]" />
        <p className="font-bold uppercase tracking-widest text-sm">Cart is empty</p>
        <p className="text-xs">Search for medicines to add</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-900 dark:text-slate-100">Current Sale</h3>
          <Badge className="bg-primary hover:bg-primary h-5 min-w-[20px] justify-center px-1">
            {items.reduce((sum, i) => sum + i.qty, 0)}
          </Badge>
        </div>
        <Button variant="ghost" size="sm" className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 h-8" onClick={clearCart}>
          <Trash2 className="w-3.5 h-3.5 mr-1.5" />
          Clear Cart
        </Button>
      </div>

      <div className="flex-1 space-y-1 divide-y divide-slate-100 dark:divide-slate-800">
        {items.map((item) => (
          <CartItem key={item.store_medicine_id} item={item} />
        ))}
      </div>
    </div>
  );
}
