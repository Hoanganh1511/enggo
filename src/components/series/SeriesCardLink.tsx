"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useNavTransitionStore } from "@/stores/nav-transition-store";

// Link "nang" (dan vao 1 Series - trang chi tiet phai render server-side du
// lieu category/entry) - bam vao bat NavTransitionOverlay.tsx (mount toan
// cuc o (main)/layout.tsx) hien ngay lap tuc, tranh cam giac "khong phan hoi"
// trong luc cho trang dich render. Dung o CA the Series /home (NewestSeriesRail)
// VA hang Series /series (SeriesListPage) - 2 noi khac nhau nhung cung 1
// hanh vi "bam vao 1 Series -> chuyen trang".
export function SeriesCardLink({
  onClick,
  ...props
}: ComponentProps<typeof Link>) {
  const start = useNavTransitionStore((s) => s.start);
  return (
    <Link
      {...props}
      onClick={(e) => {
        start("Đang mở series...");
        onClick?.(e);
      }}
    />
  );
}
