import Image from "next/image";
import Link from "next/link";
import { Folder } from "lucide-react";
import type { PostCollectionBrowseItem } from "@/lib/api/collections";
import { ScrollableRow } from "./ScrollableRow";

// Thay TopicsRail (chu de/hashtag) o khu nay tren /home - gio la "Bộ sưu tập
// đang được chú ý": bo suu tap CONG KHAI that (tu listPublicCollectionsAction,
// sort "most-posts"), KHONG bia so lieu "trending"/luot xem (backend chua co
// lich su xem theo thoi gian, xem docs/engineering-log.md 2026-09-11) - dung
// so bai viet that trong bo suu tap lam tin hieu "dang duoc chu y".
export function AttentionCollectionsRail({
  collections,
}: {
  collections: PostCollectionBrowseItem[];
}) {
  if (collections.length === 0) {
    return (
      <p className="py-4 text-[13px] text-[var(--muted)]">
        Chưa có bộ sưu tập công khai nào.
      </p>
    );
  }

  return (
    <ScrollableRow gapClassName="gap-3">
      {collections.map((c) => (
        <Link
          key={c.id}
          href={`/collections/${c.id}`}
          className="group relative h-[86px] min-w-[205px] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]"
        >
          {c.coverImageUrl ? (
            <Image
              src={c.coverImageUrl}
              alt=""
              fill
              className="object-cover transition duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
              <Folder size={22} strokeWidth={1.6} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-slate-900/35 to-transparent" />
          <div className="font-content relative flex h-full flex-col justify-center px-4 text-white">
            <span className="line-clamp-1 text-[14px] font-semibold">{c.title}</span>
            <span className="mt-1 line-clamp-1 text-[11px] text-white/75">
              {c.postCount} bài viết · {c.owner.name}
            </span>
          </div>
        </Link>
      ))}
    </ScrollableRow>
  );
}
