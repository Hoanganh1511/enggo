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
      <FeedColumn posts={left} />
      <FeedColumn posts={right} />
    </div>
  );
};

// 1 cot: co 1 duong ke doc chay xuyen suot (canh voi tam marker loai bai
// viet trong PostCard - marker rong w-5/20px nen duong ke dat o left-[10px]),
// ve TRUOC posts trong DOM nen tu nhien nam DUOI noi dung (khong can z-index)
// - marker/avatar/text deu co nen dac nen se de len duong ke o cho no di qua.
const FeedColumn = ({ posts }: { posts: Post[] }) => {
  if (posts.length === 0) return <div className="min-w-0 flex-1" />;

  return (
    <div className="relative min-w-0 flex-1">
      <span
        aria-hidden
        className="pointer-events-none absolute top-0 bottom-0 left-[10px] w-px bg-border"
      />
      <div className="divide-y divide-border">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default FeedColumns;
