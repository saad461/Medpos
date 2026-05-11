import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { MEDICINE_CATEGORIES } from '@/lib/medicines/categories';
import { Database } from '@/types';

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient<Database>({ cookies });

  // Use SQL grouping and counting
  const { data: counts, error } = await supabase
    .from('medicines')
    .select('category')
    .not('category', 'is', null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Unfortunately Supabase JS client doesn't support GROUP BY directly easily without RPC or raw SQL
  // But we can do a slightly better reduce or use an RPC if performance is critical.
  // For 25k rows, a simple reduce on the returned categories is actually okay-ish but let's see.
  // A better way is using an RPC:

  /*
  CREATE OR REPLACE FUNCTION get_medicine_counts_by_category()
  RETURNS TABLE (category text, count bigint) AS $$
    SELECT category, count(*) FROM medicines GROUP BY category;
  $$ LANGUAGE sql;
  */

  const { data: rpcCounts, error: rpcError } = await supabase.rpc('get_medicine_counts_by_category');

  let categoriesWithCounts;
  if (!rpcError && rpcCounts) {
    const countsMap = new Map(rpcCounts.map((c: any) => [c.category, c.count]));
    categoriesWithCounts = MEDICINE_CATEGORIES.map(cat => ({
      ...cat,
      count: parseInt(countsMap.get(cat.id) || '0')
    }));
  } else {
    // Fallback if RPC not yet deployed
    const categoryCounts = counts.reduce((acc: Record<string, number>, curr) => {
      if (curr.category) {
        acc[curr.category] = (acc[curr.category] || 0) + 1;
      }
      return acc;
    }, {});

    categoriesWithCounts = MEDICINE_CATEGORIES.map(cat => ({
      ...cat,
      count: categoryCounts[cat.id] || 0
    }));
  }

  return NextResponse.json(categoriesWithCounts, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600'
    }
  });
}
