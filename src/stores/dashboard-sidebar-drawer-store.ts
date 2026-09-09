import { create } from "zustand";

type DashboardSidebarDrawerState = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
};

// Trang thai mo/dong drawer sidebar mobile cua khu vuc /home + /articles.
// TopHeaderBar.tsx (nut hamburger, gio da gop vao header chung thay vi 1
// thanh rieng ben duoi) va HomeDashboardSidebar.tsx (noi dung drawer that)
// la 2 nhanh KHAC NHAU trong cay component (khong phai cha-con), nen phai
// dung chung 1 store thay vi truyen state qua props.
export const useDashboardSidebarDrawerStore = create<DashboardSidebarDrawerState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
  toggle: () => set((s) => ({ open: !s.open })),
}));
