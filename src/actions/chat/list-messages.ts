"use server";

import { listMessages } from "@/lib/api/chat";

export async function listMessagesAction(
  conversationId: string,
  cursor?: string,
) {
  return listMessages(conversationId, cursor);
}
