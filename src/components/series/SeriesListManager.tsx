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
  verticalListSortingStrategy,
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
      <div className="mt-8 flex flex-col gap-3">
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
        <SortableContext items={items.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div
            className={cn(
              "flex flex-col gap-3 transition-opacity duration-200 ease-out",
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
      className="flex items-center gap-2"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        ref={setActivatorNodeRef}
        aria-label="Kéo để đổi thứ tự"
        className="flex size-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-ink-faint hover:bg-hover-bg active:cursor-grabbing"
      >
        <GripVertical size={14} aria-hidden="true" />
      </button>
      <div className="min-w-0 flex-1">
        <SeriesCampaignCard series={series} variant="banner" />
        {!series.isVisible && (
          <span className="mt-1 inline-block rounded bg-surface-muted px-1.5 py-0.5 text-[11px] font-medium text-ink-faint">
            Ẩn khỏi /home + /series
          </span>
        )}
      </div>
      <Link
        href={`/series/${series.slug}/manage`}
        aria-label="Quản lý series"
        title="Quản lý series"
        className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-surface hover:text-ink"
      >
        <Settings size={16} aria-hidden="true" />
      </Link>
    </div>
  );
}
