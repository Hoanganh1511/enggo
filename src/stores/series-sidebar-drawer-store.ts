import { create } from "zustand";

type SeriesSidebarDrawerState = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
};

// Trang thai mo/dong drawer mobile cua cay category/entry 1 Series - cung
// tinh than dashboard-sidebar-drawer-store.ts (nut mo o SeriesMobileTopBar.tsx
// va noi dung drawer that o SeriesSidebarDrawer.tsx la 2 nhanh KHAC NHAU
// trong cay component, phai dung chung 1 store thay vi truyen props).
export const useSeriesSidebarDrawerStore = create<SeriesSidebarDrawerState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
  toggle: () => set((s) => ({ open: !s.open })),
}));
