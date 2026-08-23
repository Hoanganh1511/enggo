import { apiFetch } from "./client";
import type { ApiBook, ApiPage } from "./types";

// GL Life Book - CHUA co auth that o backend (BooksController dung
// @Public() + hardcode "demo-user", xem Phase 1 backend) nen apiFetch van
// hoat dong binh thuong du session dang nhap co hay khong (Authorization
// header co gui cung khong anh huong, backend khong doc no cho route nay).
export function getBook(bookId: string): Promise<ApiBook> {
  return apiFetch<ApiBook>(`/books/${bookId}`);
}

export type UpdateBookPayload = {
  title?: string;
  coverConfig?: Record<string, unknown>;
  pages?: {
    id: string;
    order: number;
    blocks: {
      id: string;
      gridX: number;
      gridY: number;
      gridW: number;
      gridH: number;
      content?: Record<string, unknown>;
    }[];
  }[];
};

export function updateBook(
  bookId: string,
  payload: UpdateBookPayload,
): Promise<ApiBook> {
  return apiFetch<ApiBook>(`/books/${bookId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function addBookPage(
  bookId: string,
  order?: number,
): Promise<ApiPage> {
  return apiFetch<ApiPage>(`/books/${bookId}/pages`, {
    method: "POST",
    body: JSON.stringify(order !== undefined ? { order } : {}),
  });
}

export function removeBookPage(
  bookId: string,
  pageId: string,
): Promise<void> {
  return apiFetch<void>(`/books/${bookId}/pages/${pageId}`, {
    method: "DELETE",
  });
}
