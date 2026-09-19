"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast/toast-store";
import { getApiErrorMessage } from "@/lib/api/client";
import { uploadPostImageAction } from "@/actions/discover/upload-post-image";
import { convertHeicToJpegIfNeeded } from "@/lib/heic-convert";
import { SimpleModal } from "@/components/ui/simple-modal";

// Modal chon anh DUNG CHUNG (2 tab: Tải lên / Dán URL) - yeu cau nguoi dung:
// "Cái cụm block hồ sơ đó, không để dán url, cho bật modal, có thể lựa chọn
// giữa 2 tab upload hoặc dán url" (truoc do ProfileBlockView chi co
// window.prompt() xin URL, khong cho upload that). Dung LAI cung 1 duong
// upload that voi SeriesForm.tsx (anh bia Series) - uploadPostImageAction +
// convertHeicToJpegIfNeeded, KHONG viet rieng 1 co che moi. Thiet ke THUAN
// (chi nhan `open`/`onOpenChange`/`onSelect`, khong tu biet gi ve ProfileBlock)
// de dung lai duoc cho BAT KY noi nao khac trong app can chon 1 URL anh
// (icon Grid, avatar...).
export function ImagePickerModal({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
}) {
  const [tab, setTab] = useState<"upload" | "url">("upload");
  const [uploading, setUploading] = useState(false);
  const [urlDraft, setUrlDraft] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const uploadFile = await convertHeicToJpegIfNeeded(file);
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("kind", "image");
      const uploaded = await uploadPostImageAction(formData);
      onSelect(uploaded.url);
      onOpenChange(false);
    } catch (err) {
      toast.danger(getApiErrorMessage(err, "Tải ảnh thất bại, thử lại sau."));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleUrlSubmit() {
    const trimmed = urlDraft.trim();
    if (!trimmed) return;
    onSelect(trimmed);
    setUrlDraft("");
    onOpenChange(false);
  }

  return (
    <SimpleModal
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) setTab("upload");
      }}
      title="Chọn ảnh"
    >
      <div className="mb-3 flex gap-0.5 rounded-md bg-surface-muted p-0.5">
        <button
          type="button"
          onClick={() => setTab("upload")}
          className={cn(
            "flex-1 cursor-pointer rounded px-3 py-1.5 text-[13px] font-medium transition-colors duration-150 ease-out",
            tab === "upload" ? "bg-surface text-ink shadow-sm" : "text-ink-faint hover:text-ink-muted",
          )}
        >
          Tải lên
        </button>
        <button
          type="button"
          onClick={() => setTab("url")}
          className={cn(
            "flex-1 cursor-pointer rounded px-3 py-1.5 text-[13px] font-medium transition-colors duration-150 ease-out",
            tab === "url" ? "bg-surface text-ink shadow-sm" : "text-ink-faint hover:text-ink-muted",
          )}
        >
          Dán URL
        </button>
      </div>

      {tab === "upload" ? (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full cursor-pointer items-center justify-center rounded-lg border border-dashed border-border py-6 text-[13px] font-medium text-ink-muted hover:border-ink-faint hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading ? "Đang tải..." : "Chọn ảnh từ máy"}
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <input
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleUrlSubmit();
            }}
            placeholder="https://..."
            className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-[13px] outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={handleUrlSubmit}
            disabled={!urlDraft.trim()}
            className="shrink-0 cursor-pointer rounded-lg bg-ink px-3.5 py-2 text-[13px] font-semibold text-surface hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Dùng URL
          </button>
        </div>
      )}
    </SimpleModal>
  );
}
