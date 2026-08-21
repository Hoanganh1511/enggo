"use client";

import { useEffect, useState, useTransition } from "react";
import { LoaderCircle, Search as SearchIcon } from "lucide-react";
import type { ApiMessageSearchResult } from "@/lib/api/types";
import { searchMessagesAction } from "@/actions/chat/search-messages";
import { renderHighlightedSnippet } from "@/lib/chat-search-highlight";
import { formatRelativeTime } from "@/lib/format-time";

const PREVIEW_LIMIT = 3;

// Tim tin nhan cu trong hoi thoai dang mo - hien 3 ket qua GAN DAY NHAT (khong
// phai xep hang lien quan - sort=recent) kem doan trich highlight tu khoa
// khop. "Xem tất cả kết quả" dong popover nay + mo MessageSearchDrawer.tsx
// (cung du lieu, phan trang 10/lan) - xem MessagesShell.tsx.
export function MessageSearchPopover({
  conversationId,
  onViewAll,
}: {
  conversationId: string;
  onViewAll: (query: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<ApiMessageSearchResult[] | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [, startFetchTransition] = useTransition();

  useEffect(() => {
    if (!query.trim()) {
      startFetchTransition(() => {
        setItems(null);
        setTotal(0);
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
            limit: PREVIEW_LIMIT,
          });
          if (cancelled) return;
          setItems(page.items);
          setTotal(page.total ?? page.items.length);
        } finally {
          if (!cancelled) setLoading(false);
        }
      });
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, conversationId, startFetchTransition]);

  return (
    <div className="flex w-80 flex-col rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_8px_28px_rgba(15,23,42,.12)]">
      <div className="mb-2 flex h-9 shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-[#fafbfc] px-2.5">
        <SearchIcon size={18} className="shrink-0 text-slate-400" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm tin nhắn trong hội thoại..."
          className="w-full bg-transparent text-[13px] text-primary outline-none placeholder:text-slate-400"
        />
      </div>

      {!query.trim() ? (
        <p className="px-2 py-8 text-center text-[12px] text-slate-500">
          Nhập từ khoá để tìm tin nhắn cũ.
        </p>
      ) : loading ? (
        <div className="flex h-32 items-center justify-center">
          <LoaderCircle size={18} className="animate-spin text-slate-400" />
        </div>
      ) : items && items.length > 0 ? (
        <>
          <p className="mb-1.5 px-1 text-[11.5px] font-medium text-slate-400">
            {total} kết quả
          </p>
          <ul className="flex flex-col gap-0.5">
            {items.map((m) => (
              <li
                key={m.id}
                className="rounded-lg px-2.5 py-2 transition-colors duration-150 ease-out hover:bg-slate-50"
              >
                <p className="truncate text-[13px] text-[#182338]">
                  {renderHighlightedSnippet(m.snippet)}
                </p>
                <p className="text-[11px] text-slate-500">
                  {formatRelativeTime(m.createdAt)}
                </p>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => onViewAll(query.trim())}
            className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 py-2 text-[12.5px] font-medium text-slate-600 transition-colors duration-150 ease-out hover:bg-slate-50"
          >
            <SearchIcon size={14} className="shrink-0 text-slate-400" />
            Xem tất cả kết quả
          </button>
        </>
      ) : (
        <p className="px-2 py-8 text-center text-[12px] text-slate-500">
          Không tìm thấy tin nhắn nào.
        </p>
      )}
    </div>
  );
}
