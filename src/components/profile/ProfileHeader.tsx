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
  MessageSquare,
  MoreHorizontal,
  Plus,
  Settings2,
} from "lucide-react";
import type { UserProfileData } from "@/content/user-profile";
import { formatCompact } from "@/lib/format-number";

function formatJoinDate(iso: string): string {
  const d = new Date(iso);
  return `tháng ${d.getMonth() + 1} năm ${d.getFullYear()}`;
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

// So lieu follow dang "so tren, nhan duoi" - can trai, tach khoi cum meta
// bang duong ke doc.
function CountItem({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex shrink-0 flex-col">
      <span className="text-lg font-bold leading-tight text-ink tabular-nums">
        {formatCompact(value)}
      </span>
      <span className="text-[11px] text-ink-muted">{label}</span>
    </div>
  );
}

// Header profile - anh bia TRAN VIEN (pha ra khoi padding cua MainContentArea
// bang -mx-6 -mt-4), avatar de len mep duoi anh bia, ten + cap do + huy hieu
// thanh vien cung 1 hang, cum nut hanh dong neo ben phai.
const ProfileHeader = ({ profile }: { profile: UserProfileData }) => {
  const [following, setFollowing] = useState(profile.isFollowing);

  return (
    <div className="-mx-6 -mt-4 bg-surface">
      {/* Anh bia */}
      <div className="relative h-40 w-full overflow-hidden bg-gradient-to-r from-primary/25 via-primary/10 to-transparent sm:h-48">
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

      <div className="px-6 pb-4">
        <div className="flex gap-4">
          <Image
            src={profile.avatarUrl}
            alt={profile.displayName}
            width={112}
            height={112}
            className="z-1 -mt-14 size-28 shrink-0 rounded-full border-4 border-surface object-cover"
          />

          <div className="min-w-0 flex-1 pt-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                {/* Ten + cap do + huy hieu thanh vien */}
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="truncate text-2xl font-bold tracking-tight text-ink">
                    {profile.displayName}
                  </h1>
                  {profile.isVerified && (
                    <BadgeCheck
                      size={18}
                      strokeWidth={2}
                      className="shrink-0 text-primary"
                    />
                  )}
                  <span className="shrink-0 rounded-sm bg-danger px-1.5 py-0.5 text-[10px] font-bold text-white">
                    LV{profile.level}
                  </span>
                  {profile.membershipLabel && (
                    <span className="shrink-0 rounded-sm bg-danger/12 px-2 py-0.5 text-[10px] font-semibold text-danger">
                      {profile.membershipLabel}
                    </span>
                  )}
                </div>

                {/* Hang dinh danh - UID cong khai (khong phai UUID noi bo) */}
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
                  <span>UID: {profile.publicUid}</span>
                  <span className="text-ink-faint">·</span>
                  <span>@{profile.username}</span>
                  {profile.location && (
                    <>
                      <span className="text-ink-faint">·</span>
                      <span>{profile.location}</span>
                    </>
                  )}
                </div>

                {profile.bio && (
                  <p className="mt-2.5 max-w-2xl text-sm leading-6 wrap-break-word text-ink">
                    {profile.bio}
                  </p>
                )}
              </div>

              {/* Cum hanh dong */}
              <div className="flex shrink-0 items-center gap-2">
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
                      onClick={() => setFollowing((v) => !v)}
                      className={`flex h-9 cursor-pointer items-center gap-1.5 rounded-md px-3.5 text-sm font-semibold transition-colors duration-150 ease-out ${
                        following
                          ? "border border-border text-ink-muted hover:bg-hover-bg"
                          : "bg-danger text-white hover:opacity-90"
                      }`}
                    >
                      {!following && <Plus size={14} strokeWidth={2.5} />}
                      {following ? "Đang theo dõi" : "Theo dõi"}
                    </button>
                    <button
                      type="button"
                      className="flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-border px-3 text-sm font-medium text-ink transition-colors duration-150 ease-out hover:bg-hover-bg"
                    >
                      <MessageSquare size={14} strokeWidth={1.75} />
                      Nhắn tin
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
          </div>
        </div>

        {/* Hang duoi: so lieu follow + cum meta nghe nghiep */}
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex items-center gap-6">
            <CountItem value={profile.followingCount} label="Đang theo dõi" />
            <CountItem value={profile.followerCount} label="Người theo dõi" />
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            {profile.role && (
              <MetaItem icon={Briefcase}>{profile.role}</MetaItem>
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
              Tham gia từ {formatJoinDate(profile.createdAt)}
            </MetaItem>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
