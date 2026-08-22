"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BarChart3,
  Download,
  File as FileIcon,
  LoaderCircle,
  Phone,
  Pin,
  User,
  Video,
} from "lucide-react";
import type { ApiChatMessage, ApiConversationUser } from "@/lib/api/types";
import { formatTimeOnly } from "@/lib/format-time";
import { cn } from "@/lib/utils";
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { ConversationAvatar } from "./ConversationAvatar";
import { MessageActions } from "./MessageActions";
import { MessageReaction } from "./MessageReaction";
import { MessageReplyPreview } from "./MessageReplyPreview";
import {
  getBubbleAppearance,
  type ImmersiveTheme,
} from "./chat-immersive-themes";

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
  onTogglePin: (messageId: string, currentlyPinned: boolean) => void;
  // Khung canh + mau bubble - lua chon CHUNG cho ca app (xem
  // chat-immersive-themes.ts/MessagesShell.tsx), khong rieng tung nguoi
  // gui/hoi thoai.
  theme: ImmersiveTheme;
  // Chi hien TEN nguoi gui phia tren tin dau 1 nhom (!isMine) khi day la
  // nhom (>2 nguoi) - hoi thoai 1-1 khong can vi qua ro ai la "nguoi kia".
  isGroup: boolean;
  // Poll cua tin nay dang cho phan hoi optimistic tu onVote (xem
  // MessagesShell.tsx) - disable thao tac vote them + hien spinner, tranh
  // bam lien tuc gay optimistic-state chong cheo nhau.
  isVoting: boolean;
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
  onTogglePin,
  theme,
  isGroup,
  isVoting,
}: MessageBubbleProps) {
  const [avatarPopoverOpen, setAvatarPopoverOpen] = useState(false);

  const [pendingOptionId, setPendingOptionId] = useState<string | null>(null);

  if (message.type === "SYSTEM") {
    return (
      <div className="my-3 flex justify-center">
        <span className="rounded-full bg-slate-100 px-3.5 py-1.5 text-[12px] text-slate-500">
          {message.content}
        </span>
      </div>
    );
  }

  const align = isMine ? "justify-end" : "justify-start";

  const sender = participants.find((p) => p.id === message.senderId);
  const replySenderName = message.replyTo
    ? participants.find((p) => p.id === message.replyTo!.senderId)?.name
    : undefined;
  // Bo goc phia avatar - tin DAU nhom bo goc TREN (gan avatar/ten), tin CUOI
  // nhom bo goc DUOI (gan cho tro toi avatar), ca 2 CUNG 1 phia voi isMine
  // (minh: phia phai, nguoi khac: phia trai). Tin GIUA nhom (khong dau khong
  // cuoi) giu tron deu ca 4 goc. Tin DUY NHAT trong 1 "nhom" 1 tin (vua dau
  // vua cuoi) bi bo CA 2 goc cung phia - tao thanh 1 canh thang doc ben canh
  // avatar, kieu grouping pho bien cua chat app hien dai.
  const tailClass = cn(
    isFirstInGroup && (isMine ? "rounded-tr-md" : "rounded-tl-md"),
    isLastInGroup && (isMine ? "rounded-br-md" : "rounded-bl-md"),
  );
  const bubbleAppearance = getBubbleAppearance(theme, isMine);
  const bubbleTone = cn(
    "rounded-2xl border border-[2px]",
    tailClass,
    bubbleAppearance.className,
  );
  const bubbleStyle = bubbleAppearance.style;
  const canCopy =
    message.type === "TEXT" && !!message.content && !message.isRecalled;

  function handleCopy() {
    if (message.content) void navigator.clipboard.writeText(message.content);
  }

  let bubbleContent: React.ReactNode;

  if (message.isRecalled) {
    bubbleContent = (
      <div className="rounded-b-2xl border border-dashed border-slate-300 px-4 py-2.5 text-[13px] italic text-slate-400">
        Tin nhắn đã được thu hồi
      </div>
    );
  } else if (message.type === "IMAGE" || message.type === "GIF") {
    // Anh/GIF KHONG can style "hop chat" (border/bong do/goc vat theo nhom)
    // nhu tin van ban - chi la 1 tam anh doc lap, luon bo tron deu 4 goc bat
    // ke vi tri trong nhom (khong dung tailClass) va khong border/shadow gia
    // lam no trong nhu 1 the/card. Gio hien luc goc anh (overlay, khong
    // chiem rieng 1 dong footer nhu truoc) - CHI khi khong co caption; co
    // caption thi gio nam duoi caption nhu binh thuong (khong the bo vao anh
    // duoc vi caption co the dai/xuong dong).
    bubbleContent = (
      <div className="overflow-hidden rounded-2xl">
        {message.replyTo && (
          <div className="pb-2">
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
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element -- host dong (S3 bucket cua user / CDN Giphy), khong allowlist tinh duoc */}
            <img
              src={message.attachmentUrl}
              alt={message.attachmentName ?? "Hình ảnh"}
              className="block max-h-90 w-full rounded-2xl object-cover"
            />
            {!message.content && (
              <span className="absolute right-1.5 bottom-1.5 rounded-full bg-black/45 px-1.5 py-0.5 text-[10px] text-white">
                {formatTimeOnly(message.createdAt)}
              </span>
            )}
          </div>
        )}
        {message.content && (
          <>
            <div className="px-1 pt-1.5 text-[14px] text-ink">
              {message.content}
            </div>
            <div className="px-1 pt-1 text-right text-[11px] text-slate-400">
              {formatTimeOnly(message.createdAt)}
            </div>
          </>
        )}
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
              <p
                className={`text-[12px] ${isMine ? (theme.outgoingIsLight ? "opacity-70" : "text-white/70") : "text-slate-500"}`}
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
          <audio
            controls
            src={message.attachmentUrl ?? undefined}
            className="h-9 max-w-55"
          />
          {message.durationSeconds != null && (
            <span
              className={`shrink-0 text-[12px] ${isMine ? (theme.outgoingIsLight ? "opacity-70" : "text-white/80") : "text-slate-500"}`}
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
      <div className="w-[320px] rounded-b-2xl border border-slate-200 bg-white px-4 py-3.5">
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
        <div
          className={cn(
            "flex flex-col gap-2 transition-opacity duration-150 ease-out",
            isVoting && "opacity-70",
          )}
        >
          {poll.options.map((option) => {
            const pct =
              poll.totalVotes > 0
                ? Math.round((option.voteCount / poll.totalVotes) * 100)
                : 0;
            // Dang cho phan hoi THAT cho DUNG option nay - dung tam o 80%
            // muc tieu (xem khai bao pendingOptionId o tren), chay not phan
            // con lai khi isVoting het (component re-render voi pct THAT).
            const pending = isVoting && option.id === pendingOptionId;
            const displayPct = pending ? Math.round(pct * 0.8) : pct;
            // Thanh da "day" that su (khong con o doan cho 80%) - moi cho
            // hieu ung song chay, tranh song nhap nhem trong luc con dang
            // chay len.
            const settled = option.votedByMe && !pending;
            return (
              <button
                key={option.id}
                type="button"
                disabled={isVoting}
                onClick={() => {
                  setPendingOptionId(option.id);
                  onVote(poll.id, option.id);
                }}
                className="relative w-full overflow-hidden rounded-lg border border-slate-200 px-3 py-2 text-left text-[13px] transition-colors duration-150 ease-out enabled:cursor-pointer enabled:hover:border-slate-300 disabled:cursor-not-allowed"
              >
                <div
                  className={cn(
                    "absolute inset-y-0 left-0 transition-all duration-300 ease-out",
                    settled && "poll-wave",
                  )}
                  style={{
                    width: `${displayPct}%`,
                    background: option.votedByMe
                      ? "color-mix(in srgb, var(--primary) 38%, white)"
                      : "#f4f4f5",
                  }}
                />
                <div className="relative flex items-center justify-between gap-2">
                  <span
                    className={option.votedByMe ? "font-semibold" : undefined}
                    style={
                      option.votedByMe ? { color: "var(--primary)" } : undefined
                    }
                  >
                    {option.text}
                  </span>
                  <span className="shrink-0 text-slate-500">
                    {option.voteCount}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
        <p className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-500">
          {isVoting && <LoaderCircle size={11} className="animate-spin" />}
          {isVoting
            ? "Đang gửi bình chọn..."
            : `${poll.totalVotes} lượt bình chọn`}
        </p>
      </div>
    );
  } else {
    bubbleContent = (
      <div
        className={cn(
          bubbleTone,
          "px-4 py-2.5 text-[16px] font-medium leading-6",
        )}
        style={bubbleStyle}
      >
        {message.replyTo && (
          <MessageReplyPreview
            replyTo={message.replyTo}
            myId={myId}
            senderName={replySenderName}
            tone={isMine && !theme.outgoingIsLight ? "colored" : "light"}
            onJump={() => onJumpToMessage(message.replyTo!.id)}
          />
        )}
        {message.content}
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
      {isGroup && !isMine && isFirstInGroup && sender?.name && (
        <p className="mb-0.5 pl-10.5 text-[12px] font-medium text-black/80 font-semibold">
          {sender.name}
        </p>
      )}
      <div className={cn("flex items-end gap-2", align)}>
        {!isMine && (
          <div className="w-8.5 shrink-0 self-start">
            {isFirstInGroup && (
              <PopoverRoot
                open={avatarPopoverOpen}
                onOpenChange={setAvatarPopoverOpen}
              >
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
                <PopoverContent
                  open={avatarPopoverOpen}
                  align="start"
                  sideOffset={8}
                >
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
          style={
            highlighted
              ? ({ "--tw-ring-color": "var(--primary)" } as React.CSSProperties)
              : undefined
          }
        >
          {bubbleContent}
          {message.isPinned && (
            <span
              title="Đã ghim"
              className="absolute top-1.5 right-1.5 z-10 grid size-4 place-items-center rounded-full border border-slate-100 bg-white text-primary shadow-sm"
            >
              <Pin size={9} fill="currentColor" />
            </span>
          )}
          <div
            className={cn(
              "absolute top-1/2 z-10 -translate-y-1/2",
              isMine ? "right-full mr-2" : "left-full ml-2",
            )}
          >
            <MessageActions
              isMine={isMine}
              canCopy={canCopy}
              isPinned={message.isPinned}
              activeEmoji={message.reactions.find((r) => r.reactedByMe)?.emoji}
              onReact={(emoji) => onReact(message.id, emoji)}
              onRemoveReaction={() => onRemoveReaction(message.id)}
              onReply={() => onReply(message)}
              onCopy={handleCopy}
              onRecall={() => onRecall(message.id)}
              onTogglePin={() => onTogglePin(message.id, message.isPinned)}
            />
          </div>
        </div>
      </div>

      {message.type === "TEXT" && !message.isRecalled && isLastInGroup && (
        <p
          className={cn("mt-1 text-[12px] text-black/80", !isMine && "pl-10.5")}
        >
          {formatTimeOnly(message.createdAt)}
        </p>
      )}

      <div className={cn(!isMine && "pl-10.5")}>
        <MessageReaction
          reactions={message.reactions}
          align={align}
          onToggle={(emoji, reactedByMe) =>
            reactedByMe
              ? onRemoveReaction(message.id)
              : onReact(message.id, emoji)
          }
        />
      </div>
    </motion.div>
  );
}
