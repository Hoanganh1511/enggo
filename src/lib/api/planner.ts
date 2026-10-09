import { apiFetch } from "./client";
import type {
  CategoryColor,
  ChecklistItem,
  PlannerCategory,
  PlannerItem,
  PlannerItemType,
  PlannerPriority,
  PlannerScheduleKind,
  PlannerStatus,
} from "@/lib/planner/planner-domain";

// API Planner - khop 1-1 voi career-tree-api/src/planner/.
//
// [2026-10-09] Refactor: shape cu (date + scheduledMinute + durationMinutes +
// kind/itemType/area/project/tags/metadata/colorPaletteId) da bi THAY HOAN
// TOAN. Khong con adapter - `PlannerItem` tra ve tu day dung TRUC TIEP trong
// UI, khong dich qua kieu trung gian nao.
//
// Kieu item dung CHUNG voi UI, dinh nghia o lib/planner/planner-domain.ts
// (nguon su that duy nhat) - re-export cho goi quen tay.
export type { PlannerItem } from "@/lib/planner/planner-domain";

// Tao moi: title + type la BAT BUOC; scheduleKind bo trong = backend dung
// mac dinh theo type (TASK->UNSCHEDULED, EVENT->TIMED, REMINDER->DEADLINE).
// Luat cheo field (TIMED can startAt+endAt, DEADLINE can dueAt...) do backend
// `normalizeSchedule()` kiem tra - FE goi `validateDraft()` truoc de bao loi
// tai cho, nhung backend van la chot cuoi.
export type CreatePlannerItemInput = {
  type: PlannerItemType;
  title: string;
  description?: string;
  category?: PlannerCategory;
  status?: PlannerStatus;
  priority?: PlannerPriority;
  scheduleKind?: PlannerScheduleKind;
  startAt?: string;
  endAt?: string;
  dueAt?: string;
  location?: string;
  meetingUrl?: string;
  checklist?: ChecklistItem[];
  recurrence?: Record<string, unknown>;
  orderIndex?: number;
};

// null = XOA gia tri da dat; undefined (vang mat) = GIU NGUYEN. Backend phan
// biet 2 truong hop nay (@ValidateIf trong UpdatePlannerItemDto).
export type UpdatePlannerItemInput = Partial<{
  type: PlannerItemType;
  title: string;
  description: string | null;
  category: PlannerCategory;
  status: PlannerStatus;
  priority: PlannerPriority;
  scheduleKind: PlannerScheduleKind;
  startAt: string | null;
  endAt: string | null;
  dueAt: string | null;
  location: string | null;
  meetingUrl: string | null;
  checklist: ChecklistItem[] | null;
  recurrence: Record<string, unknown> | null;
  orderIndex: number;
}>;

/**
 * Item co MAT trong khoang [from, to]: TIMED/ALL_DAY giao khoang, hoac
 * DEADLINE co dueAt trong khoang. KHONG tra ve item UNSCHEDULED - dung
 * `listUnscheduledPlannerItems()` cho nhung item do.
 */
export function listPlannerItems(from: string, to: string): Promise<PlannerItem[]> {
  return apiFetch<PlannerItem[]>(
    `/planner/items?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
  );
}

/** Viec chua xep lich - khong thuoc ngay nao nen phai lay rieng. */
export function listUnscheduledPlannerItems(): Promise<PlannerItem[]> {
  return apiFetch<PlannerItem[]>("/planner/items/unscheduled");
}

export function createPlannerItem(dto: CreatePlannerItemInput): Promise<PlannerItem> {
  return apiFetch<PlannerItem>("/planner/items", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}
export function updatePlannerItem(
  id: string,
  dto: UpdatePlannerItemInput,
): Promise<PlannerItem> {
  return apiFetch<PlannerItem>(`/planner/items/${id}`, {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
}
export function deletePlannerItem(id: string): Promise<void> {
  return apiFetch<void>(`/planner/items/${id}`, { method: "DELETE" });
}

// --- Mau theo CATEGORY (thay PlannerTypeColor cu: mau theo itemType +
// paletteId tu bo 14 palette). Gio luu truc tiep 3 hex main/light/border, de
// khop design reference, va vang mat 1 dong = dung mac dinh cua category.
export type PlannerCategoryColorRow = CategoryColor & { category: PlannerCategory };

export function listPlannerCategoryColors(): Promise<PlannerCategoryColorRow[]> {
  return apiFetch<PlannerCategoryColorRow[]>("/planner/category-colors");
}
export function setPlannerCategoryColor(
  category: PlannerCategory,
  color: CategoryColor,
): Promise<PlannerCategoryColorRow> {
  return apiFetch<PlannerCategoryColorRow>(`/planner/category-colors/${category}`, {
    method: "PATCH",
    body: JSON.stringify(color),
  });
}
export function resetPlannerCategoryColor(category: PlannerCategory): Promise<void> {
  return apiFetch<void>(`/planner/category-colors/${category}`, { method: "DELETE" });
}

// [2026-10-07] Settings modal - 1 object DUY NHAT/user. Khop 1-1 voi model
// PlannerSettings (schema.prisma) + UpdatePlannerSettingsDto.
export type PlannerSettings = {
  userId: string;
  weekStartsOn: "MONDAY" | "SUNDAY";
  timeFormat: "24H" | "12H";
  showWeekends: boolean;
  showAllDaySection: boolean;
  density: "COMPACT" | "COMFORTABLE";
  workingHoursStart: number;
  workingHoursEnd: number;
  firstVisibleHour: number;
  lastVisibleHour: number;
  timeSlotMinutes: 15 | 30 | 60;
  // [2026-10-09] showTaskType -> showCategory; bo showArea/showProject (cot
  // area/project da bi xoa); them showStatus/showLocation.
  showCategory: boolean;
  showStatus: boolean;
  showDuration: boolean;
  showLocation: boolean;
  showPriority: boolean;
  completedTaskDisplay: "KEEP_VISIBLE" | "COLLAPSE" | "HIDE";
  completedTaskStyle: "CHECK_ICON" | "CHECK_COLOR" | "DONE_BADGE" | "PATTERN";
};
export type PlannerSettingsPatch = Partial<Omit<PlannerSettings, "userId">>;

export function getPlannerSettings(): Promise<PlannerSettings> {
  return apiFetch<PlannerSettings>("/planner/settings");
}
export function updatePlannerSettings(patch: PlannerSettingsPatch): Promise<PlannerSettings> {
  return apiFetch<PlannerSettings>("/planner/settings", {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}
