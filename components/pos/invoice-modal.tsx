'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, Download, Plus, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { formatPKR } from '@/lib/utils';
import { toast } from 'sonner';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { InvoicePDF } from '@/lib/pos/invoice';

export function InvoiceModal({
  saleId,
  open,
  onClose
}: {
  saleId: string;
  open: boolean;
  onClose: () => void;
}) {
  const [sale, setSale] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSale = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/sales/${saleId}`);
        const data = await res.json();
        setSale(data);
      } catch (error) {
        toast.error('Failed to load invoice');
      } finally {
        setLoading(false);
      }
    };
    if (open && saleId) fetchSale();
  }, [saleId, open]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0 border-none shadow-2xl">
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Generating Invoice...</p>
            </div>
          ) : (
            <div id="invoice-print-area" className="bg-white shadow-sm border rounded-xl p-10 max-w-2xl mx-auto ring-1 ring-slate-200">
              {/* Invoice Header */}
              <div className="text-center border-b pb-8 mb-8 space-y-2">
                <h1 className="text-3xl font-black tracking-tighter text-primary">MedPOS</h1>
                <h2 className="text-xl font-bold text-slate-900">{sale?.store_settings?.store_name || 'My Pharmacy'}</h2>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  {sale?.store_settings?.address || '123 Main St, Karachi, Pakistan'}
                  <br />
                  Phone: {sale?.store_settings?.phone || '021-1234567'}
                </p>
                {sale?.store_settings?.receipt_header && (
                  <p className="text-[10px] text-slate-400 italic mt-2">{sale?.store_settings?.receipt_header}</p>
                )}
              </div>

              {/* Invoice Info */}
              <div className="grid grid-cols-2 gap-8 mb-8 text-xs">
                <div className="space-y-1">
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Invoice Details</p>
                  <p className="font-bold text-slate-900">No: <span className="text-primary">{sale?.invoice_no}</span></p>
                  <p className="text-slate-600">Date: {format(new Date(sale?.created_at), 'MMM d, yyyy h:mm a')}</p>
                  <p className="text-slate-600">Cashier: {sale?.user?.name}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Bill To</p>
                  <p className="font-bold text-slate-900">{sale?.customer?.name || 'Walk-in Customer'}</p>
                  {sale?.customer?.phone && <p className="text-slate-600">{sale.customer.phone}</p>}
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-xs mb-8">
                <thead>
                  <tr className="border-b-2 border-slate-900 text-slate-900 font-bold uppercase tracking-wider">
                    <th className="py-3 text-left w-8">#</th>
                    <th className="py-3 text-left">Medicine</th>
                    <th className="py-3 text-center">Qty</th>
                    <th className="py-3 text-right">Price</th>
                    <th className="py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sale?.items.map((item: any, i: number) => (
                    <tr key={item.id} className="text-slate-700">
                      <td className="py-3 font-medium">{i + 1}</td>
                      <td className="py-3">
                        <p className="font-bold text-slate-900">{item.medicine_name}</p>
                        <p className="text-[10px] text-slate-400">{item.store_medicine?.medicine?.generic_name}</p>
                      </td>
                      <td className="py-3 text-center font-bold">{item.qty}</td>
                      <td className="py-3 text-right tabular-nums">{formatPKR(item.unit_price)}</td>
                      <td className="py-3 text-right font-black text-slate-900 tabular-nums">{formatPKR(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals Section */}
              <div className="flex justify-end mb-10">
                <div className="w-56 space-y-2">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span className="font-bold tabular-nums">{formatPKR(sale?.subtotal)}</span>
                  </div>
                  {sale?.discount > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span>Discount</span>
                      <span className="font-bold tabular-nums">- {formatPKR(sale?.discount)}</span>
                    </div>
                  )}
                  {sale?.tax > 0 && (
                    <div className="flex justify-between text-slate-500">
                      <span>GST ({sale?.store_settings?.gst_rate}%)</span>
                      <span className="font-bold tabular-nums">{formatPKR(sale?.tax)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t-2 border-slate-900 text-slate-900 font-black text-lg">
                    <span>TOTAL</span>
                    <span className="text-primary tabular-nums">{formatPKR(sale?.total)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 text-[10px] grid grid-cols-3 gap-4 uppercase font-bold tracking-widest text-slate-500 mb-8">
                <div>
                  <p>Method</p>
                  <p className="text-slate-900 text-xs mt-1">{sale?.payment_method}</p>
                </div>
                <div>
                  <p>Received</p>
                  <p className="text-slate-900 text-xs mt-1">{formatPKR(sale?.amount_received)}</p>
                </div>
                <div>
                  <p>Change</p>
                  <p className="text-emerald-600 text-xs mt-1">{formatPKR(sale?.change_given)}</p>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center text-[10px] text-slate-400 space-y-1">
                <p className="font-bold text-slate-600">{sale?.store_settings?.receipt_footer || 'Thank you for your business!'}</p>
                <p>No exchange without original receipt. Returns valid within 7 days.</p>
                <p className="pt-4 font-black uppercase tracking-[0.2em] text-primary/30">Powered by MedPOS</p>
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0 bg-white border-t p-6 flex items-center justify-between shadow-up">
          <div className="flex items-center gap-2">
            <Button variant="outline" className="font-bold h-11" onClick={handlePrint} disabled={loading}>
              <Printer className="w-4 h-4 mr-2" />
              Print Receipt
            </Button>
            {sale && (
              <PDFDownloadLink
                document={<InvoicePDF sale={sale} settings={sale.store_settings} items={sale.items} />}
                fileName={`invoice-${sale.invoice_no}.pdf`}
              >
                {({ loading: pdfLoading }) => (
                  <Button variant="outline" className="font-bold h-11" disabled={loading || pdfLoading}>
                    <Download className="w-4 h-4 mr-2" />
                    {pdfLoading ? 'Preparing...' : 'Download PDF'}
                  </Button>
                )}
              </PDFDownloadLink>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="font-bold h-11 px-6" onClick={onClose}>Close</Button>
            <Button className="font-bold h-11 px-8 bg-sky-600 hover:bg-sky-700" onClick={onClose}>
              <Plus className="w-4 h-4 mr-2" />
              New Sale
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
