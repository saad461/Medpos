import { create } from 'zustand';
import { CartItem } from './pos-store';

export interface HeldSale {
  id: string;
  label: string;
  items: CartItem[];
  customerId: string | null;
  customerName: string | null;
  orderDiscount: number;
  orderDiscountType: 'flat' | 'percent';
  heldAt: Date;
}

interface HeldSalesState {
  heldSales: HeldSale[];
  holdCurrentSale: (label: string, cartState: {
    items: CartItem[];
    customerId: string | null;
    customerName: string | null;
    orderDiscount: number;
    orderDiscountType: 'flat' | 'percent';
  }) => void;
  retrieveSale: (id: string) => HeldSale | null;
  deleteHeldSale: (id: string) => void;
}

export const useHeldSalesStore = create<HeldSalesState>((set, get) => ({
  heldSales: [],

  holdCurrentSale: (label, cartState) => {
    const newHeldSale: HeldSale = {
      id: crypto.randomUUID(),
      label: label || `Sale ${get().heldSales.length + 1}`,
      ...cartState,
      heldAt: new Date()
    };
    set({ heldSales: [newHeldSale, ...get().heldSales] });
  },

  retrieveSale: (id) => {
    const sale = get().heldSales.find(s => s.id === id);
    if (sale) {
      set({ heldSales: get().heldSales.filter(s => s.id !== id) });
      return sale;
    }
    return null;
  },

  deleteHeldSale: (id) => set({ heldSales: get().heldSales.filter(s => s.id !== id) })
}));
