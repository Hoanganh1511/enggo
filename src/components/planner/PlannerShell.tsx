"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Clock, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { TrackingPageHeader } from "@/components/tracking/TrackingPageHeader";
import type { ApiPlannerItem, PlannerItemKind } from "@/lib/api/planner";
import {
  listPlannerItemsAction,
  createPlannerItemAction,
  updatePlannerItemAction,
  deletePlannerItemAction,
} from "@/actions/planner/planner";

type ViewMode = "week" | "month";
type ItemsByDate = Record<string, ApiPlannerItem[]>;

// Van dung cho head MonthGrid (tieng Viet, giu nguyen - yeu cau nguoi dung
// CHI noi ve "trục X" cua lich co luoi gio, tuc WeekTimeGrid ben duoi).
const WEEKDAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
// [2026-10-02] Rieng head WeekTimeGrid - yeu cau nguoi dung: "các ngày trong
// tuần theo tiếng anh". Thu 2 (index 0, T2) la dau tuan theo startOfWeek() da
// dung xuyen suot file nay (ISO 8601, tuan bat dau Thu Hai).
const WEEKDAY_LABELS_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_LABELS = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

// [2026-10-02] Bang mau cho checklist - yeu cau nguoi dung: "khi tạo
// checklist cũng được chọn loại màu cho nó". TAI DUNG dung 6 mau + "Mac dinh"
// da co san o TEXT_COLORS (SelectionFloatingMenu.tsx, tinh nang chon mau chu
// trong editor) thay vi bia 1 bang mau rieng cho Planner - nhat quan mau sac
// trong toan app (nguoi dung da chon dung bang mau nay roi "Tai dung 7 mau da
// co trong editor" khi duoc hoi).
const PLANNER_COLORS: { label: string; value: string | null }[] = [
  { label: "Mặc định", value: null },
  { label: "Đỏ", value: "#ef4444" },
  { label: "Cam", value: "#f97316" },
  { label: "Vàng", value: "#eab308" },
  { label: "Xanh lá", value: "#22c55e" },
  { label: "Xanh dương", value: "#3b82f6" },
  { label: "Tím", value: "#a855f7" },
];

// Luoi gio (truc Y) WeekTimeGrid - CHI view Tuan (o Thang qua nho de ve luoi
// gio hop ly, theo dung xac nhan cua nguoi dung). 56px/gio (h-14 Tailwind) -
// du cao de doc so gio ro rang nhung khong qua dai (24 gio x 56px = 1344px,
// cuon rieng trong 1 khung cao co dinh thay vi day dai ca trang).
const HOUR_ROW_HEIGHT = 56;
const HOURS = Array.from({ length: 24 }, (_, h) => h);

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}
function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months, 1);
  return toISODate(d);
}
function startOfWeek(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDay(); // 0 = Chu nhat
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diffToMonday);
  return toISODate(d);
}
function startOfMonth(dateStr: string): string {
  const d = new Date(dateStr);
  d.setDate(1);
  return toISODate(d);
}
function endOfMonth(dateStr: string): string {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + 1, 0);
  return toISODate(d);
}
function minutesToLabel(m: number): string {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}`;
}
function timeInputToMinutes(value: string): number {
  const [h, mm] = value.split(":").map(Number);
  return h * 60 + mm;
}
function groupByDate(items: ApiPlannerItem[]): ItemsByDate {
  const map: ItemsByDate = {};
  for (const item of items) {
    (map[item.date] ??= []).push(item);
  }
  return map;
}
function rangeForMode(mode: ViewMode, anchor: string): { from: string; to: string } {
  return mode === "week"
    ? { from: startOfWeek(anchor), to: addDays(startOfWeek(anchor), 6) }
    : { from: startOfMonth(anchor), to: endOfMonth(anchor) };
}

// Planner - trang /planner RIENG, HOAN TOAN MOI (yeu cau nguoi dung: "Triển
// khai 1 button trên header để dẫn tới trang... Planner" kem mo ta chi tiet:
// filter tuan/thang, chia 2 nua (trai: tuan/thang, phai: chi tiet 1 ngay),
// checklist co gio + 2 "thể loại" đơn/lớn co dau viec con). KHONG dung chung
// gi voi /tracking (dang khoa, xem tracking/layout.tsx) - tu PlannerItem
// rieng (backend) den component nay.
export function PlannerShell({
  initialDate,
  initialItems,
}: {
  initialDate: string;
  initialItems: ApiPlannerItem[];
}) {
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [anchor, setAnchor] = useState(initialDate);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [itemsByDate, setItemsByDate] = useState<ItemsByDate>(() => groupByDate(initialItems));
  const [isLoading, setIsLoading] = useState(false);

  async function reload(range: { from: string; to: string }) {
    setIsLoading(true);
    const items = await listPlannerItemsAction(range.from, range.to).catch(() => []);
    setItemsByDate(groupByDate(items));
    setIsLoading(false);
  }

  function switchMode(mode: ViewMode) {
    if (mode === viewMode) return;
    setViewMode(mode);
    void reload(rangeForMode(mode, anchor));
  }

  function changeAnchor(direction: -1 | 1) {
    const next = viewMode === "week" ? addDays(anchor, direction * 7) : addMonths(anchor, direction);
    setAnchor(next);
    void reload(rangeForMode(viewMode, next));
  }

  function patchDate(date: string, updater: (items: ApiPlannerItem[]) => ApiPlannerItem[]) {
    setItemsByDate((prev) => ({ ...prev, [date]: updater(prev[date] ?? []) }));
  }

  async function handleAddItem(
    title: string,
    kind: PlannerItemKind,
    scheduledMinute?: number,
    color?: string,
  ) {
    const created = await createPlannerItemAction({
      date: selectedDate,
      title,
      kind,
      scheduledMinute,
      color,
    }).catch(() => null);
    if (created) patchDate(selectedDate, (items) => [...items, created]);
  }

  async function handleAddChild(parentId: string, title: string) {
    const created = await createPlannerItemAction({ date: selectedDate, title, parentId }).catch(() => null);
    if (!created) return;
    patchDate(selectedDate, (items) =>
      items.map((it) => (it.id === parentId ? { ...it, children: [...(it.children ?? []), created] } : it)),
    );
  }

  async function handleToggleDone(item: ApiPlannerItem, parentId?: string) {
    const done = !item.done;
    patchDate(selectedDate, (items) =>
      parentId
        ? items.map((p) =>
            p.id === parentId ? { ...p, children: (p.children ?? []).map((c) => (c.id === item.id ? { ...c, done } : c)) } : p,
          )
        : items.map((i) => (i.id === item.id ? { ...i, done } : i)),
    );
    await updatePlannerItemAction(item.id, { done }).catch(() => {});
  }

  async function handleDelete(item: ApiPlannerItem, parentId?: string) {
    patchDate(selectedDate, (items) =>
      parentId
        ? items.map((p) => (p.id === parentId ? { ...p, children: (p.children ?? []).filter((c) => c.id !== item.id) } : p))
        : items.filter((i) => i.id !== item.id),
    );
    await deletePlannerItemAction(item.id).catch(() => {});
  }

  const rangeLabel =
    viewMode === "week"
      ? `${startOfWeek(anchor)} → ${addDays(startOfWeek(anchor), 6)}`
      : `${MONTH_LABELS[new Date(anchor).getMonth()]} ${new Date(anchor).getFullYear()}`;

  return (
    <div className="flex flex-col gap-3">
      <TrackingPageHeader
        title="Planner"
        description="Lên kế hoạch việc cần làm theo tuần hoặc tháng. Bấm vào 1 ngày bên trái để xem/soạn checklist chi tiết bên phải - mỗi việc có thể set giờ cụ thể, và chọn giữa 'Đơn' (1 dòng việc) hoặc 'Lớn' (có các đầu việc con bên trong)."
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => changeAnchor(-1)}
            className="cursor-pointer rounded-md border border-border p-1.5 hover:bg-hover-bg"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium text-ink">{rangeLabel}</span>
          <button
            type="button"
            onClick={() => changeAnchor(1)}
            className="cursor-pointer rounded-md border border-border p-1.5 hover:bg-hover-bg"
          >
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="flex gap-0.5 rounded-md bg-surface-muted p-0.5">
          {(["week", "month"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => switchMode(mode)}
              className={cn(
                "cursor-pointer rounded px-3 py-1.5 text-xs font-medium transition-colors duration-150 ease-out",
                viewMode === mode ? "bg-surface text-ink shadow-sm" : "text-ink-faint hover:text-ink-muted",
              )}
            >
              {mode === "week" ? "Tuần" : "Tháng"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_380px]">
        {viewMode === "week" ? (
          <div className={cn("overflow-hidden rounded-xl border border-border bg-surface", isLoading && "opacity-60")}>
            <WeekTimeGrid anchor={anchor} selectedDate={selectedDate} itemsByDate={itemsByDate} onSelect={setSelectedDate} />
          </div>
        ) : (
          <div className={cn("rounded-xl border border-border bg-surface p-3", isLoading && "opacity-60")}>
            <MonthGrid anchor={anchor} selectedDate={selectedDate} itemsByDate={itemsByDate} onSelect={setSelectedDate} />
          </div>
        )}

        <DayDetailPanel
          date={selectedDate}
          items={itemsByDate[selectedDate] ?? []}
          onAddItem={handleAddItem}
          onAddChild={handleAddChild}
          onToggleDone={handleToggleDone}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}

function DaySummary({ items }: { items: ApiPlannerItem[] }) {
  if (items.length === 0) return null;
  const done = items.filter((i) => i.done).length;
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-surface-muted px-1.5 py-0.5 text-[10px] font-medium text-ink-faint">
      {done}/{items.length}
    </span>
  );
}

// [2026-10-02] So viec toi da hien TRUC TIEP trong 1 o lich (tuan/thang) -
// yeu cau nguoi dung: "Có việc cần làm đơn hay lớn trong ngày show ra luôn
// trên lịch. Tối đa 5 cái, từ cái thứ 6 hiện dấu ....". Qua con so nay se
// lam o lich cao qua muc/vo bo cuc thang - "..." (1 dong rieng, KHONG phai
// "+N") la dau hieu CON NUA, dung y chu "dấu ...." nguoi dung ta.
const MAX_PREVIEW_ITEMS = 5;

// Danh sach viec RUT GON hien NGAY trong o ngay - ap dung CHUNG cho ca
// WeekGrid/MonthGrid (truoc day o lich CHI co so/tong, phai bam vao moi thay
// ten viec o panel ben phai). `truncate` (khong phai line-clamp nhieu dong)
// cho TUNG dong viec - 1 viec dai qua se bi CAT GON thanh 1 dong + dau "..."
// cuoi dong thay vi troi xuong dong 2 lam lech chieu cao cac o ke nhau trong
// cung 1 hang luoi (yeu cau nguoi dung: "Để ý về lineclamp, break line").
// `min-w-0` tren CA wrapper LAN tung dong - truncate chi hoat dong khi phan
// tu bi GIOI HAN chieu rong THAT, mac dinh 1 flex item (ca flex-col) co
// min-width "auto" chong lai viec co lai, can override ve 0 de overflow-
// hidden/ellipsis phat huy dung (loi pho bien khi dung truncate trong flex).
function DayItemsPreview({ items }: { items: ApiPlannerItem[] }) {
  if (items.length === 0) return null;
  const sorted = [...items].sort((a, b) => a.orderIndex - b.orderIndex);
  const visible = sorted.slice(0, MAX_PREVIEW_ITEMS);
  const hasMore = sorted.length > MAX_PREVIEW_ITEMS;
  return (
    <div className="mt-0.5 flex min-w-0 flex-1 flex-col gap-px overflow-hidden">
      {visible.map((item) => (
        <div key={item.id} className="flex min-w-0 items-center gap-1">
          <span
            style={item.color && !item.done ? { backgroundColor: item.color } : undefined}
            className={cn(
              "size-1 shrink-0 rounded-full",
              !item.color &&
                (item.done ? "bg-ink-faint/50" : item.kind === "BIG" ? "bg-primary/70" : "bg-ink-faint"),
              item.color && item.done && "bg-ink-faint/50",
            )}
            aria-hidden="true"
          />
          <span
            title={item.title}
            className={cn(
              "min-w-0 flex-1 truncate text-[10.5px] leading-[1.4]",
              item.done ? "text-ink-faint line-through" : "text-ink-muted",
            )}
          >
            {item.title}
          </span>
        </div>
      ))}
      {hasMore && <span className="pl-2.5 text-[10.5px] leading-none text-ink-faint">····</span>}
    </div>
  );
}

// Danh sach viec KHONG dat gio ("ca ngay") hien 1 hang rieng NGAY TREN luoi
// gio (giong Google Calendar) - KHONG the dinh vi chung theo truc Y vi khong
// co scheduledMinute de tinh "top".
function AllDayItemChip({ item }: { item: ApiPlannerItem }) {
  return (
    <span
      title={item.title}
      style={{
        borderTopColor: item.color ?? "var(--border-strong)",
        backgroundColor: item.color ? `${item.color}1A` : undefined,
      }}
      className={cn(
        "block w-full truncate rounded-md border border-border border-t-2 bg-surface-muted px-1.5 py-0.5 text-[11px] leading-[1.3]",
        item.done ? "text-ink-faint line-through" : "text-ink-muted",
      )}
    >
      {item.title}
    </span>
  );
}

// The "su kien" dinh vi theo gio NGAY TREN luoi - yeu cau nguoi dung: "Các
// thẻ checklist trong ngày trong calendar thì thiết kế bo viền nhẹ, cho nhìn
// thấy màu border top". `style` (khong phai className) cho mau - mau la HEX
// DONG do nguoi dung tu chon (PLANNER_COLORS), Tailwind utility class KHONG
// the bieu dien gia tri dong luc runtime, chi co inline style lam duoc.
// `1A` noi vao cuoi hex = ~10% alpha (dang hex 2 ky tu, 0x1A/0xFF ~ 10%) -
// nen mau RAT NHAT lam vien/chu van la mau chinh, giu dung tinh than "bo vien
// nhẹ" (khong phai 1 khoi mau dac).
function TimedItemChip({
  item,
  top,
}: {
  item: ApiPlannerItem;
  top: number;
}) {
  return (
    <div
      title={`${minutesToLabel(item.scheduledMinute ?? 0)} · ${item.title}`}
      style={{
        top,
        borderTopColor: item.color ?? "var(--border-strong)",
        backgroundColor: item.color ? `${item.color}1A` : "var(--surface-muted)",
      }}
      className={cn(
        "absolute right-1 left-1 flex h-6 items-center truncate rounded-md border border-border/70 border-t-2 px-1.5 text-[11px] leading-none",
        item.done ? "text-ink-faint line-through" : "text-ink-muted",
      )}
    >
      <span className="truncate">{item.title}</span>
    </div>
  );
}

// [2026-10-02] Luoi gio kieu Google Calendar - thay cho WeekGrid dang card
// liet ke truoc day, CHI ap dung view Tuan (yeu cau nguoi dung: "Trục Y thì
// là các khung giờ trong ngày", xac nhan CHI view Tuan khi duoc hoi vi o
// Thang qua nho de ve luoi gio hop ly). Head gom 2 phan (yeu cau nguoi dung:
// "bổ sung head trục X và Y gồm: các ngày trong tuần theo tiếng anh, xuống
// dòng là Tháng, Năm"): 1 dong rieng "Tháng X, Năm" phia tren, roi moi den
// hang 7 cot thu (tieng Anh) + so ngay - truc Y la cot nhan gio (00:00-23:00)
// ben trai luoi.
function WeekTimeGrid({
  anchor,
  selectedDate,
  itemsByDate,
  onSelect,
}: {
  anchor: string;
  selectedDate: string;
  itemsByDate: ItemsByDate;
  onSelect: (date: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const days = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(anchor), i));
  const today = toISODate(new Date());
  const weekStart = new Date(startOfWeek(anchor));
  const monthYearLabel = `${MONTH_LABELS[weekStart.getMonth()]}, ${weekStart.getFullYear()}`;

  // Cuon san toi ~7h sang luc mo/doi tuan - tranh nguoi dung luon phai tu keo
  // tu 00:00 (gio it ai len lich) moi thay noi dung ban ngay.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 7 * HOUR_ROW_HEIGHT - 24 });
  }, [anchor]);

  return (
    <div className="flex flex-col">
      <div className="shrink-0 border-b border-border">
        <p className="px-3 pt-2.5 pb-1 text-[13px] font-semibold text-ink">{monthYearLabel}</p>
        <div className="grid grid-cols-[48px_repeat(7,1fr)]">
          <div />
          {days.map((d, i) => (
            <button
              key={d}
              type="button"
              onClick={() => onSelect(d)}
              className={cn(
                "flex cursor-pointer flex-col items-center gap-0.5 border-l border-border py-1.5 transition-colors duration-150 ease-out hover:bg-hover-bg",
                d === selectedDate && "bg-primary/5",
              )}
            >
              <span className="text-[10.5px] font-medium tracking-wide text-ink-faint uppercase">
                {WEEKDAY_LABELS_EN[i]}
              </span>
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full text-[13px] font-semibold",
                  d === today ? "bg-primary text-surface" : d === selectedDate ? "text-primary" : "text-ink",
                )}
              >
                {Number(d.slice(8, 10))}
              </span>
            </button>
          ))}
        </div>
        {/* Hang "ca ngay" - viec KHONG dat gio, xem AllDayItemChip. */}
        <div className="grid grid-cols-[48px_repeat(7,1fr)] border-t border-border">
          <div className="py-1 text-center text-[9px] text-ink-faint">Cả ngày</div>
          {days.map((d) => {
            const allDay = (itemsByDate[d] ?? []).filter((it) => it.scheduledMinute === null);
            return (
              <div key={d} className="flex min-h-7 flex-col gap-0.5 border-l border-border px-1 py-1">
                {allDay.map((item) => (
                  <AllDayItemChip key={item.id} item={item} />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Than luoi gio - cuon rieng (max-h co dinh), truc Y la cot nhan gio. */}
      <div ref={scrollRef} className="max-h-130 overflow-y-auto">
        <div className="grid grid-cols-[48px_repeat(7,1fr)]">
          <div className="flex flex-col">
            {HOURS.map((h) => (
              <div key={h} style={{ height: HOUR_ROW_HEIGHT }} className="relative border-t border-border">
                {h > 0 && (
                  <span className="absolute -top-2 right-1.5 text-[10px] text-ink-faint">
                    {h.toString().padStart(2, "0")}:00
                  </span>
                )}
              </div>
            ))}
          </div>
          {days.map((d) => {
            const timed = (itemsByDate[d] ?? []).filter(
              (it): it is ApiPlannerItem & { scheduledMinute: number } => it.scheduledMinute !== null,
            );
            return (
              <div
                key={d}
                className={cn("relative border-l border-border", d === selectedDate && "bg-primary/5")}
                style={{ height: HOUR_ROW_HEIGHT * 24 }}
              >
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className="cursor-pointer border-t border-border hover:bg-hover-bg"
                    style={{ height: HOUR_ROW_HEIGHT }}
                    onClick={() => onSelect(d)}
                  />
                ))}
                {timed.map((item) => (
                  <TimedItemChip key={item.id} item={item} top={(item.scheduledMinute / 60) * HOUR_ROW_HEIGHT} />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MonthGrid({
  anchor,
  selectedDate,
  itemsByDate,
  onSelect,
}: {
  anchor: string;
  selectedDate: string;
  itemsByDate: ItemsByDate;
  onSelect: (date: string) => void;
}) {
  const monthStart = startOfMonth(anchor);
  const monthEnd = endOfMonth(anchor);
  const leadingBlank = (new Date(monthStart).getDay() + 6) % 7; // 0 = Thu hai
  const totalDaysInMonth = Number(monthEnd.slice(8, 10));
  const today = toISODate(new Date());
  const cells: (string | null)[] = [
    ...Array.from({ length: leadingBlank }, () => null),
    ...Array.from({ length: totalDaysInMonth }, (_, i) => addDays(monthStart, i)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="grid grid-cols-7 gap-1.5">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="py-1 text-center text-[11px] font-medium text-ink-faint">
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((d, i) =>
          d === null ? (
            <div key={`blank-${i}`} />
          ) : (
            <button
              key={d}
              type="button"
              onClick={() => onSelect(d)}
              // min-h-32 (truoc day min-h-16=64px, qua chat de hien them
              // danh sach viec) - yeu cau nguoi dung: "Cho các ô trong lịch
              // to ra". items-stretch + text-left (khong con items-center) -
              // can trai danh sach viec nhu 1 checklist thu nho trong o.
              className={cn(
                "flex min-h-32 cursor-pointer flex-col items-stretch gap-0.5 rounded-lg border p-2 text-left transition-colors duration-150 ease-out",
                d === selectedDate ? "border-primary bg-primary/5" : "border-border hover:bg-hover-bg",
              )}
            >
              <div className="flex items-center justify-between gap-1">
                <span className={cn("text-[13px] font-semibold", d === today ? "text-primary" : "text-ink")}>
                  {Number(d.slice(8, 10))}
                </span>
                <DaySummary items={itemsByDate[d] ?? []} />
              </div>
              <DayItemsPreview items={itemsByDate[d] ?? []} />
            </button>
          ),
        )}
      </div>
    </div>
  );
}

function ItemRow({
  item,
  parentId,
  onToggleDone,
  onDelete,
}: {
  item: ApiPlannerItem;
  parentId?: string;
  onToggleDone: (item: ApiPlannerItem, parentId?: string) => void;
  onDelete: (item: ApiPlannerItem, parentId?: string) => void;
}) {
  return (
    // [2026-10-02] The checklist bo vien nhe + border-top mau - yeu cau
    // nguoi dung: "thiết kế bo viền nhẹ, cho nhìn thấy màu border top".
    // border-border/70 (nhe hon border-border mac dinh) cho 3 canh con lai,
    // rieng border-t-2 LAY mau TU item.color (qua style, khong phai
    // className - xem comment chi tiet trong TimedItemChip o tren) - khong
    // co mau (item.color null) thi fallback ve --border-strong, van CO phan
    // biet voi border nhe 3 canh con lai (toi hon 1 chut) thay vi hoan toan
    // phang.
    <div
      style={{ borderTopColor: item.color ?? "var(--border-strong)" }}
      className="flex items-center gap-2 rounded-md border border-border/70 border-t-2 bg-surface px-2 py-1.5"
    >
      <input
        type="checkbox"
        checked={item.done}
        onChange={() => onToggleDone(item, parentId)}
        className="size-3.5 shrink-0 cursor-pointer accent-primary"
      />
      {item.scheduledMinute !== null && (
        <span className="flex shrink-0 items-center gap-0.5 text-[11px] text-ink-faint">
          <Clock size={10} /> {minutesToLabel(item.scheduledMinute)}
        </span>
      )}
      <span className={cn("flex-1 truncate text-[13px]", item.done ? "text-ink-faint line-through" : "text-ink")}>
        {item.title}
      </span>
      <button
        type="button"
        onClick={() => onDelete(item, parentId)}
        className="shrink-0 cursor-pointer rounded-md p-1 text-ink-faint hover:bg-hover-bg hover:text-danger"
        aria-label="Xoá"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

function BigItemRow({
  item,
  onToggleDone,
  onDelete,
  onAddChild,
}: {
  item: ApiPlannerItem;
  onToggleDone: (item: ApiPlannerItem, parentId?: string) => void;
  onDelete: (item: ApiPlannerItem, parentId?: string) => void;
  onAddChild: (parentId: string, title: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [childDraft, setChildDraft] = useState("");
  const children = item.children ?? [];

  function submitChild() {
    const title = childDraft.trim();
    if (!title) return;
    setChildDraft("");
    onAddChild(item.id, title);
  }

  return (
    <div
      style={{ borderTopColor: item.color ?? "var(--border-strong)" }}
      className="rounded-lg border border-border/70 border-t-2 bg-surface-muted/40 p-2"
    >
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex size-5 shrink-0 cursor-pointer items-center justify-center rounded text-ink-faint hover:bg-hover-bg"
        >
          <ChevronDown size={14} className={cn("transition-transform duration-150", !expanded && "-rotate-90")} />
        </button>
        <input
          type="checkbox"
          checked={item.done}
          onChange={() => onToggleDone(item)}
          className="size-3.5 shrink-0 cursor-pointer accent-primary"
        />
        <span className={cn("flex-1 truncate text-[13px] font-semibold", item.done ? "text-ink-faint line-through" : "text-ink")}>
          {item.title}
        </span>
        {children.length > 0 && (
          <span className="shrink-0 text-[11px] text-ink-faint">
            {children.filter((c) => c.done).length}/{children.length}
          </span>
        )}
        <button
          type="button"
          onClick={() => onDelete(item)}
          className="shrink-0 cursor-pointer rounded-md p-1 text-ink-faint hover:bg-hover-bg hover:text-danger"
          aria-label="Xoá"
        >
          <Trash2 size={13} />
        </button>
      </div>
      {expanded && (
        <div className="mt-1 ml-6.5 flex flex-col gap-0.5 border-l border-border pl-2.5">
          {children.map((child) => (
            <ItemRow key={child.id} item={child} parentId={item.id} onToggleDone={onToggleDone} onDelete={onDelete} />
          ))}
          <div className="flex items-center gap-1.5 py-1">
            <Plus size={12} className="shrink-0 text-ink-faint" />
            <input
              value={childDraft}
              onChange={(e) => setChildDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitChild();
              }}
              placeholder="Thêm đầu việc con..."
              className="h-6 min-w-0 flex-1 bg-transparent text-[12.5px] text-ink outline-none placeholder:text-ink-faint"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function DayDetailPanel({
  date,
  items,
  onAddItem,
  onAddChild,
  onToggleDone,
  onDelete,
}: {
  date: string;
  items: ApiPlannerItem[];
  onAddItem: (title: string, kind: PlannerItemKind, scheduledMinute?: number, color?: string) => void;
  onAddChild: (parentId: string, title: string) => void;
  onToggleDone: (item: ApiPlannerItem, parentId?: string) => void;
  onDelete: (item: ApiPlannerItem, parentId?: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const [draftKind, setDraftKind] = useState<PlannerItemKind>("SIMPLE");
  const [draftTime, setDraftTime] = useState("");
  const [draftColor, setDraftColor] = useState<string | null>(null);

  function submit() {
    const title = draft.trim();
    if (!title) return;
    onAddItem(title, draftKind, draftTime ? timeInputToMinutes(draftTime) : undefined, draftColor ?? undefined);
    setDraft("");
    setDraftTime("");
  }

  const sorted = [...items].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-3.5">
      <p className="text-sm font-semibold text-ink">{date}</p>

      <div className="flex flex-col gap-1.5">
        {sorted.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-6 text-center text-[12.5px] text-ink-faint">
            Chưa có việc nào cho ngày này.
          </p>
        ) : (
          sorted.map((item) =>
            item.kind === "BIG" ? (
              <BigItemRow key={item.id} item={item} onToggleDone={onToggleDone} onDelete={onDelete} onAddChild={onAddChild} />
            ) : (
              <ItemRow key={item.id} item={item} onToggleDone={onToggleDone} onDelete={onDelete} />
            ),
          )
        )}
      </div>

      <div className="flex flex-col gap-1.5 border-t border-border pt-3">
        <div className="flex items-center gap-1.5">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            placeholder="Thêm việc cần làm..."
            className="h-9 min-w-0 flex-1 rounded-lg border border-border bg-background px-2.5 text-sm text-ink outline-none focus:border-primary/50"
          />
          <input
            type="time"
            value={draftTime}
            onChange={(e) => setDraftTime(e.target.value)}
            title="Đặt giờ (không bắt buộc)"
            className="h-9 w-24 shrink-0 rounded-lg border border-border bg-background px-1.5 text-xs text-ink outline-none focus:border-primary/50"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {/* Chon mau - yeu cau nguoi dung: "khi tạo checklist cũng được
              chọn loại màu cho nó". Nut tron rong/dac theo mau, vien dup
              (ring-2 ring-ink) danh dau mau DANG chon, giu lai qua cac lan
              Them lien tiep (khong reset ve null sau submit) - cung tinh
              than voi draftKind o duoi, tien cho nguoi dung them nhieu viec
              CUNG 1 chu de/mau lien tiep khong phai chon lai moi lan. */}
          {PLANNER_COLORS.map((c) => (
            <button
              key={c.label}
              type="button"
              title={c.label}
              onClick={() => setDraftColor(c.value)}
              className={cn(
                "flex size-5.5 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full ring-1 ring-border ring-offset-1 ring-offset-surface transition-shadow duration-100 ease-out",
                draftColor === c.value && "ring-2 ring-ink",
              )}
              style={{ backgroundColor: c.value ?? "transparent" }}
            >
              {c.value === null && (
                <span
                  className="pointer-events-none block size-full"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(45deg, var(--border) 0, var(--border) 1px, transparent 1px, transparent 4px)",
                  }}
                />
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-0.5 rounded-md bg-surface-muted p-0.5">
            {(["SIMPLE", "BIG"] as PlannerItemKind[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setDraftKind(k)}
                className={cn(
                  "cursor-pointer rounded px-2.5 py-1 text-[11.5px] font-medium transition-colors duration-150 ease-out",
                  draftKind === k ? "bg-surface text-ink shadow-sm" : "text-ink-faint hover:text-ink-muted",
                )}
              >
                {k === "SIMPLE" ? "Đơn" : "Lớn (có đầu việc con)"}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={submit}
            disabled={!draft.trim()}
            className="h-8 cursor-pointer rounded-lg bg-primary px-3 text-xs font-semibold text-surface transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Thêm
          </button>
        </div>
      </div>
    </div>
  );
}
