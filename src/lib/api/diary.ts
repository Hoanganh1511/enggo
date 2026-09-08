import { apiFetch } from "./client";
import type { ApiDiaryEntry, ApiDiaryTopic } from "./types";

export type DiaryTopicInput = { name: string };
export type DiaryEntryInput = {
  title: string;
  content: string;
  // "YYYY-MM-DD".
  entryDate: string;
};

// Toan bo route duoi day nam sau AdminGuard o backend (xem
// career-tree-api/src/diary/diary.controller.ts) - chi tai khoan admin duy
// nhat goi thanh cong, nguoi khac nhan 403.
export function listDiaryTopics(): Promise<ApiDiaryTopic[]> {
  return apiFetch<ApiDiaryTopic[]>("/diary/topics");
}

export function createDiaryTopic(
  dto: DiaryTopicInput,
): Promise<ApiDiaryTopic> {
  return apiFetch<ApiDiaryTopic>("/diary/topics", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export function updateDiaryTopic(
  id: string,
  dto: Partial<DiaryTopicInput>,
): Promise<ApiDiaryTopic> {
  return apiFetch<ApiDiaryTopic>(`/diary/topics/${id}`, {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
}

export function deleteDiaryTopic(id: string): Promise<void> {
  return apiFetch<void>(`/diary/topics/${id}`, { method: "DELETE" });
}

export function listDiaryEntries(topicId: string): Promise<ApiDiaryEntry[]> {
  return apiFetch<ApiDiaryEntry[]>(`/diary/topics/${topicId}/entries`);
}

export function createDiaryEntry(
  topicId: string,
  dto: DiaryEntryInput,
): Promise<ApiDiaryEntry> {
  return apiFetch<ApiDiaryEntry>(`/diary/topics/${topicId}/entries`, {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export function updateDiaryEntry(
  id: string,
  dto: Partial<DiaryEntryInput>,
): Promise<ApiDiaryEntry> {
  return apiFetch<ApiDiaryEntry>(`/diary/entries/${id}`, {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
}

export function deleteDiaryEntry(id: string): Promise<void> {
  return apiFetch<void>(`/diary/entries/${id}`, { method: "DELETE" });
}
