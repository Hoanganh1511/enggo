"use server";

import { getUnreadNotificationCount } from "@/lib/api/notifications";

export async function getUnreadNotificationCountAction() {
  return getUnreadNotificationCount();
}
