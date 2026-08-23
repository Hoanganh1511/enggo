import { create } from "zustand";
import { temporal } from "zundo";
import { immer } from "zustand/middleware/immer";
import { nanoid } from "nanoid";
import type { ApiBlock, ApiBook } from "@/lib/api/types";

type BlockPatch = Partial<
  Pick<ApiBlock, "gridX" | "gridY" | "gridW" | "gridH" | "content">
>;

export type BlockOrigin = { x: number; y: number; width: number; height: number };

type BookStoreState = {
  book: ApiBook | null;
  currentPageIndex: number;
  setBook: (book: ApiBook) => void;
  setCurrentPageIndex: (index: number) => void;
  updateBlock: (pageId: string, blockId: string, patch: BlockPatch) => void;
  addBlock: (pageId: string, patch?: Partial<BlockPatch>) => void;
  removeBlock: (pageId: string, blockId: string) => void;
  addPage: () => void;
  // UI-only (Phase 5: BlockModal.tsx) - id block dang mo trong modal, null =
  // dong. `openBlockOrigin` la getBoundingClientRect() cua block LUC CLICK
  // (GridBlock.tsx) - BlockModal.tsx animate "initial" THU CONG tu toa do
  // nay (khong dung layoutId - xem comment dai trong GridBlock.tsx ve ly do
  // layoutId hong khi nam trong cay 3D transform cua Book.tsx). Ca 2 field
  // deu KHONG thuoc noi dung sach nen KHONG can "undo" - zundo van chay qua
  // moi set() nhung `partialize` (o duoi) chi trich `book`, nen doi 2 field
  // nay khong tao ra 1 nac lich su undo/redo moi.
  openBlockId: string | null;
  openBlockOrigin: BlockOrigin | null;
  openBlock: (blockId: string, origin: BlockOrigin) => void;
  closeBlock: () => void;
};

// State cua GL Life Book editor (Phase 1: chi book/currentPageIndex + 5
// action co ban theo spec - Phase 2 se them useGridDrag/useBlockResize dua
// tren CUNG store nay). immer cho phep viet mutation "truc tiep" (state.book.pages...)
// ma van immutable duoi tay - zundo (temporal) bao ngoai immer de co
// undo/redo THAT tren lich su thay doi `book` (currentPageIndex CO Y khong
// track qua partialize, vi chuyen trang khong phai 1 hanh dong nguoi dung
// muon "undo").
export const useBookStore = create<BookStoreState>()(
  temporal(
    immer((set) => ({
      book: null,
      currentPageIndex: 0,

      setBook: (book) =>
        set((state) => {
          state.book = book;
        }),

      setCurrentPageIndex: (index) =>
        set((state) => {
          state.currentPageIndex = index;
        }),

      updateBlock: (pageId, blockId, patch) =>
        set((state) => {
          const page = state.book?.pages.find((p) => p.id === pageId);
          const block = page?.blocks.find((b) => b.id === blockId);
          if (block) Object.assign(block, patch);
        }),

      // id sinh o CLIENT (nanoid) - server chi upsert theo id nay (khong tu
      // sinh id cho Block), xem BlockDto o backend.
      addBlock: (pageId, patch) =>
        set((state) => {
          const page = state.book?.pages.find((p) => p.id === pageId);
          if (!page) return;
          page.blocks.push({
            id: nanoid(),
            pageId,
            gridX: patch?.gridX ?? 0,
            gridY: patch?.gridY ?? 0,
            gridW: patch?.gridW ?? 2,
            gridH: patch?.gridH ?? 2,
            content: patch?.content ?? null,
          });
        }),

      removeBlock: (pageId, blockId) =>
        set((state) => {
          const page = state.book?.pages.find((p) => p.id === pageId);
          if (!page) return;
          page.blocks = page.blocks.filter((b) => b.id !== blockId);
        }),

      addPage: () =>
        set((state) => {
          if (!state.book) return;
          const nextOrder =
            state.book.pages.length > 0
              ? Math.max(...state.book.pages.map((p) => p.order)) + 1
              : 0;
          state.book.pages.push({
            id: nanoid(),
            bookId: state.book.id,
            order: nextOrder,
            blocks: [],
          });
        }),

      openBlockId: null,
      openBlockOrigin: null,
      openBlock: (blockId, origin) =>
        set((state) => {
          state.openBlockId = blockId;
          state.openBlockOrigin = origin;
        }),
      // CHI xoa openBlockId, KHONG xoa openBlockOrigin - AnimatePresence can
      // render THEM 1 lan nua voi origin DUNG de choi hoat hinh "thu nho ve
      // vi tri block" (exit), nhung set() nay va state.open=false xay ra
      // CUNG luc; xoa origin song song se lam khung hinh exit đó mat toa do
      // dung mat. openBlockOrigin cu se don gian bi GHI DE o lan openBlock()
      // tiep theo, khong gay hai gi khi con "treo" lai giua 2 lan mo.
      closeBlock: () =>
        set((state) => {
          state.openBlockId = null;
        }),
    })),
    {
      partialize: (state) => ({ book: state.book }),
      limit: 50,
    },
  ),
);
