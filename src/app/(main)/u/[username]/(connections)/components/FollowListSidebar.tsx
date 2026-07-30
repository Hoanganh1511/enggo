"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users } from "lucide-react";
import { formatCompact } from "@/lib/format-number";
const FollowListSidebar = ({
  username,
  followingCount,
  followerCount,
}: {
  username: string;
  followingCount: number;
  followerCount: number;
}) => {
  const pathname = usePathname();
  const kind = pathname.endsWith("/followers") ? "followers" : "following";
  return (
    <aside className="flex w-full shrink-0 flex-col gap-1 lg:w-56">
      <Link
        href={`/u/${username}/following`}
        className={`flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm transition-colors duration-150 ease-out ${
          kind === "following"
            ? "bg-active-bg font-semibold text-primary"
            : "text-ink-muted hover:bg-hover-bg"
        }`}
      >
        <span className="flex items-center gap-2">
          <Users size={15} strokeWidth={1.75} />
          Đang theo dõi
        </span>
        <span className="tabular-nums">{formatCompact(followingCount)}</span>
      </Link>
      <Link
        href={`/u/${username}/followers`}
        className={`flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm transition-colors duration-150 ease-out ${
          kind === "followers"
            ? "bg-active-bg font-semibold text-primary"
            : "text-ink-muted hover:bg-hover-bg"
        }`}
      >
        <span className="flex items-center gap-2">
          <Users size={15} strokeWidth={1.75} />
          Người theo dõi
        </span>
        <span className="tabular-nums">{formatCompact(followerCount)}</span>
      </Link>
    </aside>
  );
};

export default FollowListSidebar;
