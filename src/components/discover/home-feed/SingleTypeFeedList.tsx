import type { Post } from "@/content/home-feed-mock";
import type { ContentType } from "@/lib/discover/post-kind-meta";
import PostCard from "../PostCard";
import { NoteCard } from "./NoteCard";

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
  type,
}: {
  posts: Post[];
  type: ContentType;
}) {
  // posts la du lieu da fetch xong tren server (Server Component) - trang
  // Home dung route-level loading.tsx (Suspense fallback) de hien skeleton
  // trong luc doi fetch, nen component nay khong con giu state loading rieng.
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
          // sizes khop luoi auto-fill minmax(220px,1fr) o tren - the co the
          // rong hon 220px chut o man hep khi chi 1-2 cot, nhung 220px la can
          // duoi an toan (khong bao gio nho hon), khac han carousel co dinh
          // 224px cua NoteCard mac dinh.
          <NoteCard
            key={p.id}
            post={p}
            className="w-full"
            sizes="(max-width: 640px) 45vw, 220px"
          />
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
