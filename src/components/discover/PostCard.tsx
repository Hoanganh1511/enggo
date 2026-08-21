"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, MoreHorizontal, Link2, Flag } from "lucide-react";
import type { Post } from "@/content/home-feed-mock";
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { PostBody } from "./post-bodies";
import { ActionBar } from "./action-bar";
import { TopicBreadcrumb } from "./TopicBreadcrumb";
import { POST_KIND_META } from "@/lib/discover/post-kind-meta";
import { hexToRgba } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format-time";

type PostCardProps = {
  post: Post;
  // "timeline" (mac dinh) - hang thuong trong feed, avatar+ten dan dau, co
  // marker tron nho ngoi tren duong ke doc cua cot (dung cho ProfileFeedBox.tsx
  // - danh sach 1 cot). "card" - the doc lap co vien/bo goc rieng, BADGE LOAI
  // BAI dan dau thay vi avatar, tac gia lui xuong thanh footer nho - dung cho
  // MasonryFeed.tsx (trang Home) de tao "ca tinh rieng" khi cac the dung ke
  // nhau trong luoi masonry.
  variant?: "timeline" | "card";
};

// Card 1 bai post trong feed Trang chu - du lieu THAT tu backend (xem
// lib/discover/feed-store.ts). PostCard chi lo phan CHUNG cho moi loai post: avatar/ten/badge/username/
// thoi gian/menu 3 cham o header. Phan noi dung chinh (van ban/anh/video/
// file/link/resource/note/...) giao het cho PostBody (post-bodies/index.tsx),
// va cum action duoi cung giao het cho ActionBar (action-bar/index.tsx) - moi
// "kind" co dang trinh bay VA bo action rieng, khong con dung chung 1 mau
// Like/Comment/Repost/Save cho moi loai bai.
//
// Card nam tren bg-surface (box thich ung ca light/dark, xem HomeLayoutShell.tsx)
// nen toan bo mau chu O DAY dung token ngu nghia (text-ink/text-ink-muted/
// text-ink-faint) de tu doi mau theo prefers-color-scheme thay vi hex co dinh.
const PostCard = ({ post, variant = "timeline" }: PostCardProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const kindMeta = POST_KIND_META[post.kind];

  const menu = (
    <PopoverRoot open={menuOpen} onOpenChange={setMenuOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors duration-150 ease-out ${
            menuOpen
              ? "bg-hover-bg text-ink"
              : "text-ink-faint hover:bg-hover-bg hover:text-ink-muted"
          }`}
        >
          <MoreHorizontal size={16} strokeWidth={1.75} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        open={menuOpen}
        align="end"
        className="z-50 w-44 rounded-lg border border-border bg-surface p-1.5 shadow-dropdown"
      >
        <button
          type="button"
          onClick={() => setMenuOpen(false)}
          className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-ink transition-colors duration-150 ease-out hover:bg-hover-bg"
        >
          <Link2 size={14} strokeWidth={1.75} />
          Copy link
        </button>
        <button
          type="button"
          onClick={() => setMenuOpen(false)}
          className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-red-500 transition-colors duration-150 ease-out hover:bg-hover-bg"
        >
          <Flag size={14} strokeWidth={1.75} />
          Báo cáo
        </button>
      </PopoverContent>
    </PopoverRoot>
  );

  // bg-surface (trang dac) chu KHONG phai surface-muted/50: nen trang la
  // #f6f8fa, ma surface-muted o 50% ra gan dung mau do -> card bi "tan" vao
  // nen. Them shadow nhe de tach lop o light mode; dark mode nen gan den nen
  // shadow khong an thua, chinh border moi la thu tach lop.
  if (variant === "card") {
    return (
      <article className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-[0_1px_2px_rgba(16,24,40,0.06),0_1px_3px_rgba(16,24,40,0.1)] transition-[box-shadow,border-color] duration-150 ease-out hover:border-hover-border hover:shadow-[0_4px_14px_rgba(16,24,40,0.1)]">
        <div className="flex items-center justify-between gap-2">
          {/* Icon nam trong khoi tron dac mau accent, nhan chi la chu thuong
              (khong con pill nen mau) - doi theo phong cach the mau nguoi
              dung gui, gon va bot "on" mau hon ban pill truoc. */}
          <span className="inline-flex items-center gap-1.5">
            <span
              className="flex size-5 shrink-0 items-center justify-center rounded-full text-white"
              style={{ background: kindMeta.accent }}
            >
              <kindMeta.icon size={11} strokeWidth={2.25} />
            </span>
            <span className="text-xs font-semibold text-ink">
              {kindMeta.label}
            </span>
          </span>
          {menu}
        </div>

        {post.topic && <TopicBreadcrumb topic={post.topic} />}

        <PostBody post={post} />

        {/* Cum thong tin nguoi dang len TRUOC action bar (Like/Comment/
            Repost/Save) - dao thu tu theo yeu cau, nhan dien "ai dang" truoc
            khi tuong tac thay vi nguoc lai nhu ban cu. */}
        <div className="flex min-w-0 items-center gap-1.5 border-t border-border pt-3">
          <Link href={`/u/${post.author.username}`} className="shrink-0">
            <Image
              src={post.author.avatarUrl}
              alt={post.author.name}
              width={24}
              height={24}
              className="size-6 shrink-0 rounded-full object-cover"
            />
          </Link>
          <Link
            href={`/u/${post.author.username}`}
            className="min-w-0 truncate text-sm font-semibold text-ink hover:underline"
          >
            {post.author.name}
          </Link>
          {post.author.verified && (
            <BadgeCheck
              size={11}
              strokeWidth={2}
              className="shrink-0 text-primary"
            />
          )}
          <span className="text-ink-faint">·</span>
          {/* Thoi gian dang lam link toi trang chi tiet bai viet (/p/[id]) -
              quy uoc pho bien (Twitter/Facebook) de "chi tiet" co 1 diem vao
              ro rang ma khong phai boc ca <article> trong 1 <Link> (se xung
              dot voi menu/ActionBar la nut/link long ben trong). */}
          <Link
            href={`/p/${post.id}`}
            className="shrink-0 text-xs text-ink-faint hover:underline"
          >
            {formatRelativeTime(post.createdAt)}
          </Link>
        </div>

        <ActionBar post={post} />
      </article>
    );
  }

  return (
    <article className="py-4 first:pt-5 last:pb-5">
      <div className="flex items-start gap-3">
        {/* Marker loai bai viet - ngoi tren duong ke doc cua danh sach
            (variant="timeline"), luon dung icon/mau THEO KIND (khong phai
            icon rieng cua tung post) de nhan dien nhat quan khi luot feed. */}
        <div className="flex w-5 shrink-0 justify-center">
          <span
            title={kindMeta.label}
            className="relative z-10 mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full"
            style={{
              background: hexToRgba(kindMeta.accent, 0.16),
              color: kindMeta.accent,
            }}
          >
            <kindMeta.icon size={11} strokeWidth={2.25} />
          </span>
        </div>
        <Link href={`/u/${post.author.username}`} className="shrink-0">
          <Image
            src={post.author.avatarUrl}
            alt={post.author.name}
            width={40}
            height={40}
            className="size-10 shrink-0 rounded-full object-cover"
          />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
              <Link
                href={`/u/${post.author.username}`}
                className="truncate text-base font-semibold text-ink hover:underline"
              >
                {post.author.name}
              </Link>
              {post.author.verified && (
                <BadgeCheck
                  size={13}
                  strokeWidth={2}
                  className="shrink-0 text-primary"
                />
              )}
              <Link
                href={`/u/${post.author.username}`}
                className="truncate text-xs text-ink-muted hover:underline"
              >
                @{post.author.username}
              </Link>
              <span className="text-ink-faint">·</span>
              {/* Xem comment o nhanh variant="card" ben tren ve ly do dung
                  thoi gian lam diem vao trang chi tiet bai viet. */}
              <Link
                href={`/p/${post.id}`}
                className="shrink-0 text-xs text-ink-muted hover:underline"
              >
                {formatRelativeTime(post.createdAt)}
              </Link>
            </div>

            {menu}
          </div>

          {post.topic && (
            <div className="mt-0.5">
              <TopicBreadcrumb topic={post.topic} />
            </div>
          )}

          <PostBody post={post} />
          <ActionBar post={post} />
        </div>
      </div>
    </article>
  );
};

export default PostCard;
