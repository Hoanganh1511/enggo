import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";
import type { PostSummary } from "./article-types";

// Ban RUT GON cua "Bài viết liên quan" (khac ArticleRecommendations.tsx -
// ban day du o cuoi trang) - hien trong sidebar dinh (ArticleSidebar.tsx),
// toi da 3 bai + "Xem thêm" nhay xuong dung section day du o cuoi trang
// (anchor "#related-posts", xem ArticleRecommendations.tsx) thay vi dan
// link rieng, tranh trung lap dieu huong.
export function ArticleSidebarRelated({ items }: { items: PostSummary[] }) {
  if (items.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="mb-3 flex items-center gap-1.5 text-sm font-bold text-ink">
        <Quote size={14} strokeWidth={2} />
        Bài viết liên quan
      </p>
      <div className="flex flex-col gap-3">
        {items.slice(0, 3).map((item) => (
          <Link
            key={item.id}
            href={`/p/${item.id}`}
            className="flex gap-2.5 rounded-md transition-opacity duration-150 ease-out hover:opacity-80"
          >
            <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-surface-muted">
              {item.imageUrl && (
                <Image src={item.imageUrl} alt={item.title} fill sizes="48px" className="object-cover" />
              )}
            </div>
            <div className="font-content min-w-0 flex-1">
              <p className="line-clamp-2 text-[13px] leading-5 font-medium text-ink">
                {item.title}
              </p>
              {item.readMinutes && (
                <p className="mt-0.5 text-[11px] text-ink-faint">{item.readMinutes} phút đọc</p>
              )}
            </div>
          </Link>
        ))}
      </div>
      <a
        href="#related-posts"
        className="mt-3 flex items-center gap-1 text-xs font-medium text-ink-muted transition-colors duration-150 ease-out hover:text-primary"
      >
        Xem thêm
        <ArrowRight size={12} strokeWidth={2} />
      </a>
    </div>
  );
}
