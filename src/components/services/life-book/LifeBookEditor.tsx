"use client";

import { startTransition, useEffect } from "react";
import { useBookStore } from "@/lib/life-book/book-store";
import { useAutosave } from "@/lib/life-book/use-autosave";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Book } from "./Book";
import { BlockModal } from "./BlockModal";
import type { ApiBook } from "@/lib/api/types";

// Phase 2 - them <Book /> (shell lat trang 3D that, CHUA co grid/drag/resize
// ben trong tung trang) len TREN cung. Phan JSON viewer + nut test ben duoi
// GIU NGUYEN tu Phase 1 (van con dung de kiem tra store/autosave/undo-redo -
// se don dep khi co UI edit that thay the o phase sau).
export function LifeBookEditor({ book }: { book: ApiBook }) {
  const setBook = useBookStore((s) => s.setBook);
  const storeBook = useBookStore((s) => s.book);
  const addBlock = useBookStore((s) => s.addBlock);
  const updateBlock = useBookStore((s) => s.updateBlock);
  const removeBlock = useBookStore((s) => s.removeBlock);
  const addPage = useBookStore((s) => s.addPage);
  const undo = useBookStore.temporal.getState().undo;
  const redo = useBookStore.temporal.getState().redo;

  // Hydrate store tu book fetch o server - startTransition de khong vi pham
  // react-hooks/set-state-in-effect (dung pattern giong useChangelogUnseen.ts).
  useEffect(() => {
    startTransition(() => setBook(book));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const status = useAutosave(book.id);

  if (!storeBook) {
    return (
      <div className="flex h-40 items-center justify-center">
        <LoadingSpinner size={20} className="text-ink-faint" />
      </div>
    );
  }

  // order===0 LUON la trang Muc luc - KHONG render PageGrid (xem
  // BookPageFace.tsx), nen block them vao do se KHONG BAO GIO hien UI du
  // van luu that trong store/JSON (dung 1 loi da gap: nut debug nay truoc
  // day dung pages[0], vo tinh nham dung trang Muc luc). Lay trang NOI DUNG
  // THAT dau tien de nut test o day con y nghia.
  const firstContentPage = storeBook.pages.find((p) => p.order !== 0);

  return (
    <div className="relative p-6">
      <AutosaveIndicator status={status} />

      <Book title={storeBook.title} pages={storeBook.pages} />
      <BlockModal />

      <h1 className="text-lg font-bold text-ink">{storeBook.title}</h1>
      <p className="mt-1 text-xs text-ink-faint">Book ID: {storeBook.id}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={addPage}
          className="cursor-pointer rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-ink hover:bg-hover-bg"
        >
          + Add page
        </button>
        {firstContentPage && (
          <>
            <button
              type="button"
              onClick={() => addBlock(firstContentPage.id)}
              className="cursor-pointer rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-ink hover:bg-hover-bg"
            >
              + Add block (trang nội dung đầu tiên)
            </button>
            {firstContentPage.blocks[0] && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    updateBlock(firstContentPage.id, firstContentPage.blocks[0].id, {
                      gridX: (firstContentPage.blocks[0].gridX + 1) % 9,
                    })
                  }
                  className="cursor-pointer rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-ink hover:bg-hover-bg"
                >
                  Move block[0] gridX+1
                </button>
                <button
                  type="button"
                  onClick={() =>
                    removeBlock(firstContentPage.id, firstContentPage.blocks[0].id)
                  }
                  className="cursor-pointer rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-ink hover:bg-hover-bg"
                >
                  Remove block[0]
                </button>
              </>
            )}
          </>
        )}
        <button
          type="button"
          onClick={() => undo()}
          className="cursor-pointer rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-ink hover:bg-hover-bg"
        >
          Undo
        </button>
        <button
          type="button"
          onClick={() => redo()}
          className="cursor-pointer rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-ink hover:bg-hover-bg"
        >
          Redo
        </button>
      </div>

      <pre className="mt-5 max-h-[60vh] overflow-auto rounded-lg border border-border bg-surface-muted p-4 text-xs text-ink">
        {JSON.stringify(storeBook, null, 2)}
      </pre>
    </div>
  );
}

function AutosaveIndicator({
  status,
}: {
  status: "idle" | "saving" | "saved" | "error";
}) {
  if (status === "idle") return null;

  const label =
    status === "saving"
      ? "Đang lưu..."
      : status === "saved"
        ? "Đã lưu"
        : "Lỗi khi lưu";

  return (
    <div className="fixed top-20 right-5 z-50 flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink shadow-dropdown">
      {status === "saving" && <LoadingSpinner size={12} />}
      {label}
    </div>
  );
}
