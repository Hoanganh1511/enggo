"use server";

import { getUnreadChatCount } from "@/lib/api/chat";

export async function getUnreadChatCountAction() {
  return getUnreadChatCount();
}
