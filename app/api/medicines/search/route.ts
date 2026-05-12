import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { buildSearchQuery, formatMedicineResult } from '@/lib/medicines/search';
import { Database } from '@/types';

export async function GET(request: NextRequest) {
  const start = Date.now();
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get('q');
  const mode = searchParams.get('mode') || 'inventory';
  const limit = parseInt(searchParams.get('limit') || '10');

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [], total: 0 }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tenant_id = session.user.app_metadata.tenant_id;
  const { prefixQuery, fulltextQuery, isBarcodeQuery } = buildSearchQuery(q);

  let results: any[] = [];
  let strategy: 'barcode' | 'prefix' | 'fulltext' | 'trigram' = 'prefix';

  try {
    if (mode === 'inventory') {
      // Strategy A: Barcode
      if (isBarcodeQuery) {
        const { data } = await supabase
          .from('store_medicines')
          .select('*, medicine:medicines(*)')
          .eq('tenant_id', tenant_id)
          .eq('barcode', q)
          .eq('is_active', true);

        if (data && data.length > 0) {
          results = data;
          strategy = 'barcode';
        }
      }

      // Strategy B: Prefix
      if (results.length === 0) {
        const { data } = await supabase
          .from('store_medicines')
          .select('*, medicine:medicines!inner(*)')
          .eq('tenant_id', tenant_id)
          .eq('is_active', true)
          .or(`name.ilike.${prefixQuery},generic_name.ilike.${prefixQuery}`, { foreignTable: 'medicines' })
          .order('stock_qty', { ascending: false })
          .limit(limit);

        if (data && data.length > 0) {
          results = data;
          strategy = 'prefix';
        }
      }

      // Strategy C: Full Text Search
      if (results.length < 3) {
        const { data } = await supabase
          .rpc('search_store_medicines_fts', {
            p_tenant_id: tenant_id,
            p_query: fulltextQuery,
            p_limit: limit
          });

        if (data && data.length > 0) {
          // RPC returns merged data, we might need to fetch full objects or adjust format
          // For simplicity in this step, assuming RPC returns what we need or fallback to prefix results if any
          if (data.length > results.length) {
            results = data;
            strategy = 'fulltext';
          }
        }
      }

      // Strategy D: Trigram
      if (results.length < 3) {
        const { data } = await supabase
          .rpc('search_store_medicines_trigram', {
            p_tenant_id: tenant_id,
            p_query: q,
            p_limit: limit
          });

        if (data && data.length > 0) {
          if (data.length > results.length) {
            results = data;
            strategy = 'trigram';
          }
        }
      }

      const formattedResults = results.map(formatMedicineResult);
      const took_ms = Date.now() - start;

      if (took_ms > 200) {
        console.warn(`Search took ${took_ms}ms for query "${q}"`);
      }

      return NextResponse.json({
        results: formattedResults,
        total: formattedResults.length,
        search_strategy: strategy,
        took_ms
      });

    } else {
      // Global Search Mode
      let globalResults: any[] = [];

      // Prefix Match
      const { data: prefixData } = await supabase
        .from('medicines')
        .select('*')
        .or(`name.ilike.${prefixQuery},generic_name.ilike.${prefixQuery}`)
        .limit(limit);

      globalResults = prefixData || [];
      strategy = 'prefix';

      if (globalResults.length < 3) {
        // Fallback to FTS or Trigram for global
        const { data: ftsData } = await supabase
          .from('medicines')
          .select('*')
          .textSearch('name', fulltextQuery)
          .limit(limit);

        if (ftsData && ftsData.length > globalResults.length) {
          globalResults = ftsData;
          strategy = 'fulltext';
        }
      }

      // Check which ones are in store
      const medicineIds = globalResults.map(m => m.id);
      const { data: storeData } = await supabase
        .from('store_medicines')
        .select('id, medicine_id')
        .eq('tenant_id', tenant_id)
        .in('medicine_id', medicineIds);

      const storeMap = new Map(storeData?.map(s => [s.medicine_id, s.id]) || []);

      const formattedResults = globalResults.map(m => ({
        ...m,
        is_in_store: storeMap.has(m.id),
        store_medicine_id: storeMap.get(m.id)
      }));

      const took_ms = Date.now() - start;

      return NextResponse.json({
        results: formattedResults,
        total: formattedResults.length,
        search_strategy: strategy,
        took_ms
      });
    }

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
