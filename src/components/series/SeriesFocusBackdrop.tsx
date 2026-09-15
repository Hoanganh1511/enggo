"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useFocusModeStore } from "@/stores/focus-mode-store";

// Lop backdrop toi PHU LEN TREN toan bo man hinh (header, sidebar chinh, nen
// trang...) khi Focus mode bat - yeu cau nguoi dung: "Kết hợp Cinema Mode
// vào Focus mode... cùng lúc đó, xung quanh tối đi, hiệu ứng anim như rạp
// phim". Header/sidebar VAN render binh thuong (khong tu an/tu lam mo minh,
// xem TopHeaderBar.tsx/HomeDashboardSidebar.tsx) - 1 lop den ban trong suot
// PHU LEN TREN CHUNG (z-30, thap hon cum sidebar-seri+noi-dung dang o z-40
// trong SeriesFocusRow.tsx) la thu THAT SU lam moi thu phia sau nhin "tối
// đi", giong den phong chieu tat di truoc khi phim chay.
export function SeriesFocusBackdrop() {
  const focusModeActive = useFocusModeStore((s) => s.active);
  return (
    <AnimatePresence>
      {focusModeActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed inset-0 z-30 bg-black/80"
          aria-hidden="true"
        />
      )}
    </AnimatePresence>
  );
}
