"use server";

import { createOrGetConversation } from "@/lib/api/chat";

export async function createConversationAction(username: string) {
  return createOrGetConversation(username);
}
