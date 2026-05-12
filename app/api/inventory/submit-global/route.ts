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
  const { medicine_id } = await request.json();

  // Validate ownership and current scope
  const { data: medicine, error: fetchError } = await supabase
    .from('medicines')
    .select('scope, submitted_by')
    .eq('id', medicine_id)
    .single();

  if (fetchError || !medicine) {
    return NextResponse.json({ error: 'Medicine not found' }, { status: 404 });
  }

  if (medicine.submitted_by !== tenant_id || medicine.scope !== 'private') {
    return NextResponse.json({ error: 'Only private medicines submitted by your store can be promoted to global.' }, { status: 403 });
  }

  const { data, error } = await supabase
    .from('medicines')
    .update({ scope: 'pending_review' })
    .eq('id', medicine_id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Notify super admins
  await supabase.from('notifications').insert({
    tenant_id: '00000000-0000-0000-0000-000000000000', // Assuming a system or super_admin tenant ID if one exists, or handle globally
    type: 'global_review_requested',
    title: 'New Global Medicine Review',
    message: `Store ${session.user.user_metadata.store_name} submitted a new medicine for review: ${data.name}`,
    data: { medicine_id, tenant_id }
  });

  return NextResponse.json(data);
}
