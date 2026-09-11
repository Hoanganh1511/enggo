"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ChevronDown, Eye, FileText, Pencil } from "lucide-react";
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { listPostsAction } from "@/actions/discover/list-posts";
import { getPostTitle } from "@/components/discover/home-feed/post-display";
import { formatRelativeTime } from "@/lib/format-time";
import type { Post } from "@/content/home-feed-mock";

type LoadState = "idle" | "loading" | "loaded" | "error";

// 1 hang bai viet - bam vao mo popover con (kieu menu chuot phai) thay vi
// dieu huong thang, cho 2 tuy chon: "Xem bài" (dieu huong toi /p/[id]) va
// "Sửa bài" (dieu huong toi /compose/[id], xem Composer.tsx `initialPost`) -
// menu nay von chi liet ke bai CUA CHINH nguoi xem (listPostsAction({
// authorUsername: session.username })) nen khong can check quyen so huu
// them o day, trang /compose/[id] van tu gate lai (post.isOwner) phong khi
// bi dieu huong thang toi duong dan nay tu cho khac. `openId`/`onOpenChange`
// nam o component cha de chi 1 hang mo popover con tai 1 thoi diem.
function PostRow({
  post,
  open,
  onOpenChange,
}: {
  post: Post;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();

  return (
    <PopoverRoot open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex w-full items-start gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors duration-150 ease-out hover:bg-hover-bg"
        >
          <FileText size={14} strokeWidth={1.8} className="mt-0.5 shrink-0 text-ink-faint" />
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-[13px] leading-5 font-medium text-ink">
              {getPostTitle(post)}
            </p>
            <p className="mt-0.5 text-[11px] text-ink-faint">
              {formatRelativeTime(post.createdAt)}
            </p>
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent
        open={open}
        align="start"
        sideOffset={2}
        className="z-50 w-36 overflow-hidden rounded-md border border-border bg-surface p-1 shadow-dropdown"
      >
        <button
          type="button"
          onClick={() => {
            onOpenChange(false);
            router.push(`/p/${post.id}`);
          }}
          className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs text-ink transition-colors duration-150 ease-out hover:bg-hover-bg"
        >
          <Eye size={13} strokeWidth={1.8} />
          Xem bài
        </button>
        <button
          type="button"
          onClick={() => {
            onOpenChange(false);
            router.push(`/compose/${post.id}`);
          }}
          className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs text-ink transition-colors duration-150 ease-out hover:bg-hover-bg"
        >
          <Pencil size={13} strokeWidth={1.8} />
          Sửa bài
        </button>
      </PopoverContent>
    </PopoverRoot>
  );
}

// Nut chevron canh "Viết bài" tren header (TopHeaderBar.tsx) - mo popover
// liet ke 5 bai viet gan day nhat CUA CHINH MINH, lay lai dung
// listPostsAction({ authorUsername }) da co san (dung boi trang profile tab
// "Bài đăng"), khong can API rieng. Fetch LAZY (chi goi luc mo popover lan
// dau, khong phai moi lan render header) - tranh 1 request thua tren MOI
// trang chi vi header luon mount.
export function RecentPostsMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<LoadState>("idle");
  const [posts, setPosts] = useState<Post[]>([]);
  const [openRowId, setOpenRowId] = useState<string | null>(null);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setOpenRowId(null);
    if (next && state === "idle" && session?.username) {
      setState("loading");
      listPostsAction({ authorUsername: session.username, limit: 5 })
        .then((res) => {
          setPosts(res);
          setState("loaded");
        })
        .catch(() => setState("error"));
    }
  }

  if (!session?.username) return null;

  return (
    <PopoverRoot open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Bài viết gần đây"
          className="flex h-9 w-7 shrink-0 cursor-pointer items-center justify-center rounded-r-sm border-l border-white/20 bg-[#8F3F4D] text-surface transition-opacity duration-150 ease-out hover:opacity-90"
        >
          <ChevronDown
            size={14}
            strokeWidth={2.2}
            className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        open={open}
        align="end"
        sideOffset={8}
        className="z-50 w-90 overflow-hidden rounded-md border border-border bg-surface shadow-dropdown"
      >
        <div className="border-b border-border px-3 py-2.5">
          <p className="text-xs font-bold text-ink-faint uppercase">
            Bài viết gần đây
          </p>
        </div>
        <div className="max-h-150 overflow-y-auto p-1.5">
          {state === "loading" && (
            <div className="flex flex-col gap-1.5 p-1.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 animate-pulse rounded-md bg-surface-muted"
                />
              ))}
            </div>
          )}
          {state === "error" && (
            <p className="px-2.5 py-4 text-center text-xs text-ink-faint">
              Không tải được danh sách bài viết.
            </p>
          )}
          {state === "loaded" && posts.length === 0 && (
            <p className="px-2.5 py-4 text-center text-xs text-ink-faint">
              Bạn chưa viết bài nào.
            </p>
          )}
          {state === "loaded" &&
            posts.map((post) => (
              <PostRow
                key={post.id}
                post={post}
                open={openRowId === post.id}
                onOpenChange={(rowOpen) => setOpenRowId(rowOpen ? post.id : null)}
              />
            ))}
        </div>
      </PopoverContent>
    </PopoverRoot>
  );
}
