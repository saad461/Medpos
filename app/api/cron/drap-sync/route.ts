import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  fetchDRAPPrices,
  findBestMatch,
  sendDRAPSyncEmail,
  sendDRAPSyncFailureEmail
} from '@/lib/medicines/drap-sync';
import { createNotificationsForAllTenants, NOTIFICATION_TYPES } from '@/lib/notifications/create';
import { sendDRAPUpdateEmail } from '@/lib/notifications/email';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  // 1. Verify CRON_SECRET
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startTime = Date.now();
  const results = {
    medicines_checked: 0,
    prices_updated: 0,
    new_medicines_found: 0,
    errors: [] as string[],
    duration_ms: 0,
  };

  try {
    // 2. Fetch DRAP MRP data
    const drapData = await fetchDRAPPrices();

    // 3. For each medicine in our DB, fuzzy match with DRAP data
    const { data: medicines } = await supabase
      .from('medicines')
      .select('id, name, drap_mrp')
      .eq('scope', 'global');

    if (medicines) {
      for (const medicine of medicines) {
        const match = findBestMatch(medicine.name, drapData);

        if (match && match.score > 0.8) {
          const newMRP = match.price;

          if (newMRP !== medicine.drap_mrp) {
            // Update the DRAP MRP
            const { error: updateError } = await supabase
              .from('medicines')
              .update({ drap_mrp: newMRP })
              .eq('id', medicine.id);

            if (!updateError) {
              // Log the change
              await supabase
                .from('price_change_log')
                .insert({
                  medicine_id: medicine.id,
                  old_drap_mrp: medicine.drap_mrp,
                  new_drap_mrp: newMRP,
                });

              results.prices_updated++;
            } else {
              results.errors.push(`Update failed for ${medicine.name}: ${updateError.message}`);
            }
          }
          results.medicines_checked++;
        }
      }
    }

    results.duration_ms = Date.now() - startTime;

    // 4. Send summary email to Super Admin
    await sendDRAPSyncEmail(results);

    // 5. Create in-app notification for all store owners
    if (results.prices_updated > 0) {
      await createNotificationsForAllTenants({
        type: NOTIFICATION_TYPES.DRAP_UPDATE,
        title: 'DRAP Price Update',
        message: `${results.prices_updated} medicine prices were updated by DRAP this month. Review your prices if adjustment is needed.`,
        data: { updated_count: results.prices_updated },
      });

      // 6. Send emails to all active tenants
      const { data: tenants } = await supabase
        .from('tenants')
        .select('name, owner_email')
        .eq('status', 'active');

      if (tenants) {
        for (const tenant of tenants) {
          await sendDRAPUpdateEmail({
            storeName: tenant.name,
            ownerEmail: tenant.owner_email,
            updatedCount: results.prices_updated,
            changedMedicines: [],
          });
        }
      }
    }

    return NextResponse.json({ success: true, results });

  } catch (error) {
    results.errors.push(String(error));
    results.duration_ms = Date.now() - startTime;

    // Send failure alert to admin
    await sendDRAPSyncFailureEmail(String(error));

    return NextResponse.json(
      { success: false, results },
      { status: 500 }
    );
  }
}
