import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Settings } from "lucide-react";
import { getContentSeriesOverviewAction } from "@/actions/discover/content-series/get-content-series-overview";
import { getSelfStatusAction } from "@/actions/users/get-self-status";
import { SeriesSidebar } from "@/components/series/SeriesSidebar";

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
  const [series, status] = await Promise.all([
    getContentSeriesOverviewAction(slug).catch(() => null),
    getSelfStatusAction(),
  ]);
  if (!series) notFound();

  return (
    // Sidebar mau KHAC noi dung ben phai, TRAN SAT MEP (khong padding/khoang
    // trong quanh no) - yeu cau nguoi dung, khop mockup. (feed)/layout.tsx (cha)
    // co san 1 lop padding (py-6 + px-4/6/10) boc quanh MOI trang trong nhom
    // (feed) - o day dung margin AM KHOP CHINH XAC tung gia tri do de "tran"
    // ra het phan padding ay, thay vi lam 1 khoi mau code lo lung co padding
    // xung quanh (nhu ban truoc, nguoi dung bao sai). Padding THAT (cho chu
    // khong dinh sat canh) chuyen vao BEN TRONG tung nua (sidebar/content) o
    // day thay vi o ngoai.
    //
    // min-h dua tren VIEWPORT (100vh - chieu cao header) thay vi "min-h-full"
    // (% cua parent - chinh no lai chi cao bang NOI DUNG, vd trang co it chu
    // thi hang flex nay cung ngan theo, lam khoi mau bi "cut ngun" giua trang
    // thay vi day het 1 man hinh - nguoi dung bao loi). Dam bao LUON it nhat
    // day 1 viewport, cao hon the neu noi dung dai hon (min-height van cho
    // gian ra binh thuong).
    <div
      className="-mx-4 -my-6 flex sm:-mx-6 lg:-mx-10"
      style={{ minHeight: "calc(100vh - var(--header-height))" }}
    >
      <aside className="hidden w-64 shrink-0 border-r border-border bg-[#f5f6f8] lg:block">
        <div className="sticky top-0 p-6">
          <div className="mb-4 flex items-center justify-between gap-2 px-2.5">
            <Link
              href="/series"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-faint hover:text-ink"
            >
              <ArrowLeft size={13} />
              Tất cả series
            </Link>
            {status.isAdmin && (
              <Link
                href={`/series/${slug}/manage`}
                aria-label="Quản lý series"
                title="Quản lý series"
                className="text-ink-faint hover:text-ink"
              >
                <Settings size={14} />
              </Link>
            )}
          </div>
          <p className="mb-4 truncate px-2.5 text-[13px] font-semibold text-ink">{series.title}</p>
          <SeriesSidebar seriesSlug={slug} categories={series.categories} entries={series.entries} />
        </div>
      </aside>

      <div className="min-w-0 flex-1 bg-surface p-6 lg:p-10">{children}</div>
    </div>
  );
}
