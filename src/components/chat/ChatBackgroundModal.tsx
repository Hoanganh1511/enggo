"use client";

import { Check } from "lucide-react";
import { SimpleModal } from "@/components/ui/simple-modal";
import { cn } from "@/lib/utils";
import { CHAT_BACKGROUNDS } from "./chat-backgrounds";

// Modal chon 1 trong 7 nen (6 pattern + "Mặc định") cho vung tin nhan - chon
// xong ap dung + dong modal ngay (khong can nut Luu rieng), giong cach chon
// theme/wallpaper pho bien cua cac chat app.
export function ChatBackgroundModal({
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
      title="Nền đoạn chat"
      description="Chọn hình nền cho khung tin nhắn - chỉ áp dụng trên thiết bị này."
      maxWidthClassName="max-w-lg"
    >
      <div className="grid grid-cols-3 gap-3">
        {CHAT_BACKGROUNDS.map((b) => {
          const selected = value === b.id;
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => {
                onChange(b.id);
                onOpenChange(false);
              }}
              title={b.sub}
              className={cn(
                "group flex flex-col gap-1.5 rounded-xl p-1.5 text-left transition-colors duration-150 ease-out",
                selected ? "bg-primary/10" : "hover:bg-hover-bg",
              )}
            >
              <div
                className={cn(
                  "flex h-16 items-center justify-center overflow-hidden rounded-lg border-2",
                  b.base,
                  selected ? "border-primary" : "border-border",
                )}
                style={b.patternStyle}
              >
                {selected && (
                  <span
                    className="relative z-10 grid size-6 place-items-center rounded-full text-white shadow-sm"
                    style={{ background: "var(--primary)" }}
                  >
                    <Check size={13} strokeWidth={2.5} />
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "truncate text-[11.5px] font-medium",
                  selected ? "text-primary" : "text-ink-muted",
                )}
              >
                {b.label}
              </span>
            </button>
          );
        })}
      </div>
    </SimpleModal>
  );
}
