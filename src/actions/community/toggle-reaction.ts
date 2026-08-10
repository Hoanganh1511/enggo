"use server";
import { toggleReaction } from "@/lib/api/reactions";

export async function toggleReactionAction(postId: string, emoji: string) {
  return toggleReaction(postId, emoji);
}
