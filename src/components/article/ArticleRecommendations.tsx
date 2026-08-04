import Image from "next/image";
import Link from "next/link";
import type { PostSummary } from "./article-types";
import { formatRelativeTime } from "@/lib/career-tree/format-time";

function RecommendationRow({ item }: { item: PostSummary }) {
  return (
    <Link
      href={`/p/${item.id}`}
      className="flex items-center gap-3 rounded-lg transition-colors duration-150 ease-out hover:bg-hover-bg"
    >
      <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
        {/* Khong phai kind nao cung co anh (vd post "text") - de trong
            khung mau nen thay vi bat gan 1 anh gia. */}
        {item.imageUrl && (
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            sizes="64px"
            className="object-cover"
          />
        )}
      </div>
      <div className="min-w-0 flex-1 py-1">
        <p className="line-clamp-2 text-sm font-medium text-ink">
          {item.title}
        </p>
        <p className="mt-0.5 text-xs text-ink-faint">
          {formatRelativeTime(item.createdAt)}
        </p>
      </div>
    </Link>
  );
}

// 2 khoi de xuat cuoi trang - dung chung 1 khuon RecommendationRow (anh vuong
// nho + tieu de 2 dong + thoi gian), chi khac tieu de section va nguon du
// lieu (bai gan day CUNG tac gia / bai lien quan theo chu de - xem cach
// page.tsx fetch qua listPostsAction that, khong con mock).
export function ArticleRecommendations({
  moreFromAuthor,
  related,
}: {
  moreFromAuthor: PostSummary[];
  related: PostSummary[];
}) {
  return (
    <div className="flex flex-col gap-8">
      {moreFromAuthor.length > 0 && (
        <section>
          <h2 className="mb-3 text-base font-bold tracking-tight text-ink">
            Bài viết gần đây của tác giả
          </h2>
          <div className="flex flex-col gap-1">
            {moreFromAuthor.map((item) => (
              <RecommendationRow key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section>
          <h2 className="mb-3 text-base font-bold tracking-tight text-ink">
            Bài viết liên quan
          </h2>
          <div className="flex flex-col gap-1">
            {related.map((item) => (
              <RecommendationRow key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
