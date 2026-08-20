"use server";

import { sendMessage } from "@/lib/api/chat";

export async function sendMessageAction(conversationId: string, content: string) {
  return sendMessage(conversationId, content);
}
