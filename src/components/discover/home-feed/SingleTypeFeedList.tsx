import type { Post } from "@/content/home-feed-mock";
import type { ContentType } from "@/lib/discover/post-kind-meta";
import PostCard from "../PostCard";
import { NoteCard, NoteCardSkeleton } from "./NoteCard";

// Nhan tieng Viet rieng cho thong bao rong - CONTENT_TYPES.label (post-kind-
// meta.ts) dung tieng Anh (Post/Resource/...) cho dropdown chon loai, khong
// hop de nhet thang vao 1 cau tieng Viet ("Chua co Post nao phu hop." doc gau
// trong).
const EMPTY_STATE_LABEL: Record<ContentType, string> = {
  post: "bài viết",
  resource: "tài nguyên",
  project: "dự án",
  question: "câu hỏi",
  achievement: "thành tích",
  progress: "cập nhật tiến độ",
  event: "sự kiện",
  vote: "bình chọn",
};

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
  // "loading" thoi, khong kem "&& posts.length === 0" - cung ly do nhu
  // EditorialFeed.tsx (xem comment o do): tranh mat skeleton tu lan doi
  // filter thu 2 tro di vi "posts" con giu du lieu cu chua bi xoa.
  if (loading) {
    // Cung 1 luoi auto-fill nhu khi render that (xem ben duoi) - the
    // NoteCardSkeleton dung khung anh + tieu de + tac gia voi NoteCard that.
    return (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-x-4 gap-y-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <NoteCardSkeleton key={i} className="w-full" />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-ink-faint">
        Chưa có {EMPTY_STATE_LABEL[type]} nào phù hợp.
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
