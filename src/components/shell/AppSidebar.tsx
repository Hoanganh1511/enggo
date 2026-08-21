"use client";

import {
  useCallback,
  useEffect,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Bell,
  Bookmark,
  BookText,
  CircleHelp,
  Compass,
  FileText,
  History,
  Hexagon,
  Home,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Moon,
  Mountain,
  Orbit,
  Settings,
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
import { Avatar } from "./account-menu";
import { SavedPanel, HelpPanel } from "./header-command-panels/Panels";
import { NotificationsPanel } from "./header-command-panels/NotificationsPanel";
import { getUnreadNotificationCountAction } from "@/actions/notifications/get-unread-count";
import { getUnreadChatCountAction } from "@/actions/chat/get-unread-count";
import { useNotificationSocket } from "@/lib/use-notification-socket";
import { useChatSocket } from "@/lib/use-chat-socket";
import {
  notifyNewChatMessage,
  requestNotificationPermission,
} from "@/lib/browser-notifications";
import { signOutAction } from "@/actions/auth/sign-out-action";
import type { ApiChatMessage, ApiNotification } from "@/lib/api/types";

// Sidebar trai CO DINH toan man hinh (cao het viewport, nam TRUOC ca
// TopHeaderBar - xem (main)/layout.tsx), theo yeu cau nguoi dung ("cái bên
// trái cao full màn hình, header top bar vẫn ở trên nhưng sẽ nối tiếp diện
// tích còn lại thôi"). GOM TOAN BO dieu huong that truoc day nam trong
// TopHeaderBar.tsx (nav Trang chủ/Bài đăng/Workspace/Khám phá + 4 nut lenh
// Đã lưu/Tin nhắn/Thông báo/Trợ giúp) ve day duoi dang 1 danh sach doc, dung
// LAI 100% cung state/panel/socket (khong viet lai logic) - TopHeaderBar chi
// con giu search + accountSlot. Nen navy CO DINH (khong doi theo token sang/
// toi) la lua chon CO CHU DICH cua nguoi dung, KHAC voi nguyen tac "luon dung
// token" o docs/workspace-style-guide.md - ngoai le duy nhat cho rieng
// sidebar nay, cac panel/dropdown mo RA TU no (Khám phá/Đã lưu/Thông báo/
// Trợ giúp) van dung token binh thuong nhu truoc.
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

type SidebarRow =
  | {
      kind: "link";
      id: string;
      title: string;
      icon: LucideIcon;
      href: string;
      matchPrefixes?: string[];
      badge?: string;
    }
  | {
      kind: "flyout-list";
      id: string;
      title: string;
      icon: LucideIcon;
      children: NavChild[];
    }
  | {
      kind: "flyout-panel";
      id: string;
      title: string;
      icon: LucideIcon;
      panel: ReactNode;
      badge?: string;
    };

// Gop buildNavItems + buildHeaderCommands cu (TopHeaderBar.tsx ban truoc) -
// username KHONG co (chua dang nhap/dang tai session) thi bo qua cac muc can
// no (Bai dang/Workspace), giu dung hanh vi cu (nut van hien nhung khong lam
// gi thay vi dieu huong sai URL). Tin nhan/Thong bao KHONG con trong danh
// sach nav nay nua - da chuyen len cum info user o dau sidebar (xem JSX
// trong AppSidebar), theo yeu cau nguoi dung.
function buildRows(username: string | undefined): SidebarRow[] {
  const rows: SidebarRow[] = [
    {
      kind: "link",
      id: "home",
      title: "Trang chủ",
      icon: Home,
      href: "/home",
      matchPrefixes: ["/home"],
    },
  ];
  if (username) {
    // rows.push({
    //   kind: "link",
    //   id: "posts",
    //   title: "Bài đăng",
    //   icon: FileText,
    //   href: `/u/${username}/posts`,
    //   matchPrefixes: [`/u/${username}/posts`],
    // });
    rows.push({
      kind: "link",
      id: "workspace",
      title: "Workspace",
      icon: BookText,
      href: `/workspace/${username}`,
      matchPrefixes: ["/workspace"],
    });
  }
  rows.push({
    kind: "flyout-list",
    id: "explore",
    title: "Khám phá",
    icon: LayoutDashboard,
    children: MY_TOWN_CHILDREN,
  });
  rows.push({
    kind: "flyout-panel",
    id: "saved",
    title: "Đã lưu",
    icon: Bookmark,
    panel: <SavedPanel />,
  });
  rows.push({
    kind: "flyout-panel",
    id: "help",
    title: "Trợ giúp",
    icon: CircleHelp,
    panel: <HelpPanel />,
  });
  rows.push({
    kind: "link",
    id: "settings",
    title: "Cài đặt",
    icon: Settings,
    href: "/settings",
    matchPrefixes: ["/settings"],
  });
  return rows;
}

const AppSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [openPanel, setOpenPanel] = useState<string | null>(null);
  // Popover rieng cho icon Tro giup o hang tien ich duoi cung - doc lap voi
  // "Trợ giúp" trong danh sach nav chinh (cung mo HelpPanel nhung KHONG dung
  // chung 1 state, tranh 2 nut cung sang "active" khi chi 1 cai dang mo).
  const [footerHelpOpen, setFooterHelpOpen] = useState(false);

  // Fetch 1 lan luc mount (chi khi da dang nhap) de co so lieu ban dau, sau
  // do socket (useNotificationSocket ben duoi) tu day cap nhat real-time -
  // badge cung dong bo lai khi NotificationsPanel bao qua onUnreadCountChange
  // sau hanh dong doc/duyet/tu choi.
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

  // Thong bao MOI NHAT nhan qua socket - bump len +1 badge NGAY, va truyen
  // xuong NotificationsPanel de neu dropdown dang mo thi noi len dau danh
  // sach ngay lap tuc. Khong dung mang [] vi moi lan nhan chi can 1 gia tri
  // moi nhat, panel tu khu trung theo id.
  const [liveNotification, setLiveNotification] =
    useState<ApiNotification | null>(null);
  useNotificationSocket(
    Boolean(session?.username),
    useCallback((n: ApiNotification) => {
      setUnreadCount((c) => c + 1);
      setLiveNotification(n);
    }, []),
  );

  // Badge tin nhan chua doc - cung pattern voi thong bao (fetch 1 lan +
  // socket bump real-time). Refetch moi khi doi trang (dac biet luc ROI khoi
  // /messages) de dong bo lai voi cac hoi thoai vua duoc danh dau da doc
  // ngay trong trang do (MessagesShell.tsx), vi state o day khong tu biet
  // duoc dieu do.
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  useEffect(() => {
    if (!session?.username) return;
    getUnreadChatCountAction()
      .then((r) => setUnreadChatCount(r.count))
      .catch(() => {});
  }, [session?.username, pathname]);
  // Xin quyen browser notification 1 lan sau khi dang nhap (chi hoi neu
  // "default" - chua tung hoi/tu choi truoc do, xem requestNotificationPermission).
  useEffect(() => {
    if (session?.username) requestNotificationPermission();
  }, [session?.username]);
  useChatSocket(
    Boolean(session?.username),
    useCallback(
      (m: ApiChatMessage) => {
        if (m.senderId !== session?.userId) {
          setUnreadChatCount((c) => c + 1);
          // Chi bao "tab khong focus" (xem browser-notifications.ts) - neu
          // nguoi dung dang mo dung /messages voi hoi thoai nay va tab dang
          // focus thi khong can noti (da thay tin nhan ngay tren man hinh).
          notifyNewChatMessage({
            senderName: m.senderName ?? "Tin nhắn mới",
            content: m.content,
            avatarUrl: m.senderAvatarUrl,
            conversationId: m.conversationId,
          });
        }
      },
      [session?.userId],
    ),
  );

  const rows = buildRows(session?.username);

  const chatBadge =
    unreadChatCount > 0
      ? unreadChatCount > 9
        ? "9+"
        : String(unreadChatCount)
      : undefined;
  const notifBadge =
    unreadCount > 0
      ? unreadCount > 9
        ? "9+"
        : String(unreadCount)
      : undefined;
  const [notifOpen, setNotifOpen] = useState(false);

  const handleNavigate = (href: string) => {
    if (pathname === href) return;
    setPendingHref(href);
    startTransition(() => router.push(href));
  };

  const rowClass =
    "group relative flex h-10 w-full shrink-0 cursor-pointer items-center gap-3  px-3 text-[13.5px] font-medium transition-colors duration-150 ease-out";

  return (
    <aside
      className="font-hand flex h-full w-54 2xl:w-64 shrink-0 flex-col overflow-hidden rounded-xl"
      style={{
        background: "var(--sidebar)",
        borderRight: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* <div className="flex shrink-0 items-center gap-2.5 px-5 py-5">
        <div
          className="flex size-8 shrink-0 items-center justify-center rounded-[10px]"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          <Logo orientation="icon-only" className="size-4.5 shrink-0" />
        </div>
        <span className="truncate text-[15px] font-bold text-white">Career Tree</span>
      </div> */}

      {/* Cum info user - avatar/ten/username + 2 icon Tin nhan/Thong bao
          CUNG hang (chuyen tu danh sach nav chinh len day theo yeu cau nguoi
          dung). KHONG con la 1 <Link> bao ngoai duy nhat nua (nested
          <button> trong <a> khong hop le HTML) - avatar/ten van la link toi
          trang ca nhan, 2 icon la element rieng ben canh. */}
      {session?.user && (
        <div className="mx-3 my-3 flex shrink-0 flex-col gap-2 rounded-lg p-2.5">
          <div className="flex items-center gap-2.5">
            <Link
              href={session.username ? `/u/${session.username}` : "#"}
              className="-m-1 flex min-w-0 flex-1 items-center gap-2.5 rounded-lg p-1 transition-colors duration-150 ease-out hover:bg-sidebar-hover"
            >
              <Avatar user={session.user} size={38} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-semibold text-white">
                  {session.user.name ?? "Người dùng"}
                </p>
                {session.username && (
                  <p
                    className="truncate text-[11.5px]"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    @{session.username}
                  </p>
                )}
              </div>
            </Link>

            <Link
              href="/messages"
              title="Tin nhắn"
              className="relative flex size-7.5 shrink-0 items-center justify-center rounded-md text-white/60 transition-colors duration-150 ease-out hover:bg-sidebar-hover hover:text-white"
            >
              <MessageCircle size={15} strokeWidth={1.85} />
              {chatBadge && (
                <span
                  className="absolute -top-1 -right-1 grid h-3.5 min-w-3.5 place-items-center rounded-full px-0.5 text-[8px] font-semibold text-white"
                  style={{ background: "var(--notification)" }}
                >
                  {chatBadge}
                </span>
              )}
            </Link>

            <PopoverRoot open={notifOpen} onOpenChange={setNotifOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  title="Thông báo"
                  className="relative flex size-7.5 shrink-0 cursor-pointer items-center justify-center rounded-md text-white/60 transition-colors duration-150 ease-out hover:bg-sidebar-hover hover:text-white"
                >
                  <Bell size={15} strokeWidth={1.85} />
                  {notifBadge && (
                    <span
                      className="absolute -top-1 -right-1 grid h-3.5 min-w-3.5 place-items-center rounded-full px-0.5 text-[8px] font-semibold text-white"
                      style={{ background: "var(--notification)" }}
                    >
                      {notifBadge}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent
                open={notifOpen}
                side="right"
                align="start"
                sideOffset={12}
                className="z-50"
              >
                <NotificationsPanel
                  onUnreadCountChange={handleUnreadCountChange}
                  liveNotification={liveNotification}
                />
              </PopoverContent>
            </PopoverRoot>
          </div>

          {/* "Online" chi mang y nghia "ban dang mo app luc nay" (tu than
              dung, khong phai presence that cua nguoi khac) - khong phai du
              lieu gia, khac han fake status ve NGUOI KHAC. */}
          <span
            className="flex items-center gap-1 pl-1 text-[11px] font-medium"
            style={{ color: "#34d399" }}
          >
            <span
              className="size-1.5 shrink-0 rounded-full"
              style={{ background: "#34d399" }}
            />
            Online
          </span>
        </div>
      )}

      <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3 pb-4">
        {rows.map((row) => {
          const active =
            row.kind === "link"
              ? row.matchPrefixes
                ? row.matchPrefixes.some((p) => pathname.startsWith(p))
                : pathname === row.href
              : row.kind === "flyout-list"
                ? exploreOpen
                : openPanel === row.id;

          const badgeEl = "badge" in row && row.badge && (
            <span
              className="ml-auto grid h-4.5 min-w-4.5 shrink-0 place-items-center rounded-full px-1 text-[10px] font-semibold text-white"
              style={{ background: "var(--notification)" }}
            >
              {row.badge}
            </span>
          );

          const style = active
            ? {
                color: "#ffffff",
                borderRadius: "8px",
                background: "var(--primary) ",
              }
            : { color: "rgba(255,255,255,0.65)" };

          if (row.kind === "link") {
            const isItemPending = isPending && pendingHref === row.href;
            return (
              <button
                key={row.id}
                type="button"
                onClick={() => handleNavigate(row.href)}
                className={cn(rowClass, "hover:underline hover:text-white")}
                style={style}
              >
                {isItemPending ? (
                  <Spinner size={17} className="shrink-0" />
                ) : (
                  <row.icon size={17} strokeWidth={1.85} className="shrink-0" />
                )}
                <span className="min-w-0 flex-1 truncate text-left 2xl:text-lg">
                  {row.title}
                </span>
                {badgeEl}
              </button>
            );
          }

          if (row.kind === "flyout-list") {
            return (
              <PopoverRoot
                key={row.id}
                open={exploreOpen}
                onOpenChange={setExploreOpen}
              >
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      rowClass,
                      "hover:bg-sidebar-hover hover:text-white",
                    )}
                    style={style}
                  >
                    <row.icon
                      size={17}
                      strokeWidth={1.85}
                      className="shrink-0"
                    />
                    <span className="min-w-0 flex-1 truncate text-left 2xl:text-lg">
                      {row.title}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  open={exploreOpen}
                  side="right"
                  align="start"
                  sideOffset={12}
                  className="z-50 w-56 rounded-lg p-1.5"
                  style={{
                    background:
                      "linear-gradient(145deg, var(--surface-raised), var(--surface))",
                    border: "1px solid var(--border-strong)",
                    boxShadow: "var(--shadow-dropdown)",
                  }}
                >
                  {row.children.map((child) => (
                    <button
                      key={child.key}
                      type="button"
                      disabled={!child.href}
                      onClick={() => {
                        if (!child.href) return;
                        setExploreOpen(false);
                        handleNavigate(child.href);
                      }}
                      className={cn(
                        "flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors duration-150 ease-out",
                        !child.href && "cursor-not-allowed",
                      )}
                      style={{
                        color: child.href ? "var(--ink)" : "var(--ink-faint)",
                        background: "transparent",
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
                  ))}
                </PopoverContent>
              </PopoverRoot>
            );
          }

          const open = openPanel === row.id;
          return (
            <PopoverRoot
              key={row.id}
              open={open}
              onOpenChange={(next) => setOpenPanel(next ? row.id : null)}
            >
              <PopoverTrigger asChild>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    rowClass,
                    "hover:bg-sidebar-hover hover:text-white",
                  )}
                  style={style}
                >
                  <row.icon size={17} strokeWidth={1.85} className="shrink-0" />
                  <span className="min-w-0 flex-1 truncate text-left 2xl:text-lg">
                    {row.title}
                  </span>
                  {badgeEl}
                </motion.button>
              </PopoverTrigger>
              <PopoverContent
                open={open}
                side="right"
                align="start"
                sideOffset={12}
                className="z-50"
              >
                {row.panel}
              </PopoverContent>
            </PopoverRoot>
          );
        })}
      </nav>

      {/* Hang tien ich duoi cung - Cai dat/Giao dien/Tro giup/Dang xuat, tach
          rieng khoi danh sach nav chinh phia tren (chi icon, khong nhan) -
          "Đăng xuất" truoc day nam trong AccountMenu (header cu, da xoa) nen
          mat cho goi, chuyen ve day cung luon cho co 1 noi. */}
      <div
        className="flex shrink-0 items-center justify-around px-3 py-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
      >
        <Link
          href="/settings"
          title="Cài đặt"
          className="flex size-8 cursor-pointer items-center justify-center rounded-md text-white/60 transition-colors duration-150 ease-out hover:bg-sidebar-hover hover:text-white"
        >
          <Settings size={16} strokeWidth={1.85} />
        </Link>

        <button
          type="button"
          disabled
          title="Giao diện — sắp có"
          className="flex size-8 cursor-not-allowed items-center justify-center rounded-md text-white/30"
        >
          <Moon size={16} strokeWidth={1.85} />
        </button>

        <PopoverRoot open={footerHelpOpen} onOpenChange={setFooterHelpOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              title="Trợ giúp"
              className="flex size-8 cursor-pointer items-center justify-center rounded-md text-white/60 transition-colors duration-150 ease-out hover:bg-sidebar-hover hover:text-white"
            >
              <CircleHelp size={16} strokeWidth={1.85} />
            </button>
          </PopoverTrigger>
          <PopoverContent
            open={footerHelpOpen}
            side="right"
            align="end"
            sideOffset={12}
            className="z-50"
          >
            <HelpPanel />
          </PopoverContent>
        </PopoverRoot>

        <form action={signOutAction}>
          <button
            type="submit"
            title="Đăng xuất"
            className="flex size-8 cursor-pointer items-center justify-center rounded-md text-white/60 transition-colors duration-150 ease-out hover:bg-danger/20 hover:text-white"
          >
            <LogOut size={16} strokeWidth={1.85} />
          </button>
        </form>
      </div>
    </aside>
  );
};

export default AppSidebar;
