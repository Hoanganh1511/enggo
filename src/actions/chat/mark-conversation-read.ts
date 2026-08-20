"use server";

import { markConversationRead } from "@/lib/api/chat";

export async function markConversationReadAction(conversationId: string) {
  return markConversationRead(conversationId);
}
