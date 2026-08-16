"use server";

import { markAllNotificationsRead } from "@/lib/api/notifications";

export async function markAllNotificationsReadAction() {
  return markAllNotificationsRead();
}
