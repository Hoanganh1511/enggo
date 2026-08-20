"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  MessageSquare,
  Moon,
  Plus,
  Rocket,
  Settings,
  Sparkles,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { signOutAction } from "@/actions/auth/sign-out-action";
import { createConversationAction } from "@/actions/chat/create-conversation";
import { formatCompact } from "@/lib/format-number";
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
  following,
  pending,
  onToggleFollow,
  activeHref,
  onNavClick,
}: {
  profile: UserProfileApiShape;
  following: boolean;
  pending: boolean;
  onToggleFollow: () => void;
  activeHref: string;
  onNavClick: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
}) {
  const realItems = buildRealNavItems(profile.username ?? "").filter(
    (item) => !item.selfOnly || profile.isSelf,
  );
  const router = useRouter();
  const [messaging, setMessaging] = useState(false);

  async function handleMessage() {
    if (!profile.username || messaging) return;
    setMessaging(true);
    try {
      const conversation = await createConversationAction(profile.username);
      router.push(`/messages?c=${conversation.id}`);
    } finally {
      setMessaging(false);
    }
  }

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

        {profile.isSelf ? (
          <Link
            href="/settings"
            className="mt-5 flex h-9 w-full items-center justify-center gap-1.5 rounded-full bg-[#5a4ccf] text-[12px] font-semibold text-white transition-opacity duration-150 ease-out hover:opacity-90"
          >
            <Settings size={13} strokeWidth={2} />
            Chỉnh sửa hồ sơ
          </Link>
        ) : (
          <div className="mt-5 flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleFollow}
              disabled={pending}
              className={`flex h-9 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full text-[12px] font-semibold transition-colors duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-60 ${
                following
                  ? "border border-white/20 bg-white/5 text-white hover:bg-white/10"
                  : "bg-[#5a4ccf] text-white hover:opacity-90"
              }`}
            >
              {!following && <Plus size={13} strokeWidth={2.5} />}
              {following ? "Đang theo dõi" : "Theo dõi"}
            </button>
            <button
              type="button"
              onClick={handleMessage}
              disabled={messaging}
              title="Nhắn tin"
              className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full border border-white/20 bg-white/5 text-white transition-colors duration-150 ease-out hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <MessageSquare size={14} strokeWidth={1.9} />
            </button>
          </div>
        )}
      </div>

      <div className="mx-5 grid grid-cols-3 border-y border-white/10 py-4 text-center">
        <Stat value={profile.postCount} label="Bài viết" />
        <StatLink
          href={`/u/${profile.username}/following`}
          value={profile.followingCount}
          label="Đang theo dõi"
          active={activeHref === `/u/${profile.username}/following`}
          onNavClick={onNavClick}
        />
        <StatLink
          href={`/u/${profile.username}/followers`}
          value={profile.followerCount}
          label="Người theo dõi"
          active={activeHref === `/u/${profile.username}/followers`}
          onNavClick={onNavClick}
        />
      </div>

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

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div className="text-[15px] font-bold">{formatCompact(value)}</div>
      <div className="mt-1 text-[9px] text-slate-400">{label}</div>
    </div>
  );
}

function StatLink({
  href,
  value,
  label,
  active,
  onNavClick,
}: {
  href: string;
  value: number;
  label: string;
  active: boolean;
  onNavClick: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
}) {
  return (
    <Link
      href={href}
      onClick={(e) => onNavClick(e, href)}
      className="block hover:opacity-80"
    >
      <div
        className={`text-[15px] font-bold ${active ? "text-[#aaa1ff]" : ""}`}
      >
        {formatCompact(value)}
      </div>
      <div className="mt-1 text-[9px] text-slate-400">{label}</div>
    </Link>
  );
}
