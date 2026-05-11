import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminHeader } from '@/components/admin/admin-header'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.app_metadata.role !== 'super_admin') {
    redirect('/dashboard')
  }

  // Fetch pending counts for badges
  const adminSupabase = await createClient(true)
  const { count: pendingSubs } = await adminSupabase
    .from('tenants')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending_admin_approval')

  const { count: pendingMeds } = await adminSupabase
    .from('medicines')
    .select('*', { count: 'exact', head: true })
    .eq('scope', 'pending_review')

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-[240px] bg-[#1E293B] border-r border-white/10 z-50">
        <AdminSidebar
          pendingSubscriptions={pendingSubs || 0}
          pendingMedicines={pendingMeds || 0}
          user={user}
        />
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-[240px] flex flex-col min-h-screen">
        <AdminHeader user={user} pendingTotal={(pendingSubs || 0) + (pendingMeds || 0)} />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto pt-24">
          {children}
        </main>
      </div>
    </div>
  )
}
