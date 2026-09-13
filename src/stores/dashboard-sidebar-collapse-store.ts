import { create } from "zustand";

type DashboardSidebarCollapseState = {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggle: () => void;
};

// Trang thai thu gon sidebar CHINH (HomeDashboardSidebar, desktop >=lg) -
// tach store rieng (khac useDashboardSidebarDrawerStore, danh cho drawer
// MOBILE <lg) vi day la 1 khai niem khac: o desktop sidebar luon "co mat",
// chi doi giua HIEN (w-61) va AN (truot ra ngoai qua -translate-x-full) -
// dung CHUNG 1 store giua HomeDashboardSidebar.tsx (doc + render nut toggle)
// va FeedMainArea.tsx (doc de doi padding-left cho khop, 2 nhanh KHONG phai
// cha-con nen khong truyen prop duoc). Mac dinh false (hien binh thuong) -
// tu dong bat true khi vao trang chi tiet Series (2 sidebar cung luc se chat
// cho, xem SeriesDetailSidebarAutoCollapse trong HomeDashboardSidebar.tsx),
// nguoi dung van bam nut toggle de ghi de lai duoc.
export const useDashboardSidebarCollapseStore = create<DashboardSidebarCollapseState>((set) => ({
  collapsed: false,
  setCollapsed: (collapsed) => set({ collapsed }),
  toggle: () => set((s) => ({ collapsed: !s.collapsed })),
}));
