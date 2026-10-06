"use client";

import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";

// Input tag dang CHIP (khac o Tags cua CardGrid - card-grid-view.tsx - noi
// dung 1 chuoi "a, b, c" tho): khop dung mockup nguoi dung gui cho Note
// ("[RDS] [Multi-AZ] [HA]" - cac chip tach roi tu dau, khong phai 1 dong
// text). Enter/dau phay chen 1 chip, Backspace tren o rong xoa chip cuoi.
export function TagChipInput({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [draft, setDraft] = useState("");

  function commitDraft() {
    const t = draft.trim();
    setDraft("");
    if (!t) return;
    if (tags.some((existing) => existing.toLowerCase() === t.toLowerCase())) return;
    onChange([...tags, t]);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commitDraft();
    } else if (e.key === "Backspace" && draft === "" && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-border bg-transparent px-2 py-1.5 focus-within:border-primary">
      {tags.map((t, i) => (
        <span key={i} className="flex items-center gap-1 rounded-full bg-surface-muted px-2 py-0.5 text-[11.5px] font-medium text-ink-muted">
          {t}
          <button
            type="button"
            onClick={() => onChange(tags.filter((_, idx) => idx !== i))}
            aria-label={`Xoá tag ${t}`}
            className="cursor-pointer text-ink-faint hover:text-danger"
          >
            <X size={10} strokeWidth={2.5} />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commitDraft}
        placeholder={tags.length === 0 ? "Thêm tag, Enter để xác nhận..." : ""}
        className="min-w-16 flex-1 bg-transparent text-[12.5px] outline-none placeholder:text-ink-faint"
      />
    </div>
  );
}
