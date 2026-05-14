'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/cron/helpers'
import { redirect } from 'next/navigation'
import { generateUniqueSlug } from '@/lib/utils'
import { sendAdminNewSignupEmail } from '@/lib/email/templates'

export async function completeOnboarding(
  plan: 'starter' | 'professional' | 'business',
  billing: 'monthly' | 'yearly'
) {
  // 1. Get current Supabase session
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Check if already onboarded (prevent duplicates)
  const adminClient = createAdminClient()
  const { data: existingUser } = await adminClient
    .from('users')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (existingUser?.tenant_id) {
    // Already onboarded — get tenant status and redirect
    const { data: tenant } = await adminClient
      .from('tenants')
      .select('status')
      .eq('id', existingUser.tenant_id)
      .single()

    if (tenant?.status === 'active') redirect('/dashboard')
    redirect('/pending-approval')
  }

  // 3. Get user metadata from auth.users
  const name = user.user_metadata?.name || 'Store Owner'
  const storeName = user.user_metadata?.store_name || 'My Pharmacy'
  const phone = user.user_metadata?.phone || ''

  // 4. Generate unique slug
  const slug = await generateUniqueSlug(storeName, adminClient)

  // 5. Calculate trial end date
  const trialEndsAt = new Date()
  trialEndsAt.setDate(trialEndsAt.getDate() + 14)

  // 6. Create tenant using SUPABASE SERVICE ROLE
  const { data: tenant, error: tenantError } = await adminClient
    .from('tenants')
    .insert({
      name: storeName,
      slug: slug,
      plan: plan,
      status: 'pending_admin_approval',
      trial_ends_at: trialEndsAt.toISOString(),
      owner_email: user.email!,
    })
    .select()
    .single()

  if (tenantError) {
    console.error('Failed to create tenant:', tenantError)
    return { error: 'Failed to create your store. Please try again.' }
  }

  // 7. Create public.users record using admin client
  const { error: userError } = await adminClient
    .from('users')
    .insert({
      id: user.id,
      tenant_id: tenant.id,
      email: user.email!,
      name: name,
      phone: phone,
      role: 'owner',
    })

  if (userError) {
    console.error('Failed to create user:', userError)
    // Rollback: delete the tenant we just created
    await adminClient.from('tenants').delete().eq('id', tenant.id)
    return { error: 'Failed to complete setup. Please try again.' }
  }

  // 8. Create onboarding_progress record (if table exists)
  // Check if table exists first or just try and catch
  try {
    await adminClient
      .from('onboarding_progress')
      .insert({
          tenant_id: tenant.id,
          setup_complete: false,
          tour_completed: false
      })
  } catch (e) {
    console.warn('onboarding_progress insertion failed (table might not exist yet)', e)
  }

  // 9. Send admin notification email via Resend
  try {
    if (process.env.RESEND_API_KEY &&
        process.env.RESEND_API_KEY !== 're_placeholder_not_configured_yet' &&
        !process.env.RESEND_API_KEY.startsWith('re_placeholder')) {
      await sendAdminNewSignupEmail({
        storeName,
        ownerName: name,
        email: user.email!,
        phone,
        plan,
        billing,
        trialEndsAt: trialEndsAt.toDateString(),
        approveUrl: `${process.env.NEXT_PUBLIC_APP_URL}/admin/subscriptions`,
      })
    }
  } catch (emailError) {
    console.error('Admin notification email failed:', emailError)
  }

  // 10. Redirect to pending approval
  redirect('/pending-approval')
}

// IMPORTANT: The following DB trigger must exist in Supabase.
// If JWT claims are not syncing, run this SQL in Supabase SQL editor:
//
// CREATE OR REPLACE FUNCTION sync_user_claims()
// RETURNS TRIGGER AS $$
// BEGIN
//   UPDATE auth.users
//   SET raw_app_meta_data =
//     raw_app_meta_data ||
//     jsonb_build_object(
//       'tenant_id', NEW.tenant_id,
//       'role', NEW.role
//     )
//   WHERE id = NEW.id;
//   RETURN NEW;
// END;
// $$ LANGUAGE plpgsql SECURITY DEFINER;
//
// CREATE TRIGGER on_user_created_or_updated
//   AFTER INSERT OR UPDATE ON users
//   FOR EACH ROW EXECUTE FUNCTION sync_user_claims();

// CREATE OR REPLACE FUNCTION create_default_store_settings()
// RETURNS TRIGGER AS $$
// BEGIN
//   INSERT INTO store_settings (tenant_id)
//   VALUES (NEW.id)
//   ON CONFLICT (tenant_id) DO NOTHING;
//   RETURN NEW;
// END;
// $$ LANGUAGE plpgsql SECURITY DEFINER;
//
// CREATE TRIGGER on_tenant_created
//   AFTER INSERT ON tenants
//   FOR EACH ROW EXECUTE FUNCTION create_default_store_settings();
