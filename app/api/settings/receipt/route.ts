import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAuditLog } from '@/lib/audit'
import { revalidatePath } from 'next/cache'

const receiptUpdateSchema = z.object({
  receipt_header: z.string().max(200).optional(),
  show_logo_on_receipt: z.boolean(),
  show_drap_mrp: z.boolean(),
  show_generic_name: z.boolean(),
  show_profit_on_receipt: z.boolean(),
  receipt_footer_msg: z.string().max(100).optional(),
  receipt_footer: z.string().max(300).optional(),
  show_powered_by: z.boolean(),
  receipt_width: z.enum(['58mm', '80mm', 'A4']),
  receipt_font_size: z.enum(['small', 'medium', 'large']),
  print_duplicate: z.boolean(),
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
    const validatedData = receiptUpdateSchema.parse(body)

    const { data: oldSettings } = await supabase
      .from('store_settings')
      .select('*')
      .eq('tenant_id', tenantId)
      .single()

    const { error } = await supabase
      .from('store_settings')
      .update({
        receipt_header: validatedData.receipt_header,
        show_logo_on_receipt: validatedData.show_logo_on_receipt,
        show_drap_mrp: validatedData.show_drap_mrp,
        show_generic_name: validatedData.show_generic_name,
        show_profit_on_receipt: validatedData.show_profit_on_receipt,
        receipt_footer: validatedData.receipt_footer_msg, // Using receipt_footer for the message as per existing schema if applicable
        // receipt_footer_text: validatedData.receipt_footer, // Might need to add this column or handle it
        show_powered_by: validatedData.show_powered_by,
        receipt_width: validatedData.receipt_width,
        receipt_font_size: validatedData.receipt_font_size,
        print_duplicate: validatedData.print_duplicate,
      })
      .eq('tenant_id', tenantId)

    if (error) throw error

    await createAuditLog({
      tenant_id: tenantId,
      user_id: user.id,
      action: 'UPDATE_RECEIPT_SETTINGS',
      table_name: 'store_settings',
      record_id: oldSettings.id,
      old_value: oldSettings,
      new_value: validatedData,
    })

    revalidatePath('/settings/receipt')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[RECEIPT_SETTINGS_PUT]', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return new NextResponse('Internal Error', { status: 500 })
  }
}
