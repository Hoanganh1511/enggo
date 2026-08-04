import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PostSummary } from "./article-types";
import { cn } from "@/lib/utils";

// Dieu huong bai truoc/sau CUA CHINH TAC GIA DO (khong phai bai truoc/sau
// theo thoi gian toan he thong) - prev/next co the undefined khi dang o bai
// dau/cuoi trong danh sach bai cua tac gia, luc do 1 hoac ca 2 o an di thay
// vi hien link chet.
export function ArticlePrevNextNav({
  prev,
  next,
}: {
  prev?: PostSummary;
  next?: PostSummary;
}) {
  if (!prev && !next) return null;

  return (
    <div className="grid grid-cols-2 gap-3">
      {prev ? (
        <Link
          href={`/p/${prev.id}`}
          className="flex flex-col gap-1 rounded-lg border border-border p-3 transition-colors duration-150 ease-out hover:bg-hover-bg"
        >
          <span className="flex items-center gap-1 text-xs font-medium text-ink-faint">
            <ChevronLeft size={13} strokeWidth={2.25} />
            Bài trước
          </span>
          <span className="line-clamp-2 text-sm font-medium text-ink">
            {prev.title}
          </span>
        </Link>
      ) : (
        <div />
      )}

      {next ? (
        <Link
          href={`/p/${next.id}`}
          className="flex flex-col items-end gap-1 rounded-lg border border-border p-3 text-right transition-colors duration-150 ease-out hover:bg-hover-bg"
        >
          <span className="flex items-center gap-1 text-xs font-medium text-ink-faint">
            Bài tiếp theo
            <ChevronRight size={13} strokeWidth={2.25} />
          </span>
          <span className={cn("line-clamp-2 text-sm font-medium text-ink")}>
            {next.title}
          </span>
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}
