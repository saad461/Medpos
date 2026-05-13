import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { StatCard } from '@/components/admin/stat-card';
import { TenantTable } from '@/components/admin/tenant-table';
import {
  Store,
  Users,
  Clock,
  Database,
  ArrowUpRight,
  AlertCircle
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SuperAdminDashboard() {
  const supabase = await createClient(true); // Service role
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata.role !== 'super_admin') redirect('/login');

  // Fetch summary stats
  const { count: totalTenants } = await supabase
    .from('tenants')
    .select('*', { count: 'exact', head: true });

  const { count: pendingTenants } = await supabase
    .from('tenants')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending_admin_approval');

  const { count: totalMedicines } = await supabase
    .from('medicines')
    .select('*', { count: 'exact', head: true })
    .eq('scope', 'global');

  const { count: pendingMedicines } = await supabase
    .from('medicine_submissions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending_review');

  // Fetch recent tenants
  const { data: recentTenants } = await supabase
    .from('tenants')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">System Overview</h1>
        <p className="text-white/40 text-sm">Real-time platform performance and management metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Stores"
          value={totalTenants || 0}
          icon={Store}
          iconColor="text-accent"
          trend="+12% this month"
        />
        <StatCard
          title="Pending Approvals"
          value={pendingTenants || 0}
          icon={Clock}
          iconColor="text-warning"
          highlight={Number(pendingTenants) > 0}
          subtitle="New stores waiting review"
        />
        <StatCard
          title="Global Medicines"
          value={totalMedicines || 0}
          icon={Database}
          iconColor="text-success"
          subtitle="Verified DRAP database"
        />
        <StatCard
          title="Pending Reviews"
          value={pendingMedicines || 0}
          icon={AlertCircle}
          iconColor="text-danger"
          highlight={Number(pendingMedicines) > 0}
          subtitle="Medicine submissions"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Recent Store Registrations</h2>
          <button className="text-xs font-bold text-accent hover:underline flex items-center gap-1">
            View All <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
        <TenantTable data={recentTenants || []} />
      </div>
    </div>
  );
}
