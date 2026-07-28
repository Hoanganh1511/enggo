import { Suspense } from "react";
import Sidebar from "@/components/career-tree/sidebar";
import TopHeaderBar from "@/components/career-tree/top-header-bar";
import CurrentUser from "@/components/career-tree/current-user";
import MainContentArea from "@/components/career-tree/main-content-area";
import AppShellRow from "@/components/career-tree/app-shell-row";

// Khong con async/await auth() o day - CurrentUser (Server Component rieng,
// tu goi auth()) duoc dung va boc Suspense NGAY TAI DAY (layout van la Server
// Component) roi truyen xuong Sidebar qua prop accountSlot. Tuyet doi khong
// import CurrentUser truc tiep trong sidebar.tsx ("use client") - lam vay se
// khien auth() mat request context (headers()/cookies() loi "outside a
// request scope").
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

  return (
    <>
      {/* Bo header ngang cu - chuyen sang layout 3 cot (Sidebar/noi dung/
          panel phai), khong con thanh ngang tren cung nua. Logo + cum ben
          phai (chat/thong bao/account) da chuyen vao Sidebar, o tim tam an.
          Giu lai TopHeaderBar (comment) phong khi can quay lai. */}
      {/* <TopHeaderBar accountSlot={accountSlot} /> */}
      <AppShellRow sidebar={<Sidebar accountSlot={accountSlot} />}>
        <MainContentArea>{children}</MainContentArea>
      </AppShellRow>
    </>
  );
};

export default Layout;
