import { notFound } from "next/navigation";
import { getSelfStatusAction } from "@/actions/users/get-self-status";
import { getContentSeriesEntryAction } from "@/actions/discover/content-series/get-content-series-entry";
import { SeriesEntryForm } from "@/components/series/SeriesEntryForm";
import { ManageBreadcrumb } from "@/components/series/ManageBreadcrumb";

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
      <ManageBreadcrumb
        items={[
          { label: "Series", href: "/series" },
          { label: data.series.title, href: `/series/${slug}/manage` },
          { label: `Sửa: ${data.entry.title}` },
        ]}
      />

      <h1 className="mb-6 text-[22px] font-bold text-ink">
        Sửa Entry - {data.series.title}
      </h1>
      <SeriesEntryForm seriesSlug={slug} categories={data.series.categories} initial={data.entry} />
    </div>
  );
}
