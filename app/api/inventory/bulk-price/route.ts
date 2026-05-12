import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { Database } from '@/types';
import { z } from 'zod';

const bulkPriceSchema = z.object({
  scope: z.enum(['all', 'category', 'company', 'selected']),
  categories: z.array(z.string()).optional(),
  companies: z.array(z.string()).optional(),
  medicine_ids: z.array(z.string().uuid()).optional(),
  update_type: z.enum(['increase_pct', 'decrease_pct', 'increase_flat', 'decrease_flat', 'set_exact']),
  value: z.number(),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const role = session.user.app_metadata.role;
  if (!['owner', 'admin', 'super_admin'].includes(role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  const tenant_id = session.user.app_metadata.tenant_id;

  try {
    const body = await request.json();
    const { scope, categories, companies, medicine_ids, update_type, value } = bulkPriceSchema.parse(body);

    // 1. Fetch affected medicines
    let query = supabase
      .from('store_medicines')
      .select('id, sale_price, medicine:medicines!inner(category, company)')
      .eq('tenant_id', tenant_id)
      .eq('is_active', true);

    if (scope === 'category' && categories) {
      query = query.in('medicines.category', categories);
    } else if (scope === 'company' && companies) {
      query = query.in('medicines.company', companies);
    } else if (scope === 'selected' && medicine_ids) {
      query = query.in('id', medicine_ids);
    }

    const { data: affected, error: fetchError } = await query;
    if (fetchError || !affected) return NextResponse.json({ error: fetchError?.message }, { status: 500 });

    // 2. Calculate and Update
    const updates = affected.map(item => {
      let newPrice = Number(item.sale_price);
      if (update_type === 'increase_pct') newPrice *= (1 + value / 100);
      else if (update_type === 'decrease_pct') newPrice *= (1 - value / 100);
      else if (update_type === 'increase_flat') newPrice += value;
      else if (update_type === 'decrease_flat') newPrice -= value;
      else if (update_type === 'set_exact') newPrice = value;

      newPrice = Math.max(0, Number(newPrice.toFixed(2)));
      return { id: item.id, sale_price: newPrice, old_price: item.sale_price };
    });

    // 3. Batch Update (Supabase doesn't support easy batch update of different values in one call without RPC)
    // For small sets (<100) we can do parallel updates or one RPC
    // Let's assume an RPC 'bulk_update_prices' exists or we do parallel (less ideal for large sets)

    /*
    CREATE OR REPLACE FUNCTION bulk_update_prices(p_updates jsonb)
    RETURNS void AS $$
    DECLARE
      item jsonb;
    BEGIN
      FOR item IN SELECT * FROM jsonb_array_elements(p_updates)
      LOOP
        UPDATE store_medicines
        SET sale_price = (item->>'sale_price')::numeric, updated_at = now()
        WHERE id = (item->>'id')::uuid;
      END LOOP;
    END;
    $$ LANGUAGE plpgsql;
    */

    const { error: updateError } = await supabase.rpc('bulk_update_prices', { p_updates: updates });

    if (updateError) {
      // Fallback: update individually if RPC fails
      for (const u of updates) {
        await supabase.from('store_medicines').update({ sale_price: u.sale_price }).eq('id', u.id);
      }
    }

    // 4. Batch Audit Logs
    const auditLogs = updates.map(u => ({
      tenant_id,
      user_id: session.user.id,
      action: 'BULK_PRICE_UPDATE',
      table_name: 'store_medicines',
      record_id: u.id,
      old_value: { sale_price: u.old_price },
      new_value: { sale_price: u.sale_price }
    }));

    await supabase.from('audit_logs').insert(auditLogs);

    return NextResponse.json({ updated_count: updates.length });

  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors }, { status: 400 });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
