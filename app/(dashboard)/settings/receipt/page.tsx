export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsLayout } from '@/components/settings/settings-layout'
import { ReceiptForm } from '@/components/settings/receipt-form'

export default async function ReceiptSettingsPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const tenantId = user.app_metadata.tenant_id
  const role = user.app_metadata.role

  if (role !== 'owner' && role !== 'admin' && role !== 'super_admin') {
    redirect('/dashboard')
  }

  const { data: settings } = await supabase
    .from('store_settings')
    .select('*')
    .eq('tenant_id', tenantId)
    .single()

  const { data: tenant } = await supabase
    .from('tenants')
    .select('name, plan')
    .eq('id', tenantId)
    .single()

  if (!settings || !tenant) {
    return <div>Error loading settings.</div>
  }

  return (
    <SettingsLayout>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Receipt Customization</h3>
          <p className="text-sm text-muted-foreground">
            Configure how your printed receipts look for customers.
          </p>
        </div>

        <ReceiptForm settings={settings} tenant={tenant} />
      </div>
    </SettingsLayout>
  )
}
