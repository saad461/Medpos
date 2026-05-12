import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { Database } from '@/types';
import { MEDICINE_CATEGORIES, MEDICINE_UNITS } from '@/lib/medicines/categories';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);
  const category = searchParams.get('category');
  const scope = searchParams.get('scope');
  const search = searchParams.get('search');

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const offset = (page - 1) * limit;

  const tenant_id = session.user.app_metadata.tenant_id;

  let query = supabase
    .from('medicines')
    .select('*, store_medicines(id)', { count: 'exact' })
    .eq('store_medicines.tenant_id', tenant_id)
    .range(offset, offset + limit - 1);

  if (category) {
    query = query.eq('category', category);
  }

  if (scope) {
    query = query.eq('scope', scope);
  }

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  const { data, count, error } = await query;

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

  const tenant_id = session.user.app_metadata.tenant_id;
  const body = await request.json();

  const { name, generic_name, category, company, unit, drap_mrp, is_controlled } = body;

  // Validation
  if (!name || name.length < 3 || name.length > 200) {
    return NextResponse.json({ error: 'Name must be between 3 and 200 characters' }, { status: 400 });
  }

  if (category && !MEDICINE_CATEGORIES.find(c => c.id === category)) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
  }

  if (unit && !MEDICINE_UNITS.includes(unit as any)) {
    return NextResponse.json({ error: 'Invalid unit' }, { status: 400 });
  }

  if (drap_mrp && (isNaN(drap_mrp) || drap_mrp < 0)) {
    return NextResponse.json({ error: 'DRAP MRP must be a positive number' }, { status: 400 });
  }

  // Duplicate check (simple)
  const { data: existing } = await supabase
    .from('medicines')
    .select('name')
    .ilike('name', name)
    .limit(1);

  if (existing && existing.length > 0) {
    // In a real app we might return a warning or 409
  }

  const { data, error } = await supabase
    .from('medicines')
    .insert({
      name,
      generic_name,
      category,
      company,
      unit,
      drap_mrp,
      is_controlled: !!is_controlled,
      scope: 'private',
      submitted_by: tenant_id
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
