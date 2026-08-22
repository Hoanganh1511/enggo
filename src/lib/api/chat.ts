import { apiFetch } from "./client";
import type {
  ApiChatMessage,
  ApiChatMessagePage,
  ApiConversationSummary,
  ApiMessageReaction,
  ApiMessageSearchPage,
  ApiMessageType,
  ApiPoll,
  GroupAvatarColor,
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

export function createGroupConversation(
  name: string,
  memberIds: string[],
  avatarColor: GroupAvatarColor,
): Promise<ApiConversationSummary> {
  return apiFetch<ApiConversationSummary>("/conversations/group", {
    method: "POST",
    body: JSON.stringify({ name, memberIds, avatarColor }),
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
  replyToId?: string;
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

// Full-text search tin nhan (rank/snippet/phan trang) - dung chung cho ca
// popup search trong 1 hoi thoai (truyen conversationId) lan drawer "Xem tat
// ca ket qua" - xem ChatSearchService.search() o backend.
export function searchMessages(params: {
  q: string;
  conversationId?: string;
  sort?: "relevance" | "recent";
  cursor?: string;
  limit?: number;
}): Promise<ApiMessageSearchPage> {
  const usp = new URLSearchParams({ q: params.q });
  if (params.conversationId) usp.set("conversationId", params.conversationId);
  if (params.sort) usp.set("sort", params.sort);
  if (params.cursor) usp.set("cursor", params.cursor);
  if (params.limit) usp.set("limit", String(params.limit));
  return apiFetch<ApiMessageSearchPage>(
    `/conversations/messages/search?${usp.toString()}`,
  );
}

export function recallMessage(
  conversationId: string,
  messageId: string,
): Promise<ApiChatMessage> {
  return apiFetch<ApiChatMessage>(
    `/conversations/${conversationId}/messages/${messageId}/recall`,
    { method: "POST" },
  );
}

export function reactToMessage(
  messageId: string,
  emoji: string,
): Promise<{ messageId: string; reactions: ApiMessageReaction[] }> {
  return apiFetch(`/messages/${messageId}/reactions`, {
    method: "PUT",
    body: JSON.stringify({ emoji }),
  });
}

export function removeReaction(
  messageId: string,
): Promise<{ messageId: string; reactions: ApiMessageReaction[] }> {
  return apiFetch(`/messages/${messageId}/reactions`, { method: "DELETE" });
}

export type ConversationSettingsInput = {
  isFavorite?: boolean;
  isMuted?: boolean;
  isRestricted?: boolean;
};

export function updateConversationSettings(
  conversationId: string,
  input: ConversationSettingsInput,
): Promise<ConversationSettingsInput> {
  return apiFetch(`/conversations/${conversationId}/settings`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function markConversationUnread(
  conversationId: string,
): Promise<{ unreadCount: number }> {
  return apiFetch(`/conversations/${conversationId}/mark-unread`, {
    method: "POST",
  });
}
