import { StoreMedicine, Medicine } from '@/types';
import Papa from 'papaparse';
import { MEDICINE_CATEGORIES } from '@/lib/medicines/categories';

export interface CSVRow {
  name: string;
  generic_name?: string;
  category?: string;
  company?: string;
  unit?: string;
  sale_price: string;
  purchase_price?: string;
  stock_qty: string;
  reorder_level?: string;
  expiry_date?: string;
  barcode?: string;
}

export function generateCSVTemplate(): string {
  const headers = ['name', 'generic_name', 'category', 'company', 'unit', 'sale_price', 'purchase_price', 'stock_qty', 'reorder_level', 'expiry_date', 'barcode'];
  const sample = ['Panadol 500mg', 'Paracetamol', 'analgesic', 'GSK', 'Tablet', '3.00', '2.50', '100', '10', '2025-12-31', '123456789'];
  return Papa.unparse([headers, sample]);
}

export async function parseCSVFile(file: File): Promise<CSVRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data as CSVRow[]),
      error: (error) => reject(error),
    });
  });
}

export function validateCSVRows(rows: CSVRow[]) {
  const valid: CSVRow[] = [];
  const errors: { row: number; details: string }[] = [];

  rows.forEach((row, index) => {
    const rowNum = index + 2; // +1 for 0-index, +1 for header
    const rowErrors: string[] = [];

    if (!row.name) rowErrors.push('Name is required');
    if (!row.sale_price || isNaN(Number(row.sale_price))) rowErrors.push('Valid sale price is required');
    if (!row.stock_qty || isNaN(Number(row.stock_qty))) rowErrors.push('Valid stock quantity is required');

    if (row.category && !MEDICINE_CATEGORIES.find(c => c.id === row.category)) {
      rowErrors.push(`Invalid category: ${row.category}`);
    }

    if (rowErrors.length > 0) {
      errors.push({ row: rowNum, details: rowErrors.join(', ') });
    } else {
      valid.push(row);
    }
  });

  return { valid, errors };
}

export function generateExportCSV(data: (StoreMedicine & { medicine: Medicine })[]): string {
  const exportData = data.map(item => ({
    name: item.medicine.name,
    generic_name: item.medicine.generic_name,
    category: item.medicine.category,
    company: item.medicine.company,
    unit: item.medicine.unit,
    sale_price: item.sale_price,
    purchase_price: item.purchase_price,
    stock_qty: item.stock_qty,
    reorder_level: item.reorder_level,
    expiry_date: item.expiry_date,
    barcode: item.barcode,
  }));

  return Papa.unparse(exportData);
}
