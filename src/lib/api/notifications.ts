import { apiFetch } from "./client";
import type { ApiNotification, ApiNotificationPage } from "./types";

// Truoc day co filter "requests" (yeu cau cong tac nhom kien thuc, da bo
// cung tinh nang Workspace/KnowledgeGroup 2026-09-14) - gio chi con 1 danh
// sach FOLLOW duy nhat.
export function listNotifications(
  cursor?: string,
  limit?: number,
): Promise<ApiNotificationPage> {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  if (limit) params.set("limit", String(limit));
  const qs = params.toString();
  return apiFetch<ApiNotificationPage>(`/notifications${qs ? `?${qs}` : ""}`);
}

export function getUnreadNotificationCount(): Promise<{ count: number }> {
  return apiFetch<{ count: number }>(`/notifications/unread-count`);
}

export function markNotificationRead(id: string): Promise<ApiNotification> {
  return apiFetch<ApiNotification>(`/notifications/${id}/read`, {
    method: "PATCH",
  });
}

export function markAllNotificationsRead(): Promise<{ markedAt: string }> {
  return apiFetch<{ markedAt: string }>(`/notifications/read-all`, {
    method: "POST",
  });
}
