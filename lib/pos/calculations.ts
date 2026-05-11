import { CartItem } from '@/stores/pos-store';

export function calculateItemSubtotal(
  unitPrice: number,
  qty: number,
  discount: number,
  discountType: 'flat' | 'percent'
): number {
  const gross = unitPrice * qty;
  const discountAmount = discountType === 'percent'
    ? (gross * discount / 100)
    : discount;
  return Math.max(0, gross - discountAmount);
}

export type OrderTotals = {
  subtotal: number;
  orderDiscountAmount: number;
  taxAmount: number;
  total: number;
};

export function calculateOrderTotals(
  items: CartItem[],
  orderDiscount: number,
  orderDiscountType: 'flat' | 'percent',
  gstRate: number
): OrderTotals {
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const orderDiscountAmount = orderDiscountType === 'percent'
    ? (subtotal * orderDiscount / 100)
    : orderDiscount;
  const discountedSubtotal = Math.max(0, subtotal - orderDiscountAmount);
  const taxAmount = (discountedSubtotal * gstRate) / 100;
  const total = discountedSubtotal + taxAmount;

  return {
    subtotal,
    orderDiscountAmount,
    taxAmount,
    total,
  };
}

export function calculateChange(
  amountReceived: number,
  total: number
): number {
  return Math.max(0, amountReceived - total);
}
