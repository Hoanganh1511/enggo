"use client";

import { SessionProvider } from "next-auth/react";

// Boc quanh {children} trong RootLayout (Server Component) - CHI de cho
// useSession() (client-side, doc tu 1 fetch rieng toi /api/auth/session,
// cache lai) hoat dong o cac client component sau nay (vd top-header-bar.tsx,
// account-menu.tsx). KHONG lam RootLayout tro thanh dynamic - khac voi await
// auth() truc tiep trong 1 Server Component (xem comment trong
// (main)/layout.tsx ve ly do CurrentUser duoc tach rieng + boc Suspense),
// SessionProvider chi la 1 client component thong thuong, children (Server
// Component) truyen qua props van render binh thuong o server.
export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
