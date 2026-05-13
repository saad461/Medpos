import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { TenantTable } from '@/components/admin/tenant-table';
import { Clock, AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export const dynamic = 'force-dynamic';

export default async function AdminSubscriptionsPage() {
  const supabase = await createClient(true);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata.role !== 'super_admin') redirect('/login');

  const { data: pendingTenants } = await supabase
    .from('tenants')
    .select('*')
    .eq('status', 'pending_admin_approval')
    .order('created_at', { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Pending Store Approvals</h1>
        <p className="text-white/40 text-sm">Review and approve new store registrations before they can access the platform.</p>
      </div>

      {pendingTenants && pendingTenants.length > 0 ? (
        <div className="space-y-6">
           <Alert className="bg-warning/10 border-warning/20 text-warning">
            <Clock className="h-4 w-4" />
            <AlertTitle className="font-bold">Action Required</AlertTitle>
            <AlertDescription>
              There are {pendingTenants.length} stores waiting for manual approval.
            </AlertDescription>
          </Alert>

          <div className="bg-[#1E293B] rounded-2xl border border-white/5 overflow-hidden">
            <TenantTable data={pendingTenants} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 bg-[#1E293B] border border-dashed border-white/10 rounded-2xl">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-white/20" />
          </div>
          <h2 className="text-xl font-bold text-white">All caught up!</h2>
          <p className="text-white/40 mt-1">No stores are currently pending approval.</p>
        </div>
      )}
    </div>
  );
}
