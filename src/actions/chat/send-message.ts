"use server";

import { sendMessage, type SendMessageInput } from "@/lib/api/chat";

export async function sendMessageAction(
  conversationId: string,
  input: SendMessageInput,
) {
  return sendMessage(conversationId, input);
}
