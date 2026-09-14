import { create } from "zustand";

type FocusModeState = {
  active: boolean;
  // Trang thai thu gon cua SeriesSidebar KHI dang o Focus mode - CHI co y
  // nghia luc active=true (luc binh thuong sidebar luon hien day du, khong
  // lien quan co bien nay). Reset ve true (thu gon) moi lan BAT focus mode -
  // "khi bật focus mode... sidebar sẽ collapse lại" (yeu cau nguoi dung).
  sidebarCollapsed: boolean;
  toggle: () => void;
  setActive: (active: boolean) => void;
  toggleSidebar: () => void;
};

// Focus mode cho trang doc Entry trong Series - an header ngang (TopHeaderBar.tsx)
// + sidebar chinh cua app (HomeDashboardSidebar.tsx), thu gon sidebar cay
// category/entry cua Series (SeriesFocusSidebar.tsx) xuong con 1 nut tron.
// Global store (khong phai props) vi 3 component tren la CAC NHANH KHAC NHAU
// trong cay component (header/sidebar/series-layout), cung tinh than
// dashboard-sidebar-drawer-store.ts.
export const useFocusModeStore = create<FocusModeState>((set) => ({
  active: false,
  sidebarCollapsed: true,
  toggle: () => set((s) => ({ active: !s.active, sidebarCollapsed: true })),
  setActive: (active) => set({ active, sidebarCollapsed: true }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}));
