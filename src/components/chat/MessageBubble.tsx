"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BarChart3, Download, File as FileIcon, Phone, User, Video } from "lucide-react";
import type { ApiChatMessage, ApiConversationUser } from "@/lib/api/types";
import { formatTimeOnly } from "@/lib/format-time";
import { cn } from "@/lib/utils";
import { PopoverRoot, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { ConversationAvatar } from "./ConversationAvatar";
import { MessageActions } from "./MessageActions";
import { MessageReaction } from "./MessageReaction";
import { MessageReplyPreview } from "./MessageReplyPreview";

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
  myId: string | undefined;
  // TAT CA thanh vien KHAC minh trong hoi thoai - 1-1 co 1 phan tu (tuong
  // duong otherUser cu), nhom co N phan tu. Nguoi gui THAT cua tung tin nhan
  // duoc tra cuu rieng theo senderId (xem `sender`/`replySenderName` ben
  // duoi) - KHONG dung 1 nguoi co dinh cho ca hoi thoai (sai voi nhom nhieu
  // nguoi, tin cua ai cung bi gan nham thanh 1 nguoi).
  participants: ApiConversationUser[];
  // Nhom tin nhan lien tiep CUNG nguoi gui (xem groupMessages() trong
  // MessagesShell.tsx) - isLastInGroup quyet dinh co hien avatar/bo goc bubble
  // "duoi" hay khong, isFirstInGroup CHI dung de giam khoang cach voi tin
  // TRUOC no trong CUNG 1 nhom (margin nho hon giua cac group).
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
  highlighted: boolean;
  onVote: (pollId: string, optionId: string) => void;
  onReact: (messageId: string, emoji: string) => void;
  onRemoveReaction: (messageId: string) => void;
  onReply: (message: ApiChatMessage) => void;
  onRecall: (messageId: string) => Promise<void>;
  onJumpToMessage: (messageId: string) => void;
};

// Render theo tung MessageType - IMAGE/GIF/FILE/VOICE dung attachment* field,
// POLL dung quan he `poll` (vote qua onVote, cap nhat real-time qua
// "chat:poll-update" socket - xem MessagesShell.tsx). Anh/GIF dung <img> thuong
// (khong phai next/image) vi host la S3 bucket cua tung nguoi dung/CDN Giphy -
// khong the allowlist tinh trong next.config. Hover vao BUBBLE (khong phai
// avatar) hien toolbar React/Reply/More (xem MessageActions.tsx) - reaction
// hien thanh pill duoi bubble, reply hien quote-block co the bam de nhay ve
// tin nhan goc. Bam avatar (chi ben nguoi kia, tin cua minh khong co avatar)
// mo popover: link trang ca nhan (that) + Goi thoai/Goi video (disabled,
// "Sắp có" - chua co he thong goi that dang sau).
export function MessageBubble({
  message,
  isMine,
  myId,
  participants,
  isFirstInGroup,
  isLastInGroup,
  highlighted,
  onVote,
  onReact,
  onRemoveReaction,
  onReply,
  onRecall,
  onJumpToMessage,
}: MessageBubbleProps) {
  const [avatarPopoverOpen, setAvatarPopoverOpen] = useState(false);
  const align = isMine ? "justify-end" : "justify-start";
  // Nguoi gui THAT cua tin nhan nay (chi can khi !isMine - dung de hien
  // avatar/ten/popover). Nguoi gui cua tin DUOC REPLY co the la NGUOI KHAC
  // (vd A reply tin cua B trong 1 nhom 3 nguoi) nen tra cuu rieng.
  const sender = participants.find((p) => p.id === message.senderId);
  const replySenderName = message.replyTo
    ? participants.find((p) => p.id === message.replyTo!.senderId)?.name
    : undefined;
  // Chi bo goc "duoi" (rounded-*-md) o bubble CUOI CUNG cua 1 nhom - cac tin
  // giua nhom giu goc tron deu ca 4 canh, doc thanh 1 khoi lien mach hon
  // (kieu grouping pho bien cua chat app hien dai) thay vi moi tin deu co
  // "duoi" rieng.
  const tailClass = isLastInGroup
    ? isMine
      ? "rounded-br-md"
      : "rounded-bl-md"
    : "";
  const bubbleTone = cn(
    "rounded-2xl",
    tailClass,
    isMine
      ? "text-white"
      : "bg-white text-[#182338] shadow-[0_1px_3px_rgba(15,23,42,.08)]",
  );
  const bubbleStyle = isMine ? { background: "var(--primary)" } : undefined;
  const canCopy = message.type === "TEXT" && !!message.content && !message.isRecalled;

  function handleCopy() {
    if (message.content) void navigator.clipboard.writeText(message.content);
  }

  let bubbleContent: React.ReactNode;

  if (message.isRecalled) {
    bubbleContent = (
      <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-2.5 text-[13px] italic text-slate-400">
        Tin nhắn đã được thu hồi
      </div>
    );
  } else if (message.type === "IMAGE" || message.type === "GIF") {
    bubbleContent = (
      <div
        className={cn(
          "overflow-hidden rounded-2xl",
          tailClass,
          !isMine && "shadow-[0_1px_3px_rgba(15,23,42,.08)]",
        )}
      >
        {message.replyTo && (
          <div className="p-2 pb-0">
            <MessageReplyPreview
              replyTo={message.replyTo}
              myId={myId}
              senderName={replySenderName}
              tone="light"
              onJump={() => onJumpToMessage(message.replyTo!.id)}
            />
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
            style={isMine ? { background: "var(--primary)" } : { background: "#ffffff" }}
          >
            {message.content}
          </div>
        )}
        <div className="px-1 pt-1 text-right text-[11px] text-slate-400">
          {formatTimeOnly(message.createdAt)}
        </div>
      </div>
    );
  } else if (message.type === "FILE") {
    bubbleContent = (
      <div className={bubbleTone} style={bubbleStyle}>
        {message.replyTo && (
          <div className="px-3 pt-2.5">
            <MessageReplyPreview
              replyTo={message.replyTo}
              myId={myId}
              senderName={replySenderName}
              tone="light"
              onJump={() => onJumpToMessage(message.replyTo!.id)}
            />
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
              <p className={`text-[12px] ${isMine ? "text-white/70" : "text-slate-500"}`}>
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
      <div className={bubbleTone} style={bubbleStyle}>
        {message.replyTo && (
          <div className="px-3 pt-2.5">
            <MessageReplyPreview
              replyTo={message.replyTo}
              myId={myId}
              senderName={replySenderName}
              tone="light"
              onJump={() => onJumpToMessage(message.replyTo!.id)}
            />
          </div>
        )}
        <div className="flex items-center gap-3 px-4 py-3">
          <audio controls src={message.attachmentUrl ?? undefined} className="h-9 max-w-55" />
          {message.durationSeconds != null && (
            <span className={`shrink-0 text-[12px] ${isMine ? "text-white/80" : "text-slate-500"}`}>
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
            <MessageReplyPreview
              replyTo={message.replyTo}
              myId={myId}
              senderName={replySenderName}
              tone="light"
              onJump={() => onJumpToMessage(message.replyTo!.id)}
            />
          </div>
        )}
        <div className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-[#182338]">
          <BarChart3 size={15} style={{ color: "var(--primary)" }} />
          {poll.question}
        </div>
        <div className="flex flex-col gap-2">
          {poll.options.map((option) => {
            const pct = poll.totalVotes > 0 ? Math.round((option.voteCount / poll.totalVotes) * 100) : 0;
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
        <p className="mt-2.5 text-[11px] text-slate-500">{poll.totalVotes} lượt bình chọn</p>
      </div>
    );
  } else {
    bubbleContent = (
      <div className={cn(bubbleTone, "px-4 py-2.5 text-[14.5px] leading-6")} style={bubbleStyle}>
        {message.replyTo && (
          <MessageReplyPreview
            replyTo={message.replyTo}
            myId={myId}
            senderName={replySenderName}
            tone={isMine ? "colored" : "light"}
            onJump={() => onJumpToMessage(message.replyTo!.id)}
          />
        )}
        {message.content}
        <div className={cn("mt-1 flex items-center justify-end gap-1 text-[10.5px]", isMine ? "text-white/70" : "text-slate-400")}>
          {formatTimeOnly(message.createdAt)}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      id={`msg-${message.id}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={cn(
        "flex flex-col",
        isMine ? "items-end" : "items-start",
        isFirstInGroup ? "mt-3" : "mt-0.5",
      )}
    >
      <div className={cn("flex items-end gap-2", align)}>
        {!isMine && (
          <div className="w-8.5 shrink-0 self-start">
            {isFirstInGroup && (
              <PopoverRoot open={avatarPopoverOpen} onOpenChange={setAvatarPopoverOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="cursor-pointer rounded-full"
                    title={sender?.name}
                  >
                    <ConversationAvatar
                      name={sender?.name}
                      avatarUrl={sender?.avatarUrl}
                      online={sender?.online}
                      size={34}
                    />
                  </button>
                </PopoverTrigger>
                <PopoverContent open={avatarPopoverOpen} align="start" sideOffset={8}>
                  <div className="w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_8px_28px_rgba(15,23,42,.12)]">
                    {sender?.username && (
                      <Link
                        href={`/u/${sender.username}`}
                        onClick={() => setAvatarPopoverOpen(false)}
                        className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium text-[#182338] hover:bg-slate-50"
                      >
                        <User size={14} className="shrink-0 text-slate-500" />
                        Trang cá nhân của {sender.name}
                      </Link>
                    )}
                    <button
                      type="button"
                      disabled
                      title="Sắp có"
                      className="flex w-full cursor-not-allowed items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium text-slate-300"
                    >
                      <Phone size={14} className="shrink-0" />
                      Gọi thoại
                    </button>
                    <button
                      type="button"
                      disabled
                      title="Sắp có"
                      className="flex w-full cursor-not-allowed items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium text-slate-300"
                    >
                      <Video size={14} className="shrink-0" />
                      Gọi video
                    </button>
                  </div>
                </PopoverContent>
              </PopoverRoot>
            )}
          </div>
        )}

        {/* Toolbar dat ABSOLUTE ben trong wrapper "relative group" nay - noi
            RIENG khong chiem cho trong flex row nua (truoc day la 1 flex
            sibling, xuat hien/bien mat luc hover lam bubble bi doi vi tri) -
            nam o phia NGUOC voi huong bubble (bubble cua minh o phai ->
            toolbar troi sang trai vao khoang trong, bubble cua nguoi kia o
            trai -> toolbar troi sang phai), dung right-full/left-full (100%
            tinh tu canh cua chinh wrapper nay) de luon bam sat NGOAI bubble
            bat ke bubble rong hay hep. `group` dat O DAY (khong phai o hang
            ngoai cung) de CHI hover vao bubble moi hien toolbar - hover vao
            avatar (gio la nut mo popover rieng) KHONG lam toolbar hien theo. */}
        <div
          className={cn(
            "group relative max-w-[85%] transition-shadow duration-300 sm:max-w-120",
            highlighted && "rounded-2xl ring-2 ring-offset-2",
          )}
          style={highlighted ? ({ "--tw-ring-color": "var(--primary)" } as React.CSSProperties) : undefined}
        >
          {bubbleContent}
          <div
            className={cn(
              "absolute top-1/2 z-10 -translate-y-1/2",
              isMine ? "right-full mr-2" : "left-full ml-2",
            )}
          >
            <MessageActions
              isMine={isMine}
              canCopy={canCopy}
              onReact={(emoji) => onReact(message.id, emoji)}
              onReply={() => onReply(message)}
              onCopy={handleCopy}
              onRecall={() => onRecall(message.id)}
            />
          </div>
        </div>
      </div>

      <div className={cn(!isMine && "pl-10.5")}>
        <MessageReaction
          reactions={message.reactions}
          align={align}
          onToggle={(emoji, reactedByMe) =>
            reactedByMe ? onRemoveReaction(message.id) : onReact(message.id, emoji)
          }
        />
      </div>
    </motion.div>
  );
}
