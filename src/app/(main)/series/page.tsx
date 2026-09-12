import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";
import { listContentSeriesAction } from "@/actions/discover/content-series/list-content-series";

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
  const seriesList = await listContentSeriesAction();

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-[26px] font-extrabold tracking-tight text-ink">Series</h1>
      <p className="mt-1.5 text-[14px] text-ink-faint">
        Các chuỗi bài/khoá kỹ năng nhiều phần - đọc theo đúng thứ tự để đi từ cơ bản đến nâng cao.
      </p>

      {seriesList.length === 0 ? (
        <p className="mt-8 text-[14px] text-ink-faint">Chưa có series nào.</p>
      ) : (
        <div className="mt-8 flex flex-col gap-3">
          {seriesList.map((series) => (
            <Link
              key={series.id}
              href={`/series/${series.slug}`}
              className="flex items-center gap-4 rounded-xl border border-border p-4 transition-colors duration-150 ease-out hover:bg-hover-bg"
            >
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
              <ChevronRight size={16} className="shrink-0 text-ink-faint" aria-hidden="true" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
