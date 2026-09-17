"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Bao ve du lieu chua luu - yeu cau nguoi dung: "Các trang cần thêm tính
// năng bảo vệ dữ liệu khi có bất kỳ hành động nào rời khỏi trang hiện tại
// nếu có thay đổi trong nội dung. Cần bật modal để confirm trước khi quyết
// định thoát". Chan 2 kieu roi trang KHAC NHAU, moi kieu can 1 co che rieng:
//
// 1. Roi trang "cung" (dong tab/refresh/go URL moi/mo lai) - dung
//    `beforeunload` chuan cua trinh duyet. Trinh duyet TU hien hop thoai
//    rieng cua no (KHONG the tuy bien giao dien/text - moi trinh duyet hien
//    dinh 1 cau chung, day la gioi han BAO MAT co chu dich cua chinh
//    trinh duyet, khong phai thieu sot cua code nay).
// 2. Roi trang "trong app" (bam 1 <Link>/<a> noi bo dieu huong sang trang
//    khac qua Next.js client-side routing - KHONG unload trang that su nen
//    `beforeunload` KHONG bao gio bat duoc) - chan bang 1 listener "click"
//    o CAP DOCUMENT (capture:true, chay TRUOC ca Link cua Next.js kip
//    dieu huong), tim the <a> gan nhat, huy hanh vi mac dinh, luu lai href
//    do de hoi lai nguoi dung qua modal RIENG (component goi ham nay tu ve,
//    xem UnsavedChangesModal.tsx) - dong y moi thuc su goi router.push().
//
// KHONG bat duoc: nut Back/Forward cua trinh duyet (popstate) trong pham vi
// Next.js App Router - framework tu quan ly history noi bo, can thiep vao
// day de gia mao 1 buoc history rat de vo tinh pha vo nut back/forward cho
// CA nhung trang khac khong lien quan, ngoai pham vi hop ly cua 1 tinh nang
// "canh bao truoc khi thoat" don gian.
export function useUnsavedChangesGuard(isDirty: boolean) {
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    if (!isDirty) return;

    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      // Gan gia tri (chuoi rong) - CHI de tuong thich vai trinh duyet cu van
      // doc `returnValue` de quyet dinh co hien hop thoai hay khong, noi
      // dung chuoi khong con anh huong toi text hien thi tren trinh duyet
      // hien dai (da co t o comment tren).
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    if (!isDirty) return;

    function handleClick(e: MouseEvent) {
      // Bam giua/phai/kem phim (mo tab moi...) - de trinh duyet tu xu ly
      // binh thuong, khong chan.
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || anchor.target === "_blank") return;
      // Link ngoai domain (vd mailto:, tel:, hoac site khac) - de nguyen,
      // khong thuoc pham vi "roi trang trong app" can canh bao.
      if (anchor.origin !== window.location.origin) return;

      e.preventDefault();
      e.stopPropagation();
      setPendingHref(href);
    }
    // capture:true - chay TRUOC handler click cua chinh Next.js Link (gan o
    // pha bubble mac dinh), can thiet de kip preventDefault truoc khi
    // Next.js kip dieu huong.
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [isDirty]);

  const confirmLeave = useCallback(() => {
    if (pendingHref) router.push(pendingHref);
    setPendingHref(null);
  }, [pendingHref, router]);

  const cancelLeave = useCallback(() => setPendingHref(null), []);

  return { pendingHref, confirmLeave, cancelLeave };
}
