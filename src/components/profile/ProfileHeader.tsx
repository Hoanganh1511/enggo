"use client";

import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Settings2,
} from "lucide-react";
import { UserProfileApiShape } from "@/lib/api/users";
import ProfileContentWrap from "./ProfileContentWrap";

// Header profile - anh bia TRAN VIEN (pha ra khoi padding cua MainContentArea
// bang -mx-6 -mt-4), avatar de len mep duoi anh bia, ten + cap do + huy hieu
// thanh vien cung 1 hang, cum nut hanh dong neo ben phai. Trang thai follow
// (following/followerCount/pending) do ProfileShell so huu va truyen xuong -
// vi ProfileNav (hang tab) cung can hien followerCount, khong the moi noi tu
// quan ly rieng ma bi lech nhau.
const ProfileHeader = ({
  profile,
  following,
  pending,
  onToggleFollow,
}: {
  profile: UserProfileApiShape;
  following: boolean;
  pending: boolean;
  onToggleFollow: () => void;
}) => {
  return (
    <div className="-mt-4 bg-surface">
      {/* Anh bia - chua ca cum avatar/ten/uid/nut hanh dong, neo duoi qua
          gradient toi de chu/nut van doc duoc tren anh */}
      <div className="relative h-60 w-full overflow-hidden bg-gradient-to-r from-primary/25 via-primary/10 to-transparent sm:h-60">
        <Image
          src={profile.coverImageUrl || "/cover-profile-image-1.png"}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />

        <ProfileContentWrap className="absolute inset-x-0 bottom-0 pb-4">
          <div className="flex items-end gap-4">
            <Image
              src={profile.avatarUrl}
              alt={profile.displayName}
              width={96}
              height={96}
              className="size-24 shrink-0 rounded-full border-4 border-surface object-cover"
            />

            <div className="flex min-w-0 flex-1 items-start justify-between gap-3 pb-1">
              <div className="min-w-0">
                {/* Ten + cap do + huy hieu thanh vien */}
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="truncate text-2xl font-bold tracking-tight text-white drop-shadow-sm">
                    {profile.displayName}
                  </h1>
                  {profile.isVerified && (
                    <BadgeCheck
                      size={18}
                      strokeWidth={2}
                      fill="currentColor"
                      stroke="white"
                      className="shrink-0 text-sky-400"
                    />
                  )}
                  {/* <span className="shrink-0 rounded-sm bg-danger px-1.5 py-0.5 text-[10px] font-bold text-white">
                    LV{profile.level}
                  </span>
                  {profile.membershipLabel && (
                    <span className="shrink-0 rounded-sm bg-danger/12 px-2 py-0.5 text-[10px] font-semibold text-danger">
                      {profile.membershipLabel}
                    </span>
                  )} */}
                  {/* TODO: level/membershipLabel chua co trong API that */}
                </div>

                {/* Hang dinh danh - UID cong khai (khong phai UUID noi bo) */}
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/80">
                  {/* <span>UID: {profile.publicUid}</span>
                  <span className="text-white/50">·</span> */}
                  {/* TODO: publicUid chua co trong API that */}
                  <span>@{profile.username}</span>
                  {profile.location && (
                    <>
                      <span className="text-white/50">·</span>
                      <span>{profile.location}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Cum hanh dong - nen kinh mo (glass) de doc duoc tren anh bia */}
              <div className="flex shrink-0 items-center gap-2">
                {profile.isSelf ? (
                  <Link
                    href="/settings"
                    className="flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-white/30 bg-black/20 px-3 text-sm font-medium text-white backdrop-blur-sm transition-colors duration-150 ease-out hover:bg-black/35"
                  >
                    <Settings2 size={14} strokeWidth={1.75} />
                    Chỉnh sửa hồ sơ
                  </Link>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={onToggleFollow}
                      disabled={pending}
                      className={`flex h-9 cursor-pointer items-center gap-1.5 rounded-md px-3.5 text-sm font-semibold transition-colors duration-150 ease-out ${
                        following
                          ? "border border-white/30 bg-black/20 text-white backdrop-blur-sm hover:bg-black/35"
                          : "bg-primary text-white hover:opacity-90"
                      } ${pending ? "opacity-60 pointer-events-none" : ""}`}
                    >
                      {!following && <Plus size={14} strokeWidth={2.5} />}
                      {following ? "Đang theo dõi" : "Theo dõi"}
                    </button>
                    <button
                      type="button"
                      disabled
                      title="Sắp ra mắt"
                      className="flex h-9 cursor-not-allowed items-center gap-1.5 rounded-md border border-white/30 bg-black/20 px-3 text-sm font-medium text-white/70 backdrop-blur-sm"
                    >
                      <MessageSquare size={14} strokeWidth={1.75} />
                      Nhắn tin
                      <span className="ml-0.5 rounded-full bg-white/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white/80">
                        Sắp ra mắt
                      </span>
                    </button>
                  </>
                )}
                <button
                  type="button"
                  disabled
                  title="Sắp ra mắt"
                  className="relative flex size-9 cursor-not-allowed items-center justify-center rounded-md border border-white/30 bg-black/20 text-white/70 backdrop-blur-sm"
                >
                  <MoreHorizontal size={16} strokeWidth={1.75} />
                  <span className="absolute -right-1 -top-1 size-2 rounded-full bg-white/70" />
                </button>
              </div>
            </div>
          </div>
        </ProfileContentWrap>
      </div>

      {profile.bio && (
        <ProfileContentWrap className="pb-4 pt-4">
          <p className="max-w-2xl text-sm leading-6 wrap-break-word text-ink">
            {profile.bio}
          </p>
        </ProfileContentWrap>
      )}
    </div>
  );
};

export default ProfileHeader;
