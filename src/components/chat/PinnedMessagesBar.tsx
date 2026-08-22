"use client";

import { useState } from "react";
import { ChevronRight, Pin } from "lucide-react";
import type { ApiChatMessage, ApiConversationUser } from "@/lib/api/types";
import { formatMessagePreview } from "@/lib/chat-message-preview";
import { formatTimeOnly } from "@/lib/format-time";
import { ConversationAvatar } from "./ConversationAvatar";

// Thanh tin nhan ghim - luon hien duoi header (khong chiem nhieu dien tich)
// khi hoi thoai co >=1 tin da ghim (xem MessagesShell.tsx - pinnedMessages).
// Nhieu tin ghim thi cycle qua nut mui ten (1/N), bam vao noi dung se nhay +
// highlight tin nhan goc (tai su dung handleJumpToMessage co san, dung cho
// ca reply-preview-click-to-jump).
export function PinnedMessagesBar({
  pinnedMessages,
  participants,
  myId,
  onJumpToMessage,
}: {
  pinnedMessages: ApiChatMessage[];
  participants: ApiConversationUser[];
  myId: string | undefined;
  onJumpToMessage: (messageId: string) => void;
}) {
  const [index, setIndex] = useState(0);
  if (pinnedMessages.length === 0) return null;
  const clampedIndex = Math.min(index, pinnedMessages.length - 1);
  const current = pinnedMessages[clampedIndex];
  const isMine = current.senderId === myId;
  const sender = isMine
    ? undefined
    : participants.find((p) => p.id === current.senderId);
  const senderName = isMine ? "Bạn" : (sender?.name ?? "Người dùng");

  return (
    <div className="relative z-10 flex items-center gap-3 border-b border-slate-100 bg-primary/6 px-5 py-2.5">
      <Pin size={15} className="shrink-0 text-primary" fill="currentColor" />
      <button
        type="button"
        onClick={() => onJumpToMessage(current.id)}
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 text-left"
      >
        <ConversationAvatar name={senderName} avatarUrl={sender?.avatarUrl} size={28} />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 truncate text-[12.5px] font-semibold text-[#182338]">
            {senderName}
            {current.pinnedAt && (
              <span className="shrink-0 font-normal text-slate-400">
                · Ghim lúc {formatTimeOnly(current.pinnedAt)}
              </span>
            )}
          </p>
          <p className="truncate text-[12.5px] text-slate-500">
            {formatMessagePreview(current)}
          </p>
        </div>
      </button>
      {pinnedMessages.length > 1 && (
        <div className="flex shrink-0 items-center gap-1.5 text-[11px] font-medium text-slate-400">
          <span>
            {clampedIndex + 1}/{pinnedMessages.length}
          </span>
          <button
            type="button"
            title="Tin ghim tiếp theo"
            onClick={() => setIndex((i) => (i + 1) % pinnedMessages.length)}
            className="grid size-6 shrink-0 cursor-pointer place-items-center rounded-full text-slate-500 transition-colors duration-150 ease-out hover:bg-slate-100 hover:text-[#182338]"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
