"use client";

import { useEffect, useState } from "react";
import { Copy, Highlighter, Sparkles } from "lucide-react";
import { toast } from "@/lib/toast/toast-store";
import { getApiErrorMessage } from "@/lib/api/client";
import { useNotesStore } from "@/stores/notes-store";
import { getSelectionQuote, getSelectionRect } from "@/lib/notes/text-anchor";
import { createNoteAction } from "@/actions/notes/create-note";
import { ENTRY_CONTENT_ID } from "../EntryDownloadButtons";

// Toolbar noi len khi bo den text trong than bai - yeu cau nguoi dung
// (spec): "Người dùng bôi đen text trong article... Floating toolbar xuất
// hiện: Highlight | ✦ Note | Copy". 3 nut:
// - "✦ Note" mo AddNoteForm (qua notes-store) gan san doan vua bo den lam
//   Source reference - luong chinh, day du 6 loai/tags.
// - "Highlight" TAO NGAY 1 Note (khong qua modal) voi loai "personal" + noi
//   dung rong - danh dau nhanh 1 doan, co the mo panel sua lai noi dung sau.
//   [Don gian hoa co y: spec goc mo ta Highlight nhu 1 lop overlay to mau
//   rieng biet khoi Note - ngoai pham vi hop ly cho 1 lan lam, o day dung
//   CHUNG co che Note (van ra marker le + vao duoc panel) thay vi xay them 1
//   he thong luu/render rieng chi de "to mau".]
// - "Copy" - sao chep nguyen van text da chon.
export function ArticleSelectionToolbar() {
  const { context, openAddForm } = useNotesStore();
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [savingHighlight, setSavingHighlight] = useState(false);

  useEffect(() => {
    function handleSelectionChange() {
      const container = document.getElementById(ENTRY_CONTENT_ID);
      if (!container) {
        setRect(null);
        return;
      }
      const quote = getSelectionQuote(container);
      if (!quote) {
        setRect(null);
        return;
      }
      setRect(getSelectionRect());
    }
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, []);

  if (!rect || !context?.entryId) return null;

  function getContainer() {
    return document.getElementById(ENTRY_CONTENT_ID);
  }

  async function handleNote() {
    const container = getContainer();
    if (!container) return;
    const quote = getSelectionQuote(container);
    if (!quote) return;
    window.getSelection()?.removeAllRanges();
    setRect(null);
    openAddForm(quote);
  }

  async function handleHighlight() {
    const container = getContainer();
    if (!container || !context?.entryId || !context.entrySlug) return;
    const quote = getSelectionQuote(container);
    if (!quote) return;
    window.getSelection()?.removeAllRanges();
    setRect(null);
    setSavingHighlight(true);
    try {
      await createNoteAction({
        entryId: context.entryId,
        entrySlug: context.entrySlug,
        seriesSlug: context.seriesSlug,
        type: "personal",
        content: "",
        tags: [],
        quoteText: quote.quoteText,
        quotePrefix: quote.quotePrefix,
        quoteSuffix: quote.quoteSuffix,
      });
      useNotesStore.getState().refresh();
      toast.success("Đã highlight - mở Notes để thêm ghi chú nếu cần.");
    } catch (err) {
      toast.danger(getApiErrorMessage(err, "Highlight thất bại, thử lại sau."));
    } finally {
      setSavingHighlight(false);
    }
  }

  function handleCopy() {
    const text = window.getSelection()?.toString() ?? "";
    if (text) void navigator.clipboard.writeText(text);
    setRect(null);
  }

  return (
    <div
      className="fixed z-50 flex -translate-x-1/2 items-center gap-0.5 rounded-lg border border-border bg-surface p-1 shadow-dropdown"
      style={{ top: rect.top - 44, left: rect.left + rect.width / 2 }}
      // preventDefault tren mousedown - KHONG CHO trinh duyet tu xoa vung bo
      // den (mac dinh xay ra truoc ca onClick) khi bam vao chinh toolbar nay,
      // neu khong 3 nut se luon thao tac tren 1 selection rong (da bi huy).
      onMouseDown={(e) => e.preventDefault()}
    >
      <button
        type="button"
        disabled={savingHighlight}
        onClick={() => void handleHighlight()}
        className="flex h-7 cursor-pointer items-center gap-1 rounded-md px-2 text-[12px] font-medium text-ink-muted hover:bg-hover-bg hover:text-ink disabled:opacity-50"
      >
        <Highlighter size={13} strokeWidth={2} />
        Highlight
      </button>
      <div className="h-4 w-px bg-border" />
      <button
        type="button"
        onClick={() => void handleNote()}
        className="flex h-7 cursor-pointer items-center gap-1 rounded-md px-2 text-[12px] font-medium text-ink-muted hover:bg-hover-bg hover:text-ink"
      >
        <Sparkles size={13} strokeWidth={2} />
        Note
      </button>
      <div className="h-4 w-px bg-border" />
      <button
        type="button"
        onClick={handleCopy}
        className="flex h-7 cursor-pointer items-center gap-1 rounded-md px-2 text-[12px] font-medium text-ink-muted hover:bg-hover-bg hover:text-ink"
      >
        <Copy size={13} strokeWidth={2} />
        Copy
      </button>
    </div>
  );
}
