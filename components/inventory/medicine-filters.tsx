'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { MEDICINE_CATEGORIES } from '@/lib/medicines/categories';
import { Search, X, Filter } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

export function MedicineFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (debouncedSearch) params.set('search', debouncedSearch);
    else params.delete('search');
    router.push(`?${params.toString()}`);
  }, [debouncedSearch, router, searchParams]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== 'all') params.set(key, value);
    else params.delete(key);
    router.push(`?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearch('');
    router.push('/dashboard/inventory');
  };

  const hasFilters = searchParams.toString().length > 0;

  return (
    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3 bg-slate-50/50 dark:bg-slate-900/50">
      <div className="relative flex-1 min-w-[240px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search by name, generic, or barcode..."
          className="pl-10 h-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Select onValueChange={(v) => updateFilter('category', v)} value={searchParams.get('category') || 'all'}>
        <SelectTrigger className="w-[180px] h-10">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {MEDICINE_CATEGORIES.map(cat => (
            <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select onValueChange={(v) => updateFilter('status', v)} value={searchParams.get('status') || 'all'}>
        <SelectTrigger className="w-[150px] h-10">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="low_stock">Low Stock</SelectItem>
          <SelectItem value="out_of_stock">Out of Stock</SelectItem>
          <SelectItem value="expiring">Expiring Soon</SelectItem>
          <SelectItem value="expired">Expired</SelectItem>
        </SelectContent>
      </Select>

      <Select onValueChange={(v) => updateFilter('sort', v)} value={searchParams.get('sort') || 'name'}>
        <SelectTrigger className="w-[150px] h-10">
          <SelectValue placeholder="Sort By" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="name">Name</SelectItem>
          <SelectItem value="stock_qty">Stock</SelectItem>
          <SelectItem value="sale_price">Price</SelectItem>
          <SelectItem value="expiry_date">Expiry</SelectItem>
          <SelectItem value="updated_at">Updated</SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-slate-500">
          <X className="w-4 h-4 mr-2" />
          Clear
        </Button>
      )}
    </div>
  );
}
