"use client";

import { useState } from "react";
import Link from "next/link";
import { Bookmark, Check, Folder, Heart, MessageCircle, Pencil, Plus, Share2 } from "lucide-react";
import { formatCompact } from "@/lib/format-number";
import { cn } from "@/lib/utils";
import { PopoverRoot, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { getCollectionMembershipAction } from "@/actions/discover/collections/get-collection-membership";
import { addToCollectionAction } from "@/actions/discover/collections/add-to-collection";
import { removeFromCollectionAction } from "@/actions/discover/collections/remove-from-collection";
import { CreateCollectionModal } from "@/components/collections/CreateCollectionModal";
import type { CollectionMembership } from "@/lib/api/collections";

// Cum hanh dong day du (khac Count Like tinh o ArticleHeader.tsx - o day
// like BAM DUOC, toggle active state local, CHUA goi API that - chua co
// endpoint Like cho Post, xem home-feed-mock.ts comment ve lien luon
// undefined tu API). "Lưu" GIO LA THAT - xem SaveToCollectionButton duoi
// day (tinh nang Bo suu tap, thay cho toggle cuc bo cu khong ket noi gi).
// `sticky` (mobile) - dinh co dinh duoi cung man hinh (theo mockup "Mobile
// Sticky Action") thay vi nam inline trong dong chay bai viet, luon thay
// duoc du cuon toi dau. Render 2 lan qua breakpoint CSS o page.tsx (ban
// thuong "hidden lg:flex" desktop, ban sticky "flex lg:hidden" mobile) -
// state like khong lien ket giua 2 ban (moi ban co state rieng, CHUA co API
// that luu like) nhung "Lưu" (goi API that) tu dong khop nhau vi ca 2 ban
// cung goi getCollectionMembershipAction lay tu server, khong con lech.
export function ArticleActionBar({
  likes,
  commentCount,
  sticky = false,
  postId,
  isOwner = false,
}: {
  likes: number;
  commentCount: number;
  sticky?: boolean;
  // Tinh nang Sua bai - CHI hien nut khi la chu bai (post.isOwner, xem
  // PostService.findOne). Nut "Lưu" cung can postId (luu duoc bai BAT KY
  // ai dang, khong rieng bai cua minh).
  postId?: string;
  isOwner?: boolean;
}) {
  const [liked, setLiked] = useState(false);

  return (
    <div
      className={
        sticky
          ? "fixed inset-x-0 bottom-0 z-40 flex items-center justify-between border-t border-border bg-surface px-4 py-2.5 pb-[max(env(safe-area-inset-bottom),10px)] shadow-[0_-4px_12px_rgba(0,0,0,0.06)]"
          : "flex items-center justify-between border-y border-border py-3"
      }
    >
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setLiked((v) => !v)}
          className={cn(
            "flex h-9 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-sm font-medium transition-colors duration-150 ease-out hover:bg-hover-bg",
            liked ? "text-rose-500" : "text-ink-muted",
          )}
        >
          <Heart size={17} strokeWidth={2} fill={liked ? "currentColor" : "none"} />
          {formatCompact(likes + (liked ? 1 : 0))}
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
          aria-label="Chia sẻ"
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-ink"
        >
          <Share2 size={17} strokeWidth={2} />
        </button>
      </div>
    </div>
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
