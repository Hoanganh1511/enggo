import type { Post } from "@/content/home-feed-mock";
import PostCard from "./PostCard";
import { splitPostsIntoColumns } from "@/lib/discover/post-kind-meta";

// Feed 2 cot: chia POSTS thanh 2 nhom noi dung theo "kind" (xem
// post-kind-meta.ts: "personal" = hoat dong/chia se ca nhan, "resource" =
// tu lieu/tham khao), moi cot render rieng thay vi hien trung lap 1 danh
// sach o ca 2 ben nhu ban truoc (xem HomeLayoutShell.tsx). Dung chung cho
// ca 3 tab For you/Following/Trending - tung page tu loc/sap xep "posts"
// truoc khi truyen vao day.
const FeedColumns = ({
  posts,
  emptyMessage,
}: {
  posts: Post[];
  emptyMessage?: string;
}) => {
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
