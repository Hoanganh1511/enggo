"use server";

import { searchMessages } from "@/lib/api/chat";

export async function searchMessagesAction(params: {
  q: string;
  conversationId?: string;
  sort?: "relevance" | "recent";
  cursor?: string;
  limit?: number;
}) {
  return searchMessages(params);
}
