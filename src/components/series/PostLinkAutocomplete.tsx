"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { FileText } from "lucide-react";
import { listPostsAction } from "@/actions/discover/list-posts";
import { getPostTitle } from "@/components/discover/home-feed/post-display";
import type { Post } from "@/content/home-feed-mock";

// Input "Link" cho Stats Bar - VAN la 1 o nhap text tu do (URL ngoai van
// dan/go duoc binh thuong), nhung khi go se goi y BAI VIET CUA CHINH TAI
// KHOAN DANG DANG NHAP khop voi ky tu da go (yeu cau nguoi dung: 1 stat
// thuong dung de tro toi 1 bai gioi thieu cua chinh minh, khong muon phai
// tu copy URL /p/[id] thu cong). Fetch LAZY (chi 1 lan, luc input duoc focus
// lan dau) - cung tinh than RecentPostsMenu.tsx.
export function PostLinkAutocomplete({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleFocus() {
    setOpen(true);
    if (posts === null && session?.username) {
      listPostsAction({ authorUsername: session.username, limit: 50 })
        .then(setPosts)
        .catch(() => setPosts([]));
    }
  }

  const q = value.trim().toLowerCase();
  const suggestions = (posts ?? [])
    .filter((p) => !q || getPostTitle(p).toLowerCase().includes(q))
    .slice(0, 6);

  return (
    <div ref={containerRef} className="relative min-w-0">
      <input
        className={className}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={handleFocus}
        placeholder={placeholder}
      />
      {open && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 max-h-56 w-72 overflow-y-auto rounded-md border border-border bg-surface p-1 shadow-dropdown">
          <p className="px-2 py-1 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
            Bài viết của bạn
          </p>
          {suggestions.map((post) => (
            <button
              key={post.id}
              type="button"
              onClick={() => {
                onChange(`/p/${post.id}`);
                setOpen(false);
              }}
              className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] text-ink hover:bg-hover-bg"
            >
              <FileText size={13} strokeWidth={1.8} className="shrink-0 text-ink-faint" />
              <span className="truncate">{getPostTitle(post)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
