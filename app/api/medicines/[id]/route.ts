import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tenant_id = session.user.app_metadata.tenant_id;

  const { data, error } = await supabase
    .from('medicines')
    .select('*, store_medicines(*)')
    .eq('id', params.id)
    .eq('store_medicines.tenant_id', tenant_id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const role = session.user.app_metadata.role;
  const tenant_id = session.user.app_metadata.tenant_id;
  const body = await request.json();

  // Check if medicine exists and permissions
  const { data: medicine, error: fetchError } = await supabase
    .from('medicines')
    .select('*')
    .eq('id', params.id)
    .single();

  if (fetchError || !medicine) {
    return NextResponse.json({ error: 'Medicine not found' }, { status: 404 });
  }

  const isSuperAdmin = role === 'super_admin';
  const isOwner = medicine.submitted_by === tenant_id && medicine.scope !== 'global';

  if (!isSuperAdmin && !isOwner) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data, error } = await supabase
    .from('medicines')
    .update(body)
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const role = session.user.app_metadata.role;
  const tenant_id = session.user.app_metadata.tenant_id;

  const { data: medicine, error: fetchError } = await supabase
    .from('medicines')
    .select('*')
    .eq('id', params.id)
    .single();

  if (fetchError || !medicine) {
    return NextResponse.json({ error: 'Medicine not found' }, { status: 404 });
  }

  const isSuperAdmin = role === 'super_admin';
  const isOwner = medicine.submitted_by === tenant_id && medicine.scope === 'private';

  if (!isSuperAdmin && !isOwner) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Check for sales history in sale_items or purchase history
  // If it's a global medicine, we don't delete it here.
  // If it's a private medicine, we check if any store has sold it.
  const { data: storeMedicines } = await supabase
    .from('store_medicines')
    .select('id')
    .eq('medicine_id', params.id);

  if (storeMedicines && storeMedicines.length > 0) {
    const storeMedicineIds = storeMedicines.map(sm => sm.id);
    const { count: salesCount } = await supabase
      .from('sale_items')
      .select('*', { count: 'exact', head: true })
      .in('store_medicine_id', storeMedicineIds);

    if (salesCount && salesCount > 0) {
      return NextResponse.json({ error: 'Cannot delete medicine with sales history' }, { status: 400 });
    }
  }

  const { error } = await supabase
    .from('medicines')
    .delete()
    .eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
