import { apiFetch } from "./client";
import type {
  ApiChatMessage,
  ApiChatMessagePage,
  ApiConversationSummary,
} from "./types";

export function listConversations(): Promise<ApiConversationSummary[]> {
  return apiFetch<ApiConversationSummary[]>("/conversations");
}

// Tim hoi thoai 1-1 co san voi username, tao moi neu chua co - dung boi nut
// "Nhắn tin" tren profile.
export function createOrGetConversation(
  username: string,
): Promise<ApiConversationSummary> {
  return apiFetch<ApiConversationSummary>("/conversations", {
    method: "POST",
    body: JSON.stringify({ username }),
  });
}

export function listMessages(
  conversationId: string,
  cursor?: string,
  limit?: number,
): Promise<ApiChatMessagePage> {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  if (limit) params.set("limit", String(limit));
  const qs = params.toString();
  return apiFetch<ApiChatMessagePage>(
    `/conversations/${conversationId}/messages${qs ? `?${qs}` : ""}`,
  );
}

export function sendMessage(
  conversationId: string,
  content: string,
): Promise<ApiChatMessage> {
  return apiFetch<ApiChatMessage>(`/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

export function markConversationRead(conversationId: string) {
  return apiFetch<{ readAt: string }>(`/conversations/${conversationId}/read`, {
    method: "POST",
  });
}

export function getUnreadChatCount(): Promise<{ count: number }> {
  return apiFetch<{ count: number }>("/conversations/unread-count");
}
