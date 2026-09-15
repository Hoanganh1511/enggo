"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Khoi skeleton dung chung cho toan bo Progressive Loading cua khu vuc Series
// (xem 3 tang trong (read)/layout.tsx + (read)/[entrySlug]/page.tsx: Batch 1
// header/sidebar/tieu de, Batch 2 than bai/TOC, Batch 3 install/share/
// pagination) - dung framer-motion (khong phai @keyframes CSS thuan nhu
// Skeleton mac dinh o components/ui/skeleton.tsx) THEO YEU CAU RIENG cho khu
// vuc nay: 1 dai sang (gradient trang mo) QUET NGANG lien tuc qua khoi mau
// nen, thay vi chi mo/dam (pulse) don gian - "shimmer" kinh dien cua skeleton
// screen (Facebook/LinkedIn...).
//
// [2026-09-14 fix] Ban DAU dung bg-surface-muted (#f4f4f5) lam nen khoi - qua
// gan mau nen thuc te cua CA sidebar Series (#f5f6f8) LAN trang doc (trang),
// khien tung thanh skeleton RIENG LE gan nhu VO HINH, nhap het vao 1 khoi mau
// xam nhat duy nhat (nguoi dung bao "trông vỡ hết layout" - thuc chat la loi
// TUONG PHAN, khong phai loi cau truc). Doi sang rgba(20,22,26,.08) + vien
// rgba(20,22,26,.06) - CUNG "tong" mau rgba(20,22,26,*) da dung cho text
// SeriesSidebar.tsx (dong bo 1 bang mau cho toan khu vuc Series) nhung du dam
// de noi ro RANH GIOI tung thanh tren MOI nen sang (trang/#f5f6f8/#fafaf9).
export function SeriesSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md border border-[rgba(20,22,26,0.06)] bg-[rgba(20,22,26,0.08)]",
        className,
      )}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)",
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
//
// [2026-09-15] Them "layout" - trang Entry co NHIEU Suspense doc lap xep
// CHONG (Header/Body/Toc/Extras/NextBanner...), moi khoi tu skeleton (chieu
// cao CO DINH, gia dinh) doi sang noi dung that (chieu cao THAT, thuong khac
// han, vd than bai markdown dai/ngan tuy Entry) - khi 1 khoi PHIA TREN doi
// chieu cao, MOI khoi PHIA DUOI bi day/keo len xuong DOT NGOT (yeu cau nguoi
// dung: "có cái hiện ra trên, xong cái khác hiện lên tiếp... xê dịch vị trí
// ... chưa mượt"). "layout" bao framer-motion tu do lai vi tri MOI cua chinh
// khoi nay moi khi 1 anh huong ben ngoai (vd sibling phia tren doi kich
// thuoc) lam no dich chuyen, roi ANIMATE toi do (FLIP) thay vi nhay tuc thi -
// ap dung DONG LOAT cho ca fallback skeleton LAN noi dung that (component
// nay dung chung ca 2) nen ca lan skeleton MOI xuat hien LAN luc no bien mat
// nhuong cho, LAN cac khoi khac bi anh huong deu tron tru nhu nhau.
export function FadeIn({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
