import { create } from "zustand";

type CinemaModeState = {
  active: boolean;
  toggle: () => void;
};

// "Cinema mode" cho trang doc Entry trong Series - yeu cau nguoi dung: "Khi
// bật sẽ tắt đèn xung quanh ở các vùng: Sidebar chính, header". KHAC voi
// Focus mode (focus-mode-store.ts, AN HAN header/sidebar chinh khoi DOM) -
// Cinema mode chi LAM MO (dim opacity) cac vung do, VAN con trong layout/
// nhin thay lo mo, giong hieu ung "tắt đèn phòng chiếu" trong rap - nguoi
// dung van co the tuong tac lai khi can, khong bi mat han nhu Focus mode.
// Global store (khong phai props) vi TopHeaderBar.tsx va HomeDashboardSidebar.tsx
// la 2 nhanh KHAC nhau trong cay component, dung tinh than focus-mode-store.ts.
export const useCinemaModeStore = create<CinemaModeState>((set) => ({
  active: false,
  toggle: () => set((s) => ({ active: !s.active })),
}));
