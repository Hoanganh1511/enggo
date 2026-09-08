"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  BookOpen,
  Bookmark,
  Folder,
  GitBranch,
  Hash,
  Home,
  Leaf,
  MessageCircle,
  Settings,
  Target,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Sidebar CHINH THUC cua layout /home (xem (feed)/home/layout.tsx) - port
// nguyen ban tu source knowledge-dashboard-nextjs.zip (bang mau/spacing cua
// chinh source, KHONG doi sang token app - giu dung "toan bo UI/UX" theo yeu
// cau). Rieng cho TRANG NAY (khong dua vao (feed)/layout.tsx dung chung voi
// /communities, /contest) vi phan con lai cua app dung TopHeaderBar ngang
// (da thay AppSidebar doc truoc day) - fixed nhung dinh DUOI TopHeaderBar
// (top-[var(--header-height)]) thay vi inset-y-0 nhu source, tranh de len
// header toan app.
//
// Discriminated union thay vi 1 object voi href?/match? optional - tach ro
// "co trang that" (link) khoi "chua co trang" (coming-soon), thay vi phai
// doc `if (href)` o render moi biet muc nao la muc nao.
type NavEntry =
  | { kind: "link"; icon: LucideIcon; label: string; href: string; match: (pathname: string) => boolean }
  | { kind: "coming-soon"; icon: LucideIcon; label: string };

const PRIMARY_NAV: NavEntry[] = [
  { kind: "link", icon: Home, label: "Home", href: "/home", match: (p) => p === "/home" },
  {
    kind: "link",
    icon: BookOpen,
    label: "Articles",
    href: "/articles",
    match: (p) => p === "/articles" || p.startsWith("/articles/"),
  },
  { kind: "coming-soon", icon: Folder, label: "Collections" },
  { kind: "coming-soon", icon: GitBranch, label: "Roadmap" },
  { kind: "coming-soon", icon: Target, label: "Learning" },
  { kind: "coming-soon", icon: Bookmark, label: "Bookmarks" },
  { kind: "coming-soon", icon: MessageCircle, label: "Comments" },
  { kind: "coming-soon", icon: Hash, label: "Tags" },
];

export function HomeDashboardSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const username = session?.username;
  const displayName = session?.user?.name ?? "Bạn";

  return (
    <aside className="fixed inset-y-0 left-0 top-[var(--header-height)] z-20 hidden w-[244px] border-r border-[#edf0f4] bg-white px-5 py-6 lg:flex lg:flex-col">
      <div className="flex items-center gap-3 px-1">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eef4ff] text-[#3b82f6]">
          <Leaf size={21} aria-hidden="true" />
        </div>
        <div>
          <div className="text-[17px] font-bold tracking-tight">
            {displayName}&rsquo;s Knowledge
          </div>
          <div className="text-[11px] text-slate-500">Write · Learn · Build · Grow</div>
        </div>
      </div>

      <nav className="mt-9 space-y-1" aria-label="Điều hướng chính">
        {PRIMARY_NAV.map((entry) => {
          if (entry.kind === "coming-soon") {
            // Chua co trang that - disabled trung thuc thay vi dan toi 1
            // trang trong/404, dung chung quy uoc "Sắp có" da dung o
            // account-menu.tsx.
            return (
              <button
                key={entry.label}
                type="button"
                disabled
                title={`${entry.label} — sắp có`}
                className="flex w-full cursor-not-allowed items-center gap-3 rounded-lg px-4 py-2.5 text-[14px] text-slate-400"
              >
                <entry.icon size={18} strokeWidth={1.8} aria-hidden="true" />
                <span className="flex-1 text-left">{entry.label}</span>
                <span className="text-[10px] text-slate-300">Sắp có</span>
              </button>
            );
          }

          const active = entry.match(pathname);
          return (
            <Link
              key={entry.label}
              href={entry.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-[14px] transition",
                active
                  ? "bg-[#edf4ff] font-semibold text-[#162033]"
                  : "text-slate-600 hover:bg-slate-50",
              )}
            >
              <entry.icon size={18} strokeWidth={active ? 2.2 : 1.8} aria-hidden="true" />
              {entry.label}
            </Link>
          );
        })}
      </nav>

      <div className="my-5 h-px bg-[#edf0f4]" />
      <nav className="space-y-1" aria-label="Điều hướng phụ">
        <Link
          href="/settings"
          className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-[14px] text-slate-600 hover:bg-slate-50"
        >
          <Settings size={18} aria-hidden="true" />
          Settings
        </Link>
        <Link
          href={username ? `/workspace/${username}` : "/home"}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-[14px] text-slate-600 hover:bg-slate-50"
        >
          <Target size={18} aria-hidden="true" />
          Workspace
        </Link>
      </nav>

      <div className="mt-auto px-1 pb-1 text-[13px] leading-5 text-slate-400">
        <p>&ldquo;A little progress</p>
        <p>every day adds up</p>
        <p>to big results.&rdquo;</p>
        <div aria-hidden="true" className="mt-5 text-[42px] leading-none opacity-20">
          ⌁⌁
        </div>
      </div>
    </aside>
  );
}
