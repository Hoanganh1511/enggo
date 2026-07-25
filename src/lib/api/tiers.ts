import { apiFetch } from "./client";
import type { ApiTier } from "./types";

export function getCategoryTiers(categoryId: string): Promise<ApiTier[]> {
  return apiFetch<ApiTier[]>(`/categories/${categoryId}/tiers`);
}

export function createTier(
  categoryId: string,
  data: { label: string; sublabel: string },
): Promise<ApiTier> {
  return apiFetch<ApiTier>(`/categories/${categoryId}/tiers`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateTier(
  tierId: string,
  data: { label?: string; sublabel?: string; orderIndex?: number },
): Promise<ApiTier> {
  return apiFetch<ApiTier>(`/tiers/${tierId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteTier(tierId: string): Promise<void> {
  return apiFetch<void>(`/tiers/${tierId}`, { method: "DELETE" });
}
