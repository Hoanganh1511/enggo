"use client";

import Link from "next/link";
import {
  Bookmark,
  BriefcaseBusiness,
  FileText,
  Folder,
  Heart,
  History,
  Home,
  ListVideo,
  type LucideIcon,
} from "lucide-react";
import { useProfileContext } from "./profile-context";

type TabItem = {
  key: string;
  label: string;
  icon: LucideIcon;
  href: string;
  selfOnly?: boolean;
};

// Tab ngang tren dau vung noi dung chinh - thay nav DOC truoc day nam trong
// ProfileSidebar.tsx (chuyen theo dung cau truc note.com: sidebar chi con
// identity/follow/Magazine, dieu huong giua cac tab nam rieng o day, ngay
// tren {children} - xem ProfileShell.tsx).
function buildTabs(username: string): TabItem[] {
  const base = `/u/${username}`;
  return [
    { key: "home", label: "Trang chủ", icon: Home, href: base },
    { key: "posts", label: "Bài đăng", icon: FileText, href: `${base}/posts` },
    {
      key: "workspace",
      label: "Workspace",
      icon: BriefcaseBusiness,
      href: `/workspace/${username}`,
    },
    {
      key: "playlists",
      label: "Danh sách phát",
      icon: ListVideo,
      href: `${base}/playlists`,
    },
    {
      key: "collections",
      label: "Bộ sưu tập",
      // Folder (khong phai Bookmark nua) - tach ro voi tab "Đã lưu" ben duoi,
      // 2 khai niem khac nhau (bo suu tap tu dat ten/cong khai duoc, doi lap
      // "Đã lưu" la danh sach rieng tu don gian) tung dung CHUNG 1 icon
      // Bookmark gay nham lan (yeu cau nguoi dung sua).
      icon: Folder,
      href: `${base}/collections`,
    },
    {
      key: "saved",
      label: "Đã lưu",
      icon: Bookmark,
      href: `${base}/saved`,
      // RIENG TU - backend (GET /posts/saved) luon tra danh sach cua CHINH
      // nguoi dang dang nhap, khong co cach xem "Đã lưu" cua nguoi khac -
      // an han tab nay khi xem profile nguoi khac thay vi hien ra roi lai
      // hien du lieu SAI CHU (cua chinh minh, khong phai cua ho).
      selfOnly: true,
    },
    { key: "likes", label: "Thích", icon: Heart, href: `${base}/likes` },
    {
      key: "history",
      label: "Lịch sử",
      icon: History,
      href: `${base}/history`,
      selfOnly: true,
    },
  ];
}

export function ProfileTabBar() {
  const { profile, activeHref, onNavClick } = useProfileContext();
  const tabs = buildTabs(profile.username ?? "").filter(
    (t) => !t.selfOnly || profile.isSelf,
  );

  return (
    <div className="border-b border-border">
      <div className="flex items-center gap-1 overflow-x-auto overflow-y-hidden">
        {tabs.map((tab) => {
          const isActive = activeHref === tab.href;
          return (
            <Link
              key={tab.key}
              href={tab.href}
              onClick={(e) => onNavClick(e, tab.href)}
              className={`-mb-px flex shrink-0 cursor-pointer items-center gap-1.5 border-b-2 px-3 py-3 text-sm font-medium transition-colors duration-150 ease-out ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-ink-muted hover:text-ink"
              }`}
            >
              <tab.icon size={15} strokeWidth={2} />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
