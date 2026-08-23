"use server";

import { updateBook, type UpdateBookPayload } from "@/lib/api/books";

// Autosave (useAutosave.ts) chay tu client - apiFetch() ben trong updateBook()
// goi auth() (next-auth), la ham CHI chay duoc phia server (doc cookie/request
// qua next/headers). Goi thang updateBook() tu 1 hook "use client" se khien
// auth() that bai IM LANG trong trinh duyet, lam moi lan autosave deu rot vao
// .catch() -> toast "Lỗi khi lưu" - dung bug da gap. Server Action nay la lop
// trung gian BAT BUOC, dung DUNG pattern da co san trong app (vd
// actions/chat/create-conversation.ts) - chay that tren server (nen auth()
// hop le) nhung goi thang duoc tu client component/hook.
export async function updateBookAction(
  bookId: string,
  payload: UpdateBookPayload,
) {
  return updateBook(bookId, payload);
}
