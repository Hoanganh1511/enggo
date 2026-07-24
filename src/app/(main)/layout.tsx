import { Suspense } from "react";
import Sidebar from "@/components/career-tree/sidebar";
import TopHeaderBar from "@/components/career-tree/top-header-bar";
import CurrentUser from "@/components/career-tree/current-user";
import MainContentArea from "@/components/career-tree/main-content-area";

// Khong con async/await auth() o day - CurrentUser (Server Component rieng,
// tu goi auth()) duoc dung va boc Suspense NGAY TAI DAY (layout van la Server
// Component) roi truyen xuong TopHeaderBar qua prop accountSlot. Tuyet doi
// khong import CurrentUser truc tiep trong top-header-bar.tsx ("use client")
// - lam vay se khien auth() mat request context (headers()/cookies() loi
// "outside a request scope").
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <TopHeaderBar
        accountSlot={
          <Suspense
            fallback={
              <div className="size-8 shrink-0 rounded-full bg-surface-muted" />
            }
          >
            <CurrentUser />
          </Suspense>
        }
      />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar />
        <MainContentArea>{children}</MainContentArea>
      </div>
    </>
  );
};

export default Layout;
