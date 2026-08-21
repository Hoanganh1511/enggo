"use client";

import { useEffect, useState, useTransition } from "react";
import { LoaderCircle, Search as SearchIcon } from "lucide-react";
import type { ApiChatMessage } from "@/lib/api/types";
import { searchMessagesAction } from "@/actions/chat/search-messages";
import { formatMessagePreview } from "@/lib/chat-message-preview";
import { formatRelativeTime } from "@/lib/format-time";

// Tim tin nhan CU trong hoi thoai dang mo - chi hien danh sach ket qua (noi
// dung + thoi gian), KHONG "nhay toi" tin nhan do trong khung chat (khung
// chat dang phan trang bang cursor, "nhay toi" 1 tin bat ky doi hoi logic
// anchor rieng - ngoai pham vi yeu cau ban dau "mo box search tin nhan cu").
export function MessageSearchPopover({
  conversationId,
}: {
  conversationId: string;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ApiChatMessage[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [, startFetchTransition] = useTransition();

  useEffect(() => {
    if (!query.trim()) {
      startFetchTransition(() => {
        setResults(null);
        setLoading(false);
      });
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      startFetchTransition(async () => {
        setLoading(true);
        try {
          const items = await searchMessagesAction(conversationId, query.trim());
          if (cancelled) return;
          setResults(items);
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
    <div className="flex h-96 w-80 flex-col rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_8px_28px_rgba(15,23,42,.12)]">
      <div className="mb-2 flex h-9 shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-[#fafbfc] px-2.5">
        <SearchIcon size={14} className="shrink-0 text-slate-400" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm tin nhắn trong hội thoại..."
          className="w-full bg-transparent text-[13px] text-[#182338] outline-none placeholder:text-slate-400"
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {!query.trim() ? (
          <p className="px-2 py-8 text-center text-[12px] text-slate-500">
            Nhập từ khoá để tìm tin nhắn cũ.
          </p>
        ) : loading ? (
          <div className="flex h-full items-center justify-center">
            <LoaderCircle size={18} className="animate-spin text-slate-400" />
          </div>
        ) : results && results.length > 0 ? (
          <ul className="flex flex-col gap-0.5">
            {results.map((m) => (
              <li
                key={m.id}
                className="rounded-lg px-2.5 py-2 transition-colors duration-150 ease-out hover:bg-slate-50"
              >
                <p className="truncate text-[13px] text-[#182338]">
                  {formatMessagePreview(m)}
                </p>
                <p className="text-[11px] text-slate-500">
                  {formatRelativeTime(m.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-2 py-8 text-center text-[12px] text-slate-500">
            Không tìm thấy tin nhắn nào.
          </p>
        )}
      </div>
    </div>
  );
}
