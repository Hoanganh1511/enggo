"use client";

import { usePathname } from "next/navigation";

// An sidebar chinh (HomeDashboardSidebar) mot cach TINH/on dinh theo URL,
// KHONG lien quan gi den Focus mode store - yeu cau nguoi dung (lan dau, cho
// Series): "Lúc chuyển bài nó bị tắt focus mode xong lại bật lại. Tôi không
// thích trải nghiệm này. Ý là bỏ hẳn cái sidebar main đi. Focus mode không
// liên quan". [2026-10-02] Doi ten tu "useSeriesEntrySidebarHidden" ->
// "useMainSidebarHidden" (TONG QUAT hon, khong con rieng Series) - yeu cau
// nguoi dung: "Trang planner này đưa ra khỏi layout sidebar nhé", them
// /planner vao danh sach an.
//
// Truoc day (ban Series) dung EntryAutoFocusMode.tsx (mount/unmount
// setActive(true/false) qua Focus mode store) - MOI LAN chuyen sang Entry
// khac, page.tsx cu UNMOUNT (setActive(false), sidebar tam thoi hien lai) roi
// page.tsx MOI mount ngay sau do (setActive(true) lai) - 2 buoc nay khong
// dam bao chay LIEN TUC trong CUNG 1 frame => nhay/giat that su nguoi dung
// thay duoc. Tinh THANG tu usePathname() (thuan render, khong qua effect/
// mount-unmount) loai bo hoan toan hien tuong nay.
const HIDDEN_PATH_PATTERNS = [
  // /series/manage/entries, /series/manage/entries/new, /series/manage/entries/abc...
  /^\/series\/[^/]+\/manage\/entries(?:\/|$)/,
  // /series/[slug]/[entrySlug] (Entry doc that su - 2 segment, segment 2
  // KHONG phai "manage" hay "new"/"map" van tinh vi la 1 entrySlug hop le).
  /^\/series\/[^/]+\/(?!manage(?:\/|$))[^/]+$/,
  // /planner (va moi trang con sau nay neu co, vd /planner/settings) - yeu
  // cau nguoi dung: "Trang planner này đưa ra khỏi layout sidebar nhé".
  /^\/planner(?:\/|$)/,
];

export function useMainSidebarHidden(): boolean {
  const pathname = usePathname();
  return HIDDEN_PATH_PATTERNS.some((re) => re.test(pathname));
}
