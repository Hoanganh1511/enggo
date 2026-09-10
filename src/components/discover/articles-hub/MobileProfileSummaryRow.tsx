import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { formatCompact } from "@/lib/format-number";
import type { UserProfileApiShape } from "@/lib/api/users";

// Mobile/tablet (<lg) - dong tom tat ho so CHINH CHU dang dang nhap (mockup
// man 2 "ĐỀ XUẤT"), thay the phan sidebar ho so von bien mat hoan toan tren
// man hinh nho o khu vuc dashboard. Chi render khi da dang nhap (page.tsx tu
// bo qua fetch/khong truyen prop neu chua co session) - khong bia du lieu.
export function MobileProfileSummaryRow({ profile }: { profile: UserProfileApiShape }) {
  return (
    <Link
      href={`/u/${profile.username}`}
      className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)] lg:hidden"
    >
      <div className="flex items-center gap-3">
        <Image
          src={profile.avatarUrl}
          alt={profile.displayName}
          width={40}
          height={40}
          className="size-10 shrink-0 rounded-full object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="font-content truncate text-sm font-bold text-[var(--foreground)]">
            {profile.displayName}
          </p>
          {profile.bio && (
            <p className="truncate text-[12px] text-[var(--muted)]">{profile.bio}</p>
          )}
        </div>
        <ChevronRight size={16} className="shrink-0 text-[var(--muted)]" />
      </div>
      <div className="flex items-center gap-4 text-[12px] text-[var(--muted)]">
        <span>
          <b className="text-[var(--foreground)]">{formatCompact(profile.followingCount)}</b> Đang
          theo dõi
        </span>
        <span>
          <b className="text-[var(--foreground)]">{formatCompact(profile.followerCount)}</b> Người
          theo dõi
        </span>
      </div>
    </Link>
  );
}
