"use server";

import { listConversations } from "@/lib/api/chat";

export async function listConversationsAction() {
  return listConversations();
}
