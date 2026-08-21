"use client";

// Bang emoji don gian, curated tay - khong dung thu vien ngoai (khong can
// search/category cho pham vi MVP composer chat).
const EMOJIS = [
  "😀", "😁", "😂", "🤣", "😊", "😍", "😘", "😜",
  "🤔", "🙄", "😴", "😭", "😅", "😇", "🙂", "😉",
  "😎", "🤩", "🥳", "😢", "😡", "🤯", "😱", "🤗",
  "👍", "👎", "👏", "🙏", "💪", "🔥", "🎉", "❤️",
  "💯", "✨", "👌", "🤝", "🥹", "😬", "🫡", "🙌",
];

export function EmojiPickerPopover({
  onSelect,
}: {
  onSelect: (emoji: string) => void;
}) {
  return (
    <div className="grid w-64 grid-cols-8 gap-1 rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_8px_28px_rgba(15,23,42,.12)]">
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onSelect(emoji)}
          className="grid size-7 cursor-pointer place-items-center rounded-lg text-lg transition-colors duration-150 ease-out hover:bg-slate-100"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
