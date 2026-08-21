"use server";

import { reactToMessage, removeReaction } from "@/lib/api/chat";

export async function reactToMessageAction(messageId: string, emoji: string) {
  return reactToMessage(messageId, emoji);
}

export async function removeReactionAction(messageId: string) {
  return removeReaction(messageId);
}
