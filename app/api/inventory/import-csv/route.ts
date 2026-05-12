import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { Database } from '@/types';
import { mapDRAPToCategory, isControlledSubstance } from '@/lib/medicines/categories';

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
  const { rows } = await request.json();

  const results = {
    linked: 0,
    private: 0,
    errors: 0,
    details: [] as any[]
  };

  for (const row of rows) {
    try {
      // Step 1: Try exact match for medicine
      let medicineId: string | null = null;
      let isAutoLinked = false;

      const { data: exactMatch } = await supabase
        .from('medicines')
        .select('id')
        .ilike('name', row.name)
        .eq('scope', 'global')
        .maybeSingle();

      if (exactMatch) {
        medicineId = exactMatch.id;
        isAutoLinked = true;
      } else {
        // Step 2: Trigram similarity (simplified here, in real app use RPC)
        const { data: fuzzyMatch } = await supabase
          .rpc('search_medicines_trigram', { p_query: row.name, p_limit: 1 });

        if (fuzzyMatch && fuzzyMatch.length > 0 && fuzzyMatch[0].similarity > 0.8) {
          medicineId = fuzzyMatch[0].id;
          isAutoLinked = true;
        }
      }

      // Step 3: If not linked, create private medicine
      if (!medicineId) {
        const { data: newMed, error: medError } = await supabase
          .from('medicines')
          .insert({
            name: row.name,
            generic_name: row.generic_name,
            category: row.category || mapDRAPToCategory(row.name, row.generic_name || ''),
            company: row.company,
            unit: row.unit,
            is_controlled: isControlledSubstance(row.name, row.generic_name || ''),
            scope: 'private',
            submitted_by: tenant_id
          })
          .select('id')
          .single();

        if (medError) throw medError;
        medicineId = newMed.id;
        results.private++;
      } else {
        results.linked++;
      }

      // Step 4: Create store_medicines record
      const { error: storeError } = await supabase
        .from('store_medicines')
        .upsert({
          tenant_id,
          medicine_id: medicineId,
          sale_price: Number(row.sale_price),
          purchase_price: row.purchase_price ? Number(row.purchase_price) : null,
          stock_qty: Number(row.stock_qty),
          reorder_level: row.reorder_level ? Number(row.reorder_level) : 10,
          expiry_date: row.expiry_date || null,
          barcode: row.barcode || null,
          is_active: true
        }, { onConflict: 'tenant_id,medicine_id' });

      if (storeError) throw storeError;

    } catch (error: any) {
      results.errors++;
      results.details.push({ name: row.name, error: error.message });
    }
  }

  return NextResponse.json(results);
}
