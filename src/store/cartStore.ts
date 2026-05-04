import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CartItem } from "@/types";

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  vendorId: string | null;
  addItem: (item: CartItem) => void;
  removeItem: (dishId: string) => void;
  updateQuantity: (dishId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getDeliveryFee: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      vendorId: null,

      addItem: (item: CartItem) => {
        const { items } = get();

        const existing = items.find((i) => i.dishId === item.dishId);
        if (existing) {
          set({
            items: items.map((i) =>
              i.dishId === item.dishId
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          });
        } else {
          set({
            items: [...items, { ...item, quantity: 1 }],
            vendorId: item.vendorId,
          });
        }
      },

      removeItem: (dishId: string) => {
        const { items } = get();
        const newItems = items.filter((i) => i.dishId !== dishId);
        set({ items: newItems, vendorId: newItems.length === 0 ? null : get().vendorId });
      },

      updateQuantity: (dishId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(dishId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.dishId === dishId ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => set({ items: [], vendorId: null }),

      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getTotalItems: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),

      getTotalPrice: () =>
        get().items.reduce(
          (sum, i) => sum + (i.discountPrice ?? i.price) * i.quantity,
          0
        ),

      getDeliveryFee: () => (get().items.length > 0 ? 30 : 0),
    }),
    {
      name: "khanipini-cart",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
