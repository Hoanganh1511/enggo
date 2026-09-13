"use server";

import { listNotifications } from "@/lib/api/notifications";

export async function listNotificationsAction(cursor?: string) {
  return listNotifications(cursor);
}
