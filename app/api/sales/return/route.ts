import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { Database } from '@/types';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tenant_id = session.user.app_metadata.tenant_id;
  const { original_sale_id, items, reason, refund_method } = await request.json();

  try {
    // 1. Fetch original sale to verify
    const { data: originalSale } = await supabase
      .from('sales')
      .select('*')
      .eq('id', original_sale_id)
      .eq('tenant_id', tenant_id)
      .single();

    if (!originalSale) return NextResponse.json({ error: 'Original sale not found' }, { status: 404 });

    // 2. Create return sale record (negative values)
    const { data: invoiceNo } = await supabase.rpc('generate_invoice_no', { p_tenant_id: tenant_id });

    // Calculate refund totals based on items
    let refundSubtotal = 0;
    const returnItems = [];

    for (const item of items) {
      const { data: originalItem } = await supabase
        .from('sale_items')
        .select('*')
        .eq('id', item.sale_item_id)
        .single();

      if (originalItem) {
        const itemRefund = originalItem.unit_price * item.qty;
        refundSubtotal += itemRefund;
        returnItems.push({
          tenant_id,
          medicine_name: originalItem.medicine_name,
          store_medicine_id: originalItem.store_medicine_id,
          qty: -item.qty,
          unit_price: originalItem.unit_price,
          subtotal: -itemRefund,
          discount: 0 // Simplification
        });

        // 3. Restore stock
        await supabase.rpc('increment_stock', {
          p_store_medicine_id: originalItem.store_medicine_id,
          p_qty: item.qty,
          p_tenant_id: tenant_id
        });
      }
    }

    const { data: returnSale, error: saleError } = await supabase
      .from('sales')
      .insert({
        tenant_id,
        user_id: session.user.id,
        customer_id: originalSale.customer_id,
        invoice_no: `RET-${invoiceNo}`,
        subtotal: -refundSubtotal,
        total: -refundSubtotal,
        payment_method: refund_method,
        is_return: true,
        original_sale_id: original_sale_id,
        notes: `Return: ${reason}`
      })
      .select()
      .single();

    if (saleError) throw saleError;

    // Insert items
    const finalItems = returnItems.map(ri => ({ ...ri, sale_id: returnSale.id }));
    await supabase.from('sale_items').insert(finalItems);

    return NextResponse.json(returnSale);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
