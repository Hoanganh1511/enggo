"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, GripVertical, ListOrdered, Pencil, Plus, Trash2 } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "@/lib/toast/toast-store";
import { getApiErrorMessage } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { createContentSeriesCategoryAction } from "@/actions/discover/content-series/create-content-series-category";
import { updateContentSeriesCategoryAction } from "@/actions/discover/content-series/update-content-series-category";
import { deleteContentSeriesCategoryAction } from "@/actions/discover/content-series/delete-content-series-category";
import { moveContentSeriesCategoryAction } from "@/actions/discover/content-series/move-content-series-category";
import { reorderContentSeriesCategoriesAction } from "@/actions/discover/content-series/reorder-content-series-categories";
import { deleteContentSeriesEntryAction } from "@/actions/discover/content-series/delete-content-series-entry";
import { moveContentSeriesEntryAction } from "@/actions/discover/content-series/move-content-series-entry";
import { reorderContentSeriesEntriesInCategoryAction } from "@/actions/discover/content-series/reorder-content-series-entries-in-category";
import type { ContentSeriesCategory, ContentSeriesEntrySummary } from "@/lib/api/content-series";

const inputClass =
  "rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[13px] outline-none focus:border-primary";

// Cap 2 (Quan ly Category & cau truc). Mac dinh (sortMode=false) giu nguyen
// nut len/xuong nhu truoc; bam "Sắp xếp" moi bat keo-tha (yeu cau nguoi
// dung: "phải có nút switch mode sắp xếp thì mới cho kéo thả") - tranh keo
// nham luc chi dang duyet/sua binh thuong. Luc bat, nut len/xuong duoc thay
// bang tay cam keo (GripVertical) - keo that su CHI kich hoat tu tay cam nay
// (dnd-kit `listeners` chi gan len do), nen link "Sua Entry"/nut Doi ten van
// bam binh thuong duoc ca khi dang o che do sap xep.
//
// Pham vi keo tha: category keo doi cho NHAU (toan Series); entry keo doi
// cho trong CUNG 1 category (backend reorderEntriesInCategory chi hoan doi
// orderIndex GIUA cac entry cua chinh category do, giu nguyen "cho" so thu
// tu toan cuc - xem comment o service). Doi entry SANG category khac van lam
// qua o chon Category trong trang Sua Entry, KHONG keo tha xuyen category.
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
  const [sortMode, setSortMode] = useState(false);
  const [newCategoryTitle, setNewCategoryTitle] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renameColor, setRenameColor] = useState("");
  const [busy, setBusy] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

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

  // 1 DndContext DUY NHAT cho toan bo cay (category + moi category 1
  // SortableContext entry rieng, LONG NHAU o BEN TRONG cung 1 DndContext -
  // dnd-kit KHONG ho tro nhieu <DndContext> long nhau, lam vay se lam sensor
  // cua context ngoai "nuot" pointer event truoc, khien context trong khong
  // bao gio nhan duoc drag that (bug da bao: keo tha khong doi vi tri). Phan
  // biet category/entry qua `data.current.type` gan luc goi useSortable.
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const activeData = active.data.current as
      | { type: "category" }
      | { type: "entry"; categoryId: string }
      | undefined;
    if (!activeData) return;

    if (activeData.type === "category") {
      const oldIndex = sortedCategories.findIndex((c) => c.id === active.id);
      const newIndex = sortedCategories.findIndex((c) => c.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      const newOrder = arrayMove(sortedCategories, oldIndex, newIndex).map((c) => c.id);
      run(
        () => reorderContentSeriesCategoriesAction(seriesSlug, newOrder),
        "Sắp xếp category thất bại",
      );
      return;
    }

    // Entry - CHI cho tha trong CUNG category (backend reorderEntriesInCategory
    // chi hoan doi orderIndex GIUA cac entry cua chinh category do) - bo qua
    // neu keo qua vi tri thuoc category khac.
    const overData = over.data.current as { type: "category" } | { type: "entry"; categoryId: string } | undefined;
    if (overData?.type !== "entry" || overData.categoryId !== activeData.categoryId) return;

    const catEntries = sortedEntries.filter((e) => e.categoryId === activeData.categoryId);
    const oldIndex = catEntries.findIndex((e) => e.id === active.id);
    const newIndex = catEntries.findIndex((e) => e.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const newOrder = arrayMove(catEntries, oldIndex, newIndex).map((e) => e.id);
    run(
      () => reorderContentSeriesEntriesInCategoryAction(seriesSlug, activeData.categoryId, newOrder),
      "Sắp xếp entry thất bại",
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] text-ink-faint">
          {sortMode
            ? "Kéo thanh cầm để đổi thứ tự category/entry."
            : "Quản lý category và entry của Series."}
        </p>
        <button
          type="button"
          onClick={() => setSortMode((v) => !v)}
          className={cn(
            "flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-colors duration-150 ease-out",
            sortMode
              ? "border-primary bg-primary-soft text-primary"
              : "border-border text-ink-muted hover:bg-hover-bg",
          )}
        >
          <ListOrdered size={14} />
          {sortMode ? "Đang sắp xếp - Xong" : "Sắp xếp"}
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={sortedCategories.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-5">
            {sortedCategories.map((cat, catIndex) => {
              const catEntries = sortedEntries.filter((e) => e.categoryId === cat.id);
              const isRenaming = renamingId === cat.id;
              return (
                <SortableShell
                  key={cat.id}
                  id={cat.id}
                  data={{ type: "category" }}
                  disabled={!sortMode || isRenaming}
                >
                  {(dragHandleProps) => (
                    <div className="rounded-xl border border-border p-4">
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
                          <div className="flex min-w-0 items-center gap-1.5">
                            {sortMode && (
                              <button
                                type="button"
                                {...dragHandleProps.attributes}
                                {...dragHandleProps.listeners}
                                ref={dragHandleProps.setActivatorNodeRef}
                                aria-label="Kéo để đổi thứ tự category"
                                className="flex size-6 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-ink-faint hover:bg-hover-bg active:cursor-grabbing"
                              >
                                <GripVertical size={14} />
                              </button>
                            )}
                            <p className="truncate font-semibold text-ink">{cat.title}</p>
                          </div>
                        )}

                        {!isRenaming && (
                          <div className="flex shrink-0 items-center gap-1">
                            {!sortMode && (
                              <>
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
                              </>
                            )}
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

                      <SortableContext
                        items={catEntries.map((e) => e.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="mt-3 flex flex-col gap-1">
                            {catEntries.map((entry, entryIndexInCat) => (
                              <SortableShell
                                key={entry.id}
                                id={entry.id}
                                data={{ type: "entry", categoryId: cat.id }}
                                disabled={!sortMode}
                              >
                                {(entryDragHandleProps) => (
                                  <div className="flex items-center gap-2 rounded-md py-1.5 pr-1 pl-2 hover:bg-hover-bg">
                                    {sortMode && (
                                      <button
                                        type="button"
                                        {...entryDragHandleProps.attributes}
                                        {...entryDragHandleProps.listeners}
                                        ref={entryDragHandleProps.setActivatorNodeRef}
                                        aria-label="Kéo để đổi thứ tự entry"
                                        className="flex size-5 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-ink-faint hover:bg-surface active:cursor-grabbing"
                                      >
                                        <GripVertical size={12} />
                                      </button>
                                    )}
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
                                    {!sortMode && (
                                      <>
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
                                              () =>
                                                moveContentSeriesEntryAction(seriesSlug, entry.id, "down"),
                                              "Di chuyển thất bại",
                                            )
                                          }
                                          className="flex size-6 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-surface disabled:cursor-not-allowed disabled:opacity-30"
                                        >
                                          <ArrowDown size={12} />
                                        </button>
                                      </>
                                    )}
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
                                )}
                              </SortableShell>
                            ))}
                          <Link
                            href={`/series/${seriesSlug}/manage/entries/new?categoryId=${cat.id}`}
                            className="mt-1 flex items-center gap-1.5 self-start rounded-md px-2 py-1.5 text-[12px] font-medium text-primary hover:bg-primary-soft"
                          >
                            <Plus size={13} /> Entry mới
                          </Link>
                        </div>
                      </SortableContext>
                    </div>
                  )}
                </SortableShell>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

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

// Render-prop shell dung chung cho CA category lan entry - `useSortable`
// PHAI goi trong 1 component that (khong the goi truc tiep trong .map() cua
// component cha, vi pham Rules of Hooks). `data` gan vao useSortable de
// handleDragEnd (o component cha) phan biet duoc item vua tha la category
// hay entry (va entry thuoc category nao) - ca 2 loai giờ chia se 1 DndContext
// DUY NHAT (xem comment handleDragEnd). `disabled` (khi khong o sortMode,
// hoac dang doi ten category) tat han vi tri "sortable" cua item nay - dnd-kit
// khong tinh no vao va cham/hoan doi vi tri, tranh giu 1 draggable "an" gay
// lech vi tri khi khong o che do sap xep.
type SortableItemData = { type: "category" } | { type: "entry"; categoryId: string };

function SortableShell({
  id,
  data,
  disabled,
  children,
}: {
  id: string;
  data: SortableItemData;
  disabled: boolean;
  children: (handleProps: {
    attributes: ReturnType<typeof useSortable>["attributes"];
    listeners: ReturnType<typeof useSortable>["listeners"];
    setActivatorNodeRef: ReturnType<typeof useSortable>["setActivatorNodeRef"];
  }) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id, data, disabled });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      {children({ attributes, listeners, setActivatorNodeRef })}
    </div>
  );
}
