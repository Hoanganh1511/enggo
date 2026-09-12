import { notFound } from "next/navigation";
import { getSelfStatusAction } from "@/actions/users/get-self-status";
import { getContentSeriesOverviewAction } from "@/actions/discover/content-series/get-content-series-overview";
import { SeriesEntryForm } from "@/components/series/SeriesEntryForm";

export default async function NewSeriesEntryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ categoryId?: string }>;
}) {
  const { slug } = await params;
  const { categoryId } = await searchParams;
  const status = await getSelfStatusAction();
  if (!status.isAdmin) notFound();

  const series = await getContentSeriesOverviewAction(slug).catch(() => null);
  if (!series) notFound();
  if (series.categories.length === 0) {
    return (
      <p className="text-[14px] text-ink-faint">
        Series chưa có category nào - tạo ít nhất 1 category ở trang quản lý trước.
      </p>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-[22px] font-bold text-ink">Entry mới - {series.title}</h1>
      <SeriesEntryForm
        seriesSlug={slug}
        categories={series.categories}
        defaultCategoryId={categoryId}
      />
    </div>
  );
}
