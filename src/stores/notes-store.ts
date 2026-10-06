import { create } from "zustand";

export type PendingQuote = { quoteText: string; quotePrefix: string; quoteSuffix: string } | null;

export type NotesContext = { seriesSlug: string; entryId: string | null; entrySlug: string | null };

type NotesState = {
  // Panel truot ben phai - nut mo (SeriesNotesLauncher, mount trong layout
  // (read)/layout.tsx) VA nut "✦ Note"/marker le (ArticleSelectionToolbar.tsx/
  // ArticleNoteMarkers.tsx, mount trong [entrySlug]/page.tsx) nam KHAC nhanh
  // component - dung chung 1 store thay vi truyen props xuyen nhieu tang
  // (cung tinh than series-sidebar-drawer-store.ts).
  panelOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;

  // Form them/sua 1 note - `quote` khac null khi mo TU 1 doan bo den chon
  // trong bai (gan Source reference); null = "+ Add a note" thu cong (khong
  // gan doan trich nao). `editingId` khac null = dang SUA note co san (thay
  // vi tao moi).
  addFormOpen: boolean;
  addFormQuote: PendingQuote;
  editingId: string | null;
  openAddForm: (quote: PendingQuote) => void;
  openEditForm: (id: string) => void;
  closeAddForm: () => void;

  // Ngu canh bai dang xem - [entrySlug]/page.tsx tu dang ky luc mount (Entry
  // page moi co du lieu nay, trang Overview Series thi khong, panel se mac
  // dinh scope "series" khi entryId/entrySlug rong - xem NotesPanel.tsx).
  context: NotesContext | null;
  setContext: (ctx: NotesContext | null) => void;

  // "Notes from this article" / "All notes" (spec: "trong article, panel
  // mặc định Notes from this article... có thể chuyển This article/All notes").
  scope: "article" | "series";
  setScope: (scope: "article" | "series") => void;

  // Tang de ep danh sach note refetch sau khi tao/sua/xoa (component doc
  // refreshKey nay trong dependency cua effect fetch).
  refreshKey: number;
  refresh: () => void;

  // Khi khac null: yeu cau NotesPanel/article tu dong cuon toi + highlight
  // tam thoi 1 note cu the ngay sau khi mo (bam 1 note trong panel "All
  // notes" thuoc 1 bai KHAC bai dang xem -> dieu huong sang bai do kem gia
  // tri nay). Component tieu thu xong tu dat lai ve null.
  pendingScrollToNoteId: string | null;
  setPendingScrollToNoteId: (id: string | null) => void;
};

export const useNotesStore = create<NotesState>((set) => ({
  panelOpen: false,
  openPanel: () => set({ panelOpen: true }),
  closePanel: () => set({ panelOpen: false, addFormOpen: false, editingId: null }),
  togglePanel: () => set((s) => ({ panelOpen: !s.panelOpen })),

  addFormOpen: false,
  addFormQuote: null,
  editingId: null,
  openAddForm: (quote) => set({ addFormOpen: true, addFormQuote: quote, editingId: null, panelOpen: true }),
  openEditForm: (id) => set({ addFormOpen: true, editingId: id, addFormQuote: null, panelOpen: true }),
  closeAddForm: () => set({ addFormOpen: false, addFormQuote: null, editingId: null }),

  context: null,
  setContext: (context) => set({ context }),

  scope: "article",
  setScope: (scope) => set({ scope }),

  refreshKey: 0,
  refresh: () => set((s) => ({ refreshKey: s.refreshKey + 1 })),

  pendingScrollToNoteId: null,
  setPendingScrollToNoteId: (pendingScrollToNoteId) => set({ pendingScrollToNoteId }),
}));
