import type { Post } from "@/content/home-feed-mock";

// Nhom kind CUC BO cho tung section editorial cua trang Home - DOC LAP voi
// ContentType cua post-kind-meta.ts (dung cho thanh loc Content Type) vi muc
// dich khac nhau: o day "note" tach rieng khoi "resource" (dung cho Latest
// Posts, giong tinh chat van ban ca nhan hon la tu lieu tham khao) - xem
// EditorialFeed.tsx ban cu. Dung chung boi home/page.tsx (fetch rieng tung
// hang, moi hang goi API voi dung kind cua no) va EditorialFeed.tsx (khong
// con tu filter, chi con nhan posts da duoc loc san tu server).
export const LATEST_POST_KINDS: Post["kind"][] = [
  "text",
  "image",
  "gallery",
  "video",
  "idea",
  "note",
];
export const RESOURCE_KINDS: Post["kind"][] = [
  "resource",
  "file",
  "link",
  "code-snippet",
  "tutorial",
];
export const PROJECT_KINDS: Post["kind"][] = [
  "project-update",
  "node-created",
  "knowledge-block",
  "experiment",
];
export const ACHIEVEMENT_KINDS: Post["kind"][] = [
  "achievement",
  "milestone",
  "career-update",
];
