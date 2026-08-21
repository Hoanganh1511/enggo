"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Bell, Mail, SquarePen } from "lucide-react";
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import Logo from "../ui/logo";
import { HeaderSearch } from "./HeaderSearch";
import AccountMenu from "./account-menu";
import { NotificationsPanel } from "./header-command-panels/NotificationsPanel";
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
import type { ApiChatMessage, ApiNotification } from "@/lib/api/types";

// Header ngang - thay AppSidebar.tsx (sidebar trai) theo yeu cau nguoi dung,
// port lai layout note.com (anh mau): logo trai, o tim kiem, roi cum icon
// Tin nhan/Thong bao/tai khoan/nut "Viết bài" ben phai. Toan bo logic
// unread-count/socket/panel GIU NGUYEN tu AppSidebar.tsx (chi doi vi tri hien
// thi tu sidebar doc sang header ngang), khong viet lai tu dau.
const TopHeaderBar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [notifOpen, setNotifOpen] = useState(false);

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

  // Focus/dieu huong toi composer o trang Home - giu dung logic cu (xem git
  // history top-header-bar.tsx): dang o /home thi cuon+focus thang, khac thi
  // dieu huong sang /home?compose=1 (HomeLayoutShell.tsx tu doc param nay).
  function handleCompose() {
    if (pathname.startsWith("/home")) {
      document.getElementById("post-composer-input")?.focus();
      return;
    }
    router.push("/home?compose=1");
  }

  return (
    <header className="flex h-[var(--header-height)] shrink-0 items-center gap-4 border-b border-border bg-surface px-5">
      <Link href="/home" className="shrink-0">
        <Logo orientation="horizontal" size={24} />
      </Link>

      <div className="max-w-sm min-w-0 flex-1">
        <HeaderSearch />
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1.5">
        <Link
          href="/messages"
          title="Tin nhắn"
          className="relative flex size-9 shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-ink"
        >
          <Mail size={19} strokeWidth={1.85} />
          {chatBadge && <HeaderBadgeDot />}
        </Link>

        <PopoverRoot open={notifOpen} onOpenChange={setNotifOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              title="Thông báo"
              className="relative flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-ink"
            >
              <Bell size={19} strokeWidth={1.85} />
              {notifBadge && <HeaderBadgeDot />}
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

        {session?.user && <AccountMenu user={session.user} />}

        <button
          type="button"
          onClick={handleCompose}
          className="ml-1 flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-sm bg-black/90 px-4 text-sm font-semibold text-surface transition-opacity duration-150 ease-out hover:opacity-90"
        >
          <SquarePen size={15} strokeWidth={2} />
          Viết bài
        </button>
      </div>
    </header>
  );
};

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
