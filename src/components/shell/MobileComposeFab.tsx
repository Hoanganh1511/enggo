"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SquarePen } from "lucide-react";
import { useMobileFabBottomOffset } from "@/lib/use-mobile-fab-bottom-offset";

// "Viết bài" tren mobile/tablet (<lg) la 1 nut icon-only fixed goc
// duoi-phai thay cho pill chu trong header (an o do tren mobile, xem
// TopHeaderBar.tsx) - hien TREN MOI TRANG (khong rieng /home) TRU chinh
// /compose (da o do, FAB thua) VA /home (co ban rieng gom san trong cum
// Roadmap/Weekly Progress, xem HomeMobileQuickPanels.tsx - tranh 2 nut
// chong nhau cung 1 vi tri fixed). bottom dong (useMobileFabBottomOffset) -
// tu day len cao hon o /p/[id] de khong bi ArticleActionBar (cum fixed
// duoi cung, xem file do) de len.
//
// /messages CUNG an - khung soan tin + nut Gui nam O CUOI luong bo cuc binh
// thuong (khong phai fixed), nen FAB fixed nay se de THANG len tren, cu the
// la de dung vao nut Gui (yeu cau nguoi dung bao loi 2026-09-13). Chieu cao
// khung soan CO GIAN theo noi dung go (textarea max-h-24), khac
// ArticleActionBar (cao co dinh 56px) nen KHONG the tinh 1 offset co dinh
// nhu o do - an han FAB la giai phap on dinh nhat, cung hop ly ve UX: dang
// trong 1 cuoc tro chuyen toan man hinh thi "Viet bai" noi la thua, khong
// giong /p/[id] (van con ngu canh doc bai can thao tac khac).
export function MobileComposeFab() {
  const pathname = usePathname();
  const bottom = useMobileFabBottomOffset();
  // startsWith("/compose") (khong phai so bang tuyet doi) - truoc day chi an
  // dung "/compose" (tao bai moi), quen mat "/compose/[id]" (SUA bai) van
  // con hien FAB nay du dang o thang trong trang compose, vua thua vua de
  // dam vao nut fixed rieng cua trang do (xem nut "Đến phần cấu hình" trong
  // Composer.tsx).
  if (
    pathname.startsWith("/compose") ||
    pathname === "/home" ||
    pathname === "/messages"
  )
    return null;

  return (
    <Link
      href="/compose"
      aria-label="Viết bài"
      style={{ bottom }}
      className="fixed right-4 z-30 flex size-12 cursor-pointer items-center justify-center rounded-full bg-black/90 text-white shadow-lg transition-[bottom] duration-150 ease-out hover:opacity-90 lg:hidden"
    >
      <SquarePen size={19} aria-hidden="true" />
    </Link>
  );
}
