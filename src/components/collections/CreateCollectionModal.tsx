"use client";

import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { SimpleModal } from "@/components/ui/simple-modal";
import { SelectMenu } from "@/components/ui/select-menu";
import { uploadPostImageAction } from "@/actions/discover/upload-post-image";
import { createCollectionAction } from "@/actions/discover/collections/create-collection";
import { updateCollectionAction } from "@/actions/discover/collections/update-collection";
import { convertHeicToJpegIfNeeded } from "@/lib/heic-convert";
import { getApiErrorMessage } from "@/lib/api/client";
import type {
  CollectionTopic,
  CollectionVisibility,
  PostCollectionApiShape,
} from "@/lib/api/collections";
import { COLLECTION_TOPIC_LABELS } from "@/lib/api/collections";

const MAX_IMAGE_BYTES = 25 * 1024 * 1024;

const VISIBILITY_OPTIONS: { value: CollectionVisibility; label: string }[] = [
  { value: "public", label: "Công khai" },
  { value: "private", label: "Riêng tư" },
];

const TOPIC_OPTIONS: { value: CollectionTopic; label: string }[] = (
  Object.entries(COLLECTION_TOPIC_LABELS) as [CollectionTopic, string][]
).map(([value, label]) => ({ value, label }));

// Modal "Tạo bộ sưu tập mới" - dung CHUNG SimpleModal (khung form don gian
// da co san, xem simple-modal.tsx) cho ca CollectionsGrid.tsx (nut "+ Tạo
// bộ sưu tập") va Composer.tsx (Panel "Thêm vào bộ sưu tập") - 2 noi goi
// TRUYEN onCreated rieng (1 ben them vao danh sach hien thi, 1 ben chon
// luon lam bo suu tap dang chon).
//
// Kiem "Chỉnh sửa" (collections/[id]/page.tsx) - dung LAI CHINH modal nay
// thay vi viet rieng 1 form: truyen them `mode="edit"` + `collection` (ban
// hien tai) de tien dien san form, doi nut/tieu de, va goi updateCollectionAction
// thay vi createCollectionAction luc luu - onCreated van goi voi ban da cap
// nhat (ten khong doi de KHONG phai sua lai 5 noi dang goi component nay).
export function CreateCollectionModal({
  open,
  onOpenChange,
  onCreated,
  mode = "create",
  collection,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (collection: PostCollectionApiShape) => void;
  mode?: "create" | "edit";
  collection?: PostCollectionApiShape;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<CollectionVisibility>("public");
  const [topic, setTopic] = useState<CollectionTopic | "">("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setTitle("");
    setDescription("");
    setVisibility("public");
    setTopic("");
    setCoverImageUrl("");
    setError(null);
  }

  // Moi lan CHUYEN tu dong sang mo (o mode edit) - dien lai DUNG gia tri
  // hien tai cua collection. Goi setState NGAY TRONG RENDER (khong qua
  // useEffect) theo dung pattern "Adjusting state when a prop changes" cua
  // React - component nay dung CHUNG giua cac lan mo/dong (khong remount) nen
  // khong the dung useState initializer 1 lan duy nhat.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open && mode === "edit" && collection) {
      setTitle(collection.title);
      setDescription(collection.description ?? "");
      setVisibility(collection.visibility);
      setTopic(collection.topic ?? "");
      setCoverImageUrl(collection.coverImageUrl ?? "");
      setError(null);
    }
  }

  async function handleCoverChange(file: File | undefined) {
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      setError("Ảnh bìa vượt quá 25MB.");
      return;
    }
    setIsUploadingCover(true);
    setError(null);
    try {
      const uploadFile = await convertHeicToJpegIfNeeded(file);
      if (uploadFile.size > MAX_IMAGE_BYTES) {
        setError("Ảnh bìa vượt quá 25MB.");
        return;
      }
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("kind", "image");
      const uploaded = await uploadPostImageAction(formData);
      setCoverImageUrl(uploaded.url);
    } catch (err) {
      setError(getApiErrorMessage(err, "Tải ảnh bìa thất bại, thử lại sau."));
    } finally {
      setIsUploadingCover(false);
    }
  }

  async function handleSubmit() {
    if (!title.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      // Mode edit: gui description/coverImageUrl DUNG nguyen (ke ca rong) de
      // nguoi dung xoa mo ta/anh bia di duoc that su - "|| undefined" (dung o
      // nhanh tao moi) se khien PATCH bo qua field rong, hieu la "khong doi"
      // thay vi "xoa", sai voi nut xoa anh bia (X) o duoi.
      const result =
        mode === "edit" && collection
          ? await updateCollectionAction(collection.id, {
              title: title.trim(),
              description: description.trim(),
              coverImageUrl,
              visibility,
              topic: topic || undefined,
            })
          : await createCollectionAction({
              title: title.trim(),
              description: description.trim() || undefined,
              coverImageUrl: coverImageUrl || undefined,
              visibility,
              topic: topic || undefined,
            });
      onCreated(result);
      onOpenChange(false);
      if (mode !== "edit") reset();
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          mode === "edit"
            ? "Không lưu được thay đổi, thử lại sau."
            : "Không tạo được bộ sưu tập, thử lại sau.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SimpleModal
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
      }}
      title={mode === "edit" ? "Chỉnh sửa bộ sưu tập" : "Tạo bộ sưu tập"}
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-semibold text-ink-muted">
            Tên bộ sưu tập *
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, 50))}
            maxLength={50}
            placeholder="VD: AI Research"
            className="mt-1.5 h-10 w-full rounded-md border border-input-border bg-input-bg px-3 text-sm text-input-text outline-none focus:border-input-focus focus:ring-2 focus:ring-input-focus/15"
          />
          <p className="mt-1 text-right text-xs text-ink-faint tabular-nums">
            {title.length}/50
          </p>
        </div>

        <div>
          <label className="text-xs font-semibold text-ink-muted">Mô tả</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 200))}
            maxLength={200}
            rows={3}
            placeholder="Viết vài dòng mô tả ngắn về bộ sưu tập..."
            className="mt-1.5 w-full resize-none rounded-md border border-input-border bg-input-bg px-3 py-2 text-sm text-input-text outline-none focus:border-input-focus focus:ring-2 focus:ring-input-focus/15"
          />
          <p className="mt-1 text-right text-xs text-ink-faint tabular-nums">
            {description.length}/200
          </p>
        </div>

        <div>
          <label className="text-xs font-semibold text-ink-muted">
            Ảnh bìa (tùy chọn)
          </label>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*,.heic,.heif"
            hidden
            onChange={(e) => handleCoverChange(e.target.files?.[0])}
          />
          {coverImageUrl ? (
            <div className="relative mt-1.5 aspect-video w-full overflow-hidden rounded-md">
              {/* eslint-disable-next-line @next/next/no-img-element -- anh vua upload, khong can toi uu Next/Image cho preview tam thoi */}
              <img
                src={coverImageUrl}
                alt=""
                className="size-full object-cover"
              />
              <button
                type="button"
                onClick={() => setCoverImageUrl("")}
                aria-label="Xoá ảnh bìa"
                className="absolute top-2 right-2 flex size-7 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
              >
                <X size={14} strokeWidth={2} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              disabled={isUploadingCover}
              className="mt-1.5 flex aspect-video w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-border bg-surface-muted text-ink-faint transition-colors duration-150 ease-out hover:bg-hover-bg disabled:cursor-wait"
            >
              <ImagePlus size={20} strokeWidth={1.6} />
              <span className="text-xs">
                {isUploadingCover ? "Đang tải..." : "Thay đổi ảnh"}
              </span>
            </button>
          )}
        </div>

        <div>
          <label className="text-xs font-semibold text-ink-muted">
            Chủ đề (tuỳ chọn)
          </label>
          <div className="mt-1.5">
            <SelectMenu
              value={topic}
              onChange={setTopic}
              options={TOPIC_OPTIONS}
              placeholder="Chọn chủ đề"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-ink-muted">Hiển thị</label>
          <div className="mt-1.5">
            <SelectMenu
              value={visibility}
              onChange={setVisibility}
              options={VISIBILITY_OPTIONS}
              placeholder="Chọn chế độ hiển thị"
            />
          </div>
          <p className="mt-1 text-xs text-ink-faint">
            {visibility === "public"
              ? "Mọi người đều có thể xem bộ sưu tập này."
              : "Chỉ mình bạn thấy, không hiện trên trang cá nhân."}
          </p>
        </div>

        {error && <p className="text-xs text-danger">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 cursor-pointer rounded-md px-3.5 text-sm font-semibold text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg"
          >
            Huỷ
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!title.trim() || isSubmitting}
            className="h-9 cursor-pointer rounded-md bg-ink px-3.5 text-sm font-semibold text-surface transition-opacity duration-150 ease-out hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {mode === "edit"
              ? isSubmitting
                ? "Đang lưu..."
                : "Lưu thay đổi"
              : isSubmitting
                ? "Đang tạo..."
                : "Tạo bộ sưu tập"}
          </button>
        </div>
      </div>
    </SimpleModal>
  );
}
