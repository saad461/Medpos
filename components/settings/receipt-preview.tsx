'use client'

import { cn } from '@/lib/utils'

const RECEIPT_FONT_SIZES = {
  small: {
    base: '10px',
    heading: '12px',
    total: '13px',
  },
  medium: {
    base: '12px',
    heading: '14px',
    total: '15px',
  },
  large: {
    base: '14px',
    heading: '16px',
    total: '18px',
  },
}

interface ReceiptPreviewProps {
  values: {
    receipt_font_size: string
    receipt_width: string
    show_logo_on_receipt: boolean
    receipt_header?: string
    show_address?: boolean
    show_generic_name?: boolean
    show_drap_mrp?: boolean
    receipt_footer_msg?: string
    receipt_footer?: string
    show_powered_by?: boolean
  }
  storeName: string
  logoUrl?: string | null
  address?: string | null
}

export function ReceiptPreview({ values, storeName, logoUrl, address }: ReceiptPreviewProps) {
  const fontSize = RECEIPT_FONT_SIZES[values.receipt_font_size as keyof typeof RECEIPT_FONT_SIZES] || RECEIPT_FONT_SIZES.medium

  const widthStyle = values.receipt_width === '58mm' ? '220px' :
                     values.receipt_width === '80mm' ? '302px' : '794px'

  return (
    <div className="flex justify-center bg-muted p-8 rounded-xl border overflow-auto">
      <div
        id="settings-receipt-preview"
        className={cn(
          "bg-white shadow-2xl p-6 font-mono text-black transition-all duration-300"
        )}
        style={{
          '--receipt-font-size': fontSize.base,
          '--receipt-font-heading': fontSize.heading,
          '--receipt-font-total': fontSize.total,
          fontSize: 'var(--receipt-font-size)',
          borderStyle: 'dashed',
          borderWidth: '0 0 4px 0',
          borderColor: '#e2e8f0',
          width: widthStyle,
          maxWidth: '100%'
        } as React.CSSProperties}
      >
        {/* Header */}
        <div className="text-center space-y-2 mb-4">
          {values.show_logo_on_receipt && logoUrl ? (
            <img src={logoUrl} alt="Store logo" className="h-12 mx-auto mb-2 object-contain" />
          ) : (
            <h1 style={{ fontSize: 'var(--receipt-font-heading)' }} className="font-bold uppercase tracking-tight">
              {storeName}
            </h1>
          )}
          {values.show_logo_on_receipt && logoUrl && (
            <h1 style={{ fontSize: 'var(--receipt-font-heading)' }} className="font-bold uppercase tracking-tight">
              {storeName}
            </h1>
          )}
          {values.receipt_header && (
            <div className="whitespace-pre-line text-muted-foreground leading-tight">
              {values.receipt_header}
            </div>
          )}
          {values.show_address && address && (
            <div className="text-muted-foreground">{address}</div>
          )}
        </div>

        <div className="border-t border-dashed border-black/20 my-2" />

        <div className="flex justify-between uppercase font-bold py-1">
          <span>Receipt</span>
          <span>#000001</span>
        </div>

        <div className="flex flex-col text-[0.8em] text-muted-foreground mb-2">
          <div className="flex justify-between">
            <span>Date: 12 May 2026</span>
            <span>Time: 3:45 PM</span>
          </div>
          <div className="flex justify-between">
            <span>Cashier: Ahmed Ali</span>
            <span>Customer: Walk-in</span>
          </div>
        </div>

        <div className="border-t border-dashed border-black/20 my-2" />

        {/* Items */}
        <div className="space-y-3 py-2">
          <div className="space-y-1">
            <div className="flex justify-between font-bold">
              <span>Panadol 500mg</span>
              <span>×3</span>
            </div>
            {values.show_generic_name && (
              <div className="text-[0.9em] italic">[Generic: Paracetamol]</div>
            )}
            <div className="flex justify-between text-[0.9em]">
              <span>Rs. 3.50 × 3</span>
              {values.show_drap_mrp && <span className="text-muted-foreground">[DRAP: Rs. 3.00]</span>}
              <span className="font-medium">Rs. 10.50</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between font-bold">
              <span>Augmentin 625mg</span>
              <span>×1</span>
            </div>
            <div className="flex justify-between text-[0.9em]">
              <span>Rs. 90.00 × 1</span>
              <span className="font-medium">Rs. 90.00</span>
            </div>
          </div>
        </div>

        <div className="border-t border-dashed border-black/20 my-2" />

        {/* Totals */}
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>Rs. 100.50</span>
          </div>
          <div className="flex justify-between">
            <span>GST (0%):</span>
            <span>Rs. 0.00</span>
          </div>
          <div
            className="flex justify-between font-bold py-1 mt-1 border-y border-black/10"
            style={{ fontSize: 'var(--receipt-font-total)' }}
          >
            <span>TOTAL:</span>
            <span>Rs. 100.50</span>
          </div>
          <div className="flex justify-between py-1">
            <span>Payment:</span>
            <span className="font-bold">Cash</span>
          </div>
        </div>

        <div className="border-t border-dashed border-black/20 my-4" />

        {/* Footer */}
        <div className="text-center space-y-3">
          {values.receipt_footer_msg && (
            <p className="font-bold">{values.receipt_footer_msg}</p>
          )}
          {values.receipt_footer && (
            <p className="whitespace-pre-line text-[0.9em] text-muted-foreground">
              {values.receipt_footer}
            </p>
          )}

          {values.show_powered_by && (
            <div className="pt-4 opacity-50 text-[0.8em]">
              Powered by MedPOS
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
