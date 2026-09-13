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
    // Sidebar mau KHAC noi dung ben phai (bg-surface-muted vs bg-surface mac
    // dinh cua content) - yeu cau nguoi dung, khop mockup. `<aside>` KHONG dat
    // h-fit de tu gian theo align-items:stretch mac dinh cua flex row cha
    // (min-h-full), cho khoi mau phu HET chieu cao trang; phan nav ben trong
    // moi la <div sticky> (dinh khi cuon), tach rieng khoi khoi mau ngoai.
    <div className="flex min-h-full gap-8">
      <aside className="hidden w-64 shrink-0 rounded-xl bg-surface-muted lg:block">
        <div className="sticky top-6 p-5">
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

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
