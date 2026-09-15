"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, FileText } from "lucide-react";

// Thay the toast thuong cho hanh dong "Copy page" - yeu cau nguoi dung:
// "không dùng toast để thông báo thành công [nút] copy page. Tạo 1 UI hình
// file markdown, tạo animation cho nó lật từ bé lên scale tỉ lệ 1... size cỡ
// 200x200px, vừa scale vừa lật từ mặt sau ra mặt trước, rồi mặt trước có
// chữ copied md + dấu tích xanh". Ky thuat "flip card" 2 mat kinh dien: 1
// the ngoai xoay rotateY(180 -> 0) + scale(0 -> 1) CUNG LUC, 2 mat con (front/
// back) dat absolute + backface-visibility:hidden BEN TRONG, moi mat tu xoay
// rieng (back co local rotateY(180deg)) de LUON co dung 1 mat huong ve nguoi
// dung tai bat ky goc xoay nao cua the ngoai - dung hieu ung lat THAT (khong
// phai chi mo/dong opacity gia lam "lat"). CHI danh cho Copy page (KHONG
// dung cho "Copy link" trong modal Share hay cac toast khac cua app - pham
// vi yeu cau CHI 1 nut nay).
export function CopyPageFlipCard({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <div
          className="pointer-events-none fixed inset-0 z-100 flex items-center justify-center"
          style={{ perspective: 800 }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/10"
          />
          <motion.div
            initial={{ scale: 0, rotateY: 180 }}
            animate={{ scale: 1, rotateY: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ width: 200, height: 200, transformStyle: "preserve-3d" }}
            className="relative"
          >
            {/* Mat TRUOC - noi dung "Copied .md" + dau tick xanh, chi hien ro
                khi the ngoai o gan rotateY:0 (huong ve nguoi dung). */}
            <div
              style={{ backfaceVisibility: "hidden" }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-surface shadow-xl"
            >
              <div className="relative">
                <FileText size={64} strokeWidth={1.5} className="text-ink-muted" aria-hidden="true" />
                <CheckCircle2
                  size={26}
                  strokeWidth={2}
                  className="absolute -right-2 -bottom-1.5 rounded-full bg-surface text-success"
                  aria-hidden="true"
                />
              </div>
              <p className="text-[13px] font-semibold text-ink">Copied .md</p>
            </div>

            {/* Mat SAU - local rotateY(180deg) rieng, cong voi rotateY cua the
                ngoai dang o 180 (luc bat dau) triet tieu lan nhau (180+180=360,
                nhin nhu 0) nen day moi la mat THAT SU huong ve nguoi dung o
                khoanh khac dau tien - dung hieu ung "lật từ mặt sau ra mặt
                trước" nguoi dung mo ta, khong phai the trong/mo. */}
            <div
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              className="absolute inset-0 flex items-center justify-center rounded-2xl border border-border bg-surface-muted shadow-xl"
            >
              <FileText size={64} strokeWidth={1.5} className="text-ink-faint" aria-hidden="true" />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
