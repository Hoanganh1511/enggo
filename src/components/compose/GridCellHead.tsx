"use client";

import { useState } from "react";
import { Hash, Palette, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PopoverRoot, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { GRID_BADGE_COLORS, isValidCssColor, type GridBadgeColor } from "./post-extensions";

// [2026-09-19] "Phần head" tach thanh 1 COMPONENT DOC LAP (khong import gi
// tu Tiptap/editor) - yeu cau nguoi dung: "tôi muốn xây dựng toàn bộ phần
// này như 1 component, có thể biến tấu theo nhiều mục đích ý". Component
// nay CHI nhan attrs+callback THUAN (khong tu doc/ghi Tiptap node) - noi goi
// (hien la grid-cell-view.tsx, NodeView cua GridCell) chiu trach nhiem noi
// callback toi editor.commands that; muon dung lai "phần head" nay o 1 boi
// canh KHAC (vd 1 the Kanban, 1 khoi thong tin rieng khong lien quan Grid)
// chi can truyen dung 5 prop nay, khong phu thuoc gi vao schema Grid ca.
export function GridCellHead({
  color,
  badge,
  showStep,
  stepNumber,
  editable,
  onColorChange,
  onBadgeChange,
  onShowStepChange,
}: {
  color: string | null;
  badge: GridBadgeColor | null;
  showStep: boolean;
  stepNumber: number;
  editable: boolean;
  onColorChange: (color: string | null) => void;
  onBadgeChange: (badge: GridBadgeColor | null) => void;
  onShowStepChange: (show: boolean) => void;
}) {
  const [colorOpen, setColorOpen] = useState(false);
  const [badgeOpen, setBadgeOpen] = useState(false);
  const [draft, setDraft] = useState(color ?? "");
  const [error, setError] = useState<string | null>(null);

  function commitDraft(value: string) {
    const trimmed = value.trim();
    if (trimmed === "") {
      onColorChange(null);
      setError(null);
      return;
    }
    if (isValidCssColor(trimmed)) {
      onColorChange(trimmed);
      setError(null);
    } else {
      setError("Không hợp lệ - dùng hex (#RRGGBB) hoặc rgba(...)");
    }
  }

  const badgeValue = badge ? (GRID_BADGE_COLORS.find((b) => b.id === badge)?.value ?? null) : null;

  if (!editable) {
    return (
      <div className="grid-cell-head flex h-7 items-center gap-1.5 px-3" style={color ? { backgroundColor: color } : undefined}>
        {badgeValue && <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: badgeValue }} />}
        {showStep && (
          <span className="font-mono text-[12px] font-semibold text-primary">{String(stepNumber).padStart(2, "0")}</span>
        )}
      </div>
    );
  }

  return (
    <div
      contentEditable={false}
      className="grid-cell-head flex h-8 items-center gap-1.5 px-2"
      style={color ? { backgroundColor: color } : undefined}
    >
      {/* Badge chấm màu - yêu cầu người dùng: "gắn badge cho mỗi ô nữa.
          🔴🟡🟢, chẳng hạn vậy" - 1 popover 5 màu + "Không có" để xoá. */}
      <PopoverRoot open={badgeOpen} onOpenChange={setBadgeOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            title="Chọn badge"
            className={cn(
              "flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full ring-1 ring-border ring-offset-1 ring-offset-surface",
              !badgeValue && "border border-dashed border-ink-faint",
            )}
            style={badgeValue ? { backgroundColor: badgeValue } : undefined}
          />
        </PopoverTrigger>
        <PopoverContent open={badgeOpen} align="start" sideOffset={6} className="z-50 flex w-36 flex-col gap-0.5 rounded-lg border border-border bg-surface p-1 shadow-dropdown">
          <button
            type="button"
            onClick={() => {
              onBadgeChange(null);
              setBadgeOpen(false);
            }}
            className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12.5px] text-ink-muted hover:bg-hover-bg hover:text-ink"
          >
            <span className="size-3 shrink-0 rounded-full border border-dashed border-ink-faint" />
            Không có
          </button>
          {GRID_BADGE_COLORS.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => {
                onBadgeChange(b.id);
                setBadgeOpen(false);
              }}
              className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12.5px] text-ink-muted hover:bg-hover-bg hover:text-ink"
            >
              <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: b.value }} />
              {b.label}
            </button>
          ))}
        </PopoverContent>
      </PopoverRoot>

      {/* Checkbox "Hiện số bước" - yêu cầu người dùng: "checkbox hiển thị số
          bước, ví dụ như trong ảnh đính kèm thì nó là các chỗ 01,02,03...". */}
      <label className="flex cursor-pointer items-center gap-1 text-[11px] text-ink-faint select-none">
        <input
          type="checkbox"
          checked={showStep}
          onChange={(e) => onShowStepChange(e.target.checked)}
          className="size-3 cursor-pointer accent-primary"
        />
        <Hash size={11} strokeWidth={2} aria-hidden="true" />
      </label>
      {showStep && (
        <span className="font-mono text-[12px] font-semibold text-primary">{String(stepNumber).padStart(2, "0")}</span>
      )}

      {/* Màu nền head - yêu cầu người dùng: "Phần head có thể tùy chỉnh màu
          nền. Cho pick color hoặc nhập mã màu: hex, hoặc rgba, validate
          chuẩn". */}
      <PopoverRoot
        open={colorOpen}
        onOpenChange={(o) => {
          setColorOpen(o);
          if (o) {
            setDraft(color ?? "");
            setError(null);
          }
        }}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            title="Màu nền head"
            className="ml-auto flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-md ring-1 ring-border"
            style={{ backgroundColor: color ?? "transparent" }}
          >
            {!color && <Palette size={11} strokeWidth={2} className="text-ink-faint" />}
          </button>
        </PopoverTrigger>
        <PopoverContent open={colorOpen} align="end" sideOffset={6} className="z-50 w-56 rounded-lg border border-border bg-surface p-2.5 shadow-dropdown">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={/^#([0-9a-f]{6})$/i.test(draft.trim()) ? draft.trim() : "#ffffff"}
              onChange={(e) => {
                setDraft(e.target.value);
                setError(null);
                onColorChange(e.target.value);
              }}
              className="size-8 shrink-0 cursor-pointer rounded border border-border bg-transparent p-0"
            />
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={(e) => commitDraft(e.target.value)}
              placeholder="#RRGGBB hoặc rgba(0,0,0,.1)"
              className="min-w-0 flex-1 rounded-md border border-border bg-transparent px-2 py-1.5 text-[12.5px] outline-none focus:border-primary"
            />
          </div>
          {error && <p className="mt-1.5 text-[11px] text-danger">{error}</p>}
          {color && (
            <button
              type="button"
              onClick={() => {
                onColorChange(null);
                setDraft("");
                setError(null);
              }}
              className="mt-2 flex cursor-pointer items-center gap-1 text-[12px] text-ink-faint hover:text-ink"
            >
              <X size={12} strokeWidth={2} />
              Xoá màu nền
            </button>
          )}
        </PopoverContent>
      </PopoverRoot>
    </div>
  );
}
