"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Bookmark,
  Compass,
  Folder,
  GitBranch,
  Hash,
  Home,
  Leaf,
  MessageCircle,
  Settings,
  Target,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardSidebarDrawerStore } from "@/stores/dashboard-sidebar-drawer-store";

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
  {
    kind: "link",
    icon: Compass,
    label: "Tracking",
    href: "/tracking",
    match: (p) => p.startsWith("/tracking"),
  },
  { kind: "coming-soon", icon: Folder, label: "Collections" },
  { kind: "coming-soon", icon: GitBranch, label: "Roadmap" },
  { kind: "coming-soon", icon: Target, label: "Learning" },
  { kind: "coming-soon", icon: Bookmark, label: "Bookmarks" },
  { kind: "coming-soon", icon: MessageCircle, label: "Comments" },
  { kind: "coming-soon", icon: Hash, label: "Tags" },
];

// Than noi dung sidebar (logo + 2 nhom nav + quote cuoi) - tach rieng vi
// dung CHUNG giua <aside> desktop va drawer mobile (tranh lap code 2 lan,
// xem HomeDashboardSidebar duoi). `onNavigate` goi khi bam 1 link THAT
// (khong goi khi bam muc "coming-soon") - drawer mobile dung de tu dong
// dong lai sau khi dieu huong, <aside> desktop truyen undefined (khong can
// dong gi ca).
function SidebarBody({
  pathname,
  displayName,
  username,
  onNavigate,
}: {
  pathname: string;
  displayName: string;
  username: string | undefined;
  onNavigate?: () => void;
}) {
  return (
    <>
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
              onClick={onNavigate}
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
          onClick={onNavigate}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-[14px] text-slate-600 hover:bg-slate-50"
        >
          <Settings size={18} aria-hidden="true" />
          Settings
        </Link>
        <Link
          href={username ? `/workspace/${username}` : "/home"}
          onClick={onNavigate}
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
    </>
  );
}

export function HomeDashboardSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const username = session?.username;
  const displayName = session?.user?.name ?? "Bạn";
  // Mobile: nut mo drawer gio nam trong TopHeaderBar.tsx (hop nhat 2 thanh
  // rieng truoc day thanh 1), chi con doc/dong state qua store chung o day -
  // xem dashboard-sidebar-drawer-store.ts.
  const drawerOpen = useDashboardSidebarDrawerStore((s) => s.open);
  const setDrawerOpen = useDashboardSidebarDrawerStore((s) => s.setOpen);

  return (
    <>
      {/* Desktop - khong doi gi so voi ban truoc. */}
      <aside className="fixed inset-y-0 left-0 top-[var(--header-height)] z-20 hidden w-[244px] border-r border-[#edf0f4] bg-white px-5 py-6 lg:flex lg:flex-col">
        <SidebarBody pathname={pathname} displayName={displayName} username={username} />
      </aside>

      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              key="sidebar-drawer-backdrop"
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              key="sidebar-drawer-panel"
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white px-5 py-6 shadow-xl lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Đóng menu"
                className="absolute top-4 right-4 flex size-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              >
                <X size={18} aria-hidden="true" />
              </button>
              <SidebarBody
                pathname={pathname}
                displayName={displayName}
                username={username}
                onNavigate={() => setDrawerOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
