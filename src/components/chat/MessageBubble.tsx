"use client";

import { BarChart3, Download, File as FileIcon } from "lucide-react";
import type { ApiChatMessage } from "@/lib/api/types";
import { formatTimeOnly } from "@/lib/format-time";

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

// Render theo tung MessageType - IMAGE/GIF/FILE/VOICE dung attachment* field,
// POLL dung quan he `poll` (vote qua onVote, cap nhat real-time qua
// "chat:poll-update" socket - xem MessagesShell.tsx). Anh/GIF dung <img> thuong
// (khong phai next/image) vi host la S3 bucket cua tung nguoi dung/CDN Giphy -
// khong the allowlist tinh trong next.config.
export function MessageBubble({
  message,
  isMine,
  onVote,
}: {
  message: ApiChatMessage;
  isMine: boolean;
  onVote: (pollId: string, optionId: string) => void;
}) {
  const align = isMine ? "justify-end" : "justify-start";
  const bubbleTone = isMine
    ? "rounded-br-md text-white"
    : "rounded-bl-md bg-[#f0f1f3] text-[#182338]";
  const bubbleStyle = isMine ? { background: "var(--primary)" } : undefined;

  if (message.type === "IMAGE" || message.type === "GIF") {
    return (
      <div className={`mb-4 flex ${align}`}>
        <div
          className={`max-w-[72%] overflow-hidden rounded-2xl ${isMine ? "rounded-br-md" : "rounded-bl-md"}`}
        >
          {message.attachmentUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- host dong (S3 bucket cua user / CDN Giphy), khong allowlist tinh duoc
            <img
              src={message.attachmentUrl}
              alt={message.attachmentName ?? "Hình ảnh"}
              className="block max-h-[360px] w-full object-cover"
            />
          )}
          {message.content && (
            <div
              className={`px-4 py-2 text-[14px] ${isMine ? "text-white" : "text-[#182338]"}`}
              style={isMine ? { background: "var(--primary)" } : { background: "#f0f1f3" }}
            >
              {message.content}
            </div>
          )}
          <div className="px-1 pt-1 text-right text-[11px] text-slate-500">
            {formatTimeOnly(message.createdAt)}
          </div>
        </div>
      </div>
    );
  }

  if (message.type === "FILE") {
    return (
      <div className={`mb-4 flex ${align}`}>
        <a
          href={message.attachmentUrl ?? undefined}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex max-w-[72%] items-center gap-3 rounded-2xl px-4 py-3 ${bubbleTone}`}
          style={bubbleStyle}
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
  }

  if (message.type === "VOICE") {
    return (
      <div className={`mb-4 flex ${align}`}>
        <div
          className={`flex max-w-[72%] items-center gap-3 rounded-2xl px-4 py-3 ${bubbleTone}`}
          style={bubbleStyle}
        >
          <audio controls src={message.attachmentUrl ?? undefined} className="h-9 max-w-[220px]" />
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
  }

  if (message.type === "POLL" && message.poll) {
    const poll = message.poll;
    return (
      <div className={`mb-4 flex ${align}`}>
        <div className="w-[320px] rounded-2xl border border-slate-200 bg-white px-4 py-3.5">
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
      </div>
    );
  }

  return (
    <div className={`mb-4 flex ${align}`}>
      <div className={`max-w-[72%] rounded-2xl px-5 py-3 text-[15px] leading-6 ${bubbleTone}`} style={bubbleStyle}>
        {message.content}
        <div
          className={`mt-1.5 text-right text-[11px] ${isMine ? "text-white/70" : "text-slate-500"}`}
        >
          {formatTimeOnly(message.createdAt)}
        </div>
      </div>
    </div>
  );
}
