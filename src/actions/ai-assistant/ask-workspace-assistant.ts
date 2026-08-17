"use server";

import { askWorkspaceAssistant } from "@/lib/api/ai-assistant";
import type { ChatMessage } from "@/lib/api/types";

// Client-callable truc tiep tu WorkspaceAiAssistant.tsx (panel chat) - khong
// streaming nen khong can Route Handler rieng, dung y het pattern
// getDocumentAction.
export async function askWorkspaceAssistantAction(
  workspaceId: string,
  messages: ChatMessage[],
) {
  return askWorkspaceAssistant(workspaceId, messages);
}
