import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types';
import { z } from 'zod';

const addMedicineSchema = z.object({
  medicine_id: z.string().uuid(),
  sale_price: z.number().positive(),
  purchase_price: z.number().positive().optional(),
  stock_qty: z.number().min(0),
  reorder_level: z.number().min(0).default(10),
  expiry_date: z.string().optional(),
  barcode: z.string().optional(),
  location: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tenant_id = session.user.app_metadata.tenant_id;
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const search = searchParams.get('search');
  const category = searchParams.get('category');
  const status = searchParams.get('status');
  const sort = searchParams.get('sort') || 'name';
  const order = searchParams.get('order') || 'asc';

  const offset = (page - 1) * limit;

  let query = supabase
    .from('store_medicines')
    .select('*, medicine:medicines!inner(*)', { count: 'exact' })
    .eq('tenant_id', tenant_id)
    .eq('is_active', true);

  if (search) {
    query = query.or(`name.ilike.%${search}%,generic_name.ilike.%${search}%`, { foreignTable: 'medicines' });
  }

  if (category) {
    query = query.eq('medicines.category', category);
  }

  // Status filtering logic
  const now = new Date().toISOString().split('T')[0];
  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  if (status === 'low_stock') {
    // Note: filtering by column comparison is tricky in Supabase directly
    // Ideally we use a generated column or a view, but here we might need an RPC
  } else if (status === 'out_of_stock') {
    query = query.eq('stock_qty', 0);
  } else if (status === 'expiring_soon') {
    query = query.lte('expiry_date', thirtyDaysFromNow).gt('expiry_date', now);
  } else if (status === 'expired') {
    query = query.lt('expiry_date', now);
  }

  // Sorting
  if (sort === 'name') {
    query = query.order('name', { foreignTable: 'medicines', ascending: order === 'asc' });
  } else {
    query = query.order(sort, { ascending: order === 'asc' });
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
  const supabase = createRouteHandlerClient<Database>({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const role = session.user.app_metadata.role;
  const allowedRoles = ['owner', 'admin', 'pharmacist', 'super_admin'];
  if (!allowedRoles.includes(role)) {
    return NextResponse.json(
      { error: 'Insufficient permissions. Cashiers cannot modify inventory.' },
      { status: 403 }
    );
  }

  const tenant_id = session.user.app_metadata.tenant_id;

  try {
    const body = await request.json();
    const validatedData = addMedicineSchema.parse(body);

    const { data, error } = await supabase
      .from('store_medicines')
      .insert({
        ...validatedData,
        tenant_id
      })
      .select('*, medicine:medicines(*)')
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'This medicine is already in your inventory.' }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log to audit_logs
    await supabase.from('audit_logs').insert({
      tenant_id,
      user_id: session.user.id,
      action: 'ADD_MEDICINE',
      table_name: 'store_medicines',
      record_id: data.id,
      new_value: data
    });

    return NextResponse.json(data, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
