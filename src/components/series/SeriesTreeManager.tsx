"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  GripVertical,
  ListOrdered,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
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
// Pham vi keo tha: category GOC keo doi cho NHAU (toan Series, dung
// reorderCategories that scope parentId=null); category CON ("nhom con",
// hien accordion o SeriesSidebar.tsx - yeu cau nguoi dung "sau cái cate đó,
// tôi có thể thêm bài viết thẳng hoặc chọn tạo 1 accordian") CHUA ho tro keo
// tha (backend reorderCategories that CHI xu ly parentId=null) - dung nut
// len/xuong (moveCategory, scope DUNG theo parentId cua chinh no) thay the,
// GIOI HAN 1 CAP nhom con (khong "+ Thêm nhóm con" long tiep trong nhom
// con). Entry keo doi cho trong CUNG 1 category (goc HOAC con deu duoc, xem
// reorderEntriesInCategory).
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
  const [addingChildTo, setAddingChildTo] = useState<string | null>(null);
  const [newChildTitle, setNewChildTitle] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renameColor, setRenameColor] = useState("");
  const [busy, setBusy] = useState(false);
  // Rieng cho thao tac KEO THA (khac `busy` chung o tren, dung de disable
  // nut len/xuong/xoa) - yeu cau nguoi dung: "không có bất kì spinner nào,
  // trải nghiệm đang đặt dấu hỏi kỳ lạ" khi tha xong. Hien 1 spinner RO RANG
  // ngay canh nut "Sắp xếp" trong luc cho server luu.
  const [dragBusy, setDragBusy] = useState(false);

  // State CUC BO (optimistic) cho category/entry - khoi tao/dong bo lai tu
  // props moi luc Server Component cha co du lieu THAT sau router.refresh()
  // (so sanh reference, "Adjusting state during render" - xem
  // CreateCollectionModal.tsx cung pattern). CAN thiet vi truoc day
  // sortedCategories/sortedEntries doc THANG tu props: luc tha xong, thu tu
  // hien thi VAN la thu tu CU (props chua doi) cho toi khi router.refresh()
  // tra ve xong - khien the vua keo tha NHAY NGUOC lai vi tri cu 1 nhip roi
  // moi nhay sang vi tri moi, dung nguyen nhan "trải nghiệm kỳ lạ".
  const [localCategories, setLocalCategories] = useState(categories);
  const [localEntries, setLocalEntries] = useState(entries);
  const [prevCategoriesProp, setPrevCategoriesProp] = useState(categories);
  if (categories !== prevCategoriesProp) {
    setPrevCategoriesProp(categories);
    setLocalCategories(categories);
  }
  const [prevEntriesProp, setPrevEntriesProp] = useState(entries);
  if (entries !== prevEntriesProp) {
    setPrevEntriesProp(entries);
    setLocalEntries(entries);
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const allCategoriesSorted = [...localCategories].sort((a, b) => a.orderIndex - b.orderIndex);
  const rootCategories = allCategoriesSorted.filter((c) => c.parentId === null);
  const childrenByParent = new Map<string, ContentSeriesCategory[]>();
  for (const cat of allCategoriesSorted) {
    if (!cat.parentId) continue;
    const list = childrenByParent.get(cat.parentId) ?? [];
    list.push(cat);
    childrenByParent.set(cat.parentId, list);
  }
  const sortedEntries = [...localEntries].sort((a, b) => a.orderIndex - b.orderIndex);
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

  // Hoan doi orderIndex GIUA dung nhung item trong `orderedIds` theo thu tu
  // MOI (giu nguyen TAP GIA TRI orderIndex cu, chi doi AI o CHO nao) - dung
  // y het co che backend that su lam (xem reorderCategories/
  // reorderEntriesInCategory o content-series.service.ts), nen khong co rui
  // ro trung orderIndex voi item KHONG nam trong danh sach nay.
  function permuteOrderIndex<T extends { id: string; orderIndex: number }>(
    orderedIds: string[],
    items: T[],
  ): T[] {
    const targetSet = new Set(orderedIds);
    const slots = items
      .filter((i) => targetSet.has(i.id))
      .map((i) => i.orderIndex)
      .sort((a, b) => a - b);
    const nextIndexById = new Map(orderedIds.map((id, i) => [id, slots[i]]));
    return items.map((item) =>
      nextIndexById.has(item.id) ? { ...item, orderIndex: nextIndexById.get(item.id)! } : item,
    );
  }

  async function runDrag(
    optimisticUpdate: () => void,
    action: () => Promise<unknown>,
    errorFallback: string,
  ) {
    const snapshotCategories = localCategories;
    const snapshotEntries = localEntries;
    optimisticUpdate(); // hien thu tu MOI NGAY LAP TUC, khong doi server
    setDragBusy(true);
    try {
      await action();
      router.refresh();
    } catch (err) {
      // Loi - tra lai dung thu tu CU (khong doi ho ep goi lai router.refresh,
      // props server van con nguyen gia tri cu nen rollback ve chinh no la du).
      setLocalCategories(snapshotCategories);
      setLocalEntries(snapshotEntries);
      toast.danger(getApiErrorMessage(err, errorFallback));
    } finally {
      setDragBusy(false);
    }
  }

  function startRename(cat: ContentSeriesCategory) {
    setRenamingId(cat.id);
    setRenameValue(cat.title);
    setRenameColor(cat.colorHex ?? "");
  }

  // 1 DndContext DUY NHAT cho toan bo cay (category goc + moi category 1
  // SortableContext entry rieng, LONG NHAU o BEN TRONG cung 1 DndContext -
  // dnd-kit KHONG ho tro nhieu <DndContext> long nhau, lam vay se lam sensor
  // cua context ngoai "nuot" pointer event truoc, khien context trong khong
  // bao gio nhan duoc drag that (bug da bao: keo tha khong doi vi tri). Phan
  // biet category/entry qua `data.current.type` gan luc goi useSortable.
  // CHI category GOC (khong co parentId) moi tham gia keo tha - xem comment
  // dau file ve gioi han nay.
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const activeData = active.data.current as
      | { type: "category" }
      | { type: "entry"; categoryId: string }
      | undefined;
    if (!activeData) return;

    if (activeData.type === "category") {
      const oldIndex = rootCategories.findIndex((c) => c.id === active.id);
      const newIndex = rootCategories.findIndex((c) => c.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      const newOrder = arrayMove(rootCategories, oldIndex, newIndex).map((c) => c.id);
      runDrag(
        () => setLocalCategories((prev) => permuteOrderIndex(newOrder, prev)),
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
    runDrag(
      () => setLocalEntries((prev) => permuteOrderIndex(newOrder, prev)),
      () => reorderContentSeriesEntriesInCategoryAction(seriesSlug, activeData.categoryId, newOrder),
      "Sắp xếp entry thất bại",
    );
  }

  // Danh sach entry cua 1 category (goc hoac con) - tach rieng vi dung LAP
  // LAI y het cho ca 2 cap, chi khac o cho keo tha (dung chung 1 DndContext
  // cha nen van hoat dong binh thuong o ca category con). HAM THUONG (khong
  // phai component, khong viet Hoa) - goi TRUC TIEP nhu 1 bieu thuc JSX
  // (`{renderEntriesList(id)}`), KHONG dung nhu the `<EntriesList/>` - neu
  // dung nhu 1 component rieng, moi lan SeriesTreeManager render se tao ra 1
  // FUNCTION MOI (dinh nghia lai trong than component), khien React coi day
  // la 1 "component type" khac tu render truoc, GO SACH roi mount lai TOAN
  // BO cay con moi lan - dung nguyen nhan gay giat/mat animation dnd-kit
  // giua chung 1 luot keo (bug tiem an da tranh duoc bang cach nay).
  function renderEntriesList(categoryId: string) {
    const catEntries = sortedEntries.filter((e) => e.categoryId === categoryId);
    return (
      <SortableContext items={catEntries.map((e) => e.id)} strategy={verticalListSortingStrategy}>
        <div className="mt-2 flex flex-col gap-1">
          {catEntries.map((entry, entryIndexInCat) => (
            <SortableShell
              key={entry.id}
              id={entry.id}
              data={{ type: "entry", categoryId }}
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
                    {entry.navTitle || entry.title}
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
                            () => moveContentSeriesEntryAction(seriesSlug, entry.id, "down"),
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
            href={`/series/${seriesSlug}/manage/entries/new?categoryId=${categoryId}`}
            className="mt-1 flex items-center gap-1.5 self-start rounded-md px-2 py-1.5 text-[12px] font-medium text-primary hover:bg-primary-soft"
          >
            <Plus size={13} /> Entry mới
          </Link>
        </div>
      </SortableContext>
    );
  }

  // 1 category CON ("nhom con"/accordion) - KHONG keo tha duoc (xem comment
  // dau file), chi len/xuong trong CHINH nhom anh em cua no (moveCategory
  // that scope theo parentId, xem content-series.service.ts). HAM THUONG
  // (khong phai component) - cung ly do voi renderEntriesList o tren; `key`
  // dat NGAY tren the goc <div> tra ve, van hoat dong dung khi goi ben trong
  // .map() vi ket qua van la 1 phan tu React binh thuong.
  function renderChildCategoryBlock(
    cat: ContentSeriesCategory,
    siblingIndex: number,
    siblingCount: number,
  ) {
    const isRenaming = renamingId === cat.id;
    return (
      <div key={cat.id} className="ml-4 rounded-lg border border-dashed border-border p-3">
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
              <ChevronDown size={13} className="shrink-0 text-ink-faint" aria-hidden="true" />
              <p className="truncate text-[13px] font-semibold text-ink">{cat.title}</p>
              <span className="shrink-0 rounded border border-border px-1.5 py-0.5 text-[10px] text-ink-faint">
                Nhóm con
              </span>
            </div>
          )}

          {!isRenaming && (
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                disabled={busy || siblingIndex === 0}
                onClick={() =>
                  run(
                    () => moveContentSeriesCategoryAction(seriesSlug, cat.id, "up"),
                    "Di chuyển thất bại",
                  )
                }
                className="flex size-6 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-hover-bg disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ArrowUp size={12} />
              </button>
              <button
                type="button"
                disabled={busy || siblingIndex === siblingCount - 1}
                onClick={() =>
                  run(
                    () => moveContentSeriesCategoryAction(seriesSlug, cat.id, "down"),
                    "Di chuyển thất bại",
                  )
                }
                className="flex size-6 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-hover-bg disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ArrowDown size={12} />
              </button>
              <button
                type="button"
                onClick={() => startRename(cat)}
                className="flex size-6 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-hover-bg"
              >
                <Pencil size={12} />
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  run(
                    () => deleteContentSeriesCategoryAction(seriesSlug, cat.id),
                    "Không xoá được nhóm con này",
                  )
                }
                className="flex size-6 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-hover-bg hover:text-danger"
              >
                <Trash2 size={12} />
              </button>
            </div>
          )}
        </div>

        {renderEntriesList(cat.id)}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-1.5 text-[13px] text-ink-faint">
          {sortMode
            ? "Kéo thanh cầm để đổi thứ tự category gốc/entry."
            : "Quản lý category và entry của Series."}
          {/* Spinner RO RANG luc dang luu thu tu vua tha - yeu cau nguoi
              dung ("không có bất kì spinner nào, trải nghiệm đặt dấu hỏi kỳ
              lạ"). Doi CHUNG voi state cuc bo (localCategories/localEntries)
              o tren de nguoi dung thay ro: 1) the nhay sang vi tri MOI ngay
              lap tuc, 2) co spinner bao dang luu, 3) spinner tat khi xong -
              khong con khoang trong mo ho giua luc tha va luc co phan hoi. */}
          {dragBusy && (
            <span className="flex items-center gap-1 text-primary">
              <Loader2 size={12} className="animate-spin" aria-hidden="true" />
              Đang lưu...
            </span>
          )}
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
        <SortableContext items={rootCategories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-5">
            {rootCategories.map((cat, catIndex) => {
              const isRenaming = renamingId === cat.id;
              const childCats = childrenByParent.get(cat.id) ?? [];
              const isAddingChild = addingChildTo === cat.id;
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
                                  disabled={busy || catIndex === rootCategories.length - 1}
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

                      {/* Entry THANG duoi category goc (khong qua nhom con nao) -
                          yeu cau nguoi dung: "sau cái cate đó, tôi có thể thêm
                          bài viết thẳng HOẶC chọn tạo 1 accordian" - 2 lua chon
                          NGANG HANG, khong bat buoc phai co nhom con moi them
                          duoc bai. */}
                      {renderEntriesList(cat.id)}

                      {/* Nhom con (accordion) - toi da 1 CAP (khong "+ Thêm
                          nhóm con" long tiep ben trong renderChildCategoryBlock),
                          xem comment dau file. */}
                      {childCats.length > 0 && (
                        <div className="mt-3 flex flex-col gap-3">
                          {childCats.map((child, childIndex) =>
                            renderChildCategoryBlock(child, childIndex, childCats.length),
                          )}
                        </div>
                      )}

                      {isAddingChild ? (
                        <div className="mt-3 ml-4 flex items-center gap-2">
                          <input
                            autoFocus
                            className={`${inputClass} flex-1`}
                            placeholder="Tên nhóm con"
                            value={newChildTitle}
                            onChange={(e) => setNewChildTitle(e.target.value)}
                          />
                          <button
                            type="button"
                            disabled={busy || !newChildTitle.trim()}
                            onClick={() =>
                              run(async () => {
                                await createContentSeriesCategoryAction(seriesSlug, {
                                  title: newChildTitle,
                                  parentId: cat.id,
                                });
                                setNewChildTitle("");
                                setAddingChildTo(null);
                              }, "Tạo nhóm con thất bại")
                            }
                            className="shrink-0 cursor-pointer rounded-md bg-ink px-3 py-1.5 text-[12px] font-semibold text-surface disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Tạo
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setAddingChildTo(null);
                              setNewChildTitle("");
                            }}
                            className="shrink-0 cursor-pointer rounded-md px-2.5 py-1.5 text-[12px] text-ink-faint hover:bg-hover-bg"
                          >
                            Huỷ
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setAddingChildTo(cat.id)}
                          className="mt-3 ml-4 flex items-center gap-1.5 cursor-pointer rounded-md px-2 py-1.5 text-[12px] font-medium text-ink-faint hover:bg-hover-bg hover:text-ink"
                        >
                          <Plus size={13} /> Thêm nhóm con (accordion)
                        </button>
                      )}
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

// Render-prop shell dung chung cho CA category goc lan entry - `useSortable`
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
