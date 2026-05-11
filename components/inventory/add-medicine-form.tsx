'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Search,
  Plus,
  Check,
  Package,
  Info,
  IndianRupee,
  Calendar,
  Barcode,
  MapPin,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MEDICINE_CATEGORIES, MEDICINE_UNITS } from '@/lib/medicines/categories';
import { useDebounce } from '@/hooks/use-debounce';
import { formatPKR, cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Medicine } from '@/types';

const storeMedicineSchema = z.object({
  sale_price: z.coerce.number().positive('Sale price must be positive'),
  purchase_price: z.coerce.number().positive('Purchase price must be positive').optional(),
  stock_qty: z.coerce.number().min(0, 'Stock cannot be negative'),
  reorder_level: z.coerce.number().min(0).default(10),
  expiry_date: z.string().optional(),
  barcode: z.string().optional(),
  location: z.string().optional(),
});

const customMedicineSchema = storeMedicineSchema.extend({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  generic_name: z.string().optional(),
  category: z.string(),
  company: z.string().optional(),
  unit: z.string(),
  is_controlled: z.boolean().default(false),
  submit_global: z.boolean().default(false),
});

export function AddMedicineForm({ mode }: { mode: 'search' | 'custom' }) {
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Medicine[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm({
    resolver: zodResolver(mode === 'search' ? storeMedicineSchema : customMedicineSchema),
    defaultValues: {
      stock_qty: 0,
      reorder_level: 10,
      is_controlled: false,
      submit_global: false,
    }
  });

  const salePrice = watch('sale_price');
  const purchasePrice = watch('purchase_price');

  // Calculate profit margin live
  const calculateMargin = () => {
    if (!salePrice || !purchasePrice) return null;
    const margin = ((salePrice - purchasePrice) / purchasePrice) * 100;
    const profit = salePrice - purchasePrice;
    return { margin: margin.toFixed(1), profit: profit.toFixed(2) };
  };

  const marginData = calculateMargin();

  useEffect(() => {
    async function performSearch() {
      if (debouncedSearch.length < 2) {
        setSearchResults([]);
        return;
      }
      setLoadingSearch(true);
      try {
        const res = await fetch(`/api/medicines/search?q=${debouncedSearch}&mode=global`);
        const json = await res.json();
        setSearchResults(json.results || []);
      } catch (error) {
        console.error('Search failed', error);
      } finally {
        setLoadingSearch(false);
      }
    }
    if (mode === 'search') performSearch();
  }, [debouncedSearch, mode]);

   const onSubmit = async (values: z.infer<typeof storeMedicineSchema> | z.infer<typeof customMedicineSchema>) => {
    setSubmitting(true);
    try {
       let result: { id?: string; error?: string };
      if (mode === 'search' && selectedMedicine) {
        const res = await fetch('/api/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ ...values, medicine_id: selectedMedicine.id }),
        });
         result = await res.json() as { id?: string; error?: string };
      } else {
         const customValues = values as z.infer<typeof customMedicineSchema>;
        // First create private medicine
        const medRes = await fetch('/api/medicines', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
             name: customValues.name,
             generic_name: customValues.generic_name,
             category: customValues.category,
             company: customValues.company,
             unit: customValues.unit,
             is_controlled: customValues.is_controlled,
             scope: customValues.submit_global ? 'pending_review' : 'private'
          }),
        });
         const medJson = await medRes.json() as { id: string, error?: string };
        if (medRes.ok) {
          // Then add to inventory
          const res = await fetch('/api/inventory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              medicine_id: medJson.id,
              sale_price: values.sale_price,
              purchase_price: values.purchase_price,
              stock_qty: values.stock_qty,
              reorder_level: values.reorder_level,
              expiry_date: values.expiry_date,
              barcode: values.barcode,
              location: values.location,
            }),
          });
           result = await res.json() as { id?: string; error?: string };
        } else {
           throw new Error(medJson.error || 'Failed to create medicine');
        }
      }

      if (result.error) {
        toast.error(result.error);
      } else {
         toast.success(`${mode === 'search' ? selectedMedicine?.name : values.name} added to inventory!`);
        reset();
        setSelectedMedicine(null);
        setSearch('');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (mode === 'search') {
    return (
      <div className="space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Search 25,000+ Pakistan medicines..."
            className="pl-12 h-14 text-lg bg-white shadow-sm focus-visible:ring-primary/20 border-slate-200"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          {loadingSearch && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            </div>
          )}
        </div>

        {searchResults.length > 0 && !selectedMedicine && (
          <div className="grid grid-cols-1 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            {searchResults.map((med: any) => (
              <Card key={med.id} className="hover:border-primary cursor-pointer transition-colors shadow-sm" onClick={() => !med.is_in_store && setSelectedMedicine(med)}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{med.name}</p>
                      <p className="text-xs text-slate-500">{med.generic_name} • {med.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {med.drap_mrp && <span className="text-sm font-semibold text-slate-600">{formatPKR(med.drap_mrp)}</span>}
                    {med.is_in_store ? (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        <Check className="w-3 h-3 mr-1" />
                        In Inventory
                      </Badge>
                    ) : (
                      <Button size="sm">Add to Inventory</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedMedicine && (
          <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
            <Card className="border-primary shadow-lg ring-1 ring-primary/10">
              <CardHeader className="bg-primary/5 pb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white">
                      <Package className="w-7 h-7" />
                    </div>
                    <div>
                      <CardTitle>{selectedMedicine.name}</CardTitle>
                      <CardDescription>{selectedMedicine.generic_name} • {selectedMedicine.company}</CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedMedicine(null)}>Change Medicine</Button>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="sale_price" className="text-xs font-bold uppercase tracking-wider">Sale Price (PKR) *</Label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input id="sale_price" type="number" step="0.01" className="pl-9" placeholder="0.00" {...register('sale_price')} />
                      </div>
                      {selectedMedicine.drap_mrp && (
                        <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-1 italic">
                          <Info className="w-3 h-3" />
                          DRAP MRP: {formatPKR(selectedMedicine.drap_mrp)} (reference only)
                        </p>
                      )}
                      {errors.sale_price && <p className="text-rose-500 text-xs mt-1">{errors.sale_price.message as string}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="purchase_price" className="text-xs font-bold uppercase tracking-wider">Purchase Price (PKR)</Label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input id="purchase_price" type="number" step="0.01" className="pl-9" placeholder="0.00" {...register('purchase_price')} />
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 italic">What you paid the supplier</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="stock_qty" className="text-xs font-bold uppercase tracking-wider">Stock Quantity *</Label>
                      <Input id="stock_qty" type="number" placeholder="0" {...register('stock_qty')} />
                      {errors.stock_qty && <p className="text-rose-500 text-xs mt-1">{errors.stock_qty.message as string}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reorder_level" className="text-xs font-bold uppercase tracking-wider">Reorder Level</Label>
                      <Input id="reorder_level" type="number" placeholder="10" {...register('reorder_level')} />
                      <p className="text-[10px] text-slate-500 mt-1 italic">Alert when stock falls below this number</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="expiry_date" className="text-xs font-bold uppercase tracking-wider">Expiry Date</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input id="expiry_date" type="date" className="pl-9" {...register('expiry_date')} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="barcode" className="text-xs font-bold uppercase tracking-wider">Barcode</Label>
                      <div className="relative">
                        <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input id="barcode" placeholder="Scan or type barcode" className="pl-9" {...register('barcode')} />
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="location" className="text-xs font-bold uppercase tracking-wider">Storage Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input id="location" placeholder="e.g. Shelf A, Row 3" className="pl-9" {...register('location')} />
                      </div>
                    </div>
                  </div>

                  {marginData && (
                    <div className={cn(
                      "p-4 rounded-xl border flex items-center justify-between transition-all",
                      Number(marginData.margin) > 20 ? "bg-emerald-50 border-emerald-100" : Number(marginData.margin) > 10 ? "bg-amber-50 border-amber-100" : "bg-rose-50 border-rose-100"
                    )}>
                      <div className="flex items-center gap-3">
                        <TrendingUp className={cn("w-5 h-5", Number(marginData.margin) > 20 ? "text-emerald-600" : "text-amber-600")} />
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase">Estimated Profit Margin</p>
                          <p className={cn("text-lg font-black", Number(marginData.margin) > 20 ? "text-emerald-700" : "text-amber-700")}>
                            {marginData.margin}% — {formatPKR(Number(marginData.profit))} per unit
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 pt-4 border-t border-slate-100">
                    <Button type="submit" size="lg" className="flex-1 font-bold h-12" disabled={submitting}>
                      {submitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
                      Add to My Inventory
                    </Button>
                    <Button type="button" variant="outline" size="lg" className="px-8 font-semibold h-12" onClick={() => setSelectedMedicine(null)}>Cancel</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  // TAB 2: CUSTOM MEDICINE
  return (
     <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <Card className="shadow-sm border-slate-200 overflow-hidden">
        <CardHeader className="bg-slate-50/50">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Medicine Master Data</CardTitle>
          <CardDescription>Enter details for a medicine not found in the DRAP database.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider">Medicine Name *</Label>
              <Input id="name" placeholder="e.g. MyCustom Medicine" {...register('name')} />
              {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name.message as string}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="generic_name" className="text-xs font-bold uppercase tracking-wider">Generic Name / Composition</Label>
              <Input id="generic_name" placeholder="e.g. Paracetamol + Caffeine" {...register('generic_name')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category" className="text-xs font-bold uppercase tracking-wider">Category *</Label>
              <Select onValueChange={(v) => setValue('category', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="max-h-80 overflow-y-auto">
                  {MEDICINE_CATEGORIES.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-rose-500 text-xs mt-1">{errors.category.message as string}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="company" className="text-xs font-bold uppercase tracking-wider">Company / Manufacturer</Label>
              <Input id="company" placeholder="e.g. Local Pharma" {...register('company')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit" className="text-xs font-bold uppercase tracking-wider">Unit / Form *</Label>
              <Select onValueChange={(v) => setValue('unit', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent className="max-h-80 overflow-y-auto">
                  {MEDICINE_UNITS.map(unit => (
                    <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.unit && <p className="text-rose-500 text-xs mt-1">{errors.unit.message as string}</p>}
            </div>
            <div className="flex items-center space-x-2 pt-8">
              <Checkbox id="is_controlled" onCheckedChange={(c) => setValue('is_controlled', !!c)} />
              <Label htmlFor="is_controlled" className="text-sm font-semibold cursor-pointer">Requires Prescription (Controlled Substance)</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-200 overflow-hidden">
        <CardHeader className="bg-slate-50/50">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Store Specific Details</CardTitle>
          <CardDescription>Your pricing and stock levels.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="sale_price" className="text-xs font-bold uppercase tracking-wider">Sale Price (PKR) *</Label>
              <Input id="sale_price" type="number" step="0.01" {...register('sale_price')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchase_price" className="text-xs font-bold uppercase tracking-wider">Purchase Price (PKR)</Label>
              <Input id="purchase_price" type="number" step="0.01" {...register('purchase_price')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock_qty" className="text-xs font-bold uppercase tracking-wider">Initial Stock *</Label>
              <Input id="stock_qty" type="number" {...register('stock_qty')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reorder_level" className="text-xs font-bold uppercase tracking-wider">Reorder Level</Label>
              <Input id="reorder_level" type="number" {...register('reorder_level')} />
            </div>
          </div>

          <div className="flex items-center space-x-2 p-4 bg-primary/5 rounded-xl border border-primary/10">
            <Checkbox id="submit_global" onCheckedChange={(c) => setValue('submit_global', !!c)} />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="submit_global" className="text-sm font-bold cursor-pointer text-primary">Submit to Global Database</Label>
              <p className="text-[10px] text-slate-500">Help other pharmacies by contributing this medicine to our shared database.</p>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full font-bold h-12 shadow-md" disabled={submitting}>
            {submitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
            Add Custom Medicine
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
