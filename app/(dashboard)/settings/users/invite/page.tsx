export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsLayout } from '@/components/settings/settings-layout'
import { InviteForm } from '@/components/settings/invite-form'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function InviteUserPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const tenantId = user.app_metadata.tenant_id
  const role = user.app_metadata.role

  if (role !== 'owner' && role !== 'admin' && role !== 'super_admin') {
    redirect('/dashboard')
  }

  // Check plan limits
  const { data: tenant } = await supabase
    .from('tenants')
    .select('plan')
    .eq('id', tenantId)
    .single()

  const { count: currentCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .eq('is_active', true)

  const planLimits = {
    starter: 1,
    professional: 5,
    business: 15
  }

  const limit = planLimits[tenant?.plan as keyof typeof planLimits] || 1
  const isAtLimit = (currentCount || 0) >= limit

  if (isAtLimit) {
    return (
      <SettingsLayout>
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <div className="max-w-md">
            <h3 className="text-lg font-bold">User Limit Reached</h3>
            <p className="text-muted-foreground mt-2">
              Your {tenant?.plan} plan allows maximum {limit} user(s).
              Upgrade your plan to invite more team members.
            </p>
          </div>
          <Button asChild>
            <Link href="/settings/billing">Upgrade Plan</Link>
          </Button>
        </div>
      </SettingsLayout>
    )
  }

  return (
    <SettingsLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8">
            <Link href="/settings/users">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h3 className="text-lg font-medium">Invite Team Member</h3>
            <p className="text-sm text-muted-foreground">
              Send an invitation to join your pharmacy team.
            </p>
          </div>
        </div>

        <InviteForm />
      </div>
    </SettingsLayout>
  )
}
