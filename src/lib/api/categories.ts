import { apiFetch } from "./client";
import type { ApiCategory } from "./types";

export function getWorkspaceCategories(
  workspaceId: string,
): Promise<ApiCategory[]> {
  return apiFetch<ApiCategory[]>(`/workspaces/${workspaceId}/categories`);
}

export function createCategory(
  workspaceId: string,
  data: { name: string; description?: string; icon?: string; color?: string },
): Promise<ApiCategory> {
  return apiFetch<ApiCategory>(`/workspaces/${workspaceId}/categories`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateCategory(
  categoryId: string,
  data: {
    name?: string;
    description?: string;
    icon?: string;
    color?: string;
    orderIndex?: number;
  },
): Promise<ApiCategory> {
  return apiFetch<ApiCategory>(`/categories/${categoryId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteCategory(categoryId: string): Promise<void> {
  return apiFetch<void>(`/categories/${categoryId}`, { method: "DELETE" });
}
