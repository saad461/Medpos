'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Resend } from 'resend'
import { PurchaseOrderEmail } from '@/emails/purchase-order'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function createPurchaseOrder(data: {
  supplier_id: string,
  items: { store_medicine_id: string, medicine_name: string, qty: number, unit_price: number }[],
  notes?: string,
  expected_delivery?: string,
  send_email?: boolean
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const tenantId = user.app_metadata.tenant_id

  if (!['owner', 'admin', 'super_admin'].includes(user.app_metadata.role)) {
    throw new Error('Forbidden')
  }

  // Generate PO Number
  const { data: poNumber, error: poNumErr } = await supabase.rpc('generate_po_number', { p_tenant_id: tenantId })
  if (poNumErr) throw poNumErr

  const totalAmount = data.items.reduce((sum, item) => sum + (item.qty * item.unit_price), 0)

  const { data: po, error: poErr } = await supabase
    .from('purchase_orders')
    .insert({
      tenant_id: tenantId,
      supplier_id: data.supplier_id,
      po_number: poNumber,
      total_amount: totalAmount,
      status: data.send_email ? 'sent' : 'draft',
      notes: data.notes,
      ordered_at: new Date().toISOString(),
      // expected_delivery might need a date column if added to PO table
    })
    .select()
    .single()

  if (poErr) throw poErr

  // Insert items
  const itemsToInsert = data.items.map(item => ({
    tenant_id: tenantId,
    purchase_order_id: po.id,
    store_medicine_id: item.store_medicine_id,
    medicine_name: item.medicine_name,
    qty: item.qty,
    unit_price: item.unit_price,
    subtotal: item.qty * item.unit_price
  }))

  const { error: itemsErr } = await supabase.from('purchase_order_items').insert(itemsToInsert)
  if (itemsErr) throw itemsErr

  // Send Email
  if (data.send_email && resend) {
    const { data: supplier } = await supabase.from('suppliers').select('*').eq('id', data.supplier_id).single()
    const { data: store } = await supabase.from('store_settings').select('*').eq('tenant_id', tenantId).single()
    const { data: tenant } = await supabase.from('tenants').select('name').eq('id', tenantId).single()

    if (supplier?.email) {
      await resend.emails.send({
        from: 'MedPOS <no-reply@medpos.pk>',
        to: supplier.email,
        subject: `Purchase Order ${poNumber} from ${tenant.name}`,
        react: PurchaseOrderEmail({
          supplierName: supplier.name,
          storeName: tenant.name,
          storePhone: store.phone || '',
          poNumber: poNumber,
          poDate: new Date().toLocaleDateString(),
          expectedDelivery: data.expected_delivery || 'Not specified',
          items: data.items.map(i => ({ name: i.medicine_name, qty: i.qty, unitPrice: i.unit_price })),
          totalAmount: totalAmount,
          notes: data.notes,
          logoUrl: store.logo_url
        })
      })
    }
  }

  await supabase.from('audit_logs').insert({
    tenant_id: tenantId,
    user_id: user.id,
    action: 'CREATE_PO',
    table_name: 'purchase_orders',
    record_id: po.id,
    new_value: po
  })

  revalidatePath('/suppliers/purchase-orders')
  return po
}

export async function receiveStock(poId: string, data: {
  items: { id: string, store_medicine_id: string, qty_received: number, unit_price: number, expiry_date: string }[],
  invoice_no?: string,
  is_partial: boolean
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const tenantId = user.app_metadata.tenant_id

  if (!['owner', 'admin', 'super_admin'].includes(user.app_metadata.role)) {
    throw new Error('Forbidden')
  }

  // 1. Process items and update stock
  for (const item of data.items) {
    // Update store_medicine
    const { data: storeMed } = await supabase
      .from('store_medicines')
      .select('stock_qty')
      .eq('id', item.store_medicine_id)
      .single()

    const newQty = (storeMed?.stock_qty || 0) + item.qty_received

    await supabase
      .from('store_medicines')
      .update({
        stock_qty: newQty,
        purchase_price: item.unit_price,
        expiry_date: item.expiry_date
      })
      .eq('id', item.store_medicine_id)

    // Insert stock adjustment
    await supabase.from('stock_adjustments').insert({
      tenant_id: tenantId,
      store_medicine_id: item.store_medicine_id,
      user_id: user.id,
      qty_before: storeMed?.stock_qty || 0,
      qty_change: item.qty_received,
      qty_after: newQty,
      reason: 'received_stock',
      notes: `Received from PO# ${poId}`
    })

    // Update PO item qty_received
    const { data: poItem } = await supabase.from('purchase_order_items').select('qty_received').eq('id', item.id).single()
    await supabase
      .from('purchase_order_items')
      .update({ qty_received: (poItem?.qty_received || 0) + item.qty_received })
      .eq('id', item.id)
  }

  // 2. Update PO status
  const status = data.is_partial ? 'partial' : 'received'
  const totalAmountReceived = data.items.reduce((sum, item) => sum + (item.qty_received * item.unit_price), 0)

  await supabase
    .from('purchase_orders')
    .update({
      status,
      received_at: new Date().toISOString(),
      invoice_no: data.invoice_no
    })
    .eq('id', poId)

  // 3. Update supplier balance
  const { data: po } = await supabase.from('purchase_orders').select('supplier_id').eq('id', poId).single()
  if (po) {
    const { data: supplier } = await supabase.from('suppliers').select('balance_due').eq('id', po.supplier_id).single()
    await supabase
      .from('suppliers')
      .update({ balance_due: (Number(supplier?.balance_due) || 0) + totalAmountReceived })
      .eq('id', po.supplier_id)
  }

  await supabase.from('audit_logs').insert({
    tenant_id: tenantId,
    user_id: user.id,
    action: 'RECEIVE_STOCK',
    table_name: 'purchase_orders',
    record_id: poId,
    new_value: { status, received_items: data.items.length }
  })

  revalidatePath('/suppliers/purchase-orders')
  revalidatePath(`/suppliers/purchase-orders/${poId}`)
}

export async function updatePOStatus(id: string, status: 'sent' | 'cancelled') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const tenantId = user.app_metadata.tenant_id

  const { error } = await supabase
    .from('purchase_orders')
    .update({ status })
    .eq('id', id)
    .eq('tenant_id', tenantId)

  if (error) throw error

  revalidatePath('/suppliers/purchase-orders')
  revalidatePath(`/suppliers/purchase-orders/${id}`)
}
