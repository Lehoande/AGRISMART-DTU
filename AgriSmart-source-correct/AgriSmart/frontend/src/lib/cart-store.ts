"use client";
import { create } from "zustand";
import type { Product } from "@/lib/agri-data";

export type CartItem = {
  product: Product;
  quantity: number;
};

type CartStore = {
  items: CartItem[];
  promoCode: string | null;
  promoPercent: number;
  isOpen: boolean;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setPromotion: (code: string | null, percent?: number) => void;
  setOpen: (open: boolean) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
};

export const useCart = create<CartStore>((set, get) => ({
  items: [],
  promoCode: null,
  promoPercent: 0,
  isOpen: false,
  addItem: (product, quantity = 1) => {
    const items = get().items;
    const existing = items.find((i) => i.product.id === product.id);
    if (existing) {
      set({
        items: items.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        ),
        isOpen: true,
      });
    } else {
      set({ items: [...items, { product, quantity }], isOpen: true });
    }
  },
  removeItem: (productId) =>
    set({ items: get().items.filter((i) => i.product.id !== productId) }),
  updateQuantity: (productId, quantity) =>
    set({
      items: get()
        .items.map((i) =>
          i.product.id === productId
            ? { ...i, quantity: Math.max(0, quantity) }
            : i
        )
        .filter((i) => i.quantity > 0),
    }),
  clearCart: () => set({ items: [], promoCode: null, promoPercent: 0 }),
  setPromotion: (promoCode, promoPercent = 0) => set({ promoCode, promoPercent }),
  setOpen: (open) => set({ isOpen: open }),
  getTotalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
  getTotalPrice: () =>
    get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
}));
