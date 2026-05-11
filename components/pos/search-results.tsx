'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePOSStore } from '@/stores/pos-store';
import { MedicineSearchResult } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { StockBadge } from '@/components/inventory/stock-badge';
import { formatPKR, cn } from '@/lib/utils';
import { Package, Search, ShoppingCart } from 'lucide-react';

export function SearchResults() {
  const [results, setResults] = useState<MedicineSearchResult[]>([]);
  const [query, setQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [flashId, setFlashId] = useState<string | null>(null);
  const addItem = usePOSStore(state => state.addItem);
  const resultsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const handleResults = (e: any) => {
      setResults(e.detail.results);
      setQuery(e.detail.query);
      setFocusedIndex(-1);
    };
    const handleSubmit = () => {
      if (results.length > 0) handleAdd(results[0]);
    };
    const handleFocus = () => {
      if (results.length > 0) setFocusedIndex(0);
    };

    window.addEventListener('pos-search-results', handleResults as any);
    window.addEventListener('pos-search-submit', handleSubmit);
    window.addEventListener('pos-search-focus-results', handleFocus);

    return () => {
      window.removeEventListener('pos-search-results', handleResults as any);
      window.removeEventListener('pos-search-submit', handleSubmit);
      window.removeEventListener('pos-search-focus-results', handleFocus);
    };
  }, [results, handleAdd]);

  useEffect(() => {
    if (focusedIndex >= 0) resultsRef.current[focusedIndex]?.focus();
  }, [focusedIndex]);

  const handleAdd = useCallback((med: MedicineSearchResult) => {
    if (med.stock_qty <= 0) return;
    addItem(med);
    setFlashId(med.id);
    setTimeout(() => setFlashId(null), 300);
    window.dispatchEvent(new CustomEvent('focus-pos-search'));
  }, [addItem]);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowDown' && index < results.length - 1) {
      e.preventDefault();
      setFocusedIndex(index + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (index === 0) {
        setFocusedIndex(-1);
        window.dispatchEvent(new CustomEvent('focus-pos-search'));
      } else {
        setFocusedIndex(index - 1);
      }
    } else if (e.key === 'Enter') {
      handleAdd(results[index]);
    }
  };

  if (!query) {
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-30 text-center">
        <ShoppingCart className="w-20 h-20 mb-4" />
        <h3 className="text-xl font-bold uppercase tracking-widest">Ready for Sale</h3>
        <p className="text-sm">Scan barcode or search for items</p>
      </div>
    );
  }

  if (results.length === 0 && query.length >= 2) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-2xl bg-slate-50/50">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
          <Search className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">No matches found</h3>
        <p className="text-sm text-slate-500 max-w-[240px] mt-1">
          We couldn&apos;t find "{query}" in your store inventory.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 pb-8">
        {results.slice(0, 8).map((med: MedicineSearchResult, i) => (
        <Card
          key={med.id}
            ref={el => { resultsRef.current[i] = el; }}
          tabIndex={0}
          className={cn(
            "transition-all cursor-pointer border-slate-200 dark:border-slate-800 focus:outline-none ring-offset-2",
            focusedIndex === i ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "hover:border-primary/30",
            flashId === med.id && "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20",
            med.is_controlled && "border-l-4 border-l-amber-500",
            med.stock_qty <= 0 && "opacity-60 grayscale cursor-not-allowed"
          )}
          onClick={() => handleAdd(med)}
          onKeyDown={(e) => handleKeyDown(e, i)}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                med.is_controlled ? "bg-amber-50 text-amber-600" : "bg-slate-50 text-slate-400"
              )}>
                <Package className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-slate-100">{med.name}</span>
                  {med.is_controlled && (
                    <span className="text-[9px] font-black uppercase text-amber-600 bg-amber-50 px-1 rounded border border-amber-200">Controlled</span>
                  )}
                </div>
                <span className="text-xs text-slate-500 truncate max-w-[300px]">{med.generic_name} • {med.company}</span>
              </div>
            </div>

            <div className="text-right flex items-center gap-6">
              <div className="flex flex-col items-end">
                <span className="text-xl font-black text-primary">{formatPKR(med.sale_price)}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-tighter">Per {med.unit}</span>
              </div>
              <StockBadge stockQty={med.stock_qty} reorderLevel={med.reorder_level} expiryDate={med.expiry_date} />
            </div>
          </CardContent>
        </Card>
      ))}
      {results.length > 8 && (
        <p className="text-center text-xs text-slate-400 mt-2 font-medium">Showing top 8 results. Try a more specific search.</p>
      )}
    </div>
  );
}
