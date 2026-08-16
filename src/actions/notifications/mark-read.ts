"use server";

import { markNotificationRead } from "@/lib/api/notifications";

export async function markNotificationReadAction(id: string) {
  return markNotificationRead(id);
}
