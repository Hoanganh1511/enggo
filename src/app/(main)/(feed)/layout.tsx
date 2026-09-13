import { HomeDashboardSidebar } from "@/components/discover/home-dashboard/HomeDashboardSidebar";
import { FeedMainArea } from "@/components/discover/home-dashboard/FeedMainArea";

// Route group "(feed)" - KHONG xuat hien trong URL. Truoc day boc
// HomeLayoutShell (sidebar loc linh vuc nghe nghiep, dung chung voi /communities
// /contest ban cu) - 2 trang danh sach do da khong con ton tai (chi con
// /home, /articles, /series trong nhom nay). Sidebar dashboard MOI
// (HomeDashboardSidebar, port tu source rieng - xem docs/home-dashboard-style-guide.md)
// gio la sidebar CHUNG DUY NHAT cho ca nhom - dat o day (thay vi rieng tung
// page/layout con) de KHONG remount khi chuyen qua lai giua cac trang.
// className "dashboard-scope" (xem globals.css) nap bo CSS var rieng cua khu
// vuc nay (--background/--border/--primary...) - tach biet co chu dich khoi
// token toan app, cascade xuong ca sidebar lan moi trang con.
//
// <main> tach rieng thanh FeedMainArea (client) - vao trang chi tiet Series
// (co sidebar RIENG cua no, xem SeriesSidebar.tsx) sidebar CHINH nay tu thu
// gon (xem HomeDashboardSidebar.tsx), padding-left cua <main> phai phan ung
// theo do - server component o day khong doc duoc trang thai thu gon (zustand
// client state) luc render nen phai day xuong 1 client component rieng.
export default function FeedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-scope">
      <HomeDashboardSidebar />
      <FeedMainArea>{children}</FeedMainArea>
    </div>
  );
}
