"use client";

import { useEffect, useRef, useState } from "react";
import { useBookStore } from "./book-store";
import { updateBookAction } from "@/actions/life-book/update-book-action";

export type AutosaveStatus = "idle" | "saving" | "saved" | "error";

// Debounce 1.5s tu lan doi CUOI CUNG cua `book` trong store, PATCH full
// state len backend (BooksService.update() lam full-replace pages+blocks,
// xem books.service.ts). Bo qua lan chay DAU (book vua duoc setBook() tu
// server, chua co gi de "luu lai" ca).
//
// Goi qua updateBookAction (Server Action, "use server") thay vi goi thang
// updateBook()/apiFetch() tu hook client nay - apiFetch() can auth() cua
// next-auth, CHI chay duoc phia server (doc cookie qua next/headers). Goi
// thang tu client se lam auth() that bai im lang trong trinh duyet, khien
// MOI lan autosave deu rot vao catch() ben duoi -> toast "Lỗi khi lưu" va
// khong bao gio luu duoc that - dung bug da gap va sua.
export function useAutosave(bookId: string): AutosaveStatus {
  const book = useBookStore((s) => s.book);
  const [status, setStatus] = useState<AutosaveStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    if (!book) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setStatus("saving");
      updateBookAction(bookId, {
        title: book.title,
        ...(book.coverConfig ? { coverConfig: book.coverConfig } : {}),
        pages: book.pages.map((p) => ({
          id: p.id,
          order: p.order,
          blocks: p.blocks.map((b) => ({
            id: b.id,
            gridX: b.gridX,
            gridY: b.gridY,
            gridW: b.gridW,
            gridH: b.gridH,
            ...(b.content ? { content: b.content } : {}),
          })),
        })),
      })
        .then(() => setStatus("saved"))
        .catch(() => setStatus("error"));
    }, 1500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [book, bookId]);

  return status;
}
