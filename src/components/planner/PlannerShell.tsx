"use client";

import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  CalendarCheck2,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock,
  Flame,
  ListFilter,
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
import { PopoverRoot, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { TimePickerField } from "./time-picker-field";

type ViewMode = "week" | "month";
type ItemsByDate = Record<string, ApiPlannerItem[]>;

// Van dung cho head MonthGrid (tieng Viet, giu nguyen - yeu cau nguoi dung
// CHI noi ve "trục X" cua lich co luoi gio, tuc WeekTimeGrid ben duoi).
const WEEKDAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
// [2026-10-02] Rieng head WeekTimeGrid - yeu cau nguoi dung: "các ngày trong
// tuần theo tiếng anh". Thu 2 (index 0, T2) la dau tuan theo startOfWeek() da
// dung xuyen suot file nay (ISO 8601, tuan bat dau Thu Hai).
const WEEKDAY_LABELS_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEKDAY_FULL_EN = [
  "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY",
];
const WEEKDAY_LONG_VI = [
  "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật",
];
const MONTH_LABELS = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];
const MONTH_LABELS_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// [2026-10-05] "Category" cho checklist - yeu cau nguoi dung (redesign Right
// Panel/Calendar Canvas): moi viec thuoc 1 chu de (Work/Learning/Health/
// Personal/Project...), mau pastel RIENG lam nen the + 1 mau "accent" dam
// hon lam vien trai/dot. Nguoi dung xac nhan: "Tái dùng color hiện có làm
// category" - TAI DUNG dung 6 gia tri hex cua PLANNER_COLORS (lan truoc,
// SelectionFloatingMenu.tsx) lam KHOA, KHONG them field category rieng/
// khong migration moi - chi gan them 1 nhan + 1 mau pastel cho MOI hex da
// co san. `accent` = chinh hex do (dung lam dot/vien trai/text nhan manh),
// `pastel` la ban rat nhat cua accent (nen the, xem Part II spec: "Pastel
// Background... phải muted, không neon").
type CategoryMeta = { label: string; accent: string; pastel: string };
const CATEGORY_BY_COLOR: Record<string, CategoryMeta> = {
  "#ef4444": { label: "Cá nhân", accent: "#ef4444", pastel: "#fdecef" },
  "#f97316": { label: "Nội dung", accent: "#f97316", pastel: "#fff1e6" },
  "#eab308": { label: "Học tập", accent: "#eab308", pastel: "#fff5d9" },
  "#22c55e": { label: "Sức khoẻ", accent: "#22c55e", pastel: "#eaf8f2" },
  "#3b82f6": { label: "Công việc", accent: "#3b82f6", pastel: "#eaf2ff" },
  "#a855f7": { label: "Dự án", accent: "#a855f7", pastel: "#f0eaff" },
};
const DEFAULT_CATEGORY: CategoryMeta = { label: "Khác", accent: "#98a2b3", pastel: "#f1f3f5" };
function getCategory(color: string | null): CategoryMeta {
  return (color && CATEGORY_BY_COLOR[color]) || DEFAULT_CATEGORY;
}
// Bang chon mau/category luc tao viec - tai dung CHINH CATEGORY_BY_COLOR lam
// nguon DUY NHAT (khong khai bao trung lap 1 danh sach rieng nhu truoc).
const PLANNER_COLORS: { label: string; value: string | null }[] = [
  { label: DEFAULT_CATEGORY.label, value: null },
  ...Object.entries(CATEGORY_BY_COLOR).map(([hex, meta]) => ({ label: meta.label, value: hex })),
];

// Bo loc "SCHEDULE" (yeu cau nguoi dung, section 15 "Filter"): theo trang
// thai (Tat ca/Chua xong/Hoan thanh) HOAC theo category - gop CHUNG 1 danh
// sach lua chon (dung tinh than ban mockup "All/Work/Learning/.../Completed/
// Incomplete" liet ke CUNG 1 cho).
type FilterValue = "ALL" | "DONE" | "TODO" | string;
const FILTER_OPTIONS: { value: FilterValue; label: string }[] = [
  { value: "ALL", label: "Tất cả" },
  { value: "TODO", label: "Chưa xong" },
  { value: "DONE", label: "Hoàn thành" },
  ...Object.entries(CATEGORY_BY_COLOR).map(([hex, meta]) => ({ value: hex, label: meta.label })),
];

// [2026-10-05] Thoi luong MAC DINH (phut) khi 1 viec co gio bat dau nhung
// CHUA tung dat durationMinutes (item cu truoc migration, hoac nguoi dung bo
// trong luc tao) - dung de VE UI (do dai khoi trong luoi gio, gio ket thuc
// trong timeline...), KHONG ghi nguoc lai DB (item.durationMinutes van la
// null, chi FE tu suy luan luc hien thi).
const DEFAULT_DURATION_MINUTES = 60;

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
  const h = Math.floor(m / 60) % 24;
  const mm = m % 60;
  return `${h.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}`;
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
// "Thứ Hai, 5 tháng 10, 2026" - dong phu (sau dong ISO/English o sidebar).
function formatLongDateVi(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDay(); // 0 = Chu nhat
  const weekdayIdx = day === 0 ? 6 : day - 1;
  return `${WEEKDAY_LONG_VI[weekdayIdx]}, ${d.getDate()} tháng ${d.getMonth() + 1}, ${d.getFullYear()}`;
}
// "October 5, 2026" - yeu cau nguoi dung (Day Header moi): "MONDAY / October
// 5, 2026 / Thứ Hai...".
function formatLongDateEn(dateStr: string): string {
  const d = new Date(dateStr);
  return `${MONTH_LABELS_EN[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}
function weekdayFullEn(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDay();
  return WEEKDAY_FULL_EN[day === 0 ? 6 : day - 1];
}
// Gio KET THUC suy ra tu scheduledMinute + durationMinutes (hoac mac dinh) -
// CHI co y nghia voi viec co dat gio (scheduledMinute != null).
function itemEndMinute(item: ApiPlannerItem): number {
  return (item.scheduledMinute ?? 0) + (item.durationMinutes ?? DEFAULT_DURATION_MINUTES);
}
function formatHoursMinutes(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

// Trang thai 1 viec TRONG NGAY (yeu cau nguoi dung: "Timeline có trạng thái...
// Completed/In progress/Upcoming"). "current" CHI co the xay ra khi dang xem
// DUNG ngay hom nay VA gio hien tai nam trong [start, end) cua viec - tinh
// LAI moi lan render (khong luu DB, khong can 1 field "status" rieng, luon
// phan anh dung thoi diem THAT).
type ItemStatus = "done" | "current" | "upcoming";
function computeItemStatus(item: ApiPlannerItem, isToday: boolean, nowMinute: number): ItemStatus {
  if (item.done) return "done";
  if (!isToday || item.scheduledMinute === null) return "upcoming";
  const end = itemEndMinute(item);
  if (nowMinute >= item.scheduledMinute && nowMinute < end) return "current";
  return "upcoming";
}

// Thuat toan XEP COT kinh dien cho cac su kien TRUNG GIO trong CUNG 1 ngay
// (yeu cau nguoi dung, section II.15 "Overlapping Events": "không ép chúng
// đè lên nhau... chia cột, giống logic của Google Calendar"). Gom cac viec
// co khoang thoi gian [start,end) GIAO NHAU thanh 1 "cum", trong 1 cum gan
// THAM LAM (greedy) moi viec vao cot DAU TIEN co cho trong (end cua cot do
// <= start cua viec) - khong co cot nao rang thi mo cot moi. Sap xep truoc
// theo start (roi end) de dam bao xu ly dung thu tu thoi gian.
function layoutTimedItems(
  items: (ApiPlannerItem & { scheduledMinute: number })[],
): { item: ApiPlannerItem & { scheduledMinute: number }; col: number; cols: number }[] {
  const entries = items
    .map((it) => ({ it, start: it.scheduledMinute, end: itemEndMinute(it) }))
    .sort((a, b) => a.start - b.start || a.end - b.end);

  const result: { item: ApiPlannerItem & { scheduledMinute: number }; col: number; cols: number }[] = [];
  let cluster: typeof entries = [];
  let clusterEnd = -1;

  function flushCluster() {
    if (cluster.length === 0) return;
    const colEnds: number[] = [];
    const assigned: { entry: (typeof entries)[number]; col: number }[] = [];
    for (const entry of cluster) {
      let placedCol = -1;
      for (let c = 0; c < colEnds.length; c++) {
        if (colEnds[c] <= entry.start) {
          colEnds[c] = entry.end;
          placedCol = c;
          break;
        }
      }
      if (placedCol === -1) {
        colEnds.push(entry.end);
        placedCol = colEnds.length - 1;
      }
      assigned.push({ entry, col: placedCol });
    }
    const totalCols = colEnds.length;
    for (const a of assigned) result.push({ item: a.entry.it, col: a.col, cols: totalCols });
    cluster = [];
  }

  for (const entry of entries) {
    if (cluster.length > 0 && entry.start >= clusterEnd) {
      flushCluster();
      clusterEnd = -1;
    }
    cluster.push(entry);
    clusterEnd = Math.max(clusterEnd, entry.end);
  }
  flushCluster();
  return result;
}

// Planner - trang /planner RIENG, HOAN TOAN MOI (yeu cau nguoi dung: "Triển
// khai 1 button trên header để dẫn tới trang... Planner" kem mo ta chi tiet:
// filter tuan/thang, chia 2 nua (trai: tuan/thang, phai: chi tiet 1 ngay),
// checklist co gio + 2 "thể loại" đơn/lớn co dau viec con). KHONG dung chung
// gi voi /tracking (dang khoa, xem tracking/layout.tsx) - tu PlannerItem
// rieng (backend) den component nay.
//
// [2026-10-05] UI/UX "premium workspace" (2 lan redesign lien tiep) - yeu
// cau nguoi dung dua ra 1 spec day du (nen/padding/typography/mau/radius/
// shadow/spacing rieng cho trang nay, roi tiep tuc redesign SAU rieng Right
// Panel + Calendar event card). Toan bo mau/token moi nam trong class
// "planner-scope" (xem globals.css, cung tinh than voi .dashboard-scope/
// .series-scope da co) - KHONG tai dung --ink/--border/--surface goc cua
// app (gia tri khac that su so voi spec, xem comment chi tiet trong globals.css).
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
  // Dong bo "chon 1 su kien" GIUA calendar canvas (click 1 the gio) VA Right
  // Panel (highlight dong tuong ung trong Schedule) - yeu cau nguoi dung,
  // section II.10 "Selected State": "Đồng thời: Right panel chuyển sang Task
  // Detail" (o day don gian hoa thanh HIGHLIGHT, khong tach 1 man hinh Task
  // Detail rieng - xem giai thich trong DayDetailPanel).
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

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

  // [2026-10-05] Dong bo selectedDate THEO cung do dich chuyen - bug phat
  // hien qua test luong tuong tac: truoc day bam prev/next O LICH chi doi
  // `anchor` (tuan/thang dang xem), `selectedDate` (ngay dang hien chi tiet
  // ben panel phai) dung im - bam vai lan next se khien lich hien 1 tuan
  // hoan toan khac trong khi panel VAN am tham hien ngay cu, khong con nam
  // trong tam nhin tren luoi nua. Nguoi dung bam "+ Thêm việc cho hôm nay"
  // luc do se vo tinh them vao 1 ngay KHONG con thay tren man hinh. Chieu
  // nguoc lai (changeSelectedDay, doi ngay tu panel) DA tu dong bo anchor
  // dung cach roi - sua cho doi xung ca 2 chieu.
  function changeAnchor(direction: -1 | 1) {
    const next = viewMode === "week" ? addDays(anchor, direction * 7) : addMonths(anchor, direction);
    const diffDays = Math.round((new Date(next).getTime() - new Date(anchor).getTime()) / 86400000);
    setAnchor(next);
    setSelectedDate((prev) => addDays(prev, diffDays));
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

  function selectDate(date: string) {
    setSelectedDate(date);
    setSelectedItemId(null);
  }

  // "Sidebar Navigation" (section 18) - chuyen ngay TRUC TIEP tu sidebar,
  // khong can quay lai bam vao lich. Neu ngay moi ROI RA NGOAI pham vi
  // (from/to) dang tai cho anchor hien tai, doi anchor + tai lai DUNG
  // khoang do - dam bao itemsByDate luon co du lieu cho ngay vua chuyen toi.
  function changeSelectedDay(direction: -1 | 1) {
    const next = addDays(selectedDate, direction);
    selectDate(next);
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
    durationMinutes?: number,
    isFocus?: boolean,
  ) {
    const created = await createPlannerItemAction({
      date: selectedDate,
      title,
      kind,
      scheduledMinute,
      color,
      durationMinutes,
      isFocus,
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
      {/* [2026-10-05] Bo max-w-[1800px] (truoc day gioi han giua trang,
          thua han 1 khoang xam lon 2 ben tren man hinh rong) - yeu cau
          nguoi dung: "Cảm thấy planner vẫn thừa quá nhiều diện tích, hãy mở
          rộng tối đa ra". Gio dung HET chieu rong thuc co (sau khi da huy
          padding cua FeedMainArea o -mx-4/6/10 tren), chi con px-7/lg:px-11
          lam "le trang" toi thieu. */}
      <div className="px-7 py-7 lg:px-11">
        {/* [2026-10-05] Nhom Header+ViewSwitcher+DateNav GOP vao 1 sidebar
            NHO ben trai (truoc day xep thanh 2 hang NGANG phia tren, chiem
            mat ~200px chieu cao TRUOC KHI toi noi dung that) - yeu cau nguoi
            dung: "Nguyên phần cụm trên chiếm quá nhiều diện tích. Tạo cái
            sidebar nhỏ cho mấy thông tin đó đi. Để đẩy mấy phần kia lên".
            3 cot tu lg tro len (sidebar nho | calendar | panel chi tiet
            ngay) - duoi lg xep chong doc (grid-cols-1) nhu cu.
            [2026-10-05] lg:h-[calc(100dvh-112px)] - yeu cau nguoi dung:
            "ưu tiên diện tích cho phần lịch, sao cho hiển thị được nhiều
            nhất". 112px = --header-height (56px, TopHeaderBar co dinh phia
            tren) + py-7 CUA CHINH div nay (28px x 2 = 56px) - phan con lai
            CHINH XAC la chieu cao vung xem thuc te con lai duoi header, cho
            CA 3 cot deu cao BANG NHAU va cao HET man hinh thay vi chi cao
            vua du noi dung (truoc day lich chi cao ~520px co dinh du man
            hinh con rat nhieu khoang trong ben duoi). CHI ap dung tu lg (3
            cot) tro len - duoi lg (xep chong doc) de moi khoi tu nhien theo
            chieu cao noi dung, ep h co dinh se rat xau khi xep doc. */}
        <div className="grid grid-cols-1 items-start gap-5 lg:h-[calc(100dvh-112px)] lg:grid-cols-[208px_1fr_380px] lg:items-stretch">
          <div className="flex h-fit flex-col gap-4 rounded-[14px] border border-[color:var(--planner-border)] bg-[var(--planner-surface)] p-4 shadow-[0_2px_10px_rgba(20,30,50,.03)] lg:sticky lg:top-7">
            <div className="flex flex-col gap-1">
              <h1 className="text-[20px] font-bold tracking-[-0.4px] text-[color:var(--planner-text-primary)]">
                Planner
              </h1>
              <p className="text-[12px] text-[color:var(--planner-text-secondary)]">
                Plan your week, focus on what matters.
              </p>
            </div>

            <div className="border-t border-[color:var(--planner-border-soft)]" />

            {/* View Switcher (section 5) - xep DOC (truoc day ngang) de vua
                be rong hep cua sidebar. */}
            <div className="flex flex-col gap-0.5 rounded-xl border border-[color:var(--planner-border-soft)] bg-white/70 p-1">
              {(["week", "month"] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => switchMode(mode)}
                  className={cn(
                    "cursor-pointer rounded-lg px-3 py-1.5 text-left text-[13px] font-medium transition-colors duration-150 ease-out",
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
                className={cn(
                  "flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-left text-[13px] font-medium text-[color:var(--planner-text-muted)] transition-colors duration-150 ease-out hover:bg-white hover:text-[color:var(--planner-primary)]",
                )}
              >
                <CalendarCheck2 size={14} strokeWidth={2} /> Hôm nay
              </button>
            </div>

            <div className="border-t border-[color:var(--planner-border-soft)]" />

            {/* Date Navigation (section 6) - xep DOC, nut prev/next canh
                nhau phia tren, nhan khoang ngay/thang phia duoi. */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => changeAnchor(-1)}
                  className="flex h-8 flex-1 cursor-pointer items-center justify-center rounded-[9px] border border-[color:var(--planner-border)] bg-white transition-colors duration-150 ease-out hover:bg-[var(--planner-surface-soft)]"
                >
                  <ChevronLeft size={15} className="text-[color:var(--planner-text-secondary)]" />
                </button>
                <button
                  type="button"
                  onClick={() => changeAnchor(1)}
                  className="flex h-8 flex-1 cursor-pointer items-center justify-center rounded-[9px] border border-[color:var(--planner-border)] bg-white transition-colors duration-150 ease-out hover:bg-[var(--planner-surface-soft)]"
                >
                  <ChevronRight size={15} className="text-[color:var(--planner-text-secondary)]" />
                </button>
              </div>
              <div className="flex items-center gap-1.5 rounded-[9px] border border-[color:var(--planner-border)] bg-white px-2 py-2">
                <CalendarDays size={13} className="shrink-0 text-[color:var(--planner-text-muted)]" />
                <span className="text-[12.5px] leading-[1.3] font-semibold text-[color:var(--planner-text-primary)]">
                  {rangeLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Calendar Main Card (section 7). h-full + overflow-hidden - cho
              phep card GIAN HET chieu cao hang luoi (lg:h-[calc(100dvh-112px)]
              o the cha), than luoi gio (WeekTimeGrid) tu cuon RIENG BEN
              TRONG (flex-1, xem ben duoi) thay vi ca card phinh to qua
              chieu cao cho phep. */}
          {viewMode === "week" ? (
            <div
              className={cn(
                "flex h-full flex-col overflow-hidden rounded-[14px] border border-[color:var(--planner-border)] bg-[var(--planner-surface)] shadow-[0_2px_8px_rgba(20,30,50,0.03)]",
                isLoading && "opacity-60",
              )}
            >
              <WeekTimeGrid
                anchor={anchor}
                selectedDate={selectedDate}
                itemsByDate={itemsByDate}
                selectedItemId={selectedItemId}
                onSelect={selectDate}
                onSelectItem={setSelectedItemId}
              />
            </div>
          ) : (
            <div
              className={cn(
                "h-full overflow-y-auto rounded-[14px] border border-[color:var(--planner-border)] bg-[var(--planner-surface)] p-3 shadow-[0_2px_8px_rgba(20,30,50,0.03)]",
                isLoading && "opacity-60",
              )}
            >
              <MonthGrid anchor={anchor} selectedDate={selectedDate} itemsByDate={itemsByDate} onSelect={selectDate} />
            </div>
          )}

          <DayDetailPanel
            date={selectedDate}
            items={itemsByDate[selectedDate] ?? []}
            selectedItemId={selectedItemId}
            onSelectItem={setSelectedItemId}
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

// Danh sach viec RUT GON hien NGAY trong o ngay (MonthGrid) - `truncate`
// (khong phai line-clamp nhieu dong) cho TUNG dong viec, `min-w-0` tren CA
// wrapper LAN tung dong de truncate phat huy dung trong flex.
function DayItemsPreview({ items }: { items: ApiPlannerItem[] }) {
  if (items.length === 0) return null;
  const sorted = [...items].sort((a, b) => a.orderIndex - b.orderIndex);
  const visible = sorted.slice(0, MAX_PREVIEW_ITEMS);
  const hasMore = sorted.length > MAX_PREVIEW_ITEMS;
  return (
    <div className="mt-0.5 flex min-w-0 flex-1 flex-col gap-px overflow-hidden">
      {visible.map((item) => {
        const cat = getCategory(item.color);
        return (
          <div key={item.id} className="flex min-w-0 items-center gap-1">
            <span
              style={{ backgroundColor: item.done ? undefined : cat.accent }}
              className={cn("size-1 shrink-0 rounded-full", item.done && "bg-[color:var(--planner-text-muted)]/50")}
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
        );
      })}
      {hasMore && (
        <span className="pl-2.5 text-[10.5px] leading-none text-[color:var(--planner-text-muted)]">····</span>
      )}
    </div>
  );
}

// Danh sach viec KHONG dat gio ("ca ngay") hien 1 hang rieng NGAY TREN luoi
// gio (giong Google Calendar). [2026-10-05] Restyle theo "Event Card" moi
// (Part II): nen pastel CUA CATEGORY + vien trai accent 3px, KHONG con border
// 4 canh + border-top nhu truoc.
function AllDayItemChip({ item }: { item: ApiPlannerItem }) {
  const cat = getCategory(item.color);
  return (
    <span
      title={item.title}
      style={{ backgroundColor: cat.pastel, borderLeftColor: cat.accent }}
      className={cn(
        "block w-full truncate rounded-[7px] border-l-[3px] px-1.5 py-0.5 text-[11px] leading-[1.3] font-medium",
        item.done ? "text-[color:var(--planner-text-muted)] line-through opacity-55" : "text-[color:var(--planner-text-primary)]",
      )}
    >
      {item.title}
    </span>
  );
}

// [2026-10-05] The "su kien" dinh vi theo gio tren luoi - VIET LAI HOAN TOAN
// theo "Overall Event Design Philosophy" (Part II.16): "Soft surface +
// semantic color + strong typography + minimal chrome" - KHONG con border
// 4 canh/border-top/shadow mac dinh nhu ban truoc, thay bang:
// - Nen PASTEL cua category (section II.2) + vien trai 3px mau accent
//   (section II.3) - "Soft Color Block" (section II.1).
// - Bo goc 7px (section II.4, "Không nên 14–16px... Calendar có rất nhiều
//   card... 7–8px phù hợp hơn").
// - Thu tu doc: GIO truoc (10px/500, mau accent) roi moi den TIEU DE (12px/
//   600) - section II.5/6, "Mắt sẽ scan thời gian trước → sau đó đọc task".
// - KHONG shadow mac dinh (section II.8) - CHI hover (subtle) / selected
//   (vien xanh). `hover:brightness-95` (CSS filter, hoat dong voi BAT KY mau
//   nen dong nao, khong can biet truoc gia tri hex) thay cho viec tinh mau
//   hover rieng.
// - Mat do noi dung THEO CHIEU CAO thuc te (section II.13 "Adaptive
//   content"): duoi 40px chi hien 1 dong gon "giờ + tiêu đề", tu 40px tro
//   len hien 2 dong rieng (gio/tieu de).
// - Hoan thanh (section II.11): KHONG xam toan bo, chi gach ngang + opacity
//   .55, nen pastel VAN GIU de con nhan ra chu de.
function TimedItemChip({
  item,
  top,
  height,
  left,
  width,
  selected,
  onSelect,
  isToday,
  nowMinute,
}: {
  item: ApiPlannerItem;
  top: number;
  height: number;
  left: string;
  width: string;
  selected: boolean;
  onSelect: () => void;
  isToday: boolean;
  nowMinute: number;
}) {
  const cat = getCategory(item.color);
  const status = computeItemStatus(item, isToday, nowMinute);
  const compact = height < 40;
  const timeLabel = `${minutesToLabel(item.scheduledMinute ?? 0)} — ${minutesToLabel(itemEndMinute(item))}`;

  return (
    <button
      type="button"
      onClick={onSelect}
      title={`${timeLabel} · ${item.title}`}
      style={{
        top,
        height: Math.max(height, 20),
        left,
        width,
        backgroundColor: cat.pastel,
        borderLeftColor: cat.accent,
        boxShadow: selected ? `0 0 0 2px white, 0 0 0 3px ${cat.accent}` : undefined,
      }}
      className={cn(
        "absolute z-[1] flex cursor-pointer flex-col justify-center overflow-hidden rounded-[7px] border-l-[3px] px-1.5 text-left transition-[filter,box-shadow] duration-150 ease-out hover:z-[2] hover:brightness-95 hover:shadow-[0_2px_6px_rgba(20,30,50,.08)]",
        item.done && "opacity-55",
      )}
    >
      {compact ? (
        <span className="flex items-center gap-1 truncate">
          {status === "current" && (
            <span className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: cat.accent }} aria-hidden="true" />
          )}
          <span className="shrink-0 text-[10px] font-medium" style={{ color: cat.accent }}>
            {minutesToLabel(item.scheduledMinute ?? 0)}
          </span>
          <span
            className={cn(
              "truncate text-[12px] font-semibold text-[color:var(--planner-text-primary)]",
              item.done && "line-through",
            )}
          >
            {item.title}
          </span>
        </span>
      ) : (
        <>
          <span className="flex items-center gap-1 text-[10px] font-medium" style={{ color: cat.accent }}>
            {status === "current" && (
              <span className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: cat.accent }} aria-hidden="true" />
            )}
            {timeLabel}
          </span>
          <span
            className={cn(
              "truncate text-[12px] font-semibold text-[color:var(--planner-text-primary)]",
              item.done && "line-through",
            )}
          >
            {item.title}
          </span>
        </>
      )}
    </button>
  );
}

// [2026-10-02] Luoi gio kieu Google Calendar - thay cho WeekGrid dang card
// liet ke truoc day, CHI ap dung view Tuan. Head gom 2 phan: 1 dong rieng
// "Tháng X, Năm" phia tren, roi moi den hang 7 cot thu (tieng Anh) + so ngay -
// truc Y la cot nhan gio (00:00-23:00) ben trai luoi.
//
// [2026-10-05] + Xep cot cho su kien trung gio (layoutTimedItems, section
// II.15) + dong bo selectedItemId voi Right Panel.
function WeekTimeGrid({
  anchor,
  selectedDate,
  itemsByDate,
  selectedItemId,
  onSelect,
  onSelectItem,
}: {
  anchor: string;
  selectedDate: string;
  itemsByDate: ItemsByDate;
  selectedItemId: string | null;
  onSelect: (date: string) => void;
  onSelectItem: (id: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const days = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(anchor), i));
  const today = toISODate(new Date());
  const weekStart = new Date(startOfWeek(anchor));
  const monthYearLabel = `${MONTH_LABELS[weekStart.getMonth()]}, ${weekStart.getFullYear()}`;
  const now = new Date();
  const nowMinute = now.getHours() * 60 + now.getMinutes();

  // Cuon san toi ~7h sang luc mo/doi tuan - tranh nguoi dung luon phai tu keo
  // tu 00:00 (gio it ai len lich) moi thay noi dung ban ngay.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 7 * HOUR_ROW_HEIGHT - 24 });
  }, [anchor]);

  return (
    <div className="flex h-full min-h-0 flex-col">
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

      {/* [2026-10-05] flex-1 min-h-0 (truoc day max-h-130 = 520px CO DINH,
          thua rat nhieu khoang trong duoi lich tren man hinh cao) - than
          luoi gio GIAN HET phan chieu cao CON LAI cua card (sau khi tru head
          + hang "Cả ngày" o tren), tu cuon RIENG BEN TRONG. min-h-0 BAT
          BUOC phai co - mac dinh 1 flex item co min-height:auto (= chieu cao
          NOI DUNG THAT, o day la 1536px cho 24 gio), chong lai viec co lai
          theo flex-1, se day card PHINH TO qua chieu cao cho phep thay vi
          chiu cat/cuon dung cho. */}
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
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
            const laidOut = layoutTimedItems(timed);
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
                {laidOut.map(({ item, col, cols }) => (
                  <TimedItemChip
                    key={item.id}
                    item={item}
                    top={(item.scheduledMinute / 60) * HOUR_ROW_HEIGHT}
                    height={((itemEndMinute(item) - item.scheduledMinute) / 60) * HOUR_ROW_HEIGHT}
                    left={`calc(${(100 / cols) * col}% + 2px)`}
                    width={`calc(${100 / cols}% - 4px)`}
                    selected={selectedItemId === item.id}
                    onSelect={() => {
                      onSelect(d);
                      onSelectItem(item.id);
                    }}
                    isToday={isToday}
                    nowMinute={nowMinute}
                  />
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

// Vong tron % hoan thanh (section 3 "Today's Progress") - 1 METER don gian
// (1 gia tri duy nhat, khong phai bieu do nhieu chuoi) nen CHI can 1 mau
// accent + 1 track nhat, khong can bang mau phan loai/legend (xem dataviz
// skill - "choosing a form": 1 headline % hop ly nhat la 1 stat-tile/meter).
function ProgressRing({ pct, size = 56, stroke = 5 }: { pct: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (Math.min(100, Math.max(0, pct)) / 100) * c;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--planner-border-soft)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--planner-primary)"
        strokeWidth={stroke}
        strokeDasharray={`${dash} ${c - dash}`}
        strokeLinecap="round"
      />
    </svg>
  );
}

// "Today's Progress" (section 3) - % hoan thanh (vong tron + thanh ngang) +
// so viec + thoi gian da len lich/da hoan thanh (dua tren durationMinutes).
function TodayProgress({ items }: { items: ApiPlannerItem[] }) {
  const total = items.length;
  const done = items.filter((i) => i.done).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const timedItems = items.filter((i) => i.scheduledMinute !== null);
  const plannedMinutes = timedItems.reduce((sum, i) => sum + (i.durationMinutes ?? DEFAULT_DURATION_MINUTES), 0);
  const doneMinutes = timedItems
    .filter((i) => i.done)
    .reduce((sum, i) => sum + (i.durationMinutes ?? DEFAULT_DURATION_MINUTES), 0);

  if (total === 0) return null;

  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-[11px] font-semibold tracking-[.04em] text-[color:var(--planner-text-muted)] uppercase">
        Today&apos;s progress
      </p>
      <div className="flex items-center gap-3.5">
        <div className="relative flex shrink-0 items-center justify-center">
          <ProgressRing pct={pct} />
          <span className="absolute text-[13px] font-bold text-[color:var(--planner-text-primary)]">{pct}%</span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <p className="text-[12.5px] font-medium text-[color:var(--planner-text-secondary)]">
            {done} / {total} tasks completed
          </p>
          {plannedMinutes > 0 && (
            <>
              <p className="text-[11px] text-[color:var(--planner-text-muted)]">
                {formatHoursMinutes(doneMinutes)} / {formatHoursMinutes(plannedMinutes)}
              </p>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[color:var(--planner-border-soft)]">
                <div
                  className="h-full rounded-full bg-[color:var(--planner-primary)] transition-[width] duration-300 ease-out"
                  style={{ width: `${plannedMinutes ? Math.min(100, (doneMinutes / plannedMinutes) * 100) : 0}%` }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// "Today's Focus" (section 4/5) - 1 viec DUY NHAT duoc nguoi dung tu danh
// dau isFocus=true (xem checkbox trong form them viec) duoc "elevate" len
// dau panel. CHI lay item DAU TIEN co co nay (khong rang buoc unique o DB,
// xem comment schema.prisma) - khong hien gi neu khong co item nao duoc
// danh dau (KHONG bia 1 "goi y" tu dong, dung y nguoi dung: "cách mình
// recommend cho MVP: User tự chọn ⭐ khi tạo task").
function TodayFocusCard({
  item,
  onContinue,
}: {
  item: ApiPlannerItem;
  onContinue: () => void;
}) {
  const cat = getCategory(item.color);
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[11px] font-semibold tracking-[.04em] text-[color:var(--planner-text-muted)] uppercase">
        Today&apos;s focus
      </p>
      <div
        style={{ backgroundColor: cat.pastel, borderColor: cat.accent + "40" }}
        className="flex flex-col gap-2 rounded-[12px] border p-3"
      >
        <div className="flex items-center justify-between gap-2">
          <span
            style={{ color: cat.accent }}
            className="rounded-full bg-white/70 px-2 py-0.5 text-[10.5px] font-semibold"
          >
            {cat.label}
          </span>
          <span className="flex items-center gap-1 text-[10.5px] font-semibold text-[#d97706]">
            <Flame size={11} strokeWidth={2.5} /> Trọng tâm
          </span>
        </div>
        <p
          className={cn(
            "text-[14px] font-semibold text-[color:var(--planner-text-primary)]",
            item.done && "line-through opacity-55",
          )}
        >
          {item.title}
        </p>
        {item.scheduledMinute !== null && (
          <p className="text-[12px] font-medium" style={{ color: cat.accent }}>
            {minutesToLabel(item.scheduledMinute)} — {minutesToLabel(itemEndMinute(item))}
          </p>
        )}
        <button
          type="button"
          onClick={onContinue}
          className="ml-auto cursor-pointer rounded-[8px] bg-white px-3 py-1.5 text-[12px] font-semibold text-[color:var(--planner-text-primary)] shadow-[0_1px_4px_rgba(20,30,50,.08)] transition-colors duration-150 ease-out hover:bg-white/80"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

// 1 dong trong "SCHEDULE" timeline (section 6/7/8) - thay cho ItemRow phang
// truoc day: co dot trang thai (done/current/upcoming) NOI VOI 1 duong doc
// (connector, ve boi CHINH container cha qua border-l, xem SCHEDULE below),
// gio BAT DAU-KET THUC, dot category, co the expand (viec "Lớn").
function TimelineRow({
  item,
  status,
  selected,
  onSelect,
  onToggleDone,
  onDelete,
}: {
  item: ApiPlannerItem;
  status: ItemStatus;
  selected: boolean;
  onSelect: () => void;
  onToggleDone: () => void;
  onDelete: () => void;
}) {
  const cat = getCategory(item.color);
  return (
    <div className="relative flex gap-2.5 pl-0.5">
      {/* Dot trang thai - noi voi duong connector cua ca danh sach (border-l
          cua UL cha). */}
      <div className="relative z-[1] mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-white">
        {status === "done" ? (
          <CheckCircle2 size={16} className="text-[color:var(--planner-primary)]" />
        ) : status === "current" ? (
          <span className="size-2.5 rounded-full" style={{ backgroundColor: cat.accent }} />
        ) : (
          <Circle size={14} className="text-[color:var(--planner-border)]" />
        )}
      </div>
      {/* [2026-10-05] div (khong phai button) - bug phat hien qua test luong
          tuong tac: dong nay chua CAC phan tu tuong tac khac BEN TRONG no
          (checkbox + nut Xoa), HTML khong cho phep <button> long trong
          <button> (React tu bao loi hydration "In HTML, <button> cannot be
          a descendant of <button>" trong console that su khi test bang
          trinh duyet). role="button" + tabIndex + onKeyDown giu lai hanh vi
          ban phim (Enter/Space) tuong duong nut that, cung mau voi cach
          BigTimelineItem ben duoi DA lam dung (dung <div onClick>, khong
          phai <button>). */}
      <div
        role="button"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect();
          }
        }}
        style={selected ? { boxShadow: `0 0 0 1.5px ${cat.accent}` } : undefined}
        className={cn(
          "flex min-w-0 flex-1 cursor-pointer items-start justify-between gap-2 rounded-[10px] px-2 py-1.5 text-left transition-colors duration-150 ease-out hover:bg-[var(--planner-surface-soft)]",
          status === "current" && "bg-[var(--planner-primary-soft)]",
        )}
      >
        <div className="flex min-w-0 flex-col gap-0.5">
          {item.scheduledMinute !== null && (
            <span className="text-[11px] font-medium" style={{ color: cat.accent }}>
              {minutesToLabel(item.scheduledMinute)} — {minutesToLabel(itemEndMinute(item))}
            </span>
          )}
          <span
            className={cn(
              "truncate text-[13px] font-medium",
              item.done
                ? "text-[color:var(--planner-text-muted)] line-through"
                : "text-[color:var(--planner-text-primary)]",
            )}
          >
            {item.title}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <input
            type="checkbox"
            checked={item.done}
            onClick={(e) => e.stopPropagation()}
            onChange={onToggleDone}
            className="size-3.5 cursor-pointer accent-[color:var(--planner-primary)]"
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="cursor-pointer rounded-md p-1 text-[color:var(--planner-text-muted)] hover:bg-white hover:text-danger"
            aria-label="Xoá"
          >
            <Trash2 size={12} />
          </button>
        </div>
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
    <div className="flex items-center gap-2 rounded-md border border-[color:var(--planner-border-soft)] bg-white px-2 py-1.5">
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

// Viec "Lớn" (co dau viec con) trong SCHEDULE timeline - giu nguyen cach
// expand/them dau viec con nhu truoc, chi doi "vo ngoai" thanh 1 dong
// TimelineRow-style (dot trang thai + co the chon) thay vi card rieng biet.
function BigTimelineItem({
  item,
  status,
  selected,
  onSelect,
  onToggleDone,
  onDelete,
  onAddChild,
}: {
  item: ApiPlannerItem;
  status: ItemStatus;
  selected: boolean;
  onSelect: () => void;
  onToggleDone: (item: ApiPlannerItem, parentId?: string) => void;
  onDelete: (item: ApiPlannerItem, parentId?: string) => void;
  onAddChild: (parentId: string, title: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [childDraft, setChildDraft] = useState("");
  const children = item.children ?? [];
  const cat = getCategory(item.color);

  function submitChild() {
    const title = childDraft.trim();
    if (!title) return;
    setChildDraft("");
    onAddChild(item.id, title);
  }

  return (
    <div className="relative flex gap-2.5 pl-0.5">
      <div className="relative z-[1] mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-white">
        {status === "done" ? (
          <CheckCircle2 size={16} className="text-[color:var(--planner-primary)]" />
        ) : status === "current" ? (
          <span className="size-2.5 rounded-full" style={{ backgroundColor: cat.accent }} />
        ) : (
          <Circle size={14} className="text-[color:var(--planner-border)]" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div
          onClick={onSelect}
          style={selected ? { boxShadow: `0 0 0 1.5px ${cat.accent}` } : undefined}
          className={cn(
            "flex cursor-pointer items-center gap-1.5 rounded-[10px] px-2 py-1.5 transition-colors duration-150 ease-out hover:bg-[var(--planner-surface-soft)]",
            status === "current" && "bg-[var(--planner-primary-soft)]",
          )}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            className="flex size-5 shrink-0 cursor-pointer items-center justify-center rounded text-[color:var(--planner-text-muted)] hover:bg-white"
          >
            <ChevronDown size={14} className={cn("transition-transform duration-150", !expanded && "-rotate-90")} />
          </button>
          <input
            type="checkbox"
            checked={item.done}
            onClick={(e) => e.stopPropagation()}
            onChange={() => onToggleDone(item)}
            className="size-3.5 shrink-0 cursor-pointer accent-[color:var(--planner-primary)]"
          />
          <span
            className={cn(
              "flex-1 truncate text-[13px] font-semibold",
              item.done
                ? "text-[color:var(--planner-text-muted)] line-through"
                : "text-[color:var(--planner-text-primary)]",
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
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item);
            }}
            className="shrink-0 cursor-pointer rounded-md p-1 text-[color:var(--planner-text-muted)] hover:bg-white hover:text-danger"
            aria-label="Xoá"
          >
            <Trash2 size={13} />
          </button>
        </div>
        {expanded && (
          <div className="mt-1 ml-5 flex flex-col gap-0.5 border-l border-[color:var(--planner-border-soft)] pl-2.5">
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
    </div>
  );
}

// Empty state illustration (section 19/20) - icon lich dat trong 1 vong tron
// mau xanh nhat kem 2 cham "✦" trang tri nho o 2 goc doi dien.
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

// Form them viec (text + gio + thoi luong + category + "Lớn"/"Đơn" + "việc
// trọng tâm") - section 12 "Add Task được chuyển thành Secondary Action":
// GAP lai thanh 1 nut "+ Thêm việc" nho, CHI mo rong thanh form day du khi
// bam vao (thay vi chiem 30-40% dien tich sidebar nhu truoc). Gop LUON vai
// tro cua "Quick Add" (section 13) - 2 muc trong spec vo tinh mo ta CUNG 1
// hanh dong (them nhanh 1 viec cho hom nay), tach thanh 2 UI rieng se trung
// lap chuc nang.
function AddTaskForm({ onAddItem }: { onAddItem: DayDetailPanelProps["onAddItem"] }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [draftKind, setDraftKind] = useState<PlannerItemKind>("SIMPLE");
  const [draftStart, setDraftStart] = useState<number | null>(null);
  const [draftDuration, setDraftDuration] = useState(DEFAULT_DURATION_MINUTES);
  const [draftColor, setDraftColor] = useState<string | null>(null);
  const [draftFocus, setDraftFocus] = useState(false);

  function submit() {
    const title = draft.trim();
    if (!title) return;
    onAddItem(
      title,
      draftKind,
      draftStart ?? undefined,
      draftColor ?? undefined,
      draftStart !== null ? draftDuration : undefined,
      draftFocus || undefined,
    );
    setDraft("");
    setDraftStart(null);
    setDraftFocus(false);
    // [2026-10-05] setDraftKind("SIMPLE") - bug phat hien qua test luong
    // tuong tac: truoc day KHONG reset, nen sau khi tao 1 viec "Lớn", lan
    // THEM TIEP THEO (dung chung 1 instance AddTaskForm, state khong mat vi
    // chi dang/dong chu khong unmount) VAN giu nguyen "Lớn" du nguoi dung
    // khong chu dong chon lai - de nham tao hang loat viec "Lớn" rong khong
    // dinh. Khac draftColor (CO Y giu lai qua cac lan Them lien tiep, xem
    // comment o ColorSwatchRow/PLANNER_COLORS) - "Lớn" la lua chon ÍT GẶP
    // HON, nen luon ve mac dinh "Đơn" sau moi lan them, cung tinh than voi
    // draftFocus o tren.
    setDraftKind("SIMPLE");
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex cursor-pointer items-center gap-1.5 rounded-[10px] border border-dashed border-[color:var(--planner-border)] px-3 py-2 text-[12.5px] font-medium text-[color:var(--planner-text-muted)] transition-colors duration-150 ease-out hover:border-[color:var(--planner-primary)] hover:text-[color:var(--planner-primary)]"
      >
        <Plus size={13} /> Thêm việc cho hôm nay...
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2.5 rounded-[10px] border border-[color:var(--planner-border-soft)] bg-[var(--planner-surface-soft)] p-2.5">
      <div className="flex items-center gap-1.5">
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
            if (e.key === "Escape") setOpen(false);
          }}
          placeholder="Thêm việc cần làm..."
          className="h-9 min-w-0 flex-1 rounded-[9px] border border-[color:var(--planner-border-soft)] bg-white px-2.5 text-[13px] text-[color:var(--planner-text-primary)] outline-none placeholder:text-[color:var(--planner-text-muted)] focus:border-[#b9c9ef] focus:shadow-[0_0_0_3px_rgba(71,120,232,.08)]"
        />
        <TimePickerField
          startMinute={draftStart}
          durationMinutes={draftDuration}
          onChange={(start, duration) => {
            setDraftStart(start);
            setDraftDuration(duration);
          }}
        />
      </div>

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
            <span className="block size-full" style={{ backgroundColor: c.value ?? "transparent" }}>
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

      <label className="flex cursor-pointer items-center gap-1.5 text-[12px] font-medium text-[color:var(--planner-text-secondary)]">
        <input
          type="checkbox"
          checked={draftFocus}
          onChange={(e) => setDraftFocus(e.target.checked)}
          className="size-3.5 cursor-pointer accent-[color:var(--planner-primary)]"
        />
        <Flame size={12} className="text-[#d97706]" /> Đánh dấu là việc trọng tâm hôm nay
      </label>

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
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="h-[34px] cursor-pointer rounded-[9px] px-2.5 text-[12.5px] font-medium text-[color:var(--planner-text-muted)] hover:text-[color:var(--planner-text-secondary)]"
          >
            Huỷ
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!draft.trim()}
            className="h-[34px] cursor-pointer rounded-[9px] bg-[color:var(--planner-primary)] px-3.5 text-[12.5px] font-semibold text-white shadow-[0_4px_10px_rgba(79,127,240,.18)] transition-colors duration-150 ease-out hover:bg-[#416fdd] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          >
            Thêm
          </button>
        </div>
      </div>
    </div>
  );
}

type DayDetailPanelProps = {
  date: string;
  items: ApiPlannerItem[];
  selectedItemId: string | null;
  onSelectItem: (id: string | null) => void;
  onAddItem: (
    title: string,
    kind: PlannerItemKind,
    scheduledMinute?: number,
    color?: string,
    durationMinutes?: number,
    isFocus?: boolean,
  ) => void;
  onAddChild: (parentId: string, title: string) => void;
  onToggleDone: (item: ApiPlannerItem, parentId?: string) => void;
  onDelete: (item: ApiPlannerItem, parentId?: string) => void;
  onChangeDay: (direction: -1 | 1) => void;
};

function DayDetailPanel({
  date,
  items,
  selectedItemId,
  onSelectItem,
  onAddItem,
  onAddChild,
  onToggleDone,
  onDelete,
  onChangeDay,
}: DayDetailPanelProps) {
  const [filter, setFilter] = useState<FilterValue>("ALL");
  const [filterOpen, setFilterOpen] = useState(false);

  const sorted = [...items].sort((a, b) => a.orderIndex - b.orderIndex);
  const isEmpty = sorted.length === 0;
  const focusItem = sorted.find((i) => i.isFocus) ?? null;
  const isToday = date === toISODate(new Date());
  const now = new Date();
  const nowMinute = now.getHours() * 60 + now.getMinutes();

  const filtered = sorted.filter((item) => {
    if (filter === "ALL") return true;
    if (filter === "DONE") return item.done;
    if (filter === "TODO") return !item.done;
    return item.color === filter;
  });
  const activeFilterLabel = FILTER_OPTIONS.find((f) => f.value === filter)?.label ?? "Tất cả";

  return (
    // Sidebar Card - "Daily command center", khong con la 1 form nhap task
    // tran trui nhu truoc. h-full + overflow-y-auto (2026-10-05) - panel
    // nay gio cung GIAN HET chieu cao hang luoi (cung cap voi lich ben
    // trai) - ngay co NHIEU viec/dai se tu cuon RIENG BEN TRONG chinh no
    // thay vi day ca trang cao them (khop yeu cau "ưu tiên diện tích cho
    // phần lịch, sao cho hiển thị được nhiều nhất" - lich luon giu DUNG 1
    // khung cao co dinh, khong bi panh ben canh keo gian).
    <div className="flex h-full flex-col gap-4 overflow-y-auto rounded-[14px] border border-[color:var(--planner-border)] bg-[var(--planner-surface)] p-4 shadow-[0_2px_10px_rgba(20,30,50,.03)]">
      {/* Day Header (section 1) - MONDAY / October 5, 2026 / Thứ Hai... +
          nav ngay. */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <p className="text-[11px] font-bold tracking-[.08em] text-[color:var(--planner-primary)] uppercase">
            {weekdayFullEn(date)}
          </p>
          <p className="text-[18px] font-bold tracking-[-0.3px] text-[color:var(--planner-text-primary)]">
            {formatLongDateEn(date)}
          </p>
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

      {isEmpty ? (
        <>
          <div className="border-t border-[color:var(--planner-border-soft)]" />
          {/* Empty State Illustration - CHI hien khi ngay nay chua co viec nao. */}
          <div className="flex flex-col items-center gap-2.5 py-4 text-center">
            <EmptyIllustration />
            <div className="flex flex-col gap-0.5">
              <p className="text-[13px] font-semibold text-[color:var(--planner-text-secondary)]">Chưa có việc nào</p>
              <p className="text-[12px] text-[color:var(--planner-text-muted)]">
                Hãy thêm công việc để lên kế hoạch nhé!
              </p>
            </div>
          </div>
          <div className="border-t border-[color:var(--planner-border-soft)]" />
          <AddTaskForm onAddItem={onAddItem} />
        </>
      ) : (
        <>
          <div className="border-t border-[color:var(--planner-border-soft)]" />

          <TodayProgress items={sorted} />

          {focusItem && (
            <>
              <div className="border-t border-[color:var(--planner-border-soft)]" />
              <TodayFocusCard item={focusItem} onContinue={() => onSelectItem(focusItem.id)} />
            </>
          )}

          <div className="border-t border-[color:var(--planner-border-soft)]" />

          {/* SCHEDULE (section 6/15) - header + filter + timeline. */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-bold tracking-[.08em] text-[color:var(--planner-text-muted)] uppercase">
                Schedule <span className="font-medium normal-case">· {filtered.length} việc</span>
              </p>
              <PopoverRoot open={filterOpen} onOpenChange={setFilterOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "flex cursor-pointer items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-medium transition-colors duration-150 ease-out",
                      filter === "ALL"
                        ? "border-[color:var(--planner-border)] text-[color:var(--planner-text-muted)] hover:text-[color:var(--planner-text-secondary)]"
                        : "border-[color:var(--planner-primary)] bg-[color:var(--planner-primary-soft)] text-[color:var(--planner-primary)]",
                    )}
                  >
                    <ListFilter size={11} /> {filter === "ALL" ? "Filters" : activeFilterLabel}
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  open={filterOpen}
                  align="end"
                  className="z-50 w-44 rounded-[10px] border border-[color:var(--planner-border)] bg-white p-1 shadow-[0_8px_24px_rgba(20,30,50,.1)]"
                >
                  {FILTER_OPTIONS.map((f) => (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => {
                        setFilter(f.value);
                        setFilterOpen(false);
                      }}
                      className={cn(
                        "flex w-full cursor-pointer items-center gap-1.5 rounded-[7px] px-2 py-1.5 text-left text-[12.5px] transition-colors duration-150 ease-out hover:bg-[var(--planner-surface-soft)]",
                        filter === f.value
                          ? "font-semibold text-[color:var(--planner-text-primary)]"
                          : "text-[color:var(--planner-text-secondary)]",
                      )}
                    >
                      {f.value !== "ALL" && f.value !== "DONE" && f.value !== "TODO" && (
                        <span
                          className="size-2 shrink-0 rounded-full"
                          style={{ backgroundColor: getCategory(f.value).accent }}
                        />
                      )}
                      {f.label}
                    </button>
                  ))}
                </PopoverContent>
              </PopoverRoot>
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-1 rounded-[12px] border border-[#f0f2f5] bg-[#fcfdff] px-4 py-6 text-center">
                <p className="text-[12.5px] font-medium text-[color:var(--planner-text-secondary)]">
                  Không có việc phù hợp bộ lọc
                </p>
              </div>
            ) : (
              <div className="relative flex flex-col gap-1 border-l border-[color:var(--planner-border-soft)] pl-0">
                {filtered.map((item) =>
                  item.kind === "BIG" ? (
                    <BigTimelineItem
                      key={item.id}
                      item={item}
                      status={computeItemStatus(item, isToday, nowMinute)}
                      selected={selectedItemId === item.id}
                      onSelect={() => onSelectItem(item.id)}
                      onToggleDone={onToggleDone}
                      onDelete={onDelete}
                      onAddChild={onAddChild}
                    />
                  ) : (
                    <TimelineRow
                      key={item.id}
                      item={item}
                      status={computeItemStatus(item, isToday, nowMinute)}
                      selected={selectedItemId === item.id}
                      onSelect={() => onSelectItem(item.id)}
                      onToggleDone={() => onToggleDone(item)}
                      onDelete={() => onDelete(item)}
                    />
                  ),
                )}
              </div>
            )}

            <AddTaskForm onAddItem={onAddItem} />
          </div>
        </>
      )}
    </div>
  );
}
