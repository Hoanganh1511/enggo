"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bell, Inbox, Laptop } from "lucide-react";
import { useCareerTreeStore } from "@/stores/career-tree-store";

import { getDelayedTopics } from "@/lib/career-tree/delayed-topics";
import { getWorkspaceNotificationsAction } from "@/actions/career-tree/get-workspace-notifications";
import { markNotificationReadAction } from "@/actions/career-tree/mark-notification-read";
import { formatRelativeTime } from "@/lib/career-tree/format-time";
import type { ApiNotification } from "@/lib/api/types";
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

type TabKey = "system" | "task" | "connection";

const TABS: { key: TabKey; label: string }[] = [
  { key: "system", label: "Hệ thống" },
  { key: "task", label: "Công việc của bạn" },
  { key: "connection", label: "Kết nối" },
];

function getWorkspaceIdFromPathname(pathname: string): string | null {
  const match = pathname.match(/^\/w\/([^/]+)/);
  return match ? match[1] : null;
}

const NotificationBell = () => {
  const pathname = usePathname();
  const workspaceId = getWorkspaceIdFromPathname(pathname);
  const allNodes = useCareerTreeStore((s) => s.allNodes);

  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("system");
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);

  useEffect(() => {
    if (!workspaceId) return;
    getWorkspaceNotificationsAction(workspaceId).then(setNotifications);
  }, [workspaceId]);

  const delayedTopics = getDelayedTopics(allNodes);
  const unreadSystemCount = notifications.filter((n) => !n.read).length;
  const badgeCount = unreadSystemCount + delayedTopics.length;

  const handleMarkRead = async (notification: ApiNotification) => {
    if (notification.read) return;
    const updated = await markNotificationReadAction(notification.id, true);
    setNotifications((prev) =>
      prev.map((n) => (n.id === updated.id ? updated : n)),
    );
  };

  if (!workspaceId) return null;

  return (
    <PopoverRoot open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Thông báo"
          className={`relative flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-icon transition-colors duration-150 ease-out ${
            open
              ? "bg-hover-bg text-icon-hover"
              : "hover:bg-hover-bg hover:text-icon-hover"
          }`}
        >
          <Bell strokeWidth={1.75} className="size-4.5 2xl:size-5" />
          {badgeCount > 0 && (
            <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-danger" />
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        open={open}
        align="end"
        className="z-50 w-120 origin-top-right overflow-hidden rounded-sm border border-border bg-surface shadow-dropdown"
      >
        <div className="flex items-center gap-1 border-b border-border px-2 pt-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`-mb-px cursor-pointer border-b-2 px-2 py-2 text-xs font-medium transition-colors duration-150 ease-out ${
                activeTab === tab.key
                  ? "border-primary text-ink"
                  : "border-transparent text-ink-muted hover:text-ink"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {activeTab === "system" &&
            (notifications.length === 0 ? (
              <EmptyState text="Chưa có thông báo hệ thống nào." />
            ) : (
              <ul className="flex flex-col gap-1">
                {notifications.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => handleMarkRead(n)}
                      className={`flex w-full cursor-pointer flex-col gap-0.5 rounded-md px-2 py-2 text-left transition-colors duration-150 ease-out hover:bg-hover-bg ${
                        n.read ? "" : "bg-active-bg"
                      }`}
                    >
                      <span className="text-xs font-medium text-ink">
                        {n.title}
                      </span>
                      {n.body && (
                        <span className="text-xs text-ink-muted">{n.body}</span>
                      )}
                      <span className="text-[10px] text-ink-faint">
                        {formatRelativeTime(n.createdAt)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ))}

          {activeTab === "task" &&
            (delayedTopics.length === 0 ? (
              <EmptyState text="Không có chủ đề nào đang bị trễ." />
            ) : (
              <ul className="flex flex-col gap-1">
                {delayedTopics.map((t) => (
                  <li key={t.nodeId}>
                    <Link
                      href={`/w/${workspaceId}/nodes/${t.nodeId}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 rounded-md px-2 py-2 text-left transition-colors duration-150 ease-out hover:bg-hover-bg"
                    >
                      <Laptop
                        size={14}
                        strokeWidth={1.75}
                        className="shrink-0 text-danger"
                      />
                      <span className="min-w-0 flex-1 truncate text-xs text-ink">
                        {t.title}
                      </span>
                      <span className="shrink-0 text-[10px] text-danger">
                        {t.daysSince} ngày
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ))}

          {activeTab === "connection" && (
            <EmptyState text="Chưa có kết nối nào — tính năng nhiều người dùng chưa khả dụng." />
          )}
        </div>
      </PopoverContent>
    </PopoverRoot>
  );
};

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
      <Inbox size={20} strokeWidth={1.75} className="text-ink-disabled" />
      <p className="text-xs text-ink-muted">{text}</p>
    </div>
  );
}

export default NotificationBell;
