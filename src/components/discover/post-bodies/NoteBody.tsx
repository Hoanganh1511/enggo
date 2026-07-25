import { Lightbulb } from "lucide-react";
import type { Post } from "@/content/home-feed-mock";

type NotePost = Extract<Post, { kind: "note" }>;
type IdeaPost = Extract<Post, { kind: "idea" }>;

// Knowledge Note (TIL) - "linh hon" cua feed nen co dang rieng han: vien trai
// mau warning + nen tinh nhe, tieu de la headline (khong phai content thuong)
// + body phu ben duoi, khac han moi post khac trong feed.
export function NoteBody({ post }: { post: NotePost }) {
  return (
    <div className="mt-2 rounded-xl border-l-4 border-warning bg-warning/5 p-4">
      <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-warning uppercase">
        <Lightbulb size={13} strokeWidth={2} />
        {post.tag ?? "TIL"}
      </div>
      <p className="mt-1.5 text-base leading-snug font-semibold text-ink">
        {post.title}
      </p>
      <p className="mt-1 text-[16px] text-ink-muted">{post.content}</p>
    </div>
  );
}

// Idea Share - nhe hon Note han: chi 1 eyebrow nho "Idea" + content, khong
// khung mau/nen tinh (Note la insight da duoc dao sau, Idea la y tuong thoang
// qua chua chac chan).
export function IdeaBody({ post }: { post: IdeaPost }) {
  return (
    <div className="mt-2">
      <div className="flex items-center gap-1.5 text-xs font-medium text-ink-faint">
        <Lightbulb size={12} strokeWidth={1.75} />
        Idea
      </div>
      <p className="mt-1 text-[15px] wrap-break-word text-ink">
        {post.content}
      </p>
    </div>
  );
}
