"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast/toast-store";
import { getApiErrorMessage } from "@/lib/api/client";
import { createContentSeriesEntryAction } from "@/actions/discover/content-series/create-content-series-entry";
import { updateContentSeriesEntryAction } from "@/actions/discover/content-series/update-content-series-entry";
import { DocsMarkdown } from "@/components/docs/DocsMarkdown";
import { RepeaterField, RemoveRowButton } from "@/components/series/RepeaterField";
import type {
  ContentSeriesCategory,
  ContentSeriesEntryDetail,
  ContentSeriesFaqItem,
  ContentSeriesInstallTab,
} from "@/lib/api/content-series";

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13px] outline-none focus:border-primary";
const labelClass = "mb-1 block text-[13px] font-medium text-ink";

function estimateReadTime(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

// Cap 3 (Soan Entry) - layout 2 cot: form ben trai, live preview ben phai
// (dac ta muc "Layout editor: 2 cot"). Dung chung cho tao moi va sua, giong
// SeriesForm.tsx.
export function SeriesEntryForm({
  seriesSlug,
  categories,
  defaultCategoryId,
  initial,
}: {
  seriesSlug: string;
  categories: ContentSeriesCategory[];
  defaultCategoryId?: string;
  initial?: ContentSeriesEntryDetail;
}) {
  const router = useRouter();
  const isEdit = Boolean(initial);
  const [saving, setSaving] = useState(false);

  const [categoryId, setCategoryId] = useState(
    initial?.categoryId ?? defaultCategoryId ?? categories[0]?.id ?? "",
  );
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? "");
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? "");
  const [source, setSource] = useState(initial?.source ?? "");
  const [contentMarkdown, setContentMarkdown] = useState(initial?.contentMarkdown ?? "");
  const [hasFaq, setHasFaq] = useState(Boolean(initial?.faq?.length));
  const [faq, setFaq] = useState<ContentSeriesFaqItem[]>(initial?.faq ?? []);
  const [installOverride, setInstallOverride] = useState(Boolean(initial?.installTabs?.length));
  const [installTabs, setInstallTabs] = useState<ContentSeriesInstallTab[]>(
    initial?.installTabs ?? [],
  );
  const [readTimeOverride, setReadTimeOverride] = useState(initial?.readTimeMinutes ?? undefined);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !contentMarkdown.trim() || !categoryId) {
      toast.danger("Điền đủ Category, Tiêu đề, Nội dung trước đã.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        categoryId,
        title,
        slug: slug.trim() || undefined,
        subtitle: subtitle.trim() || undefined,
        icon: icon.trim() || undefined,
        source: source.trim() || undefined,
        contentMarkdown,
        faq: hasFaq ? faq : [],
        installTabs: installOverride ? installTabs : undefined,
        readTimeMinutes: readTimeOverride,
      };
      if (isEdit && initial) {
        await updateContentSeriesEntryAction(seriesSlug, initial.id, payload);
        toast.success("Đã lưu Entry");
      } else {
        await createContentSeriesEntryAction(seriesSlug, payload);
        toast.success("Đã tạo Entry");
      }
      router.push(`/series/${seriesSlug}/manage`);
    } catch (err) {
      toast.danger(getApiErrorMessage(err, "Lưu thất bại, thử lại sau."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex gap-8">
      <form onSubmit={handleSubmit} className="flex min-w-0 flex-1 flex-col gap-5">
        <div>
          <label className={labelClass}>Category *</label>
          <select
            className={inputClass}
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.title}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[auto_1fr]">
          <div className="sm:w-20">
            <label className={labelClass}>Icon</label>
            <input
              className={inputClass}
              placeholder="✨"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Tiêu đề *</label>
            <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
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
          <label className={labelClass}>Subtitle</label>
          <input
            className={inputClass}
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
          />
        </div>

        <div>
          <label className={labelClass}>Source (vd mattpocock/skills)</label>
          <input className={inputClass} value={source} onChange={(e) => setSource(e.target.value)} />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className={labelClass}>Nội dung (markdown) *</label>
            <span className="text-[12px] text-ink-faint">
              Read time: {readTimeOverride ?? estimateReadTime(contentMarkdown)} phút
              <button
                type="button"
                onClick={() =>
                  setReadTimeOverride((v) => (v === undefined ? estimateReadTime(contentMarkdown) : undefined))
                }
                className="ml-2 cursor-pointer text-primary hover:underline"
              >
                {readTimeOverride === undefined ? "ghi đè" : "dùng auto"}
              </button>
              {readTimeOverride !== undefined && (
                <input
                  type="number"
                  min={1}
                  className="ml-2 w-14 rounded-md border border-border px-1.5 py-0.5 text-[12px]"
                  value={readTimeOverride}
                  onChange={(e) => setReadTimeOverride(Number(e.target.value) || 1)}
                />
              )}
            </span>
          </div>
          <textarea
            className={`${inputClass} min-h-64 resize-y font-mono text-[13px]`}
            value={contentMarkdown}
            onChange={(e) => setContentMarkdown(e.target.value)}
          />
        </div>

        <div className="rounded-xl border border-border p-4">
          <label className="flex items-center gap-2 text-[13px] font-semibold text-ink">
            <input type="checkbox" checked={hasFaq} onChange={(e) => setHasFaq(e.target.checked)} />
            FAQ
          </label>
          {hasFaq && (
            <div className="mt-3">
              <RepeaterField
                items={faq}
                onChange={setFaq}
                newItem={(): ContentSeriesFaqItem => ({ question: "", answer: "" })}
                addLabel="Thêm câu hỏi"
                renderRow={(item, update, remove) => (
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1 space-y-2">
                      <input
                        className={inputClass}
                        placeholder="Câu hỏi"
                        value={item.question}
                        onChange={(e) => update({ question: e.target.value })}
                      />
                      <textarea
                        className={`${inputClass} min-h-16 resize-y`}
                        placeholder="Trả lời (markdown)"
                        value={item.answer}
                        onChange={(e) => update({ answer: e.target.value })}
                      />
                    </div>
                    <RemoveRowButton onClick={remove} />
                  </div>
                )}
              />
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border p-4">
          <label className="flex items-center gap-2 text-[13px] font-semibold text-ink">
            <input
              type="checkbox"
              checked={installOverride}
              onChange={(e) => setInstallOverride(e.target.checked)}
            />
            Dùng install config riêng cho Entry này (mặc định kế thừa Series)
          </label>
          {installOverride && (
            <div className="mt-3">
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
                          placeholder="Tab label"
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
                      placeholder="Post-install note (vd: Then type /skill...)"
                      value={item.note ?? ""}
                      onChange={(e) => update({ note: e.target.value })}
                    />
                  </div>
                )}
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="cursor-pointer self-start rounded-lg bg-ink px-5 py-2.5 text-[14px] font-semibold text-surface transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Đang lưu..." : isEdit ? "Lưu Entry" : "Tạo Entry"}
        </button>
      </form>

      <div className="hidden w-80 shrink-0 lg:block">
        <p className="mb-2 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
          Live preview
        </p>
        <div className="rounded-xl border border-border p-4">
          <h2 className="text-[18px] font-bold text-ink">{title || "(chưa có tiêu đề)"}</h2>
          {subtitle && <p className="mt-1 text-[13px] text-ink-faint">{subtitle}</p>}
          <div className="mt-3">
            <DocsMarkdown markdown={contentMarkdown || "*chưa có nội dung*"} />
          </div>
        </div>
      </div>
    </div>
  );
}
