"use client";

import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

// Hang cam xuc "quick pick" - hien khi bam nut Smile trong MessageActions.tsx
// (KHONG phai luc chi hover message thuong, tranh 2 toolbar chong nhau/qua
// noi bat - xem comment trong MessageActions.tsx). "+" mo EmojiPickerPopover
// (bang day du) thay cho 6 mau nay. Animation scale+opacity da co san qua
// PopoverContent (components/ui/popover.tsx boc container nay), khong can
// them framer-motion o day nua. `activeEmoji` (emoji minh DA tha, neu co -
// backend chi cho 1 reaction/nguoi/tin, xem ChatService.reactToMessage) duoc
// khoanh vien+nen de nguoi dung biet minh dang tha cai gi ma khong can nhin
// lai pill duoi bubble.
const QUICK_REACTIONS = ["❤️", "😂", "😍", "😮", "😢", "😡"];

export function ReactionPicker({
  activeEmoji,
  onSelect,
  onOpenFullPicker,
}: {
  activeEmoji?: string;
  onSelect: (emoji: string) => void;
  onOpenFullPicker: () => void;
}) {
  return (
    <div className="flex items-center gap-0.5 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-[0_6px_20px_rgba(15,23,42,.12)]">
      {QUICK_REACTIONS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onSelect(emoji)}
          title={emoji === activeEmoji ? "Bấm để bỏ cảm xúc" : undefined}
          className={cn(
            "grid size-8 cursor-pointer place-items-center rounded-full text-[17px] transition-transform duration-150 ease-out hover:scale-125",
            emoji === activeEmoji && "bg-primary/15 ring-2 ring-primary",
          )}
        >
          {emoji}
        </button>
      ))}
      <button
        type="button"
        onClick={onOpenFullPicker}
        title="Thêm cảm xúc khác"
        className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-full text-slate-500 transition-colors duration-150 ease-out hover:bg-slate-100"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
