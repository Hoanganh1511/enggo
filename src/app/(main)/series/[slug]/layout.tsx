import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getContentSeriesOverviewAction } from "@/actions/discover/content-series/get-content-series-overview";
import { SeriesSidebar } from "@/components/series/SeriesSidebar";

// Layout dung chung cho toan bo 1 Series (Overview + moi Entry) - sidebar
// trai (cay category/entry) o day de KHONG remount khi chuyen qua lai giua
// cac trang trong CUNG 1 Series, dung tinh than docs/[collection]/layout.tsx
// (component tham khao gan nhat trong repo cho cau truc "sidebar + nhieu bai").
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
    <div className="flex min-h-full gap-8 px-6 py-10">
      <aside className="sticky top-6 hidden h-fit w-60 shrink-0 lg:block">
        <Link
          href="/series"
          className="mb-4 flex items-center gap-1.5 px-2.5 text-xs font-medium text-ink-faint hover:text-ink"
        >
          <ArrowLeft size={13} />
          Tất cả series
        </Link>
        <p className="mb-4 truncate px-2.5 text-[13px] font-semibold text-ink">{series.title}</p>
        <SeriesSidebar seriesSlug={slug} categories={series.categories} entries={series.entries} />
      </aside>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
