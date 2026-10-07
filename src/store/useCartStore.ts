import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  cart: CartItem[];
  pickupSlot: string;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  setPickupSlot: (slot: string) => void;
  clearCart: () => void;
  getTotalAmount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      pickupSlot: '12:00 PM - 12:30 PM',
      addItem: (item) =>
        set((state) => {
          const existing = state.cart.find((i) => i.id === item.id);
          if (existing) {
            return {
              cart: state.cart.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }
          return { cart: [...state.cart, { ...item, quantity: 1 }] };
        }),
      removeItem: (id) =>
        set((state) => ({ cart: state.cart.filter((i) => i.id !== id) })),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          cart: state.cart
            .map((i) => (i.id === id ? { ...i, quantity } : i))
            .filter((i) => i.quantity > 0),
        })),
      setPickupSlot: (pickupSlot) => set({ pickupSlot }),
      clearCart: () => set({ cart: [] }),
      getTotalAmount: () =>
        get().cart.reduce((total, item) => total + item.price * item.quantity, 0),
    }),
    {
      name: 'canteen-cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);