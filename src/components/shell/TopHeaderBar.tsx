"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Bell, Menu, MessageCircle, Search, Sparkles, SquarePen } from "lucide-react";
import { useDashboardSidebarDrawerStore } from "@/stores/dashboard-sidebar-drawer-store";
import { cn } from "@/lib/utils";
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import Logo from "../ui/logo";
import { HeaderNav } from "./HeaderNav";
import { HeaderSearchModal } from "./HeaderSearchModal";
import AccountMenu from "./account-menu";
import { RecentPostsMenu } from "./RecentPostsMenu";
import { NotificationsPanel } from "./header-command-panels/NotificationsPanel";
import { UpdatesPanel } from "./header-command-panels/UpdatesPanel";
import { useChangelogUnseen } from "@/lib/use-changelog-unseen";
import { getUnreadNotificationCountAction } from "@/actions/notifications/get-unread-count";
import { getUnreadChatCountAction } from "@/actions/chat/get-unread-count";
import { useNotificationSocket } from "@/lib/use-notification-socket";
import { useChatSocket } from "@/lib/use-chat-socket";
import {
  notifyNewChatMessage,
  requestNotificationPermission,
} from "@/lib/browser-notifications";
import { formatMessagePreview } from "@/lib/chat-message-preview";
import { pushChatToast } from "@/lib/chat-toast/chat-toast-store";
import {
  subscribeUnreadChatTotal,
  getUnreadChatTotalSnapshot,
  getServerSnapshot as getUnreadChatServerSnapshot,
} from "@/lib/chat-unread-store";
import type { ApiChatMessage, ApiNotification } from "@/lib/api/types";

// Header ngang - thay AppSidebar.tsx (sidebar trai) theo yeu cau nguoi dung,
// port lai layout note.com (anh mau): logo trai, o tim kiem, roi cum icon
// Tin nhan/Thong bao/tai khoan/nut "Viết bài" ben phai. Toan bo logic
// unread-count/socket/panel GIU NGUYEN tu AppSidebar.tsx (chi doi vi tri hien
// thi tu sidebar doc sang header ngang), khong viet lai tu dau.
const TopHeaderBar = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const setDashboardDrawerOpen = useDashboardSidebarDrawerStore((s) => s.setOpen);
  const [notifOpen, setNotifOpen] = useState(false);
  const [updatesOpen, setUpdatesOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { hasUnseen: hasUnseenUpdates, markSeen: markUpdatesSeen } =
    useChangelogUnseen();

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

  const [liveNotification, setLiveNotification] =
    useState<ApiNotification | null>(null);
  useNotificationSocket(
    Boolean(session?.username),
    useCallback((n: ApiNotification) => {
      setUnreadCount((c) => c + 1);
      setLiveNotification(n);
    }, []),
  );

  const [unreadChatCount, setUnreadChatCount] = useState(0);
  useEffect(() => {
    if (!session?.username) return;
    getUnreadChatCountAction()
      .then((r) => setUnreadChatCount(r.count))
      .catch(() => {});
  }, [session?.username, pathname]);
  // Khi MessagesShell.tsx dang mount (dang o /messages) no bao gia tri that
  // real-time vao day - uu tien dung gia tri nay thay vi unreadChatCount tu
  // fetch/socket o tren, vi doi hoi thoai (?c=...) khong doi pathname nen
  // effect tren KHONG fetch lai, badge se ket o so cu neu khong co lop nay
  // (xem chat-unread-store.ts). null = khong co MessagesShell nao dang bao
  // cao -> quay lai dung unreadChatCount nhu binh thuong.
  const liveUnreadChatTotal = useSyncExternalStore(
    subscribeUnreadChatTotal,
    getUnreadChatTotalSnapshot,
    getUnreadChatServerSnapshot,
  );
  const effectiveUnreadChatCount = liveUnreadChatTotal ?? unreadChatCount;
  // Xin quyen Notification 1 lan khi da dang nhap - trinh duyet chi hoi neu
  // permission con "default" (xem browser-notifications.ts).
  useEffect(() => {
    if (!session?.username) return;
    requestNotificationPermission();
  }, [session?.username]);
  useChatSocket(
    Boolean(session?.username),
    useCallback(
      (m: ApiChatMessage) => {
        if (m.senderId !== session?.userId) {
          setUnreadChatCount((c) => c + 1);
          // senderName/senderAvatarUrl chi co tren socket event (khong qua
          // REST) - notifyNewChatMessage tu bo qua neu tab dang focus/chua
          // duoc cap quyen (xem browser-notifications.ts).
          notifyNewChatMessage({
            senderName: m.senderName ?? "Tin nhắn mới",
            content: formatMessagePreview(m),
            avatarUrl: m.senderAvatarUrl,
            conversationId: m.conversationId,
          });
          // Dang o /messages roi thi tin nhan da song trong khung chat -
          // khong can chong toast trung lap (xem ChatMessageToastStack.tsx).
          if (!pathname.startsWith("/messages")) {
            pushChatToast({
              id: m.id,
              conversationId: m.conversationId,
              senderName: m.senderName ?? "Người dùng",
              senderAvatarUrl: m.senderAvatarUrl ?? null,
              preview: formatMessagePreview(m),
              createdAt: m.createdAt,
            });
          }
        }
      },
      [session?.userId, pathname],
    ),
  );

  const chatBadge =
    effectiveUnreadChatCount > 0
      ? effectiveUnreadChatCount > 9
        ? "9+"
        : String(effectiveUnreadChatCount)
      : undefined;
  const notifBadge =
    unreadCount > 0
      ? unreadCount > 9
        ? "9+"
        : String(unreadCount)
      : undefined;

  return (
    <header className="grid h-[var(--header-height)] shrink-0 grid-cols-[minmax(max-content,1fr)_auto_minmax(max-content,1fr)] items-center gap-2 border-b border-border bg-surface px-3 sm:gap-4 sm:px-5">
      {/* Cum trai. Mobile: nut hamburger MO DRAWER sidebar (dong bo tren
          MOI trang, khong rieng /home & /articles nua - truoc day trang
          khac hien logo icon-only o day, gio thong nhat het thanh nut mo
          sidebar, xem DashboardSidebarDrawer trong HomeDashboardSidebar.tsx
          + dashboard-sidebar-drawer-store.ts). Desktop (md+) van la logo
          ngang binh thuong, khong doi. */}
      <div className="flex min-w-0 items-center justify-self-start">
        <button
          type="button"
          onClick={() => setDashboardDrawerOpen(true)}
          aria-label="Mở menu điều hướng"
          className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-ink-muted hover:bg-hover-bg md:hidden"
        >
          <Menu size={20} aria-hidden="true" />
        </button>
        <Link href="/home" className="hidden shrink-0 md:flex">
          <Logo orientation="horizontal" size={24} />
        </Link>
      </div>

      {/* Giua - 5 muc nav that (khong dropdown mega-menu, xem HeaderNav.tsx)
          - dung CSS grid 3 cot BANG NHAU cho ca header (thay vi flex-1 2 ben)
          de cum nav luon can DUNG GIUA man hinh, khong bi lech theo do rong
          thuc te cua cum logo/icon 2 ben (logo hep hon nhieu so voi cum icon
          ben phai truoc day gay lech ro). */}
      <div className="flex justify-center">
        <HeaderNav />
      </div>

      <div className="flex shrink-0 items-center justify-self-end gap-1.5 sm:gap-2">
        <button type="button" title="Tìm kiếm" onClick={() => setSearchOpen(true)}>
          <HeaderIconChip icon={Search} />
        </button>

        <PopoverRoot
          open={updatesOpen}
          onOpenChange={(next) => {
            setUpdatesOpen(next);
            if (next) markUpdatesSeen();
          }}
        >
          <PopoverTrigger asChild>
            <button type="button" title="Có gì mới">
              <HeaderIconChip icon={Sparkles} dot={hasUnseenUpdates} />
            </button>
          </PopoverTrigger>
          <PopoverContent
            open={updatesOpen}
            align="end"
            sideOffset={10}
            className="z-50"
          >
            <UpdatesPanel />
          </PopoverContent>
        </PopoverRoot>

        <Link href="/messages" title="Tin nhắn">
          <HeaderIconChip icon={MessageCircle} badge={chatBadge} />
        </Link>

        <PopoverRoot open={notifOpen} onOpenChange={setNotifOpen}>
          <PopoverTrigger asChild>
            <button type="button" title="Thông báo">
              <HeaderIconChip icon={Bell} badge={notifBadge} />
            </button>
          </PopoverTrigger>
          <PopoverContent
            open={notifOpen}
            align="end"
            sideOffset={10}
            className="z-50"
          >
            <NotificationsPanel
              onUnreadCountChange={handleUnreadCountChange}
              liveNotification={liveNotification}
            />
          </PopoverContent>
        </PopoverRoot>

        {/* Giu san 1 slot co kich thuoc co dinh (size 30 - khop Avatar trong
            AccountMenu) ngay ca khi session dang tai/chua co user, tranh cum
            icon ben canh (nut "Viết bài") bi xe dich sang trai roi nhay lai
            sang phai ngay khi avatar load xong. KHONG boc them rounded-full
            overflow-hidden o day nua - truoc day boc ca nut AccountMenu (co
            padding LECH pr-2/pl-1, khong vuong) khien khung tron bi keo thanh
            hinh oval/stadium, lam avatar hien lech/bi cat mep; Avatar tu no
            da tu rounded-full + object-cover dung roi. */}
        <div className="ml-1 shrink-0">
          {session?.user ? (
            <AccountMenu user={session.user} />
          ) : (
            <div className="mx-1 size-7.5 animate-pulse rounded-full bg-hover-bg" />
          )}
        </div>

        {/* Truoc day dieu huong ve /home?compose=1 (PostComposer inline tren
            /home, HomeLayoutShell.tsx tu doc param) - /home gio la trang
            dashboard khac han, khong con composer inline nao. Dieu huong
            thang toi trang /compose rieng (xem compose/page.tsx). Tren
            mobile/tablet (<lg) nut nay AN o day - thay bang 1 nut icon-only
            fixed goc duoi-phai (MobileComposeFab.tsx, hoac dung luon cho
            duoc gop san trong HomeMobileQuickPanels.tsx tren /home), tranh
            chiem cho trong header von da chat cum icon. */}
        {/* Nhom "split button": Link Viết bài + duong ke doc ngan cach +
            chevron mo popover 5 bai viet gan day (RecentPostsMenu.tsx) - 2
            nua cung 1 mau #8F3F4D, chi bo tron 1 dau moi ben. */}
        <div className="ml-1 hidden items-stretch lg:flex">
          <Link
            href="/compose"
            className="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-l-sm bg-[#8F3F4D] pr-3 pl-4 text-sm font-semibold text-surface transition-opacity duration-150 ease-out hover:opacity-90"
          >
            <SquarePen size={15} strokeWidth={2} />
            Viết bài
          </Link>
          <RecentPostsMenu />
        </div>
      </div>

      <HeaderSearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
};

// Icon "chip" nen mau nhat (primary-soft) + badge so/cham tron o goc, port
// tu 1 bo cuc tham khao nguoi dung dua (icon vuong bo tron + badge tron chong
// goc) - dung dung token cam --primary cua app thay vi mau teal trong anh mau.
function HeaderIconChip({
  icon: Icon,
  badge,
  dot,
}: {
  icon: typeof Bell;
  badge?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "relative flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-2xl text-primary transition-colors duration-150 ease-out ",
      )}
    >
      <Icon size={16} strokeWidth={2} />
      {badge && (
        <span
          className="absolute -top-1 -right-1 grid h-2 min-w-2 place-items-center rounded-full px-1 text-[10px] font-bold text-white ring-2 ring-surface"
          style={{ background: "var(--primary)" }}
        >
          {badge}
        </span>
      )}
      {dot && <HeaderBadgeDot />}
    </span>
  );
}

// Cham do gon o goc icon - dung khi CO tin chua doc nhung khong can hien so
// (chi 1 tin hieu "co gi moi"), khac han badge so cua notification/chat cu
// trong AppSidebar.tsx.
function HeaderBadgeDot() {
  return (
    <span
      className="absolute top-1.5 right-1.5 size-2 rounded-full ring-2 ring-surface"
      style={{ background: "var(--notification)" }}
    />
  );
}

export default TopHeaderBar;
