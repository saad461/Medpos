import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { Database } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tenant_id = session.user.app_metadata.tenant_id;

  const { data, error } = await supabase
    .from('sales')
    .select(`
      *,
      customer:customers(*),
      user:users(name),
      items:sale_items(
        *,
        store_medicine:store_medicines(
          *,
          medicine:medicines(*)
        )
      )
    `)
    .eq('id', params.id)
    .eq('tenant_id', tenant_id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Sale not found' }, { status: 404 });
  }

  // Get store settings
  const { data: settings } = await supabase
    .from('store_settings')
    .select('*')
    .eq('tenant_id', tenant_id)
    .single();

  return NextResponse.json({
    ...data,
    store_settings: settings
  });
}
