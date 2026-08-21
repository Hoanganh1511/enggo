"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  Bookmark,
  BriefcaseBusiness,
  CircleHelp,
  Compass,
  FileText,
  Heart,
  History,
  Home,
  ListVideo,
  LogOut,
  Moon,
  Rocket,
  Settings,
  Sparkles,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { signOutAction } from "@/actions/auth/sign-out-action";
import type { UserProfileApiShape } from "@/lib/api/users";

type NavItem = {
  key: string;
  label: string;
  icon: LucideIcon;
  href: string;
  selfOnly?: boolean;
};

// Cac tab THAT (co route/du lieu that) - giu dung tap hop tab cu cua
// ProfileNav.tsx, chi doi cach hien thi tu hang ngang sang danh sach doc
// trong sidebar navy (xem source treecareer-profile-universe-v2).
function buildRealNavItems(username: string): NavItem[] {
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

// Cac muc CHUA co du lieu that (Universe/Journey/Skills/Projects/Milestones/
// Activity - dung khai niem/icon dung nhu source) - nut disabled thay vi
// link that, theo dung nguyen tac "không tạo fake functionality giả vờ hoạt
// động" da ap dung o GroupSectionPlaceholder.tsx.
const COMING_SOON_ITEMS: { label: string; icon: LucideIcon }[] = [
  { label: "Universe", icon: Sparkles },
  { label: "Journey", icon: Compass },
  { label: "Skills", icon: Zap },
  { label: "Projects", icon: Rocket },
  { label: "Milestones", icon: Trophy },
  { label: "Activity", icon: Activity },
];

export function ProfileSidebar({
  profile,
  activeHref,
  onNavClick,
}: {
  profile: UserProfileApiShape;
  activeHref: string;
  onNavClick: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
}) {
  const realItems = buildRealNavItems(profile.username ?? "").filter(
    (item) => !item.selfOnly || profile.isSelf,
  );

  return (
    <aside className="hidden min-h-[calc(100vh-68px)] w-[240px] shrink-0 flex-col bg-[#111b2d] text-white lg:flex">
      <div className="p-5">
        <div className="relative mx-auto mb-4 size-[132px] overflow-hidden rounded-full border-[5px] border-[#ebe7d8] shadow-[0_0_0_8px_rgba(255,255,255,.05)]">
          <Image
            src={profile.avatarUrl}
            alt={profile.displayName}
            fill
            sizes="132px"
            className="object-cover"
          />
        </div>
        <h1 className="font-hand text-center text-[25px] font-semibold">
          {profile.displayName}
        </h1>
        <p className="mt-1 text-center text-[12px] text-slate-400">
          @{profile.username}
        </p>
        {profile.bio && (
          <p className="font-hand mx-auto mt-5 max-w-[195px] text-center text-[15px] leading-6 text-slate-300">
            “{profile.bio}”
          </p>
        )}
      </div>

      {/* Nut Theo doi/Nhan tin/Chinh sua ho so + 3 stat (Bai viet/Dang theo
          doi/Nguoi theo doi) da CHUYEN sang page.tsx (tab "Trang chu") -
          doc profile/following/pending qua useProfileContext() thay vi nhan
          props o day, xem profile-context.tsx. */}

      <nav className="mt-4 space-y-1 px-3">
        {realItems.map((item) => {
          const isActive = activeHref === item.href;
          return (
            <Link
              key={item.key}
              href={item.href}
              onClick={(e) => onNavClick(e, item.href)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[13px] transition ${
                isActive
                  ? "bg-[#37355f] text-white shadow-sm"
                  : "text-slate-300 hover:bg-white/5"
              }`}
            >
              <item.icon size={18} strokeWidth={1.9} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Cac khoi concept cua source (Universe/Journey/Skills/Projects/
          Milestones/Activity) - chua co du lieu that, disabled thay vi
          link, tach rieng khoi nav THAT o tren bang 1 duong ke + nhan. */}
      <div className="mt-4 px-3">
        <p className="px-4 pb-1.5 text-[10px] font-semibold tracking-wide text-slate-500">
          SẮP RA MẮT
        </p>
        <div className="space-y-1">
          {COMING_SOON_ITEMS.map((item) => (
            <button
              key={item.label}
              type="button"
              disabled
              className="flex w-full cursor-not-allowed items-center gap-3 rounded-xl px-4 py-2.5 text-left text-[12.5px] text-slate-500"
            >
              <item.icon size={16} strokeWidth={1.9} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {profile.isSelf && (
        <div className="mt-auto flex items-center gap-2 border-t border-white/10 p-4">
          <Link
            href="/settings"
            className="grid size-9 place-items-center rounded-full text-slate-400 transition-colors duration-150 ease-out hover:bg-white/10 hover:text-white"
          >
            <Settings size={17} strokeWidth={1.9} />
          </Link>
          <button
            type="button"
            disabled
            title="Sắp ra mắt"
            className="grid size-9 cursor-not-allowed place-items-center rounded-full text-slate-600"
          >
            <Moon size={17} strokeWidth={1.9} />
          </button>
          <button
            type="button"
            disabled
            title="Sắp ra mắt"
            className="grid size-9 cursor-not-allowed place-items-center rounded-full text-slate-600"
          >
            <CircleHelp size={17} strokeWidth={1.9} />
          </button>
          <form action={signOutAction} className="ml-auto">
            <button
              type="submit"
              title="Đăng xuất"
              className="grid size-9 cursor-pointer place-items-center rounded-full text-slate-400 transition-colors duration-150 ease-out hover:bg-white/10 hover:text-white"
            >
              <LogOut size={17} strokeWidth={1.9} />
            </button>
          </form>
        </div>
      )}
    </aside>
  );
}
