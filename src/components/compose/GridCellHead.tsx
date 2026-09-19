"use client";

import { useState } from "react";
import { Hash, Palette, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PopoverRoot, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { GRID_BADGE_PRESETS, isValidCssColor } from "./post-extensions";

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
  badgeColor,
  badgeLabel,
  showStep,
  stepNumber,
  editable,
  onColorChange,
  onBadgeChange,
  onShowStepChange,
}: {
  color: string | null;
  badgeColor: string | null;
  badgeLabel: string;
  showStep: boolean;
  stepNumber: number;
  editable: boolean;
  onColorChange: (color: string | null) => void;
  onBadgeChange: (patch: { badgeColor?: string | null; badgeLabel?: string }) => void;
  onShowStepChange: (show: boolean) => void;
}) {
  const [colorOpen, setColorOpen] = useState(false);
  const [badgeOpen, setBadgeOpen] = useState(false);
  const [draft, setDraft] = useState(color ?? "");
  const [error, setError] = useState<string | null>(null);
  const [badgeDraft, setBadgeDraft] = useState(badgeColor ?? "");
  const [badgeError, setBadgeError] = useState<string | null>(null);

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

  function commitBadgeColorDraft(value: string) {
    const trimmed = value.trim();
    if (trimmed === "") {
      onBadgeChange({ badgeColor: null });
      setBadgeError(null);
      return;
    }
    if (isValidCssColor(trimmed)) {
      onBadgeChange({ badgeColor: trimmed });
      setBadgeError(null);
    } else {
      setBadgeError("Không hợp lệ - dùng hex (#RRGGBB) hoặc rgba(...)");
    }
  }

  if (!editable) {
    return (
      <div className="grid-cell-head flex h-7 items-center gap-1.5 px-3" style={color ? { backgroundColor: color } : undefined}>
        {badgeColor && <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: badgeColor }} title={badgeLabel || undefined} />}
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
      {/* Badge cham mau - yeu cau nguoi dung (lan 1): "gắn badge cho mỗi ô
          nữa. 🔴🟡🟢, chẳng hạn vậy"; (lan 2, sau khi thay chi co 5 mau co
          dinh): "sao cứ set màu cố định? Cho color picker vào, cho tùy biến
          tên với mã màu chứ" - gio la 1 mau + 1 ten HOAN TOAN tu do (giong
          het pattern cua o "Màu nền head" ben duoi: native color input +
          o nhap hex/rgba tu validate), GRID_BADGE_PRESETS chi con la cac nut
          "bam nhanh" dien san gia tri vao o nhap, khong con la lua chon DUY
          NHAT. */}
      <PopoverRoot
        open={badgeOpen}
        onOpenChange={(o) => {
          setBadgeOpen(o);
          if (o) {
            setBadgeDraft(badgeColor ?? "");
            setBadgeError(null);
          }
        }}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            title={badgeLabel || "Chọn badge"}
            className={cn(
              "flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full ring-1 ring-border ring-offset-1 ring-offset-surface",
              !badgeColor && "border border-dashed border-ink-faint",
            )}
            style={badgeColor ? { backgroundColor: badgeColor } : undefined}
          />
        </PopoverTrigger>
        <PopoverContent open={badgeOpen} align="start" sideOffset={6} className="z-50 w-56 rounded-lg border border-border bg-surface p-2.5 shadow-dropdown">
          <label className="mb-1 block text-[11px] font-medium text-ink-faint">Tên badge (không bắt buộc)</label>
          <input
            value={badgeLabel}
            onChange={(e) => onBadgeChange({ badgeLabel: e.target.value })}
            placeholder="vd: Ưu tiên cao"
            className="mb-2 w-full rounded-md border border-border bg-transparent px-2 py-1.5 text-[12.5px] outline-none focus:border-primary"
          />
          <label className="mb-1 block text-[11px] font-medium text-ink-faint">Màu badge</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={/^#([0-9a-f]{6})$/i.test(badgeDraft.trim()) ? badgeDraft.trim() : "#ef4444"}
              onChange={(e) => {
                setBadgeDraft(e.target.value);
                setBadgeError(null);
                onBadgeChange({ badgeColor: e.target.value });
              }}
              className="size-8 shrink-0 cursor-pointer rounded border border-border bg-transparent p-0"
            />
            <input
              value={badgeDraft}
              onChange={(e) => setBadgeDraft(e.target.value)}
              onBlur={(e) => commitBadgeColorDraft(e.target.value)}
              placeholder="#RRGGBB hoặc rgba(0,0,0,.1)"
              className="min-w-0 flex-1 rounded-md border border-border bg-transparent px-2 py-1.5 text-[12.5px] outline-none focus:border-primary"
            />
          </div>
          {badgeError && <p className="mt-1.5 text-[11px] text-danger">{badgeError}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {GRID_BADGE_PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                title={p.label}
                onClick={() => {
                  setBadgeDraft(p.value);
                  setBadgeError(null);
                  onBadgeChange({ badgeColor: p.value, badgeLabel: badgeLabel || p.label });
                }}
                className="size-5 shrink-0 cursor-pointer rounded-full ring-1 ring-border ring-offset-1 ring-offset-surface"
                style={{ backgroundColor: p.value }}
              />
            ))}
          </div>
          {badgeColor && (
            <button
              type="button"
              onClick={() => {
                onBadgeChange({ badgeColor: null });
                setBadgeDraft("");
                setBadgeError(null);
              }}
              className="mt-2 flex cursor-pointer items-center gap-1 text-[12px] text-ink-faint hover:text-ink"
            >
              <X size={12} strokeWidth={2} />
              Xoá badge
            </button>
          )}
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
