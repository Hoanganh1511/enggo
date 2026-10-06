"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { BookOpen, Plus, Search, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast/toast-store";
import { getApiErrorMessage } from "@/lib/api/client";
import { useNotesStore } from "@/stores/notes-store";
import { NOTE_TYPES, getNoteTypeConfig, type NoteType } from "@/lib/notes/note-types";
import type { Note } from "@/lib/api/notes";
import { listNotesForEntryAction, listNotesForSeriesAction } from "@/actions/notes/list-notes";
import { deleteNoteAction } from "@/actions/notes/delete-note";
import { scrollToAndFlashQuote } from "@/lib/notes/text-anchor";
import { ENTRY_CONTENT_ID } from "../EntryDownloadButtons";
import { AddNoteForm } from "./AddNoteForm";

function NoteCard({ note, onEdit, onDelete }: { note: Note; onEdit: () => void; onDelete: () => void }) {
  const cfg = getNoteTypeConfig(note.type as NoteType);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onEdit}
      onKeyDown={(e) => e.key === "Enter" && onEdit()}
      className="group flex cursor-pointer flex-col gap-1.5 rounded-lg border border-border bg-surface p-3 text-left transition-colors duration-150 hover:border-border-strong"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: cfg.color }}>
          <span>{cfg.icon}</span>
          {cfg.label}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label="Xoá ghi chú"
          className="cursor-pointer rounded-md p-1 text-ink-faint opacity-0 hover:bg-hover-bg hover:text-danger group-hover:opacity-100"
        >
          <Trash2 size={12} strokeWidth={2} />
        </button>
      </div>

      {note.quoteText && (
        <blockquote className="rounded-md border-l-2 pl-2 text-[12px] leading-snug text-ink-faint italic" style={{ borderColor: cfg.color }}>
          “{note.quoteText.length > 90 ? note.quoteText.slice(0, 90) + "…" : note.quoteText}”
        </blockquote>
      )}

      {note.content && <p className="text-[13px] leading-snug text-ink">{note.content}</p>}

      {note.tags.length > 0 && (
        <div className="mt-0.5 flex flex-wrap gap-1">
          {note.tags.map((t) => (
            <span key={t} className="rounded-full px-2 py-0.5 text-[10.5px] font-medium" style={{ backgroundColor: cfg.colorSoft, color: cfg.color }}>
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// Panel "My Notes" truot tu phai - yeu cau nguoi dung (spec day du). Nguon
// du lieu doi theo `scope` (notes-store.ts): "article" = notes-from-this-
// entry (entryId), "series" = "All notes" gop tu MOI Entry trong Series
// (seriesSlug) - toggle chi hien khi dang xem 1 Entry CU THE (co entryId);
// trang Overview Series (khong co entryId) LUON scope "series".
export function NotesPanel() {
  const router = useRouter();
  const {
    panelOpen,
    closePanel,
    context,
    scope,
    setScope,
    refreshKey,
    refresh,
    addFormOpen,
    editingId,
    openAddForm,
    pendingScrollToNoteId,
    setPendingScrollToNoteId,
  } = useNotesStore();

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<NoteType | "all">("all");
  const [search, setSearch] = useState("");

  const effectiveScope = context?.entryId ? scope : "series";

  useEffect(() => {
    if (!panelOpen || !context) return;
    let cancelled = false;
    // setTimeout(...,0) bao quanh setLoading(true) - thoa man
    // react-hooks/set-state-in-effect (khong goi setState DONG BO ngay dau
    // effect), cung mau voi time-picker-field.tsx/AddTaskForm trong
    // PlannerShell.tsx.
    const startTimer = setTimeout(() => {
      if (!cancelled) setLoading(true);
    }, 0);
    const req =
      effectiveScope === "article" && context.entryId
        ? listNotesForEntryAction(context.entryId)
        : listNotesForSeriesAction(context.seriesSlug);
    req
      .then((ns) => {
        if (!cancelled) setNotes(ns);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
      clearTimeout(startTimer);
    };
  }, [panelOpen, context, effectiveScope, refreshKey]);

  // Vua dieu huong sang 1 Entry KHAC (bam note cua bai khac trong "All
  // notes") - cuon toi + nhap nhay ngay khi noi dung bai moi da render.
  useEffect(() => {
    if (!pendingScrollToNoteId) return;
    const note = notes.find((n) => n.id === pendingScrollToNoteId);
    if (!note) return;
    const container = document.getElementById(ENTRY_CONTENT_ID);
    if (container) {
      scrollToAndFlashQuote(container, {
        quoteText: note.quoteText,
        quotePrefix: note.quotePrefix,
        quoteSuffix: note.quoteSuffix,
      });
    }
    setPendingScrollToNoteId(null);
  }, [pendingScrollToNoteId, notes, setPendingScrollToNoteId]);

  const counts = useMemo(() => {
    const m = new Map<NoteType, number>();
    for (const n of notes) m.set(n.type as NoteType, (m.get(n.type as NoteType) ?? 0) + 1);
    return m;
  }, [notes]);

  const filtered = notes.filter((n) => {
    if (filterType !== "all" && n.type !== filterType) return false;
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      n.content.toLowerCase().includes(q) ||
      n.quoteText.toLowerCase().includes(q) ||
      n.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  function handleNoteClick(note: Note) {
    if (effectiveScope === "article" || note.entrySlug === context?.entrySlug) {
      const container = document.getElementById(ENTRY_CONTENT_ID);
      if (container) {
        scrollToAndFlashQuote(container, {
          quoteText: note.quoteText,
          quotePrefix: note.quotePrefix,
          quoteSuffix: note.quoteSuffix,
        });
      }
      useNotesStore.getState().openEditForm(note.id);
      return;
    }
    // Note thuoc 1 Entry KHAC - dieu huong sang do, danh dau de cuon toi sau
    // khi trang moi render xong (xem effect pendingScrollToNoteId o tren).
    setPendingScrollToNoteId(note.id);
    router.push(`/series/${note.seriesSlug}/${note.entrySlug}`);
  }

  async function handleDelete(note: Note) {
    try {
      await deleteNoteAction(note.id);
      setNotes((prev) => prev.filter((n) => n.id !== note.id));
      toast.success("Đã xoá ghi chú");
    } catch (err) {
      toast.danger(getApiErrorMessage(err, "Xoá ghi chú thất bại, thử lại sau."));
    }
  }

  return (
    <AnimatePresence>
      {panelOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            onClick={closePanel}
            className="fixed inset-0 z-[60] bg-black/20 lg:hidden"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed top-0 right-0 z-[60] flex h-dvh w-full max-w-sm flex-col border-l border-border bg-surface shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
              <p className="flex items-center gap-1.5 text-[14.5px] font-semibold text-ink">
                <BookOpen size={16} strokeWidth={2} />
                My Notes
              </p>
              <button
                type="button"
                onClick={closePanel}
                aria-label="Đóng"
                className="cursor-pointer rounded-md p-1 text-ink-faint hover:bg-hover-bg hover:text-ink"
              >
                <X size={16} strokeWidth={2} />
              </button>
            </div>

            {context?.entryId && (
              <div className="flex gap-1 border-b border-border px-4 py-2">
                {(["article", "series"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setScope(s)}
                    className={cn(
                      "cursor-pointer rounded-full px-2.5 py-1 text-[11.5px] font-medium",
                      effectiveScope === s ? "bg-primary text-white" : "text-ink-muted hover:bg-hover-bg hover:text-ink",
                    )}
                  >
                    {s === "article" ? "This article" : "All notes"}
                  </button>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-1.5 border-b border-border px-4 py-2.5">
              <button
                type="button"
                onClick={() => setFilterType("all")}
                className={cn(
                  "cursor-pointer rounded-full px-2.5 py-1 text-[11.5px] font-medium",
                  filterType === "all" ? "bg-ink text-white" : "bg-surface-muted text-ink-muted hover:text-ink",
                )}
              >
                All Notes ({notes.length})
              </button>
              {NOTE_TYPES.filter((t) => counts.has(t.id)).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setFilterType((cur) => (cur === t.id ? "all" : t.id))}
                  className={cn(
                    "cursor-pointer rounded-full px-2.5 py-1 text-[11.5px] font-medium",
                    filterType === t.id ? "text-white" : "text-ink-muted hover:text-ink",
                  )}
                  style={filterType === t.id ? { backgroundColor: t.color } : { backgroundColor: t.colorSoft }}
                >
                  {t.icon} {t.label} ({counts.get(t.id)})
                </button>
              ))}
            </div>

            <div className="border-b border-border px-4 py-2.5">
              <div className="flex items-center gap-2 rounded-md border border-border bg-surface-muted px-2.5 py-1.5">
                <Search size={13} strokeWidth={2} className="shrink-0 text-ink-faint" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search notes..."
                  className="w-full bg-transparent text-[12.5px] outline-none placeholder:text-ink-faint"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3">
              {loading ? (
                <p className="py-8 text-center text-[12.5px] text-ink-faint">Đang tải...</p>
              ) : addFormOpen ? (
                <AddNoteForm key={editingId ?? "new"} notes={notes} onSaved={refresh} />
              ) : filtered.length === 0 ? (
                <p className="py-8 text-center text-[12.5px] text-ink-faint">
                  {notes.length === 0 ? "Chưa có ghi chú nào." : "Không tìm thấy ghi chú phù hợp."}
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {filtered.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onEdit={() => handleNoteClick(note)}
                      onDelete={() => void handleDelete(note)}
                    />
                  ))}
                </div>
              )}
            </div>

            {!addFormOpen && (
              <div className="border-t border-border p-3">
                <button
                  type="button"
                  onClick={() => openAddForm(null)}
                  disabled={!context?.entryId}
                  className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-md border border-dashed border-border py-2 text-[12.5px] font-medium text-ink-muted hover:border-ink-faint hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus size={14} strokeWidth={2} />
                  Add a note
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
