"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Search } from "lucide-react";
import { SimpleModal } from "@/components/ui/simple-modal";
import { listPostsAction } from "@/actions/discover/list-posts";
import {
  getPostTitle,
  getPostImageUrl,
} from "@/components/discover/home-feed/post-display";
import { getPostContentText } from "@/lib/discover/article-content";
import type { Post } from "@/content/home-feed-mock";
import type { CuratedListItem } from "./post-extensions";
import { cn } from "@/lib/utils";

const KIND_TABS: { value: "article" | "video"; label: string; postKind: string }[] = [
  { value: "article", label: "Bài viết", postKind: "text" },
  { value: "video", label: "Video", postKind: "video" },
];

// Modal chon 1 Post THAT de nhet vao 1 o cua khoi "Đọc thêm" (CuratedList,
// xem post-extensions.ts) - mo la FETCH SAN theo tab dang chon (yeu cau nguoi
// dung "lúc modal mới mở thì fetch sẵn các bài theo các mục, dạng filter"),
// go chu thi loc TIEP tren tap da fetch (khong goi lai API moi phim go, du
// nhe vi gioi han limit 30/tab).
export function CuratedItemPickerModal({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (item: CuratedListItem) => void;
}) {
  const [kind, setKind] = useState<"article" | "video">("article");
  const [query, setQuery] = useState("");
  // undefined = chua fetch, [] = fetch xong nhung rong - phan biet 2 trang
  // thai nay de tinh `loading` TRUC TIEP tu state (khong can state rieng),
  // xem loading ben duoi.
  const [postsByKind, setPostsByKind] = useState<Record<string, Post[] | undefined>>({});
  const loading = open && postsByKind[kind] === undefined;

  useEffect(() => {
    if (!open || postsByKind[kind] !== undefined) return;
    const tab = KIND_TABS.find((t) => t.value === kind)!;
    listPostsAction({ kind: [tab.postKind], limit: 30 })
      .then((posts) => setPostsByKind((prev) => ({ ...prev, [kind]: posts })))
      .catch(() => setPostsByKind((prev) => ({ ...prev, [kind]: [] })));
  }, [open, kind, postsByKind]);

  // Dong/mo modal - dat lai o tim kiem VA xoa cache (Adjusting state during
  // render, khong qua useEffect - xem CreateCollectionModal.tsx cung pattern)
  // de lan mo sau fetch lai du lieu MOI (bai vua dang cung nen xuat hien
  // ngay), khong giu snapshot cu vo thoi han.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setQuery("");
    } else {
      setPostsByKind({});
    }
  }

  const q = query.trim().toLowerCase();
  const posts = (postsByKind[kind] ?? []).filter(
    (p) => !q || getPostTitle(p).toLowerCase().includes(q),
  );

  function handlePick(post: Post) {
    onSelect({
      postId: post.id,
      title: getPostTitle(post),
      excerpt: getPostContentText(post).slice(0, 140),
      imageUrl: getPostImageUrl(post) ?? null,
      kind,
    });
    onOpenChange(false);
  }

  return (
    <SimpleModal
      open={open}
      onOpenChange={onOpenChange}
      title="Chọn bài để hiển thị"
      maxWidthClassName="max-w-lg"
    >
      <div className="flex flex-col gap-3">
        <div className="flex gap-1.5">
          {KIND_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setKind(tab.value)}
              className={cn(
                "h-8 cursor-pointer rounded-full px-3.5 text-[12.5px] font-medium transition-colors duration-150 ease-out",
                kind === tab.value
                  ? "bg-ink text-surface"
                  : "border border-border text-ink-muted hover:bg-hover-bg",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search
            size={14}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-faint"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo tên bài viết..."
            className="h-9 w-full rounded-md border border-input-border bg-input-bg pr-3 pl-8 text-sm text-input-text outline-none focus:border-input-focus"
          />
        </div>

        <div className="flex max-h-80 flex-col gap-1 overflow-y-auto">
          {loading ? (
            <p className="py-6 text-center text-xs text-ink-faint">Đang tải...</p>
          ) : posts.length === 0 ? (
            <p className="py-6 text-center text-xs text-ink-faint">
              Không tìm thấy bài viết nào.
            </p>
          ) : (
            posts.map((post) => {
              const image = getPostImageUrl(post);
              return (
                <button
                  key={post.id}
                  type="button"
                  onClick={() => handlePick(post)}
                  className="flex cursor-pointer items-center gap-2.5 rounded-md p-2 text-left transition-colors duration-150 ease-out hover:bg-hover-bg"
                >
                  <div className="relative size-11 shrink-0 overflow-hidden rounded-md bg-surface-muted">
                    {image && <Image src={image} alt="" fill className="object-cover" />}
                  </div>
                  <span className="min-w-0 flex-1 truncate text-[13px] text-ink">
                    {getPostTitle(post)}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </SimpleModal>
  );
}
