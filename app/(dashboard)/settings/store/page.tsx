export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsLayout } from '@/components/settings/settings-layout'
import { StoreForm } from '@/components/settings/store-form'
import { LogoUpload } from '@/components/settings/logo-upload'
import { ContributorBadge } from '@/components/inventory/contributor-badge'

export default async function StoreSettingsPage() {
  const supabase = await createClient()

  // Get current user and tenant_id
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const tenantId = user.app_metadata.tenant_id
  const role = user.app_metadata.role

  // Only owner/admin can access settings
  if (role !== 'owner' && role !== 'admin' && role !== 'super_admin') {
    redirect('/dashboard')
  }

  // Fetch store settings and tenant data
  const { data: settings } = await supabase
    .from('store_settings')
    .select('*')
    .eq('tenant_id', tenantId)
    .single()

  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', tenantId)
    .single()

  if (!settings || !tenant) {
    return <div>Error loading settings.</div>
  }

  return (
    <SettingsLayout>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Store Information</h3>
          <p className="text-sm text-muted-foreground">
            This information appears on your invoices and receipts.
          </p>
        </div>

        <div className="grid gap-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 border rounded-xl bg-slate-50/50">
            <LogoUpload
              currentLogoUrl={settings.logo_url}
              storeName={tenant.name}
            />
            {settings.is_contributor && (
              <ContributorBadge
                contributorCount={settings.contributor_count}
                isContributor={true}
                size="md"
              />
            )}
          </div>
          <StoreForm settings={settings as any} tenant={tenant as any} />
        </div>
      </div>
    </SettingsLayout>
  )
}
