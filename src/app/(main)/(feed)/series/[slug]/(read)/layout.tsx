import { notFound } from "next/navigation";
import { getContentSeriesOverviewAction } from "@/actions/discover/content-series/get-content-series-overview";
import { SeriesSidebar } from "@/components/series/SeriesSidebar";
import { SeriesFocusSidebar } from "@/components/series/SeriesFocusSidebar";
import { SeriesFocusRow } from "@/components/series/SeriesFocusRow";
import { SeriesFocusContent } from "@/components/series/SeriesFocusContent";
import { SeriesSidebarCollapseButton } from "@/components/series/SeriesSidebarCollapseButton";
import {
  SeriesMobileTopBar,
  SeriesSidebarDrawer,
} from "@/components/series/SeriesMobileNav";

// Layout dung chung cho toan bo 1 Series (Overview + moi Entry) - sidebar
// trai (cay category/entry) o day de KHONG remount khi chuyen qua lai giua
// cac trang trong CUNG 1 Series, dung tinh than docs/[collection]/layout.tsx
// (component tham khao gan nhat trong repo cho cau truc "sidebar + nhieu bai").
// Nam trong nhom route (feed) (xem (feed)/layout.tsx) de HomeDashboardSidebar
// (nav CHINH cua app) VAN GIU NGUYEN khi vao /series - truoc day series nam
// ngoai nhom nay nen sidebar chinh bi dong mat, chi con lai sidebar RIENG cua
// Series (cay category/entry, khac chuc nang). (feed)/layout.tsx da lo san
// padding ngoai (py-6 lg:pl-61 + container px-4/6/10) nen o day KHONG lap lai.
//
// [2026-09-14] Sidebar KHONG con boc rieng trong <Suspense> nua (da thu qua
// 1 lan, xem docs/engineering-log.md 2026-09-14 "Series progressive loading -
// sidebar duplicate skeleton"): layout nay persist xuyen suot moi Entry
// trong CUNG 1 Series (chi `children` doi, `slug` khong doi), nhung 1
// <Suspense> nam TRONG than layout van bi Next.js coi la "dynamic", khien no
// RE-SUSPEND (hien lai fallback SidebarSkeleton) O MOI LAN dieu huong sang
// Entry khac trong CUNG series - nguoi dung bao dung: sidebar dang hien san
// van bi "nhay" hien skeleton de len tren no. Batch 1 (header+sidebar) cua
// Progressive Loading van dam bao qua loading.tsx (chi hien 1 LAN DUY NHAT
// luc dieu huong VAO series lan dau, khong lap lai khi chuyen Entry) - phan
// can skeleton-lai o MOI Entry (than bai/TOC/extras) van nam o
// [entrySlug]/page.tsx, KHONG dong cham gi o day.
export default async function SeriesLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const series = await getContentSeriesOverviewAction(slug).catch(() => null);
  if (!series) notFound();

  return (
    <>
      {/* Duoi lg: <aside> ben duoi AN HOAN TOAN, thanh nay thay the - giu lai
          ten series + 1 nut mo SeriesSidebarDrawer (cay category/entry that,
          xem SeriesMobileNav.tsx) - truoc day KHONG co gi thay the tren
          mobile (lo responsive that su, khong phai suy doan). Tran sat mep
          NGANG + mep TREN (cung cong thuc margin am voi div ben duoi) de bam
          dung vien tren cua vung noi dung, KHONG dung lg:-mx-10 (vo nghia vi
          chinh thanh nay da lg:hidden). */}
      <SeriesMobileTopBar seriesTitle={series.title} />
      <SeriesSidebarDrawer
        slug={slug}
        seriesTitle={series.title}
        categories={series.categories}
        entries={series.entries}
      />

      {/* Sidebar mau KHAC noi dung ben phai, TRAN SAT MEP (khong padding/khoang
          trong quanh no) - yeu cau nguoi dung, khop mockup. (feed)/layout.tsx (cha)
          co san 1 lop padding (py-6 + px-4/6/10) boc quanh MOI trang trong nhom
          (feed) - o day dung margin AM KHOP CHINH XAC tung gia tri do de "tran"
          ra het phan padding ay, thay vi lam 1 khoi mau code lo lung co padding
          xung quanh (nhu ban truoc, nguoi dung bao sai). Padding THAT (cho chu
          khong dinh sat canh) chuyen vao BEN TRONG tung nua (sidebar/content) o
          day thay vi o ngoai.

          min-h dua tren VIEWPORT (100vh - chieu cao header) thay vi "min-h-full"
          (% cua parent - chinh no lai chi cao bang NOI DUNG, vd trang co it chu
          thi hang flex nay cung ngan theo, lam khoi mau bi "cut ngun" giua trang
          thay vi day het 1 man hinh - nguoi dung bao loi). Dam bao LUON it nhat
          day 1 viewport, cao hon the neu noi dung dai hon (min-height van cho
          gian ra binh thuong). */}
      <SeriesFocusRow>
        <SeriesFocusSidebar>
          <aside className="hidden w-64 shrink-0 border-r border-border bg-[#f5f6f8] lg:block">
            <div className="sticky top-0 p-[18px]">
              {/* Link "Tất cả series" + nut gear Quan ly - DA BO (yeu cau
                  nguoi dung: "Tất cả series và nút settings không cho hiện ở
                  đây nữa"). Duong ve series LIST gio nam trong breadcrumb
                  cua tung Entry ("Series" - xem EntryHeader trong
                  [entrySlug]/page.tsx); sua Series chuyen han sang trang
                  Quan ly profile (chua lam trong scope nay - chi bo nut o
                  day, chua them entry point moi). */}
              {/* "Series title" (14/600, Geist Sans - yeu cau nguoi dung ve
                  bang cau hinh type system sidebar). */}
              <div className="mb-4 flex items-start justify-between gap-2 px-2.5">
                <p
                  className="min-w-0 truncate text-[14px] font-semibold text-ink"
                  style={{ fontFamily: "var(--font-geist-sans)" }}
                >
                  {series.title}
                </p>
                <SeriesSidebarCollapseButton />
              </div>
              <SeriesSidebar
                seriesSlug={slug}
                categories={series.categories}
                entries={series.entries}
              />
            </div>
          </aside>
        </SeriesFocusSidebar>

        <SeriesFocusContent>{children}</SeriesFocusContent>
      </SeriesFocusRow>
    </>
  );
}
