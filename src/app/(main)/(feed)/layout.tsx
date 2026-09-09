import { HomeDashboardSidebar } from "@/components/discover/home-dashboard/HomeDashboardSidebar";

// Route group "(feed)" - KHONG xuat hien trong URL. Truoc day boc
// HomeLayoutShell (sidebar loc linh vuc nghe nghiep, dung chung voi /communities
// /contest ban cu) - 2 trang danh sach do da khong con ton tai (chi con
// /home, /articles trong nhom nay). Sidebar dashboard MOI (HomeDashboardSidebar,
// port tu source rieng - xem docs/home-dashboard-style-guide.md) gio la
// sidebar CHUNG DUY NHAT cho ca /home VA /articles - dat o day (thay vi rieng
// tung page/layout con) de KHONG remount khi chuyen qua lai giua 2 trang.
// className "dashboard-scope" (xem globals.css) nap bo CSS var rieng cua khu
// vuc nay (--background/--border/--primary...) - tach biet co chu dich khoi
// token toan app, cascade xuong ca sidebar lan moi trang con.
export default function FeedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-scope">
      <HomeDashboardSidebar />
      <main className="relative z-10 py-6 lg:pl-61">
        {/* Container chung cho BODY cua moi trang trong nhom (feed) - truoc
            day /home va /articles moi trang tu khai bao container rieng
            (bi lech nhau: /home co px-10, /articles thi khong) - gio dua ve
            DUY NHAT 1 cho, page.tsx chi con lo phan grid/noi dung cua rieng
            no. Mac dinh padding DEU 2 ben tu `lg` (dung cho /articles,
            /tracking) - RIENG /home huy padding phai bang `lg:-mr-10` ngay
            trong home/page.tsx (yeu cau rieng: /home liet sat vien phai man
            hinh, cac trang khac thi khong). Duoi `lg` (sidebar da an, thay
            bang thanh mobile o HomeDashboardSidebar.tsx) padding DEU 2 ben,
            dung spec "<640px: page padding 16px" o
            docs/home-dashboard-style-guide.md muc 21. */}
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-10">{children}</div>
      </main>
    </div>
  );
}
