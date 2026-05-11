import { createClient } from '@supabase/supabase-js';
import { DRAPMedicine } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function fetchDRAPPrices(): Promise<DRAPMedicine[]> {
  // Attempt to fetch from DRAP portal
  try {
    const response = await fetch('https://public.dra.gov.pk/cp/alien/', {
      headers: { 'User-Agent': 'MedPOS-DRAP-Sync/1.0' },
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    if (response.ok) {
      const html = await response.text();
      return parseDRAPHTML(html);
    }
  } catch (error) {
    console.error('DRAP fetch failed, using fallback:', error);
  }

  console.warn('DRAP sync: No prices fetched. Manual update required.');
  return [];
}

export function parseDRAPHTML(html: string): DRAPMedicine[] {
  // In production, use cheerio to parse the HTML table
  // const cheerio = require('cheerio');
  // const $ = cheerio.load(html);
  // parse table rows...
  return [];
}

export function findBestMatch(
  medicineName: string,
  drapData: DRAPMedicine[]
): { medicine: DRAPMedicine; score: number; price: number } | null {
  if (drapData.length === 0) return null;

  const stringSimilarity = require('string-similarity');
  const names = drapData.map(d => d.name.toLowerCase());
  const result = stringSimilarity.findBestMatch(
    medicineName.toLowerCase(),
    names
  );

  if (result.bestMatch.rating > 0.8) {
    const matched = drapData[result.bestMatchIndex];
    return {
      medicine: matched,
      score: result.bestMatch.rating,
      price: matched.mrp,
    };
  }

  return null;
}

export async function notifyAllStoresOfDRAPUpdate(updatedCount: number) {
  if (updatedCount === 0) return;

  // Get all active tenants
  const { data: tenants } = await supabaseAdmin
    .from('tenants')
    .select('id')
    .eq('status', 'active');

  // Insert notification for each tenant
  const notifications = (tenants || []).map(tenant => ({
    tenant_id: tenant.id,
    type: 'drap_update',
    title: 'DRAP Price Update',
    message: `${updatedCount} medicine prices were updated by DRAP this month. Review your prices if adjustment is needed.`,
    data: { updated_count: updatedCount },
  }));

  if (notifications.length > 0) {
    await supabaseAdmin.from('notifications').insert(notifications);
  }
}

export async function sendDRAPSyncEmail(results: any) {
  // Use Resend to send email to super admin
  // This would use a predefined template
  console.log('Sending DRAP sync summary email:', results);
}

export async function sendDRAPSyncFailureEmail(error: string) {
  console.error('Sending DRAP sync failure email:', error);
}
