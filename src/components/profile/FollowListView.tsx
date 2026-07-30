"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import { BadgeCheck, Plus, Users } from "lucide-react";
import type { FollowListItem, FollowListPage } from "@/lib/api/follow";
import {
  followUserAction,
  unfollowUserAction,
  getFollowingAction,
  getFollowersAction,
} from "@/actions/discover/follow-user";
import { formatCompact } from "@/lib/format-number";

function FollowCard({ item }: { item: FollowListItem }) {
  const [following, setFollowing] = useState(item.isFollowing);
  const [pending, setPending] = useState(false);

  async function handleToggle() {
    if (!item.username) return;
    const next = !following;
    setFollowing(next);
    setPending(true);
    try {
      await (next
        ? followUserAction(item.username)
        : unfollowUserAction(item.username));
    } catch {
      setFollowing(!next);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-lg bg-surface p-3">
      <Link href={`/u/${item.username}`} className="shrink-0">
        <Image
          src={item.avatarUrl}
          alt={item.displayName}
          width={48}
          height={48}
          className="size-12 rounded-full object-cover"
        />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <Link
            href={`/u/${item.username}`}
            className="truncate text-sm font-semibold text-ink hover:underline"
          >
            {item.displayName}
          </Link>
          {item.isVerified && (
            <BadgeCheck
              size={13}
              strokeWidth={2}
              className="shrink-0 text-primary"
            />
          )}
        </div>
        <p className="truncate text-xs text-ink-faint">@{item.username}</p>
      </div>

      <button
        type="button"
        onClick={handleToggle}
        disabled={pending}
        className={`flex h-8 shrink-0 cursor-pointer items-center gap-1 rounded-md px-3 text-sm font-semibold transition-colors duration-150 ease-out ${
          following
            ? "border border-border text-ink-muted hover:bg-hover-bg"
            : "bg-primary text-white hover:opacity-90"
        } ${pending ? "opacity-60 pointer-events-none" : ""}`}
      >
        {!following && <Plus size={14} strokeWidth={2.5} />}
        {following ? "Đang theo dõi" : "Theo dõi"}
      </button>
    </div>
  );
}

// Trang danh sach Dang theo doi/Nguoi theo doi - sidebar trai nho (2 muc,
// highlight muc dang xem) + luoi the user ben phai, dung chung cho ca 2
// route /following va /followers (chi khac data source + label active).
const FollowListView = ({
  username,
  kind,
  initialPage,
}: {
  username: string;
  kind: "following" | "followers";
  initialPage: FollowListPage;
}) => {
  const [items, setItems] = useState(initialPage.items);
  const [cursor, setCursor] = useState(initialPage.nextCursor);
  const [loadingMore, setLoadingMore] = useState(false);

  async function handleLoadMore() {
    if (!cursor) return;
    setLoadingMore(true);
    try {
      const page =
        kind === "following"
          ? await getFollowingAction(username, cursor)
          : await getFollowersAction(username, cursor);
      setItems((prev) => [...prev, ...page.items]);
      setCursor(page.nextCursor);
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div className="min-w-0 flex-1">
      {items.length === 0 ? (
        <p className="py-12 text-center text-sm text-ink-faint">
          {kind === "following"
            ? "Chưa theo dõi ai."
            : "Chưa có người theo dõi."}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <FollowCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {cursor && (
        <button
          type="button"
          onClick={handleLoadMore}
          disabled={loadingMore}
          className="mx-auto mt-4 flex h-9 cursor-pointer items-center rounded-md border border-border px-4 text-sm font-medium text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg disabled:opacity-60"
        >
          {loadingMore ? "Đang tải..." : "Xem thêm"}
        </button>
      )}
    </div>
  );
};

export default FollowListView;
