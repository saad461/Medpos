'use client';

import { useState, useEffect } from 'react';
import { usePOSStore } from '@/stores/pos-store';
import {
  Users,
  Search,
  Plus,
  X,
  UserCircle,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export function CustomerSelect() {
  const { customerId, customerName, setCustomer } = usePOSStore();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', cnic: '' });

  useEffect(() => {
    const fetchCustomers = async () => {
      if (search.length < 2) {
        setResults([]);
        return;
      }
      const res = await fetch(`/api/customers?search=${search}&limit=5`);
      const data = await res.json();
      setResults(data.data || []);
    };
    const timer = setTimeout(fetchCustomers, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleAddCustomer = async () => {
    if (!newCustomer.name) return;
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCustomer),
      });
      const data = await res.json();
      if (res.ok) {
        setCustomer(data.id, data.name);
        setShowAddModal(false);
        setNewCustomer({ name: '', phone: '', cnic: '' });
        toast.success('Customer added and attached');
      }
     } catch {
      toast.error('Failed to add customer');
    }
  };

  if (customerId) {
    return (
      <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <UserCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-none">{customerName}</p>
            <p className="text-[10px] text-slate-500 font-medium mt-1">Customer attached to sale</p>
          </div>
        </div>
        <button
          onClick={() => setCustomer(null, null)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between h-12 bg-white dark:bg-slate-900 border-dashed border-2 hover:border-primary hover:bg-primary/5 transition-all text-slate-500 font-bold group">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 group-hover:text-primary transition-colors" />
              <span>Add customer (optional)</span>
            </div>
            <ChevronDown className="w-4 h-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 p-2 shadow-2xl border-slate-200">
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by name or phone..."
              className="pl-9 h-10 border-none bg-slate-50 focus-visible:ring-0"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>

          <div className="max-h-60 overflow-y-auto py-1">
            {results.map((c) => (
              <DropdownMenuItem key={c.id} className="flex items-center justify-between p-3 rounded-lg cursor-pointer" onClick={() => setCustomer(c.id, c.name)}>
                <div className="flex flex-col">
                  <span className="font-bold text-sm">{c.name}</span>
                  <span className="text-[10px] text-slate-500">{c.phone || 'No phone'}</span>
                </div>
                {c.credit_balance > 0 && (
                  <Badge variant="destructive" className="text-[8px] px-1.5 h-4">Rs. {c.credit_balance} due</Badge>
                )}
              </DropdownMenuItem>
            ))}

            {search.length >= 2 && results.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400 italic">No customers found</div>
            )}

            {search.length < 2 && (
              <div className="py-4 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">Type to search customers</div>
            )}
          </div>

          <div className="pt-2 mt-2 border-t">
            <Button variant="ghost" className="w-full justify-start text-xs font-bold text-primary gap-2 h-10" onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4" />
              Add New Customer
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Quick Add Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input value={newCustomer.name} onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g. Muhammad Ahmed" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input value={newCustomer.phone} onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))} placeholder="03xx-xxxxxxx" />
              </div>
              <div className="space-y-2">
                <Label>CNIC (Optional)</Label>
                <Input value={newCustomer.cnic} onChange={(e) => setNewCustomer(prev => ({ ...prev, cnic: e.target.value }))} placeholder="xxxxx-xxxxxxx-x" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button onClick={handleAddCustomer} disabled={!newCustomer.name}>Save & Attach</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
