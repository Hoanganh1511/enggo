"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Khu vuc noi dung chinh - nam ngay duoi TopHeaderBar trong layout 1 cot
// (xem (main)/layout.tsx). Khong con Sidebar nen khong phai dong bo
// margin-left voi thu gi ca, chi la 1 div padding tinh + vung cuon.
//
// Vung cuon THAT nam o day (overflow-auto), khong phai window - <body> da
// khoa overflow-hidden (xem app/layout.tsx). Next.js chi tu reset scroll cho
// window luc dieu huong (<Link>/router.push), khong biet gi ve div overflow
// tu custom nay. MainContentArea lai la layout dung chung, KHONG remount khi
// doi giua /home va /u/[username] (cung nam duoi (main)/layout.tsx), nen
// scrollTop cu bi giu nguyen - vd dang cuon sau /home roi bam sang trang
// profile thi profile hien ra cung dang cuon do thay vi len dau trang. Tu
// scrollTo(0,0) moi lan pathname doi de sua.
const MainContentArea = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    ref.current?.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div ref={ref} className="min-h-0 flex-1 scroll-smooth overflow-auto pb-4">
      {children}
    </div>
  );
};

export default MainContentArea;
