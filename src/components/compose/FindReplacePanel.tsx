"use client";

import { useEffect, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import { ChevronUp, ChevronDown, X } from "lucide-react";
import type { SearchReplaceStorage } from "./search-replace-extension";

// Panel "Tìm kiếm" (Ctrl+F) / "Tìm & Thay thế" (Ctrl+H) - noi DUY NHAT goi
// cac lenh cua SearchReplace extension (xem search-replace-extension.tsx ve
// kien truc). Bam Ctrl+F/Ctrl+H o BAT KY DAU trong vung soan (hoac trong
// chinh panel nay) deu mo/chuyen che do - lang nghe TREN document (khong
// phai rieng vung soan) roi tu loc theo "focus co dang nam trong editor/
// panel nay khong" de KHONG chiem dung Ctrl+F o cac noi khac tren trang.
export function FindReplacePanel({ editor }: { editor: Editor }) {
  const [mode, setMode] = useState<"closed" | "find" | "replace">("closed");
  const [query, setQuery] = useState("");
  const [replaceValue, setReplaceValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const storage = editor.storage.searchReplace as SearchReplaceStorage | undefined;
  const matchCount = storage?.results.length ?? 0;
  const currentIndex = storage?.currentIndex ?? -1;

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      const key = e.key.toLowerCase();
      if (key !== "f" && key !== "h") return;
      const active = document.activeElement;
      const withinEditor = active ? editor.view.dom.contains(active) : false;
      const withinPanel = active ? (panelRef.current?.contains(active) ?? false) : false;
      if (!withinEditor && !withinPanel) return;
      e.preventDefault();
      setMode(key === "h" ? "replace" : "find");
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [editor]);

  useEffect(() => {
    if (mode === "closed") return;
    // Doi 1 nhip (requestAnimationFrame) - panel vua render xong (tu
    // "closed" sang "find"/"replace"), input can co trong DOM truoc khi
    // focus duoc.
    const raf = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(raf);
  }, [mode]);

  useEffect(() => {
    if (mode === "closed") return;
    editor.commands.setSearchTerm(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, mode]);

  function close() {
    setMode("closed");
    setQuery("");
    setReplaceValue("");
    editor.commands.setSearchTerm("");
    editor.commands.focus();
  }

  function next() {
    editor.commands.goToSearchResult(1);
  }
  function prev() {
    editor.commands.goToSearchResult(-1);
  }
  function replaceOne() {
    editor.commands.replaceCurrentResult(replaceValue);
    editor.commands.setSearchTerm(query);
  }
  function replaceAll() {
    editor.commands.replaceAllResults(replaceValue);
    editor.commands.setSearchTerm(query);
  }

  if (mode === "closed") return null;

  return (
    <div
      ref={panelRef}
      onKeyDown={(e) => {
        if (e.key === "Escape") close();
      }}
      className="flex flex-wrap items-center gap-1.5 border-b border-border bg-surface-muted px-3 py-2"
    >
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (e.shiftKey) prev();
            else next();
          }
        }}
        placeholder="Tìm kiếm..."
        className="min-w-40 flex-1 rounded-md border border-border bg-surface px-2 py-1 text-[13px] text-ink outline-none focus:border-primary/50"
      />
      <span className="shrink-0 px-1 text-[12px] tabular-nums text-ink-faint">
        {query ? `${matchCount ? currentIndex + 1 : 0}/${matchCount}` : ""}
      </span>
      <button
        type="button"
        onClick={prev}
        disabled={!matchCount}
        title="Kết quả trước (Shift+Enter)"
        className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-muted hover:bg-hover-bg disabled:cursor-not-allowed disabled:opacity-30"
      >
        <ChevronUp size={14} strokeWidth={2} />
      </button>
      <button
        type="button"
        onClick={next}
        disabled={!matchCount}
        title="Kết quả tiếp theo (Enter)"
        className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-muted hover:bg-hover-bg disabled:cursor-not-allowed disabled:opacity-30"
      >
        <ChevronDown size={14} strokeWidth={2} />
      </button>
      {mode === "replace" && (
        <>
          <input
            value={replaceValue}
            onChange={(e) => setReplaceValue(e.target.value)}
            placeholder="Thay thế bằng..."
            className="min-w-32 flex-1 rounded-md border border-border bg-surface px-2 py-1 text-[13px] text-ink outline-none focus:border-primary/50"
          />
          <button
            type="button"
            onClick={replaceOne}
            disabled={!matchCount}
            className="h-7 shrink-0 cursor-pointer rounded-md px-2.5 text-[12px] font-medium text-ink-muted hover:bg-hover-bg disabled:cursor-not-allowed disabled:opacity-30"
          >
            Thay thế
          </button>
          <button
            type="button"
            onClick={replaceAll}
            disabled={!matchCount}
            className="h-7 shrink-0 cursor-pointer rounded-md bg-community-accent px-2.5 text-[12px] font-semibold text-white hover:bg-community-accent-hover disabled:cursor-not-allowed disabled:opacity-30"
          >
            Thay tất cả
          </button>
        </>
      )}
      <button
        type="button"
        onClick={close}
        title="Đóng (Esc)"
        className="ml-auto flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-hover-bg"
      >
        <X size={14} strokeWidth={2} />
      </button>
    </div>
  );
}
