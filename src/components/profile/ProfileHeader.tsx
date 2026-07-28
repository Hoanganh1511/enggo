"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  Briefcase,
  CalendarDays,
  Link2,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Settings2,
} from "lucide-react";
import type { UserProfileData } from "@/content/user-profile";
import { formatCompact } from "@/lib/format-number";

function formatJoinDate(iso: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

function MetaItem({
  icon: Icon,
  children,
}: {
  icon: typeof MapPin;
  children: React.ReactNode;
}) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-ink-muted">
      <Icon size={13} strokeWidth={1.75} className="shrink-0 text-ink-faint" />
      {children}
    </span>
  );
}

function CountItem({ value, label }: { value: number; label: string }) {
  return (
    <span className="flex items-baseline gap-1">
      <span className="text-sm font-semibold text-ink tabular-nums">
        {formatCompact(value)}
      </span>
      <span className="text-xs text-ink-muted">{label}</span>
    </span>
  );
}

// Phan dau trang profile: cover + avatar de len, ten/handle, bio, cum meta
// (role/noi o/website/ngay tham gia) va so lieu follow. Nut hanh dong doi
// theo "day co phai profile cua minh khong" (isSelf) - chinh chu thay
// "Chinh sua ho so", nguoi khac thay Follow/Nhan tin.
const ProfileHeader = ({ profile }: { profile: UserProfileData }) => {
  const [following, setFollowing] = useState(profile.isFollowing);

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      {/* Cover - fallback la dai gradient tone brand khi user chua dat anh */}
      <div className="relative h-36 w-full bg-gradient-to-r from-primary/25 via-primary/10 to-transparent sm:h-44">
        {profile.coverImageUrl && (
          <Image
            src={profile.coverImageUrl}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        )}
      </div>

      <div className="px-5 pb-5">
        {/* Avatar de len mep duoi cover, cung hang voi cum nut hanh dong */}
        <div className="flex items-end justify-between gap-3">
          <Image
            src={profile.avatarUrl}
            alt={profile.displayName}
            width={104}
            height={104}
            className="-mt-12 size-26 shrink-0 rounded-full border-4 border-surface object-cover"
          />

          <div className="flex shrink-0 items-center gap-2 pb-1">
            {profile.isSelf ? (
              <Link
                href="/settings"
                className="flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-border px-3 text-sm font-medium text-ink transition-colors duration-150 ease-out hover:bg-hover-bg"
              >
                <Settings2 size={14} strokeWidth={1.75} />
                Chỉnh sửa hồ sơ
              </Link>
            ) : (
              <>
                <button
                  type="button"
                  title="Nhắn tin"
                  className="flex size-9 cursor-pointer items-center justify-center rounded-md border border-border text-icon transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-icon-hover"
                >
                  <MessageCircle size={16} strokeWidth={1.75} />
                </button>
                <button
                  type="button"
                  onClick={() => setFollowing((v) => !v)}
                  className={`h-9 cursor-pointer rounded-md px-4 text-sm font-semibold transition-colors duration-150 ease-out ${
                    following
                      ? "border border-border text-ink-muted hover:bg-hover-bg"
                      : "bg-button-primary-bg text-white hover:bg-button-primary-hover"
                  }`}
                >
                  {following ? "Đang theo dõi" : "Theo dõi"}
                </button>
              </>
            )}
            <button
              type="button"
              title="Khác"
              className="flex size-9 cursor-pointer items-center justify-center rounded-md border border-border text-icon transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-icon-hover"
            >
              <MoreHorizontal size={16} strokeWidth={1.75} />
            </button>
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-center gap-1.5">
            <h1 className="truncate text-xl font-bold tracking-tight text-ink">
              {profile.displayName}
            </h1>
            {profile.isVerified && (
              <BadgeCheck
                size={17}
                strokeWidth={2}
                className="shrink-0 text-primary"
              />
            )}
          </div>
          <p className="text-sm text-ink-muted">
            @{profile.username}
            {profile.pronouns && (
              <span className="text-ink-faint"> · {profile.pronouns}</span>
            )}
          </p>
        </div>

        {profile.bio && (
          <p className="mt-3 max-w-2xl text-sm leading-6 wrap-break-word text-ink">
            {profile.bio}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {profile.role && (
            <MetaItem icon={Briefcase}>
              {profile.role}
              {profile.yearsOfExperience !== null &&
                ` · ${profile.yearsOfExperience} năm kinh nghiệm`}
            </MetaItem>
          )}
          {profile.location && (
            <MetaItem icon={MapPin}>{profile.location}</MetaItem>
          )}
          {profile.websiteUrl && (
            <MetaItem icon={Link2}>
              <a
                href={profile.websiteUrl}
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="text-primary hover:underline"
              >
                {profile.websiteUrl.replace(/^https?:\/\//, "")}
              </a>
            </MetaItem>
          )}
          <MetaItem icon={CalendarDays}>
            Tham gia {formatJoinDate(profile.createdAt)}
          </MetaItem>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-4">
          <CountItem value={profile.followingCount} label="Đang theo dõi" />
          <CountItem value={profile.followerCount} label="Người theo dõi" />
          <CountItem value={profile.postCount} label="Bài đăng" />
        </div>

        {profile.skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {profile.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-md border border-tag-border bg-tag-bg px-2 py-0.5 text-xs font-medium text-tag-text"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
