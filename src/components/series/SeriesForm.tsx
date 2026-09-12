"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast/toast-store";
import { getApiErrorMessage } from "@/lib/api/client";
import { createContentSeriesAction } from "@/actions/discover/content-series/create-content-series";
import { updateContentSeriesAction } from "@/actions/discover/content-series/update-content-series";
import { RepeaterField, RemoveRowButton } from "@/components/series/RepeaterField";
import type {
  ContentSeriesOverview,
  ContentSeriesStat,
  ContentSeriesInstallTab,
  ContentSeriesExternalLink,
} from "@/lib/api/content-series";

const SHARE_CHANNEL_OPTIONS = [
  { value: "x", label: "X" },
  { value: "bluesky", label: "Bluesky" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "copy", label: "Copy link" },
];

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13px] outline-none focus:border-primary";
const labelClass = "mb-1 block text-[13px] font-medium text-ink";

// Form Cap 1 (Thong tin chung Series) - dung chung cho ca tao moi va sua, xem
// SeriesCreateForm/SeriesInfoPanel goi component nay. Repeater cho
// stats/installTabs/externalLinks dung chung RepeaterField.tsx.
export function SeriesForm({ initial }: { initial?: ContentSeriesOverview }) {
  const router = useRouter();
  const isEdit = Boolean(initial);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [authorName, setAuthorName] = useState(initial?.authorName ?? "");
  const [authorAvatarUrl, setAuthorAvatarUrl] = useState(initial?.authorAvatarUrl ?? "");
  const [emailCourseEnabled, setEmailCourseEnabled] = useState(
    initial?.emailCourseEnabled ?? false,
  );
  const [emailCourseTitle, setEmailCourseTitle] = useState(initial?.emailCourseTitle ?? "");
  const [emailCourseDescription, setEmailCourseDescription] = useState(
    initial?.emailCourseDescription ?? "",
  );
  const [stats, setStats] = useState<ContentSeriesStat[]>(initial?.stats ?? []);
  const [installTabs, setInstallTabs] = useState<ContentSeriesInstallTab[]>(
    initial?.installTabs ?? [],
  );
  const [externalLinks, setExternalLinks] = useState<ContentSeriesExternalLink[]>(
    initial?.externalLinks ?? [],
  );
  const [shareChannels, setShareChannels] = useState<string[]>(
    initial?.shareChannels ?? ["x", "bluesky", "linkedin", "copy"],
  );

  function toggleShareChannel(value: string) {
    setShareChannels((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !authorName.trim()) {
      toast.danger("Điền đủ Tiêu đề, Mô tả, Tác giả trước đã.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title,
        slug: slug.trim() || undefined,
        description,
        authorName,
        authorAvatarUrl: authorAvatarUrl.trim() || undefined,
        emailCourseEnabled,
        emailCourseTitle: emailCourseTitle.trim() || undefined,
        emailCourseDescription: emailCourseDescription.trim() || undefined,
        stats,
        installTabs,
        externalLinks,
        shareChannels,
      };
      if (isEdit && initial) {
        await updateContentSeriesAction(initial.slug, payload);
        toast.success("Đã lưu thông tin Series");
        router.refresh();
      } else {
        const created = await createContentSeriesAction(payload);
        toast.success("Đã tạo Series");
        router.push(`/series/${created.slug}/manage`);
      }
    } catch (err) {
      toast.danger(getApiErrorMessage(err, "Lưu thất bại, thử lại sau."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <label className={labelClass}>Tiêu đề *</label>
        <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <label className={labelClass}>Slug</label>
        <input
          className={inputClass}
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="tự sinh từ tiêu đề nếu để trống"
        />
      </div>
      <div>
        <label className={labelClass}>Mô tả * (hỗ trợ markdown: **đậm**, `code`, [link](url))</label>
        <textarea
          className={`${inputClass} min-h-24 resize-y`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Tên tác giả *</label>
          <input
            className={inputClass}
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Avatar tác giả (URL)</label>
          <input
            className={inputClass}
            value={authorAvatarUrl}
            onChange={(e) => setAuthorAvatarUrl(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-[13px] font-semibold text-ink">Stats Bar</label>
        <RepeaterField
          items={stats}
          onChange={setStats}
          newItem={(): ContentSeriesStat => ({ label: "", value: "" })}
          addLabel="Thêm stat"
          renderRow={(item, update, remove) => (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_1fr_1fr_auto]">
              <input
                className={inputClass}
                placeholder="Label"
                value={item.label}
                onChange={(e) => update({ label: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="Value"
                value={item.value}
                onChange={(e) => update({ value: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="Icon (lucide, vd Star)"
                value={item.icon ?? ""}
                onChange={(e) => update({ icon: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="Link (tuỳ chọn)"
                value={item.link ?? ""}
                onChange={(e) => update({ link: e.target.value })}
              />
              <RemoveRowButton onClick={remove} />
            </div>
          )}
        />
      </div>

      <div>
        <label className="mb-2 block text-[13px] font-semibold text-ink">
          Install Methods (mặc định của Series)
        </label>
        <RepeaterField
          items={installTabs}
          onChange={setInstallTabs}
          newItem={(): ContentSeriesInstallTab => ({ label: "", command: "" })}
          addLabel="Thêm install tab"
          renderRow={(item, update, remove) => (
            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <div className="grid min-w-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
                  <input
                    className={inputClass}
                    placeholder="Tab label (vd All agents)"
                    value={item.label}
                    onChange={(e) => update({ label: e.target.value })}
                  />
                  <input
                    className={`${inputClass} font-mono`}
                    placeholder="Command"
                    value={item.command}
                    onChange={(e) => update({ command: e.target.value })}
                  />
                </div>
                <RemoveRowButton onClick={remove} />
              </div>
              <input
                className={inputClass}
                placeholder="Ghi chú (tuỳ chọn)"
                value={item.note ?? ""}
                onChange={(e) => update({ note: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="Link tham khảo (tuỳ chọn)"
                value={item.link ?? ""}
                onChange={(e) => update({ link: e.target.value })}
              />
            </div>
          )}
        />
      </div>

      <div>
        <label className="mb-2 block text-[13px] font-semibold text-ink">External Links</label>
        <RepeaterField
          items={externalLinks}
          onChange={setExternalLinks}
          newItem={(): ContentSeriesExternalLink => ({ label: "", url: "" })}
          addLabel="Thêm link"
          renderRow={(item, update, remove) => (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
              <input
                className={inputClass}
                placeholder="Label"
                value={item.label}
                onChange={(e) => update({ label: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="URL"
                value={item.url}
                onChange={(e) => update({ url: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="Icon (lucide, vd Github)"
                value={item.icon ?? ""}
                onChange={(e) => update({ icon: e.target.value })}
              />
              <RemoveRowButton onClick={remove} />
            </div>
          )}
        />
      </div>

      <div>
        <label className="mb-2 block text-[13px] font-semibold text-ink">Share Channels</label>
        <div className="flex flex-wrap gap-3">
          {SHARE_CHANNEL_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-1.5 text-[13px]">
              <input
                type="checkbox"
                checked={shareChannels.includes(opt.value)}
                onChange={() => toggleShareChannel(opt.value)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border p-4">
        <label className="flex items-center gap-2 text-[13px] font-semibold text-ink">
          <input
            type="checkbox"
            checked={emailCourseEnabled}
            onChange={(e) => setEmailCourseEnabled(e.target.checked)}
          />
          Email Course
        </label>
        {emailCourseEnabled && (
          <div className="mt-3 flex flex-col gap-3">
            <input
              className={inputClass}
              placeholder="Tiêu đề CTA"
              value={emailCourseTitle}
              onChange={(e) => setEmailCourseTitle(e.target.value)}
            />
            <textarea
              className={`${inputClass} min-h-16 resize-y`}
              placeholder="Mô tả"
              value={emailCourseDescription}
              onChange={(e) => setEmailCourseDescription(e.target.value)}
            />
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={saving}
        className="cursor-pointer self-start rounded-lg bg-ink px-5 py-2.5 text-[14px] font-semibold text-surface transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Tạo Series"}
      </button>
    </form>
  );
}
