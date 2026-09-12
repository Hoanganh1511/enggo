import Link from "next/link";
import { BookOpen, ChevronRight, Plus, Settings } from "lucide-react";
import { listContentSeriesAction } from "@/actions/discover/content-series/list-content-series";
import { getSelfStatusAction } from "@/actions/users/get-self-status";

// The danh sach chi hien PLAIN TEXT (line-clamp 2 dong) - bo cu phap markdown
// tho (**bold**/`code`/[link](url)) thay vi render HTML that (qua nang cho 1
// dong teaser), khac trang chi tiet dung DocsMarkdown de render day du.
function stripMarkdown(text: string): string {
  return text
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

export default async function SeriesListPage() {
  const [seriesList, status] = await Promise.all([
    listContentSeriesAction(),
    getSelfStatusAction(),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-extrabold tracking-tight text-ink">Series</h1>
          <p className="mt-1.5 text-[14px] text-ink-faint">
            Các chuỗi bài/khoá kỹ năng nhiều phần - đọc theo đúng thứ tự để đi từ cơ bản đến nâng cao.
          </p>
        </div>
        {status.isAdmin && (
          <Link
            href="/series/new"
            className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-ink px-3.5 py-2 text-[13px] font-semibold text-surface transition hover:opacity-90"
          >
            <Plus size={14} /> New Series
          </Link>
        )}
      </div>

      {seriesList.length === 0 ? (
        <p className="mt-8 text-[14px] text-ink-faint">Chưa có series nào.</p>
      ) : (
        <div className="mt-8 flex flex-col gap-3">
          {seriesList.map((series) => (
            <div
              key={series.id}
              className="flex items-center gap-4 rounded-xl border border-border p-4 transition-colors duration-150 ease-out hover:bg-hover-bg"
            >
              <Link href={`/series/${series.slug}`} className="flex min-w-0 flex-1 items-center gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <BookOpen size={18} aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink">{series.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-[13px] text-ink-faint">
                    {stripMarkdown(series.description)}
                  </p>
                  <p className="mt-1 text-[12px] text-ink-faint">{series._count.entries} bài</p>
                </div>
              </Link>
              {status.isAdmin && (
                <Link
                  href={`/series/${series.slug}/manage`}
                  aria-label="Quản lý series"
                  title="Quản lý series"
                  className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-surface hover:text-ink"
                >
                  <Settings size={16} />
                </Link>
              )}
              <Link href={`/series/${series.slug}`} aria-hidden="true" tabIndex={-1}>
                <ChevronRight size={16} className="shrink-0 text-ink-faint" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
