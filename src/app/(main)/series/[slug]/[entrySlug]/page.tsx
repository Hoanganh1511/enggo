import { notFound } from "next/navigation";
import Link from "next/link";
import { getContentSeriesEntryAction } from "@/actions/discover/content-series/get-content-series-entry";
import { DocsMarkdown } from "@/components/docs/DocsMarkdown";
import { DocsToc } from "@/components/docs/DocsToc";
import { extractDocsToc } from "@/lib/docs/docs-toc";
import { SeriesInstallWidget } from "@/components/series/SeriesInstallWidget";
import { SeriesShareButtons } from "@/components/series/SeriesShareButtons";
import { SeriesWhereThisFits } from "@/components/series/SeriesWhereThisFits";
import { SeriesEntryPagination } from "@/components/series/SeriesEntryPagination";

// Trang 1 Entry (dac ta muc 2.2) - TOC + "Where this fits" tai su dung
// component da co cua module Docs/Series (xem comment tung import), giu bo
// cuc 2 cot noi dung/TOC giong docs/[collection]/[article]/page.tsx.
export default async function SeriesEntryPage({
  params,
}: {
  params: Promise<{ slug: string; entrySlug: string }>;
}) {
  const { slug, entrySlug } = await params;
  const data = await getContentSeriesEntryAction(slug, entrySlug).catch(() => null);
  if (!data) notFound();
  const { series, entry, prev, next, totalCount } = data;

  const toc = extractDocsToc(entry.contentMarkdown);
  const positionIndex = entry.orderIndex + 1;
  const installTabs = entry.installTabs ?? series.installTabs;
  const entryUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/series/${slug}/${entrySlug}`;

  return (
    <div className="flex gap-8">
      <article className="min-w-0 flex-1 pb-20">
        <p className="text-[13px] text-ink-faint">
          <Link href={`/series/${slug}`} className="hover:text-ink hover:underline">
            {series.title}
          </Link>
          {" · "}
          {String(positionIndex).padStart(2, "0")} / {String(totalCount).padStart(2, "0")}
          {" · "}
          {entry.readTimeMinutes} phút đọc
        </p>

        <div className="mt-2 flex items-start gap-2.5">
          {entry.icon && <span className="mt-0.5 text-2xl">{entry.icon}</span>}
          <div>
            <h1 className="text-[26px] font-extrabold text-ink sm:text-[30px]">{entry.title}</h1>
            {entry.subtitle && <p className="mt-1 text-[15px] text-ink-faint">{entry.subtitle}</p>}
          </div>
        </div>

        {entry.source && (
          <span className="mt-3 inline-block rounded-md bg-surface-muted px-2 py-1 font-mono text-[12px] text-ink-faint">
            {entry.source}
          </span>
        )}

        <div className="mt-6">
          <DocsMarkdown markdown={entry.contentMarkdown} />
        </div>

        {entry.faq && entry.faq.length > 0 && (
          <div className="mt-8 border-t border-border pt-6">
            <h2 className="mb-3 text-[18px] font-semibold text-ink">Câu hỏi thường gặp</h2>
            <div className="flex flex-col gap-4">
              {entry.faq.map((item) => (
                <div key={item.question}>
                  <p className="font-semibold text-ink">{item.question}</p>
                  <div className="mt-1 text-[14px] text-ink-muted">
                    <DocsMarkdown markdown={item.answer} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {installTabs.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-3 text-[15px] font-semibold text-ink">Cài đặt</h2>
            <SeriesInstallWidget tabs={installTabs} />
          </div>
        )}

        <div className="mt-8">
          <SeriesShareButtons channels={series.shareChannels} url={entryUrl} title={entry.title} />
        </div>

        {totalCount > 1 && (
          <SeriesEntryPagination
            seriesSlug={slug}
            prev={prev}
            current={{ title: entry.title }}
            next={next}
          />
        )}
      </article>

      <aside className="sticky top-6 hidden h-fit w-56 shrink-0 flex-col gap-6 xl:flex">
        <DocsToc toc={toc} />
        <SeriesWhereThisFits categories={series.categories} activeCategoryId={entry.categoryId} />
      </aside>
    </div>
  );
}
