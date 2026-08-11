"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Bookmark,
  BookText,
  CalendarDays,
  FileText,
  Heart,
  History,
  Home,
  Link2,
  ListVideo,
  type LucideIcon,
} from "lucide-react";
import { formatCompact } from "@/lib/format-number";
import { useAllPosts } from "@/lib/discover/use-all-posts";

export type ProfileTab =
  | "home"
  | "posts"
  | "docs"
  | "playlists"
  | "collections"
  | "likes"
  | "history";

function formatJoinDate(iso: string): string {
  const d = new Date(iso);
  return `tháng ${d.getMonth() + 1} năm ${d.getFullYear()}`;
}

function MetaItem({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-ink-muted">
      <Icon size={13} strokeWidth={1.75} className="shrink-0 text-ink-faint" />
      {children}
    </span>
  );
}

// So lieu follow dang "so tren, nhan duoi" - can trai, tach khoi cum meta
// bang duong ke doc.
function CountItem({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex shrink-0 items-baseline gap-1">
      <span className="text-sm font-bold leading-tight text-ink tabular-nums">
        {formatCompact(value)}
      </span>
      <span className="text-[11px] text-ink-muted">{label}</span>
    </div>
  );
}

// Giong CountItem nhung la link - dan toi trang danh sach that
// (/u/[username]/following hoac /followers). Sang mau primary khi dang o
// dung trang do (isActive), giong cach tab ben trai highlight.
function CountLink({
  href,
  value,
  label,
  isActive,
  onNavClick,
}: {
  href: string;
  value: number;
  label: string;
  isActive: boolean;
  onNavClick: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
}) {
  return (
    <Link
      href={href}
      onClick={(e) => onNavClick(e, href)}
      className={`flex shrink-0 items-baseline gap-1 hover:underline ${
        isActive ? "text-primary" : ""
      }`}
    >
      <span
        className={`text-sm font-bold leading-tight tabular-nums ${
          isActive ? "text-primary" : "text-ink"
        }`}
      >
        {formatCompact(value)}
      </span>
      <span
        className={`text-[11px] ${isActive ? "text-primary" : "text-ink-muted"}`}
      >
        {label}
      </span>
    </Link>
  );
}

// key rong ("") ung voi chinh /u/[username] (tab "home") - cac tab con lai
// la route con /u/[username]/<key>, xem cac page.tsx tuong ung. Moi tab 1
// mau icon rieng (sang/pastel), CO DINH khong doi theo active/inactive -
// dung dung pattern iconColor da co san o HomeLayoutShell.tsx (tab "Su kien").
const TABS: {
  key: ProfileTab;
  path: string;
  label: string;
  icon: LucideIcon;
  iconColor: string;
  selfOnly?: boolean;
}[] = [
  {
    key: "home",
    path: "",
    label: "Trang chủ",
    icon: Home,
    iconColor: "#38bdf8",
  },
  {
    key: "posts",
    path: "posts",
    label: "Bài đăng",
    icon: FileText,
    iconColor: "#818cf8",
  },
  {
    key: "docs",
    path: "docs",
    label: "Tài liệu",
    icon: BookText,
    iconColor: "#22c55e",
  },
  {
    key: "playlists",
    path: "playlists",
    label: "Danh sách phát",
    icon: ListVideo,
    iconColor: "#c084fc",
  },
  {
    key: "collections",
    path: "collections",
    label: "Bộ sưu tập",
    icon: Bookmark,
    iconColor: "#fbbf24",
  },
  {
    key: "likes",
    path: "likes",
    label: "Thích",
    icon: Heart,
    iconColor: "#fb7185",
  },
  {
    key: "history",
    path: "history",
    label: "Lịch sử",
    icon: History,
    iconColor: "#2dd4bf",
    selfOnly: true,
  },
];

// Thanh dieu huong trong profile - tran vien nhu header, dinh ngay duoi anh
// bia. Moi tab la 1 <Link> that toi /u/[username]/<tab>, MANG DUOC username
// tren URL (thay vi state cuc bo truoc day) - "Lich su" chi co nghia voi
// chinh chu nen an voi nguoi khac. Cum so lieu follow + ngay tham gia nam
// BEN PHAI, cung hang voi tab (thay cho o tim kiem cu, da bo).
const ProfileNav = ({
  username,
  activeHref,
  onNavClick,
  isSelf,
  postCount,
  followingCount,
  followerCount,
  createdAt,
  websiteUrl,
}: {
  username: string;
  activeHref: string;
  onNavClick: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
  isSelf: boolean;
  postCount: number;
  followingCount: number;
  followerCount: number;
  createdAt: string;
  websiteUrl: string | null;
}) => {
  const visible = TABS.filter((t) => !t.selfOnly || isSelf);
  const base = `/u/${username}`;

  // Tong luot thich CHUA co field rieng o API that (chi co postCount) - tam
  // tinh tu feed-store (cong don stats.likes cua tung bai cua chinh chu) cho
  // toi khi backend co san field tong hop nay.
  const allPosts = useAllPosts();
  const totalLikes = useMemo(
    () =>
      allPosts
        .filter((p) => p.author.username === username)
        .reduce((sum, p) => sum + p.stats.likes, 0),
    [allPosts, username],
  );

  return (
    <div className="border-y border-border bg-surface">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1 overflow-x-auto overflow-y-hidden">
          {visible.map((tab) => {
            const href = tab.path ? `${base}/${tab.path}` : base;
            // Tab "Tài liệu" con co sub-route (/docs/[slug], /docs/new,
            // /docs/[slug]/edit) - phai sang ca khi dang o trang con, khong
            // chi khi dung /docs. Cac tab khac la route la nen so sanh dung.
            const isActive =
              tab.path === "docs"
                ? activeHref === href || activeHref.startsWith(`${href}/`)
                : activeHref === href;
            return (
              <Link
                key={tab.key}
                href={href}
                onClick={(e) => onNavClick(e, href)}
                className={`-mb-px flex shrink-0 cursor-pointer items-center gap-1.5 border-b-3 px-3 py-4 text-sm font-medium transition-colors duration-150 ease-out ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-ink-muted hover:text-ink"
                }`}
              >
                <tab.icon
                  size={17}
                  strokeWidth={2.25}
                  style={{ color: tab.iconColor }}
                />
                {tab.label}
              </Link>
            );
          })}
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <div className="flex items-center gap-4">
            <CountItem value={postCount} label="Bài đăng" />
            <CountItem value={totalLikes} label="Lượt thích" />
            <CountLink
              href={`${base}/following`}
              value={followingCount}
              label="Đang theo dõi"
              isActive={activeHref === `${base}/following`}
              onNavClick={onNavClick}
            />
            <CountLink
              href={`${base}/followers`}
              value={followerCount}
              label="Người theo dõi"
              onNavClick={onNavClick}
              isActive={activeHref === `${base}/followers`}
            />
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            {websiteUrl && (
              <MetaItem icon={Link2}>
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {websiteUrl.replace(/^https?:\/\//, "")}
                </a>
              </MetaItem>
            )}
            <MetaItem icon={CalendarDays}>
              Tham gia từ {formatJoinDate(createdAt)}
            </MetaItem>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileNav;
