"use client";

import { useState } from "react";
import Link from "next/link";
import { GripVertical, Loader2, Settings } from "lucide-react";
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
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "@/lib/toast/toast-store";
import { getApiErrorMessage } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { reorderContentSeriesAction } from "@/actions/discover/content-series/reorder-content-series";
import { SeriesCampaignCard } from "./SeriesCampaignCard";
import type { ContentSeriesListItem } from "@/lib/api/content-series";

// Danh sach Series tren /series - ADMIN moi drag-reorder duoc (dnd-kit,
// cung tinh than SeriesTreeManager.tsx - SortableShell/permuteOrderIndex),
// nguoi xem thuong chi thay danh sach TINH (KHONG mount DndContext lam gi -
// nhe hon, khong co drag handle). Admin THAY het ca Series (ke ca
// isVisible=false, danh dau "Ẩn" de biet ma sua lai trong tab "Thẻ hiển
// thị") - nguoi xem thuong CHI thay Series isVisible=true.
export function SeriesListManager({
  seriesList,
  isAdmin,
}: {
  seriesList: ContentSeriesListItem[];
  isAdmin: boolean;
}) {
  const [items, setItems] = useState(seriesList);
  const [dragBusy, setDragBusy] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  if (!isAdmin) {
    const visible = seriesList.filter((s) => s.isVisible);
    return (
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {visible.map((series) => (
          <SeriesCampaignCard key={series.id} series={series} variant="banner" />
        ))}
      </div>
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((s) => s.id === active.id);
    const newIndex = items.findIndex((s) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const newOrder = arrayMove(items, oldIndex, newIndex);
    const snapshot = items;
    setItems(newOrder); // optimistic
    setDragBusy(true);
    reorderContentSeriesAction(newOrder.map((s) => s.id))
      .catch((err) => {
        setItems(snapshot);
        toast.danger(getApiErrorMessage(err, "Sắp xếp thất bại"));
      })
      .finally(() => setDragBusy(false));
  }

  return (
    <div className="mt-8">
      {dragBusy && (
        <p className="mb-2 flex items-center gap-1.5 text-[12px] text-ink-faint">
          <Loader2 size={12} className="animate-spin" aria-hidden="true" />
          Đang lưu thứ tự...
        </p>
      )}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((s) => s.id)} strategy={rectSortingStrategy}>
          <div
            className={cn(
              "grid grid-cols-2 gap-4 transition-opacity duration-200 ease-out sm:grid-cols-3 lg:grid-cols-4",
              dragBusy && "pointer-events-none opacity-60",
            )}
          >
            {items.map((series) => (
              <SortableSeriesRow key={series.id} series={series} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

// [2026-10-06] The gio nam trong 1 LUOI (grid), khong con du cho dat tay
// cam/nut cai dat o 2 BEN CANH the nhu khi con la 1 hang ngang - chuyen ca 2
// thanh nut TRON NOI (overlay) o goc tren-phai the, CHI hien khi di chuot vao
// (group-hover, giong BlockActionsMenu.tsx trong trinh soan Tiptap) de khong
// che mat anh bia luc binh thuong.
function SortableSeriesRow({ series }: { series: ContentSeriesListItem }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: series.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: isDragging ? transition : (transition ?? "transform 220ms cubic-bezier(0.2, 0, 0, 1)"),
        opacity: isDragging ? 0.5 : 1,
      }}
      className="group relative"
    >
      <div className="pointer-events-none absolute top-2 right-2 z-10 flex items-center gap-1 opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100">
        <button
          type="button"
          {...attributes}
          {...listeners}
          ref={setActivatorNodeRef}
          aria-label="Kéo để đổi thứ tự"
          className="pointer-events-auto flex size-7 cursor-grab touch-none items-center justify-center rounded-md border border-border bg-surface/95 text-ink-faint shadow-sm hover:bg-hover-bg active:cursor-grabbing"
        >
          <GripVertical size={13} aria-hidden="true" />
        </button>
        <Link
          href={`/series/${series.slug}/manage`}
          aria-label="Quản lý series"
          title="Quản lý series"
          className="pointer-events-auto flex size-7 cursor-pointer items-center justify-center rounded-md border border-border bg-surface/95 text-ink-faint shadow-sm hover:bg-surface hover:text-ink"
        >
          <Settings size={13} aria-hidden="true" />
        </Link>
      </div>
      <SeriesCampaignCard series={series} variant="banner" />
      {!series.isVisible && (
        <span className="mt-1 inline-block rounded bg-surface-muted px-1.5 py-0.5 text-[11px] font-medium text-ink-faint">
          Ẩn khỏi /home + /series
        </span>
      )}
    </div>
  );
}
