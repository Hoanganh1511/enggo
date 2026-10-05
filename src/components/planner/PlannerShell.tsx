"use client";

import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  CalendarCheck2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
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
const WEEKDAY_LONG_VI = [
  "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật",
];
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
// gio hop ly, theo dung xac nhan cua nguoi dung). [2026-10-05] 64px/gio (tang
// tu 56px) - yeu cau nguoi dung: "Nên tăng khoảng cách giữa các mốc... Hour
// height khoảng 64px". 24 gio x 64px = 1536px, cuon rieng trong 1 khung cao
// co dinh thay vi day dai ca trang.
const HOUR_ROW_HEIGHT = 64;
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
// "Thứ Hai, 5 tháng 10, 2026" - yeu cau nguoi dung (sidebar date): "2026-10-05
// / Thứ Hai, 5 tháng 10, 2026" (dong phu, sau dong ISO date chinh).
function formatLongDateVi(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDay(); // 0 = Chu nhat
  const weekdayIdx = day === 0 ? 6 : day - 1;
  return `${WEEKDAY_LONG_VI[weekdayIdx]}, ${d.getDate()} tháng ${d.getMonth() + 1}, ${d.getFullYear()}`;
}

// Planner - trang /planner RIENG, HOAN TOAN MOI (yeu cau nguoi dung: "Triển
// khai 1 button trên header để dẫn tới trang... Planner" kem mo ta chi tiet:
// filter tuan/thang, chia 2 nua (trai: tuan/thang, phai: chi tiet 1 ngay),
// checklist co gio + 2 "thể loại" đơn/lớn co dau viec con). KHONG dung chung
// gi voi /tracking (dang khoa, xem tracking/layout.tsx) - tu PlannerItem
// rieng (backend) den component nay.
//
// [2026-10-05] UI/UX "premium workspace" - yeu cau nguoi dung dua ra 1 spec
// day du (nen/padding/typography/mau/radius/shadow/spacing rieng cho trang
// nay). Toan bo mau/token moi nam trong class "planner-scope" (xem
// globals.css, cung tinh than voi .dashboard-scope/.series-scope da co) -
// KHONG tai dung --ink/--border/--surface goc cua app (gia tri khac that su
// so voi spec, xem comment chi tiet trong globals.css).
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

  // Nut lich o View Switcher (section 5, "📅") - nhay thang ve HOM NAY, ca
  // anchor (tuan/thang dang xem) lan ngay dang chon.
  function goToToday() {
    const t = toISODate(new Date());
    setAnchor(t);
    setSelectedDate(t);
    void reload(rangeForMode(viewMode, t));
  }

  // "Sidebar Navigation" (section 18) - chuyen ngay TRUC TIEP tu sidebar,
  // khong can quay lai bam vao lich. Neu ngay moi ROI RA NGOAI pham vi
  // (from/to) dang tai cho anchor hien tai, doi anchor + tai lai DUNG
  // khoang do - dam bao itemsByDate luon co du lieu cho ngay vua chuyen toi.
  function changeSelectedDay(direction: -1 | 1) {
    const next = addDays(selectedDate, direction);
    setSelectedDate(next);
    const range = rangeForMode(viewMode, anchor);
    if (next < range.from || next > range.to) {
      setAnchor(next);
      void reload(rangeForMode(viewMode, next));
    }
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
    // planner-scope - nap bo CSS var rieng (xem globals.css). "-mx-4 sm:-mx-6
    // lg:-mx-10 -my-6" HUY padding cua FeedMainArea.tsx (to tien dung CHUNG
    // cho ca nhom (feed), khong rieng Planner) de tu ve lai DUNG padding/nen
    // theo spec (section 2/3) - cung ky thuat "-mr-10" /home da dung de huy
    // rieng 1 phia, o day huy CA 4 phia roi tu dinh nghia lai tu dau.
    // min-h-full de nen phu HET chieu cao vung cuon, khong de lo nen cu phia
    // duoi khi noi dung ngan hon 1 man hinh.
    <div
      className="planner-scope relative -mx-4 -my-6 min-h-full bg-[var(--planner-bg)] sm:-mx-6 lg:-mx-10"
      style={{
        backgroundImage:
          "radial-gradient(circle at top left, #eef4ff 0%, transparent 30%)",
      }}
    >
      <div className="mx-auto flex max-w-[1800px] flex-col gap-6 px-7 py-7 lg:px-11">
        {/* Header (section 4) - tach khoi TrackingPageHeader dung chung (title
            + nut "?" popover) vi spec yeu cau rieng 1 dong subtitle tinh than
            product, khong phai giai thich ky thuat dang popover. */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-[26px] font-bold tracking-[-0.5px] text-[color:var(--planner-text-primary)]">
              Planner
            </h1>
            <p className="text-[13px] text-[color:var(--planner-text-secondary)]">
              Plan your week, focus on what matters.
            </p>
          </div>

          {/* View Switcher (section 5) - Tuan | Thang | nut "Hom nay". */}
          <div className="flex items-center gap-0.5 rounded-xl border border-[color:var(--planner-border-soft)] bg-white/70 p-1">
            {(["week", "month"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => switchMode(mode)}
                className={cn(
                  "cursor-pointer rounded-lg px-3.5 py-1.5 text-[13px] font-medium transition-colors duration-150 ease-out",
                  viewMode === mode
                    ? "bg-white font-semibold text-[color:var(--planner-text-primary)] shadow-[0_2px_8px_rgba(20,30,50,0.06)]"
                    : "text-[color:var(--planner-text-muted)] hover:text-[color:var(--planner-text-secondary)]",
                )}
              >
                {mode === "week" ? "Tuần" : "Tháng"}
              </button>
            ))}
            <button
              type="button"
              onClick={goToToday}
              title="Về hôm nay"
              className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-[color:var(--planner-text-muted)] transition-colors duration-150 ease-out hover:bg-white hover:text-[color:var(--planner-primary)]"
            >
              <CalendarCheck2 size={15} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Date Navigation (section 6). */}
        <div className="-mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => changeAnchor(-1)}
            className="flex h-[38px] w-[42px] cursor-pointer items-center justify-center rounded-[10px] border border-[color:var(--planner-border)] bg-white transition-colors duration-150 ease-out hover:bg-[var(--planner-surface-soft)]"
          >
            <ChevronLeft size={16} className="text-[color:var(--planner-text-secondary)]" />
          </button>
          <div className="flex h-[38px] items-center gap-1.5 rounded-[10px] border border-[color:var(--planner-border)] bg-white px-3">
            <CalendarDays size={14} className="text-[color:var(--planner-text-muted)]" />
            <span className="text-[14px] font-semibold text-[color:var(--planner-text-primary)]">{rangeLabel}</span>
          </div>
          <button
            type="button"
            onClick={() => changeAnchor(1)}
            className="flex h-[38px] w-[42px] cursor-pointer items-center justify-center rounded-[10px] border border-[color:var(--planner-border)] bg-white transition-colors duration-150 ease-out hover:bg-[var(--planner-surface-soft)]"
          >
            <ChevronRight size={16} className="text-[color:var(--planner-text-secondary)]" />
          </button>
        </div>

        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1fr_380px]">
          {/* Calendar Main Card (section 7). */}
          {viewMode === "week" ? (
            <div
              className={cn(
                "overflow-hidden rounded-[14px] border border-[color:var(--planner-border)] bg-[var(--planner-surface)] shadow-[0_2px_8px_rgba(20,30,50,0.03)]",
                isLoading && "opacity-60",
              )}
            >
              <WeekTimeGrid anchor={anchor} selectedDate={selectedDate} itemsByDate={itemsByDate} onSelect={setSelectedDate} />
            </div>
          ) : (
            <div
              className={cn(
                "rounded-[14px] border border-[color:var(--planner-border)] bg-[var(--planner-surface)] p-3 shadow-[0_2px_8px_rgba(20,30,50,0.03)]",
                isLoading && "opacity-60",
              )}
            >
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
            onChangeDay={changeSelectedDay}
          />
        </div>
      </div>
    </div>
  );
}

function DaySummary({ items }: { items: ApiPlannerItem[] }) {
  if (items.length === 0) return null;
  const done = items.filter((i) => i.done).length;
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[color:var(--planner-border-soft)] px-1.5 py-0.5 text-[10px] font-medium text-[color:var(--planner-text-muted)]">
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
                (item.done
                  ? "bg-[color:var(--planner-text-muted)]/50"
                  : item.kind === "BIG"
                    ? "bg-[color:var(--planner-primary)]/70"
                    : "bg-[color:var(--planner-text-muted)]"),
              item.color && item.done && "bg-[color:var(--planner-text-muted)]/50",
            )}
            aria-hidden="true"
          />
          <span
            title={item.title}
            className={cn(
              "min-w-0 flex-1 truncate text-[10.5px] leading-[1.4]",
              item.done
                ? "text-[color:var(--planner-text-muted)] line-through"
                : "text-[color:var(--planner-text-secondary)]",
            )}
          >
            {item.title}
          </span>
        </div>
      ))}
      {hasMore && (
        <span className="pl-2.5 text-[10.5px] leading-none text-[color:var(--planner-text-muted)]">····</span>
      )}
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
        borderTopColor: item.color ?? "var(--planner-border)",
        backgroundColor: item.color ? `${item.color}1A` : undefined,
      }}
      className={cn(
        "block w-full truncate rounded-md border border-[color:var(--planner-border)] border-t-2 bg-[var(--planner-surface-soft)] px-1.5 py-0.5 text-[11px] leading-[1.3]",
        item.done
          ? "text-[color:var(--planner-text-muted)] line-through"
          : "text-[color:var(--planner-text-secondary)]",
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
        borderTopColor: item.color ?? "var(--planner-border)",
        backgroundColor: item.color ? `${item.color}1A` : "var(--planner-surface-soft)",
      }}
      className={cn(
        "absolute right-1 left-1 flex h-6 items-center truncate rounded-md border border-[color:var(--planner-border)] border-t-2 px-1.5 text-[11px] leading-none",
        item.done
          ? "text-[color:var(--planner-text-muted)] line-through"
          : "text-[color:var(--planner-text-secondary)]",
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
//
// [2026-10-05] Restyle toan bo theo spec (section 8-14): border nhat
// (--planner-border/--planner-border-soft), nhan gio can PHAI mau nhat
// (section 12), cot "Hom nay" to mau gradient rat nhe thay vi mot khoi mau
// (section 10), vien tron ngay "Hom nay" tinh gon hon kem do bong xanh nhe
// (section 9), hang "Cả ngày" nen hoi khac (section 14).
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
      <div className="shrink-0 border-b border-[color:var(--planner-border-soft)]">
        <p className="px-3 pt-2.5 pb-1 text-[14px] font-semibold text-[color:var(--planner-text-primary)]">
          {monthYearLabel}
        </p>
        <div className="grid grid-cols-[48px_repeat(7,1fr)]">
          <div />
          {days.map((d, i) => (
            <button
              key={d}
              type="button"
              onClick={() => onSelect(d)}
              className={cn(
                "flex cursor-pointer flex-col items-center gap-1 border-l border-[color:var(--planner-border-soft)] py-2 transition-colors duration-150 ease-out hover:bg-[var(--planner-surface-soft)]",
                d === selectedDate && "bg-[color:var(--planner-primary-soft)]",
              )}
            >
              <span className="text-[11px] font-semibold tracking-[.04em] text-[color:var(--planner-text-muted)] uppercase">
                {WEEKDAY_LABELS_EN[i]}
              </span>
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-full text-[14px] font-semibold",
                  d === today
                    ? "bg-[color:var(--planner-primary)] text-white shadow-[0_3px_8px_rgba(71,120,232,.18)]"
                    : d === selectedDate
                      ? "text-[color:var(--planner-primary)]"
                      : "text-[color:var(--planner-text-primary)]",
                )}
              >
                {Number(d.slice(8, 10))}
              </span>
            </button>
          ))}
        </div>
        {/* Hang "ca ngay" (section 14) - viec KHONG dat gio, xem AllDayItemChip. */}
        <div className="grid grid-cols-[48px_repeat(7,1fr)] border-t border-[color:var(--planner-border-soft)] bg-[#fafbfc]">
          <div className="py-1.5 text-center text-[10px] font-semibold text-[color:var(--planner-text-muted)]">
            Cả ngày
          </div>
          {days.map((d) => {
            const allDay = (itemsByDate[d] ?? []).filter((it) => it.scheduledMinute === null);
            return (
              <div
                key={d}
                className="flex min-h-7 flex-col gap-0.5 border-l border-[color:var(--planner-border-soft)] px-1 py-1"
              >
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
              <div
                key={h}
                style={{ height: HOUR_ROW_HEIGHT }}
                className="relative border-t border-[color:var(--planner-border-soft)]"
              >
                {h > 0 && (
                  <span className="absolute -top-2 right-1.5 text-[11px] font-medium text-[color:var(--planner-text-muted)]">
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
            const isToday = d === today;
            return (
              <div
                key={d}
                className="relative border-l border-[color:var(--planner-border-soft)]"
                style={
                  isToday
                    ? {
                        height: HOUR_ROW_HEIGHT * 24,
                        backgroundImage: "linear-gradient(180deg, #f7f9ff 0%, #fbfcff 100%)",
                      }
                    : { height: HOUR_ROW_HEIGHT * 24 }
                }
              >
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className="cursor-pointer border-t border-[color:var(--planner-border-soft)] hover:bg-[var(--planner-surface-soft)]"
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
          <div key={label} className="py-1 text-center text-[11px] font-medium text-[color:var(--planner-text-muted)]">
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
              // to ra". items-stretch + text-left - can trai danh sach viec
              // nhu 1 checklist thu nho trong o.
              className={cn(
                "flex min-h-32 cursor-pointer flex-col items-stretch gap-0.5 rounded-lg border p-2 text-left transition-colors duration-150 ease-out",
                d === selectedDate
                  ? "border-[color:var(--planner-primary)] bg-[color:var(--planner-primary-soft)]"
                  : "border-[color:var(--planner-border-soft)] hover:bg-[var(--planner-surface-soft)]",
              )}
            >
              <div className="flex items-center justify-between gap-1">
                <span
                  className={cn(
                    "text-[14px] font-semibold",
                    d === today ? "text-[color:var(--planner-primary)]" : "text-[color:var(--planner-text-primary)]",
                  )}
                >
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
    // border nhe cho 3 canh con lai, rieng border-t-2 LAY mau TU item.color
    // (qua style, khong phai className - xem comment chi tiet trong
    // TimedItemChip o tren) - khong co mau (item.color null) thi fallback ve
    // --planner-border, van CO phan biet voi border nhe 3 canh con lai.
    <div
      style={{ borderTopColor: item.color ?? "var(--planner-border)" }}
      className="flex items-center gap-2 rounded-md border border-[color:var(--planner-border-soft)] border-t-2 bg-white px-2 py-1.5"
    >
      <input
        type="checkbox"
        checked={item.done}
        onChange={() => onToggleDone(item, parentId)}
        className="size-3.5 shrink-0 cursor-pointer accent-[color:var(--planner-primary)]"
      />
      {item.scheduledMinute !== null && (
        <span className="flex shrink-0 items-center gap-0.5 text-[11px] text-[color:var(--planner-text-muted)]">
          <Clock size={10} /> {minutesToLabel(item.scheduledMinute)}
        </span>
      )}
      <span
        className={cn(
          "flex-1 truncate text-[13px]",
          item.done ? "text-[color:var(--planner-text-muted)] line-through" : "text-[color:var(--planner-text-primary)]",
        )}
      >
        {item.title}
      </span>
      <button
        type="button"
        onClick={() => onDelete(item, parentId)}
        className="shrink-0 cursor-pointer rounded-md p-1 text-[color:var(--planner-text-muted)] hover:bg-[var(--planner-surface-soft)] hover:text-danger"
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
      style={{ borderTopColor: item.color ?? "var(--planner-border)" }}
      className="rounded-lg border border-[color:var(--planner-border-soft)] border-t-2 bg-[var(--planner-surface-soft)] p-2"
    >
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex size-5 shrink-0 cursor-pointer items-center justify-center rounded text-[color:var(--planner-text-muted)] hover:bg-white"
        >
          <ChevronDown size={14} className={cn("transition-transform duration-150", !expanded && "-rotate-90")} />
        </button>
        <input
          type="checkbox"
          checked={item.done}
          onChange={() => onToggleDone(item)}
          className="size-3.5 shrink-0 cursor-pointer accent-[color:var(--planner-primary)]"
        />
        <span
          className={cn(
            "flex-1 truncate text-[13px] font-semibold",
            item.done ? "text-[color:var(--planner-text-muted)] line-through" : "text-[color:var(--planner-text-primary)]",
          )}
        >
          {item.title}
        </span>
        {children.length > 0 && (
          <span className="shrink-0 text-[11px] text-[color:var(--planner-text-muted)]">
            {children.filter((c) => c.done).length}/{children.length}
          </span>
        )}
        <button
          type="button"
          onClick={() => onDelete(item)}
          className="shrink-0 cursor-pointer rounded-md p-1 text-[color:var(--planner-text-muted)] hover:bg-white hover:text-danger"
          aria-label="Xoá"
        >
          <Trash2 size={13} />
        </button>
      </div>
      {expanded && (
        <div className="mt-1 ml-6.5 flex flex-col gap-0.5 border-l border-[color:var(--planner-border-soft)] pl-2.5">
          {children.map((child) => (
            <ItemRow key={child.id} item={child} parentId={item.id} onToggleDone={onToggleDone} onDelete={onDelete} />
          ))}
          <div className="flex items-center gap-1.5 py-1">
            <Plus size={12} className="shrink-0 text-[color:var(--planner-text-muted)]" />
            <input
              value={childDraft}
              onChange={(e) => setChildDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitChild();
              }}
              placeholder="Thêm đầu việc con..."
              className="h-6 min-w-0 flex-1 bg-transparent text-[12.5px] text-[color:var(--planner-text-primary)] outline-none placeholder:text-[color:var(--planner-text-muted)]"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Empty state illustration (section 19/20) - icon lich dat trong 1 vong tron
// mau xanh nhat (--planner-primary-soft) kem 2 cham "✦" trang tri nho o 2
// goc doi dien - KHONG dung illustration cartoon phuc tap, chi 1 icon + cham
// trang tri toi gian dung tinh than "professional minimalism" cua spec.
function EmptyIllustration() {
  return (
    <div className="relative flex size-14 shrink-0 items-center justify-center">
      <Sparkles
        size={11}
        className="absolute top-0.5 left-0.5 text-[color:var(--planner-primary)] opacity-40"
        aria-hidden="true"
      />
      <Sparkles
        size={9}
        className="absolute right-0 bottom-0.5 text-[color:var(--planner-primary)] opacity-30"
        aria-hidden="true"
      />
      <div className="flex size-12 items-center justify-center rounded-full bg-[color:var(--planner-primary-soft)]">
        <CalendarDays size={22} strokeWidth={1.75} className="text-[color:var(--planner-primary)] opacity-70" />
      </div>
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
  onChangeDay,
}: {
  date: string;
  items: ApiPlannerItem[];
  onAddItem: (title: string, kind: PlannerItemKind, scheduledMinute?: number, color?: string) => void;
  onAddChild: (parentId: string, title: string) => void;
  onToggleDone: (item: ApiPlannerItem, parentId?: string) => void;
  onDelete: (item: ApiPlannerItem, parentId?: string) => void;
  onChangeDay: (direction: -1 | 1) => void;
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
  const isEmpty = sorted.length === 0;

  return (
    // Sidebar Card (section 16) - "Daily command center" (section 15), khong
    // con la 1 form nhap task tran trui nhu truoc.
    <div className="flex flex-col gap-4 rounded-[14px] border border-[color:var(--planner-border)] bg-[var(--planner-surface)] p-4 shadow-[0_2px_10px_rgba(20,30,50,.03)]">
      {/* Sidebar Date + Navigation (section 17/18). */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <p className="text-[20px] font-bold tracking-[-0.3px] text-[color:var(--planner-text-primary)]">{date}</p>
          <p className="text-[12px] text-[color:var(--planner-text-muted)]">{formatLongDateVi(date)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => onChangeDay(-1)}
            title="Ngày trước"
            className="flex size-[30px] cursor-pointer items-center justify-center rounded-[8px] border border-[color:var(--planner-border)] text-[color:var(--planner-text-secondary)] hover:bg-[var(--planner-surface-soft)]"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={() => onChangeDay(1)}
            title="Ngày sau"
            className="flex size-[30px] cursor-pointer items-center justify-center rounded-[8px] border border-[color:var(--planner-border)] text-[color:var(--planner-text-secondary)] hover:bg-[var(--planner-surface-soft)]"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="border-t border-[color:var(--planner-border-soft)]" />

      {/* Empty State Illustration (section 19/20) - CHI hien khi ngay nay
          chua co viec nao, nhu 1 "hero" chao mung nam TREN form nhap. */}
      {isEmpty && (
        <div className="flex flex-col items-center gap-2.5 py-4 text-center">
          <EmptyIllustration />
          <div className="flex flex-col gap-0.5">
            <p className="text-[13px] font-semibold text-[color:var(--planner-text-secondary)]">Chưa có việc nào</p>
            <p className="text-[12px] text-[color:var(--planner-text-muted)]">
              Hãy thêm công việc để lên kế hoạch nhé!
            </p>
          </div>
        </div>
      )}

      <div className="border-t border-[color:var(--planner-border-soft)]" />

      {/* Task Input (section 21). */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-1.5">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            placeholder="Thêm việc cần làm..."
            className="h-10 min-w-0 flex-1 rounded-[10px] border border-[color:var(--planner-border-soft)] bg-[var(--planner-surface-soft)] px-3 text-[13.5px] text-[color:var(--planner-text-primary)] outline-none transition-colors duration-150 ease-out placeholder:text-[color:var(--planner-text-muted)] focus:border-[#b9c9ef] focus:bg-white focus:shadow-[0_0_0_3px_rgba(71,120,232,.08)]"
          />
          <input
            type="time"
            value={draftTime}
            onChange={(e) => setDraftTime(e.target.value)}
            title="Đặt giờ (không bắt buộc)"
            className="h-10 w-[84px] shrink-0 rounded-[10px] border border-[color:var(--planner-border-soft)] bg-[var(--planner-surface-soft)] px-2 text-xs text-[color:var(--planner-text-primary)] outline-none transition-colors duration-150 ease-out focus:border-[#b9c9ef] focus:bg-white focus:shadow-[0_0_0_3px_rgba(71,120,232,.08)]"
          />
        </div>

        {/* Color Picker (section 22) - vong tron chon mau, mau DANG chon co
            vien kep (trang + navy) thay vi chi doi mau vien thuong. */}
        <div className="flex items-center gap-1.5">
          {PLANNER_COLORS.map((c) => (
            <button
              key={c.label}
              type="button"
              title={c.label}
              onClick={() => setDraftColor(c.value)}
              style={
                draftColor === c.value
                  ? { boxShadow: "0 0 0 2px white, 0 0 0 3px var(--planner-text-primary)" }
                  : undefined
              }
              className={cn(
                "flex size-6 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full ring-1 ring-[color:var(--planner-border)] transition-shadow duration-100 ease-out",
                draftColor !== c.value && "ring-offset-1 ring-offset-white",
              )}
            >
              <span
                className="block size-full"
                style={{ backgroundColor: c.value ?? "transparent" }}
              >
                {c.value === null && (
                  <span
                    className="pointer-events-none block size-full"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(45deg, var(--planner-border) 0, var(--planner-border) 1px, transparent 1px, transparent 4px)",
                    }}
                  />
                )}
              </span>
            </button>
          ))}
        </div>

        {/* Task Type (section 23, segmented control) + Add Button (section 24). */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-0.5 rounded-[10px] bg-[#f5f6f8] p-0.5">
            {(["SIMPLE", "BIG"] as PlannerItemKind[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setDraftKind(k)}
                className={cn(
                  "cursor-pointer rounded-[8px] px-2.5 py-1.5 text-[11.5px] font-medium transition-colors duration-150 ease-out",
                  draftKind === k
                    ? "bg-white text-[color:var(--planner-text-primary)] shadow-[0_1px_4px_rgba(20,30,50,.08)]"
                    : "text-[color:var(--planner-text-muted)] hover:text-[color:var(--planner-text-secondary)]",
                )}
              >
                {k === "SIMPLE" ? "Đơn" : "Lớn / Subtasks"}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={submit}
            disabled={!draft.trim()}
            className="h-[38px] cursor-pointer rounded-[10px] bg-[color:var(--planner-primary)] px-[18px] text-[13px] font-semibold text-white shadow-[0_4px_10px_rgba(79,127,240,.18)] transition-colors duration-150 ease-out hover:bg-[#416fdd] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          >
            Thêm
          </button>
        </div>
      </div>

      <div className="border-t border-[color:var(--planner-border-soft)]" />

      {/* "Việc trong ngày" (section 25) - section header + counter, roi den
          DANH SACH THAT (hoac mini empty-card, section 26, khi rong). */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <p className="text-[14px] font-bold text-[color:var(--planner-text-primary)]">Việc trong ngày</p>
          <span className="rounded-full bg-[#f2f4f7] px-1.5 py-0.5 text-[11px] font-medium text-[color:var(--planner-text-secondary)]">
            {items.length}
          </span>
        </div>

        {isEmpty ? (
          <div className="flex flex-col items-center gap-1 rounded-[12px] border border-[#f0f2f5] bg-[#fcfdff] px-4 py-6 text-center">
            <p className="text-[12.5px] font-medium text-[color:var(--planner-text-secondary)]">Chưa có việc nào</p>
            <p className="text-[12px] text-[color:var(--planner-text-muted)]">Thêm công việc ở trên để bắt đầu</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {sorted.map((item) =>
              item.kind === "BIG" ? (
                <BigItemRow key={item.id} item={item} onToggleDone={onToggleDone} onDelete={onDelete} onAddChild={onAddChild} />
              ) : (
                <ItemRow key={item.id} item={item} onToggleDone={onToggleDone} onDelete={onDelete} />
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
}
