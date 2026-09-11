import Image from "next/image";
import Link from "next/link";
import { Folder, Lock } from "lucide-react";
import type { PostCollectionApiShape } from "@/lib/api/collections";

// The 1 bo suu tap - dung CHUNG cho ca /collections (cua minh) va
// /u/[username]/collections (cua nguoi khac/chinh minh, xem CollectionsGrid).
export function CollectionCard({
  collection,
}: {
  collection: PostCollectionApiShape;
}) {
  return (
    <Link
      href={`/collections/${collection.id}`}
      className="group overflow-hidden rounded-xl border border-border bg-surface transition-shadow duration-150 ease-out hover:shadow-[var(--shadow-hover,0_4px_16px_rgba(0,0,0,0.08))]"
    >
      <div className="relative aspect-video w-full  bg-surface-muted rounded-sm ">
        {collection.coverImageUrl ? (
          <Image
            src={collection.coverImageUrl}
            alt=""
            fill
            className="object-cover  overflow-hidden transition-transform duration-200 ease-out group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-ink-faint">
            <Folder size={28} strokeWidth={1.6} />
          </div>
        )}
      </div>
      <div className="font-content p-3.5">
        <div className="flex items-center gap-1.5">
          <h3 className="line-clamp-1 min-w-0 flex-1 text-sm font-semibold text-ink">
            {collection.title}
          </h3>
          {collection.visibility === "private" && (
            <Lock
              size={12}
              strokeWidth={2}
              className="shrink-0 text-ink-faint"
            />
          )}
        </div>
        {collection.description && (
          <p className="mt-1 line-clamp-2 text-xs text-ink-faint">
            {collection.description}
          </p>
        )}
        <p className="mt-2 text-[11px] text-ink-faint">
          {collection.postCount} bài viết
        </p>
      </div>
    </Link>
  );
}
