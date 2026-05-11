import { create } from 'zustand';
import { MedicineSearchResult } from '@/types';
import { calculateItemSubtotal } from '@/lib/pos/calculations';
import { toast } from 'sonner';

export interface CartItem {
  store_medicine_id: string;
  medicine_id: string;
  name: string;
  generic_name: string;
  unit: string;
  stock_qty: number;
  qty: number;
  unit_price: number;
  item_discount: number;
  item_discount_type: 'flat' | 'percent';
  subtotal: number;
  is_controlled: boolean;
}

interface POSState {
  items: CartItem[];
  customerId: string | null;
  customerName: string | null;
  orderDiscount: number;
  orderDiscountType: 'flat' | 'percent';
  paymentMethod: 'cash' | 'card' | 'credit';
  amountReceived: number;
  notes: string;
  isCheckingOut: boolean;
  lastSaleId: string | null;

  addItem: (medicine: MedicineSearchResult) => void;
  removeItem: (store_medicine_id: string) => void;
  updateQty: (store_medicine_id: string, qty: number) => void;
  updateItemDiscount: (store_medicine_id: string, discount: number, type: 'flat' | 'percent') => void;
  setOrderDiscount: (discount: number, type: 'flat' | 'percent') => void;
  setCustomer: (id: string | null, name: string | null) => void;
  setPaymentMethod: (method: 'cash' | 'card' | 'credit') => void;
  setAmountReceived: (amount: number) => void;
  setNotes: (notes: string) => void;
  setCheckingOut: (isCheckingOut: boolean) => void;
  setLastSaleId: (id: string | null) => void;
  clearCart: () => void;
}

export const usePOSStore = create<POSState>((set, get) => ({
  items: [],
  customerId: null,
  customerName: null,
  orderDiscount: 0,
  orderDiscountType: 'flat',
  paymentMethod: 'cash',
  amountReceived: 0,
  notes: '',
  isCheckingOut: false,
  lastSaleId: null,

  addItem: (medicine) => {
    const { items } = get();
    const existing = items.find(i => i.store_medicine_id === medicine.id);

    if (existing) {
      if (existing.qty + 1 > medicine.stock_qty) {
        toast.warning(`Insufficient stock for ${medicine.name}`);
        return;
      }
      const updatedItems = items.map(i => {
        if (i.store_medicine_id === medicine.id) {
          const newQty = i.qty + 1;
          return {
            ...i,
            qty: newQty,
            subtotal: calculateItemSubtotal(i.unit_price, newQty, i.item_discount, i.item_discount_type)
          };
        }
        return i;
      });
      set({ items: updatedItems });
    } else {
      if (medicine.stock_qty < 1) {
        toast.warning(`Insufficient stock for ${medicine.name}`);
        return;
      }
      if (medicine.is_controlled) {
        toast.info(`${medicine.name} is a controlled substance. Ensure prescription is valid.`);
      }
      const newItem: CartItem = {
        store_medicine_id: medicine.id,
        medicine_id: medicine.medicine_id,
        name: medicine.name,
        generic_name: medicine.generic_name || '',
        unit: medicine.unit || '',
        stock_qty: medicine.stock_qty,
        qty: 1,
        unit_price: medicine.sale_price,
        item_discount: 0,
        item_discount_type: 'flat',
        subtotal: medicine.sale_price,
        is_controlled: medicine.is_controlled
      };
      set({ items: [...items, newItem] });
    }
  },

  removeItem: (id) => set({ items: get().items.filter(i => i.store_medicine_id !== id) }),

  updateQty: (id, qty) => {
    if (qty <= 0) {
      get().removeItem(id);
      return;
    }
    const { items } = get();
    const updatedItems = items.map(i => {
      if (i.store_medicine_id === id) {
        const finalQty = qty > i.stock_qty ? i.stock_qty : qty;
        if (qty > i.stock_qty) toast.warning(`Capped at max stock (${i.stock_qty})`);
        return {
          ...i,
          qty: finalQty,
          subtotal: calculateItemSubtotal(i.unit_price, finalQty, i.item_discount, i.item_discount_type)
        };
      }
      return i;
    });
    set({ items: updatedItems });
  },

  updateItemDiscount: (id, discount, type) => {
    const updatedItems = get().items.map(i => {
      if (i.store_medicine_id === id) {
        return {
          ...i,
          item_discount: discount,
          item_discount_type: type,
          subtotal: calculateItemSubtotal(i.unit_price, i.qty, discount, type)
        };
      }
      return i;
    });
    set({ items: updatedItems });
  },

  setOrderDiscount: (discount, type) => set({ orderDiscount: discount, orderDiscountType: type }),
  setCustomer: (id, name) => set({ customerId: id, customerName: name }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  setAmountReceived: (amount) => set({ amountReceived: amount }),
  setNotes: (notes) => set({ notes }),
  setCheckingOut: (val) => set({ isCheckingOut: val }),
  setLastSaleId: (id) => set({ lastSaleId: id }),
  clearCart: () => set({
    items: [],
    customerId: null,
    customerName: null,
    orderDiscount: 0,
    orderDiscountType: 'flat',
    paymentMethod: 'cash',
    amountReceived: 0,
    notes: '',
    isCheckingOut: false,
    lastSaleId: null,
  })
}));
