"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, Check, MessageSquare, Plus, Settings, Share2 } from "lucide-react";
import { createConversationAction } from "@/actions/chat/create-conversation";
import { formatCompact } from "@/lib/format-number";
import { useProfileContext } from "./profile-context";

// Sidebar profile - redesign theo mockup "WriteHub" nguoi dung gui: cover
// banner + avatar de len tren, bio ngay duoi username (fallback "+ Thêm
// tiểu sử" khi chua co - CHI 1 field bio that, khong bia them field quote
// rieng), nut share (THAT - copy link ho so), card Magazine giu tinh than
// "Sắp ra mắt" cu nhung bo cuc lai. Cac dieu chinh avatar/cover/nut "Tạo
// mới" cua Magazine deu hien UI nhung disabled "Sắp có" vi CHUA co backend
// cap nhat profile that (xem docs/engineering-log.md quyet dinh
// 2026-09-10). Doc profile/following/pending/onToggleFollow qua
// useProfileContext() (ProfileShell.tsx la provider).
export function ProfileSidebar() {
  const { profile, following, pending, onToggleFollow } = useProfileContext();
  const router = useRouter();
  const [messaging, setMessaging] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleMessage() {
    if (!profile.username || messaging) return;
    setMessaging(true);
    try {
      const conversation = await createConversationAction(profile.username);
      router.push(`/messages?c=${conversation.id}`);
    } finally {
      setMessaging(false);
    }
  }

  async function handleShare() {
    if (typeof window === "undefined") return;
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/u/${profile.username}`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Trinh duyet tu choi quyen clipboard - im lang, khong phai loi nghiem trong.
    }
  }

  return (
    <aside className="flex w-full flex-col gap-4 lg:w-72 lg:shrink-0">
      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <div className="relative h-28 w-full sm:h-32">
          {profile.coverImageUrl ? (
            <Image
              src={profile.coverImageUrl}
              alt=""
              fill
              className="object-cover"
              sizes="288px"
            />
          ) : (
            <div className="size-full bg-gradient-to-br from-primary-soft via-primary-soft to-primary/20" />
          )}
          <button
            type="button"
            disabled
            title="Sắp có"
            className="absolute right-2 bottom-2 flex size-7 cursor-not-allowed items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm"
          >
            <Camera size={13} strokeWidth={2} />
          </button>
        </div>

        <div className="px-5 pb-5">
          <div className="relative -mt-10 inline-block">
            <Image
              src={profile.avatarUrl}
              alt={profile.displayName}
              width={72}
              height={72}
              className="size-18 shrink-0 rounded-full object-cover ring-4 ring-surface"
            />
            <button
              type="button"
              disabled
              title="Sắp có"
              className="absolute -right-1 -bottom-1 flex size-6 cursor-not-allowed items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm"
            >
              <Camera size={11} strokeWidth={2} />
            </button>
          </div>

          <h1 className="mt-3 text-lg font-bold text-ink">{profile.displayName}</h1>
          <p className="text-[13px] text-ink-faint">@{profile.username}</p>

          {profile.bio ? (
            <p className="mt-2 line-clamp-3 text-[13px] leading-5 text-ink-muted">
              {profile.bio}
            </p>
          ) : (
            profile.isSelf && (
              <Link
                href="/settings"
                className="mt-2 inline-block text-[13px] text-ink-faint hover:text-ink hover:underline"
              >
                + Thêm tiểu sử
              </Link>
            )
          )}

          <div className="mt-3 flex items-center gap-3 text-[13px]">
            <Link
              href={`/u/${profile.username}/following`}
              className="text-ink-muted hover:text-ink hover:underline"
            >
              <b className="text-ink">{formatCompact(profile.followingCount)}</b>{" "}
              Đang theo dõi
            </Link>
            <Link
              href={`/u/${profile.username}/followers`}
              className="text-ink-muted hover:text-ink hover:underline"
            >
              <b className="text-ink">{formatCompact(profile.followerCount)}</b>{" "}
              Người theo dõi
            </Link>
          </div>

          {profile.isSelf ? (
            <div className="mt-4 flex items-center gap-2">
              <Link
                href="/settings"
                className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-ink text-sm font-semibold text-surface transition-opacity duration-150 ease-out hover:opacity-90"
              >
                <Settings size={14} strokeWidth={2} />
                Chỉnh sửa hồ sơ
              </Link>
              <button
                type="button"
                onClick={handleShare}
                title="Chia sẻ hồ sơ"
                className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full border border-border text-ink transition-colors duration-150 ease-out hover:bg-hover-bg"
              >
                {copied ? (
                  <Check size={15} strokeWidth={2.2} className="text-primary" />
                ) : (
                  <Share2 size={15} strokeWidth={1.9} />
                )}
              </button>
            </div>
          ) : (
            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={onToggleFollow}
                disabled={pending}
                className={`flex h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full text-sm font-semibold transition-colors duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-60 ${
                  following
                    ? "border border-border text-ink hover:bg-hover-bg"
                    : "bg-primary text-on-primary hover:opacity-90"
                }`}
              >
                {!following && <Plus size={14} strokeWidth={2.5} />}
                {following ? "Đang theo dõi" : "Theo dõi"}
              </button>
              <button
                type="button"
                onClick={handleMessage}
                disabled={messaging}
                title="Nhắn tin"
                className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full border border-border text-ink transition-colors duration-150 ease-out hover:bg-hover-bg disabled:cursor-not-allowed disabled:opacity-60"
              >
                <MessageSquare size={15} strokeWidth={1.9} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-ink">Magazine</h3>
          <button
            type="button"
            disabled
            title="Sắp có"
            className="cursor-not-allowed text-xs font-semibold text-ink-faint"
          >
            + Tạo mới
          </button>
        </div>
        <p className="mt-2 text-[12px] leading-relaxed text-ink-faint">
          Gom các bài viết cùng chủ đề thành 1 tuyển tập riêng.
        </p>
        <span className="mt-2 inline-block rounded-full bg-active-bg px-2 py-0.5 text-[10px] font-bold tracking-wide text-primary">
          SẮP RA MẮT
        </span>
      </div>
    </aside>
  );
}
