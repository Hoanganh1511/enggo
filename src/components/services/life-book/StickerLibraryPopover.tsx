"use client";

import { useRef, useState } from "react";
import { Sparkles, Upload } from "lucide-react";
import { PopoverRoot, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { getStickerPresets } from "@/lib/life-book/sticker-presets";
import {
  STICKER_DND_MIME,
  downscaleImageToDataUrl,
  loadImageElement,
} from "@/lib/life-book/sticker-render";
import { useCustomStickers } from "@/lib/life-book/use-custom-stickers";
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/life-book/image-constraints";
import { toast } from "@/lib/toast/toast-store";

// Sub-phase 6.6 - thay the nut "Sticker" tao-ngay-1-ngoi-sao cua Sub-phase
// 6.3 bang 1 Popover thu vien THAT: ~28 preset (sticker-presets.ts) + sticker
// tuy chinh nguoi dung upload (luu localStorage, xem use-custom-stickers.ts).
// Bam 1 sticker -> tao o vi tri mac dinh (giong cac tool khac); keo THANG tu
// o luoi ra canvas -> tao dung diem tha (dataTransfer MIME rieng, xem
// STICKER_DND_MIME, doc trong KonvaCanvas.tsx).
export function StickerLibraryPopover({ onPick }: { onPick: (src: string) => void }) {
  const [open, setOpen] = useState(false);
  const { stickers: customStickers, addCustomSticker } = useCustomStickers();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleUpload(file: File | undefined) {
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.warning("Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.warning("Ảnh vượt quá giới hạn 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const raw = typeof reader.result === "string" ? reader.result : "";
      if (!raw) return;
      loadImageElement(raw)
        .then((img) => addCustomSticker(downscaleImageToDataUrl(img)))
        .catch(() => toast.warning("Không đọc được ảnh này."));
    };
    reader.readAsDataURL(file);
  }

  return (
    <PopoverRoot open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-ink transition-colors duration-150 ease-out hover:bg-hover-bg"
        >
          <Sparkles size={16} strokeWidth={2} className="shrink-0 text-ink-muted" />
          Sticker
        </button>
      </PopoverTrigger>

      <PopoverContent
        open={open}
        align="start"
        side="right"
        className="z-50 w-64 rounded-xl border border-border bg-surface p-3 shadow-dropdown"
      >
        {customStickers.length > 0 && (
          <>
            <p className="mb-1.5 px-0.5 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
              Của bạn
            </p>
            <div className="mb-3 grid grid-cols-6 gap-1.5">
              {customStickers.map((s) => (
                <StickerThumb
                  key={s.id}
                  src={s.src}
                  onPick={() => {
                    onPick(s.src);
                    setOpen(false);
                  }}
                />
              ))}
            </div>
          </>
        )}

        <p className="mb-1.5 px-0.5 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
          Thư viện
        </p>
        <div className="grid grid-cols-6 gap-1.5">
          {getStickerPresets().map((preset) => (
            <StickerThumb
              key={preset.id}
              src={preset.src}
              label={preset.label}
              onPick={() => {
                onPick(preset.src);
                setOpen(false);
              }}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mt-3 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2 text-xs font-medium text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg"
        >
          <Upload size={13} /> Tải ảnh lên
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            handleUpload(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </PopoverContent>
    </PopoverRoot>
  );
}

function StickerThumb({
  src,
  label,
  onPick,
}: {
  src: string;
  label?: string;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData(STICKER_DND_MIME, src);
        e.dataTransfer.effectAllowed = "copy";
      }}
      onClick={onPick}
      className="grid aspect-square cursor-grab place-items-center rounded-md border border-border bg-white p-1 transition-colors duration-150 ease-out hover:bg-hover-bg active:cursor-grabbing"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- data URL nho
          (emoji ve tay hoac anh da downscale), next/image khong toi uu duoc
          cho data: URL dong. */}
      <img src={src} alt={label ?? "sticker"} className="h-full w-full object-contain" />
    </button>
  );
}
