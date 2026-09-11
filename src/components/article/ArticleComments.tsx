"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Heart, Trash2 } from "lucide-react";
import type { ArticleComment } from "./article-types";
import { toArticleComment } from "./comment-tree";
import { createPostCommentAction } from "@/actions/discover/post-comments/create-post-comment";
import { deletePostCommentAction } from "@/actions/discover/post-comments/delete-post-comment";
import { togglePostCommentLikeAction } from "@/actions/discover/post-comments/toggle-post-comment-like";
import { useCurrentAvatarStore } from "@/stores/current-avatar-store";
import { formatRelativeTime } from "@/lib/format-time";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 4;

function countAll(comments: ArticleComment[]): number {
  return comments.reduce((sum, c) => sum + 1 + c.replies.length, 0);
}

// Thay 1 comment (goc hoac reply, cay chi sau 1 cap) bang ket qua map(),
// dung chung cho toggle-like/thay id tam bang id that.
function updateComment(
  comments: ArticleComment[],
  id: string,
  map: (c: ArticleComment) => ArticleComment,
): ArticleComment[] {
  return comments.map((c) => {
    if (c.id === id) return map(c);
    if (c.replies.some((r) => r.id === id)) {
      return { ...c, replies: c.replies.map((r) => (r.id === id ? map(r) : r)) };
    }
    return c;
  });
}

// Xoa 1 comment KHOI CA 2 tang (goc hoac reply) trong 1 lan duyet.
function removeComment(comments: ArticleComment[], id: string): ArticleComment[] {
  return comments
    .filter((c) => c.id !== id)
    .map((c) => ({ ...c, replies: c.replies.filter((r) => r.id !== id) }));
}

// 1 dong binh luan (dung chung cho ca comment goc VA reply, phan biet qua
// `depth`). Line-clamp 6 dong + nut "Xem them" rieng cho tung comment (state
// cuc bo, khong anh huong comment khac). Reply CHI cho phep o depth 0 - day
// la gioi han "toi da 2 level" yeu cau: goc (depth 0) -> reply (depth 1),
// KHONG cho reply-cua-reply (se phai depth 2).
function CommentItem({
  comment,
  depth,
  canInteract,
  onReply,
  onToggleLike,
  onDelete,
}: {
  comment: ArticleComment;
  depth: 0 | 1;
  canInteract: boolean;
  onReply?: (parentId: string, content: string) => void;
  // Nhan id (khong phai da bind san) - dung CHUNG 1 ham cho ca comment goc
  // LAN reply, tranh phai tao closure rieng cho tung reply luc render de quy.
  onToggleLike: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [replying, setReplying] = useState(false);
  const [replyDraft, setReplyDraft] = useState("");
  // Uoc luong "qua 6 dong" theo do dai ky tu thay vi do chieu cao thuc te
  // (don gian hon) - nguong 260 ky tu ~ 6 dong o do rong cot 620px, font 14px.
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
        {/* font-content: ten nguoi binh luan + noi dung binh luan la NOI
            DUNG, dung Manrope - nut Tra loi/Thich/form gui ben duoi la UI,
            KHONG boc. */}
        <div className="font-content rounded-lg bg-surface-muted px-3 py-2">
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
            onClick={() => onToggleLike(comment.id)}
            disabled={!canInteract}
            className={cn(
              "flex cursor-pointer items-center gap-1 font-medium transition-colors duration-150 ease-out hover:text-ink disabled:cursor-not-allowed",
              comment.likedByMe && "text-rose-500",
            )}
          >
            <Heart size={11} strokeWidth={2} fill={comment.likedByMe ? "currentColor" : "none"} />
            {comment.likesCount}
          </button>
          {depth === 0 && onReply && canInteract && (
            <button
              type="button"
              onClick={() => setReplying((v) => !v)}
              className="cursor-pointer font-medium hover:text-ink"
            >
              Trả lời
            </button>
          )}
          {comment.isOwner && (
            <button
              type="button"
              onClick={() => onDelete(comment.id)}
              title="Xoá bình luận"
              className="flex cursor-pointer items-center gap-1 font-medium transition-colors duration-150 ease-out hover:text-danger"
            >
              <Trash2 size={11} strokeWidth={2} />
              Xoá
            </button>
          )}
        </div>

        {replying && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!replyDraft.trim()) return;
              onReply?.(comment.id, replyDraft.trim());
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
              <CommentItem
                key={reply.id}
                comment={reply}
                depth={1}
                canInteract={canInteract}
                onToggleLike={onToggleLike}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ArticleComments({
  postId,
  comments: initialComments,
}: {
  postId: string;
  comments: ArticleComment[];
}) {
  const { data: session } = useSession();
  const overrideAvatarUrl = useCurrentAvatarStore((s) => s.overrideUrl);
  const myAvatarUrl = overrideAvatarUrl ?? session?.user?.image ?? "";
  const canInteract = Boolean(session?.username);

  const [comments, setComments] = useState(initialComments);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [draft, setDraft] = useState("");

  const total = countAll(comments);
  const visible = comments.slice(0, visibleCount);
  const hasMore = visibleCount < comments.length;

  async function submitRoot(e: React.FormEvent) {
    e.preventDefault();
    const content = draft.trim();
    if (!content || !session?.username) return;
    setDraft("");
    try {
      const created = await createPostCommentAction(postId, content);
      setComments((prev) => [toArticleComment(created), ...prev]);
    } catch {
      setDraft(content); // hoan lai noi dung neu gui that bai, khong mat chu da go
    }
  }

  async function submitReply(parentId: string, content: string) {
    if (!session?.username) return;
    try {
      const created = await createPostCommentAction(postId, content, parentId);
      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId
            ? { ...c, replies: [...c.replies, toArticleComment(created)] }
            : c,
        ),
      );
    } catch {
      // im lang - form da dong, khong co cho hien lai loi tung ky tu da go.
    }
  }

  async function toggleLike(id: string) {
    if (!session?.username) return;
    // optimistic
    setComments((prev) =>
      updateComment(prev, id, (c) => ({
        ...c,
        likedByMe: !c.likedByMe,
        likesCount: c.likesCount + (c.likedByMe ? -1 : 1),
      })),
    );
    try {
      const { liked, likesCount } = await togglePostCommentLikeAction(id);
      setComments((prev) => updateComment(prev, id, (c) => ({ ...c, likedByMe: liked, likesCount })));
    } catch {
      // rollback
      setComments((prev) =>
        updateComment(prev, id, (c) => ({
          ...c,
          likedByMe: !c.likedByMe,
          likesCount: c.likesCount + (c.likedByMe ? -1 : 1),
        })),
      );
    }
  }

  async function deleteComment(id: string) {
    const before = comments;
    setComments((prev) => removeComment(prev, id));
    try {
      await deletePostCommentAction(id);
    } catch {
      setComments(before); // rollback neu xoa that bai
    }
  }

  return (
    <section id="comments" className="flex scroll-mt-4 flex-col gap-4">
      <h2 className="font-content text-lg font-bold tracking-tight text-ink">
        Bình luận ({total})
      </h2>

      {canInteract ? (
        <form onSubmit={submitRoot} className="flex items-center gap-2">
          {myAvatarUrl ? (
            <Image
              src={myAvatarUrl}
              alt=""
              width={32}
              height={32}
              className="size-8 shrink-0 rounded-full object-cover"
            />
          ) : (
            // Session that (Google OAuth) luon co avatar - o day chi la luoi
            // an toan phong khi anh chua kip nap, khong bia anh gia.
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-surface-muted text-xs font-semibold text-ink-faint">
              {(session?.user?.name ?? "?").trim().charAt(0).toUpperCase()}
            </span>
          )}
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
      ) : (
        <p className="rounded-md border border-dashed border-border p-3 text-center text-sm text-ink-faint">
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Đăng nhập
          </Link>{" "}
          để viết bình luận.
        </p>
      )}

      <div className="flex flex-col gap-4">
        {visible.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            depth={0}
            canInteract={canInteract}
            onReply={submitReply}
            onToggleLike={toggleLike}
            onDelete={deleteComment}
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
