import { apiFetch } from "./client";

// API cho tinh nang Planner (/planner, trang MOI, doc lap voi /tracking dang
// khoa) - xem comment day du o backend (career-tree-api/src/planner/).
export type PlannerItemKind = "SIMPLE" | "BIG";
export type ApiPlannerItem = {
  id: string;
  date: string;
  title: string;
  kind: PlannerItemKind;
  scheduledMinute: number | null;
  done: boolean;
  orderIndex: number;
  parentId: string | null;
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
  scheduledMinute?: number;
  // Truyen de chen 1 DAU VIEC CON vao duoi 1 planner "lớn" da co san thay vi
  // tao item top-level moi - xem PlannerService.create() o backend.
  parentId?: string;
};
export type PlannerItemUpdateInput = Partial<{
  title: string;
  done: boolean;
  // null = xoa gio da dat (khac undefined = giu nguyen) - xem comment
  // PlannerService.update() o backend.
  scheduledMinute: number | null;
  orderIndex: number;
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
