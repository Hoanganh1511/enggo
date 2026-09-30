"use client";

import { useEffect } from "react";
import { useFocusModeStore } from "@/stores/focus-mode-store";

// Tu dong BAT Focus mode (an sidebar chinh + header ngang - co che co san,
// xem focus-mode-store.ts) ngay khi vao 1 trang doc Entry - yeu cau nguoi
// dung: "Trang chi tiết Series không để sidebar chính nữa", CHI ap dung cho
// trang doc Entry (KHONG phai Overview - o do van giu sidebar chinh nhu cu).
// Truoc day Focus mode CHI bat duoc bang tay qua cong tac trong
// EntryDownloadButtons.tsx - cong tac do van con, nguoi dung van tat duoc
// binh thuong (toggle() se dao lai `active`, KHONG bi component nay ghi de vi
// no chi set 1 LAN luc mount, khong lap lai theo poll nao).
//
// Mount TRONG [entrySlug]/page.tsx (Server Component) - tach rieng thanh 1
// Client Component RONG (khong render gi, return null) dung tinh than
// FeedMainArea.tsx/SeriesFocusRow.tsx (Server Component cha khong doc duoc
// Zustand truc tiep). Cleanup tat lai `active` luc unmount - trang Entry nay
// remount moi lan doi params (`entrySlug` khac), nen chuyen Entry -> Entry
// khac VAN giu Focus mode bat (tat roi bat lai ngay lap tuc, khong thay nhap
// nhay); roi khoi hang muc Entry (vd ve trang Overview, page.tsx khac han,
// khong con component nay trong cay) moi thuc su tat.
export function EntryAutoFocusMode() {
  const setActive = useFocusModeStore((s) => s.setActive);
  useEffect(() => {
    setActive(true);
    return () => setActive(false);
  }, [setActive]);
  return null;
}
