"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import type { Author } from "@/content/home-feed-mock";
import {
  followUserAction,
  unfollowUserAction,
} from "@/actions/discover/follow-user";
import { formatCompact } from "@/lib/format-number";
import { cn } from "@/lib/utils";

// Card tac gia thu nho - DINH (sticky) o cot TRAI, doi dien voi ArticleSidebar
// (Muc luc/Bai viet lien quan) o cot phai, theo yeu cau nguoi dung ("đổi vị
// trí sticky... sang trái đối diện với toc"). Truoc day la 1 thanh ngang
// "fixed" troi tren dau trang (che ca thanh dieu huong header) - gio 2 cot
// TRAI/PHAI deu la cot that trong bo cuc 3-cot cua page.tsx nen dung "sticky"
// binh thuong duoc, khong can hack "fixed" nua. CHI hien tu lg+ (page.tsx
// dung "hidden lg:block" tren aside boc ngoai) - tren mobile khong co cho
// cho 1 cot rieng, thanh hanh dong dinh duoi cung (ArticleActionBar
// sticky) da dam nhiem vai tro "luon thay duoc" o do roi.
//
// HIEN THI THAY CHO ArticleAuthorCard.tsx (card tac gia day du o cuoi bai)
// trong luc nguoi doc dang cuon qua than bai ma CHUA cuon toi cho thay duoc
// card that o duoi: dung IntersectionObserver quan sat chinh element
// ArticleAuthorCard (qua id truyen vao) - khi card that xuat hien trong
// viewport thi tu an card nay di (khong hien 2 noi cung luc).
//
// BIET TRUOC: card nay va ArticleAuthorCard.tsx deu tu quan state
// `following` RIENG - bam follow o 1 noi khong dong bo NGAY sang noi con
// lai, nhung vi 2 noi khong bao gio hien CUNG LUC (card nay tu an khi card
// that hien ra) nen it kha nang nguoi dung thay ro su lech.
export function ArticleStickyAuthorBar({
  author,
  followerCount,
  isFollowing,
  isSelf,
  authorCardId,
}: {
  author: Author;
  followerCount?: number;
  isFollowing: boolean;
  isSelf: boolean;
  // id cua ArticleAuthorCard that o duoi trang - dung lam target quan sat.
  authorCardId: string;
}) {
  const [visible, setVisible] = useState(false);
  const [following, setFollowing] = useState(isFollowing);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const target = document.getElementById(authorCardId);
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { rootMargin: "-96px 0px 0px 0px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [authorCardId]);

  async function handleToggleFollow() {
    const next = !following;
    setFollowing(next); // optimistic
    setPending(true);
    try {
      await (next
        ? followUserAction(author.username)
        : unfollowUserAction(author.username));
    } catch {
      setFollowing(!next); // rollback neu API loi
    } finally {
      setPending(false);
    }
  }

  if (!visible) return null;

  return (
    <div className="sticky top-20 flex flex-col items-center gap-3 rounded-lg border border-border bg-surface p-4 text-center shadow-sm">
      <Link href={`/u/${author.username}`} className="flex flex-col items-center gap-2">
        <Image
          src={author.avatarUrl}
          alt={author.name}
          width={56}
          height={56}
          className="size-14 shrink-0 rounded-full object-cover"
        />
        <span className="flex min-w-0 items-center gap-1">
          <span className="truncate text-sm font-semibold text-ink">
            {author.name}
          </span>
          {author.verified && (
            <BadgeCheck size={13} strokeWidth={2.25} className="shrink-0 text-primary" />
          )}
        </span>
        {followerCount !== undefined && (
          <span className="text-xs text-ink-faint">
            {formatCompact(followerCount)} người theo dõi
          </span>
        )}
      </Link>

      {!isSelf && (
        <button
          type="button"
          onClick={handleToggleFollow}
          disabled={pending}
          className={cn(
            "flex h-9 w-full cursor-pointer items-center justify-center rounded-full text-sm font-semibold transition-colors duration-150 ease-out disabled:cursor-default disabled:opacity-70",
            following
              ? "bg-surface-muted text-ink hover:bg-hover-bg"
              : "bg-primary text-white hover:bg-primary-hover",
          )}
        >
          {following ? "Đang theo dõi" : "Theo dõi"}
        </button>
      )}
    </div>
  );
}
