import { apiFetch } from "./client";
import type { ApiCard, CardKind } from "./types";

export function getNodeCards(
  nodeId: string,
  params?: { cursor?: string; limit?: number },
): Promise<ApiCard[]> {
  const query = new URLSearchParams();
  if (params?.cursor) query.set("cursor", params.cursor);
  if (params?.limit) query.set("limit", String(params.limit));
  const qs = query.toString();
  return apiFetch<ApiCard[]>(`/nodes/${nodeId}/cards${qs ? `?${qs}` : ""}`);
}

export function createCard(
  nodeId: string,
  content: Record<string, unknown>,
  kind?: CardKind,
): Promise<ApiCard> {
  return apiFetch<ApiCard>(`/nodes/${nodeId}/cards`, {
    method: "POST",
    body: JSON.stringify({ content, kind }),
  });
}

export function updateCard(
  cardId: string,
  content: Record<string, unknown>,
): Promise<ApiCard> {
  return apiFetch<ApiCard>(`/cards/${cardId}`, {
    method: "PATCH",
    body: JSON.stringify({ content }),
  });
}

export function deleteCard(cardId: string): Promise<void> {
  return apiFetch<void>(`/cards/${cardId}`, { method: "DELETE" });
}
