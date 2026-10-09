"use client";

// Planner - trang /planner, DOC LAP voi /tracking (dang khoa).
//
// [2026-10-09] VIET LAI theo model hop nhat PlannerItem (xem
// lib/planner/planner-domain.ts). Ban cu ~5.260 dong, trong do ~1.650 dong
// chet, va chay tren 3 he type song song (LifeItemType ACTION/EVENT/HABIT/
// REFLECTION + CalendarEvent/Reminder + ApiPlannerItem) phai dich qua nhau
// bang 1 lop adapter. Nhung thu da BO HAN cung ban cu:
//   - HABIT / REFLECTION (nguoi dung chot: "Bỏ hẳn, chỉ còn Task/Event/Reminder")
//   - TodayFocusCard / isFocus  - cot isFocus khong con trong schema
//   - LearningDigestCard        - dua tren cot `area`, da bo
//   - AddTaskForm + EditItemForm + EventForm + ReminderForm -> 1 PlannerItemForm
//   - TimedItemChip/AllDayItemChip/ItemRow/TimelineRow/BigTimelineItem -> 1 PlannerItemCard
//   - calendar-model-bridge.ts  - khong con 2 model nen khong can adapter
//
// Giu lai (nguoi dung yeu cau ro "Giữ WeekTimeGrid, chỉ chỉnh style nếu
// cần"): toan bo hanh vi luoi tuan - xep chong (overlap lanes), keo-tha tao
// viec kem auto-scroll khi ra khoi mep, keo di chuyen / keo gian the, duong
// "gio hien tai", bu be rong thanh cuon cho header thang cot.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Inbox,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  createPlannerItemAction,
  deletePlannerItemAction,
  listPlannerCategoryColorsAction,
  listPlannerItemsAction,
  listUnscheduledPlannerItemsAction,
  updatePlannerItemAction,
} from "@/actions/planner/planner";
import type {
  CreatePlannerItemInput,
  UpdatePlannerItemInput,
} from "@/lib/api/planner";
import {
  isTimed,
  itemDateKeys,
  minutesOfDay,
  PLANNER_CATEGORIES,
  PLANNER_CATEGORY_META,
  PLANNER_TYPE_META,
  resolveCategoryColor,
  toLocalDateKey,
  type CategoryColorOverrides,
  type PlannerCategory,
  type PlannerItem,
  type PlannerItemType,
  type PlannerScheduleKind,
} from "@/lib/planner/planner-domain";
import {
  PlannerCategoryColorProvider,
  useCategoryColorOverrides,
} from "./planner-category-color-context";
import {
  PlannerSettingsProvider,
  usePlannerSettings,
} from "./planner-settings-context";
import { PlannerSettingsModal } from "./PlannerSettingsModal";
import { PlannerItemCard, type CardBadgeVisibility } from "./PlannerItemCard";
import { PlannerItemForm } from "./PlannerItemForm";
import { PlannerItemDetail } from "./PlannerItemDetail";
import { PlannerModal } from "./PlannerModal";
import {
  PlannerEmptyState,
  PlannerErrorState,
  PlannerSkeletonRows,
} from "./planner-states";
import { minutesToLabel } from "./planner-datetime";
import { CategoryDot, TypeIcon } from "./planner-indicators";

// ---------------------------------------------------------------------------
// Hang so + tien ich ngay
// ---------------------------------------------------------------------------

type ViewMode = "week" | "month";

const WEEKDAY_LABELS_MON_START = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const WEEKDAY_SHORT_BY_JS_DAY = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const MONTH_LABELS_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** YYYY-MM-DD theo gio DIA PHUONG. KHONG dung toISOString().slice(0,10) -
 *  cai do tra ve ngay theo UTC, lech 1 ngay voi nguoi dung o UTC+7 sau 17h. */
function toLocalISODate(d: Date): string {
  return toLocalDateKey(d);
}
function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return toLocalISODate(d);
}
function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return toLocalISODate(d);
}
function startOfWeek(dateStr: string, weekStartsOn: "MONDAY" | "SUNDAY"): string {
  const d = new Date(dateStr);
  const day = d.getDay(); // 0 = CN
  const diff = weekStartsOn === "SUNDAY" ? -day : day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return toLocalISODate(d);
}
function startOfMonth(dateStr: string): string {
  const d = new Date(dateStr);
  d.setDate(1);
  return toLocalISODate(d);
}
function endOfMonth(dateStr: string): string {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + 1, 0);
  return toLocalISODate(d);
}
function formatLongDateVi(dateStr: string): string {
  const d = new Date(dateStr);
  return `${WEEKDAY_SHORT_BY_JS_DAY[d.getDay()]}, ${d.getDate()}/${d.getMonth() + 1}`;
}

/** Khoang ngay can TAI cho mot che do xem. */
function rangeForMode(
  mode: ViewMode,
  anchor: string,
  weekStartsOn: "MONDAY" | "SUNDAY",
): { from: string; to: string } {
  if (mode === "week") {
    const from = startOfWeek(anchor, weekStartsOn);
    return { from, to: addDays(from, 6) };
  }
  // Luoi thang ve ca ngay dau/cuoi cua tuan tran ra ngoai thang -> tai rong
  // ra 7 ngay moi phia cho du.
  return { from: addDays(startOfMonth(anchor), -7), to: addDays(endOfMonth(anchor), 7) };
}

// ---------------------------------------------------------------------------
// Xep chong tren luoi gio
// ---------------------------------------------------------------------------

/**
 * 1 item TRONG 1 NGAY cu the, kem khoang phut DA CAT theo ngay do.
 *
 * Tach rieng startMin/endMin khoi item (khong doc lai tu item.startAt) de 1
 * su kien NHIEU NGAY / vat qua nua dem hien dung tren TUNG cot: ngay giua
 * thi chiem tron cot, ngay cuoi thi chi tu dau cot den gio ket thuc. Ban cu
 * suy startMin tu `scheduledMinute` nen su kien vat qua nua dem ve ra 1 khoi
 * am, vo layout.
 */
type DayEntry = {
  item: PlannerItem;
  startMin: number;
  endMin: number;
  /** Keo-tha duoc khong - CHI item TIMED nam gon trong 1 ngay. */
  draggable: boolean;
};

export type TimedLayoutEntry = DayEntry & {
  leftPercent: number;
  widthPercent: number;
  conflict: boolean;
  conflictWith: PlannerItem[];
};

/**
 * Xep cac item trung gio thanh cot canh nhau.
 *
 * 1. Gom cum theo CHUOI giao nhau.
 * 2. Trong cum, gan "lane" on dinh bang thuat toan tham lam kinh dien - CHI
 *    de thu tu trai/phai nhat quan.
 * 3. Cat khoang cua tung item tai moi moc bat dau/ket thuc cua cac item khac
 *    trong cum; voi moi doan tinh so item THAT SU dong thoi -> suy ra
 *    left/width cuc bo.
 * 4. Lay DUY NHAT "doan dinh" (doan co nhieu item dong thoi nhat) lam
 *    left/width CO DINH cho ca item. Nguoi dung da bac bo ban "reclaim
 *    width" (the dai no rong ra o doan khong con bi chen): "cột nào ngắn cứ
 *    để nó ngắn, vẫn phải giữ chia đôi, chia ba,... không đè lấn màu sang
 *    nhau" - nen 1 the = 1 hinh chu nhat don gian, khong bao gio chong len
 *    the khac o bat ky thoi diem nao.
 * 5. `conflict` = co doan bi chia MA khong co EVENT nao trong nhom do. 2 su
 *    kien trung gio la binh thuong (lich hen hien canh nhau la dung y); 2
 *    TASK trung gio thi nhieu kha nang la lich chua hop ly -> danh dau.
 */
function layoutTimedItems(dayEntries: DayEntry[]): TimedLayoutEntry[] {
  const entries = [...dayEntries].sort(
    (a, b) => a.startMin - b.startMin || a.endMin - b.endMin,
  );
  const result: TimedLayoutEntry[] = [];
  let cluster: DayEntry[] = [];
  let clusterEnd = -1;

  function flushCluster() {
    if (cluster.length === 0) return;

    const colEnds: number[] = [];
    const laneOf = new Map<DayEntry, number>();
    for (const entry of cluster) {
      let placed = -1;
      for (let c = 0; c < colEnds.length; c++) {
        if (colEnds[c] <= entry.startMin) {
          colEnds[c] = entry.endMin;
          placed = c;
          break;
        }
      }
      if (placed === -1) {
        colEnds.push(entry.endMin);
        placed = colEnds.length - 1;
      }
      laneOf.set(entry, placed);
    }

    const allBreakpoints = Array.from(
      new Set(cluster.flatMap((e) => [e.startMin, e.endMin])),
    ).sort((a, b) => a - b);

    for (const entry of cluster) {
      const ownPoints = allBreakpoints.filter(
        (p) => p > entry.startMin && p < entry.endMin,
      );
      const bounds = [entry.startMin, ...ownPoints, entry.endMin];
      const segments: {
        leftPercent: number;
        widthPercent: number;
        active: DayEntry[];
      }[] = [];
      for (let i = 0; i < bounds.length - 1; i++) {
        const segStart = bounds[i];
        const segEnd = bounds[i + 1];
        if (segEnd <= segStart) continue;
        const active = cluster
          .filter((x) => x.startMin <= segStart && x.endMin >= segEnd)
          .sort((a, b) => (laneOf.get(a) ?? 0) - (laneOf.get(b) ?? 0));
        const rank = active.indexOf(entry);
        const n = active.length;
        segments.push({
          leftPercent: (rank / n) * 100,
          widthPercent: (1 / n) * 100,
          active,
        });
      }
      if (segments.length === 0) continue;

      let peak = segments[0];
      for (const seg of segments) {
        if (seg.active.length > peak.active.length) peak = seg;
      }

      const conflictingSegments = segments.filter(
        (s) => s.active.length > 1 && !s.active.some((e) => e.item.type === "EVENT"),
      );
      const conflict = conflictingSegments.length > 0;
      const conflictWith = conflict
        ? Array.from(
            new Map(
              conflictingSegments
                .flatMap((s) => s.active)
                .filter((e) => e !== entry)
                .map((e) => [e.item.id, e.item] as const),
            ).values(),
          )
        : [];

      result.push({
        ...entry,
        leftPercent: peak.leftPercent,
        widthPercent: peak.widthPercent,
        conflict,
        conflictWith,
      });
    }
    cluster = [];
  }

  for (const entry of entries) {
    if (cluster.length > 0 && entry.startMin >= clusterEnd) {
      flushCluster();
      clusterEnd = -1;
    }
    cluster.push(entry);
    clusterEnd = Math.max(clusterEnd, entry.endMin);
  }
  flushCluster();
  return result;
}

/** DEADLINE la 1 DIEM, khong phai 1 khoi - cho no mot chieu cao hinh thuc de
 *  co the ve tren luoi gio o dung gio den han. CHI anh huong hien thi. */
const DEADLINE_VISUAL_MINUTES = 30;

/**
 * Cat cac item cua 1 ngay thanh DayEntry dat tren luoi gio (TIMED + DEADLINE).
 * ALL_DAY di rieng ra hang "Ca ngay"; UNSCHEDULED khong o ngay nao.
 */
function buildDayEntries(items: PlannerItem[], dateKey: string): DayEntry[] {
  const dayStart = new Date(`${dateKey}T00:00:00`);
  const dayStartMs = dayStart.getTime();
  const dayEndMs = dayStartMs + 24 * 60 * 60 * 1000;
  const out: DayEntry[] = [];

  for (const item of items) {
    if (item.scheduleKind === "DEADLINE" && item.dueAt) {
      const start = minutesOfDay(item.dueAt);
      out.push({
        item,
        startMin: start,
        endMin: Math.min(start + DEADLINE_VISUAL_MINUTES, 24 * 60),
        draggable: false,
      });
      continue;
    }
    if (!isTimed(item)) continue;

    const s = new Date(item.startAt).getTime();
    const e = new Date(item.endAt).getTime();
    // Cat vao trong ngay: bat dau truoc ngay -> 0; ket thuc sau ngay -> 24h.
    const clampedStart = Math.max(s, dayStartMs);
    const clampedEnd = Math.min(e, dayEndMs);
    if (clampedEnd <= clampedStart) continue;
    const startMin = Math.round((clampedStart - dayStartMs) / 60000);
    const endMin = Math.round((clampedEnd - dayStartMs) / 60000);
    out.push({
      item,
      startMin,
      // Toi thieu 15' de the 0-phut van bam duoc.
      endMin: Math.max(endMin, startMin + 15),
      // Chi keo duoc khi CA item nam gon trong ngay nay - keo 1 manh da bi
      // cat se ghi sai moc cho phan nam o ngay khac.
      draggable: s >= dayStartMs && e <= dayEndMs,
    });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Shell
// ---------------------------------------------------------------------------

export function PlannerShell({
  initialDate,
  initialItems,
}: {
  initialDate: string;
  initialItems: PlannerItem[];
}) {
  return (
    <PlannerSettingsProvider>
      <PlannerShellInner initialDate={initialDate} initialItems={initialItems} />
    </PlannerSettingsProvider>
  );
}

/** Tach ra de doc duoc usePlannerSettings() (Provider nam o component ngoai). */
function PlannerShellInner({
  initialDate,
  initialItems,
}: {
  initialDate: string;
  initialItems: PlannerItem[];
}) {
  const { settings } = usePlannerSettings();

  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [anchor, setAnchor] = useState(initialDate);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [items, setItems] = useState<PlannerItem[]>(initialItems);
  const [unscheduled, setUnscheduled] = useState<PlannerItem[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [detailItemId, setDetailItemId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Form dang mo: tao moi (co `type`, co the kem prefill tu keo-tha) hoac
  // sua 1 item co san. null = khong mo form nao.
  const [formState, setFormState] = useState<
    | {
        mode: "create";
        type: PlannerItemType;
        prefill?: {
          scheduleKind?: PlannerScheduleKind;
          startAt?: string;
          endAt?: string;
          dueAt?: string;
        };
      }
    | { mode: "edit"; item: PlannerItem }
    | null
  >(null);

  // Mau category tu chinh (backend PlannerCategoryColor). Vang mat = mac dinh.
  const [colorOverrides, setColorOverrides] = useState<CategoryColorOverrides>({});
  useEffect(() => {
    listPlannerCategoryColorsAction()
      .then((rows) => {
        const map: CategoryColorOverrides = {};
        for (const r of rows) {
          map[r.category] = { main: r.main, light: r.light, border: r.border };
        }
        setColorOverrides(map);
      })
      .catch(() => {
        // Khong tai duoc mau tu chinh thi dung mac dinh - khong phai loi can
        // chan ca trang.
      });
  }, []);

  // [2026-10-09] Loc theo CATEGORY - truoc day sidebar co 5 checkbox
  // (Personal/Family/Work/Birthdays/Holidays) nhung KHONG loc gi that (chua
  // co field du lieu tuong ung, chi la UI tri). Gio `category` la field
  // THAT trong model nen checkbox loc that su. null = chua loc gi (hien tat).
  const [hiddenCategories, setHiddenCategories] = useState<Set<PlannerCategory>>(
    () => new Set(),
  );

  const range = useMemo(
    () => rangeForMode(viewMode, anchor, settings.weekStartsOn),
    [viewMode, anchor, settings.weekStartsOn],
  );

  // `loading` la state DAN XUAT, khong phai 1 useState rieng: "dang tai" =
  // du lieu da nap KHONG ung voi khoang dang xem. Lam vay vi bat
  // setLoading(true) ngay trong than useEffect vi pham
  // react-hooks/set-state-in-effect (setState dong bo trong effect gay
  // cascading render) - va dan xuat thi cung khong the lech khoi thuc te:
  // khong co duong nao de `loading` ket o true khi du lieu da ve.
  const [reloadNonce, setReloadNonce] = useState(0);
  const loadKey = `${range.from}|${range.to}|${reloadNonce}`;
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const loading = loadedKey !== loadKey;

  useEffect(() => {
    let cancelled = false;
    // MOI setState duoi day nam SAU mot `await` - khong co setState dong bo
    // nao trong than effect.
    void (async () => {
      try {
        const [ranged, un] = await Promise.all([
          listPlannerItemsAction(range.from, range.to),
          listUnscheduledPlannerItemsAction(),
        ]);
        if (cancelled) return;
        setItems(ranged);
        setUnscheduled(un);
        setLoadError(null);
      } catch (err) {
        if (cancelled) return;
        setLoadError(
          err instanceof Error ? err.message : "Không tải được dữ liệu Planner.",
        );
      } finally {
        // Het "dang tai" du thanh cong hay loi - neu khong, loi se treo UI o
        // trang thai skeleton mai mai.
        if (!cancelled) setLoadedKey(loadKey);
      }
    })();
    // Khoang xem doi (hoac bam Thu lai) giua luc dang fetch -> bo ket qua cu,
    // tranh ghi du lieu cua tuan truoc len tuan dang xem.
    return () => {
      cancelled = true;
    };
  }, [loadKey, range.from, range.to]);

  /** Nap lai - dung sau moi thao tac ghi, va cho nut "Thử lại" khi loi. */
  const reload = useCallback(() => {
    setReloadNonce((n) => n + 1);
  }, []);

  // --- Ghi: MOI thao tac ghi di qua day roi reload, nen lich LUON dong bo
  // voi server (khong co duong nao sua state cuc bo ma bo qua server).
  const handleCreate = useCallback(
    async (dto: CreatePlannerItemInput) => {
      await createPlannerItemAction(dto);
      setFormState(null);
      reload();
    },
    [reload],
  );

  const handleUpdate = useCallback(
    async (id: string, dto: UpdatePlannerItemInput) => {
      await updatePlannerItemAction(id, dto);
      reload();
    },
    [reload],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await deletePlannerItemAction(id);
      setDetailItemId((cur) => (cur === id ? null : cur));
      setSelectedItemId((cur) => (cur === id ? null : cur));
      setFormState(null);
      reload();
    },
    [reload],
  );

  const handleToggleComplete = useCallback(
    async (item: PlannerItem) => {
      await handleUpdate(item.id, {
        status: item.status === "COMPLETED" ? "SCHEDULED" : "COMPLETED",
      });
    },
    [handleUpdate],
  );

  const handleToggleChecklistItem = useCallback(
    async (item: PlannerItem, checklistItemId: string, done: boolean) => {
      await handleUpdate(item.id, {
        checklist: item.checklist.map((c) =>
          c.id === checklistItemId ? { ...c, done } : c,
        ),
      });
    },
    [handleUpdate],
  );

  /** Keo di chuyen / keo gian the tren luoi gio -> ghi lai startAt/endAt. */
  const handleUpdateItemTime = useCallback(
    async (item: PlannerItem, dateKey: string, startMin: number, endMin: number) => {
      const base = new Date(`${dateKey}T00:00:00`);
      const startAt = new Date(base.getTime() + startMin * 60000).toISOString();
      const endAt = new Date(base.getTime() + endMin * 60000).toISOString();
      await handleUpdate(item.id, { scheduleKind: "TIMED", startAt, endAt });
    },
    [handleUpdate],
  );

  // --- Du lieu dan xuat
  const visibleItems = useMemo(
    () => items.filter((it) => !hiddenCategories.has(it.category)),
    [items, hiddenCategories],
  );

  /** Ngay -> cac item xuat hien o ngay do (su kien nhieu ngay co o MOI ngay). */
  const itemsByDate = useMemo(() => {
    const map: Record<string, PlannerItem[]> = {};
    for (const item of visibleItems) {
      for (const key of itemDateKeys(item)) {
        (map[key] ??= []).push(item);
      }
    }
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => a.orderIndex - b.orderIndex);
    }
    return map;
  }, [visibleItems]);

  const visibleUnscheduled = useMemo(
    () => unscheduled.filter((it) => !hiddenCategories.has(it.category)),
    [unscheduled, hiddenCategories],
  );

  const detailItem = useMemo(
    () =>
      [...items, ...unscheduled].find((it) => it.id === detailItemId) ?? null,
    [items, unscheduled, detailItemId],
  );

  const badges: CardBadgeVisibility = useMemo(
    () => ({
      showCategory: settings.showCategory,
      showStatus: settings.showStatus,
      showDuration: settings.showDuration,
      showLocation: settings.showLocation,
      showPriority: settings.showPriority,
    }),
    [settings],
  );

  const anchorDate = new Date(anchor);
  const rangeLabel =
    viewMode === "week"
      ? `${formatLongDateVi(range.from)} – ${formatLongDateVi(range.to)}`
      : "";

  function openDetail(id: string) {
    setSelectedItemId(id);
    setDetailItemId(id);
  }

  return (
    <PlannerCategoryColorProvider overrides={colorOverrides}>
      {/* planner-scope nap bo CSS var rieng (globals.css). -mx/-my huy padding
          cua FeedMainArea de tu ve lai nen/le theo he thiet ke rieng cua trang. */}
      <div
        className="planner-scope relative -mx-4 -my-6 min-h-full bg-[var(--planner-bg)] sm:-mx-6 lg:-mx-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at top left, #eef4ff 0%, transparent 30%)",
          // Dat qua inline style (khong phai class) de chac chan ap dung -
          // moi phan tu thuong ben trong tu inherit.
          fontFamily: "var(--planner-font-family)",
        }}
      >
        <div className="flex items-stretch">
          {/* ---------------- Sidebar ---------------- */}
          <aside
            className={cn(
              "flex shrink-0 flex-col gap-4 overflow-y-auto bg-white py-4 transition-[width] duration-150 ease-out",
              sidebarCollapsed ? "w-[52px] items-center px-2" : "w-[300px] px-3.5",
            )}
          >
            <div
              className={cn(
                "flex items-center",
                sidebarCollapsed ? "flex-col gap-2" : "justify-between",
              )}
            >
              <button
                type="button"
                onClick={() => setSidebarCollapsed((v) => !v)}
                aria-label={sidebarCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
                title={sidebarCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
                className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-[7px] text-[color:var(--planner-text-muted)] transition-colors duration-150 hover:bg-[var(--planner-surface-soft)] hover:text-[color:var(--planner-text-secondary)]"
              >
                {sidebarCollapsed ? (
                  <PanelLeftOpen size={15} />
                ) : (
                  <PanelLeftClose size={15} />
                )}
              </button>
              {!sidebarCollapsed && (
                <PlannerCreateMenu
                  onSelect={(type, prefill) =>
                    setFormState({ mode: "create", type, prefill })
                  }
                />
              )}
            </div>

            {!sidebarCollapsed && (
              <>
                <CategoryFilterList
                  hidden={hiddenCategories}
                  overrides={colorOverrides}
                  onToggle={(cat) =>
                    setHiddenCategories((prev) => {
                      const next = new Set(prev);
                      if (next.has(cat)) next.delete(cat);
                      else next.add(cat);
                      return next;
                    })
                  }
                />

                <div className="border-t border-[color:var(--planner-border-soft)]" />

                <MiniMonthCalendar
                  anchor={anchor}
                  selectedDate={selectedDate}
                  onSelect={(d) => {
                    setSelectedDate(d);
                    setAnchor(d);
                  }}
                />

                <div className="border-t border-[color:var(--planner-border-soft)]" />

                <UnscheduledList
                  items={visibleUnscheduled}
                  loading={loading}
                  overrides={colorOverrides}
                  badges={badges}
                  onOpen={openDetail}
                  onToggleComplete={handleToggleComplete}
                  onAdd={() =>
                    setFormState({
                      mode: "create",
                      type: "TASK",
                      prefill: { scheduleKind: "UNSCHEDULED" },
                    })
                  }
                />
              </>
            )}
          </aside>

          {/* ---------------- Vung chinh ---------------- */}
          <div className="min-w-0 flex-1 px-7 py-6 lg:px-11">
            {/* Toolbar */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <h1 className="flex items-baseline gap-1.5 text-[22px] leading-none text-[color:var(--planner-text-primary)]">
                {/* Thang DAM, nam THANH MANH - yeu cau nguoi dung: "cái năm
                    sẽ nét thanh mảnh hơn, chỉ đậm cái tháng thôi". */}
                <span className="font-bold">
                  {MONTH_LABELS_EN[anchorDate.getMonth()]}
                </span>
                <span className="font-light text-[color:var(--planner-text-secondary)]">
                  {anchorDate.getFullYear()}
                </span>
              </h1>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Kỳ trước"
                  onClick={() =>
                    setAnchor((a) =>
                      viewMode === "week" ? addDays(a, -7) : addMonths(a, -1),
                    )
                  }
                  className="flex size-8 cursor-pointer items-center justify-center rounded-[8px] border border-[color:var(--planner-border-soft)] bg-white text-[color:var(--planner-text-secondary)] hover:bg-[var(--planner-surface-soft)]"
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  type="button"
                  aria-label="Kỳ sau"
                  onClick={() =>
                    setAnchor((a) =>
                      viewMode === "week" ? addDays(a, 7) : addMonths(a, 1),
                    )
                  }
                  className="flex size-8 cursor-pointer items-center justify-center rounded-[8px] border border-[color:var(--planner-border-soft)] bg-white text-[color:var(--planner-text-secondary)] hover:bg-[var(--planner-surface-soft)]"
                >
                  <ChevronRight size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const t = toLocalISODate(new Date());
                    setAnchor(t);
                    setSelectedDate(t);
                  }}
                  className="ml-1 cursor-pointer rounded-[8px] border border-[color:var(--planner-border-soft)] bg-white px-2.5 py-1.5 text-[12px] font-medium text-[color:var(--planner-text-primary)] hover:bg-[var(--planner-surface-soft)]"
                >
                  Hôm nay
                </button>
              </div>

              {rangeLabel && (
                <span className="text-[12px] text-[color:var(--planner-text-muted)]">
                  {rangeLabel}
                </span>
              )}

              <span className="flex-1" />

              <div className="flex items-center gap-1.5">
                <div className="inline-flex rounded-[8px] border border-[color:var(--planner-border-soft)] bg-white p-0.5">
                  {(["week", "month"] as ViewMode[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setViewMode(m)}
                      className={cn(
                        "cursor-pointer rounded-[6px] px-2.5 py-1 text-[12px] font-medium transition-colors",
                        viewMode === m
                          ? "bg-[color:var(--planner-primary)] text-white"
                          : "text-[color:var(--planner-text-secondary)] hover:text-[color:var(--planner-text-primary)]",
                      )}
                    >
                      {m === "week" ? "Tuần" : "Tháng"}
                    </button>
                  ))}
                </div>
                <PlannerCreateMenu
                  onSelect={(type, prefill) =>
                    setFormState({ mode: "create", type, prefill })
                  }
                />
                <button
                  type="button"
                  onClick={() => setSettingsOpen(true)}
                  aria-label="Cài đặt Planner"
                  title="Cài đặt Planner"
                  className="flex size-8 cursor-pointer items-center justify-center rounded-[8px] border border-[color:var(--planner-border-soft)] bg-white text-[color:var(--planner-text-secondary)] hover:bg-[var(--planner-surface-soft)]"
                >
                  <Settings size={14} />
                </button>
              </div>
            </div>

            {/* Lich + panel ngay */}
            <div className="flex min-h-0 flex-col gap-4 xl:flex-row">
              <div className="min-w-0 flex-1 overflow-hidden rounded-[14px] border border-[color:var(--planner-border-soft)] bg-[color:var(--planner-surface)] shadow-[0_1px_2px_rgba(20,30,50,.04)]">
                {loadError ? (
                  <PlannerErrorState message={loadError} onRetry={reload} />
                ) : viewMode === "week" ? (
                  <div className="h-[calc(100vh-220px)] min-h-[420px]">
                    <WeekTimeGrid
                      anchor={anchor}
                      selectedDate={selectedDate}
                      itemsByDate={itemsByDate}
                      selectedItemId={selectedItemId}
                      badges={badges}
                      onSelectDate={setSelectedDate}
                      onOpenItem={openDetail}
                      onDragCreate={(dateKey, startMin, endMin) => {
                        const base = new Date(`${dateKey}T00:00:00`);
                        setSelectedDate(dateKey);
                        setFormState({
                          mode: "create",
                          type: "EVENT",
                          prefill: {
                            scheduleKind: "TIMED",
                            startAt: new Date(
                              base.getTime() + startMin * 60000,
                            ).toISOString(),
                            endAt: new Date(
                              base.getTime() + endMin * 60000,
                            ).toISOString(),
                          },
                        });
                      }}
                      onUpdateItemTime={handleUpdateItemTime}
                    />
                  </div>
                ) : (
                  <MonthGrid
                    anchor={anchor}
                    selectedDate={selectedDate}
                    itemsByDate={itemsByDate}
                    onSelectDate={setSelectedDate}
                    onOpenItem={openDetail}
                  />
                )}
              </div>

              <DayDetailPanel
                dateKey={selectedDate}
                items={itemsByDate[selectedDate] ?? []}
                loading={loading}
                overrides={colorOverrides}
                badges={badges}
                timeFormat={settings.timeFormat}
                selectedItemId={selectedItemId}
                onOpenItem={openDetail}
                onToggleComplete={handleToggleComplete}
                onAdd={() =>
                  setFormState({
                    mode: "create",
                    type: "TASK",
                    prefill: {
                      scheduleKind: "TIMED",
                      startAt: new Date(`${selectedDate}T09:00:00`).toISOString(),
                      endAt: new Date(`${selectedDate}T10:00:00`).toISOString(),
                    },
                  })
                }
              />
            </div>
          </div>
        </div>

        {/* ---------------- Modal ---------------- */}
        <PlannerModal
          open={!!formState}
          onOpenChange={(o) => !o && setFormState(null)}
          title={
            formState?.mode === "edit"
              ? "Sửa việc"
              : `Tạo ${formState ? PLANNER_TYPE_META[formState.type].label : ""}`
          }
          description={
            formState?.mode === "create"
              ? PLANNER_TYPE_META[formState.type].description
              : undefined
          }
        >
          {(container) =>
            formState && (
              <PlannerItemForm
                // key: doi loai/doi item thi DUNG 1 form moi, khong giu lai
                // state cu cua form truoc (neu khong, mo sua item B ngay sau
                // item A se hien du lieu cua A).
                key={
                  formState.mode === "edit"
                    ? `edit-${formState.item.id}`
                    : `create-${formState.type}-${formState.prefill?.startAt ?? ""}-${formState.prefill?.scheduleKind ?? ""}`
                }
                type={formState.mode === "edit" ? formState.item.type : formState.type}
                initial={formState.mode === "edit" ? formState.item : undefined}
                prefill={formState.mode === "create" ? formState.prefill : undefined}
                overrides={colorOverrides}
                container={container}
                onCancel={() => setFormState(null)}
                onSubmit={async (payload) => {
                  if (formState.mode === "edit") {
                    await handleUpdate(
                      formState.item.id,
                      payload as UpdatePlannerItemInput,
                    );
                    setFormState(null);
                  } else {
                    await handleCreate(payload as CreatePlannerItemInput);
                  }
                }}
                onDelete={
                  formState.mode === "edit"
                    ? () => handleDelete(formState.item.id)
                    : undefined
                }
              />
            )
          }
        </PlannerModal>

        <PlannerModal
          open={!!detailItem}
          onOpenChange={(o) => !o && setDetailItemId(null)}
          title="Chi tiết"
          maxWidthClassName="max-w-[440px]"
        >
          {() =>
            detailItem && (
              <PlannerItemDetail
                item={detailItem}
                overrides={colorOverrides}
                timeFormat={settings.timeFormat}
                onEdit={() => {
                  setDetailItemId(null);
                  setFormState({ mode: "edit", item: detailItem });
                }}
                onDelete={() => handleDelete(detailItem.id)}
                onToggleComplete={() => handleToggleComplete(detailItem)}
                onToggleChecklistItem={(cid, done) =>
                  handleToggleChecklistItem(detailItem, cid, done)
                }
              />
            )
          }
        </PlannerModal>

        <PlannerSettingsModal
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          colorOverrides={colorOverrides}
          onColorOverridesChange={setColorOverrides}
        />
      </div>
    </PlannerCategoryColorProvider>
  );
}

// ---------------------------------------------------------------------------
// Nut tao moi - BON lua chon (spec muc C)
// ---------------------------------------------------------------------------

/**
 * 4 lua chon = 3 loai + "viec chua xep lich".
 *
 * "Chua xep lich" tach thanh 1 muc rieng du cung la TASK, vi do la 1 Y DINH
 * KHAC HAN cua nguoi dung (ghi nhanh vao danh sach cho, chua quyet dinh lam
 * khi nao) va spec muc B doi phai mo hinh hoa no TUONG MINH, chu khong de
 * nguoi dung tu mo form Task roi tu doi "Thoi gian" sang "Chua xep lich".
 */
const CREATE_CHOICES: {
  key: string;
  label: string;
  hint: string;
  type: PlannerItemType;
  scheduleKind: PlannerScheduleKind;
}[] = [
  {
    key: "task-timed",
    label: "Task",
    hint: "Việc cần làm, đặt khung giờ",
    type: "TASK",
    scheduleKind: "TIMED",
  },
  {
    key: "task-unscheduled",
    label: "Việc chưa xếp lịch",
    hint: "Ghi nhanh, xếp lịch sau",
    type: "TASK",
    scheduleKind: "UNSCHEDULED",
  },
  {
    key: "event",
    label: "Event",
    hint: "Lịch hẹn, họp, cả ngày",
    type: "EVENT",
    scheduleKind: "TIMED",
  },
  {
    key: "reminder",
    label: "Reminder",
    hint: "Nhắc tại một thời điểm",
    type: "REMINDER",
    scheduleKind: "DEADLINE",
  },
];

function PlannerCreateMenu({
  onSelect,
}: {
  onSelect: (
    type: PlannerItemType,
    prefill: { scheduleKind: PlannerScheduleKind },
  ) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Bam ra ngoai thi dong - nguoi dung tung bao loi nay o popover tao viec:
  // "Chưa xử lý việc click out ra khỏi popover tạo công việc thì đóng lại".
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex size-8 cursor-pointer items-center justify-center rounded-[8px] bg-[color:var(--planner-primary)] text-white hover:bg-[color:var(--mset-accent-hover)]"
        title="Tạo mới"
      >
        <Plus size={15} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute top-full right-0 z-30 mt-1.5 w-[248px] overflow-hidden rounded-[10px] border border-[color:var(--planner-border)] bg-white p-1 shadow-[0_10px_28px_rgba(20,30,50,.16)]"
        >
          {CREATE_CHOICES.map((c) => (
            <button
              key={c.key}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onSelect(c.type, { scheduleKind: c.scheduleKind });
              }}
              className="flex w-full cursor-pointer items-start gap-2 rounded-[7px] px-2 py-1.5 text-left hover:bg-[var(--planner-surface-soft)]"
            >
              {c.scheduleKind === "UNSCHEDULED" ? (
                <Inbox
                  size={13}
                  className="mt-[3px] shrink-0 text-[color:var(--planner-text-muted)]"
                />
              ) : (
                <TypeIcon
                  type={c.type}
                  size={13}
                  className="mt-[3px] shrink-0 text-[color:var(--planner-text-muted)]"
                />
              )}
              <span className="min-w-0">
                <span className="block text-[12.5px] font-semibold text-[color:var(--planner-text-primary)]">
                  {c.label}
                </span>
                <span className="block text-[10.5px] text-[color:var(--planner-text-muted)]">
                  {c.hint}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loc theo category
// ---------------------------------------------------------------------------

function CategoryFilterList({
  hidden,
  overrides,
  onToggle,
}: {
  hidden: Set<PlannerCategory>;
  overrides: CategoryColorOverrides;
  onToggle: (c: PlannerCategory) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="px-0.5 text-[10px] font-semibold tracking-[.04em] text-[color:var(--planner-text-muted)] uppercase">
        Phân loại
      </span>
      {PLANNER_CATEGORIES.map((cat) => {
        const color = resolveCategoryColor(cat, overrides);
        const checked = !hidden.has(cat);
        return (
          <label
            key={cat}
            className="flex cursor-pointer items-center gap-2 rounded-[6px] px-0.5 py-0.5 hover:bg-[var(--planner-surface-soft)]"
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => onToggle(cat)}
              className="sr-only"
            />
            {/* Checkbox tu ve: khi tich thi to DUNG mau category - nhan ra
                ngay o nay ung voi mau nao tren lich. */}
            <span
              aria-hidden="true"
              className={cn(
                "flex size-4 shrink-0 items-center justify-center rounded-[4px] border-[1.5px] transition-colors",
              )}
              style={
                checked
                  ? { backgroundColor: color.main, borderColor: color.main }
                  : { borderColor: "var(--planner-border)" }
              }
            >
              {checked && (
                <svg viewBox="0 0 10 10" className="size-2.5 text-white">
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
            </span>
            <span className="min-w-0 flex-1 truncate text-[12px] text-[color:var(--planner-text-secondary)]">
              {PLANNER_CATEGORY_META[cat].label}
            </span>
          </label>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Danh sach viec chua xep lich
// ---------------------------------------------------------------------------

function UnscheduledList({
  items,
  loading,
  overrides,
  badges,
  onOpen,
  onToggleComplete,
  onAdd,
}: {
  items: PlannerItem[];
  loading: boolean;
  overrides: CategoryColorOverrides;
  badges: CardBadgeVisibility;
  onOpen: (id: string) => void;
  onToggleComplete: (item: PlannerItem) => Promise<void> | void;
  onAdd: () => void;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <div className="flex items-center justify-between px-0.5">
        <span className="text-[10px] font-semibold tracking-[.04em] text-[color:var(--planner-text-muted)] uppercase">
          Chưa xếp lịch
        </span>
        <button
          type="button"
          onClick={onAdd}
          aria-label="Thêm việc chưa xếp lịch"
          className="flex size-5 cursor-pointer items-center justify-center rounded-[5px] text-[color:var(--planner-text-muted)] hover:bg-[var(--planner-surface-soft)]"
        >
          <Plus size={12} />
        </button>
      </div>
      {loading && items.length === 0 ? (
        <PlannerSkeletonRows rows={2} />
      ) : items.length === 0 ? (
        <p className="px-0.5 py-1 text-[11px] leading-[1.5] text-[color:var(--planner-text-muted)]">
          Không có việc nào đang chờ xếp lịch.
        </p>
      ) : (
        <ul className="flex min-w-0 flex-col">
          {items.map((item) => (
            <li key={item.id} className="min-w-0">
              <PlannerItemCard
                item={item}
                variant="list"
                overrides={overrides}
                badges={badges}
                onClick={() => onOpen(item.id)}
                onToggleComplete={() => void onToggleComplete(item)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Luoi tuan
// ---------------------------------------------------------------------------

function WeekTimeGrid({
  anchor,
  selectedDate,
  itemsByDate,
  selectedItemId,
  badges,
  onSelectDate,
  onOpenItem,
  onDragCreate,
  onUpdateItemTime,
}: {
  anchor: string;
  selectedDate: string;
  itemsByDate: Record<string, PlannerItem[]>;
  selectedItemId: string | null;
  badges: CardBadgeVisibility;
  onSelectDate: (d: string) => void;
  onOpenItem: (id: string) => void;
  onDragCreate: (dateKey: string, startMin: number, endMin: number) => void;
  onUpdateItemTime: (
    item: PlannerItem,
    dateKey: string,
    startMin: number,
    endMin: number,
  ) => Promise<void> | void;
}) {
  const { settings } = usePlannerSettings();
  const overrides = useCategoryColorOverrides();

  // Dan xuat tu Settings - Density / Time slot / First-Last visible hour.
  const HOUR_ROW_HEIGHT = settings.density === "COMPACT" ? 40 : 58;
  const DRAG_SNAP_MINUTES = settings.timeSlotMinutes;
  const DRAG_SNAP_PX = (HOUR_ROW_HEIGHT * DRAG_SNAP_MINUTES) / 60;
  const HOURS = useMemo(
    () =>
      Array.from(
        { length: Math.max(settings.lastVisibleHour - settings.firstVisibleHour, 1) },
        (_, i) => settings.firstVisibleHour + i,
      ),
    [settings.firstVisibleHour, settings.lastVisibleHour],
  );
  const firstVisibleMinute = settings.firstVisibleHour * 60;
  const lastVisibleMinute = settings.lastVisibleHour * 60;

  const scrollRef = useRef<HTMLDivElement>(null);

  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) =>
        addDays(startOfWeek(anchor, settings.weekStartsOn), i),
      ).filter((d) => settings.showWeekends || ![0, 6].includes(new Date(d).getDay())),
    [anchor, settings.weekStartsOn, settings.showWeekends],
  );

  const today = toLocalISODate(new Date());
  const [nowMinute, setNowMinute] = useState(() => {
    const n = new Date();
    return n.getHours() * 60 + n.getMinutes();
  });
  // Duong "gio hien tai" phai TU TROI, khong dung yen den khi nguoi dung
  // bam gi do.
  useEffect(() => {
    const id = setInterval(() => {
      const n = new Date();
      setNowMinute(n.getHours() * 60 + n.getMinutes());
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  // Tron "fr" voi "px" trong calc() cho grid-template-columns bi trinh duyet
  // LOAI BO ca khai bao (da xac nhan qua DevTools) -> moi o roi vao 1 cot,
  // xep doc. Dung class Tailwind tinh voi 1fr thuan.
  const gridColsClass =
    days.length === 5
      ? "grid-cols-[48px_repeat(5,1fr)]"
      : "grid-cols-[48px_repeat(7,1fr)]";

  // Bu be rong thanh cuon cho hang header. Tren Windows/Linux thanh cuon
  // CHIEM CHO THAT, nen than luoi (co overflow-y) hep hon header -> 7 cot
  // lech dan sang phai. Do offsetWidth-clientWidth cua chinh vung cuon (0
  // tren macOS overlay scrollbar) roi bu bang padding-right o header.
  const [scrollbarWidth, setScrollbarWidth] = useState(0);
  useEffect(() => {
    function measure() {
      const el = scrollRef.current;
      if (el) setScrollbarWidth(el.offsetWidth - el.clientWidth);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Cuon san toi ~7h sang (hoac gio dau tien con thay duoc) khi mo/doi tuan.
  useEffect(() => {
    const target = Math.max(
      settings.firstVisibleHour,
      Math.min(7, settings.lastVisibleHour - 1),
    );
    scrollRef.current?.scrollTo({
      top: (target - settings.firstVisibleHour) * HOUR_ROW_HEIGHT - 24,
    });
  }, [anchor, settings.firstVisibleHour, settings.lastVisibleHour, HOUR_ROW_HEIGHT]);

  // --- Keo tao viec tren vung trong
  const [slotDrag, setSlotDrag] = useState<{
    day: string;
    startMinute: number;
    currentMinute: number;
    /** Da keo du nguong chua - khung net dut CHI ve khi true, de 1 cu click
     *  don khong ve ra 1 khung "0 phut" vo nghia. */
    started: boolean;
  } | null>(null);
  const slotDragRef = useRef<typeof slotDrag>(null);

  function startSlotDrag(e: React.MouseEvent<HTMLDivElement>, day: string) {
    if (e.button !== 0) return; // chi chuot trai
    // Khong bat dau luot keo moi khi dang keo cai khac.
    if (slotDragRef.current) return;

    // Giu CHINH phan tu cot ngay, goi getBoundingClientRect() MOI LAN can -
    // KHONG chup rect 1 lan: auto-scroll ben duoi lam noi dung cuon, vi tri
    // that cua cot so voi viewport doi, rect cu se tinh sai phut.
    const dayEl = e.currentTarget;
    function minuteFromClientY(clientY: number): number {
      const rect = dayEl.getBoundingClientRect();
      const raw = ((clientY - rect.top) / HOUR_ROW_HEIGHT) * 60;
      const snapped =
        Math.round(raw / DRAG_SNAP_MINUTES) * DRAG_SNAP_MINUTES + firstVisibleMinute;
      return Math.min(Math.max(snapped, firstVisibleMinute), lastVisibleMinute);
    }

    const startMinute = minuteFromClientY(e.clientY);
    const initial = { day, startMinute, currentMinute: startMinute, started: false };
    slotDragRef.current = initial;
    setSlotDrag(initial);

    let lastClientY = e.clientY;
    const startClientY = e.clientY;

    // Auto-scroll khi keo gan/ra khoi mep tren-duoi cua VUNG CUON - yeu cau
    // nguoi dung: "khi ra ngoài view lịch cũng vẫn phải cuộn lên theo để đến
    // vị trí muốn kết thúc phù hợp, không được tự ngắt khi chuột ra ngoài".
    const AUTO_SCROLL_EDGE_PX = 48;
    const AUTO_SCROLL_MAX_SPEED = 18; // px / khung hinh
    let autoScrollRaf: number | null = null;

    function autoScrollSpeedFor(clientY: number): number {
      const container = scrollRef.current;
      if (!container) return 0;
      const crect = container.getBoundingClientRect();
      const fromTop = clientY - crect.top;
      const fromBottom = crect.bottom - clientY;
      if (fromTop < AUTO_SCROLL_EDGE_PX) {
        const p = Math.min(1, Math.max(0, (AUTO_SCROLL_EDGE_PX - fromTop) / AUTO_SCROLL_EDGE_PX));
        return -AUTO_SCROLL_MAX_SPEED * p;
      }
      if (fromBottom < AUTO_SCROLL_EDGE_PX) {
        const p = Math.min(1, Math.max(0, (AUTO_SCROLL_EDGE_PX - fromBottom) / AUTO_SCROLL_EDGE_PX));
        return AUTO_SCROLL_MAX_SPEED * p;
      }
      return 0;
    }

    function pushDragState() {
      const started =
        (slotDragRef.current?.started ?? false) ||
        Math.abs(lastClientY - startClientY) >= DRAG_SNAP_PX;
      const next = {
        day,
        startMinute,
        currentMinute: minuteFromClientY(lastClientY),
        started,
      };
      slotDragRef.current = next;
      setSlotDrag(next);
    }

    // Vong lap rAF RIENG (khong chi dua vao onMove): khi chuot DUNG YEN sat
    // mep, khong con mousemove moi nhung noi dung van phai tiep tuc cuon va
    // currentMinute van phai tiep tuc chay.
    function autoScrollTick() {
      const container = scrollRef.current;
      if (!container) {
        autoScrollRaf = null;
        return;
      }
      const speed = autoScrollSpeedFor(lastClientY);
      if (speed === 0) {
        autoScrollRaf = null;
        return;
      }
      container.scrollTop = Math.min(
        Math.max(container.scrollTop + speed, 0),
        container.scrollHeight - container.clientHeight,
      );
      pushDragState();
      autoScrollRaf = requestAnimationFrame(autoScrollTick);
    }

    function onMove(ev: MouseEvent) {
      lastClientY = ev.clientY;
      pushDragState();
      if (autoScrollSpeedFor(ev.clientY) !== 0) {
        if (autoScrollRaf === null) autoScrollRaf = requestAnimationFrame(autoScrollTick);
      } else if (autoScrollRaf !== null) {
        cancelAnimationFrame(autoScrollRaf);
        autoScrollRaf = null;
      }
    }

    function onUp() {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      if (autoScrollRaf !== null) {
        cancelAnimationFrame(autoScrollRaf);
        autoScrollRaf = null;
      }
      const final = slotDragRef.current;
      slotDragRef.current = null;
      setSlotDrag(null);
      if (!final) return;
      onSelectDate(final.day);
      const lo = Math.min(final.startMinute, final.currentMinute);
      const hi = Math.max(final.startMinute, final.currentMinute);

      // Dieu kien THAT SU la keo: dung PIXEL THO (chua snap). Neu so 2 moc
      // PHUT DA SNAP thi diem bat dau nam gan ranh gioi snap chi can run tay
      // vai px cung du nhay qua 1 moc, khien 1 cu CLICK bi tinh la keo.
      const rawDeltaPx = Math.abs(lastClientY - startClientY);
      // Click don KHONG mo gi ca - yeu cau nguoi dung: "Click thường thì
      // không bật cái gì cả".
      if (rawDeltaPx >= DRAG_SNAP_PX && hi - lo >= DRAG_SNAP_MINUTES) {
        onDragCreate(final.day, lo, hi);
      }
    }

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }

  // Tinh TRUOC layout cho tung ngay trong MOT useMemo - KHONG goi useMemo
  // ben trong .map() (vi pham Rules of Hooks: so lan goi hook se doi theo
  // so ngay hien thi).
  const laidOutByDay = useMemo(() => {
    const map: Record<string, TimedLayoutEntry[]> = {};
    for (const d of days) {
      const dayItems = (itemsByDate[d] ?? []).filter(
        (it) => !(settings.completedTaskDisplay === "HIDE" && it.status === "COMPLETED"),
      );
      map[d] = layoutTimedItems(buildDayEntries(dayItems, d));
    }
    return map;
  }, [days, itemsByDate, settings.completedTaskDisplay]);

  const allDayByDay = useMemo(() => {
    const map: Record<string, PlannerItem[]> = {};
    for (const d of days) {
      map[d] = (itemsByDate[d] ?? []).filter((it) => it.scheduleKind === "ALL_DAY");
    }
    return map;
  }, [days, itemsByDate]);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-x-auto">
      {/* ---- Header (khong cuon doc) */}
      <div
        className="shrink-0 border-b border-[color:var(--planner-border-soft)]"
        style={{ paddingRight: scrollbarWidth }}
      >
        <div className={cn("grid", gridColsClass)}>
          <div />
          {days.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => onSelectDate(d)}
              className={cn(
                "flex cursor-pointer flex-col items-center gap-0.5 border-l border-[color:var(--planner-border-soft)] py-1 transition-colors duration-150 hover:bg-[var(--planner-surface-soft)]",
                d === selectedDate && "bg-[color:var(--planner-primary-soft)]",
              )}
            >
              <span className="text-[10px] font-semibold tracking-[.04em] text-[color:var(--planner-text-muted)] uppercase">
                {WEEKDAY_SHORT_BY_JS_DAY[new Date(d).getDay()]}
              </span>
              <span
                className={cn(
                  "flex size-5.5 items-center justify-center rounded-full text-[12px] font-semibold",
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

        {settings.showAllDaySection && (
          <div
            className={cn(
              "grid border-t border-[color:var(--planner-border-soft)] bg-[#fafbfc]",
              gridColsClass,
            )}
          >
            <div className="py-1.5 text-center text-[10px] font-semibold text-[color:var(--planner-text-muted)]">
              Cả ngày
            </div>
            {days.map((d) => (
              <div
                key={d}
                className="flex min-h-7 flex-col gap-0.5 border-l border-[color:var(--planner-border-soft)] px-1 py-1"
              >
                {allDayByDay[d]?.map((item) => (
                  <PlannerItemCard
                    key={item.id}
                    item={item}
                    variant="allDay"
                    overrides={overrides}
                    badges={badges}
                    timeFormat={settings.timeFormat}
                    onClick={() => onOpenItem(item.id)}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ---- Than luoi gio (cuon doc rieng) */}
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        <div className={cn("grid", gridColsClass)}>
          {/* Cot nhan gio */}
          <div className="flex flex-col">
            {HOURS.map((h) => (
              <div key={h} style={{ height: HOUR_ROW_HEIGHT }} className="relative">
                {/* top-0 + -translate-y-1/2: neo DUNG vao duong ke cua o gio
                    (cung toa do voi the, ca 2 tinh tu h*HOUR_ROW_HEIGHT) roi
                    can giua nhan bang 50% chieu cao THAT cua chinh span -
                    khong dung so doan kieu -top-2 (lech theo font/line-height).
                    So gio to/dam hon chu AM-PM - yeu cau nguoi dung. */}
                {h > 0 && (
                  <span className="absolute top-0 right-1.5 -translate-y-1/2 whitespace-nowrap text-[color:var(--planner-text-muted)]">
                    <span className="text-[14px] font-medium text-black/90">
                      {h % 12 === 0 ? 12 : h % 12}
                    </span>{" "}
                    <span className="text-[10px] font-normal">
                      {h < 12 ? "AM" : "PM"}
                    </span>
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Cot ngay */}
          {days.map((d) => {
            const isToday = d === today;
            const laidOut = laidOutByDay[d] ?? [];
            return (
              <div
                key={d}
                onMouseDown={(e) => startSlotDrag(e, d)}
                className="relative cursor-pointer border-l border-[color:var(--planner-grid-line)]"
                style={{
                  height: HOUR_ROW_HEIGHT * HOURS.length,
                  ...(isToday
                    ? {
                        // Pha them 30% trang - yeu cau nguoi dung: "nền của
                        // cột today nên nhạt hơn thêm 30%". Pha voi
                        // `transparent` (KHONG phai `white`) de nen cot
                        // khong che mat cac lop ben duoi.
                        backgroundImage:
                          "linear-gradient(180deg, color-mix(in srgb, var(--mset-accent-subtle) 70%, transparent) 0%, color-mix(in srgb, var(--mset-accent-subtle) 45%, transparent) 100%)",
                      }
                    : null),
                }}
              >
                {/* O gio: thuan VISUAL (duong ke + to mo gio ngoai khung lam
                    viec). KHONG co onClick rieng - viec tao di qua
                    startSlotDrag o cot ngay, de khong kich hoat 2 lan. */}
                {HOURS.map((h) => {
                  const isWorkingHour =
                    h * 60 < settings.workingHoursEnd &&
                    h * 60 + 60 > settings.workingHoursStart;
                  return (
                    <div
                      key={h}
                      className="pointer-events-none border-t border-[color:var(--planner-grid-line)]"
                      style={{
                        height: HOUR_ROW_HEIGHT,
                        backgroundColor: !isWorkingHour
                          ? "color-mix(in srgb, var(--planner-border-soft) 55%, transparent)"
                          : undefined,
                      }}
                    />
                  );
                })}

                {/* Duong "gio hien tai" */}
                {isToday &&
                  nowMinute >= firstVisibleMinute &&
                  nowMinute <= lastVisibleMinute && (
                    <div
                      className="pointer-events-none absolute right-0 left-0 z-[3] flex items-center"
                      style={{
                        top: ((nowMinute - firstVisibleMinute) / 60) * HOUR_ROW_HEIGHT,
                      }}
                      aria-hidden="true"
                    >
                      <span className="size-1.5 shrink-0 rounded-full bg-[color:var(--mset-danger)]" />
                      <span className="h-px flex-1 bg-[color:var(--mset-danger)]" />
                    </div>
                  )}

                {/* Preview khung dang keo */}
                {slotDrag && slotDrag.started && slotDrag.day === d && (
                  <div
                    className="pointer-events-none absolute right-1 left-1 z-[2] rounded-[6px] border-2 border-dashed"
                    style={{
                      top:
                        ((Math.min(slotDrag.startMinute, slotDrag.currentMinute) -
                          firstVisibleMinute) /
                          60) *
                        HOUR_ROW_HEIGHT,
                      height: Math.max(
                        (Math.abs(slotDrag.currentMinute - slotDrag.startMinute) / 60) *
                          HOUR_ROW_HEIGHT,
                        4,
                      ),
                      borderColor: "var(--planner-primary)",
                      backgroundColor:
                        "color-mix(in srgb, var(--planner-primary) 12%, transparent)",
                    }}
                  >
                    <span
                      className="absolute top-0.5 left-1 rounded-[4px] px-1 py-0.5 text-[10px] font-semibold whitespace-nowrap text-white"
                      style={{ backgroundColor: "var(--planner-primary)" }}
                    >
                      {minutesToLabel(
                        Math.min(slotDrag.startMinute, slotDrag.currentMinute),
                        settings.timeFormat,
                      )}
                      {" — "}
                      {minutesToLabel(
                        Math.max(slotDrag.startMinute, slotDrag.currentMinute),
                        settings.timeFormat,
                      )}
                    </span>
                  </div>
                )}

                {/* The */}
                {laidOut.map((entry) => (
                  <TimedChipPositioner
                    key={entry.item.id}
                    entry={entry}
                    hourRowHeight={HOUR_ROW_HEIGHT}
                    firstVisibleMinute={firstVisibleMinute}
                    snapMinutes={DRAG_SNAP_MINUTES}
                    snapPx={DRAG_SNAP_PX}
                    selected={selectedItemId === entry.item.id}
                    badges={badges}
                    overrides={overrides}
                    timeFormat={settings.timeFormat}
                    completedStyle={settings.completedTaskStyle}
                    forceCompact={
                      settings.completedTaskDisplay === "COLLAPSE" &&
                      entry.item.status === "COMPLETED"
                    }
                    onOpen={() => onOpenItem(entry.item.id)}
                    onUpdateTime={(startMin, endMin) =>
                      onUpdateItemTime(entry.item, d, startMin, endMin)
                    }
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

/**
 * Dinh vi 1 the tren cot ngay + keo di chuyen / keo gian.
 *
 * Tach rieng khoi PlannerItemCard: card thuan TRINH BAY (dung o 4 noi khac
 * nhau), con chuyen dat/keo-tha la viec CUA RIENG luoi gio.
 */
function TimedChipPositioner({
  entry,
  hourRowHeight,
  firstVisibleMinute,
  snapMinutes,
  snapPx,
  selected,
  badges,
  overrides,
  timeFormat,
  completedStyle,
  forceCompact,
  onOpen,
  onUpdateTime,
}: {
  entry: TimedLayoutEntry;
  hourRowHeight: number;
  firstVisibleMinute: number;
  snapMinutes: number;
  snapPx: number;
  selected: boolean;
  badges: CardBadgeVisibility;
  overrides: CategoryColorOverrides;
  timeFormat: "24H" | "12H";
  completedStyle: "CHECK_ICON" | "CHECK_COLOR" | "DONE_BADGE" | "PATTERN";
  forceCompact: boolean;
  onOpen: () => void;
  onUpdateTime: (startMin: number, endMin: number) => Promise<void> | void;
}) {
  const { item, startMin, endMin, leftPercent, widthPercent, conflict, draggable } =
    entry;
  const color = resolveCategoryColor(item.category, overrides);

  const top = ((startMin - firstVisibleMinute) / 60) * hourRowHeight;
  const height = ((endMin - startMin) / 60) * hourRowHeight;

  // `drag` = preview CUC BO (chua luu). Chi goi API LUC THA chuot, khong goi
  // lien tuc theo tung pixel.
  const [drag, setDrag] = useState<{ mode: "move" | "resize"; deltaPx: number } | null>(
    null,
  );
  // Ban song song doc duoc NGAY trong onUp. Khong goi setState cua component
  // CHA ben trong updater function cua setState nay - updater phai PURE;
  // lam vay React canh bao that: "Cannot update a component while rendering
  // a different component".
  const dragRef = useRef<{ mode: "move" | "resize"; deltaPx: number } | null>(null);
  const suppressClickRef = useRef(false);

  const displayTop = drag?.mode === "move" ? top + drag.deltaPx : top;
  const displayHeight =
    drag?.mode === "resize" ? Math.max(snapPx, height + drag.deltaPx) : height;
  const compact = forceCompact || displayHeight < 40;

  function startDrag(e: React.MouseEvent, mode: "move" | "resize") {
    if (e.button !== 0) return;
    if (!draggable) return;
    e.preventDefault();
    e.stopPropagation(); // khong de cot ngay hieu la keo-tao-viec
    const startClientY = e.clientY;
    const initial = { mode, deltaPx: 0 };
    dragRef.current = initial;
    setDrag(initial);

    function onMove(ev: MouseEvent) {
      const raw = ev.clientY - startClientY;
      const snapped = Math.round(raw / snapPx) * snapPx;
      if (Math.abs(snapped) >= snapPx) suppressClickRef.current = true;
      const next = { mode, deltaPx: snapped };
      dragRef.current = next;
      setDrag(next);
    }
    function onUp() {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      const final = dragRef.current;
      dragRef.current = null;
      setDrag(null);
      if (!final || final.deltaPx === 0) return;
      const deltaMinutes = Math.round((final.deltaPx / hourRowHeight) * 60);
      if (final.mode === "move") {
        const duration = endMin - startMin;
        const newStart = Math.min(
          Math.max(startMin + deltaMinutes, 0),
          24 * 60 - duration,
        );
        void onUpdateTime(newStart, newStart + duration);
      } else {
        const newEnd = Math.min(
          Math.max(endMin + deltaMinutes, startMin + snapMinutes),
          24 * 60,
        );
        void onUpdateTime(startMin, newEnd);
      }
    }
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }

  return (
    <>
      {/* Nhan gio "bay" luc keo - la SIBLING cua the (khong phai con ben
          trong) de khong bi overflow-hidden cua chinh the cat mat. */}
      {drag && (
        <div
          className="pointer-events-none absolute z-[5] -translate-y-full rounded-md px-2 py-1 text-[11px] font-semibold whitespace-nowrap text-white shadow-[0_3px_8px_rgba(20,30,50,.2)]"
          style={{
            top: displayTop - 4,
            left: `calc(${leftPercent}% + 4px)`,
            backgroundColor: color.main,
          }}
        >
          {minutesToLabel(
            Math.round((displayTop / hourRowHeight) * 60) + firstVisibleMinute,
            timeFormat,
          )}
          {" — "}
          {minutesToLabel(
            Math.round(((displayTop + displayHeight) / hourRowHeight) * 60) +
              firstVisibleMinute,
            timeFormat,
          )}
        </div>
      )}

      <div
        className="absolute z-[1]"
        style={{
          top: displayTop,
          height: displayHeight,
          left: `calc(${leftPercent}% + 4px)`,
          width: `calc(${widthPercent}% - 8px)`,
        }}
      >
        <PlannerItemCard
          item={item}
          variant="timed"
          overrides={overrides}
          badges={badges}
          timeFormat={timeFormat}
          height={compact ? 0 : displayHeight}
          selected={selected}
          completedStyle={completedStyle}
          className="h-full"
          onClick={() => {
            // Vua keo xong thi KHONG coi la click mo chi tiet.
            if (suppressClickRef.current) {
              suppressClickRef.current = false;
              return;
            }
            onOpen();
          }}
          style={draggable ? { cursor: "grab" } : undefined}
        >
          {/* Vung keo DI CHUYEN: phu than the, nhung de ho 10px duoi cho tay
              keo gian. pointer-events chi bat khi keo duoc. */}
          {draggable && (
            <>
              <span
                onMouseDown={(e) => startDrag(e, "move")}
                className="absolute inset-x-0 top-0 bottom-[10px] cursor-grab active:cursor-grabbing"
                aria-hidden="true"
              />
              <span
                onMouseDown={(e) => startDrag(e, "resize")}
                className="absolute inset-x-0 bottom-0 h-[10px] cursor-ns-resize"
                aria-hidden="true"
              />
            </>
          )}
          {conflict && (
            <span
              className="pointer-events-none absolute top-0.5 right-0.5 text-[10px] leading-none"
              title={`Trùng lịch với: ${entry.conflictWith.map((c) => c.title).join(", ")}`}
            >
              ⚠
            </span>
          )}
        </PlannerItemCard>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Luoi thang
// ---------------------------------------------------------------------------

const MAX_MONTH_CELL_ITEMS = 3;

function MonthGrid({
  anchor,
  selectedDate,
  itemsByDate,
  onSelectDate,
  onOpenItem,
}: {
  anchor: string;
  selectedDate: string;
  itemsByDate: Record<string, PlannerItem[]>;
  onSelectDate: (d: string) => void;
  onOpenItem: (id: string) => void;
}) {
  const overrides = useCategoryColorOverrides();
  const monthStart = startOfMonth(anchor);
  const monthEnd = endOfMonth(anchor);
  const leadingBlank = (new Date(monthStart).getDay() + 6) % 7; // 0 = T2
  const daysInMonth = Number(monthEnd.slice(8, 10));
  const today = toLocalISODate(new Date());

  const cells: (string | null)[] = [
    ...Array.from({ length: leadingBlank }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => addDays(monthStart, i)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-7 border-b border-[color:var(--planner-border-soft)]">
        {WEEKDAY_LABELS_MON_START.map((label) => (
          <span
            key={label}
            className="py-1.5 text-center text-[10px] font-semibold tracking-[.04em] text-[color:var(--planner-text-muted)] uppercase"
          >
            {label}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((d, i) => {
          if (!d) {
            return (
              <div
                key={`blank-${i}`}
                className="min-h-[92px] border-r border-b border-[color:var(--planner-border-soft)] bg-[color:var(--planner-surface-soft)]/40"
              />
            );
          }
          const dayItems = itemsByDate[d] ?? [];
          const shown = dayItems.slice(0, MAX_MONTH_CELL_ITEMS);
          const more = dayItems.length - shown.length;
          return (
            <button
              key={d}
              type="button"
              onClick={() => onSelectDate(d)}
              className={cn(
                "flex min-h-[92px] cursor-pointer flex-col items-stretch gap-0.5 border-r border-b border-[color:var(--planner-border-soft)] p-1 text-left hover:bg-[var(--planner-surface-soft)]",
                d === selectedDate && "bg-[color:var(--planner-primary-soft)]",
              )}
            >
              <span
                className={cn(
                  "mb-0.5 flex size-5 shrink-0 items-center justify-center self-start rounded-full text-[11px] font-semibold",
                  d === today
                    ? "bg-[color:var(--planner-primary)] text-white"
                    : "text-[color:var(--planner-text-secondary)]",
                )}
              >
                {Number(d.slice(8, 10))}
              </span>
              {shown.map((item) => (
                <PlannerItemCard
                  key={item.id}
                  item={item}
                  variant="compact"
                  overrides={overrides}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenItem(item.id);
                  }}
                />
              ))}
              {more > 0 && (
                <span className="pl-1.5 text-[10px] text-[color:var(--planner-text-muted)]">
                  +{more} nữa
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Lich thang nho (sidebar)
// ---------------------------------------------------------------------------

function MiniMonthCalendar({
  anchor,
  selectedDate,
  onSelect,
}: {
  anchor: string;
  selectedDate: string;
  onSelect: (date: string) => void;
}) {
  const monthStart = startOfMonth(anchor);
  const monthEnd = endOfMonth(anchor);
  const leadingBlank = (new Date(monthStart).getDay() + 6) % 7;
  const daysInMonth = Number(monthEnd.slice(8, 10));
  const today = toLocalISODate(new Date());
  const monthDate = new Date(anchor);

  const cells: (string | null)[] = [
    ...Array.from({ length: leadingBlank }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => addDays(monthStart, i)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="px-0.5 text-[12px] font-semibold text-[color:var(--planner-text-primary)]">
        {MONTH_LABELS_EN[monthDate.getMonth()]} {monthDate.getFullYear()}
      </span>
      <div className="grid grid-cols-7 gap-y-0.5">
        {["M", "T", "W", "T", "F", "S", "S"].map((l, i) => (
          <span
            key={i}
            className="text-center text-[9.5px] font-semibold text-[color:var(--planner-text-muted)]"
          >
            {l}
          </span>
        ))}
        {cells.map((d, i) =>
          d === null ? (
            <span key={`b-${i}`} />
          ) : (
            <button
              key={d}
              type="button"
              onClick={() => onSelect(d)}
              className={cn(
                "mx-auto flex size-6 cursor-pointer items-center justify-center rounded-full text-[11px] transition-colors",
                d === today
                  ? "bg-[color:var(--planner-primary)] font-semibold text-white"
                  : d === selectedDate
                    ? "bg-[color:var(--planner-primary-soft)] font-semibold text-[color:var(--planner-primary)]"
                    : "text-[color:var(--planner-text-secondary)] hover:bg-[var(--planner-surface-soft)]",
              )}
            >
              {Number(d.slice(8, 10))}
            </button>
          ),
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Panel chi tiet 1 ngay
// ---------------------------------------------------------------------------

function DayDetailPanel({
  dateKey,
  items,
  loading,
  overrides,
  badges,
  timeFormat,
  selectedItemId,
  onOpenItem,
  onToggleComplete,
  onAdd,
}: {
  dateKey: string;
  items: PlannerItem[];
  loading: boolean;
  overrides: CategoryColorOverrides;
  badges: CardBadgeVisibility;
  timeFormat: "24H" | "12H";
  selectedItemId: string | null;
  onOpenItem: (id: string) => void;
  onToggleComplete: (item: PlannerItem) => Promise<void> | void;
  onAdd: () => void;
}) {
  // Sap xep theo moc tren lich; viec khong co moc (khong xay ra o day vi
  // panel chi nhan item cua 1 ngay) xep cuoi.
  const sorted = useMemo(() => {
    const keyOf = (it: PlannerItem) => {
      if (it.scheduleKind === "ALL_DAY") return -1; // ca ngay len dau
      const iso = it.startAt ?? it.dueAt;
      return iso ? minutesOfDay(iso) : 24 * 60 + 1;
    };
    return [...items].sort((a, b) => keyOf(a) - keyOf(b));
  }, [items]);

  const doneCount = sorted.filter((i) => i.status === "COMPLETED").length;

  return (
    <aside className="flex w-full shrink-0 flex-col gap-2 rounded-[14px] border border-[color:var(--planner-border-soft)] bg-[color:var(--planner-surface)] p-3 shadow-[0_1px_2px_rgba(20,30,50,.04)] xl:w-[320px]">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="flex items-center gap-1.5 text-[13px] font-bold text-[color:var(--planner-text-primary)]">
            <CalendarDays size={13} className="text-[color:var(--planner-text-muted)]" />
            {formatLongDateVi(dateKey)}
          </h2>
          <p className="mt-0.5 text-[10.5px] text-[color:var(--planner-text-muted)]">
            {sorted.length === 0
              ? "Không có việc nào"
              : `${sorted.length} việc · ${doneCount} đã xong`}
          </p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          aria-label="Thêm việc cho ngày này"
          className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-[7px] border border-[color:var(--planner-border-soft)] bg-white text-[color:var(--planner-text-secondary)] hover:bg-[var(--planner-surface-soft)]"
        >
          <Plus size={13} />
        </button>
      </div>

      <div className="border-t border-[color:var(--planner-border-soft)]" />

      {loading && sorted.length === 0 ? (
        <PlannerSkeletonRows rows={3} />
      ) : sorted.length === 0 ? (
        <PlannerEmptyState
          title="Ngày này còn trống"
          hint="Kéo trên lưới giờ để tạo việc, hoặc bấm + ở trên."
        />
      ) : (
        <ul className="flex min-w-0 flex-col">
          {sorted.map((item) => (
            <li key={item.id} className="min-w-0">
              <PlannerItemCard
                item={item}
                variant="list"
                overrides={overrides}
                badges={badges}
                timeFormat={timeFormat}
                selected={selectedItemId === item.id}
                onClick={() => onOpenItem(item.id)}
                onToggleComplete={() => void onToggleComplete(item)}
              />
            </li>
          ))}
        </ul>
      )}

      {/* Chu thich mau category - giup doc duoc lich khong can mo tung the. */}
      <div className="mt-1 border-t border-[color:var(--planner-border-soft)] pt-2">
        <div className="flex flex-wrap gap-x-2.5 gap-y-1">
          {PLANNER_CATEGORIES.map((cat) => (
            <span key={cat} className="flex items-center gap-1">
              <CategoryDot category={cat} overrides={overrides} size={7} />
              <span className="text-[9.5px] text-[color:var(--planner-text-muted)]">
                {PLANNER_CATEGORY_META[cat].label}
              </span>
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
}
