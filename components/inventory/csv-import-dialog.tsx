'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, FileDown, CheckCircle2, AlertCircle, Loader2, FileSpreadsheet } from 'lucide-react';
import { generateCSVTemplate, parseCSVFile, validateCSVRows, CSVRow } from '@/lib/inventory/csv';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

export function CsvImportDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [step, setStep] = useState(1);
  const [preview, setPreview] = useState<CSVRow[]>([]);
  const [validation, setValidation] = useState<{ valid: CSVRow[], errors: any[] } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const downloadTemplate = () => {
    const csv = generateCSVTemplate();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'medpos-inventory-template.csv';
    a.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      try {
        const rows = await parseCSVFile(f);
        setPreview(rows.slice(0, 5));
        const res = validateCSVRows(rows);
        setValidation(res);
        setStep(2);
     } catch {
        toast.error('Failed to parse CSV file');
      }
    }
  };

  const handleImport = async () => {
    if (!validation?.valid.length) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/inventory/import-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: validation.valid }),
      });
      const result = await res.json();
      if (res.ok) {
        toast.success(`Import complete: ${result.linked} linked, ${result.private} private medicines created.`);
        onOpenChange(false);
      } else {
        toast.error(result.error || 'Import failed');
      }
     } catch {
      toast.error('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Import Inventory from CSV</DialogTitle>
          <DialogDescription>Bulk add medicines using our standardized CSV template.</DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-6 py-6">
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center gap-4 hover:border-primary transition-colors bg-slate-50/50">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Choose a CSV file to upload</p>
                <p className="text-xs text-slate-500 mt-1">Drag and drop or click to browse</p>
              </div>
              <Input type="file" accept=".csv" className="hidden" id="csv-upload" onChange={handleFileChange} />
              <Button asChild>
                <label htmlFor="csv-upload">Browse Files</label>
              </Button>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                <FileDown className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-blue-900">Don't have a template?</p>
                <p className="text-[10px] text-blue-700 mt-0.5">Use our template to ensure your data is formatted correctly.</p>
                <Button variant="link" className="p-0 h-auto text-[10px] font-bold text-blue-600 mt-1" onClick={downloadTemplate}>
                  Download CSV Template
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/50 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="text-sm font-black text-emerald-700">{validation?.valid.length}</p>
                  <p className="text-[10px] text-emerald-600 font-bold uppercase">Valid Rows</p>
                </div>
              </div>
              <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/50 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600" />
                <div>
                  <p className="text-sm font-black text-rose-700">{validation?.errors.length}</p>
                  <p className="text-[10px] text-rose-600 font-bold uppercase">Invalid Rows</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Data Preview (First 5 Rows)</p>
              <div className="rounded-lg border border-slate-100 overflow-hidden text-[10px]">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase">
                    <tr>
                      <th className="p-2 border-b">Name</th>
                      <th className="p-2 border-b">Stock</th>
                      <th className="p-2 border-b">Price</th>
                      <th className="p-2 border-b">Expiry</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i}>
                        <td className="p-2 border-b font-medium">{row.name}</td>
                        <td className="p-2 border-b">{row.stock_qty}</td>
                        <td className="p-2 border-b">{row.sale_price}</td>
                        <td className="p-2 border-b">{row.expiry_date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {validation?.errors.length! > 0 && (
              <div className="max-h-[100px] overflow-y-auto p-3 bg-slate-900 rounded-lg text-[10px] font-mono text-rose-400">
                {validation?.errors.map((err, i) => (
                  <p key={i}>Row {err.row}: {err.details}</p>
                ))}
              </div>
            )}
          </div>
        )}

        <DialogFooter className="pt-4 border-t gap-2">
          <Button variant="outline" onClick={() => { setStep(1); setValidation(null); setFile(null); }}>
            {step === 2 ? 'Back' : 'Cancel'}
          </Button>
          {step === 2 && (
            <Button onClick={handleImport} disabled={submitting || validation?.valid.length === 0}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileSpreadsheet className="w-4 h-4 mr-2" />}
              Import {validation?.valid.length} Items
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
