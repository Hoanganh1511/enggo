"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "@/lib/toast/toast-store";
import { getApiErrorMessage } from "@/lib/api/client";
import { createContentSeriesCategoryAction } from "@/actions/discover/content-series/create-content-series-category";
import { updateContentSeriesCategoryAction } from "@/actions/discover/content-series/update-content-series-category";
import { deleteContentSeriesCategoryAction } from "@/actions/discover/content-series/delete-content-series-category";
import { moveContentSeriesCategoryAction } from "@/actions/discover/content-series/move-content-series-category";
import { deleteContentSeriesEntryAction } from "@/actions/discover/content-series/delete-content-series-entry";
import { moveContentSeriesEntryAction } from "@/actions/discover/content-series/move-content-series-entry";
import type { ContentSeriesCategory, ContentSeriesEntrySummary } from "@/lib/api/content-series";

const inputClass =
  "rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[13px] outline-none focus:border-primary";

// Cap 2 (Quan ly Category & cau truc) - MVP dung nut len/xuong thay drag-
// and-drop that (xem dac ta), chua ho tro nested sub-category (parentId luon
// null tu UI nay). Sau moi thao tac goi router.refresh() de lay lai du lieu
// that tu server thay vi tu dong bo state cuc bo - don gian hon, tranh lech
// voi backend (vd orderIndex sau khi move).
export function SeriesTreeManager({
  seriesSlug,
  categories,
  entries,
}: {
  seriesSlug: string;
  categories: ContentSeriesCategory[];
  entries: ContentSeriesEntrySummary[];
}) {
  const router = useRouter();
  const [newCategoryTitle, setNewCategoryTitle] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renameColor, setRenameColor] = useState("");
  const [busy, setBusy] = useState(false);

  const sortedCategories = [...categories].sort((a, b) => a.orderIndex - b.orderIndex);
  const sortedEntries = [...entries].sort((a, b) => a.orderIndex - b.orderIndex);
  const globalRank = new Map(sortedEntries.map((e, i) => [e.id, i + 1]));

  async function run(action: () => Promise<unknown>, errorFallback: string) {
    setBusy(true);
    try {
      await action();
      router.refresh();
    } catch (err) {
      toast.danger(getApiErrorMessage(err, errorFallback));
    } finally {
      setBusy(false);
    }
  }

  function startRename(cat: ContentSeriesCategory) {
    setRenamingId(cat.id);
    setRenameValue(cat.title);
    setRenameColor(cat.colorHex ?? "");
  }

  return (
    <div className="flex flex-col gap-5">
      {sortedCategories.map((cat, catIndex) => {
        const catEntries = sortedEntries.filter((e) => e.categoryId === cat.id);
        const isRenaming = renamingId === cat.id;
        return (
          <div key={cat.id} className="rounded-xl border border-border p-4">
            <div className="flex items-center justify-between gap-2">
              {isRenaming ? (
                <div className="flex flex-1 flex-wrap items-center gap-2">
                  <input
                    className={inputClass}
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                  />
                  <input
                    className={`${inputClass} w-24`}
                    placeholder="#hex"
                    value={renameColor}
                    onChange={(e) => setRenameColor(e.target.value)}
                  />
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      run(async () => {
                        await updateContentSeriesCategoryAction(seriesSlug, cat.id, {
                          title: renameValue,
                          colorHex: renameColor || undefined,
                        });
                        setRenamingId(null);
                      }, "Đổi tên thất bại")
                    }
                    className="cursor-pointer rounded-md bg-ink px-2.5 py-1.5 text-[12px] font-semibold text-surface"
                  >
                    Lưu
                  </button>
                  <button
                    type="button"
                    onClick={() => setRenamingId(null)}
                    className="cursor-pointer rounded-md px-2.5 py-1.5 text-[12px] text-ink-faint hover:bg-hover-bg"
                  >
                    Huỷ
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: cat.colorHex ?? "var(--color-border-strong)" }}
                    aria-hidden="true"
                  />
                  <p className="font-semibold text-ink">{cat.title}</p>
                </div>
              )}

              {!isRenaming && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={busy || catIndex === 0}
                    onClick={() =>
                      run(
                        () => moveContentSeriesCategoryAction(seriesSlug, cat.id, "up"),
                        "Di chuyển thất bại",
                      )
                    }
                    className="flex size-7 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-hover-bg disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    disabled={busy || catIndex === sortedCategories.length - 1}
                    onClick={() =>
                      run(
                        () => moveContentSeriesCategoryAction(seriesSlug, cat.id, "down"),
                        "Di chuyển thất bại",
                      )
                    }
                    className="flex size-7 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-hover-bg disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => startRename(cat)}
                    className="flex size-7 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-hover-bg"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      run(
                        () => deleteContentSeriesCategoryAction(seriesSlug, cat.id),
                        "Không xoá được category này",
                      )
                    }
                    className="flex size-7 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-hover-bg hover:text-danger"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </div>

            <div className="mt-3 flex flex-col gap-1">
              {catEntries.map((entry, entryIndexInCat) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-2 rounded-md py-1.5 pr-1 pl-2 hover:bg-hover-bg"
                >
                  <span className="w-7 shrink-0 font-mono text-[11px] text-ink-faint">
                    {String(globalRank.get(entry.id)).padStart(2, "0")}
                  </span>
                  <Link
                    href={`/series/${seriesSlug}/manage/entries/${entry.slug}`}
                    className="min-w-0 flex-1 truncate text-[13px] text-ink hover:underline"
                  >
                    {entry.icon && <span className="mr-1">{entry.icon}</span>}
                    {entry.title}
                  </Link>
                  <button
                    type="button"
                    disabled={busy || entryIndexInCat === 0}
                    onClick={() =>
                      run(
                        () => moveContentSeriesEntryAction(seriesSlug, entry.id, "up"),
                        "Di chuyển thất bại",
                      )
                    }
                    className="flex size-6 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-surface disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ArrowUp size={12} />
                  </button>
                  <button
                    type="button"
                    disabled={busy || entryIndexInCat === catEntries.length - 1}
                    onClick={() =>
                      run(
                        () => moveContentSeriesEntryAction(seriesSlug, entry.id, "down"),
                        "Di chuyển thất bại",
                      )
                    }
                    className="flex size-6 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-surface disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ArrowDown size={12} />
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      run(
                        () => deleteContentSeriesEntryAction(seriesSlug, entry.id),
                        "Xoá entry thất bại",
                      )
                    }
                    className="flex size-6 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-surface hover:text-danger"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              <Link
                href={`/series/${seriesSlug}/manage/entries/new?categoryId=${cat.id}`}
                className="mt-1 flex items-center gap-1.5 self-start rounded-md px-2 py-1.5 text-[12px] font-medium text-primary hover:bg-primary-soft"
              >
                <Plus size={13} /> Entry mới
              </Link>
            </div>
          </div>
        );
      })}

      <div className="flex items-center gap-2">
        <input
          className={`${inputClass} flex-1`}
          placeholder="Tên category mới"
          value={newCategoryTitle}
          onChange={(e) => setNewCategoryTitle(e.target.value)}
        />
        <button
          type="button"
          disabled={busy || !newCategoryTitle.trim()}
          onClick={() =>
            run(async () => {
              await createContentSeriesCategoryAction(seriesSlug, { title: newCategoryTitle });
              setNewCategoryTitle("");
            }, "Tạo category thất bại")
          }
          className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-[13px] font-medium text-ink hover:bg-hover-bg disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={14} /> Add category
        </button>
      </div>
    </div>
  );
}
