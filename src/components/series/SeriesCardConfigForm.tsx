"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ImagePlus, X } from "lucide-react";
import { toast } from "@/lib/toast/toast-store";
import { getApiErrorMessage } from "@/lib/api/client";
import { uploadPostImageAction } from "@/actions/discover/upload-post-image";
import { convertHeicToJpegIfNeeded } from "@/lib/heic-convert";
import { updateContentSeriesAction } from "@/actions/discover/content-series/update-content-series";
import { RepeaterField, RemoveRowButton } from "@/components/series/RepeaterField";
import { SelectMenu } from "@/components/ui/select-menu";
import { SeriesCampaignCard } from "@/components/series/SeriesCampaignCard";
import type {
  ContentSeriesOverview,
  ContentSeriesAction,
  ContentSeriesActionStyle,
  ContentSeriesBadgeVariant,
} from "@/lib/api/content-series";

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13px] outline-none focus:border-primary";
const labelClass = "mb-1 block text-[13px] font-medium text-ink";
const groupClass = "rounded-xl border border-border p-4";
const groupTitleClass = "mb-3 text-[13px] font-semibold text-ink";

const BADGE_VARIANT_OPTIONS: { value: ContentSeriesBadgeVariant; label: string }[] = [
  { value: "info", label: "Info" },
  { value: "success", label: "Success" },
  { value: "warning", label: "Warning" },
  { value: "deadline", label: "Deadline" },
  { value: "custom", label: "Custom" },
];
const ACTION_STYLE_OPTIONS: { value: ContentSeriesActionStyle; label: string }[] = [
  { value: "primary", label: "Primary button" },
  { value: "secondary", label: "Secondary button" },
  { value: "text", label: "Text link" },
];

function randomId(): string {
  return Math.random().toString(36).slice(2);
}

// Tab "Thẻ hiển thị" trong SeriesManageTabs.tsx - cau hinh toan bo
// "campaign card" (badge/deadline/anh/nen/CTA/an-hien) cua 1 Series, xem
// SeriesCampaignCard.tsx (noi RENDER cac field nay) + ContentSeriesCardFields
// (kieu du lieu dung chung). Chia nhom Badge&Deadline/Appearance/Actions/
// Display THEO DUNG cau truc nguoi dung yeu cau - KHONG gop thanh 1 form
// phang dai, cung KHONG bien thanh "mini Figma" (yeu cau nguoi dung: chi
// cho chon 3 muc Card style thay vi nhap tay moi thong so CSS).
export function SeriesCardConfigForm({ series }: { series: ContentSeriesOverview }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [coverImageUrl, setCoverImageUrl] = useState(series.coverImageUrl ?? "");
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [badgeText, setBadgeText] = useState(series.badgeText ?? "");
  const [badgeVariant, setBadgeVariant] = useState<ContentSeriesBadgeVariant>(series.badgeVariant);
  const [badgeColor, setBadgeColor] = useState(series.badgeColor ?? "#2563eb");
  const [badgeTextColor, setBadgeTextColor] = useState(series.badgeTextColor ?? "#ffffff");
  const [showBadge, setShowBadge] = useState(series.showBadge);
  // datetime-local input can dang "YYYY-MM-DDTHH:mm" - cat bot phan giay/Z
  // cua ISO string luu san.
  const [deadlineAt, setDeadlineAt] = useState(series.deadlineAt ? series.deadlineAt.slice(0, 16) : "");
  const [showDeadline, setShowDeadline] = useState(series.showDeadline);

  const [imagePosition, setImagePosition] = useState<"left" | "right">(series.imagePosition);
  const [imageWidthPercent, setImageWidthPercent] = useState(series.imageWidthPercent);
  const [imageFit, setImageFit] = useState<"cover" | "contain">(series.imageFit);
  const [backgroundColor, setBackgroundColor] = useState(series.backgroundColor ?? "");
  const [textTheme, setTextTheme] = useState<"dark" | "light">(series.textTheme);
  const [cardStyle, setCardStyle] = useState<"default" | "soft" | "accent">(series.cardStyle);

  const [actions, setActions] = useState<ContentSeriesAction[]>(series.actions);
  const [isVisible, setIsVisible] = useState(series.isVisible);

  async function handleCoverChange(file: File | undefined) {
    if (!file) return;
    setIsUploadingCover(true);
    try {
      const uploadFile = await convertHeicToJpegIfNeeded(file);
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("kind", "image");
      const uploaded = await uploadPostImageAction(formData);
      setCoverImageUrl(uploaded.url);
    } catch (err) {
      toast.danger(getApiErrorMessage(err, "Tải ảnh thất bại, thử lại sau."));
    } finally {
      setIsUploadingCover(false);
    }
  }

  function moveAction(index: number, direction: -1 | 1) {
    setActions((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateContentSeriesAction(series.slug, {
        coverImageUrl,
        badgeText: badgeText.trim() || undefined,
        badgeVariant,
        badgeColor: badgeVariant === "custom" ? badgeColor : undefined,
        badgeTextColor: badgeVariant === "custom" ? badgeTextColor : undefined,
        showBadge,
        deadlineAt: deadlineAt ? new Date(deadlineAt).toISOString() : null,
        showDeadline,
        imagePosition,
        imageWidthPercent,
        imageFit,
        backgroundColor: backgroundColor || undefined,
        textTheme,
        cardStyle,
        actions,
        isVisible,
      });
      toast.success("Đã lưu cấu hình thẻ hiển thị");
      router.refresh();
    } catch (err) {
      toast.danger(getApiErrorMessage(err, "Lưu thất bại, thử lại sau."));
    } finally {
      setSaving(false);
    }
  }

  // Doi tuong preview - GHEP tam thoi tu state form + du lieu goc cua series
  // (title/description/slug/_count khong doi trong tab nay) de tai su dung
  // DUNG component render THAT (SeriesCampaignCard) lam live preview, tranh
  // 2 noi ve UI card khac nhau bi lech.
  const previewSeries = {
    ...series,
    coverImageUrl: coverImageUrl || null,
    badgeText: badgeText || null,
    badgeVariant,
    badgeColor: badgeVariant === "custom" ? badgeColor : null,
    badgeTextColor: badgeVariant === "custom" ? badgeTextColor : null,
    showBadge,
    deadlineAt: deadlineAt ? new Date(deadlineAt).toISOString() : null,
    showDeadline,
    imagePosition,
    imageWidthPercent,
    imageFit,
    backgroundColor: backgroundColor || null,
    textTheme,
    cardStyle,
    actions,
    isVisible,
    _count: { entries: series.entries.length },
  };

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <form onSubmit={handleSubmit} className="flex min-w-0 flex-1 flex-col gap-5">
        <div className={groupClass}>
          <p className={groupTitleClass}>Badge & Deadline</p>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 text-[13px] text-ink">
              <input type="checkbox" checked={showBadge} onChange={(e) => setShowBadge(e.target.checked)} />
              Hiện badge
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Badge text</label>
                <input
                  className={inputClass}
                  placeholder="Vd: Đang cập nhật"
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Loại badge</label>
                <SelectMenu
                  value={badgeVariant}
                  onChange={setBadgeVariant}
                  options={BADGE_VARIANT_OPTIONS}
                  placeholder="Chọn loại"
                />
              </div>
            </div>
            {badgeVariant === "custom" && (
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1">
                  <span className="text-[11px] text-ink-faint">Màu nền badge</span>
                  <input
                    type="color"
                    value={badgeColor}
                    onChange={(e) => setBadgeColor(e.target.value)}
                    className="h-8 w-full cursor-pointer rounded-md border border-border bg-surface p-0.5"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-[11px] text-ink-faint">Màu chữ badge</span>
                  <input
                    type="color"
                    value={badgeTextColor}
                    onChange={(e) => setBadgeTextColor(e.target.value)}
                    className="h-8 w-full cursor-pointer rounded-md border border-border bg-surface p-0.5"
                  />
                </label>
              </div>
            )}
            <div className="border-t border-border pt-3">
              <label className="flex items-center gap-2 text-[13px] text-ink">
                <input
                  type="checkbox"
                  checked={showDeadline}
                  onChange={(e) => setShowDeadline(e.target.checked)}
                />
                Hiện deadline (tự tính &quot;Còn N ngày&quot;)
              </label>
              <input
                type="datetime-local"
                className={`${inputClass} mt-2`}
                value={deadlineAt}
                onChange={(e) => setDeadlineAt(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className={groupClass}>
          <p className={groupTitleClass}>Appearance</p>
          <div className="flex flex-col gap-3">
            <div>
              <label className={labelClass}>Ảnh thẻ (dùng chung với ảnh bìa trang tổng quan)</label>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,.heic,.heif"
                hidden
                onChange={(e) => handleCoverChange(e.target.files?.[0])}
              />
              {coverImageUrl ? (
                <div className="relative mt-1.5 aspect-2/1 w-full max-w-xs overflow-hidden rounded-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element -- anh vua upload, khong can toi uu Next/Image cho preview tam thoi */}
                  <img src={coverImageUrl} alt="" className="size-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setCoverImageUrl("")}
                    aria-label="Xoá ảnh"
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
                  className="mt-1.5 flex aspect-2/1 w-full max-w-xs cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border bg-surface-muted text-ink-faint transition-colors duration-150 ease-out hover:bg-hover-bg disabled:cursor-wait"
                >
                  <ImagePlus size={20} strokeWidth={1.6} />
                  <span className="text-xs">{isUploadingCover ? "Đang tải..." : "Chọn ảnh"}</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className={labelClass}>Vị trí ảnh</label>
                <SelectMenu
                  value={imagePosition}
                  onChange={setImagePosition}
                  options={[
                    { value: "left", label: "Trái" },
                    { value: "right", label: "Phải" },
                  ]}
                  placeholder="Vị trí"
                />
              </div>
              <div>
                <label className={labelClass}>Độ rộng ảnh (%)</label>
                <input
                  type="number"
                  min={30}
                  max={65}
                  className={inputClass}
                  value={imageWidthPercent}
                  onChange={(e) => setImageWidthPercent(Number(e.target.value) || 45)}
                />
              </div>
              <div>
                <label className={labelClass}>Cách hiển thị ảnh</label>
                <SelectMenu
                  value={imageFit}
                  onChange={setImageFit}
                  options={[
                    { value: "cover", label: "Cover (lấp đầy, có thể cắt)" },
                    { value: "contain", label: "Contain (giữ nguyên tỉ lệ)" },
                  ]}
                  placeholder="Cách hiển thị"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className={labelClass}>Nền thẻ (để trống = mặc định)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={backgroundColor || "#ffffff"}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="h-9 w-10 shrink-0 cursor-pointer rounded-md border border-border bg-surface p-0.5"
                  />
                  <input
                    className={inputClass}
                    placeholder="#RRGGBB"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Tông chữ (khi có nền tuỳ chỉnh)</label>
                <SelectMenu
                  value={textTheme}
                  onChange={setTextTheme}
                  options={[
                    { value: "dark", label: "Dark (chữ tối)" },
                    { value: "light", label: "Light (chữ trắng)" },
                  ]}
                  placeholder="Tông chữ"
                />
              </div>
              <div>
                <label className={labelClass}>Card style</label>
                <SelectMenu
                  value={cardStyle}
                  onChange={setCardStyle}
                  options={[
                    { value: "default", label: "Default (viền mảnh)" },
                    { value: "soft", label: "Soft (bóng nhẹ, không viền)" },
                    { value: "accent", label: "Accent (viền đậm)" },
                  ]}
                  placeholder="Card style"
                />
              </div>
            </div>
          </div>
        </div>

        <div className={groupClass}>
          <p className={groupTitleClass}>Actions (CTA)</p>
          <RepeaterField
            items={actions}
            onChange={setActions}
            newItem={(): ContentSeriesAction => ({
              id: randomId(),
              label: "",
              url: "",
              style: "primary",
            })}
            addLabel="Thêm action"
            renderRow={(item, update, remove, index) => (
              <div className="flex items-start gap-2">
                <div className="grid min-w-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto_auto]">
                  <input
                    className={inputClass}
                    placeholder="Label (vd: Xem chi tiết)"
                    value={item.label}
                    onChange={(e) => update({ label: e.target.value })}
                  />
                  <input
                    className={inputClass}
                    placeholder="URL (/series/... hoặc https://...)"
                    value={item.url}
                    onChange={(e) => update({ url: e.target.value })}
                  />
                  <SelectMenu
                    value={item.style}
                    onChange={(style) => update({ style })}
                    options={ACTION_STYLE_OPTIONS}
                    placeholder="Kiểu"
                  />
                  <label className="flex items-center gap-1.5 text-[12px] whitespace-nowrap text-ink-faint">
                    <input
                      type="checkbox"
                      checked={item.openInNewTab ?? false}
                      onChange={(e) => update({ openInNewTab: e.target.checked })}
                    />
                    Tab mới
                  </label>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveAction(index, -1)}
                    className="flex size-7 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-hover-bg disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ArrowUp size={13} />
                  </button>
                  <button
                    type="button"
                    disabled={index === actions.length - 1}
                    onClick={() => moveAction(index, 1)}
                    className="flex size-7 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-hover-bg disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ArrowDown size={13} />
                  </button>
                  <RemoveRowButton onClick={remove} />
                </div>
              </div>
            )}
          />
        </div>

        <div className={groupClass}>
          <p className={groupTitleClass}>Display</p>
          <label className="flex items-center gap-2 text-[13px] text-ink">
            <input type="checkbox" checked={isVisible} onChange={(e) => setIsVisible(e.target.checked)} />
            Hiện trên /home và /series (bỏ tick để ẩn mà không xoá Series)
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="cursor-pointer self-start rounded-lg bg-ink px-5 py-2.5 text-[14px] font-semibold text-surface transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Đang lưu..." : "Lưu cấu hình"}
        </button>
      </form>

      <div className="w-full shrink-0 lg:sticky lg:top-6 lg:h-fit lg:w-105">
        <p className="mb-2 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
          Live preview
        </p>
        <SeriesCampaignCard series={previewSeries} variant="banner" />
      </div>
    </div>
  );
}
