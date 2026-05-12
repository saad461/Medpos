import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createAuditLog } from '@/lib/audit'
import { revalidatePath } from 'next/cache'

export async function POST(req: Request) {
  const supabase = createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new NextResponse('Unauthorized', { status: 401 })

    const tenantId = user.app_metadata.tenant_id
    const role = user.app_metadata.role

    if (role !== 'owner' && role !== 'admin' && role !== 'super_admin') {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return new NextResponse('No file uploaded', { status: 400 })
    }

    // Validate file type and size
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      return new NextResponse('Invalid file type', { status: 400 })
    }

    if (file.size > 2 * 1024 * 1024) {
      return new NextResponse('File too large (max 2MB)', { status: 400 })
    }

    const fileExt = file.name.split('.').pop()
    const path = `${tenantId}/logo.${fileExt}`

    // Upload to Supabase Storage with service role (via server client)
    const { error: uploadError } = await supabase.storage
      .from('store-assets')
      .upload(path, file, {
        upsert: true,
        contentType: file.type,
      })

    if (uploadError) throw uploadError

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('store-assets')
      .getPublicUrl(path)

    // Update store_settings
    const { error: updateError } = await supabase
      .from('store_settings')
      .update({ logo_url: publicUrl })
      .eq('tenant_id', tenantId)

    if (updateError) throw updateError

    await createAuditLog({
      tenant_id: tenantId,
      user_id: user.id,
      action: 'UPDATE_LOGO',
      table_name: 'store_settings',
      new_value: { logo_url: publicUrl },
    })

    revalidatePath('/settings/store')
    return NextResponse.json({ logo_url: publicUrl })
  } catch (error) {
    console.error('[LOGO_UPLOAD_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function DELETE() {
  const supabase = createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new NextResponse('Unauthorized', { status: 401 })

    const tenantId = user.app_metadata.tenant_id
    const role = user.app_metadata.role

    if (role !== 'owner' && role !== 'admin' && role !== 'super_admin') {
      return new NextResponse('Forbidden', { status: 403 })
    }

    // Get current logo URL to find path
    const { data: settings } = await supabase
      .from('store_settings')
      .select('logo_url')
      .eq('tenant_id', tenantId)
      .single()

    if (settings?.logo_url) {
      const path = settings.logo_url.split('/').pop()
      if (path) {
        await supabase.storage
          .from('store-assets')
          .remove([`${tenantId}/${path}`])
      }
    }

    await supabase
      .from('store_settings')
      .update({ logo_url: null })
      .eq('tenant_id', tenantId)

    await createAuditLog({
      tenant_id: tenantId,
      user_id: user.id,
      action: 'REMOVE_LOGO',
      table_name: 'store_settings',
      old_value: { logo_url: settings?.logo_url },
    })

    revalidatePath('/settings/store')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[LOGO_UPLOAD_DELETE]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
