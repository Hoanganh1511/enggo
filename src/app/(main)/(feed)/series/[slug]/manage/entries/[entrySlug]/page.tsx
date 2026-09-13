import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSelfStatusAction } from "@/actions/users/get-self-status";
import { getContentSeriesEntryAction } from "@/actions/discover/content-series/get-content-series-entry";
import { SeriesEntryForm } from "@/components/series/SeriesEntryForm";

export default async function EditSeriesEntryPage({
  params,
}: {
  params: Promise<{ slug: string; entrySlug: string }>;
}) {
  const { slug, entrySlug } = await params;
  const status = await getSelfStatusAction();
  if (!status.isAdmin) notFound();

  const data = await getContentSeriesEntryAction(slug, entrySlug).catch(() => null);
  if (!data) notFound();

  return (
    <div>
      <Link
        href={`/series/${slug}/manage`}
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-ink-faint hover:text-ink"
      >
        <ArrowLeft size={13} />
        Quay lại quản lý
      </Link>

      <h1 className="mb-6 text-[22px] font-bold text-ink">
        Sửa Entry - {data.series.title}
      </h1>
      <SeriesEntryForm seriesSlug={slug} categories={data.series.categories} initial={data.entry} />
    </div>
  );
}
