"use client";

import { Check } from "lucide-react";
import { SimpleModal } from "@/components/ui/simple-modal";
import { cn } from "@/lib/utils";
import { IMMERSIVE_THEMES } from "./chat-immersive-themes";

// Thay ChatBubbleConceptModal.tsx - chon 1 trong 10 "khung canh" (nen dong +
// mau bubble, xem ImmersiveChatScene.tsx/chat-immersive-themes.ts), cung
// pattern voi ChatBackgroundModal.tsx (lua chon CHUNG ca app, luu
// localStorage, chi tren thiet bi nay).
export function ImmersiveThemeModal({
  open,
  onOpenChange,
  value,
  onChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <SimpleModal
      open={open}
      onOpenChange={onOpenChange}
      title="Khung cảnh trò chuyện"
      description="Đổi cả nền động lẫn màu bong bóng chat - chỉ áp dụng trên thiết bị này."
      maxWidthClassName="max-w-lg"
    >
      <div className="grid grid-cols-3 gap-3">
        {IMMERSIVE_THEMES.map((t) => {
          const selected = value === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              title={t.description}
              onClick={() => {
                onChange(t.id);
                onOpenChange(false);
              }}
              className={cn(
                "group flex flex-col items-center gap-1.5 rounded-xl p-2.5 text-center transition-colors duration-150 ease-out",
                selected ? "bg-primary/10" : "hover:bg-hover-bg",
              )}
            >
              <div
                className={cn(
                  "relative grid size-14 place-items-center rounded-full border-2",
                  selected ? "border-primary" : "border-border",
                )}
                style={{ background: `${t.accent}1a` }}
              >
                <Icon size={22} style={{ color: t.accent }} />
                {selected && (
                  <span
                    className="absolute -right-1 -bottom-1 grid size-5 place-items-center rounded-full text-white shadow-sm"
                    style={{ background: "var(--primary)" }}
                  >
                    <Check size={11} strokeWidth={2.5} />
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "truncate text-[11.5px] font-medium",
                  selected ? "text-primary" : "text-ink-muted",
                )}
              >
                {t.name}
              </span>
            </button>
          );
        })}
      </div>
    </SimpleModal>
  );
}
