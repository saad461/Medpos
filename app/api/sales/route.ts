import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { Database } from '@/types';
import { z } from 'zod';

const createSaleSchema = z.object({
  items: z.array(z.object({
    store_medicine_id: z.string().uuid(),
    qty: z.number().positive(),
    unit_price: z.number().nonnegative(),
    discount: z.number().nonnegative(),
    subtotal: z.number().nonnegative()
  })),
  customer_id: z.string().uuid().nullable(),
  subtotal: z.number().nonnegative(),
  discount: z.number().nonnegative(),
  tax: z.number().nonnegative(),
  total: z.number().nonnegative(),
  payment_method: z.enum(['cash', 'card', 'credit']),
  amount_received: z.number().nonnegative().optional(),
  change_given: z.number().nonnegative().optional(),
  notes: z.string().optional()
});

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tenant_id = session.user.app_metadata.tenant_id;
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const search = searchParams.get('search');

  const offset = (page - 1) * limit;

  let query = supabase
    .from('sales')
    .select('*, customer:customers(name)', { count: 'exact' })
    .eq('tenant_id', tenant_id)
    .order('created_at', { ascending: false });

  if (search) {
    query = query.ilike('invoice_no', `%${search}%`);
  }

  const { data, count, error } = await query.range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data,
    pagination: {
      page,
      limit,
      total: count,
      pages: Math.ceil((count || 0) / limit)
    }
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const role = session.user.app_metadata.role;
  if (role === 'pharmacist') {
    return NextResponse.json({ error: 'Pharmacists cannot create sales.' }, { status: 403 });
  }

  const tenant_id = session.user.app_metadata.tenant_id;

  try {
    const body = await request.json();
    const validated = createSaleSchema.parse(body);

    // Server-side validation
    let serverSubtotal = 0;
    for (const item of validated.items) {
      const { data: storeMed, error: fetchError } = await supabase
        .from('store_medicines')
        .select('sale_price, stock_qty, medicine:medicines(name)')
        .eq('id', item.store_medicine_id)
        .eq('tenant_id', tenant_id)
        .single();

      if (fetchError || !storeMed) {
        return NextResponse.json({ error: `Medicine not found in your inventory.` }, { status: 404 });
      }

      if (storeMed.stock_qty < item.qty) {
        return NextResponse.json({ error: `Insufficient stock for ${(storeMed.medicine as any).name}. Available: ${storeMed.stock_qty}` }, { status: 400 });
      }

      // Check for unauthorized price overrides
      if (Number(storeMed.sale_price) !== item.unit_price) {
        if (!['owner', 'admin', 'super_admin'].includes(role)) {
          return NextResponse.json({ error: `Price override not permitted for ${(storeMed.medicine as any).name}.` }, { status: 403 });
        }
        // Log override
        await supabase.from('audit_logs').insert({
          tenant_id,
          user_id: session.user.id,
          action: 'PRICE_OVERRIDE',
          table_name: 'sales',
          record_id: item.store_medicine_id,
          old_value: { sale_price: storeMed.sale_price },
          new_value: { override_price: item.unit_price }
        });
      }

      serverSubtotal += (item.unit_price * item.qty) - item.discount;
    }

    if (Math.abs(serverSubtotal - validated.subtotal) > 0.01) {
      return NextResponse.json({ error: 'Price mismatch. Please refresh and try again.' }, { status: 400 });
    }

    // Process sale in transaction-like way (Supabase doesn't have true transactions in JS client, use RPC for critical sections)
    // For now, doing it sequentially:

    // 1. Create Sale
    // We need to generate invoice number
    const { data: invoiceNo } = await supabase.rpc('generate_invoice_no', { p_tenant_id: tenant_id });

    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert({
        tenant_id,
        user_id: session.user.id,
        customer_id: validated.customer_id,
        invoice_no: invoiceNo,
        subtotal: validated.subtotal,
        discount: validated.discount,
        tax: validated.tax,
        total: validated.total,
        payment_method: validated.payment_method,
        amount_received: validated.amount_received,
        change_given: validated.change_given,
        notes: validated.notes
      })
      .select()
      .single();

    if (saleError) throw saleError;

    // 2. Create items
    const saleItems = validated.items.map(item => ({
      tenant_id,
      sale_id: sale.id,
      store_medicine_id: item.store_medicine_id,
      medicine_name: '', // Should be fetched from medicines table ideally, or stored in body
      qty: item.qty,
      unit_price: item.unit_price,
      discount: item.discount,
      subtotal: item.subtotal
    }));

    // Re-fetch names for items
    for (const si of saleItems) {
      const { data: med } = await supabase
        .from('store_medicines')
        .select('medicine:medicines(name)')
        .eq('id', si.store_medicine_id)
        .single();
      si.medicine_name = (med?.medicine as any)?.name || 'Unknown Medicine';
    }

    const { error: itemsError } = await supabase.from('sale_items').insert(saleItems);
    if (itemsError) throw itemsError;

    // 3. Update stocks
    for (const item of validated.items) {
      const { error: stockError } = await supabase.rpc('decrement_stock', {
        p_store_medicine_id: item.store_medicine_id,
        p_qty: item.qty,
        p_tenant_id: tenant_id
      });
      if (stockError) throw stockError;
    }

    // 4. Update customer total spent
    if (validated.customer_id) {
      await supabase.rpc('update_customer_spent', {
        p_customer_id: validated.customer_id,
        p_amount: validated.total
      });
    }

    return NextResponse.json({
      sale_id: sale.id,
      invoice_no: invoiceNo,
      sale
    });

  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message || 'Checkout failed' }, { status: 500 });
  }
}
