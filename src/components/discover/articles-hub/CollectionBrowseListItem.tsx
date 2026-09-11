"use client";

import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Folder } from "lucide-react";
import { useFollowToggle } from "./use-follow-toggle";
import type { PostCollectionBrowseItem } from "@/lib/api/collections";

// Bien the "list" cua CollectionBrowseCard.tsx - anh nho ben trai, thong tin
// xep 1 hang ngang thay vi card doc. Dung chung du lieu/props.
export function CollectionBrowseListItem({
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
    <div className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[var(--shadow-card)]">
      <Link href={`/collections/${collection.id}`} className="shrink-0">
        <div className="relative size-16 overflow-hidden rounded-lg bg-slate-100">
          {collection.coverImageUrl ? (
            <Image src={collection.coverImageUrl} alt="" fill className="object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
              <Folder size={20} strokeWidth={1.6} />
            </div>
          )}
        </div>
      </Link>

      <div className="min-w-0 flex-1">
        <Link href={`/collections/${collection.id}`} className="font-content block">
          <h3 className="line-clamp-1 text-[14px] font-bold text-[var(--foreground)]">
            {collection.title}
          </h3>
          {collection.description && (
            <p className="line-clamp-1 text-[12px] text-[var(--muted)]">
              {collection.description}
            </p>
          )}
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <Link
            href={`/u/${collection.owner.username}`}
            className="flex items-center gap-1 text-[11px] text-[var(--muted)] hover:underline"
          >
            <Image
              src={collection.owner.avatarUrl}
              alt={collection.owner.name}
              width={16}
              height={16}
              className="size-4 shrink-0 rounded-full object-cover"
            />
            {collection.owner.name}
            {collection.owner.verified && (
              <BadgeCheck size={11} strokeWidth={2.25} className="shrink-0 text-[var(--primary)]" />
            )}
          </Link>
          <span aria-hidden="true" className="text-[var(--muted)]">·</span>
          <span className="text-[11px] text-[var(--muted)]">
            {collection.postCount} bài viết
          </span>
        </div>
      </div>

      {!isSelf && viewerUsername && (
        <button
          type="button"
          onClick={toggle}
          disabled={pending}
          className={`shrink-0 cursor-pointer rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors duration-150 ease-out disabled:cursor-default disabled:opacity-70 ${
            following
              ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
              : "bg-[var(--foreground)] text-white hover:opacity-90"
          }`}
        >
          {following ? "Đang theo dõi" : "Theo dõi"}
        </button>
      )}
    </div>
  );
}
