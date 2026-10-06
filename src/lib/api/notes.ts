import { apiFetch } from "./client";
import type { NoteType } from "@/lib/notes/note-types";

// Module "Notes" - lop ghi chu ca nhan cua nguoi dung, gan vao 1 doan text cu
// the trong 1 Series Entry (hoac khong gan doan nao - "+ Add a note" thu
// cong). Thiet ke 1 resource PHANG `/notes` (khong long duoi /content-series/:slug/...
// nhu cac route soan Entry) vi Note query theo 2 chieu KHAC nhau tuy ngu
// canh (1 Entry CU THE, hoac TOAN BO 1 Series cho view "All notes") VA luon
// loc theo nguoi dung dang dang nhap (backend tu lay tu token, khong nhan
// userId tu client) - xem career-tree-api/src/notes/**.
export type Note = {
  id: string;
  entryId: string;
  entrySlug: string;
  seriesSlug: string;
  type: NoteType;
  content: string;
  tags: string[];
  // Doan trich goc (de dinh vi lai trong bai - xem text-anchor.ts) - rong het
  // ca 3 truong khi la note thu cong (khong gan doan nao).
  quoteText: string;
  quotePrefix: string;
  quoteSuffix: string;
  createdAt: string;
  updatedAt: string;
};

export type NoteInput = {
  entryId: string;
  entrySlug: string;
  seriesSlug: string;
  type: NoteType;
  content: string;
  tags: string[];
  quoteText?: string;
  quotePrefix?: string;
  quoteSuffix?: string;
};

export function listNotesForEntry(entryId: string): Promise<Note[]> {
  return apiFetch<Note[]>(`/notes?entryId=${encodeURIComponent(entryId)}`);
}

export function listNotesForSeries(seriesSlug: string): Promise<Note[]> {
  return apiFetch<Note[]>(`/notes?seriesSlug=${encodeURIComponent(seriesSlug)}`);
}

export function createNote(input: NoteInput): Promise<Note> {
  return apiFetch<Note>("/notes", { method: "POST", body: JSON.stringify(input) });
}

export function updateNote(
  id: string,
  input: Partial<Pick<NoteInput, "type" | "content" | "tags">>,
): Promise<Note> {
  return apiFetch<Note>(`/notes/${id}`, { method: "PATCH", body: JSON.stringify(input) });
}

export function deleteNote(id: string): Promise<void> {
  return apiFetch<void>(`/notes/${id}`, { method: "DELETE" });
}
