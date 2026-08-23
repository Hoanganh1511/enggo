"use client";

import { startTransition, useEffect, useState } from "react";

// react-konva khong co san hook load anh (khac vai thu vien nhu "use-image") -
// Konva.Image can 1 HTMLImageElement DA LOAD XONG, khong nhan thang chuoi
// src. Viet rieng thay vi them 1 dependency ngoai chi cho 1 hook nho.
// setImage(undefined) khi src rong nam TRUC TIEP trong than effect (dong
// bo) - boc startTransition, dung pattern da dung trong app (xem
// useChangelogUnseen.ts) de khong vi pham react-hooks/set-state-in-effect.
export function useHtmlImage(src: string | undefined): HTMLImageElement | undefined {
  const [image, setImage] = useState<HTMLImageElement | undefined>(undefined);

  useEffect(() => {
    if (!src) {
      startTransition(() => setImage(undefined));
      return;
    }
    const img = new window.Image();
    img.onload = () => setImage(img);
    img.src = src;
    return () => {
      img.onload = null;
    };
  }, [src]);

  return image;
}
