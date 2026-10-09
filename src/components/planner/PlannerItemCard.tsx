"use client";

// [2026-10-09] MOT the duy nhat cho MOI noi hien 1 PlannerItem.
//
// Truoc refactor co 6 cach ve the gan giong nhau (TimedItemChip,
// AllDayItemChip, DayItemsPreview, TimelineRow, BigTimelineItem, ItemRow),
// moi cai tu quyet dinh mau/gach ngang/badge nao duoc hien - nen sua 1 chi
// tiet phai nho sua 6 cho, va thuc te chung da troi khac nhau. Gio 1
// component, 4 `variant`:
//
//   timed   - the dat theo gio tren luoi tuan (cao thap tuy thoi luong;
//             NOI DUNG TU GIAN/GON theo chieu cao that - duoi 40px chi 1 dong)
//   allDay  - chip 1 dong o hang "Ca ngay" tren luoi
//   list    - hang trong danh sach (panel ngay, viec chua xep lich)
//   compact - dong sieu nho trong 1 o cua luoi thang
//
// Style GIU DUNG ban nguoi dung da chot (xem docs/planner-macos-design-
// system.md): nen pastel cua category, thanh accent doc 3px CACH LE TRAI 3px
// (khong sat le), bo goc 7px, khong border 4 canh, khong shadow mac dinh -
// chi hover brightness. Doc gio TRUOC roi den tieu de.

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  checklistProgress,
  isFinished,
  PLANNER_STATUS_META,
  resolveCategoryColor,
  type CategoryColorOverrides,
  type PlannerItem,
} from "@/lib/planner/planner-domain";
import {
  ChecklistProgressBadge,
  PriorityMark,
  StatusBadge,
  TypeIcon,
} from "./planner-indicators";
import {
  LocationDisplay,
  MeetingLinkDisplay,
  ScheduleDisplay,
  type TimeFormat,
} from "./planner-datetime";

/** Badge nao duoc phep hien - noi goi truyen tu PlannerSettings. */
export type CardBadgeVisibility = {
  showCategory: boolean;
  showStatus: boolean;
  showDuration: boolean;
  showLocation: boolean;
  showPriority: boolean;
};

export const ALL_BADGES_VISIBLE: CardBadgeVisibility = {
  showCategory: true,
  showStatus: true,
  showDuration: true,
  showLocation: true,
  showPriority: true,
};

export type PlannerItemCardProps = {
  item: PlannerItem;
  variant: "timed" | "allDay" | "list" | "compact";
  overrides?: CategoryColorOverrides;
  timeFormat?: TimeFormat;
  badges?: CardBadgeVisibility;
  /** Chieu cao thuc (px) - CHI variant "timed", quyet dinh mat do noi dung. */
  height?: number;
  selected?: boolean;
  /** `completedTaskStyle` tu Settings - cach ve item da xong. */
  completedStyle?: "CHECK_ICON" | "CHECK_COLOR" | "DONE_BADGE" | "PATTERN";
  onClick?: (e: React.MouseEvent) => void;
  /** Bat/tat hoan thanh - CHI hien o variant "list" va khi type cho phep. */
  onToggleComplete?: () => void;
  className?: string;
  style?: React.CSSProperties;
  /** Noi dung chen them (vd tay keo-gian cua the tren luoi). */
  children?: React.ReactNode;
};

// Duoi nguong nay the qua thap de hien 2 dong rieng -> gop gio + tieu de vao
// 1 dong. 40px ~ 2 dong text 12px + padding.
const TWO_LINE_MIN_HEIGHT = 40;
// Tu nguong nay the du cao de hien thong tin phu (dia diem/link/checklist).
const META_MIN_HEIGHT = 64;

export function PlannerItemCard({
  item,
  variant,
  overrides,
  timeFormat = "24H",
  badges = ALL_BADGES_VISIBLE,
  height,
  selected,
  completedStyle = "CHECK_ICON",
  onClick,
  onToggleComplete,
  className,
  style,
  children,
}: PlannerItemCardProps) {
  const color = resolveCategoryColor(item.category, overrides);
  const finished = isFinished(item);
  const statusMeta = PLANNER_STATUS_META[item.status];
  const progress = checklistProgress(item);

  // --- compact: 1 dong trong o luoi thang. Chi cham mau + tieu de - o
  // thang chi cao ~90px, nhoi them gi nua la vo layout.
  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={onClick}
        title={item.title}
        className={cn(
          "flex w-full min-w-0 cursor-pointer items-center gap-1 rounded-[3px] px-0.5 text-left hover:bg-[color:var(--planner-surface-soft)]",
          className,
        )}
        style={style}
      >
        <span
          className="size-1 shrink-0 rounded-full"
          style={{
            backgroundColor: finished ? "var(--planner-text-muted)" : color.main,
            opacity: finished ? 0.5 : 1,
          }}
          aria-hidden="true"
        />
        <span
          className={cn(
            "min-w-0 flex-1 truncate text-[10.5px] leading-[1.4]",
            statusMeta.strikeThrough
              ? "text-[color:var(--planner-text-muted)] line-through"
              : "text-[color:var(--planner-text-secondary)]",
          )}
        >
          {item.title}
        </span>
      </button>
    );
  }

  // --- allDay: chip 1 dong. Thanh mau o day la border-left (khong can tach
  // ra thanh absolute nhu the cao) vi chip chi cao 1 dong.
  if (variant === "allDay") {
    return (
      <motion.button
        type="button"
        onClick={onClick}
        title={item.title}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        style={{
          backgroundColor: color.light,
          borderLeftColor: color.main,
          ...style,
        }}
        className={cn(
          "flex w-full min-w-0 cursor-pointer items-center gap-1 overflow-hidden rounded-[7px] border-l-[3px] px-1.5 py-0.5 text-left text-[11px] leading-[1.3] font-medium",
          "hover:brightness-95",
          statusMeta.strikeThrough
            ? "text-[color:var(--planner-text-muted)] line-through opacity-55"
            : "text-[color:var(--planner-text-primary)]",
          className,
        )}
      >
        {badges.showStatus && (
          <StatusBadge status={item.status} onlyNotable compact />
        )}
        <span className="min-w-0 flex-1 truncate">{item.title}</span>
        {badges.showPriority && <PriorityMark priority={item.priority} />}
      </motion.button>
    );
  }

  // --- list: hang trong danh sach. Rong thoai mai nen hien du meta.
  if (variant === "list") {
    const completable = item.type !== "EVENT";
    return (
      <div
        className={cn(
          "group flex min-w-0 items-start gap-2 rounded-[8px] px-2 py-2 transition-colors",
          "hover:bg-[color:var(--planner-surface-soft)]",
          selected && "bg-[color:var(--planner-surface-soft)]",
          className,
        )}
        style={style}
      >
        {completable && onToggleComplete ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete();
            }}
            aria-label={
              item.status === "COMPLETED" ? "Bỏ đánh dấu hoàn thành" : "Đánh dấu hoàn thành"
            }
            className={cn(
              "mt-0.5 flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full border-[1.5px] transition-colors",
              item.status === "COMPLETED"
                ? "border-transparent bg-[color:var(--mset-success)] text-white"
                : "border-[color:var(--planner-border)] hover:border-[color:var(--planner-primary)]",
            )}
          >
            {item.status === "COMPLETED" && (
              <svg viewBox="0 0 10 10" className="size-2.5" aria-hidden="true">
                <path
                  d="M1.5 5.2 3.8 7.4 8.5 2.6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        ) : (
          <span
            className="mt-[7px] size-2 shrink-0 rounded-full"
            style={{ backgroundColor: color.main }}
            aria-hidden="true"
          />
        )}

        <button
          type="button"
          onClick={onClick}
          className="min-w-0 flex-1 cursor-pointer text-left"
        >
          <span className="flex min-w-0 items-center gap-1.5">
            <TypeIcon
              type={item.type}
              size={12}
              className="shrink-0"
              style={{ color: color.main }}
            />
            <span
              className={cn(
                // `break-words` (khong truncate) - tieu de dai o danh sach
                // duoc phep xuong dong, khong cat chu.
                "min-w-0 flex-1 text-[13px] leading-[1.4] font-semibold break-words",
                statusMeta.strikeThrough
                  ? "text-[color:var(--planner-text-muted)] line-through"
                  : "text-[color:var(--planner-text-primary)]",
              )}
            >
              {item.title}
            </span>
            {badges.showPriority && <PriorityMark priority={item.priority} />}
          </span>

          <span className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <ScheduleDisplay
              item={item}
              format={timeFormat}
              accentColor={color.main}
            />
            {badges.showStatus && <StatusBadge status={item.status} onlyNotable />}
            {badges.showLocation && item.location && (
              <LocationDisplay location={item.location} />
            )}
            {badges.showLocation && item.meetingUrl && (
              <MeetingLinkDisplay url={item.meetingUrl} interactive />
            )}
            {progress && (
              <ChecklistProgressBadge done={progress.done} total={progress.total} />
            )}
          </span>
        </button>
        {children}
      </div>
    );
  }

  // --- timed: the tren luoi gio. Mat do noi dung theo chieu cao THAT.
  const h = height ?? 0;
  const twoLine = h >= TWO_LINE_MIN_HEIGHT;
  const showMeta = h >= META_MIN_HEIGHT;
  const dimmed = finished && completedStyle !== "CHECK_COLOR";

  return (
    <motion.div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.(e as unknown as React.MouseEvent);
        }
      }}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      title={item.title}
      style={{
        backgroundColor:
          finished && completedStyle === "CHECK_COLOR"
            ? `color-mix(in srgb, var(--mset-success) 12%, ${color.light})`
            : color.light,
        backgroundImage:
          finished && completedStyle === "PATTERN"
            ? `repeating-linear-gradient(135deg, transparent, transparent 6px, color-mix(in srgb, ${color.main} 22%, transparent) 6px, color-mix(in srgb, ${color.main} 22%, transparent) 12px)`
            : undefined,
        boxShadow: selected ? `0 0 0 2px white, 0 0 0 3px ${color.main}` : undefined,
        ...style,
      }}
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-[7px] hover:brightness-95",
        dimmed && "opacity-55",
        className,
      )}
    >
      {/* Thanh accent DOC - cach le trai 3px (khong sat le), 3px rong, bo
          tron hai dau. Day la chi tiet nguoi dung chot ro rang. */}
      <span
        className="pointer-events-none absolute top-1 bottom-1 left-[3px] w-[3px] rounded-full"
        style={{ backgroundColor: color.main }}
        aria-hidden="true"
      />

      <div className="flex h-full min-w-0 flex-col items-start overflow-hidden pt-1 pr-1.5 pl-3">
        {twoLine ? (
          <>
            <span className="flex w-full min-w-0 items-center gap-1">
              <ScheduleDisplay
                item={item}
                format={timeFormat}
                accentColor={color.main}
                withIcon={false}
                className="text-[10px]"
              />
              {badges.showStatus && (
                <StatusBadge status={item.status} onlyNotable compact />
              )}
              {badges.showPriority && <PriorityMark priority={item.priority} />}
            </span>
            <span
              className={cn(
                "w-full min-w-0 text-[12px] leading-[1.3] font-semibold",
                // 2 dong roi "..." - tieu de dai KHONG duoc day the gian ra
                // hay tran khoi o gio.
                "line-clamp-2",
                statusMeta.strikeThrough
                  ? "text-[color:var(--planner-text-muted)] line-through"
                  : "text-[color:var(--planner-text-primary)]",
              )}
            >
              {item.title}
            </span>
            {showMeta && (
              <span className="mt-0.5 flex w-full min-w-0 flex-col gap-0.5 overflow-hidden">
                {badges.showLocation && item.location && (
                  <LocationDisplay location={item.location} className="text-[10px]" />
                )}
                {badges.showLocation && item.meetingUrl && (
                  <MeetingLinkDisplay url={item.meetingUrl} className="text-[10px]" />
                )}
                {progress && (
                  <ChecklistProgressBadge done={progress.done} total={progress.total} />
                )}
              </span>
            )}
          </>
        ) : (
          // The qua thap: gio + tieu de tren CUNG 1 dong, gio khong bi mat.
          <span className="flex w-full min-w-0 items-center gap-1 overflow-hidden">
            <ScheduleDisplay
              item={item}
              format={timeFormat}
              accentColor={color.main}
              withIcon={false}
              className="shrink-0 text-[10px]"
            />
            <span
              className={cn(
                "min-w-0 flex-1 truncate text-[11px] leading-[1.3] font-semibold",
                statusMeta.strikeThrough
                  ? "text-[color:var(--planner-text-muted)] line-through"
                  : "text-[color:var(--planner-text-primary)]",
              )}
            >
              {item.title}
            </span>
          </span>
        )}
      </div>

      {finished && completedStyle === "DONE_BADGE" && (
        <span className="pointer-events-none absolute top-0.5 right-0.5 rounded-[4px] bg-[color:var(--mset-success)] px-1 py-px text-[9px] font-semibold text-white">
          Done
        </span>
      )}
      {children}
    </motion.div>
  );
}
