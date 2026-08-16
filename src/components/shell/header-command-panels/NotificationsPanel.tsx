"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bell, Check, LoaderCircle, X } from "lucide-react";
import MechanicalPanel from "./MechanicalPanel";
import type { ApiNotification } from "@/lib/api/types";
import { formatRelativeTime } from "@/lib/format-time";
import { listNotificationsAction } from "@/actions/notifications/list-notifications";
import { getUnreadNotificationCountAction } from "@/actions/notifications/get-unread-count";
import { markNotificationReadAction } from "@/actions/notifications/mark-read";
import { markAllNotificationsReadAction } from "@/actions/notifications/mark-all-read";
import { approveCollabAction } from "@/actions/knowledge-groups/approve-collab";
import { rejectCollabAction } from "@/actions/knowledge-groups/reject-collab";

type Tab = "all" | "requests";

const TABS: { id: Tab; label: string }[] = [
  { id: "all", label: "Tất cả" },
  { id: "requests", label: "Yêu cầu" },
];

function notificationText(n: ApiNotification): string {
  const actorName = n.actor?.name ?? "Một người dùng";
  const groupName = n.group?.name ?? "1 nhóm kiến thức";
  switch (n.type) {
    case "GROUP_COLLAB_REQUESTED":
      return `${actorName} muốn cộng tác vào "${groupName}"`;
    case "GROUP_COLLAB_APPROVED":
      return `Yêu cầu cộng tác vào "${groupName}" đã được duyệt`;
    case "GROUP_COLLAB_REJECTED":
      return `Yêu cầu cộng tác vào "${groupName}" đã bị từ chối`;
    default:
      return "Bạn có 1 thông báo mới";
  }
}

function notificationHref(n: ApiNotification): string | undefined {
  if (!n.group || !n.group.ownerUsername) return undefined;
  return `/workspace/${n.group.ownerUsername}/${n.group.workspaceId}`;
}

// Dropdown thong bao THAT (thay EmptyPanelState placeholder cu) - hien tai
// CHI phuc vu 3 loai lien quan yeu cau cong tac nhom kien thuc (xem
// NotificationService o backend). Tab "Yêu cầu" (loc type=GROUP_COLLAB_REQUESTED)
// theo dung yeu cau nguoi dung: "request này sẽ ở trong tab Yêu cầu". Cho
// phep duyet/tu choi NGAY tu dropdown (khong bat buoc dieu huong sang trang
// nhom) - dung lai approveCollabAction/rejectCollabAction da co san (cung
// action ma KnowledgeGroupCollabRequestsPanel.tsx dang dung).
export function NotificationsPanel({
  onUnreadCountChange,
}: {
  onUnreadCountChange: (count: number) => void;
}) {
  const [tab, setTab] = useState<Tab>("all");
  const [items, setItems] = useState<ApiNotification[] | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, startLoadMore] = useTransition();
  // collabId da xu ly TRONG PHIEN dropdown nay - an nut duyet/tu choi ngay sau
  // khi bam, tranh bam lan 2 (vd lat nguoc 1 yeu cau vua duyet thanh tu choi).
  const [handled, setHandled] = useState<Record<string, "approved" | "rejected">>({});
  const [actingId, setActingId] = useState<string | null>(null);
  const [, startFetchTransition] = useTransition();

  // startTransition boc CA setItems(null) - goi setState dong bo truc tiep
  // trong than effect bi ESLint react-hooks/set-state-in-effect chan (xem
  // quy uoc da dung o HeaderSearch.tsx).
  useEffect(() => {
    let cancelled = false;
    startFetchTransition(async () => {
      setItems(null);
      const page = await listNotificationsAction(tab);
      if (cancelled) return;
      setItems(page.items);
      setNextCursor(page.nextCursor);
    });
    return () => {
      cancelled = true;
    };
  }, [tab]);

  function loadMore() {
    if (!nextCursor) return;
    startLoadMore(async () => {
      const page = await listNotificationsAction(tab, nextCursor ?? undefined);
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

  async function handleDecision(n: ApiNotification, decision: "approve" | "reject") {
    // Dung THANG ownerUsername/workspaceId co san tren chinh notification -
    // KHONG can session.username (nguoi bam Duyet o day CHINH LA chu
    // workspace nhan thong bao nay, nhung cho toi khi session.username duoc
    // populate that su - vd truoc khi nguoi dung dang xuat/dang nhap lai sau
    // ban vua them field nay vao JWT - session?.username co the van undefined,
    // khien nut Duyet/Tu choi IM LANG khong lam gi ca). group.ownerUsername
    // luon dung boi no toi thang tu du lieu notification, khong phu thuoc
    // trang thai session client-side.
    if (!n.collabId || !n.group || !n.group.ownerUsername) return;
    setActingId(n.collabId);
    try {
      if (decision === "approve") {
        await approveCollabAction(
          n.group.id,
          n.collabId,
          n.group.ownerUsername,
          n.group.workspaceId,
        );
      } else {
        await rejectCollabAction(
          n.group.id,
          n.collabId,
          n.group.ownerUsername,
          n.group.workspaceId,
        );
      }
      setHandled((prev) => ({
        ...prev,
        [n.collabId as string]: decision === "approve" ? "approved" : "rejected",
      }));
      markOneRead(n);
    } finally {
      setActingId(null);
    }
  }

  const hasUnread = items?.some((n) => !n.read) ?? false;

  return (
    <MechanicalPanel
      title="Thông báo"
      eyebrow="NOTIFICATION CORE"
      icon={<Bell size={17} />}
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
      <div className="flex gap-1 px-3 pt-2.5" style={{ borderBottom: "1px solid var(--border)" }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="relative cursor-pointer px-2.5 pb-2.5 text-[12px] font-medium transition-colors duration-150 ease-out"
            style={{ color: tab === t.id ? "#269ce9" : "var(--ink-faint)" }}
          >
            {t.label}
            {tab === t.id && (
              <span
                className="absolute right-2.5 bottom-0 left-2.5 h-[2px] rounded-full"
                style={{ background: "linear-gradient(90deg, #20c5d8, #269ce9, #326eea)" }}
              />
            )}
          </button>
        ))}
      </div>

      <div className="max-h-[420px] overflow-y-auto">
        {items === null ? (
          <div className="flex justify-center py-10">
            <LoaderCircle size={18} className="animate-spin" style={{ color: "var(--ink-faint)" }} />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
            <p className="text-[11px]" style={{ color: "var(--ink-faint)" }}>
              {tab === "requests" ? "Chưa có yêu cầu cộng tác nào." : "Chưa có thông báo nào."}
            </p>
          </div>
        ) : (
          <>
            {items.map((n) => {
              const isRequest = n.type === "GROUP_COLLAB_REQUESTED";
              const decision = n.collabId ? handled[n.collabId] : undefined;
              const showActions = isRequest && !decision;
              const href = notificationHref(n);
              const acting = actingId === n.collabId;

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

                    {showActions && (
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          disabled={acting}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            void handleDecision(n, "approve");
                          }}
                          className="flex h-7 cursor-pointer items-center gap-1 rounded-full px-3 text-[11px] font-semibold text-white transition-opacity duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-60"
                          style={{ background: "linear-gradient(90deg, #20c5d8, #269ce9, #326eea)" }}
                        >
                          <Check size={12} strokeWidth={2.5} />
                          Duyệt
                        </button>
                        <button
                          type="button"
                          disabled={acting}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            void handleDecision(n, "reject");
                          }}
                          className="flex h-7 cursor-pointer items-center gap-1 rounded-full px-3 text-[11px] font-medium transition-colors duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-60"
                          style={{
                            background: "color-mix(in srgb, var(--danger) 10%, transparent)",
                            color: "var(--danger)",
                          }}
                        >
                          <X size={12} strokeWidth={2.5} />
                          Từ chối
                        </button>
                      </div>
                    )}
                    {isRequest && decision && (
                      <p
                        className="mt-1.5 text-[10.5px] font-medium"
                        style={{ color: decision === "approved" ? "#269ce9" : "var(--ink-faint)" }}
                      >
                        {decision === "approved" ? "Đã duyệt" : "Đã từ chối"}
                      </p>
                    )}

                    {/* "Toi ngay" - link RO RANG toi nhom kien thuc lien
                        quan, thay vi chi trong vao ca hang co the click
                        (kho phat hien, nguoi dung khong biet bam vao dau).
                        Khong hien khi showActions (REQUESTED chua xu ly) -
                        hanh dong chinh luc do la Duyet/Tu choi, khong phai
                        dieu huong di noi khac. */}
                    {href && !showActions && (
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
