import { create } from "zustand";

type FocusModeState = {
  active: boolean;
  // Trang thai thu gon THU CONG cua SeriesSidebar (nut chevron trong chinh
  // sidebar) - KHONG con bi Focus mode tu dong bat/tat nua (xem comment
  // duoi export), CHI nguoi dung tu bam moi doi.
  sidebarCollapsed: boolean;
  toggle: () => void;
  setActive: (active: boolean) => void;
  toggleSidebar: () => void;
};

// [2026-09-15] Doi hanh vi hoan toan - yeu cau nguoi dung: "Kết hợp Cinema
// Mode vào Focus mode" + mo ta cu the: "phần nội dung chính gồm sidebar seri
// và chi tiết bài -> cả cụm này sẽ có animation di chuyển ra chính giữa màn
// hình, phần top của nó thì di chuyển lên sát bám vào top viewport, cùng lúc
// đó, xung quanh tối đi". KHONG con an header/sidebar chinh (return null) -
// 2 cho do gio LUON hien binh thuong, "tối đi" duoc lam boi 1 lop backdrop
// toi PHU LEN TREN chung (xem SeriesFocusBackdrop.tsx), khong phai tu chinh
// header/sidebar tu lam mo minh. Cum sidebar-seri+noi-dung (SeriesFocusRow.tsx)
// moi la thu THAT SU doi hanh vi: chuyen sang fixed, can giua, dinh top, co
// animation "bay" toi do (framer-motion layout).
//
// sidebarCollapsed KHONG con bi RESET ve true moi lan bat Focus mode nua -
// sidebar cay category/entry gio la 1 PHAN CUA cum di chuyen ra giua man
// hinh, phai o TRANG THAI HIEN BINH THUONG (khong tu thu gon) - nut thu gon
// thu cong (SeriesSidebarCollapseButton.tsx) van con nhung KHONG con bi
// Focus mode ep bat/tat tu dong nua.
export const useFocusModeStore = create<FocusModeState>((set) => ({
  active: false,
  sidebarCollapsed: false,
  toggle: () => set((s) => ({ active: !s.active })),
  setActive: (active) => set({ active }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}));
