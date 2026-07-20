import { apiFetch } from "./client";
import type { ApiNotification } from "./types";

export function getWorkspaceNotifications(
  workspaceId: string,
): Promise<ApiNotification[]> {
  return apiFetch<ApiNotification[]>(
    `/workspaces/${workspaceId}/notifications`,
  );
}

export function markNotificationRead(
  notificationId: string,
  read: boolean,
): Promise<ApiNotification> {
  return apiFetch<ApiNotification>(`/notifications/${notificationId}`, {
    method: "PATCH",
    body: JSON.stringify({ read }),
  });
}
