import Image from "next/image";
import Link from "next/link";
import { Flame } from "lucide-react";
import type { Post } from "@/content/home-feed-mock";
import { POST_KIND_META } from "@/lib/discover/post-kind-meta";
import { isToday, getStreakHint } from "@/lib/discover/achievements";

// Dai nho hien nguoi dat thanh tich HOM NAY - chi 1 hang ngang gon, KHONG
// phai 1 section to (dung tinh than "chiem phan nho UI thoi"), kem 1 chip
// "chuoi" nho NEU bai do co du lieu chuoi that (getStreakHint) - khong bia
// streak cho kind khong co items (achievement/career-update/node-created).
export function TodayAchieversStrip({ posts }: { posts: Post[] }) {
  const todayPosts = posts.filter((post) => isToday(post.createdAt));

  if (todayPosts.length === 0) {
    return (
      <p className="text-xs text-ink-faint">
        Chưa có ai đạt thành tích hôm nay.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
      <span className="shrink-0 text-xs font-semibold text-ink-muted">
        Hôm nay
      </span>
      <span className="h-4 w-px shrink-0 bg-border" />
      {todayPosts.map((post) => {
        const meta = POST_KIND_META[post.kind];
        const streak = getStreakHint(post);
        return (
          <Link
            key={post.id}
            href={`/u/${post.author.username}`}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-surface-muted py-1 pr-2.5 pl-1 transition-colors duration-150 ease-out hover:border-hover-border"
          >
            <Image
              src={post.author.avatarUrl}
              alt={post.author.name}
              width={20}
              height={20}
              className="size-5 shrink-0 rounded-full object-cover"
            />
            <span className="text-xs font-medium text-ink">
              {post.author.name}
            </span>
            <meta.icon
              size={11}
              strokeWidth={2}
              style={{ color: meta.accent }}
              className="shrink-0"
            />
            {streak && (
              <span className="flex shrink-0 items-center gap-0.5 text-[10px] font-semibold text-warning">
                <Flame size={10} strokeWidth={2} />
                {streak.value}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}

export default TodayAchieversStrip;
