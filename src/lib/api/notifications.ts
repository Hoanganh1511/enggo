import { apiFetch } from "./client";
import type { ApiNotification, ApiNotificationPage } from "./types";

export type NotificationFilter = "all" | "requests";

export function listNotifications(
  filter: NotificationFilter = "all",
  cursor?: string,
  limit?: number,
): Promise<ApiNotificationPage> {
  const params = new URLSearchParams();
  if (filter === "requests") params.set("filter", "requests");
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
