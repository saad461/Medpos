import { NextRequest, NextResponse } from 'next/server';
import { submitMedicineForReview } from '@/lib/submissions/actions';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { medicine_id, store_medicine_id, updated_data, notes } = body;

    const result = await submitMedicineForReview({
      medicineId: medicine_id,
      storeMedicineId: store_medicine_id,
      updatedData: updated_data,
      notes: notes
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: error.message === 'Unauthorized' ? 401 : error.message.includes('Forbidden') ? 403 : 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const medicineId = request.nextUrl.searchParams.get('medicine_id');

  if (!medicineId) {
    return NextResponse.json({ error: 'medicine_id is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('medicine_submissions')
    .select('*')
    .eq('medicine_id', medicineId)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || null);
}
