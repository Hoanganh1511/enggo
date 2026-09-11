"use server";
import { getOnlineStatus } from "@/lib/api/users";

export async function getOnlineStatusAction(usernames: string[]) {
  return getOnlineStatus(usernames);
}
