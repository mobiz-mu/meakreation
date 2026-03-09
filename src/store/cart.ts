import { create } from "zustand";

export type CartItem = {
  productId: string;
  variantId: string | null;
  title: string;
  variantLabel: string | null;
  imageUrl: string | null;
  unitPriceMur: number;
  qty: number;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;

  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId: string | null) => void;
  setQty: (productId: string, variantId: string | null, qty: number) => void;
  clear: () => void;

  openCart: () => void;
  closeCart: () => void;
};

function sameKey(
  a: { productId: string; variantId: string | null },
  b: { productId: string; variantId: string | null }
) {
  return a.productId === b.productId && (a.variantId ?? null) === (b.variantId ?? null);
}

export const useCart = create<CartState>((set, get) => ({
  items: [],
  isOpen: false,

  addItem: (item) => {
    const items = [...get().items];
    const idx = items.findIndex((x) => sameKey(x, item));

    if (idx >= 0) {
      items[idx] = { ...items[idx], qty: items[idx].qty + item.qty };
    } else {
      items.push(item);
    }

    set({
      items,
      isOpen: true, // automatically open cart when adding
    });
  },

  removeItem: (productId, variantId) =>
    set({
      items: get().items.filter(
        (x) => !(x.productId === productId && (x.variantId ?? null) === (variantId ?? null))
      ),
    }),

  setQty: (productId, variantId, qty) => {
    const q = Math.max(1, Math.floor(qty || 1));

    set({
      items: get().items.map((x) =>
        x.productId === productId && (x.variantId ?? null) === (variantId ?? null)
          ? { ...x, qty: q }
          : x
      ),
    });
  },

  clear: () => set({ items: [] }),

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
}));