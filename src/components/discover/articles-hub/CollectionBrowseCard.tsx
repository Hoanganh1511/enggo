"use client";

import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Folder } from "lucide-react";
import { useFollowToggle } from "./use-follow-toggle";
import type { PostCollectionBrowseItem } from "@/lib/api/collections";

// The 1 bo suu tap dang GRID tren /collections - khac han CollectionCard.tsx
// cu (dung o /u/[username]/collections, khong co chu so huu/nut Theo dõi) -
// trang kham pha can hien ro AI tao ra no + cho theo doi tac gia ngay tai
// cho, xem quyet dinh trong plan (nut Theo dõi = theo doi TAC GIA, khong
// phai follow-rieng-cho-bo-suu-tap).
export function CollectionBrowseCard({
  collection,
  viewerUsername,
}: {
  collection: PostCollectionBrowseItem;
  viewerUsername: string | null;
}) {
  const { following, pending, toggle } = useFollowToggle(
    collection.owner.username,
    collection.isFollowingOwner,
  );
  const isSelf = collection.owner.username === viewerUsername;

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
      <Link href={`/collections/${collection.id}`} className="group block">
        <div className="relative aspect-video w-full overflow-hidden bg-slate-100 rounded-md">
          {collection.coverImageUrl ? (
            <Image
              src={collection.coverImageUrl}
              alt=""
              fill
              className="object-cover transition-transform duration-200 ease-out group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
              <Folder size={28} strokeWidth={1.6} />
            </div>
          )}
        </div>
        <div className="font-content p-4">
          <h3 className="line-clamp-1 text-[15px] font-bold text-[var(--foreground)]">
            {collection.title}
          </h3>
          {collection.description && (
            <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-[var(--muted)]">
              {collection.description}
            </p>
          )}
        </div>
      </Link>

      <div className="flex items-center justify-between gap-2 px-4 pb-4">
        <Link
          href={`/u/${collection.owner.username}`}
          className="flex min-w-0 items-center gap-1.5"
        >
          <Image
            src={collection.owner.avatarUrl}
            alt={collection.owner.name}
            width={20}
            height={20}
            className="size-5 shrink-0 rounded-full object-cover"
          />
          <span className="flex min-w-0 items-center gap-0.5 text-[12px] text-[var(--muted)]">
            <span className="truncate">{collection.owner.name}</span>
            {collection.owner.verified && (
              <BadgeCheck
                size={11}
                strokeWidth={2.25}
                className="shrink-0 text-[var(--primary)]"
              />
            )}
          </span>
        </Link>
        {!isSelf && viewerUsername && (
          <button
            type="button"
            onClick={toggle}
            disabled={pending}
            className={`shrink-0 cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors duration-150 ease-out disabled:cursor-default disabled:opacity-70 ${
              following
                ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                : "bg-[var(--foreground)] text-white hover:opacity-90"
            }`}
          >
            {following ? "Đang theo dõi" : "Theo dõi"}
          </button>
        )}
      </div>

      <p className="flex items-center gap-1 px-4 pb-4 text-[11px] text-[var(--muted)]">
        <Folder size={11} strokeWidth={2} />
        {collection.postCount} bài viết
      </p>
    </div>
  );
}
