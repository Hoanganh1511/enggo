"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  Clock,
  Flag,
  Loader2,
  MapPin,
  Repeat,
  Trash2,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { InlineSelect } from "./macos-form-controls";
import { useIsMobile } from "./use-is-mobile";
import {
  PRIORITY_CONFIG,
  type CalendarEvent,
  type Reminder,
  type Priority,
  type Invitee,
} from "./calendar-types";

// [2026-10-08] TaskListView - "Code component TaskListView — danh sách hiển
// thị events và reminders". DOC LAP voi model PlannerItem (xem comment dau
// calendar-types.ts), tai dung CHUNG macos-form-controls.tsx noi hop ly.
//
// [2026-10-08] Props VUOT RA NGOAI interface block goc (nguoi dung chi liet
// ke items/onItemClick/onReminderToggle/view) - CAN THIET de cac hanh vi
// trong "Behaviors"/"Responsive" THAT SU hoat dong duoc, khong the suy ra tu
// 4 props goc:
// - `calendarColors?: Record<string,string>` - "Color bar left (calendar
//   color)"/"List color dot" can 1 MAU THAT cho moi ten calendar/list, nhung
//   CalendarEvent.calendar/Reminder.list CHI la string ten, khong tu mang
//   theo mau. Khong truyen thi TU DONG suy mau on dinh tu ten (hash ->
//   palette co dinh) - UI VAN chay dung, chi khong khop 100% voi mau that
//   nguoi dung dat o SharedCalendarForm/EventForm.
// - `onDelete?`/`title?`/`onCreateFirstTask?` - "Swipe left: Delete action"/
//   "CTA button: Create your first task" can 1 noi DE GOI, interface goc
//   khong co.
// - `onRefresh?`/`onLoadMore?`/`hasMore?`/`loadingMore?` - "Pull to
//   refresh"/"Infinite scroll" KHONG THE hoat dong neu component khong biet
//   phai goi gi luc keo xuong/cuon toi day, va khong biet con du lieu de tai
//   tiep hay khong. Bo qua CA 4 (khong truyen) thi 2 tinh nang nay don gian
//   KHONG kich hoat (list render binh thuong, khong loi).
//
// [2026-10-08] Gioi han CO Y THUC khac:
// - "Illustration" o Empty state: 1 icon trong vong tron (ClipboardList),
//   KHONG phai 1 SVG minh hoa rieng ve cho tung ngu canh - giu nhe, dung
//   token mau co san thay vi ve minh hoa moi.
// - "Swipe right: Flag/Complete": CHI co y nghia THAT voi Reminder (goi lai
//   `onReminderToggle`, da co san trong props goc). CalendarEvent KHONG co
//   field `flagged` trong model hien tai (xem calendar-types.ts) nen Event
//   row CHI co swipe-left (Delete), khong co swipe-right - tranh "lam gia"
//   1 hanh vi flag khong thuc su luu duoc o dau.
// - "Mini map preview"/avatar/anh that: dung initial 1 chu cai, khong goi
//   API avatar ngoai.

export type TaskItem =
  | { type: "event"; data: CalendarEvent }
  | { type: "reminder"; data: Reminder };

type FilterChip = "all" | "events" | "reminders" | "flagged";
type SortKey = "date" | "priority" | "title";
export type TaskListGroupBy = "by_date" | "by_list" | "by_priority";

const FILTER_CHIPS: { value: FilterChip; label: string }[] = [
  { value: "all", label: "All" },
  { value: "events", label: "Events" },
  { value: "reminders", label: "Reminders" },
  { value: "flagged", label: "Flagged" },
];
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "date", label: "Date" },
  { value: "priority", label: "Priority" },
  { value: "title", label: "Title" },
];
const PRIORITY_RANK: Record<Priority, number> = { high: 3, medium: 2, low: 1, none: 0 };
const PRIORITY_GROUP_LABEL: Record<Priority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
  none: "None",
};

// ---------------------------------------------------------------------------
// Helpers doc TaskItem (union) - dat thanh ham thay vi lap `item.type===...`
// rai rac khap component.
// ---------------------------------------------------------------------------

function itemId(item: TaskItem): string {
  return item.data.id;
}
function itemTitle(item: TaskItem): string {
  return item.data.title;
}
function itemPriority(item: TaskItem): Priority {
  return item.type === "reminder" ? item.data.priority : "none";
}
function itemFlagged(item: TaskItem): boolean {
  return item.type === "reminder" && item.data.flagged;
}
function itemGroupName(item: TaskItem): string {
  return item.type === "event" ? item.data.calendar : item.data.list;
}
function itemDateIso(item: TaskItem): string | null {
  return item.type === "event" ? item.data.startDate : item.data.dueDate;
}
function itemSortTimestamp(item: TaskItem): number | null {
  const iso = itemDateIso(item);
  if (!iso) return null;
  const time = item.type === "event" ? (item.data.startTime ?? "00:00") : (item.data.dueTime ?? "00:00");
  return new Date(`${iso}T${time}:00`).getTime();
}

const COLOR_PALETTE = [
  "#007aff", "#ff9500", "#34c759", "#af52de", "#ff3b30",
  "#30b0c7", "#5856d6", "#ff2d55", "#a2845e", "#8e8e93",
];
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
function resolveColor(name: string, map?: Record<string, string>): string {
  return map?.[name] ?? COLOR_PALETTE[hashString(name) % COLOR_PALETTE.length];
}

function formatHM12(hm: string): string {
  const [hStr, mStr] = hm.split(":");
  const h = Number(hStr);
  const h12 = h % 12 || 12;
  const suffix = h < 12 ? "AM" : "PM";
  return `${h12}:${mStr.padStart(2, "0")} ${suffix}`;
}
function formatShortDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function formatEventTime(event: CalendarEvent): string {
  if (event.allDay) return "All Day";
  if (!event.startTime || !event.endTime) return "All Day";
  return `${formatHM12(event.startTime)} — ${formatHM12(event.endTime)}`;
}
function formatDueLabel(reminder: Reminder): string {
  if (!reminder.dueDate) return "No due date";
  const date = formatShortDate(reminder.dueDate);
  return reminder.dueTime ? `Due ${date}, ${formatHM12(reminder.dueTime)}` : `Due ${date}`;
}

// "Today"/"Tomorrow"/"Thu, Oct 10"/"Next Week"... - spec vi du cho by_date.
// Bucket cu the (ngoai 4 vi du nguoi dung dua) la lua chon hop ly rieng,
// flag trong comment ngay duoi.
function relativeDateGroup(iso: string | null): { label: string; rank: number } {
  if (!iso) return { label: "No Date", rank: 9999 };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${iso}T00:00:00`);
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86400000);
  if (diffDays < 0) return { label: "Overdue", rank: -1 };
  if (diffDays === 0) return { label: "Today", rank: 0 };
  if (diffDays === 1) return { label: "Tomorrow", rank: 1 };
  // 2-6 ngay toi: nhan ngay cu the ("Thu, Oct 10") - khop vi du spec.
  if (diffDays <= 6) {
    const label = target.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    return { label, rank: diffDays };
  }
  // [2026-10-08] 7-13 ngay -> "Next Week" (dung vi du spec); >=14 ngay -> 1
  // bucket "Later" THEM VAO (khong co trong vi du spec, nhung can thiet - neu
  // khong moi ngay xa deu bi don chung vao "Next Week", sai nghia tu "tuan
  // sau"). Lua chon rieng, flag o day thay vi lam ngam.
  if (diffDays <= 13) return { label: "Next Week", rank: 7 };
  return { label: "Later", rank: 14 };
}

function compareItems(a: TaskItem, b: TaskItem, key: SortKey): number {
  if (key === "title") return itemTitle(a).localeCompare(itemTitle(b));
  if (key === "priority") return PRIORITY_RANK[itemPriority(b)] - PRIORITY_RANK[itemPriority(a)];
  const ta = itemSortTimestamp(a);
  const tb = itemSortTimestamp(b);
  if (ta === null && tb === null) return 0;
  if (ta === null) return 1;
  if (tb === null) return -1;
  return ta - tb;
}

type TaskGroup = { key: string; label: string; items: TaskItem[]; rank: number };

function buildGroups(items: TaskItem[], view: TaskListGroupBy): TaskGroup[] {
  const map = new Map<string, TaskGroup>();
  for (const it of items) {
    let key: string;
    let label: string;
    let rank: number;
    if (view === "by_date") {
      const g = relativeDateGroup(itemDateIso(it));
      key = g.label;
      label = g.label;
      rank = g.rank;
    } else if (view === "by_list") {
      key = itemGroupName(it);
      label = key;
      rank = 0;
    } else {
      const p = itemPriority(it);
      key = p;
      label = PRIORITY_GROUP_LABEL[p];
      rank = 3 - PRIORITY_RANK[p];
    }
    if (!map.has(key)) map.set(key, { key, label, items: [], rank });
    map.get(key)!.items.push(it);
  }
  const groups = Array.from(map.values());
  if (view === "by_list") groups.sort((a, b) => a.label.localeCompare(b.label));
  else groups.sort((a, b) => a.rank - b.rank);
  return groups;
}

// ---------------------------------------------------------------------------
// Presentational pieces.
// ---------------------------------------------------------------------------

function InviteeAvatarStack({ invitees }: { invitees: Invitee[] }) {
  const shown = invitees.slice(0, 3);
  const extra = invitees.length - shown.length;
  if (invitees.length === 0) return null;
  return (
    <div className="flex items-center -space-x-1.5">
      {shown.map((inv) => (
        <span
          key={inv.id}
          title={inv.name || inv.email}
          className="flex size-5 items-center justify-center rounded-full border-2 border-white text-[9px] font-semibold text-white"
          style={{ background: "var(--mset-text-tertiary)" }}
        >
          {(inv.name || inv.email).slice(0, 1).toUpperCase()}
        </span>
      ))}
      {extra > 0 && (
        <span
          className="flex size-5 items-center justify-center rounded-full border-2 border-white text-[9px] font-semibold"
          style={{ background: "var(--mset-surface-tertiary)", color: "var(--planner-text-secondary)" }}
        >
          +{extra}
        </span>
      )}
    </div>
  );
}

function EventCard({ event, color }: { event: CalendarEvent; color: string }) {
  return (
    <div className="flex gap-2.5 rounded-[10px] bg-white py-2 pr-3 pl-0">
      <span className="w-1 shrink-0 rounded-full" style={{ background: color }} aria-hidden="true" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <p className="min-w-0 flex-1 truncate text-[13.5px] font-semibold text-[color:var(--planner-text-primary)]">
            {event.title}
          </p>
          {event.recurrence && (
            <Repeat size={12} className="mt-0.5 shrink-0 text-[color:var(--planner-text-muted)]" aria-label="Recurring" />
          )}
        </div>
        <p className="flex items-center gap-1 text-[12px] text-[color:var(--planner-text-secondary)]">
          <Clock size={11} className="shrink-0" />
          {formatEventTime(event)}
        </p>
        {event.location && (
          <p className="flex items-center gap-1 truncate text-[11.5px] text-[color:var(--planner-text-muted)]">
            <MapPin size={11} className="shrink-0" />
            <span className="truncate">{event.location}</span>
          </p>
        )}
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <span
            className="truncate rounded-full px-2 py-0.5 text-[10.5px] font-medium"
            style={{ background: "var(--mset-surface-tertiary)", color: "var(--planner-text-secondary)" }}
          >
            {event.calendar}
          </span>
          <InviteeAvatarStack invitees={event.invitees} />
        </div>
      </div>
    </div>
  );
}

function ReminderCard({
  reminder,
  color,
  onToggle,
}: {
  reminder: Reminder;
  color: string;
  onToggle: (completed: boolean) => void;
}) {
  const priorityCfg = PRIORITY_CONFIG[reminder.priority];
  const doneSubtasks = reminder.subtasks.filter((s) => s.done).length;
  return (
    <div className="flex gap-2.5 rounded-[10px] bg-white py-2 pr-3 pl-0.5">
      <button
        type="button"
        role="checkbox"
        aria-checked={reminder.completed}
        onClick={(e) => {
          e.stopPropagation();
          onToggle(!reminder.completed);
        }}
        className="mt-0.5 grid size-[18px] shrink-0 cursor-pointer place-items-center self-start rounded-full border transition-colors duration-150 ease-out"
        style={{
          borderColor: reminder.completed ? "var(--planner-primary)" : "#c7c7cc",
          background: reminder.completed ? "var(--planner-primary)" : "white",
        }}
      >
        {reminder.completed && <Check size={11} strokeWidth={3} className="text-white" />}
      </button>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "min-w-0 flex-1 truncate text-[13.5px] font-semibold text-[color:var(--planner-text-primary)]",
              reminder.completed && "text-[color:var(--planner-text-muted)] line-through",
            )}
          >
            {reminder.title}
          </p>
          <div className="flex shrink-0 items-center gap-1">
            {reminder.priority !== "none" && (
              <span className="text-[11px] font-bold" style={{ color: priorityCfg.color }}>
                {priorityCfg.mark}
              </span>
            )}
            {reminder.flagged && <Flag size={12} fill="var(--mset-warning)" style={{ color: "var(--mset-warning)" }} />}
          </div>
        </div>
        <p className="text-[12px] text-[color:var(--planner-text-secondary)]">{formatDueLabel(reminder)}</p>
        {reminder.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {reminder.tags.map((t) => (
              <span
                key={t}
                className="rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                style={{ background: "var(--planner-primary-soft)", color: "var(--planner-primary)" }}
              >
                #{t}
              </span>
            ))}
          </div>
        )}
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="size-2 shrink-0 rounded-full" style={{ background: color }} aria-hidden="true" />
            <span className="truncate text-[10.5px] font-medium text-[color:var(--planner-text-muted)]">
              {reminder.list}
            </span>
          </span>
          {reminder.subtasks.length > 0 && (
            <span className="shrink-0 text-[10.5px] font-medium text-[color:var(--planner-text-muted)]">
              {doneSubtasks}/{reminder.subtasks.length} subtasks
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function GroupHeaderRow({
  view,
  label,
  count,
  color,
  priority,
}: {
  view: TaskListGroupBy;
  label: string;
  count: number;
  color: string;
  priority: Priority;
}) {
  return (
    <div className="flex items-center gap-1.5 px-3.5 pt-3 pb-1.5">
      {view === "by_list" && <span className="size-2.5 shrink-0 rounded-full" style={{ background: color }} />}
      {view === "by_priority" && priority !== "none" && (
        <span className="text-[11px] font-bold" style={{ color: PRIORITY_CONFIG[priority].color }}>
          {PRIORITY_CONFIG[priority].mark}
        </span>
      )}
      <span
        className="text-[11.5px] font-semibold tracking-[.03em] uppercase"
        style={{ color: "var(--mset-text-secondary)" }}
      >
        {label}
      </span>
      <span
        className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
        style={{ background: "var(--mset-surface-tertiary)", color: "var(--mset-text-tertiary)" }}
      >
        {count}
      </span>
    </div>
  );
}

function EmptyState({ onCreateFirstTask }: { onCreateFirstTask?: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <span
        className="flex size-14 items-center justify-center rounded-full"
        style={{ background: "var(--mset-surface-tertiary)" }}
      >
        <ClipboardList size={26} className="text-[color:var(--planner-text-muted)]" />
      </span>
      <p className="text-[14px] font-semibold text-[color:var(--planner-text-primary)]">No tasks</p>
      <p className="max-w-[220px] text-[12.5px] text-[color:var(--planner-text-muted)]">
        Events and reminders you create will show up here.
      </p>
      {onCreateFirstTask && (
        <button
          type="button"
          onClick={onCreateFirstTask}
          className="mt-1 cursor-pointer rounded-[9px] bg-[color:var(--planner-primary)] px-4 py-2 text-[13px] font-semibold text-white transition-colors duration-150 ease-out hover:bg-[#006fe6]"
        >
          Create your first task
        </button>
      )}
    </div>
  );
}

// [2026-10-08] "Swipe left (mobile): Delete action. Swipe right (mobile):
// Flag/Complete action" - keo ngang qua Pointer Events (hoat dong voi ca
// touch lan chuot, khong can thu vien gesture ngoai). CHI gan listener khi
// `isMobile` (desktop dung hover-actions thay the, xem TaskRow).
const SWIPE_ACTION_WIDTH = 76;

function SwipeableRow({
  children,
  isMobile,
  onSwipeLeftAction,
  onSwipeRightAction,
  leftActionLabel,
  rightActionLabel,
}: {
  children: React.ReactNode;
  isMobile: boolean;
  onSwipeLeftAction?: () => void;
  onSwipeRightAction?: () => void;
  leftActionLabel?: string;
  rightActionLabel?: string;
}) {
  const [translateX, setTranslateX] = useState(0);
  const dragRef = useRef<{ startX: number; startTranslate: number } | null>(null);

  if (!isMobile || (!onSwipeLeftAction && !onSwipeRightAction)) {
    return <>{children}</>;
  }

  function onPointerDown(e: React.PointerEvent) {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startTranslate: translateX };
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragRef.current) return;
    const delta = e.clientX - dragRef.current.startX;
    const maxLeft = onSwipeRightAction ? SWIPE_ACTION_WIDTH : 0;
    const maxRight = onSwipeLeftAction ? SWIPE_ACTION_WIDTH : 0;
    setTranslateX(Math.min(maxLeft, Math.max(-maxRight, dragRef.current.startTranslate + delta)));
  }
  function commitOrSnap() {
    if (!dragRef.current) return;
    dragRef.current = null;
    setTranslateX((current) => {
      if (current <= -SWIPE_ACTION_WIDTH * 0.9 && onSwipeLeftAction) {
        onSwipeLeftAction();
        return 0;
      }
      if (current >= SWIPE_ACTION_WIDTH * 0.9 && onSwipeRightAction) {
        onSwipeRightAction();
        return 0;
      }
      if (current < -SWIPE_ACTION_WIDTH / 2) return -SWIPE_ACTION_WIDTH;
      if (current > SWIPE_ACTION_WIDTH / 2) return SWIPE_ACTION_WIDTH;
      return 0;
    });
  }

  return (
    <div className="relative overflow-hidden rounded-[10px]">
      {onSwipeRightAction && (
        <div
          className="absolute inset-y-0 left-0 flex w-[76px] items-center justify-center rounded-[10px] text-[11px] font-semibold text-white"
          style={{ background: "var(--mset-success)" }}
        >
          {rightActionLabel}
        </div>
      )}
      {onSwipeLeftAction && (
        <div
          className="absolute inset-y-0 right-0 flex w-[76px] items-center justify-center rounded-[10px] text-[11px] font-semibold text-white"
          style={{ background: "var(--mset-danger)" }}
        >
          {leftActionLabel}
        </div>
      )}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={commitOrSnap}
        onPointerCancel={commitOrSnap}
        style={{ transform: `translateX(${translateX}px)`, touchAction: "pan-y" }}
        className="relative bg-white transition-transform duration-150 ease-out"
      >
        {children}
      </div>
    </div>
  );
}

function TaskRow({
  item,
  isMobile,
  color,
  onItemClick,
  onReminderToggle,
  onDelete,
}: {
  item: TaskItem;
  isMobile: boolean;
  color: string;
  onItemClick: (item: TaskItem) => void;
  onReminderToggle: (id: string, completed: boolean) => void;
  onDelete?: (item: TaskItem) => void;
}) {
  const card =
    item.type === "event" ? (
      <EventCard event={item.data} color={color} />
    ) : (
      <ReminderCard reminder={item.data} color={color} onToggle={(c) => onReminderToggle(item.data.id, c)} />
    );

  // [2026-10-08] "role=button" + tabIndex (khong phai <button> that) boc
  // ngoai - vi ReminderCard co 1 <button> THAT (checkbox) long ben trong;
  // long button-trong-button la vi pham a11y VA se bi trinh duyet tu dong
  // dong the som, pha vo click tren phan con lai cua card.
  const rowContent = (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onItemClick(item)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onItemClick(item);
        }
      }}
      className="w-full cursor-pointer text-left outline-none"
    >
      {card}
    </div>
  );

  if (isMobile) {
    return (
      <SwipeableRow
        isMobile
        onSwipeLeftAction={onDelete ? () => onDelete(item) : undefined}
        leftActionLabel="Delete"
        onSwipeRightAction={item.type === "reminder" ? () => onReminderToggle(item.data.id, !item.data.completed) : undefined}
        rightActionLabel="Complete"
      >
        {rowContent}
      </SwipeableRow>
    );
  }

  // Desktop - "compact rows, hover actions hiện".
  return (
    <div className="group relative">
      {rowContent}
      {onDelete && (
        <div className="pointer-events-none absolute top-1.5 right-1.5 opacity-0 transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item);
            }}
            aria-label="Delete"
            className="flex size-6 cursor-pointer items-center justify-center rounded-full bg-white text-[color:var(--planner-text-muted)] shadow-[0_1px_4px_rgba(0,0,0,.14)] transition-colors duration-150 ease-out hover:text-[color:var(--mset-danger)]"
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pull-to-refresh / infinite scroll - gesture/observer thuan, khong thu vien
// ngoai.
// ---------------------------------------------------------------------------

function usePullToRefresh(
  containerRef: React.RefObject<HTMLDivElement | null>,
  onRefresh: (() => void | Promise<void>) | undefined,
  enabled: boolean,
) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const dragStartY = useRef<number | null>(null);
  const pullDistanceRef = useRef(0);

  useEffect(() => {
    if (!enabled || !onRefresh) return;
    const el = containerRef.current;
    if (!el) return;
    function onDown(e: PointerEvent) {
      if (el!.scrollTop > 0) return;
      dragStartY.current = e.clientY;
    }
    function onMove(e: PointerEvent) {
      if (dragStartY.current === null) return;
      const delta = e.clientY - dragStartY.current;
      if (delta > 0 && el!.scrollTop === 0) {
        const next = Math.min(delta * 0.5, 100);
        pullDistanceRef.current = next;
        setPullDistance(next);
      }
    }
    async function onUp() {
      if (dragStartY.current === null) return;
      dragStartY.current = null;
      const dist = pullDistanceRef.current;
      pullDistanceRef.current = 0;
      if (dist >= 64) {
        setRefreshing(true);
        await onRefresh?.();
        setRefreshing(false);
      }
      setPullDistance(0);
    }
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
    };
  }, [enabled, onRefresh, containerRef]);

  return { pullDistance, refreshing };
}

function useInfiniteScroll(
  sentinelRef: React.RefObject<HTMLDivElement | null>,
  onLoadMore: (() => void) | undefined,
  hasMore: boolean,
  loadingMore: boolean,
) {
  useEffect(() => {
    if (!onLoadMore || !hasMore || loadingMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMore();
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [sentinelRef, onLoadMore, hasMore, loadingMore]);
}

// ---------------------------------------------------------------------------
// Main component.
// ---------------------------------------------------------------------------

export function TaskListView({
  items,
  onItemClick,
  onReminderToggle,
  view,
  title = "Tasks",
  calendarColors,
  onDelete,
  onCreateFirstTask,
  onRefresh,
  onLoadMore,
  hasMore = false,
  loadingMore = false,
}: {
  items: TaskItem[];
  onItemClick: (item: TaskItem) => void;
  onReminderToggle: (id: string, completed: boolean) => void;
  view: TaskListGroupBy;
  // Xem comment dau file - props them, khong co trong interface block goc.
  title?: string;
  calendarColors?: Record<string, string>;
  onDelete?: (item: TaskItem) => void;
  onCreateFirstTask?: () => void;
  onRefresh?: () => void | Promise<void>;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
}) {
  const [filterChip, setFilterChip] = useState<FilterChip>("all");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { pullDistance, refreshing } = usePullToRefresh(containerRef, onRefresh, isMobile);
  useInfiniteScroll(sentinelRef, onLoadMore, hasMore, loadingMore);

  const filtered = useMemo(
    () =>
      items.filter((it) => {
        if (filterChip === "events") return it.type === "event";
        if (filterChip === "reminders") return it.type === "reminder";
        if (filterChip === "flagged") return itemFlagged(it);
        return true;
      }),
    [items, filterChip],
  );
  const sorted = useMemo(
    () => [...filtered].sort((a, b) => compareItems(a, b, sortKey)),
    [filtered, sortKey],
  );
  const groups = useMemo(() => buildGroups(sorted, view), [sorted, view]);

  return (
    <div
      className="flex h-full min-h-0 flex-col"
      style={{ fontFamily: "var(--planner-font-family)" }}
    >
      {/* Header bar. */}
      <div className="flex shrink-0 flex-col gap-2.5 border-b border-[color:var(--planner-border-soft)] px-3.5 py-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="truncate text-[16px] font-bold text-[color:var(--planner-text-primary)]">{title}</h2>
          <div className="w-28 shrink-0">
            <InlineSelect value={sortKey} options={SORT_OPTIONS} onChange={setSortKey} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTER_CHIPS.map((c) => {
            const active = filterChip === c.value;
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => setFilterChip(c.value)}
                className="cursor-pointer rounded-full border px-2.5 py-1 text-[11.5px] font-medium transition-colors duration-150 ease-out"
                style={{
                  borderColor: active ? "var(--planner-primary)" : "var(--planner-border-soft)",
                  background: active ? "var(--planner-primary-soft)" : "white",
                  color: active ? "var(--planner-primary)" : "var(--planner-text-secondary)",
                }}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* List body - 1 scroll container DUY NHAT, lo ca pull-to-refresh
          (dinh tren) lan infinite scroll (sentinel duoi). */}
      <div ref={containerRef} className="mset-scroll relative min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {onRefresh && (pullDistance > 0 || refreshing) && (
          <div
            className="flex items-center justify-center overflow-hidden transition-[height] duration-150 ease-out"
            style={{ height: refreshing ? 40 : pullDistance }}
          >
            <Loader2
              size={16}
              className={cn("text-[color:var(--planner-primary)]", refreshing && "animate-spin")}
              style={!refreshing ? { transform: `rotate(${pullDistance * 3.6}deg)` } : undefined}
            />
          </div>
        )}

        {groups.length === 0 ? (
          <EmptyState onCreateFirstTask={onCreateFirstTask} />
        ) : (
          <div className="flex flex-col pb-3">
            {groups.map((g) => (
              <div key={g.key}>
                <GroupHeaderRow
                  view={view}
                  label={g.label}
                  count={g.items.length}
                  color={resolveColor(g.label, calendarColors)}
                  priority={view === "by_priority" ? (g.key as Priority) : "none"}
                />
                <div className="flex flex-col gap-1.5 px-3.5">
                  {g.items.map((it) => (
                    <TaskRow
                      key={`${it.type}:${itemId(it)}`}
                      item={it}
                      isMobile={isMobile}
                      color={resolveColor(itemGroupName(it), calendarColors)}
                      onItemClick={onItemClick}
                      onReminderToggle={onReminderToggle}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              </div>
            ))}
            {onLoadMore && hasMore && (
              <div ref={sentinelRef} className="flex items-center justify-center py-3">
                {loadingMore && <Loader2 size={16} className="animate-spin text-[color:var(--planner-text-muted)]" />}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
