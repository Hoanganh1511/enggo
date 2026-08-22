"use client";

import { useState } from "react";
import { Copy, MoreHorizontal, Pin, PinOff, Reply as ReplyIcon, Smile, Undo2 } from "lucide-react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { toast } from "@/lib/toast/toast-store";
import { EmojiPickerPopover } from "./EmojiPickerPopover";
import { ReactionPicker } from "./ReactionPicker";

// Toolbar hien khi hover 1 message (CSS group-hover, khong dung state rieng -
// tranh xung dot voi opacity/scale ma framer-motion se ap qua inline style
// neu dung animate prop cho chinh no). CHI 3 nut: React/Reply/More - "More"
// gom Copy (that, Clipboard API), Ghim/Bo ghim (that, bat ky ai trong hoi
// thoai cung ghim duoc - chua co khai niem "admin"), va Thu hoi (that, chi
// hien voi tin cua minh). KHONG co Forward/Edit/Report nhu goi y trong spec
// vi chua co API that cho 3 hanh dong do - them nut gia se vi pham nguyen
// tac khong tao fake functionality.
export function MessageActions({
  isMine,
  canCopy,
  isPinned,
  activeEmoji,
  onReact,
  onRemoveReaction,
  onReply,
  onCopy,
  onRecall,
  onTogglePin,
}: {
  isMine: boolean;
  canCopy: boolean;
  isPinned: boolean;
  // Emoji minh DA tha cho tin nay, neu co (xem MessageBubble.tsx) - highlight
  // trong ReactionPicker/EmojiPickerPopover, bam lai CHINH emoji nay se bo
  // cam xuc thay vi tha lai.
  activeEmoji?: string;
  onReact: (emoji: string) => void;
  onRemoveReaction: () => void;
  onReply: () => void;
  onCopy: () => void;
  onRecall: () => Promise<void>;
  onTogglePin: () => void;
}) {
  const [reactOpen, setReactOpen] = useState(false);
  const [showFullPicker, setShowFullPicker] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [confirmRecallOpen, setConfirmRecallOpen] = useState(false);

  function handleCopy() {
    onCopy();
    setMoreOpen(false);
    toast.success("Đã sao chép");
  }

  // Bam lai CHINH emoji dang active = bo cam xuc, bam emoji khac = tha/doi
  // sang emoji do (upsert o backend tu ghi de, khong can goi remove truoc).
  function handleSelectReaction(emoji: string) {
    if (emoji === activeEmoji) onRemoveReaction();
    else onReact(emoji);
    setReactOpen(false);
    setShowFullPicker(false);
  }

  return (
    <>
      <div className="pointer-events-none flex shrink-0 scale-95 items-center gap-0.5 rounded-full border border-slate-200 bg-white p-0.5 opacity-0 whitespace-nowrap shadow-[0_2px_10px_rgba(15,23,42,.1)] transition-all duration-200 ease-out group-hover:pointer-events-auto group-hover:scale-100 group-hover:opacity-100">
        <PopoverRoot
          open={reactOpen}
          onOpenChange={(open) => {
            setReactOpen(open);
            if (!open) setShowFullPicker(false);
          }}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              title="Thả cảm xúc"
              className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-full text-slate-500 transition-colors duration-150 ease-out hover:bg-slate-100"
            >
              <Smile size={15} />
            </button>
          </PopoverTrigger>
          <PopoverContent open={reactOpen} align="center" sideOffset={8}>
            {showFullPicker ? (
              <EmojiPickerPopover activeEmoji={activeEmoji} onSelect={handleSelectReaction} />
            ) : (
              <ReactionPicker
                activeEmoji={activeEmoji}
                onSelect={handleSelectReaction}
                onOpenFullPicker={() => setShowFullPicker(true)}
              />
            )}
          </PopoverContent>
        </PopoverRoot>

        <button
          type="button"
          title="Trả lời"
          onClick={onReply}
          className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-full text-slate-500 transition-colors duration-150 ease-out hover:bg-slate-100"
        >
          <ReplyIcon size={15} />
        </button>

        <PopoverRoot open={moreOpen} onOpenChange={setMoreOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              title="Thêm"
              className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-full text-slate-500 transition-colors duration-150 ease-out hover:bg-slate-100"
            >
              <MoreHorizontal size={15} />
            </button>
          </PopoverTrigger>
          <PopoverContent open={moreOpen} align="end" sideOffset={8}>
            <div className="w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_8px_28px_rgba(15,23,42,.12)]">
              {canCopy && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium text-[#182338] hover:bg-slate-50"
                >
                  <Copy size={14} className="text-slate-500" />
                  Sao chép
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  onTogglePin();
                  setMoreOpen(false);
                }}
                className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium text-[#182338] hover:bg-slate-50"
              >
                {isPinned ? <PinOff size={14} className="text-slate-500" /> : <Pin size={14} className="text-slate-500" />}
                {isPinned ? "Bỏ ghim" : "Ghim tin nhắn"}
              </button>
              {isMine && (
                <button
                  type="button"
                  onClick={() => {
                    setMoreOpen(false);
                    setConfirmRecallOpen(true);
                  }}
                  className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium text-danger hover:bg-red-50"
                >
                  <Undo2 size={14} />
                  Thu hồi
                </button>
              )}
            </div>
          </PopoverContent>
        </PopoverRoot>
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
