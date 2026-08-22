"use client";

import type { ApiChatMessage } from "@/lib/api/types";
import { cn } from "@/lib/utils";

// Khoi "embedded reply preview" ben trong bubble - ten nguoi duoc reply +
// noi dung goc (truncate 1 dong). Bam vao de nhay/highlight ve tin nhan goc
// (onJump, chi hoat dong neu tin do CON dang nam trong `messages` da tai -
// khong fetch bu qua trang cu, xem MessagesShell.tsx). replyTo chi co
// senderId (khong co ten san - xem ApiReplyPreview), nen phai tu suy ra ten
// tu myId/senderName - senderName la ten NGUOI DA GUI TIN DUOC REPLY (caller
// tu tra cuu theo replyTo.senderId trong participants, KHONG phai 1 "nguoi
// kia" co dinh - nhom co nhieu nguoi, xem MessageBubble.tsx).
export function MessageReplyPreview({
  replyTo,
  myId,
  senderName,
  tone,
  onJump,
}: {
  replyTo: NonNullable<ApiChatMessage["replyTo"]>;
  myId: string | undefined;
  senderName: string | undefined;
  tone: "colored" | "light";
  onJump?: () => void;
}) {
  const senderLabel = replyTo.senderId === myId ? "Bạn" : (senderName ?? "Người dùng");

  return (
    <button
      type="button"
      onClick={onJump}
      disabled={!onJump}
      className={cn(
        "mb-1.5 flex w-full flex-col gap-0.5 rounded-lg border-l-2 px-2.5 py-1.5 text-left text-[12px] transition-colors duration-150 ease-out",
        onJump && "cursor-pointer",
        tone === "colored"
          ? "border-white/50 bg-white/10 hover:bg-white/15"
          : "border-slate-300 bg-slate-100 hover:bg-slate-150",
      )}
    >
      <span
        className={cn("font-semibold", tone === "colored" && "text-white/90")}
        style={tone === "light" ? { color: "var(--primary)" } : undefined}
      >
        {senderLabel}
      </span>
      <span className={cn("truncate", tone === "colored" ? "text-white/75" : "text-slate-500")}>
        {replyTo.preview || "..."}
      </span>
    </button>
  );
}
