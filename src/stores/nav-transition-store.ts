import { create } from "zustand";

type NavTransitionState = {
  pending: boolean;
  label: string | undefined;
  start: (label?: string) => void;
  stop: () => void;
};

// Trang thai overlay "dang chuyen trang" (xem NavTransitionOverlay.tsx) - bat
// tu component NAO ĐÓ vua bam 1 link "nang" (vd SeriesCardLink.tsx: bam the
// Series tren /home hoac /series roi cho server render trang chi tiet), tat
// tu chinh overlay khi pathname thuc su doi (xem effect trong
// NavTransitionOverlay.tsx) - 2 noi khac nhau trong cay component nen phai
// dung chung 1 store, cung tinh than useDashboardSidebarDrawerStore.
export const useNavTransitionStore = create<NavTransitionState>((set) => ({
  pending: false,
  label: undefined,
  start: (label) => set({ pending: true, label }),
  stop: () => set({ pending: false, label: undefined }),
}));
