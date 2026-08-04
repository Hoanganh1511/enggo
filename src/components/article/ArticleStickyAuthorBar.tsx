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

// Thanh ngang dinh duoi TopHeaderBar (fixed, KHONG phai sticky - xem ly do
// ben duoi) - HIEN THI THAY CHO ArticleAuthorCard.tsx (card tac gia day du o
// cuoi bai) trong luc nguoi doc dang cuon qua than bai ma CHUA cuon toi cho
// thay duoc card that o duoi: dung IntersectionObserver quan sat chinh
// element ArticleAuthorCard (qua id truyen vao) - khi card that xuat hien
// trong viewport thi tu an thanh nay di (khong hien 2 noi cung luc).
//
// TAI SAO "fixed" CHU KHONG "sticky": thu voi "sticky top-0" truoc, boc
// trong 1 wrapper "h-0" de luc an khong choan cho trong flex column cua
// page.tsx - nhung sticky CAN khong gian THAT trong container cha de co
// "cho" ma dinh lai, cha cao 0 khien no khong bao gio dinh duoc, chi troi
// theo trang roi bien mat luc cuon (day chinh la bug da gap). Vi component
// nay von da tu quyet dinh an/hien bang JS (IntersectionObserver) roi, "fixed"
// (dinh thang vao viewport, hoan toan ra khoi flow - mount/unmount khong lam
// xe layout ben duoi) don gian va chac chan hon nhieu so voi co ep "sticky"
// hoat dong dung trong 1 flex column dong.
//
// BIET TRUOC: thanh nay va ArticleAuthorCard.tsx deu tu quan state
// `following` RIENG - bam follow o 1 noi khong dong bo NGAY sang noi con
// lai, nhung vi 2 noi khong bao gio hien CUNG LUC (thanh nay tu an khi card
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
      { rootMargin: "-64px 0px 0px 0px" },
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

  // TopHeaderBar cao h-14 (3.5rem, xem main-content-area.tsx) - "top-14" dat
  // thanh nay ngay duoi header. "left-1/2 -translate-x-1/2 max-w-155" tu
  // canh giua trung voi cot noi dung cua page.tsx (fixed KHONG thua huong
  // duoc mx-auto cua cha vi da ra khoi flow, phai tu canh giua lai).
  return (
    <div className="fixed inset-x-0 top-14 z-20 flex justify-center px-4">
      <div className="flex w-full max-w-155 items-center gap-3 rounded-b-lg border border-t-0 border-border bg-surface/95 px-4 py-2.5 shadow-md backdrop-blur-sm">
        <Link
          href={`/u/${author.username}`}
          className="flex min-w-0 flex-1 items-center gap-2.5"
        >
          <Image
            src={author.avatarUrl}
            alt={author.name}
            width={32}
            height={32}
            className="size-8 shrink-0 rounded-full object-cover"
          />
          <span className="flex min-w-0 flex-col">
            <span className="flex items-center gap-1">
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
          </span>
        </Link>

        {!isSelf && (
          <button
            type="button"
            onClick={handleToggleFollow}
            disabled={pending}
            className={cn(
              "flex h-8 shrink-0 cursor-pointer items-center rounded-full px-3.5 text-sm font-semibold transition-colors duration-150 ease-out disabled:cursor-default disabled:opacity-70",
              following
                ? "bg-surface-muted text-ink hover:bg-hover-bg"
                : "bg-primary text-white hover:bg-primary-hover",
            )}
          >
            {following ? "Đang theo dõi" : "Theo dõi"}
          </button>
        )}
      </div>
    </div>
  );
}
