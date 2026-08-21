"use client";

import { useEffect, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LoaderCircle, Search as SearchIcon, X } from "lucide-react";
import type { ApiMessageSearchResult } from "@/lib/api/types";
import { searchMessagesAction } from "@/actions/chat/search-messages";
import { renderHighlightedSnippet } from "@/lib/chat-search-highlight";
import { formatRelativeTime } from "@/lib/format-time";

const PAGE_LIMIT = 10;

// "Xem tất cả kết quả" tu MessageSearchPopover.tsx mo drawer nay - cung cau
// truc UI (o tim kiem + "X kết quả" + list highlight) nhung hien 10 ket qua/
// lan (thay vi 3), co nut "Xem thêm" tai tiep cursor. Component nay dung
// key={query luc mo} o MessagesShell.tsx de tu reset state MOI lan mo 1 tim
// kiem moi (xem comment o do) - khong dung effect de dong bo initialQuery.
export function MessageSearchDrawer({
  open,
  onOpenChange,
  conversationId,
  initialQuery,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string;
  initialQuery: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [items, setItems] = useState<ApiMessageSearchResult[] | null>(null);
  const [total, setTotal] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [, startFetchTransition] = useTransition();

  // Boc setState dau effect trong startFetchTransition (cung pattern voi
  // MessageSearchPopover.tsx/MessagesShell.tsx) de trach ESLint
  // react-hooks/set-state-in-effect - startTransition o day AN TOAN (khong
  // gay "giat" UI de nguoi dung nhan thay) vi cac setState nay CHI la reset
  // ve rong/tat loading, khong phai noi dung dang hien can giu nguyen tuc thi.
  useEffect(() => {
    if (!query.trim()) {
      startFetchTransition(() => {
        setItems(null);
        setTotal(0);
        setNextCursor(null);
        setLoading(false);
      });
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      startFetchTransition(async () => {
        setLoading(true);
        try {
          const page = await searchMessagesAction({
            q: query.trim(),
            conversationId,
            sort: "recent",
            limit: PAGE_LIMIT,
          });
          if (cancelled) return;
          setItems(page.items);
          setTotal(page.total ?? page.items.length);
          setNextCursor(page.nextCursor);
        } finally {
          if (!cancelled) setLoading(false);
        }
      });
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, conversationId]);

  async function handleLoadMore() {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await searchMessagesAction({
        q: query.trim(),
        conversationId,
        sort: "recent",
        cursor: nextCursor,
        limit: PAGE_LIMIT,
      });
      setItems((prev) => (prev ? [...prev, ...page.items] : page.items));
      setNextCursor(page.nextCursor);
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="search-drawer-backdrop"
            className="fixed inset-0 z-40 bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            key="search-drawer-panel"
            className="fixed top-0 right-0 z-50 flex h-full w-full flex-col bg-white shadow-xl sm:w-[420px]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="flex items-center justify-between border-b border-slate-100 p-4">
              <p className="text-[15px] font-bold text-[#182338]">
                Kết quả tìm kiếm
              </p>
              <button
                type="button"
                aria-label="Đóng"
                onClick={() => onOpenChange(false)}
                className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-[#182338]"
              >
                <X size={18} strokeWidth={2} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="mb-3 flex h-10 shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-[#fafbfc] px-3">
                <SearchIcon size={18} className="shrink-0 text-slate-400" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tìm tin nhắn trong hội thoại..."
                  className="w-full bg-transparent text-[13.5px] text-primary outline-none placeholder:text-slate-400"
                />
              </div>

              {!query.trim() ? (
                <p className="px-2 py-10 text-center text-[13px] text-slate-500">
                  Nhập từ khoá để tìm tin nhắn cũ.
                </p>
              ) : loading ? (
                <div className="flex h-32 items-center justify-center">
                  <LoaderCircle
                    size={20}
                    className="animate-spin text-slate-400"
                  />
                </div>
              ) : items && items.length > 0 ? (
                <>
                  <p className="mb-2 px-1 text-[12px] font-medium text-slate-400">
                    {total} kết quả
                  </p>
                  <ul className="flex flex-col gap-0.5">
                    {items.map((m) => (
                      <li
                        key={m.id}
                        className="rounded-lg px-2.5 py-2.5 transition-colors duration-150 ease-out hover:bg-slate-50"
                      >
                        <p className="text-[13.5px] leading-relaxed text-[#182338]">
                          {renderHighlightedSnippet(m.snippet)}
                        </p>
                        <p className="mt-0.5 text-[11.5px] text-slate-500">
                          {formatRelativeTime(m.createdAt)}
                        </p>
                      </li>
                    ))}
                  </ul>
                  {nextCursor && (
                    <button
                      type="button"
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 py-2.5 text-[13px] font-medium text-slate-600 transition-colors duration-150 ease-out hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loadingMore ? (
                        <LoaderCircle
                          size={14}
                          className="animate-spin text-slate-400"
                        />
                      ) : null}
                      {loadingMore ? "Đang tải..." : "Xem thêm"}
                    </button>
                  )}
                </>
              ) : (
                <p className="px-2 py-10 text-center text-[13px] text-slate-500">
                  Không tìm thấy tin nhắn nào.
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
