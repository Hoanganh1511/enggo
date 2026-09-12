import { notFound } from "next/navigation";
import { getContentSeriesOverviewAction } from "@/actions/discover/content-series/get-content-series-overview";
import { DocsMarkdown } from "@/components/docs/DocsMarkdown";
import { SeriesStatsBar } from "@/components/series/SeriesStatsBar";
import { SeriesInstallWidget } from "@/components/series/SeriesInstallWidget";
import { SeriesEmailSignup } from "@/components/series/SeriesEmailSignup";

// Trang tong quan Series (dac ta muc 2.1) - tai su dung DocsMarkdown cho phan
// mo ta (rich text: **bold**/link/inline code) thay vi viet lai 1 renderer
// markdown khac, component do da doc lap voi "docs" (chi nhan 1 chuoi
// markdown) nen dung duoc cho ca Series.
export default async function SeriesOverviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const series = await getContentSeriesOverviewAction(slug).catch(() => null);
  if (!series) notFound();

  return (
    <div className="max-w-3xl pb-20">
      <h1 className="text-[30px] font-extrabold tracking-tight text-ink">{series.title}</h1>
      <div className="mt-3">
        <DocsMarkdown markdown={series.description} />
      </div>

      <SeriesStatsBar stats={series.stats} externalLinks={series.externalLinks} />

      {series.installTabs.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-[15px] font-semibold text-ink">Cài đặt</h2>
          <SeriesInstallWidget tabs={series.installTabs} />
        </div>
      )}

      {series.emailCourseEnabled && (
        <div className="mt-8">
          <SeriesEmailSignup
            title={series.emailCourseTitle ?? "Nhận bài mới qua email"}
            description={series.emailCourseDescription ?? ""}
          />
        </div>
      )}
    </div>
  );
}
