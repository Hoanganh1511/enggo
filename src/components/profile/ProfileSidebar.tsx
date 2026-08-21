"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquare, MoreHorizontal, Plus, Settings } from "lucide-react";
import { createConversationAction } from "@/actions/chat/create-conversation";
import { formatCompact } from "@/lib/format-number";
import { useProfileContext } from "./profile-context";

// Sidebar profile - port layout note.com (anh chup nguoi dung gui): the
// avatar/ten/"..."/bio/stat-theo-doi/nut Theo doi hoac Chinh sua ho so, roi
// toi khoi "Magazine" (bo suu tap bai viet theo chu de do CHINH CHU tu gom) -
// KHONG co du lieu that cho khoi Magazine (khong co model nao ho tro nhom
// Post cua 1 user thanh cac "tuyen" dat ten - da khao sat truoc khi lam,
// Playlists/Collections hien tai CUNG la vo rong khong data that), nen chi
// la trang thai "Sắp ra mắt" trung thuc thay vi bia noi dung. Doc profile/
// following/pending/onToggleFollow qua useProfileContext() (ProfileShell.tsx
// la provider) thay vi nhan props - KHONG con giu nav doc (da chuyen sang
// ProfileTabBar.tsx, hang ngang tren dau main content nhu ban goc note.com).
export function ProfileSidebar() {
  const { profile, following, pending, onToggleFollow } = useProfileContext();
  const router = useRouter();
  const [messaging, setMessaging] = useState(false);

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

  return (
    <aside className="hidden w-72 shrink-0 flex-col gap-4 lg:flex">
      <div className="rounded-lg border border-border bg-surface p-5">
        <div className="flex items-start justify-between gap-2">
          <Image
            src={profile.avatarUrl}
            alt={profile.displayName}
            width={72}
            height={72}
            className="size-18 shrink-0 rounded-full object-cover"
          />
          <button
            type="button"
            disabled
            title="Sắp ra mắt"
            className="flex size-8 shrink-0 cursor-not-allowed items-center justify-center rounded-full text-ink-faint"
          >
            <MoreHorizontal size={18} strokeWidth={1.85} />
          </button>
        </div>

        <h1 className="mt-3 text-lg font-bold text-ink">
          {profile.displayName}
        </h1>

        {profile.bio && (
          <p className="mt-2 line-clamp-3 text-[13px] leading-5 text-ink-muted">
            {profile.bio}
          </p>
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
          <Link
            href="/settings"
            className="mt-4 flex h-10 w-full items-center justify-center gap-1.5 rounded-full bg-primary text-sm font-semibold text-on-primary transition-opacity duration-150 ease-out hover:opacity-90"
          >
            <Settings size={14} strokeWidth={2} />
            Chỉnh sửa hồ sơ
          </Link>
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

      <div className="rounded-lg border border-border bg-surface p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-ink">Magazine</h3>
          <span className="rounded-full bg-active-bg px-2 py-0.5 text-[10px] font-bold tracking-wide text-primary">
            SẮP RA MẮT
          </span>
        </div>
        <p className="mt-2 text-[12px] leading-relaxed text-ink-faint">
          Gom các bài viết cùng chủ đề thành 1 tuyển tập riêng.
        </p>
      </div>
    </aside>
  );
}
