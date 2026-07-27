"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type AppShellRowProps = {
  sidebar: ReactNode;
  children: ReactNode;
};

// Hang chua Sidebar + noi dung chinh, tach rieng thanh client component chi
// de doc pathname (layout.tsx cha PHAI la Server Component - xem ghi chu
// trong layout.tsx ve Suspense/CurrentUser/auth()). Chi trang /home (feed
// dang social, theo dung mockup redesign) can gom CA Sidebar lan noi dung
// vao chung 1 khoi max-width can giua tren man hinh rong; cac trang con lai
// (Career Tree canvas, Skill Tree...) can toan bo chieu rong man hinh nen
// giu nguyen full-width nhu truoc.
const AppShellRow = ({ sidebar, children }: AppShellRowProps) => {
  const pathname = usePathname();
  const isHome = pathname.startsWith("/home");

  if (!isHome) {
    return (
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {sidebar}
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 justify-center overflow-hidden">
      <div className="flex min-h-0 w-full max-w-380 overflow-hidden">
        {/* {sidebar} */}
        {children}
      </div>
    </div>
  );
};

export default AppShellRow;
