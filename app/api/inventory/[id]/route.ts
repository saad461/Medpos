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
    .from('store_medicines')
    .select(`
      *,
      medicine:medicines(*),
      adjustments:stock_adjustments(*),
      sales:sale_items(
        *,
        sale:sales(*)
      )
    `)
    .eq('id', params.id)
    .eq('tenant_id', tenant_id)
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
  const supabase = await createClient();
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
  const body = await request.json();

  // Fetch old value for audit log
  const { data: oldValue } = await supabase
    .from('store_medicines')
    .select('*')
    .eq('id', params.id)
    .eq('tenant_id', tenant_id)
    .single();

  if (!oldValue) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { data, error } = await supabase
    .from('store_medicines')
    .update(body)
    .eq('id', params.id)
    .eq('tenant_id', tenant_id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Audit log
  await supabase.from('audit_logs').insert({
    tenant_id,
    user_id: session.user.id,
    action: 'UPDATE_INVENTORY',
    table_name: 'store_medicines',
    record_id: params.id,
    old_value: oldValue,
    new_value: data
  });

  return NextResponse.json(data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

  // Soft delete
  const { error } = await supabase
    .from('store_medicines')
    .update({ is_active: false })
    .eq('id', params.id)
    .eq('tenant_id', tenant_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from('audit_logs').insert({
    tenant_id,
    user_id: session.user.id,
    action: 'DEACTIVATE_INVENTORY',
    table_name: 'store_medicines',
    record_id: params.id
  });

  return NextResponse.json({ success: true });
}
