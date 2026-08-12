"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Bookmark,
  ChevronDown,
  CircleHelp,
  Compass,
  FileText,
  History,
  Hexagon,
  Home,
  LayoutDashboard,
  MessageCircle,
  Mountain,
  Orbit,
  Plus,
  Search,
  StickyNote,
  Target,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import Spinner from "@/components/ui/spinner";
import Logo from "../ui/logo";
import { profile } from "@/content/user-profile";
import {
  SavedPanel,
  MessagesPanel,
  NotificationsPanel,
  HelpPanel,
} from "./header-command-panels/Panels";

// Header bê nguyên UI/UX tu source "knowledge-workspace-react" (Topbar
// trong main.jsx), nhung dung TOKEN CSS (var(--...) tu globals.css) thay vi
// hardcode hex - tu dong doi theo theme he thong (light "Cloud" / dark
// "Nebula"), khong bi khoa cung 1 kieu nhu ban dau. Giu nguyen toan bo chuc
// nang that cua header cu (nav + dropdown Khám phá, search, nut Đăng bài,
// accountSlot that) - chi doi vo ngoai (mau/chrome). Rieng 4 nut
// Bookmark/Tin nhan/Thong bao/Tro giup TRUOC DAY la nut chet ("sắp ra mắt") -
// gio bê nguyên UI/UX/animation dropdown cua source rieng
// "treecareer-topbar-command-center" (MechanicalPanel + Panels.tsx, xem
// header-command-panels/) de lam chung hien 1 panel demo cho toi khi co
// API/du lieu that (bookmark/inbox/notification) thay the.
type NavChild = {
  key: string;
  title: string;
  icon: typeof Home;
  href?: string;
  matchPrefixes?: string[];
  available: boolean;
};

const MY_TOWN_CHILDREN: NavChild[] = [
  { key: "overview", title: "Overview", icon: Compass, available: false },
  { key: "skill", title: "Skill", icon: Hexagon, available: false },
  { key: "galaxy-view", title: "Galaxy View", icon: Orbit, available: false },
  { key: "skyline", title: "Skyline", icon: Mountain, available: false },
  { key: "timeline", title: "Timeline", icon: History, available: false },
  {
    key: "achievements",
    title: "Achievements",
    icon: Trophy,
    available: false,
  },
  { key: "goals", title: "Goals", icon: Target, available: false },
  { key: "notes", title: "Notes", icon: StickyNote, available: false },
];

const NAV_ITEMS: {
  title: string;
  icon: typeof Home;
  href?: string;
  matchPrefixes?: string[];
  children?: NavChild[];
}[] = [
  { title: "Trang chủ", icon: Home, href: "/home", matchPrefixes: ["/home"] },
  {
    title: "Bài đăng",
    icon: FileText,
    href: `/u/${profile.username}/posts`,
    matchPrefixes: [`/u/${profile.username}/posts`],
  },
  {
    title: "Khám phá",
    icon: LayoutDashboard,
    children: MY_TOWN_CHILDREN,
  },
];

type HeaderCommandId = "saved" | "messages" | "notifications" | "help";

const HEADER_COMMANDS: {
  id: HeaderCommandId;
  label: string;
  icon: LucideIcon;
  badge?: string;
  panel: ReactNode;
}[] = [
  { id: "saved", label: "Đã lưu", icon: Bookmark, panel: <SavedPanel /> },
  { id: "messages", label: "Tin nhắn", icon: MessageCircle, panel: <MessagesPanel /> },
  {
    id: "notifications",
    label: "Thông báo",
    icon: Bell,
    badge: "3",
    panel: <NotificationsPanel />,
  },
  { id: "help", label: "Trợ giúp", icon: CircleHelp, panel: <HelpPanel /> },
];

type TopHeaderBarProps = {
  accountSlot: ReactNode;
};

const TopHeaderBar = ({ accountSlot }: TopHeaderBarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [townOpen, setTownOpen] = useState(false);
  const [commandPanel, setCommandPanel] = useState<HeaderCommandId | null>(null);
  const toggleCommandPanel = (id: HeaderCommandId) =>
    setCommandPanel((p) => (p === id ? null : id));

  const handleNavigate = (href: string) => {
    if (pathname === href) return;
    setPendingHref(href);
    startTransition(() => router.push(href));
  };

  const handleCompose = () => {
    if (pathname.startsWith("/home")) {
      document.getElementById("post-composer-input")?.focus();
      return;
    }
    router.push("/home?compose=1");
  };

  return (
    <header
      className="relative z-20 flex h-[var(--header-height)] shrink-0 items-center gap-5 px-[22px] backdrop-blur-[18px]"
      style={{
        background: "var(--surface-header)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div
        className="flex size-[42px] shrink-0 items-center justify-center rounded-[13px]"
        style={{
          color: "var(--primary)",
          background: "linear-gradient(145deg, var(--surface-raised), var(--surface))",
          boxShadow: "0 0 30px color-mix(in srgb, var(--primary) 15%, transparent)",
        }}
      >
        <Logo orientation="icon-only" className="size-5 shrink-0" />
      </div>

      {/* Nhom dieu huong chinh */}
      <nav className="flex h-full shrink-0 items-center gap-0.5">
        {NAV_ITEMS.map(
          ({ title, icon: Icon, href, matchPrefixes, children }) => {
            const isActive = matchPrefixes
              ? matchPrefixes.some((prefix) => pathname.startsWith(prefix))
              : !!href && pathname === href;
            const isItemPending = isPending && pendingHref === href;

            const itemStyle = {
              color: isActive ? "var(--primary)" : "var(--ink-muted)",
            };
            const itemClass =
              "relative flex h-full shrink-0 cursor-pointer items-center gap-2 px-3.5 text-[13px] transition-colors duration-150 ease-out hover:text-ink!";

            const label = <span className="hidden truncate lg:inline">{title}</span>;

            const underline = isActive && (
              <span
                className="absolute right-3.5 bottom-0 left-3.5 h-[2px]"
                style={{ background: "var(--primary)", boxShadow: "0 0 14px var(--primary)" }}
              />
            );

            if (children) {
              return (
                <PopoverRoot key={title} open={townOpen} onOpenChange={setTownOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      title={title}
                      className={itemClass}
                      style={itemStyle}
                    >
                      <Icon strokeWidth={isActive ? 2.25 : 1.75} className="size-4.5 shrink-0" />
                      {label}
                      <ChevronDown size={13} strokeWidth={1.75} className="shrink-0" />
                      {underline}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    open={townOpen}
                    align="start"
                    className="z-50 w-56 rounded-lg p-1.5"
                    style={{
                      background: "linear-gradient(145deg, var(--surface-raised), var(--surface))",
                      border: "1px solid var(--border-strong)",
                      boxShadow: "var(--shadow-dropdown)",
                    }}
                  >
                    {children.map((child) => {
                      const childActive = child.matchPrefixes
                        ? child.matchPrefixes.some((p) => pathname.startsWith(p))
                        : !!child.href && pathname === child.href;
                      return (
                        <button
                          key={child.key}
                          type="button"
                          disabled={!child.href}
                          onClick={() => {
                            if (!child.href) return;
                            setTownOpen(false);
                            handleNavigate(child.href);
                          }}
                          className={cn(
                            "flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors duration-150 ease-out",
                            !child.href && "cursor-not-allowed",
                          )}
                          style={{
                            color: childActive
                              ? "var(--primary)"
                              : child.href
                                ? "var(--ink)"
                                : "var(--ink-faint)",
                            background: childActive ? "var(--active-bg)" : "transparent",
                          }}
                        >
                          <child.icon size={15} strokeWidth={1.75} className="shrink-0" />
                          <span className="flex-1 truncate">{child.title}</span>
                          {!child.available && (
                            <span className="text-[10px]" style={{ color: "var(--ink-faint)" }}>
                              Sắp có
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </PopoverContent>
                </PopoverRoot>
              );
            }

            return (
              <button
                key={title}
                type="button"
                title={title}
                onClick={() => href && handleNavigate(href)}
                className={itemClass}
                style={itemStyle}
              >
                {isItemPending ? (
                  <Spinner size={18} className="shrink-0" />
                ) : (
                  <Icon strokeWidth={isActive ? 2.25 : 1.75} className="size-4 shrink-0" />
                )}
                {label}
                {underline}
              </button>
            );
          },
        )}
      </nav>

      {/* O tim kiem */}
      <div className="ml-2 hidden min-w-0 flex-1 justify-center md:flex">
        <div
          className="flex h-[38px] w-full max-w-[210px] items-center gap-2 rounded-[20px] px-3.5"
          style={{ border: "1px solid var(--search-border)", background: "var(--surface)" }}
        >
          <Search size={15} strokeWidth={1.75} style={{ color: "var(--icon)" }} className="shrink-0" />
          <input
            placeholder="Tìm kiếm..."
            className="min-w-0 flex-1 bg-transparent text-xs outline-none"
            style={{ color: "var(--ink)" }}
          />
        </div>
      </div>

      {/* Cum ben phai */}
      <div className="ml-auto flex shrink-0 items-center gap-4" style={{ color: "var(--ink-muted)" }}>
        {/* Backdrop click-ra-ngoai de dong command panel dang mo - nam DUOI
            panel (z-90 < z-95) nhung TREN noi dung trang, giong choreography
            cua source "treecareer-topbar-command-center". */}
        <AnimatePresence>
          {commandPanel && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[90]"
              onClick={() => setCommandPanel(null)}
            />
          )}
        </AnimatePresence>

        {HEADER_COMMANDS.map(({ id, label, icon: Icon, badge, panel }) => {
          const active = commandPanel === id;
          return (
            <div key={id} className="relative">
              <motion.button
                type="button"
                title={label}
                onClick={() => toggleCommandPanel(id)}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.92 }}
                className="relative flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors duration-150 ease-out hover:text-primary-hover!"
                style={
                  active
                    ? {
                        color: "var(--primary)",
                        background: "color-mix(in srgb, var(--primary) 8%, transparent)",
                      }
                    : undefined
                }
              >
                <Icon size={17} strokeWidth={1.75} />
                {badge && (
                  <span
                    className="absolute -top-0.5 -right-0.5 grid h-3.5 min-w-3.5 place-items-center rounded-full px-1 text-[7px] font-semibold text-white"
                    style={{ background: "var(--secondary)" }}
                  >
                    {badge}
                  </span>
                )}
              </motion.button>

              <div className="absolute right-0 z-[95] pt-2.5" style={{ top: "100%" }}>
                <AnimatePresence>
                  {active && (
                    <div onClick={(e) => e.stopPropagation()}>{panel}</div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
        {accountSlot}
        <button
          type="button"
          onClick={handleCompose}
          className="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-3.5 text-sm font-semibold transition-opacity duration-150 ease-out hover:opacity-90"
          style={{
            background: "linear-gradient(135deg, var(--primary), var(--secondary))",
            boxShadow: "0 10px 30px color-mix(in srgb, var(--secondary) 25%, transparent)",
            color: "var(--on-primary)",
          }}
        >
          <Plus size={16} strokeWidth={2.5} />
          <span className="hidden sm:inline">Đăng bài</span>
        </button>
      </div>
    </header>
  );
};

export default TopHeaderBar;
