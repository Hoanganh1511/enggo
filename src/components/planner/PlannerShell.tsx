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
  Palette,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ApiPlannerItem, PlannerItemKind } from "@/lib/api/planner";
import {
  listPlannerItemsAction,
  createPlannerItemAction,
  updatePlannerItemAction,
  deletePlannerItemAction,
  listPlannerTypeColorsAction,
  setPlannerTypeColorAction,
} from "@/actions/planner/planner";
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
  PopoverClose,
} from "@/components/ui/popover";
import { TimePickerField } from "./time-picker-field";
import {
  LIFE_ITEM_TYPES,
  LIFE_ITEM_PALETTES,
  getLifeItemTypeConfig,
  resolveLifeItemPalette,
  PRIORITY_CONFIG,
  STATUS_SUGGESTIONS,
  WEEKDAY_SHORT_IDS,
  WEEKDAY_SHORT_LABELS,
  DEFAULT_REFLECTION_PROMPTS,
  type LifeItemType,
  type LifeItemPriority,
  type EventMetadata,
  type HabitMetadata,
  type ReflectionMetadata,
} from "@/lib/planner/life-item-types";
import { TagChipInput } from "@/components/series/notes/TagChipInput";
import {
  LifeItemPaletteProvider,
  useLifeItemPalette,
  useTypeColorOverrides,
} from "./life-item-palette-context";

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
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];
const WEEKDAY_LONG_VI = [
  "Thứ Hai",
  "Thứ Ba",
  "Thứ Tư",
  "Thứ Năm",
  "Thứ Sáu",
  "Thứ Bảy",
  "Chủ Nhật",
];
const MONTH_LABELS = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];
const MONTH_LABELS_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// [2026-10-06] "Good Life - Life Management System" - yeu cau nguoi dung gui
// nguyen 1 ban dac ta day du, thay THE HOAN TOAN he thong "category theo mau
// tu chon" (CATEGORY_BY_COLOR cu) bang 4 LOAI co dinh (Action/Event/Habit/
// Reflection, section 2), mau SEMANTIC theo loai (section 7, khong con cho
// nguoi dung tu do chon mau cho TUNG item - chi chon mau CHO CA 1 Type trong
// phan cai dat, xem life-item-palette-context.tsx). Toan bo config Type/mau/
// metadata rieng nam o src/lib/planner/life-item-types.ts (dung chung voi
// mọi noi can doc, khong khai bao lai o day).

// Bo loc "SCHEDULE" (yeu cau nguoi dung, section 15 "Filter"): theo trang
// thai (Tat ca/Chua xong/Hoan thanh) HOAC theo Type - gop CHUNG 1 danh
// sach lua chon (dung tinh than ban mockup "All/Work/Learning/.../Completed/
// Incomplete" liet ke CUNG 1 cho).
type FilterValue = "ALL" | "DONE" | "TODO" | LifeItemType;
const FILTER_OPTIONS: { value: FilterValue; label: string }[] = [
  { value: "ALL", label: "Tất cả" },
  { value: "TODO", label: "Chưa xong" },
  { value: "DONE", label: "Hoàn thành" },
  ...LIFE_ITEM_TYPES.map((t) => ({ value: t.id as FilterValue, label: t.label })),
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
function rangeForMode(
  mode: ViewMode,
  anchor: string,
): { from: string; to: string } {
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
  return (
    (item.scheduledMinute ?? 0) +
    (item.durationMinutes ?? DEFAULT_DURATION_MINUTES)
  );
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
function computeItemStatus(
  item: ApiPlannerItem,
  isToday: boolean,
  nowMinute: number,
): ItemStatus {
  if (item.done) return "done";
  if (!isToday || item.scheduledMinute === null) return "upcoming";
  const end = itemEndMinute(item);
  if (nowMinute >= item.scheduledMinute && nowMinute < end) return "current";
  return "upcoming";
}

// Diem goc 1 polygon CSS clip-path - [x%, y%] tinh theo % cua CHINH hop
// chu nhat dang ap dung clip-path (khong phai % cua ca cot ngay).
type ClipPoint = [number, number];
export type TimedLayoutEntry = {
  item: ApiPlannerItem & { scheduledMinute: number };
  leftPercent: number;
  widthPercent: number;
  // undefined = hinh chu nhat don gian (KHONG can clip) - truong hop pho
  // bien nhat (khong trung gio voi ai, hoac trung gio ON DINH suot thoi
  // luong - khong co "bac thang" nao ca).
  clipPath?: string;
  // Vi tri/do rong vung THAT SU hien noi dung (icon/gio/tieu de) - tinh theo
  // DOAN DAU TIEN (tren cung) cua chinh item, % cua hop chu nhat NGOAI (nhu
  // leftPercent/widthPercent o tren) - CAN THIET vi khi co clip-path, hop
  // chu nhat ngoai co the RONG HON doan tren cung (vd item hep luc dau, no
  // rong ra sau), noi dung (dong len dau) PHAI nam DUNG trong doan hep do,
  // khong phai dan ra het ca hop ngoai.
  contentLeftPercent: number;
  contentWidthPercent: number;
  conflict: boolean;
  // [2026-10-06] Cac item KHAC (khong tinh chinh no) nam trong BAT KY nhom
  // gay ra `conflict` - de hien "⚠ Trùng lịch" liet ke RO dang trung voi
  // viec nao (xem ConflictPopover trong TimedItemChip), thay vi chi 1 dau
  // "⚠" tro troi khong biet trung voi ai.
  conflictWith: (ApiPlannerItem & { scheduledMinute: number })[];
};

// [2026-10-06] "Overlapping Event Layout" / "Collision-aware Time Blocks" -
// yeu cau nguoi dung gui spec day du kem hinh minh hoa, PHIEN BAN DAY DU
// (ca "Example 2" - 1 item dai TU DONG TRO VE full width ngay sau khi item
// ngan giao voi no ket thuc, thay vi giu 1 be rong CO DINH suot ca thoi
// luong). Thuat toan:
// 1. Gom cum theo CHUOI giao nhau.
// 2. Trong 1 cum, gan "lane" ON DINH cho tung item bang thuat toan tham lam
//    kinh dien - CHI dung de xep thu tu trai/phai NHAT QUAN giua cac doan
//    cua CUNG 1 item (khong con dung truc tiep de tinh be rong nua).
// 3. Cat RIENG khoang thoi gian cua TUNG item thanh nhieu "doan" (segment)
//    tai moi moc bat dau/ket thuc cua CAC item khac trong cum co giao voi
//    no. Voi MOI doan, tim nhom item THAT SU dong thoi diem (active) ngay
//    trong doan do, sap xep nhom theo lane (buoc 2) de suy ra "hang" (rank)
//    CUC BO cua chinh item trong dung doan ay - be rong/vi tri cua doan =
//    1/(so luong active) voi vi tri = rank/(so luong active). Ket qua: 1
//    item dai co the co NHIEU doan voi be rong KHAC NHAU theo tung khoang
//    thoi gian (full width luc khong ai chen, hep lai dung luc bi chen).
// 4. Hop chu nhat NGOAI CUNG cua 1 item (CSS left/width that su) = hop bao
//    (union) cua TAT CA doan cua no; cac doan HEP HON hop bao se duoc "khoet"
//    bang CSS clip-path (polygon dang bac thang, toa do tinh theo % cua
//    CHINH hop bao - xem comment ClipPoint). Khi item chi co 1 doan DUY NHAT
//    (khong trung gio, hoac trung gio ON DINH suot thoi luong - truong hop
//    cu), hop bao = chinh doan do, KHONG can clip-path (undefined).
// 5. `conflict`: true khi item co BAT KY doan nao bi chia (active.length>1)
//    MA khong co Event nao trong dung nhom active cua doan do - Event trung
//    gio la BINH THUONG (lich hen, hien canh nhau la dung y), Action/Habit/
//    Reflection trung gio nhieu kha nang la LICH CHUA HOP LY hon - chip tu
//    hien 1 dau "⚠" (xem TimedItemChip) thay vi am tham chia doi.
function layoutTimedItems(
  items: (ApiPlannerItem & { scheduledMinute: number })[],
): TimedLayoutEntry[] {
  const entries = items
    .map((it) => ({ it, start: it.scheduledMinute, end: itemEndMinute(it) }))
    .sort((a, b) => a.start - b.start || a.end - b.end);
  type Entry = (typeof entries)[number];

  const result: TimedLayoutEntry[] = [];
  let cluster: Entry[] = [];
  let clusterEnd = -1;

  function flushCluster() {
    if (cluster.length === 0) return;
    // Buoc 2: lane ON DINH.
    const colEnds: number[] = [];
    const laneOf = new Map<Entry, number>();
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
      laneOf.set(entry, placedCol);
    }

    // Tat ca moc bat dau/ket thuc trong CA cum - dung chung lam "lan ranh"
    // cat doan cho moi item (chi giu lai moc nam THAT SU ben trong khoang
    // song cua TUNG item khi cat, xem ben duoi).
    const allBreakpoints = Array.from(new Set(cluster.flatMap((e) => [e.start, e.end]))).sort((a, b) => a - b);

    for (const entry of cluster) {
      const ownPoints = allBreakpoints.filter((p) => p > entry.start && p < entry.end);
      const bounds = [entry.start, ...ownPoints, entry.end];
      // Buoc 3: 1 doan cho MOI khoang [bounds[i], bounds[i+1]).
      const segments: { startMin: number; endMin: number; leftPercent: number; widthPercent: number; active: Entry[] }[] = [];
      for (let i = 0; i < bounds.length - 1; i++) {
        const segStart = bounds[i];
        const segEnd = bounds[i + 1];
        if (segEnd <= segStart) continue;
        // Active = item (KE CA chinh entry) co khoang song BAO TRON doan nay.
        const active = cluster
          .filter((x) => x.start <= segStart && x.end >= segEnd)
          .sort((a, b) => (laneOf.get(a) ?? 0) - (laneOf.get(b) ?? 0));
        const rank = active.indexOf(entry);
        const n = active.length;
        segments.push({
          startMin: segStart,
          endMin: segEnd,
          leftPercent: (rank / n) * 100,
          widthPercent: (1 / n) * 100,
          active,
        });
      }
      if (segments.length === 0) continue;

      // Buoc 4: hop bao (union) - vi tri/be rong CSS that su.
      const outerLeft = Math.min(...segments.map((s) => s.leftPercent));
      const outerRight = Math.max(...segments.map((s) => s.leftPercent + s.widthPercent));
      const outerWidth = outerRight - outerLeft;
      const totalMinutes = entry.end - entry.start;

      let clipPath: string | undefined;
      if (segments.length > 1) {
        // Ve VIEN PHAI tu TREN xuong DUOI (thu tu doan tu nhien: 1..n), roi
        // VIEN TRAI tu DUOI len TREN (phai duyet doan theo thu tu NGUOC n..1
        // - trong MOI doan van la bottom->top vi dang di LEN) de duong vien
        // lien tuc, KHONG tu cat chinh no (loi cu: leftEdge day theo thu tu
        // XUOI roi .reverse() ca mang => xen ke dinh sai thu tu, polygon tu
        // giao nhau, hien thanh hinh "tam giac/nem" meo thay vi bac thang).
        const rightEdge: ClipPoint[] = [];
        for (const seg of segments) {
          const yTop = ((seg.startMin - entry.start) / totalMinutes) * 100;
          const yBottom = ((seg.endMin - entry.start) / totalMinutes) * 100;
          const localRight = ((seg.leftPercent + seg.widthPercent - outerLeft) / outerWidth) * 100;
          rightEdge.push([localRight, yTop], [localRight, yBottom]);
        }
        const leftEdge: ClipPoint[] = [];
        for (let i = segments.length - 1; i >= 0; i--) {
          const seg = segments[i];
          const yTop = ((seg.startMin - entry.start) / totalMinutes) * 100;
          const yBottom = ((seg.endMin - entry.start) / totalMinutes) * 100;
          const localLeft = ((seg.leftPercent - outerLeft) / outerWidth) * 100;
          leftEdge.push([localLeft, yBottom], [localLeft, yTop]);
        }
        const polygon = [...rightEdge, ...leftEdge];
        clipPath = `polygon(${polygon.map(([x, y]) => `${x.toFixed(2)}% ${y.toFixed(2)}%`).join(", ")})`;
      }

      const first = segments[0];
      const contentLeftPercent = ((first.leftPercent - outerLeft) / outerWidth) * 100;
      const contentWidthPercent = (first.widthPercent / outerWidth) * 100;
      const conflictingSegments = segments.filter(
        (s) => s.active.length > 1 && !s.active.some((e) => e.it.itemType === "EVENT"),
      );
      const conflict = conflictingSegments.length > 0;
      const conflictWith = conflict
        ? Array.from(
            new Map(
              conflictingSegments
                .flatMap((s) => s.active)
                .filter((e) => e !== entry)
                .map((e) => [e.it.id, e.it] as const),
            ).values(),
          )
        : [];

      result.push({
        item: entry.it,
        leftPercent: outerLeft,
        widthPercent: outerWidth,
        clipPath,
        contentLeftPercent,
        contentWidthPercent,
        conflict,
        conflictWith,
      });
    }
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
  const [itemsByDate, setItemsByDate] = useState<ItemsByDate>(() =>
    groupByDate(initialItems),
  );
  const [isLoading, setIsLoading] = useState(false);
  // Dong bo "chon 1 su kien" GIUA calendar canvas (click 1 the gio) VA Right
  // Panel (highlight dong tuong ung trong Schedule) - yeu cau nguoi dung,
  // section II.10 "Selected State": "Đồng thời: Right panel chuyển sang Task
  // Detail" (o day don gian hoa thanh HIGHLIGHT, khong tach 1 man hinh Task
  // Detail rieng - xem giai thich trong DayDetailPanel).
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  // [2026-10-05] "Click vào khoảng trống → thêm việc nhanh với giờ điền
  // sẵn" - yeu cau nguoi dung (state #6/#13 trong spec). Luu PHUT da click
  // (date da co san qua selectedDate, click 1 o gio cung goi onSelect(d) nhu
  // binh thuong) - DayDetailPanel/AddTaskForm doc gia tri nay de TU MO form
  // + dien san gio, roi "tieu thu" (dat ve null) de khong mo lai lan nua neu
  // component re-render vi ly do khac.
  const [quickAddPrefill, setQuickAddPrefill] = useState<number | null>(null);
  // [2026-10-06] "User customization" (spec section 21) - tai 1 LAN luc mo
  // Planner, dua xuong CA cay qua LifeItemPaletteProvider (xem
  // life-item-palette-context.tsx) de moi noi doc mau Type (TimedItemChip/
  // TimelineRow/AddTaskForm/EditItemForm/...) deu tu dong ap dung dung
  // customization cua nguoi dung, khong can truyen tay qua tung tang props.
  const [typeColorOverrides, setTypeColorOverrides] = useState<Partial<Record<LifeItemType, string>>>({});
  useEffect(() => {
    listPlannerTypeColorsAction()
      .then((rows) => {
        const map: Partial<Record<LifeItemType, string>> = {};
        for (const r of rows) map[r.type] = r.paletteId;
        setTypeColorOverrides(map);
      })
      .catch(() => {});
  }, []);

  async function reload(range: { from: string; to: string }) {
    setIsLoading(true);
    const items = await listPlannerItemsAction(range.from, range.to).catch(
      () => [],
    );
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
    const next =
      viewMode === "week"
        ? addDays(anchor, direction * 7)
        : addMonths(anchor, direction);
    const diffDays = Math.round(
      (new Date(next).getTime() - new Date(anchor).getTime()) / 86400000,
    );
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

  function patchDate(
    date: string,
    updater: (items: ApiPlannerItem[]) => ApiPlannerItem[],
  ) {
    setItemsByDate((prev) => ({ ...prev, [date]: updater(prev[date] ?? []) }));
  }

  async function handleAddItem(input: {
    title: string;
    kind: PlannerItemKind;
    itemType: LifeItemType;
    scheduledMinute?: number;
    durationMinutes?: number;
    isFocus?: boolean;
    priority?: LifeItemPriority;
    area?: string;
    project?: string;
    tags?: string[];
    deadline?: string;
    metadata?: Record<string, unknown>;
  }) {
    const created = await createPlannerItemAction({
      date: selectedDate,
      ...input,
    }).catch(() => null);
    if (created) patchDate(selectedDate, (items) => [...items, created]);
  }

  async function handleAddChild(parentId: string, title: string) {
    const created = await createPlannerItemAction({
      date: selectedDate,
      title,
      parentId,
    }).catch(() => null);
    if (!created) return;
    patchDate(selectedDate, (items) =>
      items.map((it) =>
        it.id === parentId
          ? { ...it, children: [...(it.children ?? []), created] }
          : it,
      ),
    );
  }

  async function handleToggleDone(item: ApiPlannerItem, parentId?: string) {
    const done = !item.done;
    patchDate(item.date, (items) =>
      parentId
        ? items.map((p) =>
            p.id === parentId
              ? {
                  ...p,
                  children: (p.children ?? []).map((c) =>
                    c.id === item.id ? { ...c, done } : c,
                  ),
                }
              : p,
          )
        : items.map((i) => (i.id === item.id ? { ...i, done } : i)),
    );
    await updatePlannerItemAction(item.id, { done }).catch(() => {});
  }

  async function handleDelete(item: ApiPlannerItem, parentId?: string) {
    patchDate(item.date, (items) =>
      parentId
        ? items.map((p) =>
            p.id === parentId
              ? {
                  ...p,
                  children: (p.children ?? []).filter((c) => c.id !== item.id),
                }
              : p,
          )
        : items.filter((i) => i.id !== item.id),
    );
    if (selectedItemId === item.id) setSelectedItemId(null);
    await deletePlannerItemAction(item.id).catch(() => {});
  }

  // [2026-10-05] Sua 1 item SAU KHI DA TAO - yeu cau nguoi dung: "hiện KHÔNG
  // có cách nào sửa lại tiêu đề/giờ/màu sau khi tạo, chỉ tick done hoặc
  // xoá". Dung CHUNG cho 2 cho: (1) form sua inline trong SCHEDULE (TimelineRow/
  // BigTimelineItem), (2) keo-tha/keo gian truc tiep tren luoi gio
  // (WeekTimeGrid) - ca 2 deu chi la "doi 1 vai field cua 1 item co san",
  // khong can 2 ham rieng. Dung `item.date` (KHONG phai selectedDate) de
  // patch DUNG bucket ngay cua CHINH item do - quan trong cho truong hop keo
  // tha tren lich (nguoi dung co the dang xem 1 tuan ma selectedDate la 1
  // ngay KHAC voi ngay dang keo).
  async function handleUpdateItem(
    item: ApiPlannerItem,
    updates: Partial<{
      title: string;
      itemType: LifeItemType;
      scheduledMinute: number | null;
      durationMinutes: number | null;
      color: string | null;
      isFocus: boolean;
      priority: LifeItemPriority | null;
      status: string | null;
      area: string | null;
      project: string | null;
      tags: string[];
      deadline: string | null;
      metadata: Record<string, unknown> | null;
    }>,
    parentId?: string,
  ) {
    patchDate(item.date, (items) =>
      parentId
        ? items.map((p) =>
            p.id === parentId
              ? {
                  ...p,
                  children: (p.children ?? []).map((c) =>
                    c.id === item.id ? { ...c, ...updates } : c,
                  ),
                }
              : p,
          )
        : items.map((i) => (i.id === item.id ? { ...i, ...updates } : i)),
    );
    await updatePlannerItemAction(item.id, updates).catch(() => {});
  }

  // Keo-tha (doi gio bat dau) / keo gian canh duoi (doi thoi luong) TRUC
  // TIEP tren luoi gio - xem TimedItemChip. Chi danh cho item TOP-LEVEL co
  // gio (children khong hien tren luoi, chi hien trong SCHEDULE).
  function handleUpdateItemTime(
    item: ApiPlannerItem,
    newStart: number,
    newDuration: number,
  ) {
    void handleUpdateItem(item, {
      scheduledMinute: newStart,
      durationMinutes: newDuration,
    });
  }

  // Click 1 o gio TRONG tren luoi tuan - yeu cau nguoi dung (state #6):
  // "Click vào khoảng trống... hệ thống tự hiểu Date/Start, mở Add Task".
  // CHI luu lai PHUT - ngay da duoc chinh CHINH `onSelect(d)` (goi kem luc
  // click, xem WeekTimeGrid) tu dong chuyen selectedDate dung ngay cot do roi.
  function handleSlotClick(minute: number) {
    setQuickAddPrefill(minute);
  }

  // [2026-10-05] Tach rieng 2 moc ngay (khong con 1 chuoi "rangeLabel" gop
  // chung) - bug nguoi dung bao: "tràn dòng hay dí nội dung" - sidebar hep
  // (208px) khong du cho CA chuoi "2026-10-05 → 2026-10-11" tren 1 dong,
  // trinh duyet TU NGAT DONG tai dau "-" (vd "2026-" xuong dong, "10-11" o
  // dong sau) vi CSS mac dinh coi dau gach ngang la 1 diem ngat dong hop le -
  // ngat NGAY GIUA 1 ngay, rat kho doc. Render rieng moi ngay trong 1 the
  // whitespace-nowrap (xem JSX ben duoi) dam bao NEU phai xuong dong thi chi
  // xuong dong tai mui ten "→" (giua 2 ngay), khong bao gio vo giua 1 ngay.
  const rangeStart = startOfWeek(anchor);
  const rangeEnd = addDays(startOfWeek(anchor), 6);
  const monthLabel = `${MONTH_LABELS[new Date(anchor).getMonth()]} ${new Date(anchor).getFullYear()}`;

  return (
    <LifeItemPaletteProvider overrides={typeColorOverrides}>
    {/* planner-scope - nap bo CSS var rieng (xem globals.css). "-mx-4 sm:-mx-6
        lg:-mx-10 -my-6" HUY padding cua FeedMainArea.tsx (to tien dung CHUNG
        cho ca nhom (feed), khong rieng Planner) de tu ve lai DUNG padding/nen
        theo spec (section 2/3) - cung ky thuat "-mr-10" /home da dung de huy
        rieng 1 phia, o day huy CA 4 phia roi tu dinh nghia lai tu dau.
        min-h-full de nen phu HET chieu cao vung cuon, khong de lo nen cu phia
        duoi khi noi dung ngan hon 1 man hinh. */}
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
        {/* [2026-10-05] xl: (truoc day lg:) - bug phat hien qua kiem tra
            them: tai cac be rong "vua du" lg (~1024-1279px), 3 cot
            208px+1fr+380px chi con lai RAT IT cho cot calendar (7 cot ngay +
            1 cot nhan gio) - moi cot ngay con chua toi 40px, khong du cho
            hien "HH:MM — HH:MM" tren the su kien, bi CAT CUT GIUA SO (vd
            "09:0" thay vi "09:00", xem them fix truncate trong TimedItemChip
            o duoi). Doi sang xl (1280px) - be rong do cot calendar con lai
            du rong hon han, dong thoi duoi xl van giu bo cuc xep CHONG DOC
            (grid-cols-1) von da kiem chung la hien thi TOT (lich chiem TRON
            chieu rong, khong bi 2 cot kia chia xe). */}
        <div className="grid grid-cols-1 items-start gap-5 xl:h-[calc(100dvh-112px)] xl:grid-cols-[208px_1fr_380px] xl:items-stretch">
          <div className="flex h-fit flex-col gap-4 rounded-[6px] border border-[color:var(--planner-border)] bg-[var(--planner-surface)] p-4 shadow-[0_2px_10px_rgba(20,30,50,.03)] xl:sticky xl:top-7">
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
              <TypeColorSettings
                overrides={typeColorOverrides}
                onChange={(type, paletteId) => {
                  setTypeColorOverrides((prev) => ({ ...prev, [type]: paletteId }));
                  void setPlannerTypeColorAction(type, paletteId).catch(() => {});
                }}
              />
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
                  <ChevronLeft
                    size={15}
                    className="text-[color:var(--planner-text-secondary)]"
                  />
                </button>
                <button
                  type="button"
                  onClick={() => changeAnchor(1)}
                  className="flex h-8 flex-1 cursor-pointer items-center justify-center rounded-[9px] border border-[color:var(--planner-border)] bg-white transition-colors duration-150 ease-out hover:bg-[var(--planner-surface-soft)]"
                >
                  <ChevronRight
                    size={15}
                    className="text-[color:var(--planner-text-secondary)]"
                  />
                </button>
              </div>
              <div className="flex items-start gap-1.5 rounded-[9px] border border-[color:var(--planner-border)] bg-white px-2 py-2">
                <CalendarDays
                  size={13}
                  className="mt-0.5 shrink-0 text-[color:var(--planner-text-muted)]"
                />
                {viewMode === "week" ? (
                  <span className="flex flex-wrap items-baseline gap-x-1 text-[12.5px] leading-[1.4] font-semibold text-[color:var(--planner-text-primary)]">
                    <span className="whitespace-nowrap">{rangeStart}</span>
                    <span
                      className="shrink-0 text-[color:var(--planner-text-muted)]"
                      aria-hidden="true"
                    >
                      →
                    </span>
                    <span className="whitespace-nowrap">{rangeEnd}</span>
                  </span>
                ) : (
                  <span className="text-[12.5px] leading-[1.4] font-semibold text-[color:var(--planner-text-primary)]">
                    {monthLabel}
                  </span>
                )}
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
                "flex h-full flex-col overflow-hidden rounded-[6px] border border-[color:var(--planner-border)] bg-[var(--planner-surface)] shadow-[0_2px_8px_rgba(20,30,50,0.03)]",
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
                onSlotClick={handleSlotClick}
                onUpdateItemTime={handleUpdateItemTime}
                typeColorOverrides={typeColorOverrides}
              />
            </div>
          ) : (
            <div
              className={cn(
                "h-full overflow-y-auto rounded-[6px] border border-[color:var(--planner-border)] bg-[var(--planner-surface)] p-3 shadow-[0_2px_8px_rgba(20,30,50,0.03)]",
                isLoading && "opacity-60",
              )}
            >
              <MonthGrid
                anchor={anchor}
                selectedDate={selectedDate}
                itemsByDate={itemsByDate}
                onSelect={selectDate}
              />
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
            onUpdateItem={handleUpdateItem}
            onChangeDay={changeSelectedDay}
            quickAddPrefill={quickAddPrefill}
            onConsumePrefill={() => setQuickAddPrefill(null)}
          />
        </div>
      </div>
    </div>
    </LifeItemPaletteProvider>
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
  // useTypeColorOverrides() (khong phai useLifeItemPalette()) - can resolve
  // NHIEU item/Type khac nhau trong .map() ben duoi, goi hook useLifeItemPalette()
  // o TRONG vong lap vi pham Rules of Hooks.
  const overrides = useTypeColorOverrides();
  if (items.length === 0) return null;
  const sorted = [...items].sort((a, b) => a.orderIndex - b.orderIndex);
  const visible = sorted.slice(0, MAX_PREVIEW_ITEMS);
  const hasMore = sorted.length > MAX_PREVIEW_ITEMS;
  return (
    <div className="mt-0.5 flex min-w-0 flex-1 flex-col gap-px overflow-hidden">
      {visible.map((item) => {
        const cat = resolveLifeItemPalette(item.itemType, overrides);
        return (
          <div key={item.id} className="flex min-w-0 items-center gap-1">
            <span
              style={{ backgroundColor: item.done ? undefined : cat.accentStrong }}
              className={cn(
                "size-1 shrink-0 rounded-full",
                item.done && "bg-[color:var(--planner-text-muted)]/50",
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
        );
      })}
      {hasMore && (
        <span className="pl-2.5 text-[10.5px] leading-none text-[color:var(--planner-text-muted)]">
          ····
        </span>
      )}
    </div>
  );
}

// Danh sach viec KHONG dat gio ("ca ngay") hien 1 hang rieng NGAY TREN luoi
// gio (giong Google Calendar). [2026-10-05] Restyle theo "Event Card" moi
// (Part II): nen pastel CUA CATEGORY + vien trai accent 3px, KHONG con border
// 4 canh + border-top nhu truoc.
function AllDayItemChip({ item }: { item: ApiPlannerItem }) {
  const cat = useLifeItemPalette(item.itemType);
  return (
    <span
      title={item.title}
      // [2026-10-06] accentSoft (truoc accentLight) - yeu cau nguoi dung:
      // "sao không có màu nền của task?". accentLight dung DUNG hex spec dua
      // (vd Action #F8FBFE) nhung mau do GAN NHU TRANG TUYET DOI, mat tac
      // dung "glanceable" (section 19: nhin mau la biet Type, khong can doc
      // chu) - accentSoft la 1 bac dam hon (vd #EAF3FB), van la pastel nhe
      // nhung MAT NGUOI THAT SU PHAN BIET duoc tren man hinh.
      style={{ backgroundColor: cat.accentSoft, borderLeftColor: cat.accentStrong }}
      className={cn(
        "block w-full truncate rounded-[7px] border-l-[3px] px-1.5 py-0.5 text-[11px] leading-[1.3] font-medium",
        item.done
          ? "text-[color:var(--planner-text-muted)] line-through opacity-55"
          : "text-[color:var(--planner-text-primary)]",
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
// Snap keo-tha/keo-gian ve moc 15 phut - vua du nho de linh hoat, vua du lon
// de khong "run tay" bam trung dung phut le vo nghia.
const DRAG_SNAP_MINUTES = 15;
const DRAG_SNAP_PX = (HOUR_ROW_HEIGHT * DRAG_SNAP_MINUTES) / 60;

function TimedItemChip({
  item,
  top,
  height,
  left,
  width,
  clipPath,
  contentLeftPercent,
  contentWidthPercent,
  conflict,
  conflictWith,
  selected,
  onSelect,
  onUpdateTime,
  isToday,
  nowMinute,
}: {
  item: ApiPlannerItem;
  top: number;
  height: number;
  left: string;
  width: string;
  // [2026-10-06] "Example 2" (spec Overlapping Event Layout) - item co nhieu
  // "doan" be rong khac nhau theo tung khoang thoi gian (full width luc
  // khong ai chen, hep lai dung luc bi chen) - xem comment day du o
  // layoutTimedItems()/TimedLayoutEntry. undefined = hinh chu nhat don
  // gian, khong can clip.
  clipPath: string | undefined;
  // Vi tri/do rong vung THAT SU hien noi dung (doan DAU TIEN/tren cung cua
  // item) - % cua CHINH hop ngoai (left/width o tren), KHAC voi 0%/100% mac
  // dinh khi hop ngoai RONG HON doan dau (item hep luc dau, no rong ra sau).
  contentLeftPercent: number;
  contentWidthPercent: number;
  // [2026-10-06] True khi item nay BI CHIA COT (that su trung gio voi item
  // khac) VA khong co Event nao trong nhom trung gio do - xem comment day du
  // o layoutTimedItems(). Event trung gio la BINH THUONG (lich hen, hien
  // canh nhau la dung y), Action/Habit/Reflection trung gio nhieu kha nang
  // la LICH CHUA HOP LY - hien 1 dau "⚠" nho de nguoi dung de y, thay vi am
  // tham chia doi nhu khong co gi.
  conflict: boolean;
  // Cac item KHAC dang trung lich voi item nay - de liet ke RO trong popover
  // canh bao (xem comment TimedLayoutEntry.conflictWith).
  conflictWith: (ApiPlannerItem & { scheduledMinute: number })[];
  selected: boolean;
  onSelect: () => void;
  onUpdateTime: (newStart: number, newDuration: number) => void;
  isToday: boolean;
  nowMinute: number;
}) {
  const cat = useLifeItemPalette(item.itemType);
  const status = computeItemStatus(item, isToday, nowMinute);
  // [2026-10-05] Keo-tha de doi gio bat dau (keo than the) / keo canh duoi
  // de doi thoi luong (keo tay cam rieng) - yeu cau nguoi dung: "Kéo thả để
  // thay đổi thời gian... Resize... Không cần mở Edit". `drag` null = khong
  // dang keo (dung top/height tu props, TINH TU du lieu THAT tren server);
  // khi dang keo, hien thi theo `drag.deltaPx` (preview CUC BO, CHUA luu) -
  // chi goi onUpdateTime (API that) LUC THA chuot (mouseup), khong goi lien
  // tuc theo tung pixel di chuyen.
  const [drag, setDrag] = useState<{
    mode: "move" | "resize";
    deltaPx: number;
  } | null>(null);
  // [2026-10-06] Popover canh bao trung lich - yeu cau nguoi dung: trien
  // khai tiep "[Keep both] [Reschedule]" trong spec goc. "Giữ cả hai" chi
  // dong popover (2 viec van hien thi canh nhau nhu binh thuong, khong can
  // hanh dong gi them). "Đổi giờ" goi THANG `onSelect()` (CUNG callback nut
  // chinh dang dung) - chon + chuyen panel ben phai sang dung ngay nay, noi
  // nguoi dung co the bam but chi/sua gio ngay tai do (tai dung luong "Sửa
  // ngay trong dòng" da co san, khong mo 1 modal rieng).
  const [conflictOpen, setConflictOpen] = useState(false);
  // Ban SONG SONG voi `drag` state (doc duoc NGAY lap tuc trong onUp, khong
  // can qua updater function cua setState - xem comment chi tiet trong
  // startDrag ben duoi).
  const dragRef = useRef<{ mode: "move" | "resize"; deltaPx: number } | null>(
    null,
  );
  const suppressClickRef = useRef(false);

  const displayTop = drag?.mode === "move" ? top + drag.deltaPx : top;
  const displayHeight =
    drag?.mode === "resize"
      ? Math.max(DRAG_SNAP_PX, height + drag.deltaPx)
      : height;
  const liveStart = Math.round((displayTop / HOUR_ROW_HEIGHT) * 60);
  const liveDuration = Math.round((displayHeight / HOUR_ROW_HEIGHT) * 60);
  const compact = displayHeight < 40;
  const timeLabel = drag
    ? `${minutesToLabel(liveStart)} — ${minutesToLabel(liveStart + liveDuration)}`
    : `${minutesToLabel(item.scheduledMinute ?? 0)} — ${minutesToLabel(itemEndMinute(item))}`;

  function startDrag(e: React.MouseEvent, mode: "move" | "resize") {
    if (e.button !== 0) return; // chi chuot trai
    e.preventDefault();
    e.stopPropagation();
    const startClientY = e.clientY;
    const initial = { mode, deltaPx: 0 };
    dragRef.current = initial;
    setDrag(initial);

    function onMove(ev: MouseEvent) {
      const raw = ev.clientY - startClientY;
      const snapped = Math.round(raw / DRAG_SNAP_PX) * DRAG_SNAP_PX;
      if (Math.abs(snapped) >= DRAG_SNAP_PX) suppressClickRef.current = true;
      const next = { mode, deltaPx: snapped };
      dragRef.current = next;
      setDrag(next);
    }
    // [2026-10-05] Doc dragRef.current (BIEN THUONG, khong phai updater
    // function cua setDrag) de lay gia tri CUOI CUNG - bug phat hien qua
    // test luong tuong tac that: ban truoc goi onUpdateTime(...) (set-state
    // cua PlannerShell, component CHA) NGAY BEN TRONG ham updater truyen cho
    // setDrag(d => {...}), React canh bao that su trong console: "Cannot
    // update a component (PlannerShell) while rendering a different
    // component (TimedItemChip)" - updater function cua setState PHAI la
    // PURE (chi tinh state moi TU state cu), goi mot setState KHAC (cua
    // component cha) o giua lam viec do la tac dung phu trai quy tac. Sua
    // bang cach tach rieng: onUpdateTime goi SAU, NGOAI setDrag, truc tiep
    // trong onUp (1 DOM event handler binh thuong, khong phai updater).
    function onUp() {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      const final = dragRef.current;
      dragRef.current = null;
      setDrag(null);
      if (final && final.deltaPx !== 0) {
        const currentStart = item.scheduledMinute ?? 0;
        const currentDuration = itemEndMinute(item) - currentStart;
        const deltaMinutes = Math.round((final.deltaPx / HOUR_ROW_HEIGHT) * 60);
        if (final.mode === "move") {
          const newStart = Math.min(
            Math.max(currentStart + deltaMinutes, 0),
            24 * 60 - DRAG_SNAP_MINUTES,
          );
          onUpdateTime(newStart, currentDuration);
        } else {
          const newDuration = Math.min(
            Math.max(currentDuration + deltaMinutes, DRAG_SNAP_MINUTES),
            24 * 60 - currentStart,
          );
          onUpdateTime(currentStart, newDuration);
        }
      }
    }
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }

  return (
    <button
      type="button"
      onMouseDown={(e) => startDrag(e, "move")}
      onClick={() => {
        if (suppressClickRef.current) {
          suppressClickRef.current = false;
          return;
        }
        onSelect();
      }}
      title={conflict ? `⚠ Trùng lịch · ${timeLabel} · ${item.title}` : `${timeLabel} · ${item.title}`}
      style={{
        // [2026-10-06] +1/-2 - chua 1 khoang cach nho (~2px) giua 2 task SAT
        // GIO nhau (vd task A ket thuc 11:00, task B bat dau 11:00) - yeu
        // cau nguoi dung: "vị trí các task sát giờ nhau cả trên và dưới cũng
        // nên có khoảng cách một chút". Khong anh huong logic tinh gio that
        // (displayTop/displayHeight goc van dung de tinh liveStart/liveDuration
        // o tren) - chi la 1 khoang hut nho THUAN VISUAL luc ve.
        top: displayTop + 1,
        height: Math.max(displayHeight - 2, 18),
        left,
        width,
        // [2026-10-06] clipPath - "Example 2" (Overlapping Event Layout):
        // hop chu nhat NGOAI CUNG (left/width o tren) la hop BAO cua tat ca
        // "doan" cua item (xem TimedLayoutEntry) - clip-path "khoet" bot cac
        // doan HEP HON hop bao, tao hinh "bac thang" (full width luc khong
        // ai chen, hep lai dung luc bi chen) thay vi 1 be rong CO DINH suot
        // thoi luong. undefined (truong hop pho bien - khong trung gio, hoac
        // trung gio ON DINH) = khong clip, 1 hinh chu nhat don gian nhu cu.
        clipPath,
        // accentSoft (truoc accentLight) - xem comment day du o AllDayItemChip,
        // cung ly do: accentLight qua nhat, nhin gan nhu trang tren luoi gio.
        backgroundColor: cat.accentSoft,
        boxShadow: selected
          ? `0 0 0 2px white, 0 0 0 3px ${cat.accentStrong}`
          : undefined,
      }}
      className={cn(
        "group absolute z-[1] overflow-hidden rounded-sm text-left transition-[filter,box-shadow] duration-150 ease-out hover:z-[2] hover:brightness-95 hover:shadow-[0_2px_6px_rgba(20,30,50,.08)]",
        drag
          ? "z-[3] cursor-grabbing shadow-[0_4px_12px_rgba(20,30,50,.15)]"
          : "cursor-grab",
        item.done && "opacity-55",
      )}
    >
      {/* [2026-10-06] Wrapper noi dung RIENG (truoc day padding/flex nam
          thang tren <button> cha) - yeu cau nguoi dung: trien khai tiep
          "Example 2". Khi co clip-path, hop NGOAI CUNG co the RONG HON
          doan DAU TIEN (tren cung) cua item - noi dung (icon/gio/tieu de)
          PHAI dinh vi THEO DUNG doan dau do (contentLeftPercent/Width, xem
          TimedLayoutEntry), khong phai dan ra het ca hop ngoai, neu khong
          se "nhay" sang vung da bi clip khoet mat o doan sau. left/width
          mac dinh 0%/100% (truong hop khong clip) = y het hanh vi cu. */}
      <div
        className="absolute inset-y-0 flex flex-col items-start justify-start overflow-hidden pt-1 pr-1.5 pl-3"
        style={{ left: `${contentLeftPercent}%`, width: `${contentWidthPercent}%` }}
      >
        {/* Thanh mau accent - NAM BEN TRONG the (khong con la border), cach le
            trai 3px. top/bottom 4px - 1 "vien" nho tren/duoi cho thanh khong
            cham sat mep the, giong 1 vien tron doc dang "status bar" thu nho. */}
        <div
          className="absolute top-1 bottom-1 left-[3px] w-[3px] rounded-full"
          style={{ backgroundColor: cat.accentStrong }}
          aria-hidden="true"
        />
        {compact ? (
          <span className="flex items-center gap-1 truncate">
            {status === "current" && (
              <span
                className="size-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: cat.accentStrong }}
                aria-hidden="true"
              />
            )}
            <span
              className="shrink-0 text-[10px] font-medium"
              style={{ color: cat.accentStrong }}
            >
              {minutesToLabel(drag ? liveStart : (item.scheduledMinute ?? 0))}
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
            {/* [2026-10-06] Tieu de LEN TRUOC, gio XUONG DUOI (truoc day nguoc
                lai) - yeu cau nguoi dung: "Đổi vị trí thời gian xuống dưới
                title". */}
            {/* [2026-10-06] text-black/75 (truoc day 1 mau co dinh
                --planner-text-primary) - yeu cau nguoi dung: "tên task để
                black 75% để ăn được một chút màu chủ đạo của task ở nền". Chu
                KHONG con 100% den tuyet doi - nen (cat.pastel) lo qua duoc 25%
                con lai, chu tu "nhuom" nhe theo dung mau chu dao cua tung task,
                khong can tinh rieng 1 mau chu cho tung category. */}
            {/* w-full + pr-3.5 - yeu cau nguoi dung: "tên task không để full,
                để cách lề phải 20px và dùng ...". 2 bug lien quan: (1) truoc
                day KHONG co w-full - tu luc doi parent sang items-start (thay
                stretch mac dinh) de can noi dung LEN TREN, span nay mat luon
                rang buoc chieu rong, chu tran het ra ngoai roi bi <button>
                overflow-hidden CAT CUNG (khong co dau "..."). w-full ep span
                lai LUON rong = het hang, de truncate (da co san) hoat dong
                dung (ellipsis that). (2) pr-3.5 (14px) CONG them pr-1.5 (6px)
                co san tren <button> cha = dung 20px cach le phai THAT cua the. */}
            <span
              className={cn(
                "w-full truncate pr-3.5 text-[12px] font-semibold text-black/75",
                item.done && "line-through",
              )}
            >
              {item.title}
            </span>
            {/* [2026-10-05] truncate THEM VAO (truoc day thieu) - bug phat
                hien qua kiem tra o be rong man hinh "vua du" 3 cot (khoang
                1024-1279px, xem comment xl: o PlannerShell goc): cot moi ngay
                luc do RAT HEP, dong gio "09:00 — 10:00" khong du cho tren 1
                dong, bi overflow-hidden cua the cha (button bao ngoai) CAT
                THANG giua chung so (hien "09:0" thay vi "09:00"). `truncate`
                o day dam bao NEU khong du cho thi cat gon + "…" o CUOI, khong
                bao gio cat GIUA 1 con so/tu nhu truoc. */}
            <span
              className="mt-0.5 flex w-full items-center gap-1 truncate text-[10px] font-medium"
              style={{ color: cat.accentStrong }}
            >
              {status === "current" && (
                <span
                  className="size-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: cat.accentStrong }}
                  aria-hidden="true"
                />
              )}
              {/* Icon dong ho truoc dau thoi gian - yeu cau nguoi dung: "Dấu
                  thời gian bổ sung thêm icon clock". */}
              <Clock size={10} strokeWidth={2.2} className="shrink-0" aria-hidden="true" />
              {/* min-w-0 + flex-1 (KHONG phai w-full) - day la 1 hang flex
                  CHUNG voi icon Clock (shrink-0), flex-1 moi la cach dung de
                  "chiem het khong gian CON LAI sau icon roi tu co lai cho
                  truncate", w-full se bi tinh sai (100% ca hang, cong them be
                  rong icon se TRAN hang). min-w-0 can thiet vi flex item mac
                  dinh co min-width:auto (= rong bang NOI DUNG, khong bao gio
                  co lai duoc du co flex-1), chan truncate hoat dong. */}
              <span className="min-w-0 flex-1 truncate pr-3.5">{timeLabel}</span>
            </span>
          </>
        )}
      </div>
      {/* [2026-10-06] Dau "⚠" trung lich - xem comment prop `conflict` o tren
          (chi hien khi THAT SU bi chia cot VA khong co Event nao trong nhom
          trung gio - "cảnh báo conflict thay vì âm thầm chia đôi"). Goc tren-
          phai, khong chiem cho noi dung ben trong.
          [2026-10-06] Nang cap thanh popover tuong tac theo yeu cau nguoi
          dung (spec goc: nut "[Keep both] [Reschedule]") - dung <span
          role="button"> (khong phai <button>) vi the NGOAI CUNG da la
          <button>, long button trong button la HTML khong hop le. stopPro-
          pagation ca onClick VA onMouseDown de khong "chay len" kich hoat
          onSelect/keo-tha cua the cha. */}
      {conflict && (
        <PopoverRoot open={conflictOpen} onOpenChange={setConflictOpen}>
          <PopoverTrigger asChild>
            <span
              role="button"
              tabIndex={0}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") e.stopPropagation();
              }}
              className="absolute top-0.5 right-0.5 z-[2] cursor-pointer text-[10px] leading-none"
              title="Trùng lịch với việc khác"
            >
              ⚠
            </span>
          </PopoverTrigger>
          <PopoverContent
            open={conflictOpen}
            align="end"
            onOpenAutoFocus={(e) => e.preventDefault()}
            className="z-50 w-64 rounded-[10px] border border-[color:var(--planner-border)] bg-white p-3 shadow-[0_8px_24px_rgba(20,30,50,.12)]"
          >
            <p className="mb-1.5 flex items-center gap-1 text-[12.5px] font-semibold text-[color:var(--planner-text-primary)]">
              <span aria-hidden="true">⚠</span> Trùng lịch
            </p>
            <p className="mb-2 text-[12px] leading-snug text-[color:var(--planner-text-secondary)]">
              Việc này trùng giờ với:
            </p>
            <ul className="mb-3 flex flex-col gap-1.5">
              {conflictWith.map((other) => (
                <li
                  key={other.id}
                  className="truncate rounded-[6px] bg-[color:var(--planner-surface-muted)] px-2 py-1 text-[12px] text-[color:var(--planner-text-primary)]"
                >
                  <span className="font-medium">{other.title}</span>{" "}
                  <span className="text-[color:var(--planner-text-muted)]">
                    · {minutesToLabel(other.scheduledMinute)} — {minutesToLabel(itemEndMinute(other))}
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <PopoverClose asChild>
                <button
                  type="button"
                  className="flex-1 cursor-pointer rounded-[6px] border border-[color:var(--planner-border)] px-2 py-1.5 text-[12px] font-medium text-[color:var(--planner-text-secondary)] transition-colors duration-150 ease-out hover:bg-[color:var(--planner-surface-muted)]"
                >
                  Giữ cả hai
                </button>
              </PopoverClose>
              <PopoverClose asChild>
                <button
                  type="button"
                  onClick={() => onSelect()}
                  className="flex-1 cursor-pointer rounded-[6px] px-2 py-1.5 text-[12px] font-medium text-white transition-colors duration-150 ease-out"
                  style={{ backgroundColor: cat.accentStrong }}
                >
                  Đổi giờ
                </button>
              </PopoverClose>
            </div>
          </PopoverContent>
        </PopoverRoot>
      )}
      {/* [2026-10-05] Tay cam resize - keo rieng canh nay de doi THOI LUONG
          (giu nguyen gio bat dau), khac keo THAN the (doi gio bat dau, giu
          nguyen thoi luong). stopPropagation trong startDrag ngan event
          "chay len" <button> cha (tranh kich hoat CA 2 kieu keo cung luc).
          [2026-10-06] BO thanh mau hien ra luc hover (opacity-0/group-hover/
          backgroundColor truoc day) - yeu cau nguoi dung: "Bỏ cái hover thì
          hiện border bottom đi". Vung keo VAN con (cursor-ns-resize + hit-area
          cao 6px o canh duoi), chi khong con VE gi len - nguoi dung van resize
          duoc binh thuong, chi khong thay 1 thanh mau/vien lung linh khi di
          chuot qua nua. */}
      <div
        onMouseDown={(e) => startDrag(e, "resize")}
        className="absolute inset-x-0 bottom-0 h-1.5 cursor-ns-resize"
        aria-hidden="true"
      />
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
// [2026-10-06] Chu thich vong mau Type - yeu cau nguoi dung: "nó ở ngay dưới
// phần head của lịch... khi scroll lịch thì nó sticky ở đầu" - nam NGAY
// TRONG header cua WeekTimeGrid (duoi hang "Cả ngày", xem noi goi), KHONG
// con la 1 the rieng dung ben ngoai calendar card nhu ban dau - vi vay o day
// CHI con la 1 hang flex THUAN (khong tu ve border/bg/shadow rieng nua, de
// wrapper cha o WeekTimeGrid lo phan border-t/padding, tranh "the long trong
// the"). 4 vong tron mau accentStrong (cung 1 mau dung lam thanh/cham trong
// TimedItemChip/TimelineRow) + nhan Type - giup nguoi dung "ngam" dan mau
// nao la Type nao MA KHONG CAN doc het chu (dung y section 19 cua spec
// "Người dùng không cần đọc toàn bộ text").
// [2026-10-06] Tooltip RIENG (khong dung `title` native) - yeu cau nguoi
// dung: "khi hover vào sẽ hiện tooltip custom show full, tooltip tự làm
// nhé, dùng tooltip hệ thống xấu với chậm". CSS-only (group-hover + opacity/
// scale transition, KHONG can JS do vi tri/do tran) - du cho 1 nhan ngan
// trong legend, khong can toi logic dinh vi phuc tap nhu popover.
function LegendTooltip({ text }: { text: string }) {
  // top-full (khong phai bottom-full) - legend nam SAT phia tren cua
  // calendar card (co overflow-hidden, xem WeekTimeGrid), bat tooltip NOI
  // LEN TREN se de bi CAT MAT (khong du khong gian). Tooltip XUONG DUOI
  // luon an toan (ca khoang luoi gio rong o duoi).
  return (
    <span
      role="tooltip"
      className="pointer-events-none absolute top-full left-1/2 z-20 mt-1.5 -translate-x-1/2 scale-95 rounded-[6px] bg-[#1f2430] px-2 py-1 text-[11px] font-medium whitespace-nowrap text-white opacity-0 shadow-lg transition-[opacity,transform] duration-150 ease-out group-hover:scale-100 group-hover:opacity-100"
    >
      {text}
    </span>
  );
}

function TypeLegend({ overrides }: { overrides: Partial<Record<LifeItemType, string>> }) {
  return (
    // [2026-10-06] yeu cau nguoi dung: "không phải chia nửa 50 50... mỗi cột
    // 240px, dồn về trái... tổng chiều ngang vẫn bình thường, nếu tràn thì
    // scroll ngang". overflow-x-auto BOC NGOAI (truot ngang khi khong du
    // cho, KHONG bop nho/xuong dong) + grid-cols BANG PX CO DINH (240px,
    // khong phai 1fr - 1fr se tu CAN GIUA/gian deu theo be rong khung nhu
    // truoc, px co dinh thi MOI cot tu nhien chi rong DUNG 240px, noi dung
    // ben trong dong tu nhien ve TRAI, khong bi "keo gian" ra giua).
    <div className="overflow-x-auto">
      <div className="grid w-fit grid-cols-[240px_240px] gap-x-6 gap-y-2.5">
        {LIFE_ITEM_TYPES.map((t) => {
          const palette = resolveLifeItemPalette(t.id, overrides);
          const fullLabel = `${t.label} · ${t.verb}`;
          return (
            <span key={t.id} className="group relative flex min-w-0 items-center gap-1.5 text-[12px] font-medium text-[color:var(--planner-text-secondary)]">
              {/* Vien mau (khong phai cham DAC) - size-3.5. */}
              <span
                className="size-3.5 shrink-0 rounded-full border-2"
                style={{ borderColor: palette.accentStrong }}
                aria-hidden="true"
              />
              {/* truncate + "…" khi ten dai vuot qua 240px (tru phan cham
                  mau+gap) - hover vao hien LegendTooltip show full, KHONG
                  dung `title` native. */}
              <span className="min-w-0 truncate">
                {t.label} <span className="text-[color:var(--planner-text-muted)]">· {t.verb}</span>
              </span>
              <LegendTooltip text={fullLabel} />
            </span>
          );
        })}
      </div>
    </div>
  );
}

function WeekTimeGrid({
  anchor,
  selectedDate,
  itemsByDate,
  selectedItemId,
  onSelect,
  onSelectItem,
  onSlotClick,
  onUpdateItemTime,
  typeColorOverrides,
}: {
  anchor: string;
  selectedDate: string;
  itemsByDate: ItemsByDate;
  selectedItemId: string | null;
  onSelect: (date: string) => void;
  onSelectItem: (id: string) => void;
  onSlotClick: (minute: number) => void;
  onUpdateItemTime: (
    item: ApiPlannerItem,
    newStart: number,
    newDuration: number,
  ) => void;
  typeColorOverrides: Partial<Record<LifeItemType, string>>;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  // [2026-10-06] Do do rong THANH CUON that - yeu cau nguoi dung: "Phần bên
  // trên ngày cột cũng lệch không đúng thẳng nhau". Nguyen nhan: hang header
  // (ten thu/ngay + "Cả ngày") nam trong 1 wrapper KHONG cuon (shrink-0),
  // con luoi gio (body) nam trong div rieng co overflow-y-auto - tren Windows/
  // Linux (scrollbar CHIEM CHO THAT, khac macOS overlay), khi body du cao de
  // hien thanh cuon doc, be rong THAT SU danh cho 7 cot ngay trong body BI
  // HEP HON be rong 7 cot ngay o header (header KHONG bi thanh cuon an vao),
  // khien 2 hang header/body lech dan ve phia phai qua tung cot - chinh xac
  // trieu chung nguoi dung mo ta. Do offsetWidth-clientWidth cua CHINH scroll
  // container (0 neu trinh duyet dung overlay scrollbar nhu macOS) roi bu lai
  // bang padding-right TRONG header, dam bao 2 hang LUON cung 1 be rong noi
  // dung du scrollbar co chiem cho hay khong.
  const [scrollbarWidth, setScrollbarWidth] = useState(0);
  useEffect(() => {
    function measure() {
      if (scrollRef.current) {
        setScrollbarWidth(scrollRef.current.offsetWidth - scrollRef.current.clientWidth);
      }
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  });
  const days = Array.from({ length: 7 }, (_, i) =>
    addDays(startOfWeek(anchor), i),
  );
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
      <div
        className="shrink-0 border-b border-[color:var(--planner-border-soft)]"
        style={{ paddingRight: scrollbarWidth }}
      >
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
            const allDay = (itemsByDate[d] ?? []).filter(
              (it) => it.scheduledMinute === null,
            );
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
        {/* [2026-10-06] Chu thich vong mau Type - yeu cau nguoi dung: "nó ở
            ngay dưới phần head của lịch... khi scroll lịch thì nó sticky ở
            đầu". Dat NGAY TRONG wrapper header `shrink-0` o tren (KHONG phai
            trong vung overflow-y-auto ben duoi) - header nay von da KHONG
            cuon theo luoi gio (scrollRef chi boc rieng phan luoi gio), nen
            chi can nam trong day la TU DONG "dinh" o tren khi cuon, khong
            can them CSS `sticky` nao ca. */}
        <div className="border-t border-[color:var(--planner-border-soft)] px-3 py-2">
          <TypeLegend overrides={typeColorOverrides} />
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
                className="relative border-t border-[color:var(--planner-grid-line)]"
              >
                {/* top-0 + -translate-y-1/2 (KHONG phai -top-2 doan truoc) -
                    yeu cau nguoi dung: "không được để sai từng giây một".
                    -top-2 la 1 con so DOAN (8px) co the LECH tuy font-size/
                    line-height thuc te render - top-0 neo DUNG vao gioi han
                    tren cua chinh o gio (dung bang border-t cua o ben duoi,
                    CUNG toa do voi top cua TimedItemChip vi ca 2 deu tinh tu
                    `h * HOUR_ROW_HEIGHT`), -translate-y-1/2 can giua nhan
                    text LEN CHINH XAC giua duong ke do - dung toan hoc (50%
                    chieu cao THAT cua chinh span, khong phai so doan), luon
                    dung bat ke co chu/line-height the nao. */}
                {h > 0 && (
                  <span className="absolute top-0 right-1.5 -translate-y-1/2 text-[11px] font-medium text-[color:var(--planner-text-muted)]">
                    {h.toString().padStart(2, "0")}:00
                  </span>
                )}
              </div>
            ))}
          </div>
          {days.map((d) => {
            const timed = (itemsByDate[d] ?? []).filter(
              (it): it is ApiPlannerItem & { scheduledMinute: number } =>
                it.scheduledMinute !== null,
            );
            const laidOut = layoutTimedItems(timed);
            const isToday = d === today;
            return (
              <div
                key={d}
                className="relative border-l border-[color:var(--planner-grid-line)]"
                style={
                  isToday
                    ? {
                        height: HOUR_ROW_HEIGHT * 24,
                        backgroundImage:
                          "linear-gradient(180deg, #f7f9ff 0%, #fbfcff 100%)",
                      }
                    : { height: HOUR_ROW_HEIGHT * 24 }
                }
              >
                {/* [2026-10-05] Click 1 o gio TRONG - yeu cau nguoi dung
                    (state #6): "Click vào khoảng trống → mở Add Task, giờ
                    điền sẵn". onSlotClick CHI luu phut (h*60) - ngay da duoc
                    chon dung qua onSelect(d) o CUNG 1 lan click. */}
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className="cursor-pointer border-t border-[color:var(--planner-grid-line)] hover:bg-[var(--planner-surface-soft)]"
                    style={{ height: HOUR_ROW_HEIGHT }}
                    onClick={() => {
                      onSelect(d);
                      onSlotClick(h * 60);
                    }}
                  />
                ))}
                {laidOut.map(
                  ({
                    item,
                    leftPercent,
                    widthPercent,
                    clipPath,
                    contentLeftPercent,
                    contentWidthPercent,
                    conflict,
                    conflictWith,
                  }) => (
                    <TimedItemChip
                      key={item.id}
                      item={item}
                      top={(item.scheduledMinute / 60) * HOUR_ROW_HEIGHT}
                      height={
                        ((itemEndMinute(item) - item.scheduledMinute) / 60) *
                        HOUR_ROW_HEIGHT
                      }
                      left={`calc(${leftPercent}% + 2px)`}
                      width={`calc(${widthPercent}% - 4px)`}
                      clipPath={clipPath}
                      contentLeftPercent={contentLeftPercent}
                      contentWidthPercent={contentWidthPercent}
                      conflict={conflict}
                      conflictWith={conflictWith}
                      selected={selectedItemId === item.id}
                      onSelect={() => {
                        onSelect(d);
                        onSelectItem(item.id);
                      }}
                      onUpdateTime={(newStart, newDuration) =>
                        onUpdateItemTime(item, newStart, newDuration)
                      }
                      isToday={isToday}
                      nowMinute={nowMinute}
                    />
                  ),
                )}
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
    ...Array.from({ length: totalDaysInMonth }, (_, i) =>
      addDays(monthStart, i),
    ),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="grid grid-cols-7 gap-1.5">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="py-1 text-center text-[11px] font-medium text-[color:var(--planner-text-muted)]"
          >
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
                    d === today
                      ? "text-[color:var(--planner-primary)]"
                      : "text-[color:var(--planner-text-primary)]",
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
function ProgressRing({
  pct,
  size = 56,
  stroke = 5,
}: {
  pct: number;
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (Math.min(100, Math.max(0, pct)) / 100) * c;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="-rotate-90"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--planner-border-soft)"
        strokeWidth={stroke}
      />
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
  const plannedMinutes = timedItems.reduce(
    (sum, i) => sum + (i.durationMinutes ?? DEFAULT_DURATION_MINUTES),
    0,
  );
  const doneMinutes = timedItems
    .filter((i) => i.done)
    .reduce(
      (sum, i) => sum + (i.durationMinutes ?? DEFAULT_DURATION_MINUTES),
      0,
    );

  if (total === 0) return null;

  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-[11px] font-semibold tracking-[.04em] text-[color:var(--planner-text-muted)] uppercase">
        Today&apos;s progress
      </p>
      <div className="flex items-center gap-3.5">
        <div className="relative flex shrink-0 items-center justify-center">
          <ProgressRing pct={pct} />
          <span className="absolute text-[13px] font-bold text-[color:var(--planner-text-primary)]">
            {pct}%
          </span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <p className="text-[12.5px] font-medium text-[color:var(--planner-text-secondary)]">
            {done} / {total} tasks completed
          </p>
          {plannedMinutes > 0 && (
            <>
              <p className="text-[11px] text-[color:var(--planner-text-muted)]">
                {formatHoursMinutes(doneMinutes)} /{" "}
                {formatHoursMinutes(plannedMinutes)}
              </p>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[color:var(--planner-border-soft)]">
                <div
                  className="h-full rounded-full bg-[color:var(--planner-primary)] transition-[width] duration-300 ease-out"
                  style={{
                    width: `${plannedMinutes ? Math.min(100, (doneMinutes / plannedMinutes) * 100) : 0}%`,
                  }}
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
  const cat = useLifeItemPalette(item.itemType);
  const typeCfg = getLifeItemTypeConfig(item.itemType);
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[11px] font-semibold tracking-[.04em] text-[color:var(--planner-text-muted)] uppercase">
        Today&apos;s focus
      </p>
      <div
        style={{ backgroundColor: cat.accentSoft, borderColor: cat.accentStrong + "40" }}
        className="flex flex-col gap-2 rounded-[12px] border p-3"
      >
        <div className="flex items-center justify-between gap-2">
          <span
            style={{ color: cat.accentStrong }}
            className="rounded-full bg-white/70 px-2 py-0.5 text-[10.5px] font-semibold"
          >
            {typeCfg.icon} {typeCfg.label}
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
          <p className="text-[12px] font-medium" style={{ color: cat.accentStrong }}>
            {minutesToLabel(item.scheduledMinute)} —{" "}
            {minutesToLabel(itemEndMinute(item))}
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
  onEdit,
}: {
  item: ApiPlannerItem;
  status: ItemStatus;
  selected: boolean;
  onSelect: () => void;
  onToggleDone: () => void;
  onDelete: () => void;
  onEdit: () => void;
}) {
  const cat = useLifeItemPalette(item.itemType);
  const typeCfg = getLifeItemTypeConfig(item.itemType);
  return (
    <div className="relative flex gap-2.5 pl-0.5">
      {/* Dot trang thai - noi voi duong connector cua ca danh sach (border-l
          cua UL cha). [2026-10-06] CHI Action (typeCfg.hasCheckbox) moi dung
          dot trang thai done/current/upcoming - Event/Habit/Reflection hien
          THANG icon rieng cua Type (◇/↻/✦, section 4-6: "Event → Không cần
          checkbox. Bạn Attend nó."), khong co khai niem "done" o day. */}
      <div className="relative z-[1] mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-white">
        {!typeCfg.hasCheckbox ? (
          <span className="text-[11px] leading-none" style={{ color: cat.accentStrong }}>
            {typeCfg.icon}
          </span>
        ) : status === "done" ? (
          <CheckCircle2
            size={16}
            className="text-[color:var(--planner-primary)]"
          />
        ) : status === "current" ? (
          <span
            className="size-2.5 rounded-full"
            style={{ backgroundColor: cat.accentStrong }}
          />
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
        style={
          selected ? { boxShadow: `0 0 0 1.5px ${cat.accentStrong}` } : undefined
        }
        className={cn(
          "flex min-w-0 flex-1 cursor-pointer items-start justify-between gap-2 rounded-[10px] px-2 py-1.5 text-left transition-colors duration-150 ease-out hover:bg-[var(--planner-surface-soft)]",
          status === "current" && "bg-[var(--planner-primary-soft)]",
        )}
      >
        <div className="flex min-w-0 flex-col gap-0.5">
          {item.scheduledMinute !== null && (
            <span
              className="text-[11px] font-medium"
              style={{ color: cat.accentStrong }}
            >
              {minutesToLabel(item.scheduledMinute)} —{" "}
              {minutesToLabel(itemEndMinute(item))}
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
          {/* Checkbox CHI cho Action (hasCheckbox) - Event/Habit/Reflection
              khong co khai niem "done" theo spec. */}
          {typeCfg.hasCheckbox && (
            <input
              type="checkbox"
              checked={item.done}
              onClick={(e) => e.stopPropagation()}
              onChange={onToggleDone}
              className="size-3.5 cursor-pointer accent-[color:var(--planner-primary)]"
            />
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="cursor-pointer rounded-md p-1 text-[color:var(--planner-text-muted)] hover:bg-white hover:text-[color:var(--planner-primary)]"
            aria-label="Sửa"
          >
            <Pencil size={12} />
          </button>
          <DeleteConfirmButton label={item.title} onConfirm={onDelete} />
        </div>
      </div>
    </div>
  );
}

// [2026-10-05] Xac nhan TRUOC KHI xoa that su - yeu cau nguoi dung (state
// #9): "Destructive action cần confirmation" - truoc day bam Xoá la MAT
// NGAY khong hoi lai. Dung popover nho (tai dung PopoverRoot/Content da co
// san, cung ky thuat voi Filters) neo DUNG vao nut Xoa thay vi 1 modal toan
// man hinh rieng - gon hon, khong can them 1 he thong Dialog/overlay moi
// cho CHI 1 cho dung.
function DeleteConfirmButton({
  label,
  onConfirm,
}: {
  label: string;
  onConfirm: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <PopoverRoot open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="cursor-pointer rounded-md p-1 text-[color:var(--planner-text-muted)] hover:bg-white hover:text-danger"
          aria-label="Xoá"
        >
          <Trash2 size={12} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        open={open}
        align="end"
        className="z-50 w-60 rounded-[10px] border border-[color:var(--planner-border)] bg-white p-3 shadow-[0_8px_24px_rgba(20,30,50,.1)]"
      >
        <div onClick={(e) => e.stopPropagation()}>
          <p className="text-[13px] font-semibold text-[color:var(--planner-text-primary)]">
            Xoá công việc?
          </p>
          <p className="mt-0.5 text-[12px] text-[color:var(--planner-text-muted)]">
            Bạn có chắc muốn xoá &quot;{label}&quot;? Hành động này không thể
            hoàn tác.
          </p>
          <div className="mt-2.5 flex justify-end gap-1.5">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="h-7 cursor-pointer rounded-[8px] px-2.5 text-[12px] font-medium text-[color:var(--planner-text-muted)] hover:text-[color:var(--planner-text-secondary)]"
            >
              Huỷ
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onConfirm();
              }}
              className="h-7 cursor-pointer rounded-[8px] bg-danger px-2.5 text-[12px] font-semibold text-white hover:opacity-90"
            >
              Xoá
            </button>
          </div>
        </div>
      </PopoverContent>
    </PopoverRoot>
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
          item.done
            ? "text-[color:var(--planner-text-muted)] line-through"
            : "text-[color:var(--planner-text-primary)]",
        )}
      >
        {item.title}
      </span>
      <DeleteConfirmButton
        label={item.title}
        onConfirm={() => onDelete(item, parentId)}
      />
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
  onEdit,
}: {
  item: ApiPlannerItem;
  status: ItemStatus;
  selected: boolean;
  onSelect: () => void;
  onToggleDone: (item: ApiPlannerItem, parentId?: string) => void;
  onDelete: (item: ApiPlannerItem, parentId?: string) => void;
  onAddChild: (parentId: string, title: string) => void;
  onEdit: () => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [childDraft, setChildDraft] = useState("");
  const children = item.children ?? [];
  const cat = useLifeItemPalette(item.itemType);
  const typeCfg = getLifeItemTypeConfig(item.itemType);

  function submitChild() {
    const title = childDraft.trim();
    if (!title) return;
    setChildDraft("");
    onAddChild(item.id, title);
  }

  return (
    <div className="relative flex gap-2.5 pl-0.5">
      <div className="relative z-[1] mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-white">
        {!typeCfg.hasCheckbox ? (
          <span className="text-[11px] leading-none" style={{ color: cat.accentStrong }}>
            {typeCfg.icon}
          </span>
        ) : status === "done" ? (
          <CheckCircle2
            size={16}
            className="text-[color:var(--planner-primary)]"
          />
        ) : status === "current" ? (
          <span
            className="size-2.5 rounded-full"
            style={{ backgroundColor: cat.accentStrong }}
          />
        ) : (
          <Circle size={14} className="text-[color:var(--planner-border)]" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div
          onClick={onSelect}
          style={
            selected ? { boxShadow: `0 0 0 1.5px ${cat.accentStrong}` } : undefined
          }
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
            <ChevronDown
              size={14}
              className={cn(
                "transition-transform duration-150",
                !expanded && "-rotate-90",
              )}
            />
          </button>
          {typeCfg.hasCheckbox && (
            <input
              type="checkbox"
              checked={item.done}
              onClick={(e) => e.stopPropagation()}
              onChange={() => onToggleDone(item)}
              className="size-3.5 shrink-0 cursor-pointer accent-[color:var(--planner-primary)]"
            />
          )}
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
              onEdit();
            }}
            className="shrink-0 cursor-pointer rounded-md p-1 text-[color:var(--planner-text-muted)] hover:bg-white hover:text-[color:var(--planner-primary)]"
            aria-label="Sửa"
          >
            <Pencil size={13} />
          </button>
          <DeleteConfirmButton
            label={item.title}
            onConfirm={() => onDelete(item)}
          />
        </div>
        {expanded && (
          <div className="mt-1 ml-5 flex flex-col gap-0.5 border-l border-[color:var(--planner-border-soft)] pl-2.5">
            {children.map((child) => (
              <ItemRow
                key={child.id}
                item={child}
                parentId={item.id}
                onToggleDone={onToggleDone}
                onDelete={onDelete}
              />
            ))}
            <div className="flex items-center gap-1.5 py-1">
              <Plus
                size={12}
                className="shrink-0 text-[color:var(--planner-text-muted)]"
              />
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
        <CalendarDays
          size={22}
          strokeWidth={1.75}
          className="text-[color:var(--planner-primary)] opacity-70"
        />
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
// [2026-10-06] "Good Life" - hang 4 nut chon Type (section 2/18 "Step 1 -
// chọn Type"), dung CHUNG cho AddTaskForm + EditItemForm thay vi hang swatch
// mau tu do cu (PLANNER_COLORS) - mau GIO LA semantic theo Type, khong con
// chon tung mau rieng cho tung item.
// [2026-10-06] "User customization" (spec section 21) - popover doi CA 1
// "color family" cho 1 Type (khong cho chon tung mau rieng le icon/border/
// tag), luu qua PlannerTypeColor (backend). Trigger la 1 nut Palette nho o
// sidebar, dat CANH View Switcher.
function TypeColorSettings({
  overrides,
  onChange,
}: {
  overrides: Partial<Record<LifeItemType, string>>;
  onChange: (type: LifeItemType, paletteId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <PopoverRoot open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Tuỳ chỉnh màu Type"
          className="flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-left text-[13px] font-medium text-[color:var(--planner-text-muted)] transition-colors duration-150 ease-out hover:bg-white hover:text-[color:var(--planner-primary)]"
        >
          <Palette size={14} strokeWidth={2} /> Màu sắc
        </button>
      </PopoverTrigger>
      <PopoverContent
        open={open}
        align="start"
        className="z-50 w-72 rounded-[12px] border border-[color:var(--planner-border)] bg-white p-3 shadow-[0_8px_24px_rgba(20,30,50,.1)]"
      >
        <p className="mb-2 text-[13px] font-semibold text-[color:var(--planner-text-primary)]">
          Tuỳ chỉnh màu theo loại
        </p>
        <div className="flex flex-col gap-2.5">
          {LIFE_ITEM_TYPES.map((t) => {
            const current = overrides[t.id] ?? t.defaultPaletteId;
            return (
              <div key={t.id} className="flex flex-col gap-1">
                <span className="text-[11.5px] font-medium text-[color:var(--planner-text-secondary)]">
                  {t.icon} {t.label}
                </span>
                <div className="flex flex-wrap gap-1">
                  {LIFE_ITEM_PALETTES.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      title={p.name}
                      onClick={() => onChange(t.id, p.id)}
                      style={{ backgroundColor: p.accentStrong }}
                      className={cn(
                        "size-5 shrink-0 cursor-pointer rounded-full ring-1 ring-black/10 ring-offset-1 ring-offset-white transition-transform duration-150 ease-out hover:scale-110",
                        current === p.id && "outline-2 outline-offset-1 outline-[color:var(--planner-text-primary)]",
                      )}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </PopoverRoot>
  );
}

function TypePickerRow({ value, onChange }: { value: LifeItemType; onChange: (t: LifeItemType) => void }) {
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {LIFE_ITEM_TYPES.map((t) => {
        const palette = resolveLifeItemPalette(t.id);
        const selected = value === t.id;
        return (
          <button
            key={t.id}
            type="button"
            title={t.mentalModel}
            onClick={() => onChange(t.id)}
            style={{
              backgroundColor: selected ? palette.accentSoft : "white",
              borderColor: selected ? palette.accentStrong : "var(--planner-border-soft)",
              color: selected ? palette.accentText : "var(--planner-text-secondary)",
            }}
            className="flex cursor-pointer flex-col items-center gap-0.5 rounded-[9px] border py-1.5 text-[11px] font-semibold transition-colors duration-150 ease-out"
          >
            <span className="text-[13px] leading-none">{t.icon}</span>
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

// Hang chon Priority nhanh (section 9 - semantic RIENG, khong dung mau
// Type) - dung CHUNG cho AddTaskForm + EditItemForm.
function PriorityPickerRow({
  value,
  onChange,
}: {
  value: LifeItemPriority | null;
  onChange: (p: LifeItemPriority | null) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {(Object.keys(PRIORITY_CONFIG) as LifeItemPriority[]).map((p) => {
        const cfg = PRIORITY_CONFIG[p];
        const selected = value === p;
        return (
          <button
            key={p}
            type="button"
            onClick={() => onChange(selected ? null : p)}
            style={selected ? { borderColor: cfg.color, color: cfg.color, backgroundColor: cfg.color + "14" } : undefined}
            className="flex cursor-pointer items-center gap-1 rounded-full border border-[color:var(--planner-border-soft)] px-2 py-1 text-[11.5px] font-medium text-[color:var(--planner-text-secondary)]"
          >
            <span className="size-1.5 rounded-full" style={{ backgroundColor: cfg.color }} aria-hidden="true" />
            {cfg.label}
          </button>
        );
      })}
    </div>
  );
}

function AddTaskForm({
  onAddItem,
  prefillStart,
  onConsumePrefill,
}: {
  onAddItem: DayDetailPanelProps["onAddItem"];
  prefillStart: number | null;
  onConsumePrefill: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [draftKind, setDraftKind] = useState<PlannerItemKind>("SIMPLE");
  const [draftType, setDraftType] = useState<LifeItemType>("ACTION");
  const [draftStart, setDraftStart] = useState<number | null>(null);
  const [draftDuration, setDraftDuration] = useState(DEFAULT_DURATION_MINUTES);
  const [draftPriority, setDraftPriority] = useState<LifeItemPriority | null>(null);
  const [draftFocus, setDraftFocus] = useState(false);
  const [draftArea, setDraftArea] = useState("");
  const typeCfg = getLifeItemTypeConfig(draftType);
  const typePalette = resolveLifeItemPalette(draftType);

  // [2026-10-05] Click 1 o gio TRONG tren luoi tuan (state #6) - tu MO form
  // nay + dien san gio da click, thay vi nguoi dung phai tu bam "+ Thêm
  // việc" roi tu mo Time Picker chon lai. `onConsumePrefill()` dat prefill
  // ve null NGAY sau khi dung - tranh mo lai form 1 lan nua neu component
  // re-render vi ly do khac (vd nguoi dung tu dong Huỷ form).
  useEffect(() => {
    if (prefillStart === null) return;
    const t = setTimeout(() => {
      setOpen(true);
      setDraftStart(prefillStart);
      onConsumePrefill();
    }, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillStart]);

  function submit() {
    const title = draft.trim();
    if (!title) return;
    onAddItem({
      title,
      kind: draftKind,
      itemType: draftType,
      scheduledMinute: draftStart ?? undefined,
      durationMinutes: draftStart !== null ? draftDuration : undefined,
      isFocus: draftFocus || undefined,
      priority: draftPriority ?? undefined,
      area: draftArea.trim() || undefined,
    });
    setDraft("");
    setDraftStart(null);
    setDraftFocus(false);
    setDraftPriority(null);
    setDraftArea("");
    // [2026-10-05] setDraftKind("SIMPLE") - bug phat hien qua test luong
    // tuong tac: truoc day KHONG reset, nen sau khi tao 1 viec "Lớn", lan
    // THEM TIEP THEO (dung chung 1 instance AddTaskForm, state khong mat vi
    // chi dang/dong chu khong unmount) VAN giu nguyen "Lớn" du nguoi dung
    // khong chu dong chon lai - de nham tao hang loat viec "Lớn" rong khong
    // dinh. `draftType` thi CO Y giu lai qua cac lan Them lien tiep (nguoi
    // dung thuong them lien tuc nhieu viec CUNG 1 Type, vd nhieu Action lien
    // tiep) - chi "Lớn" la lua chon ÍT GẶP HON, nen luon ve mac dinh "Đơn"
    // sau moi lan them, cung tinh than voi draftFocus o tren.
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
    // [2026-10-06] Redesign - yeu cau nguoi dung: "Form tạo việc có mỗi input
    // quá sơ sài, đề xuất bổ sung, sửa lại UI/UX phần đó cho dễ nhìn, ưa nhìn
    // hơn". Doi nen xam phang (--planner-surface-soft) + vien mong sang NEN
    // TRANG + shadow ro + vien mau DUNG theo Type dang chon (typePalette,
    // "song" theo tung lan doi Type) - doc lap han khoi xung quanh thay vi
    // chi la 1 khoi mo rong mo nhat. Them header (icon + tieu de + nut dong)
    // + cac nhan section (uppercase, xam nhat) phan tach ro tung nhom, cung
    // tinh than AddNoteForm.tsx (Notes feature) da lam.
    <div
      className="flex flex-col gap-3 rounded-[12px] border bg-white p-3 shadow-[0_6px_20px_rgba(20,30,50,.08)]"
      style={{ borderColor: typePalette.accentBorder }}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-[13px] font-semibold text-[color:var(--planner-text-primary)]">
          <Sparkles size={13} style={{ color: typePalette.accentStrong }} />
          Thêm việc mới
        </p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Đóng"
          className="flex size-5 cursor-pointer items-center justify-center rounded text-[color:var(--planner-text-muted)] hover:bg-[var(--planner-surface-soft)]"
        >
          <X size={13} />
        </button>
      </div>

      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
          if (e.key === "Escape") setOpen(false);
        }}
        placeholder="Tên việc cần làm..."
        className="h-10 w-full rounded-[9px] border border-[color:var(--planner-border-soft)] bg-[var(--planner-surface-soft)] px-3 text-[14px] font-medium text-[color:var(--planner-text-primary)] outline-none placeholder:font-normal placeholder:text-[color:var(--planner-text-muted)] focus:border-[#b9c9ef] focus:bg-white focus:shadow-[0_0_0_3px_rgba(71,120,232,.08)]"
      />

      <div className="flex flex-col gap-1">
        <p className="text-[10.5px] font-semibold tracking-wide text-[color:var(--planner-text-muted)] uppercase">Loại việc</p>
        {/* [2026-10-06] Chon Type (section 2/18) - THAY THE hang swatch mau tu
            do cu, mau gio la semantic theo Type (xem TypePickerRow). */}
        <TypePickerRow value={draftType} onChange={setDraftType} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <p className="text-[10.5px] font-semibold tracking-wide text-[color:var(--planner-text-muted)] uppercase">Thời gian</p>
          <TimePickerField
            startMinute={draftStart}
            durationMinutes={draftDuration}
            onChange={(start, duration) => {
              setDraftStart(start);
              setDraftDuration(duration);
            }}
          />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-[10.5px] font-semibold tracking-wide text-[color:var(--planner-text-muted)] uppercase">Khu vực (tuỳ chọn)</p>
          <input
            value={draftArea}
            onChange={(e) => setDraftArea(e.target.value)}
            placeholder="vd: Learning"
            className="h-9 w-full rounded-[9px] border border-[color:var(--planner-border-soft)] bg-white px-2.5 text-[12.5px] text-[color:var(--planner-text-primary)] outline-none placeholder:text-[color:var(--planner-text-muted)] focus:border-[#b9c9ef]"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-[10.5px] font-semibold tracking-wide text-[color:var(--planner-text-muted)] uppercase">Mức độ ưu tiên (tuỳ chọn)</p>
        {/* Priority (section 9, semantic RIENG khong dung mau Type) - optional,
            khong bat buoc chon. */}
        <PriorityPickerRow value={draftPriority} onChange={setDraftPriority} />
      </div>

      <label
        className="flex cursor-pointer items-center gap-1.5 rounded-[9px] border border-dashed px-2.5 py-2 text-[12px] font-medium text-[color:var(--planner-text-secondary)] transition-colors duration-150 ease-out"
        style={draftFocus ? { borderColor: "#d97706", backgroundColor: "#fff7ed" } : { borderColor: "var(--planner-border-soft)" }}
      >
        <input
          type="checkbox"
          checked={draftFocus}
          onChange={(e) => setDraftFocus(e.target.checked)}
          className="size-3.5 cursor-pointer accent-[#d97706]"
        />
        <Flame size={12} className="text-[#d97706]" /> Đánh dấu là việc trọng
        tâm hôm nay
      </label>

      <div className="flex items-center justify-between gap-2 border-t border-[color:var(--planner-border-soft)] pt-2.5">
        {/* [2026-10-06] "Lớn / Subtasks" (sub-task) CHI co y nghia cho Action
            - Event/Habit/Reflection khong co khai niem checklist con theo
            spec (section 3-6 khong nhac "subtask" cho 3 Type con lai). */}
        {typeCfg.hasCheckbox ? (
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
        ) : (
          <span />
        )}
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
            style={!draft.trim() ? undefined : { backgroundColor: typePalette.accentStrong }}
            className="h-[34px] cursor-pointer rounded-[9px] bg-[color:var(--planner-primary)] px-3.5 text-[12.5px] font-semibold text-white shadow-[0_4px_10px_rgba(79,127,240,.18)] transition-colors duration-150 ease-out hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          >
            Thêm việc
          </button>
        </div>
      </div>
    </div>
  );
}

// [2026-10-05] Sua 1 item CO SAN (tieu de/gio/thoi luong/mau/trong tam) -
// yeu cau nguoi dung: "Sửa ngay trong dòng" (khong tach rieng 1 man hinh
// "Task Detail" nhu spec goc, xem comment goc o PlannerShell). Tai dung
// NGUYEN giao dien cac truong cua AddTaskForm (title/TimePickerField/color/
// focus) nhung KHONG co lua chon "Đơn/Lớn" (kind co dinh tu luc tao, doi
// kind sau khi da co san con/khong con hop ly ve du lieu) va nut hanh dong
// doi thanh "Lưu"/"Huỷ" thay vi "Thêm". Hien THAY THE cho dong thuong trong
// SCHEDULE (xem DayDetailPanel) khi editingId === item.id.
// [2026-10-06] Field rieng theo Type (section 4-6, "Detail") - gop CHUNG vao
// trong EditItemForm (khong tach rieng 4 man hinh Detail nhu mockup goc cua
// spec, qua lon cho 1 lan rebuild) - hien RA/AN theo itemType dang chon,
// doc/ghi qua `metadata` (Json) cua PlannerItem.
function EventFieldsSection({
  metadata,
  onChange,
}: {
  metadata: EventMetadata;
  onChange: (next: EventMetadata) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5 border-t border-[color:var(--planner-border-soft)] pt-2.5">
      <input
        value={metadata.location ?? ""}
        onChange={(e) => onChange({ ...metadata, location: e.target.value })}
        placeholder="📍 Địa điểm"
        className="h-8 rounded-[8px] border border-[color:var(--planner-border-soft)] bg-white px-2.5 text-[12.5px] outline-none focus:border-[#b9c9ef]"
      />
      <input
        value={metadata.participants ?? ""}
        onChange={(e) => onChange({ ...metadata, participants: e.target.value })}
        placeholder="👥 Người tham gia"
        className="h-8 rounded-[8px] border border-[color:var(--planner-border-soft)] bg-white px-2.5 text-[12.5px] outline-none focus:border-[#b9c9ef]"
      />
      <input
        value={metadata.meetingUrl ?? ""}
        onChange={(e) => onChange({ ...metadata, meetingUrl: e.target.value })}
        placeholder="🔗 Link họp"
        className="h-8 rounded-[8px] border border-[color:var(--planner-border-soft)] bg-white px-2.5 text-[12.5px] outline-none focus:border-[#b9c9ef]"
      />
    </div>
  );
}

function HabitFieldsSection({
  metadata,
  onChange,
}: {
  metadata: HabitMetadata;
  onChange: (next: HabitMetadata) => void;
}) {
  const days = metadata.preferredDays ?? [];
  return (
    <div className="flex flex-col gap-1.5 border-t border-[color:var(--planner-border-soft)] pt-2.5">
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] font-medium text-[color:var(--planner-text-muted)]">Tần suất/tuần</span>
        <input
          type="number"
          min={1}
          max={7}
          value={metadata.frequencyPerWeek ?? ""}
          onChange={(e) => onChange({ ...metadata, frequencyPerWeek: Number(e.target.value) || undefined })}
          className="h-7 w-14 rounded-[7px] border border-[color:var(--planner-border-soft)] bg-white px-2 text-[12.5px] outline-none focus:border-[#b9c9ef]"
        />
      </div>
      <div className="flex flex-wrap gap-1">
        {WEEKDAY_SHORT_IDS.map((d) => {
          const selected = days.includes(d);
          return (
            <button
              key={d}
              type="button"
              onClick={() =>
                onChange({
                  ...metadata,
                  preferredDays: selected ? days.filter((x) => x !== d) : [...days, d],
                })
              }
              className={cn(
                "cursor-pointer rounded-full px-2 py-1 text-[11px] font-medium",
                selected
                  ? "bg-[color:var(--planner-primary)] text-white"
                  : "bg-white text-[color:var(--planner-text-secondary)] ring-1 ring-[color:var(--planner-border-soft)]",
              )}
            >
              {WEEKDAY_SHORT_LABELS[d]}
            </button>
          );
        })}
      </div>
      <input
        value={metadata.target ?? ""}
        onChange={(e) => onChange({ ...metadata, target: e.target.value })}
        placeholder="🎯 Mục tiêu (vd: Maintain 3 workouts/week)"
        className="h-8 rounded-[8px] border border-[color:var(--planner-border-soft)] bg-white px-2.5 text-[12.5px] outline-none focus:border-[#b9c9ef]"
      />
    </div>
  );
}

function ReflectionFieldsSection({
  metadata,
  onChange,
}: {
  metadata: ReflectionMetadata;
  onChange: (next: ReflectionMetadata) => void;
}) {
  const prompts = metadata.prompts ?? DEFAULT_REFLECTION_PROMPTS;
  return (
    <div className="flex flex-col gap-2 border-t border-[color:var(--planner-border-soft)] pt-2.5">
      {prompts.map((p, i) => (
        <div key={p.label} className="flex flex-col gap-0.5">
          <span className="text-[11px] font-medium text-[color:var(--planner-text-muted)]">{p.label}</span>
          <textarea
            value={p.answer}
            onChange={(e) => {
              const next = prompts.map((x, idx) => (idx === i ? { ...x, answer: e.target.value } : x));
              onChange({ ...metadata, prompts: next });
            }}
            rows={2}
            className="resize-none rounded-[8px] border border-[color:var(--planner-border-soft)] bg-white px-2.5 py-1.5 text-[12.5px] outline-none focus:border-[#b9c9ef]"
          />
        </div>
      ))}
    </div>
  );
}

// [2026-10-05] Sua 1 item CO SAN - yeu cau nguoi dung: "Sửa ngay trong dòng"
// (khong tach rieng 1 man hinh "Task Detail" nhu spec goc). [2026-10-06] Mo
// rong THEM Type/Priority/Area/Project/Tags/Deadline + field rieng theo Type
// (section 4-6, 8-16 "Good Life") - van giu nguyen tinh than "sua tai cho",
// khong dung modal rieng.
function EditItemForm({
  item,
  onSave,
  onCancel,
}: {
  item: ApiPlannerItem;
  onSave: (updates: {
    title: string;
    itemType: LifeItemType;
    scheduledMinute: number | null;
    durationMinutes: number | null;
    isFocus: boolean;
    priority: LifeItemPriority | null;
    status: string | null;
    area: string | null;
    project: string | null;
    tags: string[];
    deadline: string | null;
    metadata: Record<string, unknown> | null;
  }) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(item.title);
  const [itemType, setItemType] = useState<LifeItemType>(item.itemType);
  const [start, setStart] = useState<number | null>(item.scheduledMinute);
  const [duration, setDuration] = useState(
    item.durationMinutes ?? DEFAULT_DURATION_MINUTES,
  );
  const [focus, setFocus] = useState(item.isFocus);
  const [priority, setPriority] = useState<LifeItemPriority | null>(item.priority);
  const [status, setStatus] = useState(item.status ?? "");
  const [area, setArea] = useState(item.area ?? "");
  const [project, setProject] = useState(item.project ?? "");
  const [tags, setTags] = useState<string[]>(item.tags);
  const [deadline, setDeadline] = useState(item.deadline ?? "");
  const [metadata, setMetadata] = useState<Record<string, unknown>>(item.metadata ?? {});

  function save() {
    const t = title.trim();
    if (!t) return;
    onSave({
      title: t,
      itemType,
      scheduledMinute: start,
      durationMinutes: start !== null ? duration : null,
      isFocus: focus,
      priority,
      status: status.trim() || null,
      area: area.trim() || null,
      project: project.trim() || null,
      tags,
      deadline: deadline || null,
      metadata: Object.keys(metadata).length > 0 ? metadata : null,
    });
  }

  return (
    <div className="flex flex-col gap-2.5 rounded-[10px] border border-[color:var(--planner-primary)]/50 bg-[var(--planner-surface-soft)] p-2.5">
      <div className="flex items-center gap-1.5">
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") onCancel();
          }}
          placeholder="Tên công việc..."
          className="h-9 min-w-0 flex-1 rounded-[9px] border border-[color:var(--planner-border-soft)] bg-white px-2.5 text-[13px] text-[color:var(--planner-text-primary)] outline-none placeholder:text-[color:var(--planner-text-muted)] focus:border-[#b9c9ef] focus:shadow-[0_0_0_3px_rgba(71,120,232,.08)]"
        />
        <TimePickerField
          startMinute={start}
          durationMinutes={duration}
          onChange={(s, d) => {
            setStart(s);
            setDuration(d);
          }}
        />
      </div>

      <TypePickerRow value={itemType} onChange={setItemType} />
      <PriorityPickerRow value={priority} onChange={setPriority} />

      {/* Status (section 10, semantic RIENG - khong gioi han cung 1 bang co
          dinh nhu Priority, chi goi y qua datalist). */}
      <input
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        list="planner-status-suggestions"
        placeholder="Status (vd: Next Action)"
        className="h-8 rounded-[8px] border border-[color:var(--planner-border-soft)] bg-white px-2.5 text-[12.5px] outline-none focus:border-[#b9c9ef]"
      />
      <datalist id="planner-status-suggestions">
        {STATUS_SUGGESTIONS.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>

      <div className="grid grid-cols-2 gap-1.5">
        <input
          value={area}
          onChange={(e) => setArea(e.target.value)}
          placeholder="Area (vd: Learning)"
          className="h-8 rounded-[8px] border border-[color:var(--planner-border-soft)] bg-white px-2.5 text-[12.5px] outline-none focus:border-[#b9c9ef]"
        />
        <input
          value={project}
          onChange={(e) => setProject(e.target.value)}
          placeholder="Project (vd: AWS SAA-C03)"
          className="h-8 rounded-[8px] border border-[color:var(--planner-border-soft)] bg-white px-2.5 text-[12.5px] outline-none focus:border-[#b9c9ef]"
        />
      </div>

      <div className="flex items-center gap-1.5">
        <span className="shrink-0 text-[11px] font-medium text-[color:var(--planner-text-muted)]">Deadline</span>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="h-8 flex-1 rounded-[8px] border border-[color:var(--planner-border-soft)] bg-white px-2.5 text-[12.5px] outline-none focus:border-[#b9c9ef]"
        />
      </div>

      <TagChipInput tags={tags} onChange={setTags} />

      {itemType === "EVENT" && (
        <EventFieldsSection
          metadata={metadata as EventMetadata}
          onChange={(next) => setMetadata(next)}
        />
      )}
      {itemType === "HABIT" && (
        <HabitFieldsSection
          metadata={metadata as HabitMetadata}
          onChange={(next) => setMetadata(next)}
        />
      )}
      {itemType === "REFLECTION" && (
        <ReflectionFieldsSection
          metadata={metadata as ReflectionMetadata}
          onChange={(next) => setMetadata(next)}
        />
      )}

      <label className="flex cursor-pointer items-center gap-1.5 text-[12px] font-medium text-[color:var(--planner-text-secondary)]">
        <input
          type="checkbox"
          checked={focus}
          onChange={(e) => setFocus(e.target.checked)}
          className="size-3.5 cursor-pointer accent-[color:var(--planner-primary)]"
        />
        <Flame size={12} className="text-[#d97706]" /> Đánh dấu là việc trọng
        tâm hôm nay
      </label>

      <div className="flex items-center justify-end gap-1.5">
        <button
          type="button"
          onClick={onCancel}
          className="h-[34px] cursor-pointer rounded-[9px] px-2.5 text-[12.5px] font-medium text-[color:var(--planner-text-muted)] hover:text-[color:var(--planner-text-secondary)]"
        >
          Huỷ
        </button>
        <button
          type="button"
          onClick={save}
          disabled={!title.trim()}
          className="h-[34px] cursor-pointer rounded-[9px] bg-[color:var(--planner-primary)] px-3.5 text-[12.5px] font-semibold text-white shadow-[0_4px_10px_rgba(79,127,240,.18)] transition-colors duration-150 ease-out hover:bg-[#416fdd] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
        >
          Lưu
        </button>
      </div>
    </div>
  );
}

type DayDetailPanelProps = {
  date: string;
  items: ApiPlannerItem[];
  selectedItemId: string | null;
  onSelectItem: (id: string | null) => void;
  onAddItem: (input: {
    title: string;
    kind: PlannerItemKind;
    itemType: LifeItemType;
    scheduledMinute?: number;
    durationMinutes?: number;
    isFocus?: boolean;
    priority?: LifeItemPriority;
    area?: string;
    project?: string;
    tags?: string[];
    deadline?: string;
    metadata?: Record<string, unknown>;
  }) => void;
  onAddChild: (parentId: string, title: string) => void;
  onToggleDone: (item: ApiPlannerItem, parentId?: string) => void;
  onDelete: (item: ApiPlannerItem, parentId?: string) => void;
  onUpdateItem: (
    item: ApiPlannerItem,
    updates: Partial<{
      title: string;
      itemType: LifeItemType;
      scheduledMinute: number | null;
      durationMinutes: number | null;
      color: string | null;
      isFocus: boolean;
      priority: LifeItemPriority | null;
      status: string | null;
      area: string | null;
      project: string | null;
      tags: string[];
      deadline: string | null;
      metadata: Record<string, unknown> | null;
    }>,
    parentId?: string,
  ) => void;
  onChangeDay: (direction: -1 | 1) => void;
  quickAddPrefill: number | null;
  onConsumePrefill: () => void;
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
  onUpdateItem,
  onChangeDay,
  quickAddPrefill,
  onConsumePrefill,
}: DayDetailPanelProps) {
  const [filter, setFilter] = useState<FilterValue>("ALL");
  const [filterOpen, setFilterOpen] = useState(false);
  // [2026-10-05] "Sửa ngay trong dòng" - id item DANG duoc sua (null = khong
  // co gi dang sua). So sanh === item.id trong vong lap render ben duoi de
  // quyet dinh hien EditItemForm THAY CHO dong binh thuong.
  const [editingId, setEditingId] = useState<string | null>(null);

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
    return item.itemType === filter;
  });
  const activeFilterLabel =
    FILTER_OPTIONS.find((f) => f.value === filter)?.label ?? "Tất cả";

  return (
    // Sidebar Card - "Daily command center", khong con la 1 form nhap task
    // tran trui nhu truoc. h-full + overflow-y-auto (2026-10-05) - panel
    // nay gio cung GIAN HET chieu cao hang luoi (cung cap voi lich ben
    // trai) - ngay co NHIEU viec/dai se tu cuon RIENG BEN TRONG chinh no
    // thay vi day ca trang cao them (khop yeu cau "ưu tiên diện tích cho
    // phần lịch, sao cho hiển thị được nhiều nhất" - lich luon giu DUNG 1
    // khung cao co dinh, khong bi panh ben canh keo gian).
    <div className="flex h-full flex-col gap-4 overflow-y-auto rounded-[6px] border border-[color:var(--planner-border)] bg-[var(--planner-surface)] p-4 shadow-[0_2px_10px_rgba(20,30,50,.03)]">
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
          <p className="text-[12px] text-[color:var(--planner-text-muted)]">
            {formatLongDateVi(date)}
          </p>
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
              <p className="text-[13px] font-semibold text-[color:var(--planner-text-secondary)]">
                Chưa có việc nào
              </p>
              <p className="text-[12px] text-[color:var(--planner-text-muted)]">
                Hãy thêm công việc để lên kế hoạch nhé!
              </p>
            </div>
          </div>
          <div className="border-t border-[color:var(--planner-border-soft)]" />
          <AddTaskForm
            onAddItem={onAddItem}
            prefillStart={quickAddPrefill}
            onConsumePrefill={onConsumePrefill}
          />
        </>
      ) : (
        <>
          <div className="border-t border-[color:var(--planner-border-soft)]" />

          <TodayProgress items={sorted} />

          {focusItem && (
            <>
              <div className="border-t border-[color:var(--planner-border-soft)]" />
              <TodayFocusCard
                item={focusItem}
                onContinue={() => onSelectItem(focusItem.id)}
              />
            </>
          )}

          <div className="border-t border-[color:var(--planner-border-soft)]" />

          {/* SCHEDULE (section 6/15) - header + filter + timeline. */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-bold tracking-[.08em] text-[color:var(--planner-text-muted)] uppercase">
                Schedule{" "}
                <span className="font-medium normal-case">
                  · {filtered.length} việc
                </span>
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
                    <ListFilter size={11} />{" "}
                    {filter === "ALL" ? "Filters" : activeFilterLabel}
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
                      {f.value !== "ALL" &&
                        f.value !== "DONE" &&
                        f.value !== "TODO" && (
                          <span
                            className="size-2 shrink-0 rounded-full"
                            style={{
                              backgroundColor: resolveLifeItemPalette(f.value as LifeItemType).accentStrong,
                            }}
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
                  editingId === item.id ? (
                    <div key={item.id} className="pl-6">
                      <EditItemForm
                        item={item}
                        onCancel={() => setEditingId(null)}
                        onSave={(updates) => {
                          onUpdateItem(item, updates);
                          setEditingId(null);
                        }}
                      />
                    </div>
                  ) : item.kind === "BIG" ? (
                    <BigTimelineItem
                      key={item.id}
                      item={item}
                      status={computeItemStatus(item, isToday, nowMinute)}
                      selected={selectedItemId === item.id}
                      onSelect={() => onSelectItem(item.id)}
                      onToggleDone={onToggleDone}
                      onDelete={onDelete}
                      onAddChild={onAddChild}
                      onEdit={() => setEditingId(item.id)}
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
                      onEdit={() => setEditingId(item.id)}
                    />
                  ),
                )}
              </div>
            )}

            <AddTaskForm
              onAddItem={onAddItem}
              prefillStart={quickAddPrefill}
              onConsumePrefill={onConsumePrefill}
            />
          </div>
        </>
      )}
    </div>
  );
}
