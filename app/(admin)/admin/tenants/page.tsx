import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { TenantTable } from '@/components/admin/tenant-table';
import { Store } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminTenantsPage() {
  const supabase = await createClient(true);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata.role !== 'super_admin') redirect('/login');

  const { data: tenants } = await supabase
    .from('tenants')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Store Management</h1>
          <p className="text-white/40 text-sm">Manage all pharmacy tenants on the platform.</p>
        </div>
      </div>

      <div className="bg-[#1E293B] rounded-2xl border border-white/5 overflow-hidden">
        <TenantTable data={tenants || []} />
      </div>
    </div>
  );
}
