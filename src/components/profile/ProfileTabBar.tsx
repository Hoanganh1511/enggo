"use client";

import Link from "next/link";
import {
  Bookmark,
  BriefcaseBusiness,
  FileText,
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
      icon: Bookmark,
      href: `${base}/collections`,
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
