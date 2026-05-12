import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAuditLog } from '@/lib/audit'
import { revalidatePath } from 'next/cache'

const storeUpdateSchema = z.object({
  name: z.string().min(2).max(100),
  city: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  ntn: z.string().optional(),
  strn: z.string().optional(),
  gst_rate: z.number().min(0).max(100),
  theme: z.enum(['light', 'dark']),
})

export async function PUT(req: Request) {
  const supabase = createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new NextResponse('Unauthorized', { status: 401 })

    const tenantId = user.app_metadata.tenant_id
    const role = user.app_metadata.role

    if (role !== 'owner' && role !== 'admin' && role !== 'super_admin') {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const body = await req.json()
    const validatedData = storeUpdateSchema.parse(body)

    // Get old values for audit log
    const { data: oldSettings } = await supabase
      .from('store_settings')
      .select('*')
      .eq('tenant_id', tenantId)
      .single()

    const { data: oldTenant } = await supabase
      .from('tenants')
      .select('name')
      .eq('id', tenantId)
      .single()

    // Update store_settings
    const { error: settingsError } = await supabase
      .from('store_settings')
      .update({
        city: validatedData.city,
        address: validatedData.address,
        phone: validatedData.phone,
        whatsapp: validatedData.whatsapp,
        store_email: validatedData.email,
        ntn: validatedData.ntn,
        strn: validatedData.strn,
        gst_rate: validatedData.gst_rate,
        theme: validatedData.theme,
      })
      .eq('tenant_id', tenantId)

    if (settingsError) throw settingsError

    // Update tenant name if changed
    if (validatedData.name !== oldTenant?.name) {
      const { error: tenantError } = await supabase
        .from('tenants')
        .update({ name: validatedData.name })
        .eq('id', tenantId)

      if (tenantError) throw tenantError
    }

    // Log to audit logs
    await createAuditLog({
      tenant_id: tenantId,
      user_id: user.id,
      action: 'UPDATE_STORE_SETTINGS',
      table_name: 'store_settings',
      record_id: oldSettings.id,
      old_value: { ...oldSettings, tenant_name: oldTenant?.name },
      new_value: validatedData,
    })

    revalidatePath('/settings/store')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[STORE_SETTINGS_PUT]', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return new NextResponse('Internal Error', { status: 500 })
  }
}
