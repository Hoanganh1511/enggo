"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import MechanicalPanel from "./MechanicalPanel";
import type { ApiNotification } from "@/lib/api/types";
import { notificationText, notificationHref } from "@/lib/api/notification-presenter";
import { formatRelativeTime } from "@/lib/format-time";
import { listNotificationsAction } from "@/actions/notifications/list-notifications";
import { getUnreadNotificationCountAction } from "@/actions/notifications/get-unread-count";
import { markNotificationReadAction } from "@/actions/notifications/mark-read";
import { markAllNotificationsReadAction } from "@/actions/notifications/mark-all-read";

// Dropdown thong bao THAT (thay EmptyPanelState placeholder cu) - chi con
// phuc vu FOLLOW (xem NotificationService o backend). Truoc day con tab
// "Yêu cầu" + duyet/tu choi ngay tu dropdown cho yeu cau cong tac nhom kien
// thuc - da bo cung tinh nang Workspace/KnowledgeGroup (2026-09-14).
export function NotificationsPanel({
  onUnreadCountChange,
  liveNotification,
}: {
  onUnreadCountChange: (count: number) => void;
  // Thong bao moi nhat nhan qua WebSocket (xem top-header-bar.tsx) - null
  // neu chua co gi.
  liveNotification: ApiNotification | null;
}) {
  const [items, setItems] = useState<ApiNotification[] | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, startLoadMore] = useTransition();
  const [, startFetchTransition] = useTransition();

  // startTransition boc CA setItems(null) - goi setState dong bo truc tiep
  // trong than effect bi ESLint react-hooks/set-state-in-effect chan (xem
  // quy uoc da dung o HeaderSearch.tsx).
  useEffect(() => {
    let cancelled = false;
    startFetchTransition(async () => {
      setItems(null);
      const page = await listNotificationsAction();
      if (cancelled) return;
      setItems(page.items);
      setNextCursor(page.nextCursor);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Noi thong bao moi nhan qua socket len DAU danh sach dang mo, thay vi bat
  // nguoi dung phai dong/mo lai dropdown moi thay. Boc trong startFetchTransition
  // (cung 1 transition dung cho fetch ben tren) de tranh ESLint
  // react-hooks/set-state-in-effect.
  useEffect(() => {
    if (!liveNotification) return;
    startFetchTransition(() => {
      setItems((prev) => {
        if (!prev) return prev;
        if (prev.some((n) => n.id === liveNotification.id)) return prev;
        return [liveNotification, ...prev];
      });
    });
  }, [liveNotification]);

  function loadMore() {
    if (!nextCursor) return;
    startLoadMore(async () => {
      const page = await listNotificationsAction(nextCursor ?? undefined);
      setItems((prev) => [...(prev ?? []), ...page.items]);
      setNextCursor(page.nextCursor);
    });
  }

  async function refreshUnread() {
    const { count } = await getUnreadNotificationCountAction();
    onUnreadCountChange(count);
  }

  function markOneRead(n: ApiNotification) {
    if (n.read) return;
    setItems(
      (prev) => prev?.map((x) => (x.id === n.id ? { ...x, read: true } : x)) ?? prev,
    );
    markNotificationReadAction(n.id).then(refreshUnread);
  }

  function handleMarkAllRead() {
    setItems((prev) => prev?.map((n) => ({ ...n, read: true })) ?? prev);
    markAllNotificationsReadAction().then(() => onUnreadCountChange(0));
  }

  const hasUnread = items?.some((n) => !n.read) ?? false;

  return (
    <MechanicalPanel
      title="Thông báo"
      width="w-[380px]"
      action={
        hasUnread ? (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="cursor-pointer text-[11px] font-medium transition-colors duration-150 ease-out"
            style={{ color: "#269ce9" }}
          >
            Đánh dấu đã đọc
          </button>
        ) : undefined
      }
    >
      <div className="max-h-[420px] overflow-y-auto">
        {items === null ? (
          <div className="flex justify-center py-10">
            <LoadingSpinner size={18} style={{ color: "var(--ink-faint)" }} />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
            <p className="text-[11px]" style={{ color: "var(--ink-faint)" }}>
              Chưa có thông báo nào.
            </p>
          </div>
        ) : (
          <>
            {items.map((n) => {
              const href = notificationHref(n);

              const row = (
                <div
                  className="flex items-start gap-2.5 px-4 py-3 transition-colors duration-150 ease-out"
                  style={{ background: !n.read ? "var(--active-bg)" : undefined }}
                >
                  {n.actor?.avatarUrl ? (
                    <Image
                      src={n.actor.avatarUrl}
                      alt=""
                      width={32}
                      height={32}
                      className="size-8 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span
                      className="flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
                      style={{ background: "#269ce9" }}
                    >
                      {(n.actor?.name ?? "?").trim().charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] leading-snug" style={{ color: "var(--ink)" }}>
                      {notificationText(n)}
                    </p>
                    <p className="mt-0.5 text-[10.5px]" style={{ color: "var(--ink-faint)" }}>
                      {formatRelativeTime(n.createdAt)}
                    </p>

                    {href && (
                      <Link
                        href={href}
                        onClick={() => markOneRead(n)}
                        className="mt-1.5 inline-flex cursor-pointer items-center gap-1 text-[11px] font-semibold transition-colors duration-150 ease-out hover:underline"
                        style={{ color: "#269ce9" }}
                      >
                        Tới ngay
                        <ArrowRight size={11} strokeWidth={2.5} />
                      </Link>
                    )}
                  </div>
                  {!n.read && (
                    <span
                      className="mt-1.5 size-1.5 shrink-0 rounded-full"
                      style={{ background: "#269ce9" }}
                    />
                  )}
                </div>
              );

              // Khong con boc ca hang trong <Link> (se tao the <a> long
              // nhau khi ket hop voi link "Tới ngay" o tren, sai HTML) - moi
              // hang gio la 1 div thuong, chi danh dau da doc khi click bat
              // ky dau trong do; dieu huong THAT su di qua link "Tới ngay"
              // rieng.
              return (
                <div key={n.id} onClick={() => markOneRead(n)} className="cursor-default">
                  {row}
                </div>
              );
            })}

            {nextCursor && (
              <div className="flex justify-center py-2.5">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="cursor-pointer text-[11px] font-medium disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ color: "#269ce9" }}
                >
                  {loadingMore ? "Đang tải..." : "Xem thêm"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </MechanicalPanel>
  );
}
