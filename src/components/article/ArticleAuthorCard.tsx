"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import type { Author } from "@/content/home-feed-mock";
import type { UserProfileApiShape } from "@/lib/api/users";
import {
  followUserAction,
  unfollowUserAction,
} from "@/actions/discover/follow-user";
import { formatCompact } from "@/lib/format-number";
import { cn } from "@/lib/utils";
import { SOCIAL_LINKS } from "./article-social-links";

// Ban "day du" cua tac gia - dat SAU than bai (khac dong tac gia GON tren
// dau, ArticleHeader.tsx) vi day la luc doc gia da doc xong, nhieu kha nang
// muon biet them ve tac gia/theo doi hon la luc moi vao bai. Dung THANG
// followUserAction/unfollowUserAction that (cung he thong Follow voi
// ProfileShell.tsx) - khong phai toggle gia, vi backend da co san API nay.
// bio/followerCount lay tu getProfileByUsername (UserProfileApiShape that),
// optional vi profile co the fetch loi (.catch(() => null) o page.tsx).
export function ArticleAuthorCard({
  author,
  bio,
  followerCount,
  profile,
  isFollowing,
  isSelf,
}: {
  author: Author;
  bio?: string | null;
  followerCount?: number;
  // Rieng cho hang icon mang xa hoi - lay THANG tu UserProfileApiShape (xem
  // article-social-links.ts), optional vi profile co the fetch loi (.catch
  // (() => null) o page.tsx). bio/followerCount van truyen rieng nhu cu (2
  // cho khac deu doc tu profile, khong doi API goi tu page.tsx).
  profile?: UserProfileApiShape | null;
  isFollowing: boolean;
  isSelf: boolean;
}) {
  const [following, setFollowing] = useState(isFollowing);
  const [pending, setPending] = useState(false);
  // CHI hien nen tang tac gia DA dien - xem ghi chu goc o
  // ArticleStickyAuthorBar.tsx (nguoi dung doi tu "hien ca 6, mo di" sang
  // "chi hien cai co that").
  const activeSocialLinks = SOCIAL_LINKS.filter(({ key }) => profile?.[key]);

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

  return (
    // id lam target cho IntersectionObserver cua ArticleStickyAuthorBar.tsx
    // (thanh sticky dinh tren) - khi card THAT nay xuat hien trong viewport
    // thi thanh sticky tu an di, khong hien 2 noi cung luc.
    <div
      id="article-author-card"
      className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4"
    >
      <div className="flex items-start gap-3">
        <Link href={`/u/${author.username}`} className="shrink-0">
          <Image
            src={author.avatarUrl}
            alt={author.name}
            width={48}
            height={48}
            className="size-12 rounded-full object-cover"
          />
        </Link>
        <div className="font-content min-w-0 flex-1">
          <Link
            href={`/u/${author.username}`}
            className="flex items-center gap-1 hover:underline"
          >
            <span className="truncate text-base font-semibold text-ink">
              {author.name}
            </span>
            {author.verified && (
              <BadgeCheck size={14} strokeWidth={2.25} className="shrink-0 text-primary" />
            )}
          </Link>
          {followerCount !== undefined && (
            <p className="text-xs text-ink-faint">
              {formatCompact(followerCount)} người theo dõi
            </p>
          )}
        </div>
        {!isSelf && (
          <button
            type="button"
            onClick={handleToggleFollow}
            disabled={pending}
            className={cn(
              "flex h-8 shrink-0 cursor-pointer items-center rounded-md px-3.5 text-sm font-semibold transition-colors duration-150 ease-out disabled:cursor-default disabled:opacity-70",
              following
                ? "bg-surface-muted text-ink hover:bg-hover-bg"
                : "bg-primary text-white hover:bg-primary-hover",
            )}
          >
            {following ? "Đang theo dõi" : "Theo dõi"}
          </button>
        )}
      </div>
      {bio && (
        <p className="font-content text-sm leading-relaxed text-ink-muted">{bio}</p>
      )}

      {/* Hang icon mang xa hoi - ngang, CHI hien nen tang tac gia da dien
          (an han neu chua co, khong con mo icon nhu ban cu), theo mockup
          card tac gia cua note.com nguoi dung gui. */}
      {activeSocialLinks.length > 0 && (
        <div className="flex items-center gap-1 border-t border-border pt-3">
          {activeSocialLinks.map(({ key, label, icon: Icon }) => {
            const url = profile?.[key] as string;
            return (
              <a
                key={key}
                href={url}
                target="_blank"
                rel="noreferrer noopener"
                title={label}
                className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-full text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-ink"
              >
                <Icon size={16} strokeWidth={1.8} />
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
