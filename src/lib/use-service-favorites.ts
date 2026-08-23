"use client";

import { useCallback, useEffect, useState, useTransition } from "react";

const STORAGE_KEY = "gl_service_favorites";

function readStoredFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

// Favorite service (trang /services) - luu THAT vao localStorage (khong phai
// gia lap), rieng theo tung trinh duyet nguoi dung, khong can backend. Doc
// gia tri that trong 1 useEffect (khong doc thang luc khoi tao state) de
// khop SSR/hydration cua Next.js (server luon render rong, client tu dien du
// lieu that sau khi mount - tranh loi hydration mismatch).
export function useServiceFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [, startTransition] = useTransition();

  useEffect(() => {
    startTransition(() => setFavorites(new Set(readStoredFavorites())));
  }, []);

  const toggleFavorite = useCallback((slug: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch {}
      return next;
    });
  }, []);

  return { favorites, toggleFavorite };
}
