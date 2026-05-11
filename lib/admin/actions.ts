'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
  sendApprovalEmail,
  sendRejectionEmail,
  sendSuspensionEmail,
  sendReactivationEmail
} from '@/lib/email/templates'

async function verifyAdminRole() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const role = user.app_metadata?.role
  if (role !== 'super_admin') throw new Error('Not authorized')

  return user
}

export async function approveTenant(tenantId: string, message?: string) {
  const adminUser = await verifyAdminRole()
  const supabase = await createClient(true) // Service role

  // 1. Update tenant status
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .update({ status: 'active' })
    .eq('id', tenantId)
    .select()
    .single()

  if (tenantError) throw tenantError

  // 2. Get owner details
  const { data: owner } = await supabase
    .from('users')
    .select('email, name')
    .eq('tenant_id', tenantId)
    .eq('role', 'owner')
    .single()

  if (owner) {
    // 3. Send approval email
    await sendApprovalEmail({
      storeName: tenant.name,
      ownerName: owner.name,
      email: owner.email,
      planName: tenant.plan.toUpperCase(),
      loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
      adminMessage: message,
      whatsappNumber: '0300-MEDPOS'
    })
  }

  // 4. Log action
  await supabase.from('admin_actions').insert({
    admin_id: adminUser.id,
    action: 'TENANT_APPROVED',
    target_type: 'tenant',
    target_id: tenantId,
    target_name: tenant.name,
    details: { message }
  })

  revalidatePath('/admin/subscriptions')
  revalidatePath('/admin/tenants')
  return { success: true }
}

export async function rejectTenant(tenantId: string, reason: string, refundConfirmed: boolean) {
  const adminUser = await verifyAdminRole()
  const supabase = await createClient(true)

  const { data: tenant } = await supabase.from('tenants').select('name').eq('id', tenantId).single()
  const { data: owner } = await supabase.from('users').select('email').eq('tenant_id', tenantId).eq('role', 'owner').single()

  await supabase.from('tenants').update({ status: 'cancelled' }).eq('id', tenantId)
  await supabase.from('subscriptions').update({ status: 'cancelled' }).eq('tenant_id', tenantId)

  if (owner) {
    await sendRejectionEmail({
      email: owner.email,
      reason,
      refundMessage: refundConfirmed ? 'A refund has been processed.' : undefined
    })
  }

  await supabase.from('admin_actions').insert({
    admin_id: adminUser.id,
    action: 'TENANT_REJECTED',
    target_type: 'tenant',
    target_id: tenantId,
    target_name: tenant?.name,
    details: { reason, refundConfirmed }
  })

  revalidatePath('/admin/subscriptions')
  return { success: true }
}

export async function suspendTenant(tenantId: string, reason: string, notifyOwner: boolean, message?: string) {
  const adminUser = await verifyAdminRole()
  const supabase = await createClient(true)

  const { data: tenant } = await supabase.from('tenants').update({ status: 'suspended' }).eq('id', tenantId).select().single()
  const { data: owner } = await supabase.from('users').select('email').eq('tenant_id', tenantId).eq('role', 'owner').single()

  if (notifyOwner && owner && tenant) {
    await sendSuspensionEmail({
      email: owner.email,
      storeName: tenant.name,
      reason,
      message
    })
  }

  await supabase.from('admin_actions').insert({
    admin_id: adminUser.id,
    action: 'TENANT_SUSPENDED',
    target_type: 'tenant',
    target_id: tenantId,
    target_name: tenant?.name,
    details: { reason, message }
  })

  revalidatePath('/admin/tenants')
  revalidatePath(`/admin/tenants/${tenantId}`)
  return { success: true }
}

export async function reactivateTenant(tenantId: string) {
  const adminUser = await verifyAdminRole()
  const supabase = await createClient(true)

  const { data: tenant } = await supabase.from('tenants').update({ status: 'active' }).eq('id', tenantId).select().single()
  const { data: owner } = await supabase.from('users').select('email').eq('tenant_id', tenantId).eq('role', 'owner').single()

  if (owner && tenant) {
    await sendReactivationEmail({
      email: owner.email,
      storeName: tenant.name
    })
  }

  await supabase.from('admin_actions').insert({
    admin_id: adminUser.id,
    action: 'TENANT_REACTIVATED',
    target_type: 'tenant',
    target_id: tenantId,
    target_name: tenant?.name
  })

  revalidatePath('/admin/tenants')
  revalidatePath(`/admin/tenants/${tenantId}`)
  return { success: true }
}

export async function approveMedicine(medicineId: string, editedData?: any) {
  const adminUser = await verifyAdminRole()
  const supabase = await createClient(true)

  const updatePayload: any = { scope: 'global' }
  if (editedData) {
    if (editedData.name) updatePayload.name = editedData.name
    if (editedData.generic_name) updatePayload.generic_name = editedData.generic_name
    if (editedData.category) updatePayload.category = editedData.category
    if (editedData.company) updatePayload.company = editedData.company
  }

  const { data: medicine } = await supabase
    .from('medicines')
    .update(updatePayload)
    .eq('id', medicineId)
    .select()
    .single()

  if (medicine?.submitted_by) {
    // Notify tenant
    await supabase.from('notifications').insert({
      tenant_id: medicine.submitted_by,
      type: 'medicine_approved',
      title: 'Medicine Approved!',
      message: `Your submission for ${medicine.name} has been approved and added to the global database.`,
      data: { medicine_id: medicineId }
    })
  }

  await supabase.from('admin_actions').insert({
    admin_id: adminUser.id,
    action: 'MEDICINE_APPROVED',
    target_type: 'medicine',
    target_id: medicineId,
    target_name: medicine?.name
  })

  revalidatePath('/admin/medicines/pending')
  revalidatePath('/admin/medicines')
  return { success: true }
}

export async function rejectMedicine(medicineId: string, reason: string) {
  const adminUser = await verifyAdminRole()
  const supabase = await createClient(true)

  const { data: medicine } = await supabase
    .from('medicines')
    .update({ scope: 'rejected' })
    .eq('id', medicineId)
    .select()
    .single()

  if (medicine?.submitted_by) {
    await supabase.from('notifications').insert({
      tenant_id: medicine.submitted_by,
      type: 'medicine_rejected',
      title: 'Medicine Submission Update',
      message: `Your submission for ${medicine.name} was not approved. Reason: ${reason}`,
      data: { medicine_id: medicineId, reason }
    })
  }

  await supabase.from('admin_actions').insert({
    admin_id: adminUser.id,
    action: 'MEDICINE_REJECTED',
    target_type: 'medicine',
    target_id: medicineId,
    target_name: medicine?.name,
    details: { reason }
  })

  revalidatePath('/admin/medicines/pending')
  return { success: true }
}

export async function deleteTenant(tenantId: string, confirmStoreName: string) {
  const adminUser = await verifyAdminRole()
  const supabase = await createClient(true)

  const { data: tenant } = await supabase.from('tenants').select('name, owner_email').eq('id', tenantId).single()
  if (!tenant || tenant.name !== confirmStoreName) {
    throw new Error('Store name confirmation mismatch')
  }

  // Log before deletion
  await supabase.from('admin_actions').insert({
    admin_id: adminUser.id,
    action: 'TENANT_DELETED',
    target_type: 'tenant',
    target_id: tenantId,
    target_name: tenant.name,
    details: { owner_email: tenant.owner_email }
  })

  // Cascade delete handles most tables via FKs
  // but public.users -> auth.users needs manual handling if not automated by Supabase
  const { data: users } = await supabase.from('users').select('id').eq('tenant_id', tenantId)

  // Delete auth users
  if (users) {
    for (const user of users) {
      await supabase.auth.admin.deleteUser(user.id)
    }
  }

  await supabase.from('tenants').delete().eq('id', tenantId)

  revalidatePath('/admin/tenants')
  return { success: true }
}
