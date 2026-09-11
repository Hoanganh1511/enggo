"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ChevronDown, FileText } from "lucide-react";
import { PopoverRoot, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { listPostsAction } from "@/actions/discover/list-posts";
import { getPostTitle } from "@/components/discover/home-feed/post-display";
import { formatRelativeTime } from "@/lib/format-time";
import type { Post } from "@/content/home-feed-mock";

type LoadState = "idle" | "loading" | "loaded" | "error";

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

  function handleOpenChange(next: boolean) {
    setOpen(next);
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
          className="flex h-9 w-7 shrink-0 cursor-pointer items-center justify-center rounded-r-sm border-l border-white/20 bg-black/90 text-surface transition-opacity duration-150 ease-out hover:opacity-90"
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
        className="z-50 w-72 overflow-hidden rounded-md border border-border bg-surface shadow-dropdown"
      >
        <div className="border-b border-border px-3 py-2.5">
          <p className="text-xs font-bold text-ink-faint uppercase">Bài viết gần đây</p>
        </div>
        <div className="max-h-80 overflow-y-auto p-1.5">
          {state === "loading" && (
            <div className="flex flex-col gap-1.5 p-1.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded-md bg-surface-muted" />
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
              <Link
                key={post.id}
                href={`/p/${post.id}`}
                onClick={() => setOpen(false)}
                className="flex items-start gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors duration-150 ease-out hover:bg-hover-bg"
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
              </Link>
            ))}
        </div>
      </PopoverContent>
    </PopoverRoot>
  );
}
