"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";
import { WHOLESALE_MIN_UNITS_PER_ITEM } from "@/types";

interface CartStore {
  items: CartItem[];
  isOpen: boolean;

  addItem: (item: CartItem) => void;
  removeItem: (productId: string, color: string) => void;
  updateQuantity: (productId: string, color: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (newItem) => {
        // Forzar mínimo de unidades por producto
        const qty = Math.max(newItem.quantity, WHOLESALE_MIN_UNITS_PER_ITEM);
        const item = { ...newItem, quantity: qty };

        set((state) => {
          const match = (i: CartItem) =>
            i.product_id === item.product_id && i.color === item.color;

          const existing = state.items.find(match);
          if (existing) {
            return {
              items: state.items.map((i) =>
                match(i) ? { ...i, quantity: i.quantity + item.quantity } : i
              ),
              isOpen: true,
            };
          }
          return { items: [...state.items, item], isOpen: true };
        });
      },

      removeItem: (productId, color) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.product_id === productId && i.color === color)
          ),
        }));
      },

      updateQuantity: (productId, color, quantity) => {
        if (quantity < WHOLESALE_MIN_UNITS_PER_ITEM && quantity > 0) {
          // No permitir menos del mínimo si hay unidades
          quantity = WHOLESALE_MIN_UNITS_PER_ITEM;
        }
        if (quantity <= 0) {
          get().removeItem(productId, color);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product_id === productId && i.color === color
              ? { ...i, quantity }
              : i
          ),
        }));
      },

      clearCart:  () => set({ items: [] }),
      openCart:   () => set({ isOpen: true }),
      closeCart:  () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: "nuevelunas-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
