"use server";
import { getWorkspaceNotifications } from "@/lib/api/notifications";

export async function getWorkspaceNotificationsAction(workspaceId: string) {
  return getWorkspaceNotifications(workspaceId);
}
