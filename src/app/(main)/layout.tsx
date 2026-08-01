import { Suspense } from "react";
import TopHeaderBar from "@/components/career-tree/top-header-bar";
import CurrentUser from "@/components/career-tree/current-user";
import MainContentArea from "@/components/career-tree/main-content-area";
import FeedBootstrap from "@/lib/discover/FeedBootstrap";

// Khong con async/await auth() o day - CurrentUser (Server Component rieng,
// tu goi auth()) duoc dung va boc Suspense NGAY TAI DAY (layout van la Server
// Component) roi truyen xuong TopHeaderBar qua prop accountSlot. Tuyet doi
// khong import CurrentUser truc tiep trong top-header-bar.tsx ("use client") -
// lam vay se khien auth() mat request context (headers()/cookies() loi
// "outside a request scope").
const Layout = ({ children }: { children: React.ReactNode }) => {
  const accountSlot = (
    <Suspense
      fallback={
        <div className="size-8 shrink-0 rounded-full bg-surface-muted" />
      }
    >
      <CurrentUser />
    </Suspense>
  );

  // Layout 1 cot: header ngang tren cung + noi dung ben duoi. Ban truoc la
  // 3 cot (Sidebar trai / noi dung / panel phai) - TOAN BO chuc nang cua
  // Sidebar da gom len header (xem top-header-bar.tsx), nen sidebar.tsx va
  // app-shell-row.tsx da xoa han.
  return (
    <>
      <FeedBootstrap />
      <TopHeaderBar accountSlot={accountSlot} />
      <MainContentArea>{children}</MainContentArea>
    </>
  );
};

export default Layout;
