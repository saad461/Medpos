import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types';
import { z } from 'zod';

const adjustStockSchema = z.object({
  store_medicine_id: z.string().uuid(),
  adjustment_type: z.enum(['add', 'remove', 'set']),
  quantity: z.number(),
  reason: z.string(),
  notes: z.string().optional(),
  expiry_date: z.string().optional(),
  purchase_price: z.number().optional(),
});

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const role = session.user.app_metadata.role;
  const allowedRoles = ['owner', 'admin', 'pharmacist', 'super_admin'];
  if (!allowedRoles.includes(role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  const tenant_id = session.user.app_metadata.tenant_id;

  try {
    const body = await request.json();
    const {
      store_medicine_id,
      adjustment_type,
      quantity,
      reason,
      notes,
      expiry_date,
      purchase_price
    } = adjustStockSchema.parse(body);

    // 1. Get current stock
    const { data: current, error: fetchError } = await supabase
      .from('store_medicines')
      .select('stock_qty')
      .eq('id', store_medicine_id)
      .eq('tenant_id', tenant_id)
      .single();

    if (fetchError || !current) {
      return NextResponse.json({ error: 'Medicine not found' }, { status: 404 });
    }

    // 2. Calculate new stock
    let newQty = current.stock_qty;
    if (adjustment_type === 'add') newQty += quantity;
    else if (adjustment_type === 'remove') newQty = Math.max(0, newQty - quantity);
    else if (adjustment_type === 'set') newQty = quantity;

    // 3. Update store_medicines
    const updateData: any = { stock_qty: newQty };
    if (expiry_date) updateData.expiry_date = expiry_date;
    if (purchase_price) updateData.purchase_price = purchase_price;

    const { data: updated, error: updateError } = await supabase
      .from('store_medicines')
      .update(updateData)
      .eq('id', store_medicine_id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // 4. Insert stock_adjustments
    await supabase.from('stock_adjustments').insert({
      tenant_id,
      store_medicine_id,
      user_id: session.user.id,
      qty_before: current.stock_qty,
      qty_change: adjustment_type === 'remove' ? -quantity : (adjustment_type === 'add' ? quantity : newQty - current.stock_qty),
      qty_after: newQty,
      reason: reason as any,
      notes
    });

    // 5. Audit log
    await supabase.from('audit_logs').insert({
      tenant_id,
      user_id: session.user.id,
      action: 'STOCK_ADJUSTMENT',
      table_name: 'store_medicines',
      record_id: store_medicine_id,
      old_value: { stock_qty: current.stock_qty },
      new_value: { stock_qty: newQty, adjustment_type, reason }
    });

    return NextResponse.json(updated);

  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors }, { status: 400 });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
