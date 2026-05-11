'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Save,
  Trash2,
  AlertTriangle,
  Package,
  IndianRupee,
  Calendar,
  Barcode,
  MapPin,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

const editSchema = z.object({
  sale_price: z.coerce.number().positive(),
  purchase_price: z.coerce.number().positive().optional(),
  stock_qty: z.coerce.number().min(0),
  reorder_level: z.coerce.number().min(0),
  expiry_date: z.string().optional(),
  barcode: z.string().optional(),
  location: z.string().optional(),
  is_active: z.boolean(),
});

export function EditMedicineForm({ item }: { item: any }) {
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(editSchema),
    defaultValues: {
      sale_price: item.sale_price,
      purchase_price: item.purchase_price,
      stock_qty: item.stock_qty,
      reorder_level: item.reorder_level,
      expiry_date: item.expiry_date,
      barcode: item.barcode,
      location: item.location,
      is_active: item.is_active,
    }
  });

  const onSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/inventory/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast.success('Changes saved successfully');
        router.push(`/dashboard/inventory/${item.id}`);
        router.refresh();
      } else {
        toast.error('Failed to save changes');
      }
    } catch (_error) {
      toast.error('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="bg-slate-50/50">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            Store-Specific Details
          </CardTitle>
          <CardDescription>Update your pricing, stock levels, and inventory settings.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider">Sale Price (PKR)</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input type="number" step="0.01" className="pl-9" {...register('sale_price')} />
              </div>
              {errors.sale_price && <p className="text-rose-500 text-xs">{errors.sale_price.message as string}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider">Purchase Price (PKR)</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input type="number" step="0.01" className="pl-9" {...register('purchase_price')} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider">Stock Quantity</Label>
              <div className="flex flex-col gap-2">
                <Input type="number" {...register('stock_qty')} />
                <div className="flex items-center gap-2 p-2 bg-amber-50 rounded border border-amber-100 text-amber-700 text-[10px]">
                  <AlertTriangle className="w-3 h-3 shrink-0" />
                   <span>Suggest using &quot;Adjust Stock&quot; for audit-trailed changes instead of manual editing.</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider">Reorder Level</Label>
              <Input type="number" {...register('reorder_level')} />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider">Expiry Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input type="date" className="pl-9" {...register('expiry_date')} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider">Barcode</Label>
              <div className="relative">
                <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input className="pl-9" {...register('barcode')} />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-xs font-bold uppercase tracking-wider">Storage Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input className="pl-9" {...register('location')} />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 md:col-span-2">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold">Active in POS</Label>
                <p className="text-xs text-slate-500">Enable or disable this medicine from appearing in the POS terminal.</p>
              </div>
              <Switch
                checked={watch('is_active')}
                onCheckedChange={(checked) => setValue('is_active', checked)}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
            <Button type="submit" size="lg" className="flex-1 font-bold h-12 shadow-md" disabled={submitting}>
              {submitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
              Save Changes
            </Button>
            <Button type="button" variant="outline" size="lg" className="px-8 font-semibold h-12" onClick={() => router.back()}>Cancel</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-rose-100 bg-rose-50/30 overflow-hidden shadow-none">
        <CardContent className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-rose-900">Danger Zone</p>
              <p className="text-xs text-rose-500">Deactivating a medicine hides it from POS but keeps it in your records.</p>
            </div>
          </div>
          <Button variant="destructive" type="button" size="sm">Deactivate Medicine</Button>
        </CardContent>
      </Card>
    </form>
  );
}
