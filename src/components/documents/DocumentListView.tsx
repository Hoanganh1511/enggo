import Link from "next/link";
import { FileText, Eye, Pin, PenSquare } from "lucide-react";
import type { ApiDocumentSummary } from "@/lib/api/types";
import { formatRelativeTime } from "@/lib/career-tree/format-time";
import { formatCompact } from "@/lib/format-number";

// Noi dung tab "Tài liệu" cua profile - luoi the tai lieu. Chu so huu thay
// nut "Viết tài liệu" + ca ban nhap (co badge). Click the -> trang doc
// /u/[username]/docs/[slug].
export function DocumentListView({
  documents,
  username,
  isSelf,
}: {
  documents: ApiDocumentSummary[];
  username: string;
  isSelf: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-ink">Tài liệu</h2>
        {isSelf && (
          <Link
            href={`/u/${username}/docs/new`}
            className="flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-community-accent px-4 text-sm font-semibold text-white hover:bg-community-accent-hover"
          >
            <PenSquare size={15} strokeWidth={2.25} />
            Viết tài liệu
          </Link>
        )}
      </div>

      {documents.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-16 text-center">
          <FileText size={28} strokeWidth={1.5} className="text-ink-faint" />
          <p className="text-sm text-ink-muted">
            {isSelf
              ? "Bạn chưa có tài liệu nào. Viết tài liệu đầu tiên nhé!"
              : "Người dùng này chưa xuất bản tài liệu nào."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {documents.map((doc) => (
            <Link
              key={doc.id}
              href={`/u/${username}/docs/${doc.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-shadow duration-150 ease-out hover:shadow-md"
            >
              <div className="relative h-36 w-full overflow-hidden bg-surface-muted">
                {doc.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={doc.coverImageUrl}
                    alt=""
                    className="size-full object-cover transition-transform duration-200 ease-out group-hover:scale-105"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center bg-linear-to-br from-community-accent/15 to-community-accent/5">
                    <FileText size={30} strokeWidth={1.5} className="text-community-accent/50" />
                  </div>
                )}
                {doc.isPinned && (
                  <span className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-community-accent px-2 py-0.5 text-[10px] font-semibold text-white">
                    <Pin size={10} strokeWidth={2.5} />
                    Đã ghim
                  </span>
                )}
                {!doc.isPublished && (
                  <span className="absolute top-2 right-2 rounded-full bg-warning px-2 py-0.5 text-[10px] font-semibold text-white">
                    Nháp
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-1.5 p-4">
                <h3 className="line-clamp-2 text-base leading-snug font-semibold text-ink group-hover:text-community-accent">
                  {doc.title}
                </h3>
                {doc.summary && (
                  <p className="line-clamp-2 text-xs leading-relaxed text-ink-faint">
                    {doc.summary}
                  </p>
                )}
                {doc.tags.length > 0 && (
                  <div className="mt-0.5 flex flex-wrap gap-1">
                    {doc.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-medium text-ink-muted"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-auto flex items-center gap-3 pt-1.5 text-[11px] text-ink-faint">
                  <span>{formatRelativeTime(doc.updatedAt)}</span>
                  <span className="flex items-center gap-1">
                    <Eye size={11} strokeWidth={2} />
                    {formatCompact(doc.viewCount)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
