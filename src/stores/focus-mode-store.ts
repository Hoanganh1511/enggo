import { create } from "zustand";

const CURTAIN_CLOSE_MS = 380;
const SETTLE_MS = 120;
const CURTAIN_OPEN_MS = 380;

type FocusModeState = {
  active: boolean;
  // True trong SUOT qua trinh dong/mo rem (xem FocusModeCurtain.tsx) - dung
  // de: (1) ve 2 tam rem che man hinh, (2) khoa nut toggle khong cho bam
  // chong luc dang chuyen doi (xem EntryDownloadButtons.tsx).
  curtainClosed: boolean;
  transitioning: boolean;
  // Trang thai thu gon THU CONG cua SeriesSidebar (nut chevron trong chinh
  // sidebar) - KHONG con bi Focus mode tu dong bat/tat nua (xem comment
  // duoi export), CHI nguoi dung tu bam moi doi.
  sidebarCollapsed: boolean;
  toggle: () => void;
  setActive: (active: boolean) => void;
  toggleSidebar: () => void;
};

// [2026-09-16] Quay lai hanh vi DON GIAN cho Focus mode - yeu cau nguoi
// dung: "giờ chỉ cần tắt sidebar chính đi là được, xong phần trong sẽ dàn ra
// ngoài đó" (thay the han "Cinema Mode" 2026-09-15 truoc do: sidebar/header
// KHONG con tu an, chi bi 1 lop backdrop toi phu len + cum Series bay ra
// giua man hinh bang position:fixed - da bo, xem lich su SeriesFocusRow.tsx/
// SeriesFocusBackdrop.tsx). Gio sidebar chinh (HomeDashboardSidebar.tsx) VA
// header ngang (TopHeaderBar.tsx) tu AN THAT (return null / height 0) khi
// `active`, noi dung Series tu nhien dan rong ra full-bleed nho FeedMainArea.tsx
// da bo padding-left tuong ung tu truoc.
//
// `toggle()` KHONG doi `active` ngay lap tuc nua - dan qua 1 chuoi "dong
// rem" (yeu cau nguoi dung 2026-09-16: "làm hiệu ứng đóng rèm từ 2 bên vào
// che đi. Xong khi sidebar chính ẩn đi, dàn nó ra, rồi ẩn tiếp header, kéo
// nó sát lên top của màn hình, xong hết thì mở rèm ra. Mục tiêu là không
// cho nhìn thấy quá trình transform... layout... vỡ ra"): (1) dong rem hoan
// toan (CURTAIN_CLOSE_MS), (2) LUC MAN HINH DANG BI CHE, doi `active` (moi
// thay doi layout - an sidebar/header, content dan rong, keo len top - dieu
// xay ra NGAY LAP TUC, khong can transition rieng cho tung phan vi hoan toan
// bi rem che, khong ai thay), (3) doi them SETTLE_MS de trinh duyet chac
// chan da reflow/paint xong khung hinh moi TRUOC KHI mo rem (tranh mo rem ra
// dung luc dang con giat 1 frame layout chua on dinh), (4) mo rem
// (CURTAIN_OPEN_MS) de lo layout MOI da hoan chinh. `transitioning` bao
// trum CA 3 buoc dau (dong toi khi bat dau mo) de khoa nut toggle, tranh bam
// chong lam roi thu tu.
export const useFocusModeStore = create<FocusModeState>((set, get) => ({
  active: false,
  curtainClosed: false,
  transitioning: false,
  sidebarCollapsed: false,
  toggle: () => {
    if (get().transitioning) return;
    set({ transitioning: true, curtainClosed: true });
    setTimeout(() => {
      set((s) => ({ active: !s.active }));
      setTimeout(() => {
        set({ curtainClosed: false });
        setTimeout(() => {
          set({ transitioning: false });
        }, CURTAIN_OPEN_MS);
      }, SETTLE_MS);
    }, CURTAIN_CLOSE_MS);
  },
  // Dung cho effect tu tat Focus mode khi roi /series (TopHeaderBar.tsx) -
  // KHONG can hieu ung rem (roi trang hoan toan, khong ai thay reflow).
  setActive: (active) => set({ active }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}));
