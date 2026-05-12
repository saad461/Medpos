export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { SettingsLayout } from '@/components/settings/settings-layout'
import { UsersTable } from '@/components/settings/users-table'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

export default async function TeamMembersPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const tenantId = user.app_metadata.tenant_id

  // Fetch users for this tenant
  const { data: users } = await supabase
    .from('users')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: true })

  // Fetch tenant plan for limits
  const { data: tenant } = await supabase
    .from('tenants')
    .select('plan')
    .eq('id', tenantId)
    .single()

  if (!users || !tenant) return <div>Error loading users.</div>

  const planLimits = {
    starter: 1,
    professional: 5,
    business: 15
  }

  const limit = planLimits[tenant.plan as keyof typeof planLimits] || 1
  const currentCount = users.filter(u => u.is_active).length
  const progress = (currentCount / limit) * 100
  const isAtLimit = currentCount >= limit

  let progressColor = 'bg-success'
  if (progress >= 100) progressColor = 'bg-destructive'
  else if (progress >= 80) progressColor = 'bg-warning'

  return (
    <SettingsLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Team Members</h3>
            <p className="text-sm text-muted-foreground">
              Manage your pharmacy staff and their access roles.
            </p>
          </div>
          <Button asChild disabled={isAtLimit}>
            <Link href="/settings/users/invite">
              <Plus className="mr-2 h-4 w-4" />
              Invite Member
            </Link>
          </Button>
        </div>

        {/* Plan Usage */}
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-muted-foreground">
              Plan Usage: <span className="text-foreground">{currentCount} of {limit} users used</span>
            </span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" color={progressColor} />
          {isAtLimit && (
            <p className="mt-2 text-xs text-destructive">
              You have reached your plan's user limit. Upgrade to add more members.
            </p>
          )}
        </div>

        <UsersTable users={users} currentUser={user} />
      </div>
    </SettingsLayout>
  )
}
