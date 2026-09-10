"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, Check, Loader2, MessageSquare, Plus, Settings, Share2, Signature } from "lucide-react";
import { createConversationAction } from "@/actions/chat/create-conversation";
import { useProfileImageUpload } from "@/lib/use-profile-image-upload";
import { formatCompact } from "@/lib/format-number";
import { useCurrentAvatarStore } from "@/stores/current-avatar-store";
import { UserAvatarImage } from "@/components/ui/user-avatar-image";
import { EditProfileModal } from "./EditProfileModal";
import { useProfileContext } from "./profile-context";

// Sidebar profile - redesign theo mockup "WriteHub" nguoi dung gui: cover
// banner + avatar de len tren, bio ngay duoi username (fallback "+ Thêm
// tiểu sử" khi chua co - CHI 1 field bio that, khong bia them field quote
// rieng), nut share (THAT - copy link ho so), card Magazine giu tinh than
// "Sắp ra mắt" cu nhung bo cuc lai. Doi avatar/cover THAT (upload qua S3 co
// san, POST /uploads kind=image - tai dung dung duong Composer.tsx dang
// dung - roi luu URL qua PATCH /users/me, logic dung chung qua
// useProfileImageUpload). Doc profile/following/pending/onToggleFollow/
// onProfileUpdate qua useProfileContext() (ProfileShell.tsx la provider).
export function ProfileSidebar() {
  const { profile, following, pending, onToggleFollow, onProfileUpdate } =
    useProfileContext();
  const router = useRouter();
  const [messaging, setMessaging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const avatarUpload = useProfileImageUpload("avatarUrl", (url) =>
    onProfileUpdate({ avatarUrl: url }),
  );
  const coverUpload = useProfileImageUpload("coverImageUrl", (url) =>
    onProfileUpdate({ coverImageUrl: url }),
  );
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const setCurrentAvatarUrl = useCurrentAvatarStore((s) => s.setAvatarUrl);

  // Tu "chua lanh" store header moi lan xem lai profile CUA CHINH MINH - phong
  // truong hop useSession().update() (best-effort, xem use-profile-image-
  // upload.ts) khong kip dong bo JWT truoc do (vd sau F5).
  useEffect(() => {
    if (profile.isSelf) setCurrentAvatarUrl(profile.avatarUrl);
  }, [profile.isSelf, profile.avatarUrl, setCurrentAvatarUrl]);

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
      {/* -mx-[var(--layout-padding)] tren mobile: keo card nay tran het ra 2
          mep man hinh (bo padding cua SectionContainer cha - ProfileShell.tsx
          - CHI cho rieng khung nay), dung tinh than mockup: anh bia tran vien,
          bo/khong bo tron/khong border tren mobile; tu lg tro len giu nguyen
          card binh thuong (mx-0, bo tron, co border) nhu truoc. */}
      <div className="-mx-[var(--layout-padding)] overflow-hidden bg-surface lg:mx-0 lg:rounded-lg lg:border lg:border-border">
        <div className="relative h-52 w-full sm:h-60 lg:h-32">
          {profile.coverImageUrl ? (
            <Image
              src={profile.coverImageUrl}
              alt=""
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 288px, 100vw"
            />
          ) : (
            <div className="size-full bg-gradient-to-br from-primary-soft via-primary-soft to-primary/20" />
          )}
          {coverUpload.isUploading && (
            <div className="cover-water-fill absolute inset-0 bg-black/15">
              <div className="absolute inset-0 grid place-items-center">
                <Loader2
                  size={22}
                  strokeWidth={2.2}
                  className="relative z-10 animate-spin text-white drop-shadow"
                />
              </div>
            </div>
          )}
          {profile.isSelf && (
            <>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) coverUpload.upload(file);
                }}
              />
              {/* Pill co chu (khop mockup) tren mobile, thu gon lai thanh nut
                  icon-only tren lg+ (card sidebar hep 288px, khong du cho chu). */}
              <button
                type="button"
                disabled={coverUpload.isUploading}
                title="Đổi ảnh bìa"
                onClick={() => coverInputRef.current?.click()}
                className="absolute right-3 bottom-3 flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-black/45 px-3.5 text-[13px] font-medium text-white backdrop-blur-sm hover:bg-black/60 disabled:cursor-not-allowed disabled:opacity-60 lg:right-2 lg:bottom-2 lg:size-7 lg:justify-center lg:px-0"
              >
                <Camera size={14} strokeWidth={2} className="shrink-0" />
                <span className="lg:hidden">Thay ảnh bìa</span>
              </button>
            </>
          )}
        </div>

        <div className="px-4 pb-5 sm:px-5">
          <div className="relative -mt-10 inline-block">
            <UserAvatarImage
              src={profile.avatarUrl}
              name={profile.displayName}
              size={72}
              className="size-18 ring-4 ring-surface"
            />
            {avatarUpload.isUploading && (
              <div className="absolute inset-0 grid size-18 place-items-center rounded-full bg-black/40">
                <Loader2 size={20} strokeWidth={2.2} className="animate-spin text-white" />
              </div>
            )}
            {profile.isSelf && (
              <>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (file) avatarUpload.upload(file);
                  }}
                />
                <button
                  type="button"
                  disabled={avatarUpload.isUploading}
                  title="Đổi ảnh đại diện"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute -right-1 -bottom-1 flex size-6 cursor-pointer items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Camera size={11} strokeWidth={2} />
                </button>
              </>
            )}
          </div>

          {(avatarUpload.error || coverUpload.error) && (
            <p className="mt-1 text-[11px] text-danger">
              {avatarUpload.error || coverUpload.error}
            </p>
          )}

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
                className="mt-2 inline-flex items-center gap-1.5 text-[13px] text-ink-faint hover:text-ink hover:underline"
              >
                <Signature size={15} strokeWidth={1.8} className="shrink-0" />
                Thêm tiểu sử
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
              <button
                type="button"
                onClick={() => setEditOpen(true)}
                className="flex h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-ink text-sm font-semibold text-surface transition-opacity duration-150 ease-out hover:opacity-90"
              >
                <Settings size={14} strokeWidth={2} />
                Chỉnh sửa hồ sơ
              </button>
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

      {profile.isSelf && (
        <EditProfileModal open={editOpen} onOpenChange={setEditOpen} />
      )}
    </aside>
  );
}
