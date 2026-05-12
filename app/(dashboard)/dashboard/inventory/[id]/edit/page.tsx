export const dynamic = 'force-dynamic'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { EditMedicineForm } from '@/components/inventory/edit-medicine-form';
import Link from 'next/link';

export default async function EditMedicinePage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient<Database>({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  const tenantId = session?.user.app_metadata.tenant_id;

  const { data: item } = await supabase
    .from('store_medicines')
    .select('*, medicine:medicines(*)')
    .eq('id', params.id)
    .eq('tenant_id', tenantId)
    .single();

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Medicine Not Found</h2>
        <Button className="mt-6" asChild>
          <Link href="/dashboard/inventory">Back to Inventory</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link href={`/dashboard/inventory/${params.id}`}>
              <ChevronLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Medicine</h1>
            <p className="text-muted-foreground">{item.medicine.name} — {item.medicine.company}</p>
          </div>
        </div>
      </div>

      <EditMedicineForm item={item} />
    </div>
  );
}
