'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
export function MedicineSearch() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Custom event to focus search
  useEffect(() => {
    const handleFocusSearch = () => inputRef.current?.focus();
    window.addEventListener('focus-pos-search', handleFocusSearch);
    inputRef.current?.focus();
    return () => window.removeEventListener('focus-pos-search', handleFocusSearch);
  }, []);

  const handleSearch = async (val: string) => {
    setQuery(val);
    if (val.length < 2) {
      window.dispatchEvent(new CustomEvent('pos-search-results', { detail: { results: [], query: val } }));
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/medicines/search?q=${val}&mode=inventory`);
      const data = await res.json();
      window.dispatchEvent(new CustomEvent('pos-search-results', {
        detail: { results: data.results || [], query: val, strategy: data.search_strategy }
      }));
    } catch (error) {
      console.error('Search failed', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      window.dispatchEvent(new CustomEvent('pos-search-submit'));
    } else if (e.key === 'ArrowDown') {
      window.dispatchEvent(new CustomEvent('pos-search-focus-results'));
    } else if (e.key === 'Escape') {
      setQuery('');
      handleSearch('');
    }
  };

  return (
    <div className="relative group">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
      <Input
        id="medicine-search"
        ref={inputRef}
        placeholder="Search medicines or scan barcode..."
        className="h-14 pl-12 pr-12 text-lg bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 focus-visible:ring-primary/20 rounded-xl"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        onKeyDown={handleKeyDown}
        autoComplete="off"
      />
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        ) : query ? (
          <button onClick={() => { setQuery(''); handleSearch(''); }} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        ) : (
          <Badge variant="outline" className="text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">F2</Badge>
        )}
      </div>
    </div>
  );
}
