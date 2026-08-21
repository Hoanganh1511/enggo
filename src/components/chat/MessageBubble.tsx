"use client";

import { useState } from "react";
import {
  BarChart3,
  Download,
  File as FileIcon,
  Reply as ReplyIcon,
  Smile,
  Undo2,
} from "lucide-react";
import type { ApiChatMessage } from "@/lib/api/types";
import { formatTimeOnly } from "@/lib/format-time";
import { cn } from "@/lib/utils";
import { EmojiPickerPopover } from "./EmojiPickerPopover";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

type MessageBubbleProps = {
  message: ApiChatMessage;
  isMine: boolean;
  onVote: (pollId: string, optionId: string) => void;
  onReact: (messageId: string, emoji: string) => void;
  onRemoveReaction: (messageId: string) => void;
  onReply: (message: ApiChatMessage) => void;
  onRecall: (messageId: string) => Promise<void>;
};

// Render theo tung MessageType - IMAGE/GIF/FILE/VOICE dung attachment* field,
// POLL dung quan he `poll` (vote qua onVote, cap nhat real-time qua
// "chat:poll-update" socket - xem MessagesShell.tsx). Anh/GIF dung <img> thuong
// (khong phai next/image) vi host la S3 bucket cua tung nguoi dung/CDN Giphy -
// khong the allowlist tinh trong next.config. Hover vao 1 tin nhan hien toolbar
// React/Reply(/Thu hoi neu la tin cua minh) - reaction hien thanh pill duoi
// bubble, reply hien quote-block trong bubble.
export function MessageBubble({
  message,
  isMine,
  onVote,
  onReact,
  onRemoveReaction,
  onReply,
  onRecall,
}: MessageBubbleProps) {
  const align = isMine ? "justify-end" : "justify-start";
  const bubbleTone = isMine
    ? "rounded-br-md text-white"
    : "rounded-bl-md bg-[#f0f1f3] text-[#182338]";
  const bubbleStyle = isMine ? { background: "var(--primary)" } : undefined;

  if (message.isRecalled) {
    return (
      <div className={`mb-4 flex ${align}`}>
        <div className="max-w-[72%] rounded-2xl border border-dashed border-slate-300 px-4 py-2.5 text-[13px] italic text-slate-400">
          Tin nhắn đã được thu hồi
        </div>
      </div>
    );
  }

  let bubbleContent: React.ReactNode;

  if (message.type === "IMAGE" || message.type === "GIF") {
    bubbleContent = (
      <div
        className={`overflow-hidden rounded-2xl ${isMine ? "rounded-br-md" : "rounded-bl-md"}`}
      >
        {message.replyTo && (
          <div className="p-2 pb-0">
            <ReplyQuoteBlock replyTo={message.replyTo} tone="light" />
          </div>
        )}
        {message.attachmentUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- host dong (S3 bucket cua user / CDN Giphy), khong allowlist tinh duoc
          <img
            src={message.attachmentUrl}
            alt={message.attachmentName ?? "Hình ảnh"}
            className="block max-h-90 w-full object-cover"
          />
        )}
        {message.content && (
          <div
            className={`px-4 py-2 text-[14px] ${isMine ? "text-white" : "text-[#182338]"}`}
            style={
              isMine ? { background: "var(--primary)" } : { background: "#f0f1f3" }
            }
          >
            {message.content}
          </div>
        )}
        <div className="px-1 pt-1 text-right text-[11px] text-slate-500">
          {formatTimeOnly(message.createdAt)}
        </div>
      </div>
    );
  } else if (message.type === "FILE") {
    bubbleContent = (
      <div className={`rounded-2xl ${bubbleTone}`} style={bubbleStyle}>
        {message.replyTo && (
          <div className="px-3 pt-2.5">
            <ReplyQuoteBlock replyTo={message.replyTo} tone="light" />
          </div>
        )}
        <a
          href={message.attachmentUrl ?? undefined}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-4 py-3"
        >
          <FileIcon size={26} className="shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-semibold">
              {message.attachmentName ?? "Tệp đính kèm"}
            </p>
            {message.attachmentSize != null && (
              <p
                className={`text-[12px] ${isMine ? "text-white/70" : "text-slate-500"}`}
              >
                {formatBytes(message.attachmentSize)}
              </p>
            )}
          </div>
          <Download size={16} className="shrink-0" />
        </a>
      </div>
    );
  } else if (message.type === "VOICE") {
    bubbleContent = (
      <div className={`rounded-2xl ${bubbleTone}`} style={bubbleStyle}>
        {message.replyTo && (
          <div className="px-3 pt-2.5">
            <ReplyQuoteBlock replyTo={message.replyTo} tone="light" />
          </div>
        )}
        <div className="flex items-center gap-3 px-4 py-3">
          <audio
            controls
            src={message.attachmentUrl ?? undefined}
            className="h-9 max-w-55"
          />
          {message.durationSeconds != null && (
            <span
              className={`shrink-0 text-[12px] ${isMine ? "text-white/80" : "text-slate-500"}`}
            >
              {formatDuration(message.durationSeconds)}
            </span>
          )}
        </div>
      </div>
    );
  } else if (message.type === "POLL" && message.poll) {
    const poll = message.poll;
    bubbleContent = (
      <div className="w-[320px] rounded-2xl border border-slate-200 bg-white px-4 py-3.5">
        {message.replyTo && (
          <div className="mb-2.5">
            <ReplyQuoteBlock replyTo={message.replyTo} tone="light" />
          </div>
        )}
        <div className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-[#182338]">
          <BarChart3 size={15} style={{ color: "var(--primary)" }} />
          {poll.question}
        </div>
        <div className="flex flex-col gap-2">
          {poll.options.map((option) => {
            const pct =
              poll.totalVotes > 0
                ? Math.round((option.voteCount / poll.totalVotes) * 100)
                : 0;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onVote(poll.id, option.id)}
                className="relative w-full cursor-pointer overflow-hidden rounded-lg border border-slate-200 px-3 py-2 text-left text-[13px] transition-colors duration-150 ease-out hover:border-slate-300"
              >
                <div
                  className="absolute inset-y-0 left-0 transition-all duration-300 ease-out"
                  style={{
                    width: `${pct}%`,
                    background: option.votedByMe
                      ? "color-mix(in srgb, var(--primary) 18%, white)"
                      : "#f4f4f5",
                  }}
                />
                <div className="relative flex items-center justify-between gap-2">
                  <span
                    className={option.votedByMe ? "font-semibold" : undefined}
                    style={option.votedByMe ? { color: "var(--primary)" } : undefined}
                  >
                    {option.text}
                  </span>
                  <span className="shrink-0 text-slate-500">{option.voteCount}</span>
                </div>
              </button>
            );
          })}
        </div>
        <p className="mt-2.5 text-[11px] text-slate-500">
          {poll.totalVotes} lượt bình chọn
        </p>
      </div>
    );
  } else {
    bubbleContent = (
      <div
        className={`rounded-2xl px-5 py-3 text-[15px] leading-6 ${bubbleTone}`}
        style={bubbleStyle}
      >
        {message.replyTo && (
          <div className="mb-1.5">
            <ReplyQuoteBlock
              replyTo={message.replyTo}
              tone={isMine ? "colored" : "light"}
            />
          </div>
        )}
        {message.content}
        <div
          className={`mt-1.5 text-right text-[11px] ${isMine ? "text-white/70" : "text-slate-500"}`}
        >
          {formatTimeOnly(message.createdAt)}
        </div>
      </div>
    );
  }

  return (
    <div className={`mb-4 flex flex-col ${isMine ? "items-end" : "items-start"}`}>
      <div className={`group flex items-end gap-1.5 ${align}`}>
        {!isMine && (
          <MessageHoverActions
            isMine={isMine}
            onReact={(emoji) => onReact(message.id, emoji)}
            onReply={() => onReply(message)}
            onRecall={() => onRecall(message.id)}
          />
        )}
        <div className="max-w-[72%]">{bubbleContent}</div>
        {isMine && (
          <MessageHoverActions
            isMine={isMine}
            onReact={(emoji) => onReact(message.id, emoji)}
            onReply={() => onReply(message)}
            onRecall={() => onRecall(message.id)}
          />
        )}
      </div>
      {message.reactions.length > 0 && (
        <div className={`mt-1 flex flex-wrap gap-1 ${align}`}>
          {message.reactions.map((r) => (
            <button
              key={r.emoji}
              type="button"
              onClick={() =>
                r.reactedByMe ? onRemoveReaction(message.id) : onReact(message.id, r.emoji)
              }
              className={cn(
                "flex cursor-pointer items-center gap-1 rounded-full border px-2 py-0.5 text-[12px] transition-colors duration-150 ease-out",
                r.reactedByMe
                  ? "border-primary bg-primary/10"
                  : "border-slate-200 bg-white hover:bg-slate-50",
              )}
            >
              <span>{r.emoji}</span>
              <span className="text-slate-500">{r.count}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ReplyQuoteBlock({
  replyTo,
  tone,
}: {
  replyTo: NonNullable<ApiChatMessage["replyTo"]>;
  tone: "colored" | "light";
}) {
  return (
    <div
      className={cn(
        "mb-1 truncate rounded-lg border-l-2 px-2 py-1 text-[12px]",
        tone === "colored"
          ? "border-white/50 bg-white/10 text-white/80"
          : "border-slate-300 bg-slate-100 text-slate-500",
      )}
    >
      {replyTo.preview || "..."}
    </div>
  );
}

function MessageHoverActions({
  isMine,
  onReact,
  onReply,
  onRecall,
}: {
  isMine: boolean;
  onReact: (emoji: string) => void;
  onReply: () => void;
  onRecall: () => Promise<void>;
}) {
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [confirmRecallOpen, setConfirmRecallOpen] = useState(false);

  return (
    <>
      <div className="mb-1 flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100">
        <PopoverRoot open={emojiOpen} onOpenChange={setEmojiOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              title="Thả cảm xúc"
              className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-full bg-white text-slate-500 shadow-[0_1px_4px_rgba(15,23,42,.12)] transition-colors duration-150 ease-out hover:bg-slate-50"
            >
              <Smile size={14} />
            </button>
          </PopoverTrigger>
          <PopoverContent open={emojiOpen} align="center" sideOffset={8}>
            <EmojiPickerPopover
              onSelect={(emoji) => {
                onReact(emoji);
                setEmojiOpen(false);
              }}
            />
          </PopoverContent>
        </PopoverRoot>

        <button
          type="button"
          title="Trả lời"
          onClick={onReply}
          className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-full bg-white text-slate-500 shadow-[0_1px_4px_rgba(15,23,42,.12)] transition-colors duration-150 ease-out hover:bg-slate-50"
        >
          <ReplyIcon size={14} />
        </button>

        {isMine && (
          <button
            type="button"
            title="Thu hồi"
            onClick={() => setConfirmRecallOpen(true)}
            className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-full bg-white text-slate-500 shadow-[0_1px_4px_rgba(15,23,42,.12)] transition-colors duration-150 ease-out hover:bg-red-50 hover:text-danger"
          >
            <Undo2 size={14} />
          </button>
        )}
      </div>

      {isMine && (
        <ConfirmModal
          open={confirmRecallOpen}
          onOpenChange={setConfirmRecallOpen}
          title="Thu hồi tin nhắn?"
          description="Tin nhắn sẽ bị thu hồi với cả 2 phía, không thể hoàn tác."
          confirmLabel="Thu hồi"
          danger
          onConfirm={onRecall}
        />
      )}
    </>
  );
}
