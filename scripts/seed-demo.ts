import { createClient } from '@supabase/supabase-js'
import {
  DEMO_CREDENTIALS,
  DEMO_TENANT,
  DEMO_MEDICINES,
  DEMO_CUSTOMERS
} from '../lib/demo-seed'
import * as dotenv from 'dotenv'

// Run this once to set up the demo account: npm run seed:demo
// Re-run to reset demo data (it deletes and recreates everything)
// NEVER run against production database

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

async function seed() {
  console.log('🚀 Starting demo seeding...')

  // 1. Create or Get Auth User
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: DEMO_CREDENTIALS.email,
    password: DEMO_CREDENTIALS.password,
    email_confirm: true
  })

  let userId = authUser?.user?.id

  if (authError) {
    if (authError.message.includes('already registered')) {
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', DEMO_CREDENTIALS.email)
        .single()
      userId = existingUser?.id
    } else {
      console.error('Error creating auth user:', authError)
      return
    }
  }

  // 2. Clear Existing Data for Demo Tenant if exists
  if (userId) {
    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('tenant_id')
      .eq('id', userId)
      .single()

    if (profile?.tenant_id) {
      console.log('🧹 Cleaning up old demo data...')
      await supabaseAdmin.from('tenants').delete().eq('id', profile.tenant_id)
    }
  }

  // 3. Create Tenant
  console.log('🏢 Creating demo tenant...')
  const { data: tenant, error: tenantError } = await supabaseAdmin
    .from('tenants')
    .insert({
      ...DEMO_TENANT,
      id: '00000000-0000-0000-0000-000000000d01' // Static UUID for demo
    })
    .select()
    .single()

  if (tenantError) {
    console.error('Error creating tenant:', tenantError)
    return
  }

  // 4. Create User Profile
  console.log('👤 Creating user profile...')
  const { error: profileError } = await supabaseAdmin
    .from('users')
    .insert({
      id: userId,
      tenant_id: tenant.id,
      email: DEMO_CREDENTIALS.email,
      name: 'Demo Manager',
      role: 'owner',
      is_active: true
    })

  if (profileError) {
    console.error('Error creating profile:', profileError)
  }

  // 5. Create Medicines (Global + Store)
  console.log('💊 Seeding medicines...')
  for (const med of DEMO_MEDICINES) {
    // Check if global medicine exists or create it
    let { data: globalMed } = await supabaseAdmin
      .from('medicines')
      .select('id')
      .eq('name', med.name)
      .single()

    if (!globalMed) {
      const { data: newMed } = await supabaseAdmin
        .from('medicines')
        .insert({
          name: med.name,
          generic_name: med.generic_name,
          category: med.category,
          company: med.company,
          unit: med.unit,
          drap_mrp: med.sale_price,
          scope: 'global',
          is_controlled: (med as any).is_controlled || false
        })
        .select()
        .single()
      globalMed = newMed
    }

    if (globalMed) {
      await supabaseAdmin.from('store_medicines').insert({
        tenant_id: tenant.id,
        medicine_id: globalMed.id,
        stock_qty: med.stock_qty,
        sale_price: med.sale_price,
        purchase_price: med.purchase_price,
        reorder_level: med.reorder_level,
        expiry_date: med.expiry_date,
        is_active: true
      })
    }
  }

  // 6. Create Customers
  console.log('👥 Seeding customers...')
  const { data: customers } = await supabaseAdmin
    .from('customers')
    .insert(DEMO_CUSTOMERS.map(c => ({ ...c, tenant_id: tenant.id })))
    .select()

  // 7. Generate 30 days of sales
  console.log('📊 Generating 30 days of sales data...')
  const { data: storeMeds } = await supabaseAdmin
    .from('store_medicines')
    .select('id, sale_price, stock_qty')
    .eq('tenant_id', tenant.id)

  if (storeMeds && storeMeds.length > 0) {
    for (let i = 30; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)

      const salesCount = Math.floor(Math.random() * 11) + 5 // 5 to 15 sales

      for (let s = 0; s < salesCount; s++) {
        const itemsCount = Math.floor(Math.random() * 5) + 1
        let subtotal = 0
        const selectedMeds = []

        for (let it = 0; it < itemsCount; it++) {
          const med = storeMeds[Math.floor(Math.random() * storeMeds.length)]
          const qty = Math.floor(Math.random() * 5) + 1
          const itemSubtotal = med.sale_price * qty
          subtotal += itemSubtotal
          selectedMeds.push({
            store_medicine_id: med.id,
            qty,
            unit_price: med.sale_price,
            subtotal: itemSubtotal,
            medicine_name: 'Medicine Name' // Placeholder, real name would be joined
          })
        }

        const customer = Math.random() > 0.5 ? customers?.[Math.floor(Math.random() * customers.length)] : null
        const paymentMethod = Math.random() < 0.7 ? 'cash' : (Math.random() < 0.9 ? 'card' : 'credit')

        const { data: sale } = await supabaseAdmin
          .from('sales')
          .insert({
            tenant_id: tenant.id,
            user_id: userId,
            customer_id: customer?.id,
            invoice_no: `DEMO-${date.getTime()}-${s}`,
            subtotal,
            discount: 0,
            tax: 0,
            total: subtotal,
            payment_method: paymentMethod as any,
            created_at: date.toISOString()
          })
          .select()
          .single()

        if (sale) {
          await supabaseAdmin.from('sale_items').insert(
            selectedMeds.map(item => ({
              ...item,
              sale_id: sale.id,
              tenant_id: tenant.id,
              created_at: date.toISOString()
            }))
          )
        }
      }
    }
  }

  console.log('✅ Seeding complete!')
}

seed()
