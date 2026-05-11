import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { mapDRAPToCategory, isControlledSubstance } from '../lib/medicines/categories';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy';

async function importMedicines() {
  const args = process.argv.slice(2);
  const useSql = args.includes('--sql');
  const csvFile = args.includes('--sample')
    ? path.join(__dirname, '../supabase/seeds/sample_drap_medicines.csv')
    : path.join(__dirname, '../supabase/seeds/drap_medicines.csv');

  if (!fs.existsSync(csvFile)) {
    console.error(`CSV file not found: ${csvFile}`);
    if (!args.includes('--sample')) {
      console.log('Try running with --sample to use the sample CSV file.');
    }
    process.exit(1);
  }

  const fileContent = fs.readFileSync(csvFile, 'utf-8');
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });

  console.log(`Read ${records.length} records from ${csvFile}`);

  const medicines = records.map((r: any) => ({
    name: r.name,
    generic_name: r.generic_name,
    company: r.company,
    unit: r.unit,
    dosage_form: r.unit, // Use unit as dosage_form as well
    registration_number: r.registration_number,
    registration_date: r.registration_date || null,
    drap_mrp: parseFloat(r.drap_mrp) || 0,
    category: mapDRAPToCategory(r.name, r.generic_name),
    is_controlled: isControlledSubstance(r.name, r.generic_name),
    scope: 'global',
  }));

  if (useSql) {
    const sqlFile = path.join(__dirname, '../supabase/seeds/003_medicines.sql');
    let sql = `-- MedPOS Global Medicine Database\n`;
    sql += `-- Generated from ${path.basename(csvFile)}\n\n`;
    sql += `DELETE FROM medicines WHERE scope = 'global';\n\n`;
    sql += `INSERT INTO medicines (name, generic_name, company, unit, dosage_form, registration_number, registration_date, drap_mrp, category, is_controlled, scope)\nVALUES\n`;

    const values = medicines.map((m: any) =>
      `('${m.name.replace(/'/g, "''")}', '${m.generic_name.replace(/'/g, "''")}', '${m.company.replace(/'/g, "''")}', '${m.unit}', '${m.dosage_form}', '${m.registration_number}', ${m.registration_date ? `'${m.registration_date}'` : 'NULL'}, ${m.drap_mrp}, '${m.category}', ${m.is_controlled}, 'global')`
    ).join(',\n');

    sql += values + ';\n';
    fs.writeFileSync(sqlFile, sql);
    console.log(`Generated SQL file: ${sqlFile}`);
  } else {
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Inserting into Supabase...');
    const chunkSize = 100;
    let totalImported = 0;
    let errors = 0;

    for (let i = 0; i < medicines.length; i += chunkSize) {
      const chunk = medicines.slice(i, i + chunkSize);
      const { error } = await supabase
        .from('medicines')
        .upsert(chunk, { onConflict: 'registration_number' });

      if (error) {
        console.error(`Error inserting chunk ${i / chunkSize}:`, error);
        errors += chunk.length;
      } else {
        totalImported += chunk.length;
        process.stdout.write(`Imported ${totalImported}/${medicines.length}\r`);
      }
    }
    console.log(`\nImport complete. Total imported: ${totalImported}, Errors: ${errors}`);
  }
}

importMedicines().catch(console.error);
