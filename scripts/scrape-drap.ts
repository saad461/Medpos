/**
 * DRAP Medicines Scraper
 *
 * Run this script locally — requires internet access to DRAP website.
 * Tools: axios + cheerio + csv-writer
 * Target URL: https://www.dra.gov.pk/therapeutic-goods/drugs/pharmaceuticals/
 * Rate limit: 1 request per 2 seconds — respectful scraping
 * Output: supabase/seeds/drap_medicines.csv
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { createObjectCsvWriter } from 'csv-writer';
import * as path from 'path';

const TARGET_URL = 'https://www.dra.gov.pk/therapeutic-goods/drugs/pharmaceuticals/';
const OUTPUT_FILE = path.join(__dirname, '../supabase/seeds/drap_medicines.csv');

interface DRAPRow {
  name: string;
  generic_name: string;
  company: string;
  unit: string;
  registration_number: string;
  registration_date: string;
  drap_mrp: string;
}

async function scrape() {
  console.log('Starting DRAP scraper...');

  const results: DRAPRow[] = [];
  const csvWriter = createObjectCsvWriter({
    path: OUTPUT_FILE,
    header: [
      { id: 'name', title: 'name' },
      { id: 'generic_name', title: 'generic_name' },
      { id: 'company', title: 'company' },
      { id: 'unit', title: 'unit' },
      { id: 'registration_number', title: 'registration_number' },
      { id: 'registration_date', title: 'registration_date' },
      { id: 'drap_mrp', title: 'drap_mrp' },
    ],
  });

  try {
    const response = await axios.get(TARGET_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);

    // DRAP website often has tables for these records
    // This is a generalized parser based on typical DRAP page structure
    $('table tr').each((i, el) => {
      if (i === 0) return; // skip header
      const cols = $(el).find('td');
      if (cols.length >= 6) {
        results.push({
          name: $(cols[1]).text().trim(), // Often Trade Name
          generic_name: $(cols[2]).text().trim(), // Composition/Generic
          company: $(cols[3]).text().trim(), // Manufacturer/MAH
          unit: $(cols[4]).text().trim(), // Dosage Form
          registration_number: $(cols[0]).text().trim(), // Reg No
          registration_date: $(cols[5]).text().trim(), // Reg Date
          drap_mrp: '0', // Usually not in the main list, requires separate lookup or sync
        });
      }
    });

    if (results.length > 0) {
      await csvWriter.writeRecords(results);
      console.log(`Successfully scraped ${results.length} medicines to ${OUTPUT_FILE}`);
    } else {
      console.log('No records found. The website structure might have changed.');
    }

  } catch (error: any) {
    console.error('Scraping failed:', error.message);
    console.log('NOTE: This script requires internet access to www.dra.gov.pk');
  }
}

if (require.main === module) {
  scrape();
}
