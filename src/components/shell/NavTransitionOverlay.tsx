"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useNavTransitionStore } from "@/stores/nav-transition-store";

// Overlay "đang chuyển trang" - bat qua useNavTransitionStore.start() (xem
// SeriesCardLink.tsx, hien dung cho the Series o /home + /series) khi bam 1
// link "nang" ma nguoi dung muon thay ro dang co chuyen doi thay vi cam giac
// khong phan hoi trong luc server component trang dich render. Tu AN khi
// pathname THAT SU doi (bang chung navigation da xong, trang moi da mount) -
// KHONG dua vao setTimeout co dinh (khong biet truoc server mat bao lau).
// Kem 1 timeout an toan (6s) phong truong hop nguoi dung bam roi huy ngang
// (vd bam Back cua trinh duyet trong luc cho) khien pathname khong bao gio
// doi - tranh overlay ket lai vinh vien.
export function NavTransitionOverlay() {
  const pending = useNavTransitionStore((s) => s.pending);
  const label = useNavTransitionStore((s) => s.label);
  const stop = useNavTransitionStore((s) => s.stop);
  const pathname = usePathname();

  useEffect(() => {
    stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (!pending) return;
    const timeout = setTimeout(stop, 6000);
    return () => clearTimeout(timeout);
  }, [pending, stop]);

  return (
    <AnimatePresence>
      {pending && (
        <motion.div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/25 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <motion.div
            className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface px-7 py-6 shadow-panel"
            initial={{ opacity: 0, scale: 0.94, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 4 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <LoadingSpinner size={28} className="text-primary" />
            <p className="text-[13px] font-medium text-ink-muted">
              {label ?? "Đang chuyển trang..."}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
