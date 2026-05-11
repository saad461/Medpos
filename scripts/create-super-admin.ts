import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Run ONCE only: npm run create:admin
// This account bypasses ALL RLS policies.

dotenv.config({ path: '.env.local' })

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function createSuperAdmin() {
  const email = process.env.ADMIN_EMAIL!
  const password = process.env.ADMIN_INITIAL_PASSWORD!

  console.log(`🚀 Creating Super Admin: ${email}...`)

  // 1. Create Auth User
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: 'MedPOS Founder' }
  })

  if (authError) {
    console.error('Error creating auth user:', authError.message)
    return
  }

  const userId = authUser.user.id

  // 2. Create MedPOS HQ Tenant
  const { data: tenant, error: tenantError } = await supabaseAdmin
    .from('tenants')
    .insert({
      name: 'MedPOS HQ',
      slug: 'medpos-hq',
      plan: 'business',
      status: 'active',
      owner_email: email
    })
    .select()
    .single()

  if (tenantError) {
    console.error('Error creating tenant:', tenantError.message)
    return
  }

  // 3. Create Public User with super_admin role
  const { error: profileError } = await supabaseAdmin
    .from('users')
    .insert({
      id: userId,
      tenant_id: tenant.id,
      email,
      name: 'MedPOS Founder',
      role: 'super_admin',
      is_active: true
    })

  if (profileError) {
    console.error('Error creating profile:', profileError.message)
  } else {
    console.log('✅ Super Admin created successfully!')
    console.log('JWT claims will sync automatically via DB trigger.')
  }
}

createSuperAdmin()
