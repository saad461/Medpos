'use client';

import { CartItem as CartItemType, usePOSStore } from '@/stores/pos-store';
import { Minus, Plus, X, Tag, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatPKR, cn } from '@/lib/utils';
import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export function CartItem({ item }: { item: CartItemType }) {
  const { updateQty, removeItem, updateItemDiscount } = usePOSStore();
  const [discountVal, setDiscountVal] = useState(item.item_discount.toString());
  const [discountType, setDiscountType] = useState<'flat' | 'percent'>(item.item_discount_type);

  const handleApplyDiscount = () => {
    updateItemDiscount(item.store_medicine_id, Number(discountVal) || 0, discountType);
  };

  return (
    <div className="py-4 flex flex-col gap-2 group transition-colors hover:bg-slate-50/50 -mx-4 px-4 border-b border-slate-100 last:border-0 dark:border-slate-800 dark:hover:bg-slate-900/50">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">{item.name}</h4>
            {item.is_controlled && (
              <span className="text-[8px] font-black uppercase text-amber-600 bg-amber-50 px-1 rounded border border-amber-200">Controlled</span>
            )}
          </div>
          <p className="text-[10px] text-slate-500 font-medium">{formatPKR(item.unit_price)} each</p>
          {item.is_controlled && (
            <p className="text-[9px] text-amber-600 flex items-center gap-1 mt-0.5 font-bold">
              <AlertCircle className="w-2.5 h-2.5" /> Prescription Required
            </p>
          )}
        </div>

        <div className="text-right flex flex-col items-end">
          <p className="font-black text-sm text-slate-900 dark:text-slate-100">{formatPKR(item.subtotal)}</p>
          {item.item_discount > 0 && (
            <p className="text-[10px] text-rose-600 font-bold">
              - {item.item_discount_type === 'flat' ? formatPKR(item.item_discount) : `${item.item_discount}%`}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
            onClick={() => updateQty(item.store_medicine_id, item.qty - 1)}
          >
            <Minus className="w-3 h-3" />
          </Button>
          <Input
            className="h-7 w-12 text-center border-0 focus-visible:ring-0 text-xs font-bold p-0 tabular-nums"
            type="number"
            value={item.qty}
            onChange={(e) => updateQty(item.store_medicine_id, Number(e.target.value))}
            onFocus={(e) => e.target.select()}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
            onClick={() => updateQty(item.store_medicine_id, item.qty + 1)}
            disabled={item.qty >= item.stock_qty}
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className={cn("h-7 px-2 text-[10px] font-bold uppercase tracking-tight gap-1", item.item_discount > 0 ? "text-rose-600 bg-rose-50 hover:bg-rose-100" : "text-slate-400")}>
                <Tag className="w-3 h-3" />
                {item.item_discount > 0 ? 'Discounted' : 'Discount'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4 shadow-xl border-slate-200">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-xs uppercase tracking-widest text-slate-500">Apply Item Discount</h5>
                  <Badge variant="outline" className="text-[10px] font-bold">Max 10%</Badge>
                </div>
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
                      className="h-9"
                      value={discountVal}
                      onChange={(e) => setDiscountVal(e.target.value)}
                    />
                    <Button size="sm" className="h-9 font-bold px-4" onClick={handleApplyDiscount}>Apply</Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-300 hover:text-rose-600 hover:bg-rose-50"
            onClick={() => removeItem(item.store_medicine_id)}
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

import { Badge } from '@/components/ui/badge';
