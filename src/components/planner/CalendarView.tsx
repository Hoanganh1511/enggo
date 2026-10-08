"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, Users as UsersIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "./use-is-mobile";
import type { CalendarEvent, Reminder } from "./calendar-types";

// [2026-10-08] CalendarView - "Code component CalendarView — hiển thị lịch
// theo 3 chế độ". DOC LAP voi model PlannerItem (xem comment dau
// calendar-types.ts).
//
// [2026-10-08] Khong co prop "anchor" rieng (interface goc CHI co
// `selectedDate`) - thang hien tai dang xem (Month view)/tuan dang xem
// (Week view) deu suy THANG tu `selectedDate` (thang/tuan CHUA no). Day
// view hien nhien la chinh `selectedDate`. Day la cach doc HOP LY DUY NHAT
// voi dung bo props nguoi dung dua, khong them prop "anchor" rieng.
//
// [2026-10-08] Gioi han CO Y THUC, flag ro (khong ngam hieu la lam xong het):
// - "Drag event để di chuyển/resize" trong Week view: spec tu ghi rõ
//   "(optional)" - KHONG implement (click-to-create qua onSlotClick - phan
//   BAT BUOC - CO lam). Them keo-tha/resize that su la 1 khoi luong cong
//   viec rieng (tuong tu WeekTimeGrid trong PlannerShell.tsx, ~300 dong
//   logic) - ngoai pham vi hop ly cho 1 component "code moi" duy nhat nay.
// - "Virtualize giờ rows trong week/day view": CHU DICH BO QUA - 24 hang
//   gio/ngay KHONG phai quy mo can virtualize that su (khac vai nghin dong
//   trong 1 list dai), va repo CHUA co san thu vien virtualization nao (vd
//   react-window/react-virtual) - them 1 dependency moi chi de "virtualize"
//   24 phan tu la lam phuc tap hoa khong can thiet. "Chi render events
//   trong visible range" VA "Memoize event positioning calculations" (2 y
//   con lai cua muc Performance) CO duoc lam that (xem useMemo filter theo
//   range + layoutTimedOverlap/layoutRowEvents).
// - "Mobile week: scroll ngang hoặc chỉ hiện 3 ngày" (spec de ngo CA 2) -
//   chon "chỉ hiện 3 ngày" (center quanh selectedDate) thay vi scroll ngang
//   24h-grid rong - de dam bao dung chuan voi header gio dinh (sticky) hon,
//   UX on dinh hon tren man hinh hep.
// - "+N more" (Month view) khi bam: KHONG co callback rieng trong props goc
//   cho "xem het danh sach ngay do" - goi onDateSelect(date) (dieu huong
//   focus ve dung ngay do), hop ly nhat voi bo props hien co, khong them
//   callback moi.

// ---------------------------------------------------------------------------
// Date utils (LOCAL cho file nay - cac component macOS-style khac trong
// Planner cung tu giu util rieng thay vi cross-import tu PlannerShell.tsx,
// xem EventForm/ReminderForm/RecurrenceEditor/TaskListView).
// ---------------------------------------------------------------------------

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}
function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function parseISO(iso: string): Date {
  return new Date(`${iso}T00:00:00`);
}
function addDays(iso: string, days: number): string {
  const d = parseISO(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}
function addMonths(iso: string, months: number): string {
  const d = parseISO(iso);
  d.setMonth(d.getMonth() + months, 1);
  return toISODate(d);
}
// Thu 2 dau tuan.
function startOfWeekMonday(iso: string): string {
  const d = parseISO(iso);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return toISODate(d);
}
// O dau tien cua luoi Thang (co the roi vao thang TRUOC) - Thu 2 cua tuan
// chua ngay mung 1.
function startOfMonthGrid(iso: string): string {
  const d = parseISO(iso);
  d.setDate(1);
  return startOfWeekMonday(toISODate(d));
}
function daysBetween(a: string, b: string): number {
  return Math.round((parseISO(b).getTime() - parseISO(a).getTime()) / 86400000);
}
function todayISO(): string {
  return toISODate(new Date());
}
function formatHM12(hm: string): string {
  const [hStr, mStr] = hm.split(":");
  const h = Number(hStr);
  const h12 = h % 12 || 12;
  return `${h12}:${mStr.padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}
function minutesFromHM(hm: string): number {
  const [h, m] = hm.split(":").map(Number);
  return h * 60 + m;
}

const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAY_SHORT_MON_START = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_ROW_HEIGHT = 48;

const EVENT_COLOR_PALETTE = [
  "#007aff", "#ff9500", "#34c759", "#af52de", "#ff3b30",
  "#30b0c7", "#5856d6", "#ff2d55", "#a2845e", "#8e8e93",
];
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
// CalendarEvent (calendar-types.ts) khong tu mang mau rieng (chi 1 ten
// `calendar: string`) - suy mau on dinh tu ten calendar, giong pattern da
// dung o TaskListView.tsx.
function colorForEvent(event: CalendarEvent): string {
  return EVENT_COLOR_PALETTE[hashString(event.calendar) % EVENT_COLOR_PALETTE.length];
}

// ---------------------------------------------------------------------------
// Layout: xep NHIEU NGAY event thanh "lane" trong 1 hang (dung CHUNG cho
// Month view - moi hang tuan - VA hang "Cả ngày" cua Week/Day view) - thuat
// toan greedy pack tung event vao lane DAU TIEN khong trung cot ngay nao.
// ---------------------------------------------------------------------------

type RowSegment = { event: CalendarEvent; lane: number; startCol: number; endCol: number };

function layoutRowEvents(rowDates: string[], events: CalendarEvent[]): RowSegment[] {
  const rowStart = rowDates[0];
  const rowEnd = rowDates[rowDates.length - 1];
  const overlapping = events.filter((e) => e.startDate <= rowEnd && e.endDate >= rowStart);
  overlapping.sort((a, b) => {
    if (a.startDate !== b.startDate) return a.startDate.localeCompare(b.startDate);
    return b.endDate.localeCompare(a.endDate);
  });
  const laneOccupied: boolean[][] = [];
  const segments: RowSegment[] = [];
  for (const event of overlapping) {
    const startCol = Math.max(0, daysBetween(rowStart, event.startDate));
    const endCol = Math.min(rowDates.length - 1, daysBetween(rowStart, event.endDate));
    let lane = 0;
    for (;;) {
      const occ = laneOccupied[lane] ?? (laneOccupied[lane] = Array(rowDates.length).fill(false));
      let free = true;
      for (let c = startCol; c <= endCol; c++) {
        if (occ[c]) {
          free = false;
          break;
        }
      }
      if (free) {
        for (let c = startCol; c <= endCol; c++) occ[c] = true;
        segments.push({ event, lane, startCol, endCol });
        break;
      }
      lane++;
    }
  }
  return segments;
}

// Dem so event (tinh ca lane bi an) phu cot `col` - dung tinh "+N more"
// cho tung o ngay.
function countAtColumn(segments: RowSegment[], col: number): number {
  return segments.filter((s) => s.startCol <= col && col <= s.endCol).length;
}

// ---------------------------------------------------------------------------
// Layout: xep CHONG GIO (timed events trong 1 ngay) - "peak concurrency":
// vi tri/do rong co dinh theo doan CHONG NHIEU NHAT trong vong doi event,
// dam bao 2 event chong nhau KHONG BAO GIO de len nhau (cung thuat toan da
// dung/kiem chung trong PlannerShell.tsx's layoutTimedItems).
// ---------------------------------------------------------------------------

type TimedSegment = { event: CalendarEvent; startMin: number; endMin: number; leftPercent: number; widthPercent: number };

function layoutTimedOverlap(dayDate: string, events: CalendarEvent[]): TimedSegment[] {
  const timed = events
    .filter((e) => !e.allDay && e.startDate === dayDate && e.startTime && e.endTime)
    .map((e) => ({
      event: e,
      // [2026-10-08] Clip ve dung [0,1440] cua NGAY NAY - gioi han don gian
      // hoa cho event nhieu ngay co gio (hiem, vd qua dem) - xem comment dau
      // file.
      startMin: Math.max(0, minutesFromHM(e.startTime!)),
      endMin: Math.min(1440, Math.max(minutesFromHM(e.endTime!), minutesFromHM(e.startTime!) + 15)),
    }))
    .sort((a, b) => a.startMin - b.startMin);

  if (timed.length === 0) return [];

  // Nhom cac event CHONG LIEN THONG (cung 1 "cluster") de tinh peak rieng
  // tung cum - tranh 2 event o 2 dau ngay khong lien quan bi gop chung so
  // "max concurrency".
  const clusters: (typeof timed)[] = [];
  let current: typeof timed = [];
  let clusterEnd = -1;
  for (const t of timed) {
    if (current.length === 0 || t.startMin < clusterEnd) {
      current.push(t);
      clusterEnd = Math.max(clusterEnd, t.endMin);
    } else {
      clusters.push(current);
      current = [t];
      clusterEnd = t.endMin;
    }
  }
  if (current.length > 0) clusters.push(current);

  const result: TimedSegment[] = [];
  for (const cluster of clusters) {
    // Diem moc (start/end moi event) -> doan nho, tim doan "dong thoi nhieu
    // nhat" (peak) cho CA cluster, dung LAM SO COT co dinh.
    const points = Array.from(new Set(cluster.flatMap((t) => [t.startMin, t.endMin]))).sort((a, b) => a - b);
    let peakCount = 1;
    for (let i = 0; i < points.length - 1; i++) {
      const mid = (points[i] + points[i + 1]) / 2;
      const count = cluster.filter((t) => t.startMin <= mid && mid < t.endMin).length;
      peakCount = Math.max(peakCount, count);
    }
    // Gan tung event vao 1 "cot" trong so peakCount cot (greedy - cot DAU
    // TIEN rang trong khoang [start,end) cua no).
    const colEnds: number[] = Array(peakCount).fill(-Infinity);
    for (const t of cluster) {
      let col = 0;
      for (; col < peakCount; col++) {
        if (colEnds[col] <= t.startMin) break;
      }
      if (col >= peakCount) col = peakCount - 1;
      colEnds[col] = t.endMin;
      result.push({
        event: t.event,
        startMin: t.startMin,
        endMin: t.endMin,
        leftPercent: (col / peakCount) * 100,
        widthPercent: 100 / peakCount,
      });
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Shared small pieces.
// ---------------------------------------------------------------------------

function ViewSwitcher({
  view,
  onViewChange,
}: {
  view: "month" | "week" | "day";
  onViewChange: (v: "month" | "week" | "day") => void;
}) {
  return (
    <div
      className="inline-flex"
      style={{ padding: 2, background: "var(--mset-surface-tertiary)", border: "1px solid rgba(0,0,0,.06)", borderRadius: 9 }}
    >
      {(["month", "week", "day"] as const).map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onViewChange(v)}
          className="h-7 cursor-pointer rounded-[7px] border-0 px-3 text-xs font-medium capitalize outline-none transition-[background-color,box-shadow] duration-150 ease-out"
          style={{
            background: view === v ? "#ffffff" : "transparent",
            color: view === v ? "var(--mset-text-primary)" : "var(--mset-text-secondary)",
            boxShadow: view === v ? "0 1px 3px rgba(0,0,0,.10), 0 0 0 0.5px rgba(0,0,0,.04)" : "none",
          }}
        >
          {v}
        </button>
      ))}
    </div>
  );
}

function NowLine({ dayDate }: { dayDate: string }) {
  const [minute, setMinute] = useState(() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  });
  useEffect(() => {
    const id = setInterval(() => {
      const d = new Date();
      setMinute(d.getHours() * 60 + d.getMinutes());
    }, 60000);
    return () => clearInterval(id);
  }, []);
  if (dayDate !== todayISO()) return null;
  return (
    <div
      className="pointer-events-none absolute right-0 left-0 z-[3] flex items-center"
      style={{ top: (minute / 60) * HOUR_ROW_HEIGHT }}
    >
      <span className="-ml-1 size-2 shrink-0 rounded-full" style={{ background: "var(--mset-danger)" }} />
      <span className="h-px flex-1" style={{ background: "var(--mset-danger)" }} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Month View.
// ---------------------------------------------------------------------------

function MonthView({
  monthAnchor,
  selectedDate,
  events,
  isMobile,
  onDateSelect,
  onEventClick,
}: {
  monthAnchor: string;
  selectedDate: string;
  events: CalendarEvent[];
  isMobile: boolean;
  onDateSelect: (date: string) => void;
  onEventClick: (event: CalendarEvent) => void;
}) {
  const gridStart = useMemo(() => startOfMonthGrid(monthAnchor), [monthAnchor]);
  const currentMonth = parseISO(monthAnchor).getMonth();
  // 6 hang x 7 = 42 o (du cho moi thang, "5-6 hàng" theo spec).
  const allDates = useMemo(() => Array.from({ length: 42 }, (_, i) => addDays(gridStart, i)), [gridStart]);
  const weeks = useMemo(() => {
    const out: string[][] = [];
    for (let i = 0; i < 42; i += 7) out.push(allDates.slice(i, i + 7));
    return out;
  }, [allDates]);

  // Performance: chi filter events 1 LAN cho toan bo luoi (visible range),
  // memo hoa layout tung hang rieng.
  const visibleEvents = useMemo(
    () => events.filter((e) => e.startDate <= allDates[41] && e.endDate >= allDates[0]),
    [events, allDates],
  );

  const today = todayISO();
  const MAX_VISIBLE_LANES = 3;

  // [2026-10-08 fix] 1 useMemo DUY NHAT cho TOAN BO 6 hang (khong phai goi
  // 1 hook rieng MOI LAN lap trong .map() ben duoi) - goi hook ben trong
  // vong lap vi pham Rules of Hooks THAT SU (khong chi la 1 lint nitpick -
  // React dua vao THU TU/SO LAN goi hook on dinh giua cac lan render de
  // theo doi state dung chu khong phai dua vao noi dung code, rui ro that
  // neu sau nay code thay doi khien so lan goi khong con co dinh nua).
  const rowSegmentsList = useMemo(
    () => weeks.map((rowDates) => layoutRowEvents(rowDates, visibleEvents)),
    [weeks, visibleEvents],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="grid grid-cols-7 border-b border-[color:var(--planner-border-soft)]">
        {WEEKDAY_SHORT_MON_START.map((w) => (
          <div key={w} className="py-1.5 text-center text-[11px] font-semibold text-[color:var(--planner-text-muted)]">
            {w}
          </div>
        ))}
      </div>
      <div className="grid min-h-0 flex-1 grid-rows-6">
        {weeks.map((rowDates, rowIdx) => {
          const segments = rowSegmentsList[rowIdx];
          return (
            <div key={rowIdx} className="relative grid grid-cols-7 border-b border-[color:var(--planner-border-soft)]">
              {rowDates.map((date) => {
                const inMonth = parseISO(date).getMonth() === currentMonth;
                const isToday = date === today;
                const isSelected = date === selectedDate;
                const col = daysBetween(rowDates[0], date);
                const dots = segments.filter((s) => s.startCol <= col && col <= s.endCol).slice(0, 3);
                return (
                  <button
                    key={date}
                    type="button"
                    onClick={() => onDateSelect(date)}
                    className={cn(
                      "flex cursor-pointer flex-col items-stretch gap-1 border-l border-[color:var(--planner-border-soft)] p-1 text-left transition-colors duration-150 ease-out hover:bg-[var(--planner-surface-soft)]",
                      !inMonth && "opacity-40",
                      isSelected && "bg-[color:var(--planner-primary-soft)]",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-5 items-center justify-center self-end rounded-full text-[11px] font-medium",
                        isToday ? "text-white" : "text-[color:var(--planner-text-primary)]",
                      )}
                      style={isToday ? { background: "var(--planner-primary)" } : undefined}
                    >
                      {parseISO(date).getDate()}
                    </span>
                    {isMobile ? (
                      dots.length > 0 && (
                        <span className="flex items-center justify-center gap-0.5">
                          {dots.map((s) => (
                            <span
                              key={s.event.id}
                              className="size-1.5 rounded-full"
                              style={{ background: colorForEvent(s.event) }}
                            />
                          ))}
                        </span>
                      )
                    ) : (
                      <span className="mt-4 flex flex-col gap-[2px]" />
                    )}
                  </button>
                );
              })}
              {/* Overlay bars (desktop) - 7-cot, tung lane 1 hang nho, dinh vi
                  TUYET DOI, bat dau duoi so ngay (top offset co dinh). */}
              {!isMobile && (
                <div
                  className="pointer-events-none absolute inset-x-0 grid grid-cols-7 gap-x-0"
                  style={{ top: 22 }}
                >
                  {segments
                    .filter((s) => s.lane < MAX_VISIBLE_LANES)
                    .map((s) => (
                      <button
                        key={s.event.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(s.event);
                        }}
                        className="pointer-events-auto mx-0.5 mb-[2px] cursor-pointer truncate rounded-[4px] px-1 text-left text-[10px] font-medium text-white"
                        style={{
                          gridColumn: `${s.startCol + 1} / ${s.endCol + 2}`,
                          gridRow: s.lane + 1,
                          background: colorForEvent(s.event),
                        }}
                        title={s.event.title}
                      >
                        {s.event.title}
                      </button>
                    ))}
                  {rowDates.map((date, col) => {
                    const hidden = Math.max(0, countAtColumn(segments, col) - MAX_VISIBLE_LANES);
                    if (hidden === 0) return null;
                    return (
                      <button
                        key={`more-${date}`}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDateSelect(date);
                        }}
                        className="pointer-events-auto mx-0.5 cursor-pointer truncate text-left text-[9.5px] font-semibold text-[color:var(--planner-text-muted)] hover:text-[color:var(--planner-text-secondary)]"
                        style={{ gridColumn: col + 1, gridRow: MAX_VISIBLE_LANES + 1 }}
                      >
                        +{hidden} more
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


// ---------------------------------------------------------------------------
// Week/Day shared time-grid.
// ---------------------------------------------------------------------------

function TimeGridView({
  days,
  selectedDate,
  events,
  detailed,
  onDateSelect,
  onEventClick,
  onSlotClick,
}: {
  days: string[];
  selectedDate: string;
  events: CalendarEvent[];
  // Day view: "Chi tiết hơn: hiện location, invitees trong event block".
  detailed: boolean;
  onDateSelect: (date: string) => void;
  onEventClick: (event: CalendarEvent) => void;
  onSlotClick: (start: string, end: string) => void;
}) {
  const visibleEvents = useMemo(
    () => events.filter((e) => e.startDate <= days[days.length - 1] && e.endDate >= days[0]),
    [events, days],
  );
  const allDaySegments = useMemo(
    () => layoutRowEvents(days, visibleEvents.filter((e) => e.allDay)),
    [days, visibleEvents],
  );
  // [2026-10-08 fix] 1 useMemo DUY NHAT cho TOAN BO `days` (khong phai goi
  // hook rieng MOI NGAY trong .map() ben duoi) - cung ly do voi
  // rowSegmentsList trong MonthView: goi hook trong vong lap vi pham Rules
  // of Hooks THAT SU.
  const timedByDay = useMemo(() => {
    const map: Record<string, TimedSegment[]> = {};
    for (const date of days) map[date] = layoutTimedOverlap(date, visibleEvents);
    return map;
  }, [days, visibleEvents]);
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 7 * HOUR_ROW_HEIGHT - 24 });
  }, []);

  function handleSlotMouseDown(e: React.MouseEvent<HTMLDivElement>, date: string) {
    const rect = e.currentTarget.getBoundingClientRect();
    const minuteFromY = (clientY: number) => {
      const raw = ((clientY - rect.top) / HOUR_ROW_HEIGHT) * 60;
      return Math.min(1440, Math.max(0, Math.round(raw / 15) * 15));
    };
    const startMin = minuteFromY(e.clientY);
    onDateSelect(date);
    onSlotClick(
      `${date}T${pad2(Math.floor(startMin / 60))}:${pad2(startMin % 60)}:00`,
      `${date}T${pad2(Math.floor(Math.min(startMin + 60, 1440) / 60))}:${pad2(Math.min(startMin + 60, 1440) % 60)}:00`,
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex border-b border-[color:var(--planner-border-soft)]">
        <div className="w-12 shrink-0" />
        {days.map((date) => {
          const isToday = date === todayISO();
          return (
            <button
              key={date}
              type="button"
              onClick={() => onDateSelect(date)}
              className={cn(
                "flex flex-1 cursor-pointer flex-col items-center gap-0.5 border-l border-[color:var(--planner-border-soft)] py-1.5 transition-colors duration-150 ease-out hover:bg-[var(--planner-surface-soft)]",
                date === selectedDate && "bg-[color:var(--planner-primary-soft)]",
              )}
            >
              <span className="text-[10.5px] font-semibold text-[color:var(--planner-text-muted)] uppercase">
                {parseISO(date).toLocaleDateString("en-US", { weekday: "short" })}
              </span>
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full text-[12.5px] font-semibold",
                  isToday ? "text-white" : "text-[color:var(--planner-text-primary)]",
                )}
                style={isToday ? { background: "var(--planner-primary)" } : undefined}
              >
                {parseISO(date).getDate()}
              </span>
            </button>
          );
        })}
      </div>

      {allDaySegments.length > 0 && (
        <div className="relative flex border-b border-[color:var(--planner-border-soft)]" style={{ minHeight: 24 }}>
          <div className="w-12 shrink-0 pt-1 pl-1 text-[9.5px] font-medium text-[color:var(--planner-text-muted)]">
            All day
          </div>
          <div
            className="grid flex-1 gap-x-0 py-0.5"
            style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}
          >
            {allDaySegments.map((s) => (
              <button
                key={s.event.id}
                type="button"
                onClick={() => onEventClick(s.event)}
                className="mx-0.5 mb-0.5 cursor-pointer truncate rounded-[4px] px-1.5 py-0.5 text-left text-[10.5px] font-medium text-white"
                style={{ gridColumn: `${s.startCol + 1} / ${s.endCol + 2}`, gridRow: s.lane + 1, background: colorForEvent(s.event) }}
              >
                {s.event.title}
              </button>
            ))}
          </div>
        </div>
      )}

      <div ref={scrollRef} className="mset-scroll min-h-0 flex-1 overflow-y-auto">
        <div className="flex">
          <div className="w-12 shrink-0">
            {HOURS.map((h) => (
              <div key={h} className="relative" style={{ height: HOUR_ROW_HEIGHT }}>
                {h > 0 && (
                  <span className="absolute top-0 right-1 -translate-y-1/2 text-[10px] font-medium text-[color:var(--planner-text-muted)]">
                    {h.toString().padStart(2, "0")}:00
                  </span>
                )}
              </div>
            ))}
          </div>
          {days.map((date) => {
            const segments = timedByDay[date];
            return (
              <div
                key={date}
                onMouseDown={(e) => handleSlotMouseDown(e, date)}
                className="relative flex-1 cursor-pointer border-l border-[color:var(--planner-border-soft)]"
                style={{ height: HOUR_ROW_HEIGHT * 24 }}
              >
                {HOURS.map((h) => (
                  <div key={h} className="border-t border-[color:var(--planner-border-soft)]" style={{ height: HOUR_ROW_HEIGHT }} />
                ))}
                <NowLine dayDate={date} />
                {segments.map((s) => (
                  <button
                    key={s.event.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(s.event);
                    }}
                    className="absolute z-[2] flex cursor-pointer flex-col items-start gap-0.5 overflow-hidden rounded-[6px] px-1.5 py-1 text-left text-white"
                    style={{
                      top: (s.startMin / 60) * HOUR_ROW_HEIGHT,
                      height: Math.max(18, ((s.endMin - s.startMin) / 60) * HOUR_ROW_HEIGHT),
                      left: `calc(${s.leftPercent}% + 2px)`,
                      width: `calc(${s.widthPercent}% - 4px)`,
                      background: colorForEvent(s.event),
                    }}
                  >
                    <span className="truncate text-[11px] font-semibold">{s.event.title}</span>
                    {detailed && (
                      <>
                        <span className="truncate text-[10px] opacity-90">
                          {formatHM12(s.event.startTime!)} — {formatHM12(s.event.endTime!)}
                        </span>
                        {s.event.location && (
                          <span className="flex items-center gap-0.5 truncate text-[10px] opacity-90">
                            <MapPin size={9} className="shrink-0" />
                            {s.event.location}
                          </span>
                        )}
                        {s.event.invitees.length > 0 && (
                          <span className="flex items-center gap-0.5 truncate text-[10px] opacity-90">
                            <UsersIcon size={9} className="shrink-0" />
                            {s.event.invitees.length}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


// ---------------------------------------------------------------------------
// Day view sidebar - "Sidebar: danh sách reminders due ngày hôm đó".
// ---------------------------------------------------------------------------

function DayReminderSidebar({ date, reminders }: { date: string; reminders: Reminder[] }) {
  const dueToday = reminders.filter((r) => r.dueDate === date);
  return (
    <div className="flex w-56 shrink-0 flex-col gap-2 border-l border-[color:var(--planner-border-soft)] p-3">
      <p className="text-[11px] font-semibold tracking-[.03em] text-[color:var(--planner-text-secondary)] uppercase">
        Due Today ({dueToday.length})
      </p>
      {dueToday.length === 0 ? (
        <p className="text-[12px] text-[color:var(--planner-text-muted)]">No reminders due today.</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {dueToday.map((r) => (
            <div key={r.id} className="flex items-center gap-2 rounded-[8px] border border-[color:var(--planner-border-soft)] px-2 py-1.5">
              <span
                className="grid size-[14px] shrink-0 place-items-center rounded-full border"
                style={{ borderColor: r.completed ? "var(--planner-primary)" : "#c7c7cc", background: r.completed ? "var(--planner-primary)" : "white" }}
              />
              <span className={cn("truncate text-[12px] font-medium text-[color:var(--planner-text-primary)]", r.completed && "text-[color:var(--planner-text-muted)] line-through")}>
                {r.title}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component.
// ---------------------------------------------------------------------------

export function CalendarView({
  events,
  reminders,
  selectedDate,
  onDateSelect,
  onEventClick,
  onSlotClick,
  view,
  onViewChange,
}: {
  events: CalendarEvent[];
  reminders: Reminder[];
  selectedDate: string;
  onDateSelect: (date: string) => void;
  onEventClick: (event: CalendarEvent) => void;
  onSlotClick: (start: string, end: string) => void;
  view: "month" | "week" | "day";
  onViewChange: (view: "month" | "week" | "day") => void;
}) {
  const isMobile = useIsMobile();

  const weekDays = useMemo(() => {
    const start = startOfWeekMonday(selectedDate);
    if (isMobile) {
      // "Mobile week: ... chỉ hiện 3 ngày" - center quanh selectedDate.
      return [addDays(selectedDate, -1), selectedDate, addDays(selectedDate, 1)];
    }
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [selectedDate, isMobile]);

  // Keyboard: arrow left/right chuyen ngay/tuan/thang tuy view dang xem.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const dir = e.key === "ArrowLeft" ? -1 : 1;
      e.preventDefault();
      if (view === "month") onDateSelect(addMonths(selectedDate, dir));
      else if (view === "week") onDateSelect(addDays(selectedDate, dir * 7));
      else onDateSelect(addDays(selectedDate, dir));
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [view, selectedDate, onDateSelect]);

  function goPrev() {
    if (view === "month") onDateSelect(addMonths(selectedDate, -1));
    else if (view === "week") onDateSelect(addDays(selectedDate, -7));
    else onDateSelect(addDays(selectedDate, -1));
  }
  function goNext() {
    if (view === "month") onDateSelect(addMonths(selectedDate, 1));
    else if (view === "week") onDateSelect(addDays(selectedDate, 7));
    else onDateSelect(addDays(selectedDate, 1));
  }

  const headerLabel =
    view === "month"
      ? `${MONTH_LABELS[parseISO(selectedDate).getMonth()]} ${parseISO(selectedDate).getFullYear()}`
      : view === "day"
        ? parseISO(selectedDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
        : `${MONTH_LABELS[parseISO(weekDays[0]).getMonth()]} ${parseISO(weekDays[0]).getDate()} – ${parseISO(weekDays[weekDays.length - 1]).getDate()}, ${parseISO(weekDays[0]).getFullYear()}`;

  return (
    <div className="flex h-full min-h-0 flex-col" style={{ fontFamily: "var(--planner-font-family)" }}>
      {/* Shared header. */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[color:var(--planner-border-soft)] px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous"
            className="flex size-7 cursor-pointer items-center justify-center rounded-[8px] text-[color:var(--planner-text-secondary)] hover:bg-[var(--planner-surface-soft)]"
          >
            <ChevronLeft size={15} />
          </button>
          <span className="min-w-[160px] text-[14px] font-bold text-[color:var(--planner-text-primary)]">{headerLabel}</span>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next"
            className="flex size-7 cursor-pointer items-center justify-center rounded-[8px] text-[color:var(--planner-text-secondary)] hover:bg-[var(--planner-surface-soft)]"
          >
            <ChevronRight size={15} />
          </button>
          <button
            type="button"
            onClick={() => onDateSelect(todayISO())}
            className="cursor-pointer rounded-[8px] border border-[color:var(--planner-border)] px-2.5 py-1 text-[12px] font-medium text-[color:var(--planner-text-secondary)] hover:bg-[var(--planner-surface-soft)]"
          >
            Today
          </button>
        </div>
        <ViewSwitcher view={view} onViewChange={onViewChange} />
      </div>

      {/* Body. */}
      <div className="flex min-h-0 flex-1">
        <div className="flex min-h-0 flex-1 flex-col">
          {view === "month" && (
            <MonthView
              monthAnchor={selectedDate}
              selectedDate={selectedDate}
              events={events}
              isMobile={isMobile}
              onDateSelect={onDateSelect}
              onEventClick={onEventClick}
            />
          )}
          {view === "week" && (
            <TimeGridView
              days={weekDays}
              selectedDate={selectedDate}
              events={events}
              detailed={false}
              onDateSelect={onDateSelect}
              onEventClick={onEventClick}
              onSlotClick={onSlotClick}
            />
          )}
          {view === "day" && (
            <TimeGridView
              days={[selectedDate]}
              selectedDate={selectedDate}
              events={events}
              detailed
              onDateSelect={onDateSelect}
              onEventClick={onEventClick}
              onSlotClick={onSlotClick}
            />
          )}
        </div>
        {view === "day" && !isMobile && <DayReminderSidebar date={selectedDate} reminders={reminders} />}
      </div>
    </div>
  );
}
