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
export default function FeedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // bg-background + min-h-full THEM (2026-09-19) - yeu cau nguoi dung:
    // "Đổi màu nền của trang /home sang màu này [#F1F2F5]". Doi rieng GIA TRI
    // token --background trong .dashboard-scope (globals.css) la CHUA DU: to
    // day tu no chi KHAI BAO lai 1 CSS custom property pham vi cuc bo, KHONG
    // TU SON nen cho chinh no - mau trang dang thay tren /home THAT RA la cua
    // 1 the CHA o ngoai pham vi nay ((main)/layout.tsx, dung --background goc
    // cua :root, khong thay duoc gia tri moi vua doi trong .dashboard-scope
    // vi CSS custom property chi chay XUONG con chau, khong chay NGUOC len
    // cha). bg-background o day moi la thu THAT SU son mau (doc dung
    // --background cuc bo cua .dashboard-scope nho o CUNG 1 phan tu). min-h-full
    // de nen phu HET chieu cao vung cuon (MainContentArea, khong chi cao bang
    // noi dung) - tranh de lo mau trang cua the cha o duoi khi noi dung ngan
    // hon 1 man hinh.
    <div className="dashboard-scope min-h-full bg-background">
      <HomeDashboardSidebar />
      {/* Container chung cho BODY cua moi trang trong nhom (feed) - truoc day
          /home va /articles moi trang tu khai bao container rieng (bi lech
          nhau: /home co px-10, /articles thi khong) - gio dua ve DUY NHAT 1
          cho, page.tsx chi con lo phan grid/noi dung cua rieng no. Mac dinh
          padding DEU 2 ben tu `lg` (dung cho /articles, /tracking) - RIENG
          /home huy padding phai bang `lg:-mr-10` ngay trong home/page.tsx
          (yeu cau rieng: /home liet sat vien phai man hinh, cac trang khac
          thi khong). Duoi `lg` (sidebar da an, thay bang thanh mobile o
          HomeDashboardSidebar.tsx) padding DEU 2 ben, dung spec "<640px: page
          padding 16px" o docs/home-dashboard-style-guide.md muc 21.
          FeedMainArea.tsx (client) tu bo padding trai lg:pl-61 khi Focus mode
          dang bat (xem focus-mode-store.ts) - Server Component nay khong doc
          duoc Zustand nen tach rieng phan do ra 1 wrapper client. */}
      <FeedMainArea>{children}</FeedMainArea>
    </div>
  );
}
