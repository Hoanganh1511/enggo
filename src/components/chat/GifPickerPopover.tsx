"use client";

import { useEffect, useState, useTransition } from "react";
import { LoaderCircle, Search } from "lucide-react";
import type { ApiGif } from "@/lib/api/gif";
import { searchGifsAction, trendingGifsAction } from "@/actions/chat/gifs";

// Popover tim GIF qua Giphy (proxy o backend, xem GifService) - trong khi
// chua co GIPHY_API_KEY, backend tra 503 va o day hien thong bao "Sắp có"
// thay vi loi vo nghia.
export function GifPickerPopover({
  onSelect,
}: {
  onSelect: (gif: ApiGif) => void;
}) {
  const [query, setQuery] = useState("");
  const [gifs, setGifs] = useState<ApiGif[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [notConfigured, setNotConfigured] = useState(false);
  const [, startFetchTransition] = useTransition();

  // Debounce 400ms cho tim kiem (khong debounce lan tai trending dau tien) -
  // boc trong startFetchTransition (cung pattern voi MessageInfoPanel.tsx) de
  // setLoading(true) dau effect khong bi ESLint react-hooks/set-state-in-effect
  // chan.
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(
      () => {
        startFetchTransition(async () => {
          setLoading(true);
          try {
            const items = query.trim()
              ? await searchGifsAction(query.trim())
              : await trendingGifsAction();
            if (cancelled) return;
            setGifs(items);
            setNotConfigured(false);
          } catch {
            if (cancelled) return;
            setGifs([]);
            setNotConfigured(true);
          } finally {
            if (!cancelled) setLoading(false);
          }
        });
      },
      query.trim() ? 400 : 0,
    );
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, startFetchTransition]);

  return (
    <div className="flex h-80 w-72 flex-col rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_8px_28px_rgba(15,23,42,.12)]">
      <div className="mb-2 flex h-9 shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-[#fafbfc] px-2.5">
        <Search size={14} className="shrink-0 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm GIF..."
          className="w-full bg-transparent text-[13px] text-[#182338] outline-none placeholder:text-slate-400"
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <LoaderCircle size={18} className="animate-spin text-slate-400" />
          </div>
        ) : notConfigured ? (
          <p className="px-2 py-8 text-center text-[12px] text-slate-500">
            Sắp có - chưa cấu hình Giphy API key.
          </p>
        ) : gifs && gifs.length > 0 ? (
          <div className="grid grid-cols-2 gap-1.5">
            {gifs.map((gif) => (
              <button
                key={gif.id}
                type="button"
                onClick={() => onSelect(gif)}
                className="aspect-square cursor-pointer overflow-hidden rounded-lg bg-slate-100"
              >
                {gif.previewUrl && (
                  // eslint-disable-next-line @next/next/no-img-element -- host CDN Giphy dong, khong the allowlist tinh trong next.config
                  <img
                    src={gif.previewUrl}
                    alt={gif.title}
                    className="size-full object-cover"
                  />
                )}
              </button>
            ))}
          </div>
        ) : (
          <p className="px-2 py-8 text-center text-[12px] text-slate-500">
            Không tìm thấy GIF nào.
          </p>
        )}
      </div>
    </div>
  );
}
