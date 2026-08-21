"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import {
  BarChart3,
  File as FileIcon,
  FunnelIcon,
  ImagePlus,
  LoaderCircle,
  MessageCircle,
  Mic,
  Paperclip,
  Plus,
  Search,
  Send,
  Smile,
  SquarePenIcon,
  X,
} from "lucide-react";
import type {
  ApiChatMessage,
  ApiConversationSummary,
  ApiMessageType,
  ApiPoll,
} from "@/lib/api/types";
import type { ApiGif } from "@/lib/api/gif";
import type { ApiUploadResult } from "@/lib/api/upload";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast/toast-store";
import { listConversationsAction } from "@/actions/chat/list-conversations";
import { listMessagesAction } from "@/actions/chat/list-messages";
import { sendMessageAction } from "@/actions/chat/send-message";
import { markConversationReadAction } from "@/actions/chat/mark-conversation-read";
import { uploadChatAttachmentAction } from "@/actions/chat/upload-attachment";
import { votePollAction } from "@/actions/chat/vote-poll";
import { useChatSocket } from "@/lib/use-chat-socket";
import { formatRelativeTime } from "@/lib/format-time";
import { formatMessagePreview } from "@/lib/chat-message-preview";
import { MessageInfoPanel } from "./MessageInfoPanel";
import { MessageBubble } from "./MessageBubble";
import { EmojiPickerPopover } from "./EmojiPickerPopover";
import { GifPickerPopover } from "./GifPickerPopover";
import { PollComposerModal } from "./PollComposerModal";
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

type ChatTab = "all" | "favorites" | "groups" | "unread";
type AttachmentKind = "image" | "file" | "voice";
type PendingAttachment = {
  kind: AttachmentKind;
  file: File;
  previewUrl: string;
  uploading: boolean;
  uploaded: ApiUploadResult | null;
  durationSeconds?: number;
};

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

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// Khung chinh trang /messages (port tu source treecareer-profile-universe-v2,
// BO Spaces/InfoPanel theo pham vi MVP - xem page.tsx). 2 cot: danh sach hoi
// thoai (trai) + khung chat cua hoi thoai dang chon (phai). Real-time qua
// useChatSocket (event "chat:message" + "chat:poll-update"), khong polling.
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

  // Toolbar composer: dinh kem (anh/file/ghi am) - 1 attachment "cho" tai 1
  // thoi diem (upload NGAY luc chon, "cho" den khi bam Gui - dung yeu cau
  // "de o preview truoc"), popover Plus/emoji/gif, ghi am qua MediaRecorder.
  const [pendingAttachment, setPendingAttachment] =
    useState<PendingAttachment | null>(null);
  const [plusOpen, setPlusOpen] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [gifOpen, setGifOpen] = useState(false);
  const [pollModalOpen, setPollModalOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordStreamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordStartRef = useRef(0);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const composerBusy = pendingAttachment !== null || recording;

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
  const handlePollUpdate = useCallback((p: ApiPoll) => {
    setMessages(
      (prev) => prev?.map((m) => (m.poll?.id === p.id ? { ...m, poll: p } : m)) ?? prev,
    );
  }, []);
  useChatSocket(Boolean(myId), handleIncoming, handlePollUpdate);

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

  function appendSentMessage(msg: ApiChatMessage) {
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
  }

  function cancelPendingAttachment() {
    if (pendingAttachment?.kind === "image" && pendingAttachment.previewUrl) {
      URL.revokeObjectURL(pendingAttachment.previewUrl);
    }
    setPendingAttachment(null);
  }

  async function uploadAndStage(
    file: File,
    kind: AttachmentKind,
    durationSeconds?: number,
  ) {
    const previewUrl = kind === "image" ? URL.createObjectURL(file) : "";
    setPendingAttachment({
      kind,
      file,
      previewUrl,
      uploading: true,
      uploaded: null,
      durationSeconds,
    });
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", kind);
      const uploaded = await uploadChatAttachmentAction(formData);
      setPendingAttachment((prev) =>
        prev?.file === file ? { ...prev, uploading: false, uploaded } : prev,
      );
    } catch {
      toast.danger(
        "Tải lên thất bại - có thể chưa cấu hình AWS S3 (AWS_REGION/AWS_S3_BUCKET).",
      );
      if (kind === "image") URL.revokeObjectURL(previewUrl);
      setPendingAttachment(null);
    }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordStreamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      recordedChunksRef.current = [];
      recordStartRef.current = Date.now();
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        recordStreamRef.current?.getTracks().forEach((t) => t.stop());
        recordStreamRef.current = null;
        const elapsedSec = Math.max(
          1,
          Math.round((Date.now() - recordStartRef.current) / 1000),
        );
        const blob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
        const file = new File([blob], `voice-${Date.now()}.webm`, {
          type: "audio/webm",
        });
        void uploadAndStage(file, "voice", elapsedSec);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
      setRecordSeconds(0);
      recordTimerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } catch {
      toast.danger("Không thể truy cập micro - kiểm tra quyền trình duyệt.");
    }
  }

  function stopRecordingTimer() {
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    setRecording(false);
    stopRecordingTimer();
  }

  function cancelRecording() {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    recordStreamRef.current?.getTracks().forEach((t) => t.stop());
    recordStreamRef.current = null;
    setRecording(false);
    stopRecordingTimer();
  }

  async function handleSend() {
    if (!activeId || sending) return;
    const text = draft.trim();

    if (pendingAttachment) {
      if (pendingAttachment.uploading || !pendingAttachment.uploaded) return;
      const type: ApiMessageType =
        pendingAttachment.kind === "image"
          ? "IMAGE"
          : pendingAttachment.kind === "voice"
            ? "VOICE"
            : "FILE";
      setSending(true);
      try {
        const msg = await sendMessageAction(activeId, {
          type,
          content: text || undefined,
          attachmentUrl: pendingAttachment.uploaded.url,
          attachmentName: pendingAttachment.uploaded.name,
          attachmentMimeType: pendingAttachment.uploaded.mimeType,
          attachmentSize: pendingAttachment.uploaded.size,
          durationSeconds: pendingAttachment.durationSeconds,
        });
        appendSentMessage(msg);
        setDraft("");
        cancelPendingAttachment();
      } finally {
        setSending(false);
      }
      return;
    }

    if (!text) return;
    setDraft("");
    setSending(true);
    try {
      const msg = await sendMessageAction(activeId, { content: text });
      appendSentMessage(msg);
    } finally {
      setSending(false);
    }
  }

  async function handleSelectGif(gif: ApiGif) {
    if (!activeId || !gif.url) return;
    setGifOpen(false);
    setSending(true);
    try {
      const msg = await sendMessageAction(activeId, {
        type: "GIF",
        attachmentUrl: gif.url,
        attachmentName: gif.title || "GIF",
        attachmentMimeType: "image/gif",
      });
      appendSentMessage(msg);
    } finally {
      setSending(false);
    }
  }

  async function handleCreatePoll(poll: {
    question: string;
    options: { text: string }[];
  }) {
    if (!activeId) return;
    const msg = await sendMessageAction(activeId, { type: "POLL", poll });
    appendSentMessage(msg);
  }

  const handleVote = useCallback((pollId: string, optionId: string) => {
    votePollAction(pollId, optionId)
      .then((tally) => {
        setMessages(
          (prev) =>
            prev?.map((m) => (m.poll?.id === pollId ? { ...m, poll: tally } : m)) ??
            prev,
        );
      })
      .catch(() => toast.danger("Không thể bình chọn, thử lại sau."));
  }, []);

  const filtered =
    conversations?.filter((c) => {
      const matchesQuery = (c.otherUser?.name ?? "")
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesTab = tab === "unread" ? c.unreadCount > 0 : true;
      return matchesQuery && matchesTab;
    }) ?? [];
  const unreadTotal =
    conversations?.reduce((sum, c) => sum + (c.unreadCount > 0 ? 1 : 0), 0) ??
    0;
  const activeConversation = conversations?.find((c) => c.id === activeId);

  return (
    <div className="flex h-[calc(100vh-var(--header-height)-2rem)] min-h-[680px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_12px_rgba(15,23,42,.04)]">
      {/* Danh sach hoi thoai */}
      <section className="flex w-[380px] shrink-0 flex-col border-r border-slate-200">
        <div className="border-b border-slate-100 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-[28px] font-bold text-[#182338]">Tin nhắn</h1>
            <div className="flex items-center gap-x-3 text-slate-500">
              <FunnelIcon className="size-5.5" strokeWidth={2} />
              <SquarePenIcon className="size-5.5" strokeWidth={2} />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-5 border-b border-slate-100">
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
                    "relative flex items-center gap-1.5 pb-3 text-[14px] transition-colors duration-150 ease-out",
                    t.disabled
                      ? "cursor-not-allowed text-slate-300"
                      : active
                        ? "cursor-pointer font-semibold"
                        : "cursor-pointer font-medium text-slate-500 hover:text-slate-700",
                  )}
                  style={active ? { color: "var(--primary)" } : undefined}
                >
                  {t.label}
                  {badgeCount > 0 && (
                    <span
                      className="grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] font-semibold text-white"
                      style={{
                        background: "var(--primary)",
                        boxShadow:
                          "0 2px 6px color-mix(in srgb, var(--primary) 45%, transparent)",
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

          <div className="mt-4 flex h-11 items-center gap-2.5 rounded-xl border border-slate-200 bg-[#fafbfc] px-3.5">
            <Search size={17} className="shrink-0 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-[14px] text-[#182338] outline-none placeholder:text-slate-400"
              placeholder="Tìm kiếm hội thoại..."
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          {conversations === null ? (
            <div className="flex justify-center py-10">
              <LoaderCircle size={20} className="animate-spin text-slate-400" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
              <MessageCircle size={26} className="text-slate-300" />
              <p className="text-[13px] text-slate-500">
                Chưa có hội thoại nào.
              </p>
            </div>
          ) : (
            filtered.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveId(c.id)}
                className={`flex w-full gap-3.5 rounded-lg p-4 text-left transition ${
                  activeId === c.id ? "bg-[#f3f3fc]" : "hover:bg-slate-50"
                }`}
              >
                <ConversationAvatar
                  name={c.otherUser?.name}
                  avatarUrl={c.otherUser?.avatarUrl}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-2">
                    <b className="truncate text-[15px] text-[#182338]">
                      {c.otherUser?.name ?? "Người dùng"}
                    </b>
                    <span className="shrink-0 text-[11px] text-slate-500">
                      {formatRelativeTime(c.updatedAt)}
                    </span>
                  </div>
                  <div className="mt-1 flex justify-between gap-2">
                    <p className="truncate text-[13px] text-slate-600">
                      {c.lastMessage
                        ? `${c.lastMessage.senderId === myId ? "Bạn: " : ""}${formatMessagePreview(c.lastMessage)}`
                        : "Chưa có tin nhắn"}
                    </p>
                    {c.unreadCount > 0 && (
                      <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-[#ee7068] px-1.5 text-[10px] font-semibold text-white">
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
            <MessageCircle size={30} className="text-slate-300" />
            <p className="text-[14px] text-slate-500">
              Chọn 1 hội thoại để bắt đầu
            </p>
          </div>
        ) : (
          <>
            <div className="flex h-[84px] shrink-0 items-center gap-3.5 border-b border-slate-100 px-8">
              <ConversationAvatar
                name={activeConversation.otherUser?.name}
                avatarUrl={activeConversation.otherUser?.avatarUrl}
              />
              <div>
                <b className="text-[17px] text-[#182338]">
                  {activeConversation.otherUser?.name ?? "Người dùng"}
                </b>
                {activeConversation.otherUser?.username && (
                  <p className="text-[13px] text-slate-500">
                    @{activeConversation.otherUser.username}
                  </p>
                )}
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-6">
              <div className="mx-auto max-w-[820px]">
                {nextCursor && (
                  <div className="mb-4 flex justify-center">
                    <button
                      type="button"
                      onClick={handleLoadOlder}
                      disabled={loadingOlder}
                      className="cursor-pointer text-[13px] font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                      style={{ color: "var(--primary)" }}
                    >
                      {loadingOlder ? "Đang tải..." : "Xem tin nhắn cũ hơn"}
                    </button>
                  </div>
                )}
                {messages === null ? (
                  <div className="flex justify-center py-10">
                    <LoaderCircle
                      size={20}
                      className="animate-spin text-slate-400"
                    />
                  </div>
                ) : (
                  messages.map((m) => (
                    <MessageBubble
                      key={m.id}
                      message={m}
                      isMine={m.senderId === myId}
                      onVote={handleVote}
                    />
                  ))
                )}
              </div>
            </div>

            <div className="border-t border-slate-100 p-5">
              <div className="mx-auto flex max-w-[820px] flex-col gap-2.5 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-[0_3px_18px_rgba(15,23,42,.05)]">
                {pendingAttachment && (
                  <AttachmentPreviewStrip
                    attachment={pendingAttachment}
                    onCancel={cancelPendingAttachment}
                  />
                )}
                {recording && (
                  <div className="flex items-center gap-2.5 rounded-xl bg-red-50 px-3.5 py-2.5">
                    <span className="size-2 shrink-0 animate-pulse rounded-full bg-red-500" />
                    <span className="text-[13px] font-semibold text-red-600">
                      Đang ghi âm... {formatDuration(recordSeconds)}
                    </span>
                    <button
                      type="button"
                      onClick={cancelRecording}
                      className="ml-auto cursor-pointer text-[13px] font-medium text-red-500 hover:text-red-700"
                    >
                      Huỷ
                    </button>
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="cursor-pointer rounded-lg bg-red-600 px-3 py-1.5 text-[13px] font-semibold text-white hover:bg-red-700"
                    >
                      Dừng & Gửi
                    </button>
                  </div>
                )}

                <div className="flex items-end gap-1.5">
                  <div className="flex shrink-0 items-center gap-0.5 pb-1.5">
                    <PopoverRoot open={plusOpen} onOpenChange={setPlusOpen}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          disabled={composerBusy}
                          title="Thêm"
                          className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg text-slate-500 transition-colors duration-150 ease-out hover:bg-slate-100 hover:text-[#182338] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Plus size={19} />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent open={plusOpen} align="start" sideOffset={10}>
                        <div className="w-60 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-[0_8px_28px_rgba(15,23,42,.12)]">
                          <button
                            type="button"
                            onClick={() => {
                              setPlusOpen(false);
                              fileInputRef.current?.click();
                            }}
                            className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13px] font-medium text-[#182338] hover:bg-slate-50"
                          >
                            <Paperclip size={16} className="text-slate-500" />
                            Đính kèm file
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPlusOpen(false);
                              setPollModalOpen(true);
                            }}
                            className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13px] font-medium text-[#182338] hover:bg-slate-50"
                          >
                            <BarChart3 size={16} className="text-slate-500" />
                            Tạo tin nhắn thăm dò ý kiến
                          </button>
                        </div>
                      </PopoverContent>
                    </PopoverRoot>

                    <button
                      type="button"
                      disabled={composerBusy}
                      title="Gửi ảnh"
                      onClick={() => imageInputRef.current?.click()}
                      className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg text-slate-500 transition-colors duration-150 ease-out hover:bg-slate-100 hover:text-[#182338] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ImagePlus size={18} />
                    </button>

                    <PopoverRoot open={emojiOpen} onOpenChange={setEmojiOpen}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          disabled={composerBusy}
                          title="Chọn sticker"
                          className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg text-slate-500 transition-colors duration-150 ease-out hover:bg-slate-100 hover:text-[#182338] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Smile size={18} />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent open={emojiOpen} align="start" sideOffset={10}>
                        <EmojiPickerPopover
                          onSelect={(emoji) => {
                            setDraft((prev) => prev + emoji);
                            setEmojiOpen(false);
                          }}
                        />
                      </PopoverContent>
                    </PopoverRoot>

                    <PopoverRoot open={gifOpen} onOpenChange={setGifOpen}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          disabled={composerBusy}
                          title="Tìm GIF"
                          className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg text-[11px] font-black tracking-tight text-slate-500 transition-colors duration-150 ease-out hover:bg-slate-100 hover:text-[#182338] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          GIF
                        </button>
                      </PopoverTrigger>
                      <PopoverContent open={gifOpen} align="start" sideOffset={10}>
                        <GifPickerPopover onSelect={(gif) => void handleSelectGif(gif)} />
                      </PopoverContent>
                    </PopoverRoot>

                    <button
                      type="button"
                      disabled={pendingAttachment !== null}
                      title="Ghi âm tin nhắn thoại"
                      onClick={() => (recording ? stopRecording() : void startRecording())}
                      className={cn(
                        "grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg transition-colors duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-40",
                        recording
                          ? "bg-red-50 text-red-600 hover:bg-red-100"
                          : "text-slate-500 hover:bg-slate-100 hover:text-[#182338]",
                      )}
                    >
                      <Mic size={18} />
                    </button>
                  </div>

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
                    disabled={recording}
                    className="max-h-24 flex-1 resize-none bg-transparent px-2.5 py-2.5 text-[15px] text-[#182338] outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
                    placeholder="Nhập tin nhắn..."
                  />
                  <button
                    type="button"
                    onClick={() => void handleSend()}
                    disabled={
                      sending ||
                      recording ||
                      (pendingAttachment
                        ? pendingAttachment.uploading
                        : !draft.trim())
                    }
                    className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-xl text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                    style={{ background: "var(--primary)" }}
                  >
                    <Send size={19} />
                  </button>
                </div>
              </div>

              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void uploadAndStage(file, "image");
                  e.target.value = "";
                }}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="*/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void uploadAndStage(file, "file");
                  e.target.value = "";
                }}
              />
            </div>
          </>
        )}
      </main>

      {activeConversation?.otherUser && (
        <MessageInfoPanel otherUser={activeConversation.otherUser} />
      )}

      <PollComposerModal
        open={pollModalOpen}
        onOpenChange={setPollModalOpen}
        onSubmit={handleCreatePoll}
      />
    </div>
  );
}

function AttachmentPreviewStrip({
  attachment,
  onCancel,
}: {
  attachment: PendingAttachment;
  onCancel: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2">
      {attachment.kind === "image" ? (
        // eslint-disable-next-line @next/next/no-img-element -- preview tu File cuc bo (object URL), khong phai anh remote
        <img
          src={attachment.previewUrl}
          alt={attachment.file.name}
          className="size-12 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-slate-200">
          {attachment.kind === "voice" ? (
            <Mic size={18} className="text-slate-500" />
          ) : (
            <FileIcon size={18} className="text-slate-500" />
          )}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-[#182338]">
          {attachment.file.name}
        </p>
        <p className="text-[11px] text-slate-500">
          {attachment.uploading ? "Đang tải lên..." : "Sẵn sàng gửi"}
        </p>
      </div>
      {attachment.uploading && (
        <LoaderCircle size={16} className="shrink-0 animate-spin text-slate-400" />
      )}
      <button
        type="button"
        onClick={onCancel}
        className="shrink-0 cursor-pointer rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
      >
        <X size={16} />
      </button>
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
        width={52}
        height={52}
        className="size-13 shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <span
      className="grid size-13 shrink-0 place-items-center rounded-full text-[18px] font-semibold text-white"
      style={{ background: "var(--primary)" }}
    >
      {(name ?? "?").trim().charAt(0).toUpperCase()}
    </span>
  );
}
