"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ApiPage } from "@/lib/api/types";

export type BookLeaf = {
  front: ApiPage | null;
  back: ApiPage | null;
};

export type FlipState = { leafIndex: number; direction: "next" | "prev" } | null;

// Ghep danh sach page THANG (order 0..n, da sort) thanh cac "to giay" (leaf) -
// giong sach in that: 1 to co 2 MAT, mat truoc la page[2i], mat sau la
// page[2i+1]. So trang le -> to cuoi chi co front, back = null (trang trang,
// khong the lat qua vi khong co gi ben duoi).
function toLeaves(pages: ApiPage[]): BookLeaf[] {
  const leaves: BookLeaf[] = [];
  for (let i = 0; i < pages.length; i += 2) {
    leaves.push({ front: pages[i] ?? null, back: pages[i + 1] ?? null });
  }
  return leaves;
}

// State + dieu khien lat sach. `currentLeaf` la SO to DA lat sang trai (0 =
// sach vua mo, chua lat to nao) - trang TRAI dang hien luon la
// leaves[currentLeaf-1].back, trang PHAI dang hien luon la leaves[currentLeaf].front.
// `flipping` khac null trong luc animation dang chay (Book.tsx doc gia tri
// nay de biet render overlay 3D lat o vi tri nao) - next/prev bi khoa
// (canNext/canPrev = false) trong luc do de tranh spam-click lam chong 2
// animation.
export function useBookFlip(pages: ApiPage[]) {
  const leaves = toLeaves(pages);
  const leafCount = leaves.length;
  const [currentLeaf, setCurrentLeaf] = useState(0);
  const [flipping, setFlipping] = useState<FlipState>(null);
  // "Nho" flipping HIEN TAI de completeFlip doc duoc GIA TRI THAT ma khong
  // can long setCurrentLeaf ben trong updater cua setFlipping (xem
  // completeFlip ben duoi) - GHI trong 1 useEffect (rule react-hooks/refs
  // cua repo nay khong cho ghi ref NGAY TRONG luc render, kha chat hon
  // huong dan chinh thuc cua React), CHI doc trong callback (khong phai luc
  // render) nen van hop le.
  const flippingRef = useRef(flipping);
  useEffect(() => {
    flippingRef.current = flipping;
  }, [flipping]);

  const canNext = !flipping && currentLeaf < leafCount;
  const canPrev = !flipping && currentLeaf > 0;

  const next = useCallback(() => {
    if (flipping || currentLeaf >= leafCount) return;
    setFlipping({ leafIndex: currentLeaf, direction: "next" });
  }, [flipping, currentLeaf, leafCount]);

  const prev = useCallback(() => {
    if (flipping || currentLeaf <= 0) return;
    setFlipping({ leafIndex: currentLeaf - 1, direction: "prev" });
  }, [flipping, currentLeaf]);

  // Goi khi animation framer-motion cua overlay lat ket thuc (onAnimationComplete) -
  // chot lai currentLeaf THAT tai day, khong phai luc bat dau animation, de
  // trang tinh (leftPage/rightPage) chi doi DUNG luc overlay da bien mat.
  //
  // BUG DA GAP: ban truoc long setCurrentLeaf() BEN TRONG updater-function
  // cua setFlipping() - React 18 Strict Mode (bat mac dinh o `next dev`) CO
  // Y goi lai 2 LAN moi updater-function de kiem tra tinh "thuan khiet"
  // (pure). Vi updater do co side-effect THAT o trong (goi setCurrentLeaf),
  // side-effect do bi chay 2 LAN moi khi lat 1 trang -> currentLeaf bi cong
  // 2 thay vi 1 (0 -> 2 thay vi 0 -> 1), khien trang chua block (leaf 1) bi
  // "nhay qua" luon, khong bao gio dung lai de hien - day chinh la nguyen
  // nhan that cua ca chuoi "block bien mat sau khi lat" da debug rat lau.
  // Sua bang cach tach thanh 2 lenh set DOC LAP, khong long vao nhau nua -
  // ca 2 deu la updater THUAN KHIET, goi lai 2 lan (neu co) khong con anh
  // huong gi.
  const completeFlip = useCallback(() => {
    const f = flippingRef.current;
    if (!f) return;
    setCurrentLeaf((c) => (f.direction === "next" ? c + 1 : c - 1));
    setFlipping(null);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const leftPage = currentLeaf > 0 ? leaves[currentLeaf - 1].back : null;
  const rightPage = currentLeaf < leafCount ? leaves[currentLeaf].front : null;
  const flippingLeaf = flipping ? leaves[flipping.leafIndex] : null;

  return {
    leafCount,
    currentLeaf,
    flipping,
    flippingLeaf,
    canNext,
    canPrev,
    next,
    prev,
    completeFlip,
    leftPage,
    rightPage,
  };
}
