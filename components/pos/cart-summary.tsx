'use client';

import { usePOSStore } from '@/stores/pos-store';
import { calculateOrderTotals } from '@/lib/pos/calculations';
import { formatPKR } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { CustomerSelect } from './customer-select';

export function CartSummary() {
  const { items, orderDiscount, orderDiscountType, setOrderDiscount } = usePOSStore();
  const [discountVal, setDiscountVal] = useState(orderDiscount.toString());
  const [discountType, setDiscountType] = useState<'flat' | 'percent'>(orderDiscountType);

  const gstRate = 0; // Should come from store settings, hardcoded for now
  const totals = calculateOrderTotals(items, orderDiscount, orderDiscountType, gstRate);

  const handleApplyDiscount = () => {
    setOrderDiscount(Number(discountVal) || 0, discountType);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 space-y-4 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-medium text-slate-500">
          <span>Subtotal</span>
          <span className="tabular-nums">{formatPKR(totals.subtotal)}</span>
        </div>

        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-500">Order Discount</span>
            <Popover>
              <PopoverTrigger asChild>
                <button className="text-primary hover:underline font-bold">
                  {orderDiscount > 0 ? 'Edit' : 'Add'}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-4 shadow-xl border-slate-200">
                <div className="space-y-4">
                  <h5 className="font-bold text-xs uppercase tracking-widest text-slate-500">Global Order Discount</h5>
                  <div className="space-y-3">
                    <ToggleGroup
                      type="single"
                      value={discountType}
                      onValueChange={(v) => v && setDiscountType(v as any)}
                      className="justify-start bg-slate-50 p-1 rounded-lg border border-slate-200"
                    >
                      <ToggleGroupItem value="flat" className="text-[10px] h-7 px-3 data-[state=on]:bg-white data-[state=on]:shadow-sm">PKR</ToggleGroupItem>
                      <ToggleGroupItem value="percent" className="text-[10px] h-7 px-3 data-[state=on]:bg-white data-[state=on]:shadow-sm">%</ToggleGroupItem>
                    </ToggleGroup>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="0.00"
                        className="h-9 text-sm"
                        value={discountVal}
                        onChange={(e) => setDiscountVal(e.target.value)}
                      />
                      <Button size="sm" className="h-9 font-bold px-4" onClick={handleApplyDiscount}>Apply</Button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          {orderDiscount > 0 ? (
            <span className="text-rose-600 font-bold tabular-nums">- {formatPKR(totals.orderDiscountAmount)}</span>
          ) : (
            <span className="text-slate-300">Rs. 0.00</span>
          )}
        </div>

        {gstRate > 0 && (
          <div className="flex justify-between text-xs font-medium text-slate-500">
            <span>GST ({gstRate}%)</span>
            <span className="tabular-nums">{formatPKR(totals.taxAmount)}</span>
          </div>
        )}

        <div className="pt-2 border-t flex justify-between items-center">
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Total Amount</span>
          <span className="text-2xl font-black text-primary tabular-nums">{formatPKR(totals.total)}</span>
        </div>
      </div>

      <div className="pt-2">
        <CustomerSelect />
      </div>
    </div>
  );
}
