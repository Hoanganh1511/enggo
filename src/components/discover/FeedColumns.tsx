"use client";

import { useSyncExternalStore } from "react";
import type { Post } from "@/content/home-feed-mock";
import PostCard from "./PostCard";
import { splitPostsIntoColumns } from "@/lib/discover/post-kind-meta";
import { getFeedStatus, subscribeFeed } from "@/lib/discover/feed-store";
import PostCardSkeleton from "./PostCardSkeleton";

// Khop dung bo cuc that: cot trai "timeline" (avatar+ten dan dau, khong
// vien), cot phai "card" (the doc lap co vien) - xem TimelineColumn/CardColumn
// duoi day.
function FeedSkeleton() {
  return (
    <div className="flex items-start gap-8">
      <div className="min-w-0 flex-1">
        <div className="divide-y divide-border">
          {[0, 1, 2].map((i) => (
            <PostCardSkeleton key={i} variant="timeline" />
          ))}
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        {[0, 1, 2].map((i) => (
          <PostCardSkeleton key={i} variant="card" />
        ))}
      </div>
    </div>
  );
}

// Feed 2 cot: chia POSTS thanh 2 nhom noi dung theo "kind" (xem
// post-kind-meta.ts: "personal" = hoat dong/chia se ca nhan, "resource" =
// tu lieu/tham khao), moi cot render rieng thay vi hien trung lap 1 danh
// sach o ca 2 ben nhu ban truoc (xem HomeLayoutShell.tsx). Dung chung cho ca
// 4 tab con lai (Thanh tich/Tien do/For IT/Vote) - tung page tu loc "posts"
// tu feed-store (du lieu that) truoc khi truyen vao day.
const FeedColumns = ({
  posts,
  emptyMessage,
}: {
  posts: Post[];
  emptyMessage?: string;
}) => {
  // fetch dat o HomeLayoutShell (dung chung moi tab), o day chi doc trang
  // thai de biet hien skeleton hay "chua co bai" - tranh nhap nhay "Chua co
  // bai viet nao" trong luc dang cho response dau tien.
  const status = useSyncExternalStore(subscribeFeed, getFeedStatus, () => "idle" as const);

  if (posts.length === 0 && status === "loading") {
    return <FeedSkeleton />;
  }

  if (posts.length === 0) {
    return (
      <p className="py-5 text-sm text-ink-faint">
        {emptyMessage ?? "Chưa có bài viết nào."}
      </p>
    );
  }

  const { left, right } = splitPostsIntoColumns(posts);

  return (
    <div className="flex items-start gap-8">
      <TimelineColumn posts={left} />
      <CardColumn posts={right} />
    </div>
  );
};

function ColumnHeading({ label }: { label: string }) {
  return (
    <p className="pb-3 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
      {label}
    </p>
  );
}

// Cot trai - hang thuong noi tiep nhau (dong feed ca nhan pho bien), co 1
// duong ke doc chay xuyen suot (canh voi tam marker loai bai viet trong
// PostCard - marker rong w-5/20px nen duong ke dat o left-[10px]), ve TRUOC
// posts trong DOM nen tu nhien nam DUOI noi dung (khong can z-index) - marker/
// avatar/text deu co nen dac nen se de len duong ke o cho no di qua.
const TimelineColumn = ({ posts }: { posts: Post[] }) => {
  return (
    <div className="min-w-0 flex-1">
      <ColumnHeading label="Hoạt động & chia sẻ" />
      {posts.length === 0 ? (
        <p className="text-sm text-ink-faint">Chưa có bài viết nào.</p>
      ) : (
        <div className="relative">
          <span
            aria-hidden
            className="pointer-events-none absolute top-0 bottom-0 left-2.5 w-px bg-border"
          />
          <div className="divide-y divide-border">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Cot phai - moi post la 1 the doc lap (variant="card" trong PostCard, dan
// dau bang badge loai bai thay vi avatar), xep cach nhau bang gap thay vi
// divide-y, CO CHU DICH nhin khac han cot trai de ro "day la nhom tu lieu/
// cap nhat" thay vi dong feed thong thuong.
const CardColumn = ({ posts }: { posts: Post[] }) => {
  return (
    <div className="min-w-0 flex-1">
      <ColumnHeading label="Tư liệu & cập nhật" />
      {posts.length === 0 ? (
        <p className="text-sm text-ink-faint">Chưa có bài viết nào.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} variant="card" />
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedColumns;
