"use server";

import {
  markConversationUnread,
  updateConversationSettings,
  type ConversationSettingsInput,
} from "@/lib/api/chat";

export async function updateConversationSettingsAction(
  conversationId: string,
  input: ConversationSettingsInput,
) {
  return updateConversationSettings(conversationId, input);
}

export async function markConversationUnreadAction(conversationId: string) {
  return markConversationUnread(conversationId);
}
