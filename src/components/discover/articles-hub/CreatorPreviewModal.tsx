"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck, FileText, MessageSquare, Users } from "lucide-react";
import { getUserProfileAction } from "@/actions/users/get-profile";
import {
  followUserAction,
  unfollowUserAction,
} from "@/actions/discover/follow-user";
import { createConversationAction } from "@/actions/chat/create-conversation";
import { formatCompact } from "@/lib/format-number";
import { cn } from "@/lib/utils";
import type { UserProfileApiShape } from "@/lib/api/users";

type LoadState = "loading" | "loaded" | "error";

// Bottom sheet "xem truoc tac gia" - mo khi bam avatar trong CreatorRail.tsx
// tren mobile (xem hook useIsMobileViewport o do). Fetch LAZY profile day du
// (bio/postCount/followerCount - CreatorSummary chi co 3 field gon, khong du
// de hien "thong tin co ban"), dung THANG followUserAction/
// createConversationAction that (cung he thong voi ArticleStickyAuthorBar.tsx,
// khong viet lai logic rieng). 3 nut xep DOC (khac ArticleStickyAuthorBar
// xep ngang) theo dung yeu cau: Theo dõi (dam), Nhắn tin (nhat), Xem trang
// ca nhan (ghost, dan toi /u/[username] han hoi).
//
// Component nay CHI la khung (backdrop + sheet chrome), khong tu fetch gi -
// noi dung THAT nam trong CreatorPreviewBody, mount qua `key={username}` khi
// username doi (remount hoan toan thay vi 1 effect theo doi thay doi de
// setState("loading") lai) - tranh loi ESLint `react-hooks/set-state-in-effect`
// ("Calling setState synchronously within an effect...") da gap voi
// SkillReportDetailModal truoc day (xem docs/engineering-log.md 2026-07-28,
// huong #4 "tach component con chi mount khi can").
export function CreatorPreviewModal({
  username,
  onClose,
}: {
  username: string | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {username && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-surface pb-[max(env(safe-area-inset-bottom),16px)] lg:hidden"
          >
            <div className="mx-auto mt-2.5 h-1 w-9 rounded-full bg-border" />
            <CreatorPreviewBody key={username} username={username} onClose={onClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function CreatorPreviewBody({
  username,
  onClose,
}: {
  username: string;
  onClose: () => void;
}) {
  const router = useRouter();
  // Khoi tao SAN la "loading" (khong can setState lai trong effect) - component
  // nay MOUNT MOI moi lan username doi (key o component cha) nen state ban
  // dau luon dung, effect chi con setState trong .then()/.catch() (khong bi
  // rule set-state-in-effect flag vi khong con dong bo dau effect nua).
  const [state, setState] = useState<LoadState>("loading");
  const [profile, setProfile] = useState<UserProfileApiShape | null>(null);
  const [following, setFollowing] = useState(false);
  const [followPending, setFollowPending] = useState(false);
  const [messaging, setMessaging] = useState(false);

  useEffect(() => {
    getUserProfileAction(username)
      .then((p) => {
        setProfile(p);
        setFollowing(p.isFollowing);
        setState("loaded");
      })
      .catch(() => setState("error"));
  }, [username]);

  async function handleToggleFollow() {
    const next = !following;
    setFollowing(next); // optimistic
    setFollowPending(true);
    try {
      await (next ? followUserAction(username) : unfollowUserAction(username));
    } catch {
      setFollowing(!next); // rollback neu API loi
    } finally {
      setFollowPending(false);
    }
  }

  async function handleMessage() {
    if (messaging) return;
    setMessaging(true);
    try {
      const conversation = await createConversationAction(username);
      onClose();
      router.push(`/messages?c=${conversation.id}`);
    } finally {
      setMessaging(false);
    }
  }

  if (state === "loading") {
    return (
      <div className="flex flex-col items-center gap-2 px-5 pt-5 pb-4">
        <div className="size-16 animate-pulse rounded-full bg-surface-muted" />
        <div className="h-4 w-32 animate-pulse rounded bg-surface-muted" />
      </div>
    );
  }

  if (state === "error" || !profile) {
    return (
      <p className="px-5 py-8 text-center text-sm text-ink-faint">
        Không tải được thông tin, thử lại sau.
      </p>
    );
  }

  return (
    <>
      <div className="flex flex-col items-center gap-2 px-5 pt-4 pb-2 text-center">
        <Image
          src={profile.avatarUrl}
          alt={profile.displayName}
          width={64}
          height={64}
          className="size-16 shrink-0 rounded-full object-cover"
        />
        <span className="flex items-center gap-1">
          <span className="text-base font-semibold text-ink">{profile.displayName}</span>
          {profile.isVerified && (
            <BadgeCheck size={14} strokeWidth={2.25} className="shrink-0 text-primary" />
          )}
        </span>
        {profile.username && (
          <span className="text-xs text-ink-faint">@{profile.username}</span>
        )}
        {profile.bio && (
          <p className="font-content mt-1 line-clamp-3 text-[13px] leading-relaxed text-ink-muted">
            {profile.bio}
          </p>
        )}
        <div className="mt-2 flex items-center gap-4 border-t border-border pt-3 text-xs text-ink-faint">
          <span className="flex items-center gap-1">
            <FileText size={13} strokeWidth={2} />
            {formatCompact(profile.postCount)} bài viết
          </span>
          <span className="flex items-center gap-1">
            <Users size={13} strokeWidth={2} />
            {formatCompact(profile.followerCount)} người theo dõi
          </span>
        </div>
      </div>

      {!profile.isSelf && (
        <div className="flex flex-col gap-2 px-5 pt-3">
          <button
            type="button"
            onClick={handleToggleFollow}
            disabled={followPending}
            className={cn(
              "flex h-11 w-full cursor-pointer items-center justify-center rounded-lg text-sm font-semibold transition-colors duration-150 ease-out disabled:cursor-default disabled:opacity-70",
              following
                ? "bg-surface-muted text-ink hover:bg-hover-bg"
                : "bg-primary text-white hover:bg-primary-hover",
            )}
          >
            {following ? "Đang theo dõi" : "Theo dõi"}
          </button>
          <button
            type="button"
            onClick={handleMessage}
            disabled={messaging}
            className="flex h-11 w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-surface-muted text-sm font-semibold text-ink transition-colors duration-150 ease-out hover:bg-hover-bg disabled:cursor-not-allowed disabled:opacity-60"
          >
            <MessageSquare size={15} strokeWidth={1.9} />
            Nhắn tin
          </button>
          <Link
            href={`/u/${username}`}
            onClick={onClose}
            className="flex h-11 w-full cursor-pointer items-center justify-center rounded-lg text-sm font-semibold text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg"
          >
            Xem trang cá nhân
          </Link>
        </div>
      )}
    </>
  );
}
