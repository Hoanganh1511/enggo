"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  ExternalLink,
  FileText,
  MessageSquare,
  Plus,
  Rss,
  Users,
  X,
} from "lucide-react";
import type { Author } from "@/content/home-feed-mock";
import type { UserProfileApiShape } from "@/lib/api/users";
import {
  followUserAction,
  unfollowUserAction,
} from "@/actions/discover/follow-user";
import { createConversationAction } from "@/actions/chat/create-conversation";
import { formatCompact } from "@/lib/format-number";
import { cn } from "@/lib/utils";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  YoutubeIcon,
} from "@/components/ui/social-icons";

// Cac nen tang mang xa hoi hien trong card - lay THANG tu UserProfileApiShape
// (career-tree-api, cung ten field voi EditProfileModal.tsx) nen khong can
// mapper rieng. Icon mo + khong bam duoc + co tooltip khi tac gia CHUA dien
// (url null) - thay vi an han di, cho nguoi xem biet nen tang nao co the co
// nhung tac gia nay chua cap nhat, dung tinh than "Icon mờ đi nếu tác giả
// chưa cập nhật" trong mockup.
const SOCIAL_LINKS = [
  { key: "twitterUrl", label: "X (Twitter)", icon: X },
  { key: "facebookUrl", label: "Facebook", icon: FacebookIcon },
  { key: "instagramUrl", label: "Instagram", icon: InstagramIcon },
  { key: "youtubeUrl", label: "YouTube", icon: YoutubeIcon },
  { key: "linkedinUrl", label: "LinkedIn", icon: LinkedinIcon },
  { key: "rssUrl", label: "RSS", icon: Rss },
] as const satisfies readonly { key: keyof UserProfileApiShape; label: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }> }[];

// Card tac gia thu nho - DINH (sticky) o cot TRAI, doi dien voi ArticleSidebar
// (Muc luc/Bai viet lien quan) o cot phai, theo yeu cau nguoi dung ("đổi vị
// trí sticky... sang trái đối diện với toc"). 2 cot TRAI/PHAI deu la cot
// that trong bo cuc 3-cot cua page.tsx nen dung "sticky" binh thuong duoc.
// CHI hien tu lg+ (page.tsx dung "hidden lg:block" tren aside boc ngoai) -
// tren mobile khong co cho cho 1 cot rieng, thanh hanh dong dinh duoi cung
// (ArticleActionBar sticky) da dam nhiem vai tro "luon thay duoc" o do roi.
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
  profile,
  isFollowing,
  isSelf,
  authorCardId,
}: {
  author: Author;
  // Lay them bio/postCount/social links - optional vi profile co the fetch
  // loi (.catch(() => null) o page.tsx), card van hien duoc phan con lai
  // (avatar/ten/follow) khi thieu.
  profile?: UserProfileApiShape | null;
  isFollowing: boolean;
  isSelf: boolean;
  // id cua ArticleAuthorCard that o duoi trang - dung lam target quan sat.
  authorCardId: string;
}) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [following, setFollowing] = useState(isFollowing);
  const [pending, setPending] = useState(false);
  const [messaging, setMessaging] = useState(false);

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

  async function handleMessage() {
    if (messaging) return;
    setMessaging(true);
    try {
      const conversation = await createConversationAction(author.username);
      router.push(`/messages?c=${conversation.id}`);
    } finally {
      setMessaging(false);
    }
  }

  if (!visible) return null;

  return (
    <div className="sticky top-20 flex flex-col gap-4 rounded-lg border border-border bg-surface p-4 text-center">
      <Link href={`/u/${author.username}`} className="flex flex-col items-center gap-2">
        <Image
          src={author.avatarUrl}
          alt={author.name}
          width={64}
          height={64}
          className="size-16 shrink-0 rounded-full object-cover"
        />
        <span className="flex min-w-0 items-center gap-1">
          <span className="truncate text-sm font-semibold text-ink">{author.name}</span>
          {author.verified && (
            <BadgeCheck size={13} strokeWidth={2.25} className="shrink-0 text-primary" />
          )}
        </span>
        <span className="truncate text-xs text-ink-faint">@{author.username}</span>
      </Link>

      {profile?.bio && (
        <p className="font-content text-left text-[13px] leading-relaxed text-ink-muted">
          {profile.bio}
        </p>
      )}

      {!isSelf && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleFollow}
            disabled={pending}
            className={cn(
              "flex h-9 flex-1 cursor-pointer items-center justify-center gap-1 rounded-full text-sm font-semibold transition-colors duration-150 ease-out disabled:cursor-default disabled:opacity-70",
              following
                ? "bg-surface-muted text-ink hover:bg-hover-bg"
                : "bg-primary text-white hover:bg-primary-hover",
            )}
          >
            {!following && <Plus size={14} strokeWidth={2.5} />}
            {following ? "Đang theo dõi" : "Theo dõi"}
          </button>
          <button
            type="button"
            onClick={handleMessage}
            disabled={messaging}
            title="Nhắn tin"
            className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full border border-border text-ink transition-colors duration-150 ease-out hover:bg-hover-bg disabled:cursor-not-allowed disabled:opacity-60"
          >
            <MessageSquare size={15} strokeWidth={1.9} />
          </button>
        </div>
      )}

      <div className="flex flex-col gap-0.5 border-t border-border pt-3">
        {SOCIAL_LINKS.map(({ key, label, icon: Icon }) => {
          const url = profile?.[key] as string | null | undefined;
          if (url) {
            return (
              <a
                key={key}
                href={url}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center gap-2.5 rounded-md px-1.5 py-1.5 text-left text-[13px] text-ink transition-colors duration-150 ease-out hover:bg-hover-bg"
              >
                <Icon size={14} strokeWidth={1.8} className="shrink-0 text-ink-muted" />
                <span className="flex-1 truncate">{label}</span>
                <ExternalLink size={12} strokeWidth={1.8} className="shrink-0 text-ink-faint" />
              </a>
            );
          }
          return (
            <span
              key={key}
              title="Icon mờ đi nếu tác giả chưa cập nhật"
              className="flex cursor-not-allowed items-center gap-2.5 rounded-md px-1.5 py-1.5 text-left text-[13px] text-ink-faint/50"
            >
              <Icon size={14} strokeWidth={1.8} className="shrink-0" />
              <span className="flex-1 truncate">{label}</span>
              <ExternalLink size={12} strokeWidth={1.8} className="shrink-0" />
            </span>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-border pt-3">
        <div className="flex flex-col items-center gap-0.5">
          <span className="flex items-center gap-1 text-sm font-bold text-ink">
            <FileText size={12} strokeWidth={2} className="text-ink-faint" />
            {formatCompact(profile?.postCount ?? 0)}
          </span>
          <span className="text-[11px] text-ink-faint">Bài viết</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="flex items-center gap-1 text-sm font-bold text-ink">
            <Users size={12} strokeWidth={2} className="text-ink-faint" />
            {formatCompact(profile?.followerCount ?? 0)}
          </span>
          <span className="text-[11px] text-ink-faint">Người theo dõi</span>
        </div>
      </div>
    </div>
  );
}
