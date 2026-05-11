'use client';

import { usePOSStore } from '@/stores/pos-store';
import { calculateOrderTotals, calculateChange } from '@/lib/pos/calculations';
import { formatPKR, cn } from '@/lib/utils';
import {
  Banknote,
  CreditCard as CardIcon,
  UserCircle,
  CheckCircle2,
  Loader2,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { toast } from 'sonner';
import { InvoiceModal } from './invoice-modal';

export function CheckoutPanel() {
  const {
    items,
    orderDiscount,
    orderDiscountType,
    paymentMethod,
    setPaymentMethod,
    amountReceived,
    setAmountReceived,
    notes,
    setNotes,
    isCheckingOut,
    setCheckingOut,
    clearCart,
    customerId,
    setLastSaleId
  } = usePOSStore();

  const [showInvoice, setShowInvoice] = useState(false);
  const [saleId, setSaleId] = useState<string | null>(null);

  const gstRate = 0;
  const totals = calculateOrderTotals(items, orderDiscount, orderDiscountType, gstRate);
  const changeDue = calculateChange(amountReceived, totals.total);

  const canCheckout = items.length > 0 &&
    (paymentMethod !== 'cash' || amountReceived >= totals.total);

  const handleCheckout = async () => {
    if (!canCheckout || isCheckingOut) return;

    setCheckingOut(true);
    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({
            store_medicine_id: i.store_medicine_id,
            qty: i.qty,
            unit_price: i.unit_price,
            discount: i.item_discount, // Simplified, should be calculated amount if percent
            subtotal: i.subtotal
          })),
          customer_id: customerId,
          subtotal: totals.subtotal,
          discount: totals.orderDiscountAmount,
          tax: totals.taxAmount,
          total: totals.total,
          payment_method: paymentMethod,
          amount_received: paymentMethod === 'cash' ? amountReceived : totals.total,
          change_given: paymentMethod === 'cash' ? changeDue : 0,
          notes: notes
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`Sale completed! Invoice: ${data.invoice_no}`);
        setSaleId(data.sale_id);
        setLastSaleId(data.sale_id);
        setShowInvoice(true);
      } else {
        toast.error(data.error || 'Checkout failed');
      }
     } catch {
      toast.error('Network error during checkout');
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="bg-primary p-5 text-white">
      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-2">
          <PaymentTypeButton
            active={paymentMethod === 'cash'}
            onClick={() => setPaymentMethod('cash')}
            icon={<Banknote className="w-4 h-4" />}
            label="Cash"
          />
          <PaymentTypeButton
            active={paymentMethod === 'card'}
            onClick={() => setPaymentMethod('card')}
            icon={<CardIcon className="w-4 h-4" />}
            label="Card"
          />
          <PaymentTypeButton
            active={paymentMethod === 'credit'}
            onClick={() => setPaymentMethod('credit')}
            icon={<UserCircle className="w-4 h-4" />}
            label="Credit"
          />
        </div>

        {paymentMethod === 'cash' && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-white/70">Amount Received</span>
              <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", changeDue >= 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400")}>
                {changeDue >= 0 ? `Change: ${formatPKR(changeDue)}` : `Short: ${formatPKR(Math.abs(changeDue))}`}
              </span>
            </div>
            <div className="relative">
              <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
              <Input
                className="h-12 pl-10 text-xl font-black bg-white text-primary border-none focus-visible:ring-sky-400 tabular-nums"
                type="number"
                placeholder={totals.total.toString()}
                value={amountReceived || ''}
                onChange={(e) => setAmountReceived(Number(e.target.value))}
                autoFocus
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                {[100, 500, 1000].map(v => (
                  <button
                    key={v}
                    onClick={() => setAmountReceived((amountReceived || 0) + v)}
                    className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded hover:bg-white transition-colors"
                  >
                    +{v}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="relative">
          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-10 pl-9 focus-visible:ring-sky-400"
            placeholder="Add note (optional)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <Button
          className={cn(
            "w-full h-14 text-xl font-black shadow-xl transition-all active:scale-[0.98]",
            canCheckout ? "bg-emerald-500 hover:bg-emerald-400 text-white" : "bg-white/10 text-white/40 cursor-not-allowed"
          )}
          disabled={!canCheckout || isCheckingOut}
          onClick={handleCheckout}
        >
          {isCheckingOut ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <CheckCircle2 className="w-6 h-6 mr-3" />
              Checkout — {formatPKR(totals.total)}
            </>
          )}
        </Button>
        <p className="text-[10px] text-center text-white/40 font-medium">Press <strong>F10</strong> to quickly trigger checkout</p>
      </div>

      {showInvoice && saleId && (
        <InvoiceModal
          saleId={saleId}
          open={showInvoice}
          onClose={() => {
            setShowInvoice(false);
            clearCart();
            window.dispatchEvent(new CustomEvent('focus-pos-search'));
          }}
        />
      )}
    </div>
  );
}

function PaymentTypeButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border transition-all",
        active
          ? "bg-white text-primary border-white shadow-inner"
          : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
      )}
    >
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </button>
  );
}
