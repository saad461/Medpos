import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'

interface PlanUsageProps {
  tenant: any
}

export async function PlanUsage({ tenant }: PlanUsageProps) {
  const supabase = createClient()

  // 1. Fetch user count
  const { count: userCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenant.id)
    .eq('is_active', true)

  // 2. Fetch private medicine count
  const { count: medicineCount } = await supabase
    .from('medicines')
    .select('*', { count: 'exact', head: true })
    .eq('submitted_by', tenant.id)
    .eq('scope', 'private')

  const planLimits = {
    starter: { users: 1, medicines: 10 },
    professional: { users: 5, medicines: 1000000 }, // unlimited
    business: { users: 15, medicines: 1000000 }, // unlimited
  }

  const limits = planLimits[tenant.plan as keyof typeof planLimits] || planLimits.starter

  const userProgress = ((userCount || 0) / limits.users) * 100
  const medProgress = ((medicineCount || 0) / limits.medicines) * 100

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Plan Usage</CardTitle>
        <CardDescription>Your resource usage for this billing cycle.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Team Members</span>
            <span className="text-muted-foreground">{userCount || 0} / {limits.users}</span>
          </div>
          <Progress value={userProgress} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Private Medicines</span>
            <span className="text-muted-foreground">
              {tenant.plan === 'starter' ? `${medicineCount || 0} / ${limits.medicines}` : 'Unlimited'}
            </span>
          </div>
          <Progress value={tenant.plan === 'starter' ? medProgress : 0} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Storage</span>
            <span className="text-muted-foreground">0.5 MB / 1 GB</span>
          </div>
          <Progress value={5} className="h-2" />
        </div>
      </CardContent>
    </Card>
  )
}
