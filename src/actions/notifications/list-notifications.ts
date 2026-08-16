"use server";

import { listNotifications, type NotificationFilter } from "@/lib/api/notifications";

export async function listNotificationsAction(
  filter: NotificationFilter = "all",
  cursor?: string,
) {
  return listNotifications(filter, cursor);
}
