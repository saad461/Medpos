export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsLayout } from '@/components/settings/settings-layout'
import { BillingCard } from '@/components/settings/billing-card'
import { PlanUsage } from '@/components/settings/plan-usage'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default async function BillingPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const tenantId = user.app_metadata.tenant_id
  const role = user.app_metadata.role

  // Only Owner can access billing
  if (role !== 'owner' && role !== 'super_admin') {
    return (
      <SettingsLayout>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold">Access Restricted</h3>
          <p className="text-muted-foreground mt-2 max-w-sm">
            Only the store owner can manage billing and subscription settings.
          </p>
        </div>
      </SettingsLayout>
    )
  }

  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', tenantId)
    .single()

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!tenant) return <div>Error loading tenant info.</div>

  const isPastDue = subscription?.status === 'past_due'
  const isTrial = subscription?.status === 'trialing'

  return (
    <SettingsLayout>
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-medium">Billing & Subscription</h3>
          <p className="text-sm text-muted-foreground">
            Manage your plan, payment methods, and view billing history.
          </p>
        </div>

        {isPastDue && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Payment Required</AlertTitle>
            <AlertDescription>
              Your last payment failed. Update your payment method to avoid store suspension.
            </AlertDescription>
          </Alert>
        )}

        {isTrial && (
          <Alert className="bg-amber-50 border-amber-200 text-amber-800">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertTitle>Free Trial</AlertTitle>
            <AlertDescription>
              You are currently on a free trial. Upgrade now to keep all features after trial ends.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <BillingCard tenant={tenant} subscription={subscription} />
          <PlanUsage tenant={tenant} />
        </div>

        {/* Section 4: Billing History */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Billing History</h4>
          <div className="rounded-xl border bg-muted/10">
            <div className="p-12 text-center">
              <p className="text-sm font-medium text-muted-foreground">No recent billing history found.</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Invoices for your subscription will appear here.</p>
            </div>
          </div>
        </div>

        {/* Section 5: Danger Zone */}
        <div className="pt-8">
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6">
            <h4 className="text-sm font-bold text-destructive uppercase tracking-wider">Danger Zone</h4>
            <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold">Cancel Subscription</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Once cancelled, you will still have access until the end of your billing period.
                </p>
              </div>
              <Button variant="destructive" size="sm">
                Cancel Subscription
              </Button>
            </div>
          </div>
        </div>
      </div>
    </SettingsLayout>
  )
}
