'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

export const customerSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().regex(/^03[0-9]{2}-?[0-9]{7}$/, 'Please enter a valid Pakistani phone number').optional().or(z.literal('')),
  cnic: z.string().regex(/^[0-9]{5}-[0-9]{7}-[0-9]{1}$/, 'Please enter a valid CNIC (XXXXX-XXXXXXX-X)').optional().or(z.literal('')),
  address: z.string().optional(),
  notes: z.string().optional(),
  credit_limit: z.number().optional().nullable(),
  initial_credit_balance: z.number().default(0),
})

export async function createCustomer(data: z.infer<typeof customerSchema>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const tenantId = user.app_metadata.tenant_id

  // Check role
  const role = user.app_metadata.role
  if (!['owner', 'admin', 'super_admin', 'cashier'].includes(role)) {
    throw new Error('Unauthorized')
  }

  // Duplicate checks
  if (data.phone) {
    const { data: existing } = await supabase
      .from('customers')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('phone', data.phone)
      .eq('is_active', true)
      .single()
    if (existing) throw new Error('Customer with this phone already exists')
  }

  if (data.cnic) {
    const { data: existing } = await supabase
      .from('customers')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('cnic', data.cnic)
      .eq('is_active', true)
      .single()
    if (existing) throw new Error('Customer with this CNIC already exists')
  }

  const { data: customer, error } = await supabase
    .from('customers')
    .insert({
      tenant_id: tenantId,
      name: data.name,
      phone: data.phone || null,
      cnic: data.cnic || null,
      address: data.address || null,
      notes: data.notes || null,
      credit_limit: data.credit_limit || null,
      credit_balance: data.initial_credit_balance,
      is_active: true
    })
    .select()
    .single()

  if (error) throw error

  // Audit initial credit
  if (data.initial_credit_balance > 0) {
    await supabase.from('credit_transactions').insert({
      tenant_id: tenantId,
      customer_id: customer.id,
      type: 'adjustment',
      amount: data.initial_credit_balance,
      balance_after: data.initial_credit_balance,
      notes: 'Opening balance — added during customer registration',
      created_by: user.id
    })
  }

  // Audit log
  await supabase.from('audit_logs').insert({
    tenant_id: tenantId,
    user_id: user.id,
    action: 'CREATE_CUSTOMER',
    table_name: 'customers',
    record_id: customer.id,
    new_value: customer
  })

  revalidatePath('/customers')
  return customer
}

export async function updateCustomer(id: string, data: Partial<z.infer<typeof customerSchema>>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const tenantId = user.app_metadata.tenant_id

  if (!['owner', 'admin', 'super_admin'].includes(user.app_metadata.role)) {
    throw new Error('Forbidden')
  }

  const { data: oldData } = await supabase.from('customers').select('*').eq('id', id).single()

  const { data: customer, error } = await supabase
    .from('customers')
    .update({
      name: data.name,
      phone: data.phone || null,
      cnic: data.cnic || null,
      address: data.address || null,
      notes: data.notes || null,
      credit_limit: data.credit_limit
    })
    .eq('id', id)
    .eq('tenant_id', tenantId)
    .select()
    .single()

  if (error) throw error

  await supabase.from('audit_logs').insert({
    tenant_id: tenantId,
    user_id: user.id,
    action: 'UPDATE_CUSTOMER',
    table_name: 'customers',
    record_id: id,
    old_value: oldData,
    new_value: customer
  })

  revalidatePath('/customers')
  revalidatePath(`/customers/${id}`)
  return customer
}

export async function deleteCustomer(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const tenantId = user.app_metadata.tenant_id

  if (!['owner', 'admin', 'super_admin'].includes(user.app_metadata.role)) {
    throw new Error('Forbidden')
  }

  const { data: customer } = await supabase
    .from('customers')
    .select('credit_balance')
    .eq('id', id)
    .eq('tenant_id', tenantId)
    .single()

  if (customer && Number(customer.credit_balance) !== 0) {
    throw new Error(`Cannot deactivate customer with outstanding credit balance of Rs. ${customer.credit_balance}. Please record payment first.`)
  }

  const { error } = await supabase
    .from('customers')
    .update({ is_active: false })
    .eq('id', id)
    .eq('tenant_id', tenantId)

  if (error) throw error

  await supabase.from('audit_logs').insert({
    tenant_id: tenantId,
    user_id: user.id,
    action: 'DELETE_CUSTOMER',
    table_name: 'customers',
    record_id: id
  })

  revalidatePath('/customers')
}

export async function recordCreditPayment(customerId: string, data: {
  amount: number,
  payment_method: string,
  reference_no?: string,
  transaction_date?: string,
  notes?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const tenantId = user.app_metadata.tenant_id

  if (!['owner', 'admin', 'super_admin'].includes(user.app_metadata.role)) {
    throw new Error('Forbidden')
  }

  const { data: customer } = await supabase
    .from('customers')
    .select('credit_balance')
    .eq('id', customerId)
    .eq('tenant_id', tenantId)
    .single()

  if (!customer) throw new Error('Customer not found')

  const newBalance = Number(customer.credit_balance) - data.amount

  const { error: updateError } = await supabase
    .from('customers')
    .update({ credit_balance: newBalance })
    .eq('id', customerId)
    .eq('tenant_id', tenantId)

  if (updateError) throw updateError

  const { data: transaction, error: txError } = await supabase
    .from('credit_transactions')
    .insert({
      tenant_id: tenantId,
      customer_id: customerId,
      type: 'payment',
      amount: data.amount,
      balance_after: newBalance,
      payment_method: data.payment_method,
      reference_no: data.reference_no,
      notes: data.notes,
      created_at: data.transaction_date || new Date().toISOString(),
      created_by: user.id
    })
    .select()
    .single()

  if (txError) throw txError

  await supabase.from('audit_logs').insert({
    tenant_id: tenantId,
    user_id: user.id,
    action: 'CREDIT_PAYMENT',
    table_name: 'customers',
    record_id: customerId,
    new_value: transaction
  })

  revalidatePath('/customers')
  revalidatePath(`/customers/${customerId}`)
  return transaction
}
