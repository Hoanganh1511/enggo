"use client";

import { motion } from "framer-motion";
import { useFocusModeStore } from "@/stores/focus-mode-store";

// Boc hang flex aside+content chinh cua trang Series ((read)/layout.tsx,
// Server Component - khong doc duoc Zustand).
//
// [2026-09-16] Quay lai layout DON GIAN - "Cinema Mode" (fixed/can giua/
// letterbox/backdrop toi, 2026-09-15) da BO theo yeu cau nguoi dung: "giờ
// chỉ cần tắt sidebar chính đi là được, xong phần trong sẽ dàn ra ngoài đó".
// Component nay gio KHONG can biet Focus mode dang bat hay tat nua - hang
// nay LUON nam trong luong trang binh thuong (position tinh), chi con
// `layout` prop cua framer-motion de tu ANIMATE muot khi CHIEU RONG cua no
// thay doi (luc HomeDashboardSidebar.tsx an/hien qua lai, khoang trong ben
// trai mat/xuat hien lam hang nay dan rong/thu hep lai - `layout` bat chuyen
// dong do thanh 1 hieu ung tu nhien thay vi nhay khung dot ngot). Toan bo
// "an that" cua sidebar/header + hieu ung che man hinh trong luc doi layout
// nam o noi khac (HomeDashboardSidebar.tsx, TopHeaderBar.tsx,
// FocusModeCurtain.tsx), KHONG con o day.
export function SeriesFocusRow({ children }: { children: React.ReactNode }) {
  // Header ngang tu an that (TopHeaderBar.tsx) khi Focus mode bat - luc do
  // KHONG con gi de tru nua, dung nguyen 100vh se dung hon "100vh - header"
  // (thieu mat 56px so voi khoang trong THAT SU dang co san).
  const focusModeActive = useFocusModeStore((s) => s.active);
  return (
    <motion.div
      layout
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="-mx-4 -my-6 flex min-w-0 bg-background sm:-mx-6 lg:-mx-10"
      style={{
        minHeight: focusModeActive
          ? "100vh"
          : "calc(100vh - var(--header-height))",
      }}
    >
      {children}
    </motion.div>
  );
}
