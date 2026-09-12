import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSelfStatusAction } from "@/actions/users/get-self-status";
import { getContentSeriesOverviewAction } from "@/actions/discover/content-series/get-content-series-overview";
import { SeriesForm } from "@/components/series/SeriesForm";
import { SeriesTreeManager } from "@/components/series/SeriesTreeManager";
import { SeriesDeleteButton } from "@/components/series/SeriesDeleteButton";

// Trang quan ly 1 Series (Cap 1: thong tin chung + Cap 2: cay category/entry) -
// nam NGOAI nhom route (read) (xem [slug]/(read)/layout.tsx) nen KHONG bi
// keo theo sidebar doc cong khai (SeriesSidebar) - trang nay can toan bo be
// rong cho form/tree.
export default async function SeriesManagePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const status = await getSelfStatusAction();
  if (!status.isAdmin) notFound();

  const series = await getContentSeriesOverviewAction(slug).catch(() => null);
  if (!series) notFound();

  return (
    <div className="mx-auto max-w-3xl pb-20">
      <Link
        href={`/series/${slug}`}
        className="mb-4 flex items-center gap-1.5 text-xs font-medium text-ink-faint hover:text-ink"
      >
        <ArrowLeft size={13} />
        Xem trang công khai
      </Link>

      <h1 className="text-[22px] font-bold text-ink">Quản lý: {series.title}</h1>

      <section className="mt-6">
        <h2 className="mb-3 text-[15px] font-semibold text-ink">Thông tin chung</h2>
        <SeriesForm initial={series} />
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-[15px] font-semibold text-ink">Cấu trúc (Category & Entry)</h2>
        <SeriesTreeManager
          seriesSlug={slug}
          categories={series.categories}
          entries={series.entries}
        />
      </section>

      <section className="mt-10 border-t border-border pt-6">
        <h2 className="mb-2 text-[15px] font-semibold text-danger">Vùng nguy hiểm</h2>
        <p className="mb-3 text-[13px] text-ink-faint">
          Xoá Series sẽ xoá luôn toàn bộ category và entry bên trong, không thể hoàn tác.
        </p>
        <SeriesDeleteButton seriesSlug={slug} />
      </section>
    </div>
  );
}
