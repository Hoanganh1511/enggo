import type { Post } from "@/content/home-feed-mock";
import type { ContentType } from "@/lib/discover/post-kind-meta";
import PostCard from "../PostCard";
import { NoteCard } from "./NoteCard";

function SkeletonBlock({ className }: { className: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-surface-muted ${className}`} />
  );
}

// Danh sach don gian dung khi nguoi dung DA chon 1 Content Type cu the o
// thanh loc duoi HomeSidebar (khong doi thanh do) - dung chung 1 khuon
// NoteCard (giong EditorialFeed.tsx) cho MOI loai (ke ca "post", truoc day
// dung LatestPostRow rieng - da bo theo yeu cau dong bo 100% ve 1 khuon the
// duy nhat), xep dang luoi wrap thay vi carousel vi khong can cuon ngang o
// day. "progress"/"event"/"vote" chua co khuon editorial rieng nen fallback
// ve PostCard variant="timeline" co san (khong sua PostCard.tsx, chi tai
// su dung).
export function SingleTypeFeedList({
  posts,
  loading,
  type,
}: {
  posts: Post[];
  loading: boolean;
  type: ContentType;
}) {
  if (loading && posts.length === 0) {
    return <SkeletonBlock className="h-72 w-full" />;
  }

  if (posts.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-ink-faint">
        Chưa có bài viết nào phù hợp.
      </p>
    );
  }

  if (
    type === "post" ||
    type === "resource" ||
    type === "project" ||
    type === "achievement" ||
    type === "question"
  ) {
    return (
      // grid auto-fill: trinh duyet tu tinh so cot vua khung chua, moi cot
      // gian deu (1fr) lap day chieu rong con lai - khac flex-wrap truoc day
      // (the co chieu rong CO DINH, thua khoang trong o cuoi hang).
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-x-4 gap-y-6">
        {posts.map((p) => (
          <NoteCard key={p.id} post={p} className="w-full" />
        ))}
      </div>
    );
  }

  // progress / event / vote - chua co khuon editorial rieng.
  return (
    <div className="flex flex-col">
      {posts.map((p) => (
        <PostCard key={p.id} post={p} variant="timeline" />
      ))}
    </div>
  );
}
