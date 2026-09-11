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
import { getPostCommentRepliesAction } from "@/actions/discover/post-comments/get-post-comment-replies";
import { useCurrentAvatarStore } from "@/stores/current-avatar-store";
import { formatRelativeTime } from "@/lib/format-time";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const PAGE_SIZE = 4;
// Khop voi thoi luong animation "comment-delete-water-rise" trong globals.css
// (900ms) - doi CA hieu ung LAN api that xong (whichever lau hon) roi moi
// go comment that su khoi DOM, tranh nuoc "dang" chua kip len het da bien mat.
const DELETE_ANIMATION_MS = 900;

function countAll(comments: ArticleComment[]): number {
  return comments.reduce((sum, c) => sum + 1 + c.repliesCount, 0);
}

// Cap nhat 1 comment (goc HOAC 1 reply DA TAI) o BAT KY dau trong cay 2 tang.
function mapAny(
  comments: ArticleComment[],
  id: string,
  map: (c: ArticleComment) => ArticleComment,
): ArticleComment[] {
  return comments.map((root) => {
    if (root.id === id) return map(root);
    if (root.repliesLoaded.some((r) => r.id === id)) {
      return {
        ...root,
        repliesLoaded: root.repliesLoaded.map((r) => (r.id === id ? map(r) : r)),
      };
    }
    return root;
  });
}

// Xoa 1 comment (goc hoac reply) KHOI cay - xoa 1 reply thi TRU LUON
// repliesCount cua goc tuong ung (dung chung cho ca xoa that LAN rollback
// optimistic reply gui that bai, xem submitReply).
function removeAny(comments: ArticleComment[], id: string): ArticleComment[] {
  return comments
    .filter((root) => root.id !== id)
    .map((root) => {
      if (!root.repliesLoaded.some((r) => r.id === id)) return root;
      return {
        ...root,
        repliesLoaded: root.repliesLoaded.filter((r) => r.id !== id),
        repliesCount: Math.max(0, root.repliesCount - 1),
      };
    });
}

const DELETING_LABEL = "Đang xoá...";

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
  onConfirmed,
  onToggleReplies,
  onLoadMoreReplies,
  repliesLoadingRootId,
}: {
  comment: ArticleComment;
  depth: 0 | 1;
  canInteract: boolean;
  onReply?: (parentId: string, content: string) => void;
  // Nhan id (khong phai da bind san) - dung CHUNG 1 ham cho ca comment goc
  // LAN reply, tranh phai tao closure rieng cho tung reply luc render de quy.
  onToggleLike: (id: string) => void;
  onDelete: (id: string) => void;
  onConfirmed: (id: string) => void;
  onToggleReplies?: (rootId: string) => void;
  onLoadMoreReplies?: (rootId: string) => void;
  repliesLoadingRootId?: string | null;
}) {
  const [expandedText, setExpandedText] = useState(false);
  const [replying, setReplying] = useState(false);
  const [replyDraft, setReplyDraft] = useState("");
  // Uoc luong "qua 6 dong" theo do dai ky tu thay vi do chieu cao thuc te
  // (don gian hon) - nguong 260 ky tu ~ 6 dong o do rong cot 620px, font 14px.
  const isLong = comment.content.length > 260;
  const isLoadingReplies = repliesLoadingRootId === comment.id;

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
            KHONG boc. relative + overflow-hidden: neo cho spinner pending
            (goc tren-trai) VA overlay nuoc dang luc xoa (::before/::after
            cua .comment-delete-water, xem globals.css). */}
        <div
          onAnimationEnd={() => comment.justConfirmed && onConfirmed(comment.id)}
          className={cn(
            "font-content relative overflow-hidden rounded-lg bg-surface-muted px-3 py-2",
            comment.pending && "animate-comment-pending",
            comment.justConfirmed && "animate-comment-confirm-flash",
            comment.deleting && "comment-delete-water",
          )}
        >
          {comment.pending && (
            <LoadingSpinner size={12} className="absolute top-1.5 left-1.5 text-primary" />
          )}
          <p className="text-sm font-semibold text-ink">{comment.author.name}</p>
          <p
            className={cn(
              "text-sm leading-relaxed text-ink",
              !expandedText && "line-clamp-6",
            )}
          >
            {comment.content}
          </p>
          {isLong && (
            <button
              type="button"
              onClick={() => setExpandedText((v) => !v)}
              className="mt-0.5 cursor-pointer text-xs font-medium text-primary hover:underline"
            >
              {expandedText ? "Thu gọn" : "Xem thêm"}
            </button>
          )}

          {/* Overlay "Đang xoá..." - CHI hien khi deleting, nam TREN nuoc
              (z-10, nuoc la ::before/::after cua chinh div nay). Tach tung
              ky tu thanh 1 <span> rieng, stagger animationDelay de tao hieu
              ung "nhay tung chu cai mot" thay vi ca cum nhay cung luc. */}
          {comment.deleting && (
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <span className="text-sm font-bold text-white">
                {DELETING_LABEL.split("").map((ch, i) => (
                  <span
                    key={i}
                    className="animate-comment-delete-letter"
                    style={{ animationDelay: `${i * 55}ms` }}
                  >
                    {ch === " " ? " " : ch}
                  </span>
                ))}
              </span>
            </div>
          )}
        </div>

        <div className="mt-1 flex items-center gap-3 px-1 text-xs text-ink-faint">
          <span>{formatRelativeTime(comment.createdAt)}</span>
          <button
            type="button"
            onClick={() => onToggleLike(comment.id)}
            disabled={!canInteract || comment.pending || comment.deleting}
            className={cn(
              "flex cursor-pointer items-center gap-1 font-medium transition-colors duration-150 ease-out hover:text-ink disabled:cursor-not-allowed",
              comment.likedByMe && "text-rose-500",
            )}
          >
            <Heart size={11} strokeWidth={2} fill={comment.likedByMe ? "currentColor" : "none"} />
            {comment.likesCount}
          </button>
          {depth === 0 && onReply && canInteract && !comment.pending && !comment.deleting && (
            <button
              type="button"
              onClick={() => setReplying((v) => !v)}
              className="cursor-pointer font-medium hover:text-ink"
            >
              Trả lời
            </button>
          )}
          {comment.isOwner && !comment.pending && !comment.deleting && (
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

        {/* Tang goc (depth 0) moi co reply - "Có N trả lời" CHUA tai san,
            bam vao moi that fetch (onToggleReplies) thay vi hien san tu
            comment-tree.ts nhu truoc. Da mo (repliesExpanded) thi hien danh
            sach da tai + nut "Xem thêm trả lời" neu con (repliesCursor). */}
        {depth === 0 && comment.repliesCount > 0 && (
          <div className="mt-2">
            {!comment.repliesExpanded ? (
              <button
                type="button"
                onClick={() => onToggleReplies?.(comment.id)}
                disabled={isLoadingReplies}
                className="cursor-pointer text-xs font-semibold text-primary hover:underline disabled:cursor-wait"
              >
                {isLoadingReplies ? "Đang tải..." : `Có ${comment.repliesCount} trả lời`}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onToggleReplies?.(comment.id)}
                  className="mb-2 cursor-pointer text-xs font-semibold text-ink-faint hover:text-ink hover:underline"
                >
                  Ẩn trả lời
                </button>
                {comment.repliesLoaded.length > 0 && (
                  <div className="flex flex-col gap-2.5 border-l-2 border-border pl-3">
                    {comment.repliesLoaded.map((reply) => (
                      <CommentItem
                        key={reply.id}
                        comment={reply}
                        depth={1}
                        canInteract={canInteract}
                        onToggleLike={onToggleLike}
                        onDelete={onDelete}
                        onConfirmed={onConfirmed}
                      />
                    ))}
                  </div>
                )}
                {comment.repliesLoaded.length < comment.repliesCount && (
                  <button
                    type="button"
                    onClick={() => onLoadMoreReplies?.(comment.id)}
                    disabled={isLoadingReplies}
                    className="mt-2 ml-3 cursor-pointer text-xs font-semibold text-primary hover:underline disabled:cursor-wait"
                  >
                    {isLoadingReplies
                      ? "Đang tải..."
                      : `Xem thêm trả lời (còn ${comment.repliesCount - comment.repliesLoaded.length})`}
                  </button>
                )}
              </>
            )}
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
  // Chi 1 root duoc load reply CUNG LUC (du dung UX, tranh phai quan ly 1
  // Set chi de disable nut - nguoi dung hiem khi bam 2 nut "Xem them" lien
  // tiep truoc khi cai truoc kip xong).
  const [repliesLoadingRootId, setRepliesLoadingRootId] = useState<string | null>(null);

  const total = countAll(comments);
  const visible = comments.slice(0, visibleCount);
  const hasMore = visibleCount < comments.length;

  function buildOptimisticComment(content: string, tempId: string): ArticleComment {
    return {
      id: tempId,
      author: {
        username: session?.username ?? "",
        name: session?.user?.name ?? "Bạn",
        avatarUrl: myAvatarUrl,
        verified: false,
      },
      createdAt: new Date().toISOString(),
      content,
      likesCount: 0,
      likedByMe: false,
      isOwner: true,
      repliesCount: 0,
      repliesLoaded: [],
      repliesCursor: null,
      repliesExpanded: false,
      pending: true,
    };
  }

  // Gui binh luan goc - hien NGAY 1 comment "gia" (nhap nhay mo, xem
  // CommentItem) truoc khi server tra loi, thay bang comment THAT (kem 1
  // lan flash sang) khi thanh cong - xem yeu cau "trang thai sending loading".
  async function submitRoot(e: React.FormEvent) {
    e.preventDefault();
    const content = draft.trim();
    if (!content || !session?.username) return;
    setDraft("");
    const tempId = `temp-${Date.now()}`;
    setComments((prev) => [buildOptimisticComment(content, tempId), ...prev]);
    try {
      const created = await createPostCommentAction(postId, content);
      setComments((prev) =>
        mapAny(prev, tempId, () => ({ ...toArticleComment(created), justConfirmed: true })),
      );
    } catch {
      setComments((prev) => prev.filter((c) => c.id !== tempId));
      setDraft(content); // hoan lai noi dung neu gui that bai, khong mat chu da go
    }
  }

  async function submitReply(parentId: string, content: string) {
    if (!session?.username) return;
    const tempId = `temp-${Date.now()}`;
    const optimistic = buildOptimisticComment(content, tempId);
    // Tu mo rong reply (repliesExpanded) de nguoi dung thay NGAY reply minh
    // vua gui, khong phai tu bam "Có N trả lời" cho chinh no.
    setComments((prev) =>
      mapAny(prev, parentId, (root) => ({
        ...root,
        repliesExpanded: true,
        repliesCount: root.repliesCount + 1,
        repliesLoaded: [...root.repliesLoaded, optimistic],
      })),
    );
    try {
      const created = await createPostCommentAction(postId, content, parentId);
      setComments((prev) =>
        mapAny(prev, tempId, () => ({ ...toArticleComment(created), justConfirmed: true })),
      );
    } catch {
      // removeAny tu tru lai repliesCount da tang optimistic o tren.
      setComments((prev) => removeAny(prev, tempId));
    }
  }

  function handleConfirmed(id: string) {
    setComments((prev) => mapAny(prev, id, (c) => ({ ...c, justConfirmed: false })));
  }

  async function toggleLike(id: string) {
    if (!session?.username) return;
    // optimistic
    setComments((prev) =>
      mapAny(prev, id, (c) => ({
        ...c,
        likedByMe: !c.likedByMe,
        likesCount: c.likesCount + (c.likedByMe ? -1 : 1),
      })),
    );
    try {
      const { liked, likesCount } = await togglePostCommentLikeAction(id);
      setComments((prev) => mapAny(prev, id, (c) => ({ ...c, likedByMe: liked, likesCount })));
    } catch {
      // rollback
      setComments((prev) =>
        mapAny(prev, id, (c) => ({
          ...c,
          likedByMe: !c.likedByMe,
          likesCount: c.likesCount + (c.likedByMe ? -1 : 1),
        })),
      );
    }
  }

  // Xoa: bat "deleting" (choi hieu ung nuoc dang, xem CommentItem/globals.css)
  // roi doi CA animation LAN API xong (Promise.all voi 1 setTimeout dung
  // DELETE_ANIMATION_MS) - tranh nuoc chua kip dang het da bien mat khoi DOM
  // (API thuong nhanh hon 900ms, se bi cho khop animation).
  async function deleteComment(id: string) {
    setComments((prev) => mapAny(prev, id, (c) => ({ ...c, deleting: true })));
    const [apiResult] = await Promise.allSettled([
      deletePostCommentAction(id),
      new Promise((resolve) => setTimeout(resolve, DELETE_ANIMATION_MS)),
    ]);
    if (apiResult.status === "fulfilled") {
      setComments((prev) => removeAny(prev, id));
    } else {
      setComments((prev) => mapAny(prev, id, (c) => ({ ...c, deleting: false })));
    }
  }

  async function loadMoreReplies(rootId: string) {
    const root = comments.find((c) => c.id === rootId);
    if (!root || repliesLoadingRootId) return;
    setRepliesLoadingRootId(rootId);
    try {
      const page = await getPostCommentRepliesAction(rootId, root.repliesCursor ?? undefined);
      setComments((prev) =>
        mapAny(prev, rootId, (c) => ({
          ...c,
          repliesLoaded: [...c.repliesLoaded, ...page.items.map(toArticleComment)],
          repliesCursor: page.nextCursor,
        })),
      );
    } finally {
      setRepliesLoadingRootId(null);
    }
  }

  function toggleReplies(rootId: string) {
    const root = comments.find((c) => c.id === rootId);
    if (!root) return;
    if (!root.repliesExpanded && root.repliesLoaded.length === 0) {
      loadMoreReplies(rootId);
    }
    setComments((prev) => mapAny(prev, rootId, (c) => ({ ...c, repliesExpanded: !c.repliesExpanded })));
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
            onConfirmed={handleConfirmed}
            onToggleReplies={toggleReplies}
            onLoadMoreReplies={loadMoreReplies}
            repliesLoadingRootId={repliesLoadingRootId}
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
