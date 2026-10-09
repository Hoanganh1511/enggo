// [2026-10-09] NGUON SU THAT DUY NHAT cho Planner.
//
// Thay the 3 he type song song truoc day (deu da bi xoa):
//   - lib/planner/life-item-types.ts  (ACTION/EVENT/HABIT/REFLECTION + 21 palette)
//   - components/planner/calendar-types.ts (CalendarEvent/Reminder/SharedCalendar)
//   - lib/planner/calendar-events.ts  (CalendarEvent ngay le - chet, khong ai import)
// 3 file do tung export TRUNG TEN nhau (CalendarEvent, RecurrenceRule,
// PRIORITY_CONFIG) voi shape KHAC NHAU - nguon goc cua ca 1 lop adapter
// (calendar-model-bridge.ts) chi de dich qua lai. Gio chi con 1 model.
//
// Khop 1-1 voi backend (career-tree-api prisma/schema.prisma, migration
// 20261009000000_planner_refactor_task_event_reminder).

// ---------------------------------------------------------------------------
// Kieu loi
// ---------------------------------------------------------------------------

export type PlannerItemType = "TASK" | "EVENT" | "REMINDER";
export type PlannerCategory =
  | "STUDY"
  | "MEETING"
  | "DEADLINE"
  | "PERSONAL"
  | "SPORTS"
  | "CALL"
  | "BREAK"
  | "OTHER";
export type PlannerStatus =
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "NEEDS_ATTENTION"
  | "OVERDUE"
  | "CANCELLED";
export type PlannerPriority = "NONE" | "LOW" | "MEDIUM" | "HIGH";
export type PlannerScheduleKind =
  | "UNSCHEDULED"
  | "DEADLINE"
  | "TIMED"
  | "ALL_DAY";

export type ChecklistItem = { id: string; title: string; done: boolean };

export type PlannerItem = {
  id: string;
  type: PlannerItemType;
  title: string;
  description: string | null;
  category: PlannerCategory;
  status: PlannerStatus;
  priority: PlannerPriority;
  scheduleKind: PlannerScheduleKind;
  /** ISO 8601. TIMED: moc bat dau. ALL_DAY: 00:00 ngay dau. Con lai: null. */
  startAt: string | null;
  /** ISO 8601. TIMED: moc ket thuc. ALL_DAY: 00:00 ngay cuoi (BAO GOM). */
  endAt: string | null;
  /** ISO 8601 - CHI khi scheduleKind=DEADLINE. Co CA GIO (khac cot cu @db.Date). */
  dueAt: string | null;
  location: string | null;
  meetingUrl: string | null;
  checklist: ChecklistItem[];
  /** Luu duoc nhung CHUA sinh instance lap lai - xem GIOI HAN cuoi file. */
  recurrence: Record<string, unknown> | null;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
};

// ---------------------------------------------------------------------------
// Luat theo loai
// ---------------------------------------------------------------------------

export type PlannerTypeMeta = {
  label: string;
  /** Mo ta ngan dung o man chon loai khi tao moi. */
  description: string;
  allowedScheduleKinds: PlannerScheduleKind[];
  defaultScheduleKind: PlannerScheduleKind;
  /** Co the danh dau hoan thanh? (EVENT khong co khai niem "xong") */
  completable: boolean;
  /** Co o checklist khong? */
  supportsChecklist: boolean;
  /** Co dia diem / link hop khong? */
  supportsPlace: boolean;
};

export const PLANNER_TYPE_META: Record<PlannerItemType, PlannerTypeMeta> = {
  TASK: {
    label: "Task",
    description: "Việc cần làm — có thể chưa xếp lịch, có hạn chót, hoặc đặt khung giờ",
    allowedScheduleKinds: ["UNSCHEDULED", "DEADLINE", "TIMED"],
    defaultScheduleKind: "TIMED",
    completable: true,
    supportsChecklist: true,
    supportsPlace: false,
  },
  EVENT: {
    label: "Event",
    description: "Lịch hẹn — khung giờ cụ thể hoặc cả ngày (có thể nhiều ngày)",
    allowedScheduleKinds: ["TIMED", "ALL_DAY"],
    defaultScheduleKind: "TIMED",
    // Su kien khong "hoan thanh" - no dien ra roi qua di. Van huy duoc.
    completable: false,
    supportsChecklist: false,
    supportsPlace: true,
  },
  REMINDER: {
    label: "Reminder",
    description: "Lời nhắc tại một thời điểm cụ thể",
    allowedScheduleKinds: ["DEADLINE"],
    defaultScheduleKind: "DEADLINE",
    completable: true,
    supportsChecklist: false,
    supportsPlace: false,
  },
};

export const PLANNER_ITEM_TYPES: PlannerItemType[] = ["TASK", "EVENT", "REMINDER"];

// ---------------------------------------------------------------------------
// Mau theo CATEGORY - chep nguyen tu design reference
// (calendar-ui-configuration.md section 3 "Event category colors").
// Category tra loi "day la viec gi" -> quyet dinh mau the.
// ---------------------------------------------------------------------------

export type CategoryColor = { main: string; light: string; border: string };
export type PlannerCategoryMeta = CategoryColor & { label: string };

export const PLANNER_CATEGORY_META: Record<PlannerCategory, PlannerCategoryMeta> = {
  STUDY: { label: "Study / Learning", main: "#8B5CF6", light: "#F3E8FF", border: "#C4B5FD" },
  MEETING: { label: "Meeting", main: "#6366F1", light: "#EEF2FF", border: "#A5B4FC" },
  DEADLINE: { label: "Deadline / Important", main: "#EF4444", light: "#FEE2E2", border: "#FCA5A5" },
  PERSONAL: { label: "Personal / Life", main: "#EC4899", light: "#FCE7F3", border: "#F9A8D4" },
  SPORTS: { label: "Sports / Health", main: "#22C55E", light: "#DCFCE7", border: "#86EFAC" },
  CALL: { label: "Call / Communication", main: "#14B8A6", light: "#CCFBF1", border: "#5EEAD4" },
  BREAK: { label: "Break / Rest", main: "#F59E0B", light: "#FEF3C7", border: "#FCD34D" },
  OTHER: { label: "Other / Default", main: "#64748B", light: "#E2E8F0", border: "#CBD5E1" },
};

export const PLANNER_CATEGORIES = Object.keys(
  PLANNER_CATEGORY_META,
) as PlannerCategory[];

/** Ghi de mau theo user (backend: PlannerCategoryColor). */
export type CategoryColorOverrides = Partial<Record<PlannerCategory, CategoryColor>>;

export function resolveCategoryColor(
  category: PlannerCategory,
  overrides?: CategoryColorOverrides,
): CategoryColor {
  return overrides?.[category] ?? PLANNER_CATEGORY_META[category];
}

// ---------------------------------------------------------------------------
// Mau theo STATUS - design reference section 4.
// Status tra loi "dang o trang thai nao" - DOC LAP voi category. Khong to
// lai CA the theo status (de category van nhan ra duoc), chi dung o cham/
// badge/icon nho.
// ---------------------------------------------------------------------------

export type PlannerStatusMeta = {
  label: string;
  color: string;
  /** Gach ngang tieu de khi hien o the/danh sach? */
  strikeThrough: boolean;
  /** Nguoi dung co chon truc tiep trang thai nay khong? (OVERDUE la SUY RA) */
  selectable: boolean;
};

export const PLANNER_STATUS_META: Record<PlannerStatus, PlannerStatusMeta> = {
  SCHEDULED: { label: "Scheduled", color: "#6366F1", strikeThrough: false, selectable: true },
  IN_PROGRESS: { label: "In Progress", color: "#22C55E", strikeThrough: false, selectable: true },
  COMPLETED: { label: "Completed", color: "#94A3B8", strikeThrough: true, selectable: true },
  NEEDS_ATTENTION: { label: "Needs Attention", color: "#F59E0B", strikeThrough: false, selectable: true },
  // Khong cho chon tay: backend TU SUY RA tu dueAt/endAt so voi hien tai.
  OVERDUE: { label: "Overdue", color: "#EF4444", strikeThrough: false, selectable: false },
  CANCELLED: { label: "Cancelled", color: "#9CA3AF", strikeThrough: true, selectable: true },
};

export const SELECTABLE_STATUSES = (
  Object.keys(PLANNER_STATUS_META) as PlannerStatus[]
).filter((s) => PLANNER_STATUS_META[s].selectable);

// ---------------------------------------------------------------------------
// Priority - truyen dat DOC LAP voi ca category lan status (design reference
// section 4: "Priority is communicated independently").
// ---------------------------------------------------------------------------

export type PlannerPriorityMeta = { label: string; color: string; mark: string };

export const PLANNER_PRIORITY_META: Record<PlannerPriority, PlannerPriorityMeta> = {
  NONE: { label: "None", color: "#94A3B8", mark: "" },
  LOW: { label: "Low", color: "#6366F1", mark: "!" },
  MEDIUM: { label: "Medium", color: "#F59E0B", mark: "!!" },
  HIGH: { label: "High", color: "#EF4444", mark: "!!!" },
};

export const PLANNER_PRIORITIES: PlannerPriority[] = ["NONE", "LOW", "MEDIUM", "HIGH"];

// ---------------------------------------------------------------------------
// Truy xuat lich - KHONG noi nao tu doc startAt/endAt/dueAt rieng le, luon
// qua may ham nay de luat nam 1 cho.
// ---------------------------------------------------------------------------

export const PLANNER_SCHEDULE_KIND_LABEL: Record<PlannerScheduleKind, string> = {
  UNSCHEDULED: "Chưa xếp lịch",
  DEADLINE: "Hạn chót",
  TIMED: "Khung giờ",
  ALL_DAY: "Cả ngày",
};

/** Moc thoi gian dai dien de SAP XEP. null = chua xep lich (xep cuoi). */
export function itemSortTime(item: PlannerItem): number | null {
  const iso = item.startAt ?? item.dueAt;
  return iso ? new Date(iso).getTime() : null;
}

/** Item co chiem cho tren luoi gio khong (co gio bat dau/ket thuc that)? */
export function isTimed(item: PlannerItem): item is PlannerItem & {
  startAt: string;
  endAt: string;
} {
  return item.scheduleKind === "TIMED" && !!item.startAt && !!item.endAt;
}

export function isAllDay(item: PlannerItem): boolean {
  return item.scheduleKind === "ALL_DAY" && !!item.startAt;
}

export function isUnscheduled(item: PlannerItem): boolean {
  return item.scheduleKind === "UNSCHEDULED";
}

/** YYYY-MM-DD theo gio DIA PHUONG cua may nguoi dung. */
export function toLocalDateKey(d: Date): string {
  const p = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Cac ngay (YYYY-MM-DD) ma item nay xuat hien tren lich. */
export function itemDateKeys(item: PlannerItem): string[] {
  if (item.scheduleKind === "UNSCHEDULED") return [];
  if (item.scheduleKind === "DEADLINE") {
    return item.dueAt ? [toLocalDateKey(new Date(item.dueAt))] : [];
  }
  if (!item.startAt) return [];
  const start = new Date(item.startAt);
  const end = item.endAt ? new Date(item.endAt) : start;
  const keys: string[] = [];
  const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  // Chan vong lap chay xa (du lieu hong) - 1 item khong the dai qua 1 nam.
  for (let i = 0; cur <= last && i < 366; i++) {
    keys.push(toLocalDateKey(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return keys;
}

/** Phut tinh tu 00:00 ngay dia phuong - dung dat vi tri tren luoi gio. */
export function minutesOfDay(iso: string): number {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
}

export function itemDurationMinutes(item: PlannerItem): number | null {
  if (!isTimed(item)) return null;
  return Math.round(
    (new Date(item.endAt).getTime() - new Date(item.startAt).getTime()) / 60000,
  );
}

/** Tien do checklist - null neu item khong co checklist. */
export function checklistProgress(
  item: PlannerItem,
): { done: number; total: number } | null {
  if (!item.checklist?.length) return null;
  return {
    done: item.checklist.filter((c) => c.done).length,
    total: item.checklist.length,
  };
}

export function isFinished(item: PlannerItem): boolean {
  return item.status === "COMPLETED" || item.status === "CANCELLED";
}

// ---------------------------------------------------------------------------
// Validate - DUNG 1 bo luat voi backend (PlannerService.normalizeSchedule).
// Form goi truoc khi submit de bao loi tai cho thay vi doi 400 tu server.
// ---------------------------------------------------------------------------

export type PlannerDraft = {
  type: PlannerItemType;
  title: string;
  scheduleKind: PlannerScheduleKind;
  startAt: string | null;
  endAt: string | null;
  dueAt: string | null;
  meetingUrl: string | null;
};

/** Tra ve map field -> thong bao loi. Rong = hop le. */
export function validateDraft(d: PlannerDraft): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!d.title.trim()) errors.title = "Tiêu đề không được để trống.";

  const allowed = PLANNER_TYPE_META[d.type].allowedScheduleKinds;
  if (!allowed.includes(d.scheduleKind)) {
    errors.scheduleKind = `${PLANNER_TYPE_META[d.type].label} không hỗ trợ "${PLANNER_SCHEDULE_KIND_LABEL[d.scheduleKind]}".`;
  } else if (d.scheduleKind === "DEADLINE") {
    if (!d.dueAt) errors.dueAt = "Cần chọn thời điểm hạn chót.";
  } else if (d.scheduleKind === "TIMED") {
    if (!d.startAt) errors.startAt = "Cần giờ bắt đầu.";
    if (!d.endAt) errors.endAt = "Cần giờ kết thúc.";
    if (d.startAt && d.endAt && new Date(d.endAt) <= new Date(d.startAt)) {
      errors.endAt = "Giờ kết thúc phải sau giờ bắt đầu.";
    }
  } else if (d.scheduleKind === "ALL_DAY") {
    if (!d.startAt) errors.startAt = "Cần ngày bắt đầu.";
    if (d.startAt && d.endAt && new Date(d.endAt) < new Date(d.startAt)) {
      errors.endAt = "Ngày kết thúc phải từ ngày bắt đầu trở đi.";
    }
  }

  if (d.meetingUrl && d.meetingUrl.trim()) {
    const v = d.meetingUrl.trim();
    try {
      new URL(v.includes("://") ? v : `https://${v}`);
    } catch {
      errors.meetingUrl = "Link không hợp lệ.";
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// GIOI HAN DA BIET (ghi ro de khong ai hieu nham la da lam xong)
// ---------------------------------------------------------------------------
// - `recurrence` LUU duoc nhung CHUA sinh instance: 1 item lap lai van chi la
//   1 dong, khong tu nhan ban ra cac lan xuat hien tiep theo tren lich, va
//   chua co luong sua "chi lan nay / lan nay va sau / tat ca".
// - OVERDUE do BACKEND suy ra luc doc (khong luu trong DB) - FE khong tu tinh
//   lai, chi hien theo `status` nhan duoc.
