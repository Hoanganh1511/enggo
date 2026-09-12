import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ContentSeriesEntrySummary } from "@/lib/api/content-series";

// 3 the ngang Prev/Current/Next (dac ta muc 2.2.10) - Entry dau khong co
// Prev, Entry cuoi khong co Next (truyen null tu backend, xem
// findEntry trong content-series.service.ts).
export function SeriesEntryPagination({
  seriesSlug,
  prev,
  current,
  next,
}: {
  seriesSlug: string;
  prev: ContentSeriesEntrySummary | null;
  current: { title: string };
  next: ContentSeriesEntrySummary | null;
}) {
  return (
    <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
      {prev ? (
        <Link
          href={`/series/${seriesSlug}/${prev.slug}`}
          className="flex flex-col gap-1 rounded-xl border border-border p-4 transition-colors duration-150 ease-out hover:bg-hover-bg"
        >
          <span className="flex items-center gap-1 text-[11px] font-medium text-ink-faint uppercase">
            <ArrowLeft size={12} /> Previous skill
          </span>
          <span className="truncate text-[14px] font-medium text-ink">{prev.title}</span>
        </Link>
      ) : (
        <div />
      )}

      <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border p-4 text-center">
        <span className="text-[11px] font-medium text-ink-faint uppercase">You are here</span>
        <span className="truncate text-[14px] font-medium text-ink">{current.title}</span>
      </div>

      {next ? (
        <Link
          href={`/series/${seriesSlug}/${next.slug}`}
          className="flex flex-col items-end gap-1 rounded-xl border border-border p-4 text-right transition-colors duration-150 ease-out hover:bg-hover-bg"
        >
          <span className="flex items-center gap-1 text-[11px] font-medium text-ink-faint uppercase">
            Next skill <ArrowRight size={12} />
          </span>
          <span className="truncate text-[14px] font-medium text-ink">{next.title}</span>
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}
