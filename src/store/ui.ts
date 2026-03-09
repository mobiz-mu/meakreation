import { create } from "zustand";

type UiState = {
  searchOpen: boolean;
  cartOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  openCart: () => void;
  closeCart: () => void;
  closeAll: () => void;
};

export const useUI = create<UiState>((set) => ({
  searchOpen: false,
  cartOpen: false,
  openSearch: () => set({ searchOpen: true }),
  closeSearch: () => set({ searchOpen: false }),
  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),
  closeAll: () => set({ searchOpen: false, cartOpen: false }),
}));