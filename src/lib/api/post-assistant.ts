import { apiFetch } from "./client";
import type { ChatMessage } from "./types";

// "AI hỗ trợ" trong toolbar Composer.tsx - 1 doan dang viet + 1 yeu cau tu do
// -> tra ve 1 doan goi y de chen/thay vao editor.
export function improvePostDraft(
  content: string,
  instruction: string,
): Promise<{ suggestion: string }> {
  return apiFetch<{ suggestion: string }>("/post-assistant/improve", {
    method: "POST",
    body: JSON.stringify({ content, instruction }),
  });
}

// Tab "Trợ lý AI" trong Composer.tsx - chat nhieu luot VE bai dang viet,
// khong luu DB (Composer tu giu lich su cuc bo, giong WorkspaceAiAssistant).
export function chatAboutPostDraft(
  content: string,
  messages: ChatMessage[],
): Promise<{ answer: string }> {
  return apiFetch<{ answer: string }>("/post-assistant/chat", {
    method: "POST",
    body: JSON.stringify({ content, messages }),
  });
}
