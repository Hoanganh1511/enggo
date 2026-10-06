import { apiFetch } from "./client";
import type { LifeItemType, LifeItemPriority } from "@/lib/planner/life-item-types";

// API cho tinh nang Planner (/planner, trang MOI, doc lap voi /tracking dang
// khoa) - xem comment day du o backend (career-tree-api/src/planner/).
export type PlannerItemKind = "SIMPLE" | "BIG";
export type ApiPlannerItem = {
  id: string;
  date: string;
  title: string;
  kind: PlannerItemKind;
  // [2026-10-06] "Good Life - Life Management System" - xem comment day du
  // o life-item-types.ts. Mac dinh ACTION (item cu truoc migration nay).
  itemType: LifeItemType;
  scheduledMinute: number | null;
  // Mau the (hex "#rrggbb") - TRUONG CU, KHONG CON duoc doc de hien thi mau
  // (mau gio la semantic theo itemType, xem resolveLifeItemPalette()) - giu
  // lai field o day CHI de khop kieu API, khong dung o dau trong UI nua.
  color: string | null;
  // Thoi luong (phut) - null = chua dat, FE tu fallback ve 1 gia tri mac
  // dinh khi can ve UI (xem DEFAULT_DURATION_MINUTES trong PlannerShell.tsx).
  durationMinutes: number | null;
  // Nguoi dung tu danh dau "việc trọng tâm hôm nay" ("Today's Focus").
  isFocus: boolean;
  done: boolean;
  orderIndex: number;
  parentId: string | null;
  // --- Metadata CHUNG cho moi Type (section 8-16, optional/"progressive
  // disclosure" - khong bat buoc dien).
  priority: LifeItemPriority | null;
  status: string | null;
  area: string | null;
  project: string | null;
  tags: string[];
  deadline: string | null;
  // Field RIENG theo Type - xem EventMetadata/HabitMetadata/ReflectionMetadata
  // trong life-item-types.ts, UI tu cast dung kieu theo `itemType`.
  metadata: Record<string, unknown> | null;
  // [2026-10-07] Noi dung chi tiet tu do - yeu cau nguoi dung: "task cần
  // phải có phần viết nội dung chi tiết của task nữa".
  description: string | null;
  createdAt: string;
  updatedAt: string;
  // CHI co gia tri (mang, co the rong) o top-level item - item con (da co
  // parentId) khong co field nay (backend khong tra ve).
  children?: ApiPlannerItem[];
};
export type PlannerItemInput = {
  date: string;
  title: string;
  kind?: PlannerItemKind;
  itemType?: LifeItemType;
  scheduledMinute?: number;
  color?: string;
  durationMinutes?: number;
  isFocus?: boolean;
  // Truyen de chen 1 DAU VIEC CON vao duoi 1 planner "lớn" da co san thay vi
  // tao item top-level moi - xem PlannerService.create() o backend.
  parentId?: string;
  priority?: LifeItemPriority;
  status?: string;
  area?: string;
  project?: string;
  tags?: string[];
  deadline?: string;
  metadata?: Record<string, unknown>;
  description?: string;
};
export type PlannerItemUpdateInput = Partial<{
  title: string;
  done: boolean;
  itemType: LifeItemType;
  // null = xoa gia tri da dat (khac undefined = giu nguyen) - xem comment
  // PlannerService.update() o backend. Ap dung cho ca metadata moi (priority/
  // status/area/project/deadline/metadata), khong rieng scheduledMinute/color.
  scheduledMinute: number | null;
  color: string | null;
  durationMinutes: number | null;
  isFocus: boolean;
  orderIndex: number;
  priority: LifeItemPriority | null;
  status: string | null;
  area: string | null;
  project: string | null;
  tags: string[];
  deadline: string | null;
  metadata: Record<string, unknown> | null;
  description: string | null;
}>;

export function listPlannerItems(from: string, to: string): Promise<ApiPlannerItem[]> {
  return apiFetch<ApiPlannerItem[]>(
    `/planner/items?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
  );
}
export function createPlannerItem(dto: PlannerItemInput): Promise<ApiPlannerItem> {
  return apiFetch<ApiPlannerItem>("/planner/items", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}
export function updatePlannerItem(id: string, dto: PlannerItemUpdateInput): Promise<ApiPlannerItem> {
  return apiFetch<ApiPlannerItem>(`/planner/items/${id}`, {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
}
export function deletePlannerItem(id: string): Promise<void> {
  return apiFetch<void>(`/planner/items/${id}`, { method: "DELETE" });
}

// --- "User customization" (spec section 21) - palette rieng tung Type.
export type PlannerTypeColor = { type: LifeItemType; paletteId: string };
export function listPlannerTypeColors(): Promise<PlannerTypeColor[]> {
  return apiFetch<PlannerTypeColor[]>("/planner/type-colors");
}
export function setPlannerTypeColor(type: LifeItemType, paletteId: string): Promise<PlannerTypeColor> {
  return apiFetch<PlannerTypeColor>(`/planner/type-colors/${type}`, {
    method: "PATCH",
    body: JSON.stringify({ paletteId }),
  });
}
export function resetPlannerTypeColor(type: LifeItemType): Promise<void> {
  return apiFetch<void>(`/planner/type-colors/${type}`, { method: "DELETE" });
}
