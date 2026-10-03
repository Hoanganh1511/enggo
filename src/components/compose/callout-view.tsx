"use client";

import { useState } from "react";
import { NodeViewWrapper, NodeViewContent, type ReactNodeViewProps } from "@tiptap/react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PopoverRoot, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { BlockActionsMenu } from "./BlockActionsMenu";
import { CALLOUT_ICON_PRESETS, isValidCssColor } from "./post-extensions";

// [2026-10-03 fix crash] KHONG tinh san 1 Record o CAP MODULE (vd qua
// Object.fromEntries(CALLOUT_ICON_PRESETS.map(...)) luc trươc) - post-extensions.ts
// import NGUOC lai CalloutView tu CHINH file nay (vong import: post-extensions.ts
// -> callout-view.tsx -> post-extensions.ts), nen luc callout-view.tsx chay
// CODE O CAP MODULE, `CALLOUT_ICON_PRESETS` CO THE CHUA duoc khoi tao xong o
// phia post-extensions.ts (dang o giua chung "export const CALLOUT_ICON_PRESETS
// = [...]" vi no tam dung de import file nay truoc) - bao loi that su ("Cannot
// access 'H' before initialization", TDZ cua const). Doi sang 1 HAM tra cuu
// (chi chay LUC GOI, bao gio cung SAU khi moi module da nap xong) de tranh
// hoan toan truong hop nay.
function emojiForIcon(key: string): string {
  return CALLOUT_ICON_PRESETS.find((p) => p.key === key)?.emoji ?? "📝";
}

// [2026-10-03 redesign] TRUOC DAY chi 3 "chủ đề" co dinh (Warning/Danger/Good
// tips), mau/icon/vien FIX CUNG theo `variant` - yeu cau nguoi dung: "lại có
// thêm dạng nữa [kem anh 1 callout vang moi]. Vì vậy tôi đề xuất, nên để
// người soạn bài có thể dynamic được việc chọn màu nền, màu border, icon thì
// chỉ cho chọn nhưng icon phổ biến". Gio nguoi soan TU CHON ca 3: icon (1
// trong CALLOUT_ICON_PRESETS, khong con tu do hoan toan - dung "pho bien" nhu
// yeu cau), mau nen, mau vien (hex/rgba tu do, giong pattern GridCellHead.tsx).
// `variant`/CSS [&_div[data-callout][data-variant=...]] CU VAN GIU NGUYEN lam
// "mac dinh" khi bgColor/borderColor con null (chua tuy chinh) - KHONG xoa gi
// ca, chi THEM 1 lop tuy chinh de len tren qua inline style.
function CalloutColorField({
  label,
  value,
  onChange,
  onClear,
}: {
  label: string;
  value: string | null;
  onChange: (value: string) => void;
  onClear: () => void;
}) {
  const [draft, setDraft] = useState(value ?? "");
  const [error, setError] = useState<string | null>(null);

  function commit(next: string) {
    const trimmed = next.trim();
    if (trimmed === "") {
      onClear();
      setError(null);
      return;
    }
    if (isValidCssColor(trimmed)) {
      onChange(trimmed);
      setError(null);
    } else {
      setError("Không hợp lệ - dùng hex (#RRGGBB) hoặc rgba(...)");
    }
  }

  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium text-ink-faint">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={/^#([0-9a-f]{6})$/i.test(draft.trim()) ? draft.trim() : "#ffffff"}
          onChange={(e) => {
            setDraft(e.target.value);
            setError(null);
            onChange(e.target.value);
          }}
          className="size-8 shrink-0 cursor-pointer rounded border border-border bg-transparent p-0"
        />
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={(e) => commit(e.target.value)}
          placeholder="#RRGGBB hoặc rgba(0,0,0,.1)"
          className="min-w-0 flex-1 rounded-md border border-border bg-transparent px-2 py-1.5 text-[12.5px] outline-none focus:border-primary"
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              onClear();
              setDraft("");
              setError(null);
            }}
            aria-label={`Xoá ${label.toLowerCase()}`}
            className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-hover-bg hover:text-danger"
          >
            <X size={13} strokeWidth={2} />
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-[11px] text-danger">{error}</p>}
    </div>
  );
}

export function CalloutView({ node, updateAttributes, editor, getPos }: ReactNodeViewProps) {
  const canEdit = editor.isEditable;
  const variant = (node.attrs.variant as string) || "info";
  const label = (node.attrs.label as string) ?? "";
  const icon = (node.attrs.icon as string) || "note";
  const bgColor = (node.attrs.bgColor as string | null) ?? null;
  const borderColor = (node.attrs.borderColor as string | null) ?? null;
  const [iconOpen, setIconOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);

  const inlineStyle: React.CSSProperties = {
    ...(bgColor ? { backgroundColor: bgColor } : {}),
    ...(borderColor ? { borderColor } : {}),
  };

  return (
    <NodeViewWrapper data-callout="" data-variant={variant} className="group relative" style={inlineStyle}>
      <div className="callout-header" contentEditable={false}>
        {canEdit ? (
          <PopoverRoot open={iconOpen} onOpenChange={setIconOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                title="Chọn icon"
                className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-[14px] leading-none transition-transform duration-150 ease-out hover:scale-110 hover:bg-hover-bg"
              >
                {emojiForIcon(icon)}
              </button>
            </PopoverTrigger>
            <PopoverContent open={iconOpen} align="start" sideOffset={6} className="z-50 w-48 rounded-lg border border-border bg-surface p-2 shadow-dropdown">
              <div className="grid grid-cols-4 gap-1">
                {CALLOUT_ICON_PRESETS.map((preset) => (
                  <button
                    key={preset.key}
                    type="button"
                    title={preset.label}
                    onClick={() => {
                      updateAttributes({ icon: preset.key });
                      setIconOpen(false);
                    }}
                    className={cn(
                      "flex size-9 cursor-pointer items-center justify-center rounded-md text-[16px] hover:bg-hover-bg",
                      icon === preset.key && "bg-primary-soft",
                    )}
                  >
                    {preset.emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </PopoverRoot>
        ) : (
          <span className="callout-header-icon">{emojiForIcon(icon)}</span>
        )}

        {canEdit ? (
          <input
            value={label}
            onChange={(e) => updateAttributes({ label: e.target.value })}
            placeholder="Nhãn chủ đề..."
            // autoCorrect/autoCapitalize/spellCheck="off" + autoComplete="off" -
            // yeu cau nguoi dung: "Đang gõ cứ tự nhảy ra khỏi dấu đóng ngoặc
            // kép" - xem docs/engineering-log.md 2026-10-02 muc 1.
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="min-w-0 flex-1 border-none bg-transparent p-0 font-semibold text-current outline-none placeholder:text-current/50"
          />
        ) : (
          <span>{label}</span>
        )}

        {canEdit && (
          <PopoverRoot
            open={colorOpen}
            onOpenChange={setColorOpen}
          >
            <PopoverTrigger asChild>
              <button
                type="button"
                title="Màu nền/viền"
                className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md border border-current/30 transition-transform duration-150 ease-out hover:scale-110"
                style={bgColor ? { backgroundColor: bgColor } : undefined}
              />
            </PopoverTrigger>
            <PopoverContent open={colorOpen} align="end" sideOffset={6} className="z-50 w-56 rounded-lg border border-border bg-surface p-2.5 shadow-dropdown">
              <div className="flex flex-col gap-3">
                <CalloutColorField
                  label="Màu nền"
                  value={bgColor}
                  onChange={(value) => updateAttributes({ bgColor: value })}
                  onClear={() => updateAttributes({ bgColor: null })}
                />
                <CalloutColorField
                  label="Màu viền"
                  value={borderColor}
                  onChange={(value) => updateAttributes({ borderColor: value })}
                  onClear={() => updateAttributes({ borderColor: null })}
                />
              </div>
            </PopoverContent>
          </PopoverRoot>
        )}

        {canEdit && <BlockActionsMenu editor={editor} getPos={getPos} node={node} />}
      </div>
      <NodeViewContent className="callout-body" />
    </NodeViewWrapper>
  );
}
