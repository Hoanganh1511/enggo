"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Search } from "lucide-react";
import { SimpleModal } from "@/components/ui/simple-modal";
import { listPostsAction } from "@/actions/discover/list-posts";
import { getPostTitle, getPostImageUrl } from "@/components/discover/home-feed/post-display";
import type { Post } from "@/content/home-feed-mock";

// Modal "tìm bài viết" DUNG CHUNG cho moi cho can dien 1 URL noi bo (thay vi
// bat nguoi dung tu copy/dan URL bang tay) - yeu cau nguoi dung: "Có làm
// thêm được cái search bài viết, đỡ phải nhập URL không ?" (dang set URL dich
// cho CTA cua 1 the CardGrid). Dung LAI y het co che fetch/loc cua
// CuratedItemPickerModal.tsx (listPostsAction, fetch 1 lan luc mo, loc TIEP
// tren client theo tu khoa go) nhung don gian hon: chi tra ve 1 URL string
// (`/p/${post.id}`, dung pattern NoteCard.tsx dang dung) qua onSelect, khong
// can cau truc CuratedListItem (kind/excerpt/postId rieng) vi noi goi chi
// can 1 URL de dien vao o linkHref.
export function PostLinkPickerModal({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
}) {
  const [query, setQuery] = useState("");
  // undefined = chua fetch, [] = fetch xong nhung rong.
  const [posts, setPosts] = useState<Post[] | undefined>(undefined);
  const loading = open && posts === undefined;

  useEffect(() => {
    if (!open || posts !== undefined) return;
    listPostsAction({ limit: 30 })
      .then(setPosts)
      .catch(() => setPosts([]));
  }, [open, posts]);

  // Dong/mo modal - dat lai o tim kiem VA xoa cache luc dong (giong
  // CuratedItemPickerModal.tsx) de lan mo sau fetch lai du lieu MOI.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setQuery("");
    } else {
      setPosts(undefined);
    }
  }

  const q = query.trim().toLowerCase();
  const filtered = (posts ?? []).filter((p) => !q || getPostTitle(p).toLowerCase().includes(q));

  function handlePick(post: Post) {
    onSelect(`/p/${post.id}`);
    onOpenChange(false);
  }

  return (
    <SimpleModal open={open} onOpenChange={onOpenChange} title="Tìm bài viết để liên kết" maxWidthClassName="max-w-lg">
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search size={14} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo tên bài viết..."
            autoFocus
            className="h-9 w-full rounded-md border border-input-border bg-input-bg pr-3 pl-8 text-sm text-input-text outline-none focus:border-input-focus"
          />
        </div>

        <div className="flex max-h-80 flex-col gap-1 overflow-y-auto">
          {loading ? (
            <p className="py-6 text-center text-xs text-ink-faint">Đang tải...</p>
          ) : filtered.length === 0 ? (
            <p className="py-6 text-center text-xs text-ink-faint">Không tìm thấy bài viết nào.</p>
          ) : (
            filtered.map((post) => {
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
                  <span className="min-w-0 flex-1 truncate text-[13px] text-ink">{getPostTitle(post)}</span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </SimpleModal>
  );
}
