"use client";

import { useState } from "react";
import Link from "next/link";
import { Bookmark, Check, Folder, Heart, Link2, MessageCircle, Pencil, Plus } from "lucide-react";
import { formatCompact } from "@/lib/format-number";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast/toast-store";
import { PopoverRoot, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { getCollectionMembershipAction } from "@/actions/discover/collections/get-collection-membership";
import { addToCollectionAction } from "@/actions/discover/collections/add-to-collection";
import { removeFromCollectionAction } from "@/actions/discover/collections/remove-from-collection";
import { toggleLikePostAction } from "@/actions/discover/toggle-like-post";
import { CreateCollectionModal } from "@/components/collections/CreateCollectionModal";
import type { CollectionMembership } from "@/lib/api/collections";

// Cum hanh dong day du. CHI 1 INSTANCE DUY NHAT cho ca desktop lan mobile (2
// <div> layout khac nhau qua CSS breakpoint, dung CHUNG 1 state ben trong) -
// TRUOC DAY render 2 lan rieng biet o page.tsx (1 ban thuong desktop, 1 ban
// sticky mobile), moi ban co useState("liked") RIENG nen bam like ben nay
// khong thay doi ben kia, lech han. "Lưu"/Like gio deu goi API that (Like
// tu 2026-09-12, xem PostLike o backend) nen gop lam 1 component la du,
// khong can co che dong bo rieng nua.
export function ArticleActionBar({
  postId,
  initialLikes,
  initialLiked = false,
  commentCount,
  isOwner = false,
}: {
  postId?: string;
  initialLikes: number;
  initialLiked?: boolean;
  commentCount: number;
  isOwner?: boolean;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [likes, setLikes] = useState(initialLikes);
  // Chi bat animation "pop" khi VUA CHUYEN sang thich (khong chay luc bo
  // thich, khong lap lai moi lan re-render) - tu tat qua onAnimationEnd thay
  // vi setTimeout (khop chinh xac voi thoi luong animation trong CSS).
  const [justLiked, setJustLiked] = useState(false);
  const [likePending, setLikePending] = useState(false);

  async function handleToggleLike() {
    if (!postId || likePending) return;
    setLikePending(true);
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikes((n) => n + (nextLiked ? 1 : -1));
    if (nextLiked) setJustLiked(true);
    try {
      const res = await toggleLikePostAction(postId);
      setLiked(res.liked);
      setLikes(res.likesCount);
    } catch {
      // rollback ve truoc luc bam neu API loi.
      setLiked(!nextLiked);
      setLikes((n) => n + (nextLiked ? -1 : 1));
      toast.danger("Không thực hiện được, thử lại sau.");
    } finally {
      setLikePending(false);
    }
  }

  function handleShare() {
    if (!postId) return;
    const url = `${window.location.origin}/p/${postId}`;
    navigator.clipboard
      .writeText(url)
      .then(() => toast.success("Đã copy link bài viết"))
      .catch(() => toast.danger("Không copy được link, thử lại sau."));
  }

  const actions = (
    <>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={handleToggleLike}
          disabled={!postId}
          className={cn(
            "flex h-9 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-sm font-medium transition-colors duration-150 ease-out hover:bg-hover-bg disabled:cursor-not-allowed",
            liked ? "text-rose-500" : "text-ink-muted",
          )}
        >
          <Heart
            size={17}
            strokeWidth={2}
            fill={liked ? "currentColor" : "none"}
            className={justLiked ? "animate-heart-like-pop" : undefined}
            onAnimationEnd={() => setJustLiked(false)}
          />
          {formatCompact(likes)}
        </button>

        <a
          href="#comments"
          className="flex h-9 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-sm font-medium text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg"
        >
          <MessageCircle size={17} strokeWidth={2} />
          {formatCompact(commentCount)}
        </a>

        {postId && <SaveToCollectionButton postId={postId} />}
      </div>

      <div className="flex items-center gap-1">
        {isOwner && postId && (
          <Link
            href={`/compose/${postId}`}
            aria-label="Sửa bài"
            title="Sửa bài"
            className="flex h-9 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-sm font-medium text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-ink"
          >
            <Pencil size={16} strokeWidth={2} />
            Sửa bài
          </Link>
        )}
        <button
          type="button"
          onClick={handleShare}
          disabled={!postId}
          aria-label="Copy link bài viết"
          title="Copy link bài viết"
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-ink disabled:cursor-not-allowed"
        >
          <Link2 size={17} strokeWidth={2} />
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Ban desktop - inline, sau than bai (>=1200px). */}
      <div className="hidden min-[1200px]:flex min-[1200px]:items-center min-[1200px]:justify-between min-[1200px]:border-y min-[1200px]:border-border min-[1200px]:py-3">
        {actions}
      </div>
      {/* Ban mobile/tablet - dinh co dinh duoi cung man hinh (<1200px, ke ca
          tablet), luon thay duoc du cuon toi dau. */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between border-t border-border bg-surface px-4 py-2.5 pb-[max(env(safe-area-inset-bottom),10px)] shadow-[0_-4px_12px_rgba(0,0,0,0.06)] min-[1200px]:hidden">
        {actions}
      </div>
    </>
  );
}

type LoadState = "idle" | "loading" | "loaded" | "error";

// Nut "Lưu" that - mo popover danh sach bo suu tap cua CHINH nguoi xem, tick
// vao/bo tick de them/xoa bai nay (khong rieng bai cua minh, luu duoc bai
// BAT KY ai dang). Fetch LAZY (chi goi getCollectionMembershipAction luc mo
// popover lan dau, khong phai moi lan render trang) - cung tinh than
// RecentPostsMenu.tsx.
function SaveToCollectionButton({ postId }: { postId: string }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<LoadState>("idle");
  const [items, setItems] = useState<CollectionMembership[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const saved = items.some((i) => i.contains);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next && state === "idle") {
      setState("loading");
      getCollectionMembershipAction(postId)
        .then((res) => {
          setItems(res);
          setState("loaded");
        })
        .catch(() => setState("error"));
    }
  }

  async function toggle(item: CollectionMembership) {
    const next = !item.contains;
    // optimistic
    setItems((prev) =>
      prev.map((i) => (i.collectionId === item.collectionId ? { ...i, contains: next } : i)),
    );
    try {
      if (next) await addToCollectionAction(item.collectionId, postId);
      else await removeFromCollectionAction(item.collectionId, postId);
    } catch {
      // rollback neu API loi
      setItems((prev) =>
        prev.map((i) => (i.collectionId === item.collectionId ? { ...i, contains: !next } : i)),
      );
    }
  }

  return (
    <>
      <PopoverRoot open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Lưu vào bộ sưu tập"
            title="Lưu vào bộ sưu tập"
            className={cn(
              "flex h-9 w-9 cursor-pointer items-center justify-center rounded-md transition-colors duration-150 ease-out hover:bg-hover-bg",
              saved ? "text-primary" : "text-ink-muted",
            )}
          >
            <Bookmark size={17} strokeWidth={2} fill={saved ? "currentColor" : "none"} />
          </button>
        </PopoverTrigger>
        <PopoverContent
          open={open}
          align="start"
          sideOffset={6}
          className="z-50 w-64 overflow-hidden rounded-md border border-border bg-surface p-1.5 shadow-dropdown"
        >
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setCreateOpen(true);
            }}
            className="mb-1 flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm font-medium text-primary hover:bg-hover-bg"
          >
            <Plus size={14} strokeWidth={2.2} /> Tạo bộ sưu tập mới
          </button>
          {state === "loading" && (
            <p className="px-2.5 py-3 text-center text-xs text-ink-faint">Đang tải...</p>
          )}
          {state === "error" && (
            <p className="px-2.5 py-3 text-center text-xs text-ink-faint">
              Không tải được danh sách, thử lại sau.
            </p>
          )}
          {state === "loaded" && items.length === 0 && (
            <p className="px-2.5 py-3 text-center text-xs text-ink-faint">
              Bạn chưa có bộ sưu tập nào.
            </p>
          )}
          {state === "loaded" &&
            items.map((item) => (
              <button
                key={item.collectionId}
                type="button"
                onClick={() => toggle(item)}
                className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm text-ink hover:bg-hover-bg"
              >
                <Folder size={14} strokeWidth={1.8} className="shrink-0 text-ink-faint" />
                <span className="min-w-0 flex-1 truncate">{item.title}</span>
                {item.contains && <Check size={14} className="shrink-0 text-primary" />}
              </button>
            ))}
        </PopoverContent>
      </PopoverRoot>

      <CreateCollectionModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(created) => {
          setItems((prev) => [{ collectionId: created.id, title: created.title, contains: false }, ...prev]);
          setState("loaded");
          toggle({ collectionId: created.id, title: created.title, contains: false });
        }}
      />
    </>
  );
}
