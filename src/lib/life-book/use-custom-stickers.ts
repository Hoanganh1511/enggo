"use client";

import { startTransition, useEffect, useState } from "react";

const STORAGE_KEY = "life-book:custom-stickers";
const MAX_CUSTOM_STICKERS = 30;

export type CustomSticker = { id: string; src: string };

function readStorage(): CustomSticker[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CustomSticker[]) : [];
  } catch {
    return [];
  }
}

// Sub-phase 6.6 - sticker THAT nguoi dung tu upload (xem StickerLibraryPopover.tsx),
// luu qua localStorage (cung quy uoc "favorites luu localStorage" da dung
// trong app) de con giu lai o lan mo modal/tai trang sau - KHONG can backend
// rieng (Sub-phase 6.7 moi luu noi dung canvas vao Block that qua server
// that). Doc trong useEffect (khong phai lazy initializer) de tranh gia
// dinh component nay khong bao gio duoc SSR - an toan hon du hien tai
// BlockModal chi mount phia client.
export function useCustomStickers() {
  const [stickers, setStickers] = useState<CustomSticker[]>([]);

  useEffect(() => {
    startTransition(() => {
      setStickers(readStorage());
    });
  }, []);

  function addCustomSticker(src: string) {
    setStickers((prev) => {
      const next = [{ id: `custom-${Date.now()}`, src }, ...prev].slice(0, MAX_CUSTOM_STICKERS);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Vuot quota luu tru (data URL lon) - bo qua, danh sach van dung
        // trong session hien tai, chi khong ben vung qua lan tai trang sau.
      }
      return next;
    });
  }

  return { stickers, addCustomSticker };
}
