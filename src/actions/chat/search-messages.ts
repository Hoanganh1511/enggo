"use server";

import { searchMessages } from "@/lib/api/chat";

export async function searchMessagesAction(conversationId: string, query: string) {
  return searchMessages(conversationId, query);
}
