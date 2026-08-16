"use client";

import { useCallback, useEffect, useState, useTransition, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Bookmark,
  BookText,
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
import { HeaderSearch } from "./HeaderSearch";
import { SavedPanel, MessagesPanel, HelpPanel } from "./header-command-panels/Panels";
import { NotificationsPanel } from "./header-command-panels/NotificationsPanel";
import { getUnreadNotificationCountAction } from "@/actions/notifications/get-unread-count";

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

type NavItem = {
  title: string;
  icon: typeof Home;
  href?: string;
  matchPrefixes?: string[];
  children?: NavChild[];
};

// Nhan `username` cua NGUOI DANG DANG NHAP (tu useSession(), xem component
// ben duoi) thay vi hardcode 1 user demo tinh (`@/content/user-profile`) nhu
// truoc - loi cu: MOI nguoi dung, bat ke dang dang nhap la ai, deu bi dieu
// huong "Bài đăng"/"Workspace" sang dung 1 tai khoan demo co dinh
// ("tuananh.fe"). Tra ve href=undefined khi chua co username (session dang
// loading/chua dang nhap) - nut van hien nhung khong lam gi (xem
// `onClick={() => href && handleNavigate(href)}` ben duoi), tranh dieu huong
// sang URL sai truoc khi biet dung user.
function buildNavItems(username: string | undefined): NavItem[] {
  return [
    { title: "Trang chủ", icon: Home, href: "/home", matchPrefixes: ["/home"] },
    {
      title: "Bài đăng",
      icon: FileText,
      href: username ? `/u/${username}/posts` : undefined,
      matchPrefixes: username ? [`/u/${username}/posts`] : undefined,
    },
    {
      title: "Workspace",
      icon: BookText,
      href: username ? `/workspace/${username}` : undefined,
      // /workspace/[username]/[workspaceId] cua nguoi KHAC cung tinh la active
      // (dang o "khu vuc" workspace) - khac "Bai dang" chi khop dung 1 nhanh.
      matchPrefixes: ["/workspace"],
    },
    {
      title: "Khám phá",
      icon: LayoutDashboard,
      children: MY_TOWN_CHILDREN,
    },
  ];
}

type HeaderCommandId = "saved" | "messages" | "notifications" | "help";

// Nhan unreadCount + onUnreadCountChange (thay vi badge tinh "3" hardcode
// truoc day) - NotificationsPanel goi lai onUnreadCountChange sau moi hanh
// dong doc/duyet/tu choi de badge tren nut chuong dong bo NGAY, khong doi
// den lan mo dropdown tiep theo.
function buildHeaderCommands(
  unreadCount: number,
  onUnreadCountChange: (count: number) => void,
): {
  id: HeaderCommandId;
  label: string;
  icon: LucideIcon;
  badge?: string;
  panel: ReactNode;
}[] {
  return [
    { id: "saved", label: "Đã lưu", icon: Bookmark, panel: <SavedPanel /> },
    {
      id: "messages",
      label: "Tin nhắn",
      icon: MessageCircle,
      panel: <MessagesPanel />,
    },
    {
      id: "notifications",
      label: "Thông báo",
      icon: Bell,
      badge: unreadCount > 0 ? (unreadCount > 9 ? "9+" : String(unreadCount)) : undefined,
      panel: <NotificationsPanel onUnreadCountChange={onUnreadCountChange} />,
    },
    { id: "help", label: "Trợ giúp", icon: CircleHelp, panel: <HelpPanel /> },
  ];
}

type TopHeaderBarProps = {
  accountSlot: ReactNode;
};

const TopHeaderBar = ({ accountSlot }: TopHeaderBarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const navItems = buildNavItems(session?.username);
  const [isPending, startTransition] = useTransition();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [townOpen, setTownOpen] = useState(false);
  const [commandPanel, setCommandPanel] = useState<HeaderCommandId | null>(
    null,
  );
  const toggleCommandPanel = (id: HeaderCommandId) =>
    setCommandPanel((p) => (p === id ? null : id));

  // Fetch 1 lan luc mount (chi khi da dang nhap) - CHUA co polling/real-time,
  // badge dong bo lai khi NotificationsPanel bao qua onUnreadCountChange sau
  // hanh dong, hoac khi tab/trang duoc mo lai tu dau.
  const [unreadCount, setUnreadCount] = useState(0);
  useEffect(() => {
    if (!session?.username) return;
    getUnreadNotificationCountAction()
      .then((r) => setUnreadCount(r.count))
      .catch(() => {});
  }, [session?.username]);
  const handleUnreadCountChange = useCallback((count: number) => {
    setUnreadCount(count);
  }, []);
  const headerCommands = buildHeaderCommands(unreadCount, handleUnreadCountChange);

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
          background:
            "linear-gradient(145deg, var(--surface-raised), var(--surface))",
          boxShadow:
            "0 0 30px color-mix(in srgb, var(--primary) 15%, transparent)",
        }}
      >
        <Logo orientation="icon-only" className="size-5 shrink-0" />
      </div>

      {/* Nhom dieu huong chinh */}
      <nav className="flex h-full shrink-0 items-center gap-0.5">
        {navItems.map(
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

            const label = (
              <span className="hidden truncate lg:inline">{title}</span>
            );

            // Gradient CO DINH "concept" cua khu vuc Workspace (xem
            // docs/workspace-style-guide.md muc 8) - ap cho thanh active nav
            // thay vi mau dac var(--primary) truoc day, dong bo voi scrollbar
            // toan site + cac trang thai khac tren header.
            const underline = isActive && (
              <span
                className="absolute right-3.5 bottom-0 left-3.5 h-[2px]"
                style={{
                  background:
                    "linear-gradient(90deg, #20c5d8, #269ce9, #326eea)",
                  boxShadow: "0 0 14px color-mix(in srgb, #269ce9 70%, transparent)",
                }}
              />
            );

            if (children) {
              return (
                <PopoverRoot
                  key={title}
                  open={townOpen}
                  onOpenChange={setTownOpen}
                >
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      title={title}
                      className={itemClass}
                      style={itemStyle}
                    >
                      <Icon
                        strokeWidth={isActive ? 2.25 : 1.75}
                        className="size-4.5 shrink-0"
                      />
                      {label}
                      <ChevronDown
                        size={13}
                        strokeWidth={1.75}
                        className="shrink-0"
                      />
                      {underline}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    open={townOpen}
                    align="start"
                    className="z-50 w-56 rounded-lg p-1.5"
                    style={{
                      background:
                        "linear-gradient(145deg, var(--surface-raised), var(--surface))",
                      border: "1px solid var(--border-strong)",
                      boxShadow: "var(--shadow-dropdown)",
                    }}
                  >
                    {children.map((child) => {
                      const childActive = child.matchPrefixes
                        ? child.matchPrefixes.some((p) =>
                            pathname.startsWith(p),
                          )
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
                            background: childActive
                              ? "var(--active-bg)"
                              : "transparent",
                          }}
                        >
                          <child.icon
                            size={15}
                            strokeWidth={1.75}
                            className="shrink-0"
                          />
                          <span className="flex-1 truncate">{child.title}</span>
                          {!child.available && (
                            <span
                              className="text-[10px]"
                              style={{ color: "var(--ink-faint)" }}
                            >
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
                  <Icon
                    strokeWidth={isActive ? 2.25 : 1.75}
                    className="size-4 shrink-0"
                  />
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
        <HeaderSearch />
      </div>

      {/* Cum ben phai */}
      <div
        className="ml-auto flex shrink-0 items-center gap-4"
        style={{ color: "var(--ink-muted)" }}
      >
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

        {headerCommands.map(({ id, label, icon: Icon, badge, panel }) => {
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
                        color: "#269ce9",
                        background:
                          "linear-gradient(135deg, color-mix(in srgb, #20c5d8 14%, transparent), color-mix(in srgb, #326eea 14%, transparent))",
                        border:
                          "1px solid color-mix(in srgb, #269ce9 25%, transparent)",
                      }
                    : undefined
                }
              >
                <Icon size={20} strokeWidth={1.75} />
                {badge && (
                  <span
                    className="absolute -top-0.5 -right-0.5 grid h-4 min-w-4 place-items-center rounded-full  text-[10px] font-semibold text-white"
                    style={{
                      background:
                        "linear-gradient(135deg, #20c5d8, #326eea)",
                    }}
                  >
                    {badge}
                  </span>
                )}
              </motion.button>

              <div
                className="absolute right-0 z-[95] pt-2.5"
                style={{ top: "100%" }}
              >
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
        {/* <button
          type="button"
          onClick={handleCompose}
          className="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-3.5 text-sm font-semibold transition-opacity duration-150 ease-out hover:opacity-90"
          style={{
            background:
              "linear-gradient(135deg, var(--primary), var(--secondary))",
            boxShadow:
              "0 10px 30px color-mix(in srgb, var(--secondary) 25%, transparent)",
            color: "var(--on-primary)",
          }}
        >
          <Plus size={16} strokeWidth={2.5} />
          <span className="hidden sm:inline">Đăng bài</span>
        </button> */}
      </div>
    </header>
  );
};

export default TopHeaderBar;
