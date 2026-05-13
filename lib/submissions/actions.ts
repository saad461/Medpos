'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createNotification } from '@/lib/notifications/create'
import { createAuditLog } from '@/lib/audit'
import { NOTIFICATION_TYPES } from '@/lib/notifications/create'
import { Resend } from 'resend'
import MedicineSubmissionReceivedEmail from '@/emails/medicine-submission-received'

export async function submitMedicineForReview({
  medicineId,
  storeMedicineId,
  updatedData,
  notes,
}: {
  medicineId: string
  storeMedicineId: string
  updatedData: {
    name: string
    generic_name?: string
    category?: string
    company?: string
    unit?: string
    is_controlled: boolean
  }
  notes?: string
}) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const role = user.app_metadata.role
  const tenant_id = user.app_metadata.tenant_id

  if (role === 'cashier') {
    throw new Error('Forbidden: Cashiers cannot submit medicines')
  }

  // Verify ownership
  const { data: storeMedicine, error: ownershipError } = await supabase
    .from('store_medicines')
    .select('id, medicines(name)')
    .eq('id', storeMedicineId)
    .eq('tenant_id', tenant_id)
    .single()

  if (ownershipError || !storeMedicine) {
    throw new Error('Medicine not found in your inventory')
  }

  // Check if already pending
  const { data: existingPending } = await supabase
    .from('medicine_submissions')
    .select('id')
    .eq('medicine_id', medicineId)
    .eq('status', 'pending_review')
    .single()

  if (existingPending) {
    throw new Error('Already submitted and under review')
  }

  const originalMedicineName = (storeMedicine.medicines as any).name

  // Update medicine
  const { error: updateError } = await supabase
    .from('medicines')
    .update({
      name: updatedData.name,
      generic_name: updatedData.generic_name,
      category: updatedData.category,
      company: updatedData.company,
      unit: updatedData.unit,
      is_controlled: updatedData.is_controlled,
      scope: 'pending_review'
    })
    .eq('id', medicineId)

  if (updateError) throw updateError

  // Create submission record
  const { data: submission, error: submissionError } = await supabase
    .from('medicine_submissions')
    .insert({
      tenant_id,
      medicine_id: medicineId,
      submitted_by_user: user.id,
      status: 'pending_review',
      notes: notes
    })
    .select()
    .single()

  if (submissionError) throw submissionError

  // Get tenant details for email
  const { data: tenant } = await supabase
    .from('tenants')
    .select('name, owner_email')
    .eq('id', tenant_id)
    .single()

  const { data: storeSettings } = await supabase
    .from('store_settings')
    .select('city')
    .eq('tenant_id', tenant_id)
    .single()

  // Notify admin (Super Admin)
  // Assuming super admin tenant is also traceable or we just send to specific email
  // The requirement says "create in-app notification for super_admin"
  // Usually super admins have a specific role but might belong to any tenant or a special one.
  // For simplicity, we'll notify all super admins.
  const supabaseAdmin = createClient(true) // Use service role for admin notify
  const { data: superAdmins } = await supabaseAdmin
    .from('users')
    .select('id, tenant_id')
    .eq('role', 'super_admin')

  if (superAdmins) {
    for (const admin of superAdmins) {
      await createNotification({
        tenant_id: admin.tenant_id,
        user_id: admin.id,
        type: NOTIFICATION_TYPES.MEDICINE_SUBMISSION_RECEIVED as any,
        title: 'New Medicine Submission',
        message: `${tenant?.name} submitted ${updatedData.name} for review`,
        data: { submission_id: submission.id, medicine_id: medicineId }
      })
    }
  }

  // Notify store owner
  await createNotification({
    tenant_id,
    user_id: user.id,
    type: NOTIFICATION_TYPES.MEDICINE_APPROVED as any, // We don't have a specific "UNDER_REVIEW" type in the memory, but prompt says use these
    title: 'Submission Received',
    message: `Your submission for ${updatedData.name} is under review`,
  })

  // Send email to admin
  if (process.env.ADMIN_EMAIL && process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: process.env.ADMIN_EMAIL,
      replyTo: tenant?.owner_email,
      subject: `🔬 New Medicine Submission — ${updatedData.name} from ${tenant?.name}`,
      react: MedicineSubmissionReceivedEmail({
        adminEmail: process.env.ADMIN_EMAIL,
        storeName: tenant?.name || 'Unknown Store',
        storeCity: storeSettings?.city || '',
        medicineName: updatedData.name,
        genericName: updatedData.generic_name,
        category: updatedData.category,
        company: updatedData.company,
        submitterNotes: notes,
        reviewUrl: `${process.env.NEXT_PUBLIC_APP_URL}/admin/medicines/pending`,
      }),
    })
  }

  // Audit log
  await createAuditLog({
    tenant_id,
    user_id: user.id,
    action: 'SUBMIT_MEDICINE',
    table_name: 'medicine_submissions',
    record_id: submission.id,
    old_value: {
      scope: 'private',
      name: originalMedicineName,
    },
    new_value: {
      scope: 'pending_review',
      submission_id: submission.id,
      name: updatedData.name,
      notes: notes || null,
    },
  })

  revalidatePath('/dashboard/inventory/submissions')
  revalidatePath(`/dashboard/inventory/${medicineId}`)

  return { success: true, submissionId: submission.id }
}

export async function cancelSubmission({
  medicineId,
  submissionId,
}: {
  medicineId: string
  submissionId: string
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const tenant_id = user.app_metadata.tenant_id

  // Verify status is pending_review
  const { data: submission, error: submissionError } = await supabase
    .from('medicine_submissions')
    .select('status')
    .eq('id', submissionId)
    .eq('tenant_id', tenant_id)
    .single()

  if (submissionError || !submission) throw new Error('Submission not found')
  if (submission.status !== 'pending_review') {
    throw new Error('Cannot cancel a submission that has already been reviewed')
  }

  // Update submission status
  await supabase
    .from('medicine_submissions')
    .update({ status: 'cancelled' })
    .eq('id', submissionId)

  // Revert medicine scope
  await supabase
    .from('medicines')
    .update({ scope: 'private' })
    .eq('id', medicineId)

  await createAuditLog({
    tenant_id,
    user_id: user.id,
    action: 'CANCEL_SUBMISSION',
    table_name: 'medicine_submissions',
    record_id: submissionId,
  })

  revalidatePath('/dashboard/inventory/submissions')
  revalidatePath(`/dashboard/inventory/${medicineId}`)

  return { success: true }
}

export async function resubmitMedicine({
  medicineId,
  storeMedicineId,
  updatedData,
  notes,
}: {
  medicineId: string
  storeMedicineId: string
  updatedData: {
    name: string
    generic_name?: string
    category?: string
    company?: string
    unit?: string
    is_controlled: boolean
  }
  notes?: string
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const tenant_id = user.app_metadata.tenant_id

  // Verify the most recent submission has status = 'rejected' or 'cancelled'
  const { data: lastSubmission } = await supabase
    .from('medicine_submissions')
    .select('status')
    .eq('medicine_id', medicineId)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .single()

  if (lastSubmission && lastSubmission.status === 'pending_review') {
    throw new Error('Already has a pending submission')
  }

  // Call submitMedicineForReview (it will create a NEW record and update scope)
  return submitMedicineForReview({
    medicineId,
    storeMedicineId,
    updatedData,
    notes,
  })
}
