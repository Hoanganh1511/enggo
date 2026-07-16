import { apiFetch } from "./client";
import type { ApiCard } from "./types";

export function getNodeCards(nodeId: string): Promise<ApiCard[]> {
  return apiFetch<ApiCard[]>(`/nodes/${nodeId}/cards`);
}

export function createCard(
  nodeId: string,
  content: Record<string, unknown>,
): Promise<ApiCard> {
  return apiFetch<ApiCard>(`/nodes/${nodeId}/cards`, {
    method: "POST",
    body: JSON.stringify({ content }),
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
