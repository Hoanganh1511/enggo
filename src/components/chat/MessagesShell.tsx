"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import {
  Edit2Icon,
  FunnelIcon,
  LoaderCircle,
  MessageCircle,
  Search,
  Send,
  SquarePenIcon,
} from "lucide-react";
import type { ApiChatMessage, ApiConversationSummary } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { listConversationsAction } from "@/actions/chat/list-conversations";
import { listMessagesAction } from "@/actions/chat/list-messages";
import { sendMessageAction } from "@/actions/chat/send-message";
import { markConversationReadAction } from "@/actions/chat/mark-conversation-read";
import { useChatSocket } from "@/lib/use-chat-socket";
import { formatRelativeTime, formatTimeOnly } from "@/lib/format-time";

type ChatTab = "all" | "favorites" | "groups" | "unread";

// "Yêu thích"/"Nhóm" CHUA CO du lieu that dang sau (ApiConversationSummary
// chi co `otherUser` SO (1-1), khong co khai niem group/gan sao - xem
// Conversation model o backend, khong co field nao cho 2 thu nay) - disable
// 2 tab do (nhan "Sắp có") thay vi loc ra 1 danh sach rong gia vo la du lieu
// that. "Tất cả"/"Chưa đọc" loc that tren unreadCount da co san.
const CHAT_TABS: { key: ChatTab; label: string; disabled?: boolean }[] = [
  { key: "all", label: "Tất cả" },
  { key: "favorites", label: "Yêu thích", disabled: true },
  { key: "groups", label: "Nhóm", disabled: true },
  { key: "unread", label: "Chưa đọc" },
];

// Khung chinh trang /messages (port tu source treecareer-profile-universe-v2,
// BO Spaces/InfoPanel theo pham vi MVP - xem page.tsx). 2 cot: danh sach hoi
// thoai (trai) + khung chat cua hoi thoai dang chon (phai). Real-time qua
// useChatSocket (event "chat:message"), khong polling.
export function MessagesShell() {
  const { data: session } = useSession();
  const myId = session?.userId as string | undefined;
  const searchParams = useSearchParams();
  const router = useRouter();

  const [conversations, setConversations] = useState<
    ApiConversationSummary[] | null
  >(null);
  const [activeId, setActiveIdState] = useState<string | null>(null);
  const [messages, setMessages] = useState<ApiChatMessage[] | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<ChatTab>("all");
  const scrollRef = useRef<HTMLDivElement>(null);
  // Gan trong effect KHONG deps (chay sau MOI render) thay vi truc tiep trong
  // than ham - mutate ref luc render bi React coi la khong an toan (cung ly
  // do voi callbackRef trong use-notification-socket.ts).
  const activeIdRef = useRef<string | null>(null);
  useEffect(() => {
    activeIdRef.current = activeId;
  });

  const [, startFetchTransition] = useTransition();

  function setActiveId(id: string) {
    setActiveIdState(id);
    router.replace(`/messages?c=${id}`, { scroll: false });
  }

  // Tai danh sach hoi thoai 1 lan luc mount - neu URL co san ?c=<id> (dieu
  // huong tu nut "Nhắn tin" tren profile) thi chon luon hoi thoai do, khong
  // thi chon hoi thoai dau tien (moi nhat). Boc trong startFetchTransition
  // (cung 1 pattern voi NotificationsPanel.tsx) de setState dong bo (vd
  // setMessages(null) o effect duoi) khong bi ESLint react-hooks/set-state-in-effect
  // chan.
  useEffect(() => {
    let cancelled = false;
    startFetchTransition(async () => {
      const items = await listConversationsAction();
      if (cancelled) return;
      setConversations(items);
      const preselect = searchParams.get("c");
      if (preselect && items.some((c) => c.id === preselect)) {
        setActiveIdState(preselect);
      } else if (items.length > 0) {
        setActiveIdState(items[0].id);
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tai tin nhan + danh dau da doc moi khi doi hoi thoai dang chon.
  useEffect(() => {
    if (!activeId) return;
    let cancelled = false;
    startFetchTransition(async () => {
      setMessages(null);
      const page = await listMessagesAction(activeId);
      if (cancelled) return;
      setMessages(page.items);
      setNextCursor(page.nextCursor);
    });
    markConversationReadAction(activeId).then(() => {
      if (cancelled) return;
      setConversations(
        (prev) =>
          prev?.map((c) =>
            c.id === activeId ? { ...c, unreadCount: 0 } : c,
          ) ?? prev,
      );
    });
    return () => {
      cancelled = true;
    };
  }, [activeId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  const handleIncoming = useCallback((m: ApiChatMessage) => {
    setConversations((prev) => {
      if (!prev) return prev;
      const idx = prev.findIndex((c) => c.id === m.conversationId);
      if (idx === -1) return prev;
      const isActive = activeIdRef.current === m.conversationId;
      const updated: ApiConversationSummary = {
        ...prev[idx],
        lastMessage: m,
        updatedAt: m.createdAt,
        unreadCount: isActive ? 0 : prev[idx].unreadCount + 1,
      };
      return [updated, ...prev.filter((c) => c.id !== m.conversationId)];
    });

    if (m.conversationId === activeIdRef.current) {
      setMessages((prev) => (prev ? [...prev, m] : prev));
      markConversationReadAction(m.conversationId).catch(() => {});
    }
  }, []);
  useChatSocket(Boolean(myId), handleIncoming);

  async function handleLoadOlder() {
    if (!activeId || !nextCursor || loadingOlder) return;
    setLoadingOlder(true);
    try {
      const page = await listMessagesAction(activeId, nextCursor);
      setMessages((prev) => [...page.items, ...(prev ?? [])]);
      setNextCursor(page.nextCursor);
    } finally {
      setLoadingOlder(false);
    }
  }

  async function handleSend() {
    const text = draft.trim();
    if (!text || !activeId || sending) return;
    setDraft("");
    setSending(true);
    try {
      const msg = await sendMessageAction(activeId, text);
      setMessages((prev) => (prev ? [...prev, msg] : prev));
      setConversations((prev) => {
        if (!prev) return prev;
        const idx = prev.findIndex((c) => c.id === activeId);
        if (idx === -1) return prev;
        const updated: ApiConversationSummary = {
          ...prev[idx],
          lastMessage: msg,
          updatedAt: msg.createdAt,
        };
        return [updated, ...prev.filter((c) => c.id !== activeId)];
      });
    } finally {
      setSending(false);
    }
  }

  const filtered =
    conversations?.filter((c) => {
      const matchesQuery = (c.otherUser?.name ?? "")
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesTab = tab === "unread" ? c.unreadCount > 0 : true;
      return matchesQuery && matchesTab;
    }) ?? [];
  const unreadTotal =
    conversations?.reduce((sum, c) => sum + (c.unreadCount > 0 ? 1 : 0), 0) ?? 0;
  const activeConversation = conversations?.find((c) => c.id === activeId);

  return (
    <div className="flex h-full min-h-[520px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_12px_rgba(15,23,42,.04)]">
      {/* Danh sach hoi thoai */}
      <section className="flex w-[320px] shrink-0 flex-col border-r border-slate-200">
        <div className="border-b border-slate-100 p-5">
          <div className="flex items-center justify-between">
            <h1 className="text-[24px] font-semibold text-[#182338]">
              Tin nhắn
            </h1>
            <div className="flex items-center gap-x-2">
              <FunnelIcon className="size-4.5" strokeWidth={2} />
              <SquarePenIcon className="size-4.5" strokeWidth={2} />
            </div>
          </div>

          <div className="mt-3 flex items-center gap-4 border-b border-slate-100">
            {CHAT_TABS.map((t) => {
              const active = !t.disabled && tab === t.key;
              const badgeCount =
                t.key === "all"
                  ? (conversations?.length ?? 0)
                  : t.key === "unread"
                    ? unreadTotal
                    : 0;
              return (
                <button
                  key={t.key}
                  type="button"
                  disabled={t.disabled}
                  title={t.disabled ? "Sắp có" : undefined}
                  onClick={() => setTab(t.key)}
                  className={cn(
                    "relative flex items-center gap-1.5 pb-2.5 text-[12px] transition-colors duration-150 ease-out",
                    t.disabled
                      ? "cursor-not-allowed text-slate-300"
                      : active
                        ? "cursor-pointer font-semibold"
                        : "cursor-pointer font-medium text-slate-400 hover:text-slate-600",
                  )}
                  style={active ? { color: "var(--primary)" } : undefined}
                >
                  {t.label}
                  {badgeCount > 0 && (
                    <span
                      className="grid h-4 min-w-4 place-items-center rounded-full px-1 text-[9px] font-semibold text-white"
                      style={{
                        background: "var(--primary)",
                        boxShadow: "0 2px 6px color-mix(in srgb, var(--primary) 45%, transparent)",
                      }}
                    >
                      {badgeCount}
                    </span>
                  )}
                  {active && (
                    <span
                      className="absolute right-0 bottom-0 left-0 h-0.5 rounded-full"
                      style={{ background: "var(--primary)" }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-[#fafbfc] px-3">
            <Search size={15} className="text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-[12px] outline-none placeholder:text-slate-400"
              placeholder="Tìm kiếm hội thoại..."
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          {conversations === null ? (
            <div className="flex justify-center py-10">
              <LoaderCircle size={18} className="animate-spin text-slate-400" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <MessageCircle size={22} className="text-slate-300" />
              <p className="text-[11px] text-slate-400">
                Chưa có hội thoại nào.
              </p>
            </div>
          ) : (
            filtered.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveId(c.id)}
                className={`flex w-full gap-3 border-b border-slate-100 p-4 text-left transition ${
                  activeId === c.id ? "bg-[#f3f3fc]" : "hover:bg-slate-50"
                }`}
              >
                <ConversationAvatar
                  name={c.otherUser?.name}
                  avatarUrl={c.otherUser?.avatarUrl}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-2">
                    <b className="truncate text-[12px] text-[#182338]">
                      {c.otherUser?.name ?? "Người dùng"}
                    </b>
                    <span className="shrink-0 text-[9px] text-slate-400">
                      {formatRelativeTime(c.updatedAt)}
                    </span>
                  </div>
                  <div className="mt-1 flex justify-between gap-2">
                    <p className="truncate text-[10px] text-slate-500">
                      {c.lastMessage
                        ? `${c.lastMessage.senderId === myId ? "Bạn: " : ""}${c.lastMessage.content}`
                        : "Chưa có tin nhắn"}
                    </p>
                    {c.unreadCount > 0 && (
                      <span className="grid h-4 min-w-4 shrink-0 place-items-center rounded-full bg-[#ee7068] px-1 text-[8px] text-white">
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </section>

      {/* Khung chat */}
      <main className="flex min-w-0 flex-1 flex-col bg-white">
        {!activeConversation ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
            <MessageCircle size={26} className="text-slate-300" />
            <p className="text-[12px] text-slate-400">
              Chọn 1 hội thoại để bắt đầu
            </p>
          </div>
        ) : (
          <>
            <div className="flex h-[72px] shrink-0 items-center gap-3 border-b border-slate-100 px-6">
              <ConversationAvatar
                name={activeConversation.otherUser?.name}
                avatarUrl={activeConversation.otherUser?.avatarUrl}
              />
              <div>
                <b className="text-[14px] text-[#182338]">
                  {activeConversation.otherUser?.name ?? "Người dùng"}
                </b>
                {activeConversation.otherUser?.username && (
                  <p className="text-[10px] text-slate-400">
                    @{activeConversation.otherUser.username}
                  </p>
                )}
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-5">
              <div className="mx-auto max-w-[720px]">
                {nextCursor && (
                  <div className="mb-4 flex justify-center">
                    <button
                      type="button"
                      onClick={handleLoadOlder}
                      disabled={loadingOlder}
                      className="cursor-pointer text-[11px] font-medium text-[#5a4ccf] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loadingOlder ? "Đang tải..." : "Xem tin nhắn cũ hơn"}
                    </button>
                  </div>
                )}
                {messages === null ? (
                  <div className="flex justify-center py-10">
                    <LoaderCircle
                      size={18}
                      className="animate-spin text-slate-400"
                    />
                  </div>
                ) : (
                  messages.map((m) => (
                    <MessageBubble
                      key={m.id}
                      message={m}
                      isMine={m.senderId === myId}
                    />
                  ))
                )}
              </div>
            </div>

            <div className="border-t border-slate-100 p-4">
              <div className="mx-auto flex max-w-[720px] items-end gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_3px_18px_rgba(15,23,42,.05)]">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void handleSend();
                    }
                  }}
                  rows={1}
                  className="max-h-24 flex-1 resize-none bg-transparent px-2 py-2 text-[12px] outline-none placeholder:text-slate-400"
                  placeholder="Nhập tin nhắn..."
                />
                <button
                  type="button"
                  onClick={() => void handleSend()}
                  disabled={!draft.trim() || sending}
                  className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-xl bg-[#5b54d6] text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function ConversationAvatar({
  name,
  avatarUrl,
}: {
  name: string | undefined;
  avatarUrl: string | null | undefined;
}) {
  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={name ?? ""}
        width={44}
        height={44}
        className="size-11 shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#f1effb] text-[15px] font-semibold text-[#5a4ccf]">
      {(name ?? "?").trim().charAt(0).toUpperCase()}
    </span>
  );
}

function MessageBubble({
  message,
  isMine,
}: {
  message: ApiChatMessage;
  isMine: boolean;
}) {
  return (
    <div className={`mb-3 flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[72%] rounded-2xl px-4 py-2.5 text-[12px] leading-5 ${
          isMine
            ? "rounded-br-md bg-[#5b54d6] text-white"
            : "rounded-bl-md bg-[#f0f1f3] text-slate-700"
        }`}
      >
        {message.content}
        <div
          className={`mt-1 text-right text-[8px] ${isMine ? "text-white/60" : "text-slate-400"}`}
        >
          {formatTimeOnly(message.createdAt)}
        </div>
      </div>
    </div>
  );
}
