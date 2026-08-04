"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart } from "lucide-react";
import type { Author } from "@/content/home-feed-mock";
import type { ArticleComment } from "./article-types";
import { formatRelativeTime } from "@/lib/career-tree/format-time";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 4;

// Chua co session that noi day (trang article la mock hoan toan, xem
// article-mock.ts) nen dung 1 "nguoi dung hien tai" gia dinh cho phan binh
// luan/tra loi moi - CHI ton tai trong state client cua phien xem nay,
// khong luu len dau ca.
const CURRENT_USER: Author = {
  name: "Bạn",
  username: "me",
  verified: false,
  avatarUrl: "https://i.pravatar.cc/80?u=current-user",
};

function countAll(comments: ArticleComment[]): number {
  return comments.reduce(
    (sum, c) => sum + 1 + countAll(c.replies),
    0,
  );
}

// 1 dong binh luan (dung chung cho ca comment goc VA reply, phan biet qua
// `depth`). Line-clamp 6 dong + nut "Xem them" rieng cho tung comment (state
// cuc bo, khong anh huong comment khac). Reply CHI cho phep o depth 0 - day
// la gioi han "toi da 2 level" yeu cau: goc (depth 0) -> reply (depth 1),
// KHONG cho reply-cua-reply (se phai depth 2).
function CommentItem({
  comment,
  depth,
  onReply,
}: {
  comment: ArticleComment;
  depth: 0 | 1;
  onReply?: (content: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [replying, setReplying] = useState(false);
  const [replyDraft, setReplyDraft] = useState("");
  // Uoc luong "qua 6 dong" theo do dai ky tu thay vi do chieu cao thuc te
  // (don gian hon, du dung cho truong hop mock) - nguong 260 ky tu ~ 6 dong
  // o do rong cot 620px, font-size 14px.
  const isLong = comment.content.length > 260;

  return (
    <div className="flex gap-2.5">
      <Image
        src={comment.author.avatarUrl}
        alt={comment.author.name}
        width={depth === 0 ? 32 : 26}
        height={depth === 0 ? 32 : 26}
        className={cn(
          "shrink-0 rounded-full object-cover",
          depth === 0 ? "size-8" : "size-6.5",
        )}
      />
      <div className="min-w-0 flex-1">
        <div className="rounded-lg bg-surface-muted px-3 py-2">
          <p className="text-sm font-semibold text-ink">{comment.author.name}</p>
          <p
            className={cn(
              "text-sm leading-relaxed text-ink",
              !expanded && "line-clamp-6",
            )}
          >
            {comment.content}
          </p>
          {isLong && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-0.5 cursor-pointer text-xs font-medium text-primary hover:underline"
            >
              {expanded ? "Thu gọn" : "Xem thêm"}
            </button>
          )}
        </div>

        <div className="mt-1 flex items-center gap-3 px-1 text-xs text-ink-faint">
          <span>{formatRelativeTime(comment.createdAt)}</span>
          <button
            type="button"
            onClick={() => setLiked((v) => !v)}
            className={cn(
              "flex cursor-pointer items-center gap-1 font-medium transition-colors duration-150 ease-out hover:text-ink",
              liked && "text-rose-500",
            )}
          >
            <Heart size={11} strokeWidth={2} fill={liked ? "currentColor" : "none"} />
            {comment.likes + (liked ? 1 : 0)}
          </button>
          {depth === 0 && onReply && (
            <button
              type="button"
              onClick={() => setReplying((v) => !v)}
              className="cursor-pointer font-medium hover:text-ink"
            >
              Trả lời
            </button>
          )}
        </div>

        {replying && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!replyDraft.trim()) return;
              onReply?.(replyDraft.trim());
              setReplyDraft("");
              setReplying(false);
            }}
            className="mt-2 flex items-center gap-2"
          >
            <input
              autoFocus
              value={replyDraft}
              onChange={(e) => setReplyDraft(e.target.value)}
              placeholder={`Trả lời ${comment.author.name}...`}
              className="h-8 flex-1 rounded-md border border-border bg-surface px-2.5 text-sm text-ink outline-none focus:border-primary"
            />
            <button
              type="submit"
              className="h-8 shrink-0 cursor-pointer rounded-md bg-primary px-3 text-xs font-semibold text-white transition-colors duration-150 ease-out hover:bg-primary-hover"
            >
              Gửi
            </button>
          </form>
        )}

        {comment.replies.length > 0 && (
          <div className="mt-2.5 flex flex-col gap-2.5 border-l-2 border-border pl-3">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} depth={1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ArticleComments({
  comments: initialComments,
}: {
  comments: ArticleComment[];
}) {
  const [comments, setComments] = useState(initialComments);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [draft, setDraft] = useState("");

  const total = countAll(comments);
  const visible = comments.slice(0, visibleCount);
  const hasMore = visibleCount < comments.length;

  function addReply(commentId: string, content: string) {
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? {
              ...c,
              replies: [
                ...c.replies,
                {
                  id: `${commentId}-local-${Date.now()}`,
                  author: CURRENT_USER,
                  createdAt: new Date().toISOString(),
                  content,
                  likes: 0,
                  replies: [],
                },
              ],
            }
          : c,
      ),
    );
  }

  return (
    <section id="comments" className="flex scroll-mt-4 flex-col gap-4">
      <h2 className="text-lg font-bold tracking-tight text-ink">
        Bình luận ({total})
      </h2>

      {/* Muc binh luan - gui comment goc moi, CHI luu vao state client cua
          phien xem nay (xem comment dau file). */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.trim()) return;
          setComments((prev) => [
            {
              id: `local-${Date.now()}`,
              author: CURRENT_USER,
              createdAt: new Date().toISOString(),
              content: draft.trim(),
              likes: 0,
              replies: [],
            },
            ...prev,
          ]);
          setDraft("");
        }}
        className="flex items-center gap-2"
      >
        <Image
          src={CURRENT_USER.avatarUrl}
          alt=""
          width={32}
          height={32}
          className="size-8 shrink-0 rounded-full object-cover"
        />
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Viết bình luận..."
          className="h-9 flex-1 rounded-md border border-border bg-surface px-3 text-sm text-ink outline-none focus:border-primary"
        />
        <button
          type="submit"
          className="h-9 shrink-0 cursor-pointer rounded-md bg-primary px-3.5 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-primary-hover"
        >
          Gửi
        </button>
      </form>

      <div className="flex flex-col gap-4">
        {visible.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            depth={0}
            onReply={(content) => addReply(comment.id, content)}
          />
        ))}
      </div>

      {/* "Fetch truoc 4 binh luan" - visibleCount khoi tao = PAGE_SIZE, bam
          "Xem them" tang dan thay vi hien het 1 luc. Can giua theo yeu cau. */}
      {hasMore && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
            className="cursor-pointer rounded-md border border-border px-4 py-2 text-sm font-medium text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-ink"
          >
            Xem thêm bình luận
          </button>
        </div>
      )}
    </section>
  );
}
