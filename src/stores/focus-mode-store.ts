import { create } from "zustand";

type FocusModeState = {
  active: boolean;
  // Trang thai thu gon THU CONG cua SeriesSidebar (nut chevron trong chinh
  // sidebar) - KHONG con bi Focus mode tu dong bat/tat nua, CHI nguoi dung
  // tu bam moi doi.
  sidebarCollapsed: boolean;
  toggle: () => void;
  setActive: (active: boolean) => void;
  toggleSidebar: () => void;
};

// [2026-09-16] Hanh vi DON GIAN - yeu cau nguoi dung: "giờ chỉ cần tắt
// sidebar chính đi là được, xong phần trong sẽ dàn ra ngoài đó". `active`
// doi NGAY LAP TUC khi bam toggle (bo han hieu ung "đóng rèm" che man hinh
// da thu truoc do trong ngay - nguoi dung: "Bỏ cái rèm animation đi") -
// HomeDashboardSidebar.tsx/TopHeaderBar.tsx tu an (return null) khi active,
// SeriesFocusRow.tsx (co san `layout` prop cua framer-motion) tu lam muot
// phan CHIEU RONG thay doi do, khong can che man hinh gi them.
export const useFocusModeStore = create<FocusModeState>((set) => ({
  active: false,
  sidebarCollapsed: false,
  toggle: () => set((s) => ({ active: !s.active })),
  setActive: (active) => set({ active }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}));
