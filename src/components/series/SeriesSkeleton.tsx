"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Khoi skeleton dung chung cho toan bo Progressive Loading cua khu vuc Series
// (xem 3 tang trong (read)/layout.tsx + (read)/[entrySlug]/page.tsx: Batch 1
// header/sidebar/tieu de, Batch 2 than bai/TOC, Batch 3 install/share/
// pagination) - dung framer-motion (khong phai @keyframes CSS thuan nhu
// Skeleton mac dinh o components/ui/skeleton.tsx) THEO YEU CAU RIENG cho khu
// vuc nay: 1 dai sang (gradient trang mo) QUET NGANG lien tuc qua khoi mau
// nen (bg-surface-muted), thay vi chi mo/dam (pulse) don gian - "shimmer"
// kinh dien cua skeleton screen (Facebook/LinkedIn...).
export function SeriesSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-md bg-surface-muted", className)}>
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)",
        }}
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{ duration: 1.3, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

// Fade+truot nhe LUC MOUNT - dung cho CA fallback skeleton (luc Suspense
// boundary bat dau hien) LAN khoi noi dung that thay the no (luc Suspense
// resolve) - 2 lan mount DOC LAP nhau (Suspense KHONG cho AnimatePresence
// "bat" duoc 1 chuyen doi crossfade THAT giua 2 nhanh cua no, vi fallback/
// children khong phai 1 mang con AnimatePresence tu theo doi duoc), nhung ap
// cung 1 kieu fade+truot cho CA 2 phia tao cam giac lien tuc, muot ma - dung
// tinh than "anim in, out mượt, nhẹ nhàng, rõ ý chuyển đổi" nguoi dung yeu
// cau, trong gioi han thuc te cua RSC Suspense streaming.
export function FadeIn({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
