import { apiFetch } from "./client";
import type {
  ApiChatMessage,
  ApiChatMessagePage,
  ApiConversationSummary,
  ApiMessageType,
  ApiPoll,
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

export type SendMessageInput = {
  type?: ApiMessageType;
  content?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentMimeType?: string;
  attachmentSize?: number;
  durationSeconds?: number;
  poll?: { question: string; options: { text: string }[] };
};

export function sendMessage(
  conversationId: string,
  input: SendMessageInput,
): Promise<ApiChatMessage> {
  return apiFetch<ApiChatMessage>(`/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify(input),
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

export function votePoll(pollId: string, optionId: string): Promise<ApiPoll> {
  return apiFetch<ApiPoll>(`/polls/${pollId}/vote`, {
    method: "POST",
    body: JSON.stringify({ optionId }),
  });
}

// Tim tin nhan cu trong 1 hoi thoai theo tu khoa (chi khop `content`) - xem
// ChatService.searchMessages o backend.
export function searchMessages(
  conversationId: string,
  query: string,
): Promise<ApiChatMessage[]> {
  const params = new URLSearchParams({ q: query });
  return apiFetch<ApiChatMessage[]>(
    `/conversations/${conversationId}/messages/search?${params.toString()}`,
  );
}
