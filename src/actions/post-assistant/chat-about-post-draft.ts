"use server";

import { chatAboutPostDraft } from "@/lib/api/post-assistant";
import type { ChatMessage } from "@/lib/api/types";

export async function chatAboutPostDraftAction(
  content: string,
  messages: ChatMessage[],
) {
  return chatAboutPostDraft(content, messages);
}
