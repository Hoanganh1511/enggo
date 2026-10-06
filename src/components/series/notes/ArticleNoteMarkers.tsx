"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useNotesStore } from "@/stores/notes-store";
import { locateQuoteRange, scrollToAndFlashQuote } from "@/lib/notes/text-anchor";
import { getNoteTypeConfig } from "@/lib/notes/note-types";
import type { Note } from "@/lib/api/notes";
import { listNotesForEntryAction } from "@/actions/notes/list-notes";
import { ENTRY_CONTENT_ID } from "../EntryDownloadButtons";

type Marker = { note: Note; top: number };
// Khoang cach tu mep PHAI cua #series-entry-content toi marker - nam TRONG
// vung dem pr-6/lg:pr-10 co san cua <article> (khong dam vao <aside> TOC o
// xa hon nua, co gap+border-r chen giua) - KHONG can sua layout cua
// [entrySlug]/page.tsx them gi ca.
const MARKER_OFFSET_PX = 6;

// Marker nho o mep bai viet cho MOI note co gan doan trich (spec: "Khi
// article đang có note tại một vị trí, bên mép article hiện một marker rất
// nhỏ... Hover: Key Point · Elasticity. Click → mở note" - "nhìn thấy ngay
// những đoạn mình từng đánh dấu, nhưng không làm article rối"). `position:
// fixed`, toa do tu tinh lai qua getBoundingClientRect() cua Range khop voi
// quote (xem text-anchor.ts) - KHONG dua vao offset luu san, vi DOM thuc te
// co the lech nhe giua cac lan build/render.
export function ArticleNoteMarkers({ entryId }: { entryId: string }) {
  const refreshKey = useNotesStore((s) => s.refreshKey);
  const openEditForm = useNotesStore((s) => s.openEditForm);
  const [notes, setNotes] = useState<Note[]>([]);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [gutterLeft, setGutterLeft] = useState<number | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    listNotesForEntryAction(entryId)
      .then((ns) => {
        if (!cancelled) setNotes(ns.filter((n) => n.quoteText));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [entryId, refreshKey]);

  useEffect(() => {
    function recompute() {
      const container = document.getElementById(ENTRY_CONTENT_ID);
      if (!container) {
        setMarkers([]);
        return;
      }
      setGutterLeft(container.getBoundingClientRect().right + MARKER_OFFSET_PX);
      const next: Marker[] = [];
      for (const note of notes) {
        const range = locateQuoteRange(container, {
          quoteText: note.quoteText,
          quotePrefix: note.quotePrefix,
          quoteSuffix: note.quoteSuffix,
        });
        if (!range) continue;
        const rect = range.getBoundingClientRect();
        if (rect.top === 0 && rect.bottom === 0) continue;
        next.push({ note, top: rect.top });
      }
      setMarkers(next);
    }

    function schedule() {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(recompute);
    }

    schedule();
    const scrollRoot = document.querySelector<HTMLElement>("[data-scroll-root]");
    scrollRoot?.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      scrollRoot?.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [notes]);

  function handleClick(note: Note) {
    const container = document.getElementById(ENTRY_CONTENT_ID);
    if (container) {
      scrollToAndFlashQuote(container, {
        quoteText: note.quoteText,
        quotePrefix: note.quotePrefix,
        quoteSuffix: note.quoteSuffix,
      });
    }
    openEditForm(note.id);
  }

  if (markers.length === 0 || gutterLeft === null) return null;

  return (
    <div className="hidden xl:block">
      {markers.map(({ note, top }) => {
        const cfg = getNoteTypeConfig(note.type);
        return (
          <button
            key={note.id}
            type="button"
            onClick={() => handleClick(note)}
            onMouseEnter={() => setHoverId(note.id)}
            onMouseLeave={() => setHoverId((id) => (id === note.id ? null : id))}
            title={`${cfg.label} · ${note.content || note.quoteText.slice(0, 40)}`}
            className={cn(
              "pointer-events-auto fixed flex size-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-[11px] shadow-sm ring-1 ring-black/5 transition-transform duration-150 ease-out hover:scale-125",
            )}
            style={{ top, left: gutterLeft, backgroundColor: cfg.colorSoft }}
          >
            {cfg.icon}
            {hoverId === note.id && (
              <span className="pointer-events-none absolute top-1/2 left-full ml-2 -translate-y-1/2 rounded-md border border-border bg-surface px-2 py-1 text-[11px] whitespace-nowrap text-ink shadow-dropdown">
                {cfg.label}
                {note.content && <span className="text-ink-faint"> · {note.content.slice(0, 30)}</span>}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
