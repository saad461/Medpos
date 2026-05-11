import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types';
import { generateExportCSV } from '@/lib/inventory/csv';

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tenant_id = session.user.app_metadata.tenant_id;

  const { data, error } = await supabase
    .from('store_medicines')
    .select('*, medicine:medicines(*)')
    .eq('tenant_id', tenant_id)
    .eq('is_active', true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const csvString = generateExportCSV(data as any);
  const date = new Date().toISOString().split('T')[0];

  return new Response(csvString, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="inventory-${date}.csv"`,
    },
  });
}
