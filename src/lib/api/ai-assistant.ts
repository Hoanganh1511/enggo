import { apiFetch } from "./client";
import type { ChatMessage } from "./types";

export function askWorkspaceAssistant(
  workspaceId: string,
  messages: ChatMessage[],
): Promise<{ answer: string }> {
  return apiFetch<{ answer: string }>(
    `/workspaces/${workspaceId}/ai-assistant/ask`,
    {
      method: "POST",
      body: JSON.stringify({ messages }),
    },
  );
}
