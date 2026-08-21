"use server";

import { recallMessage } from "@/lib/api/chat";

export async function recallMessageAction(
  conversationId: string,
  messageId: string,
) {
  return recallMessage(conversationId, messageId);
}
