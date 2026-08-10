import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Hash, Lock, Users } from "lucide-react";
import type { ApiCommunitySummary } from "@/lib/api/types";
import { formatCompact } from "@/lib/format-number";
import { cn } from "@/lib/utils";
import { ContentTile } from "./home-feed/ContentTile";
import { CommunityJoinButton } from "./CommunityJoinButton";

const COMMUNITY_ACCENT = "#7c3aed"; // == --community-accent trong globals.css

// The 1 Community THAT o trang "Đi cùng mọi người" - port lai bo cuc cua
// CommunityCard.tsx cu (Series-based: anh bia/badge/avatar stack/nut hanh
// dong) nhung CHI dung field Community that co san. Khong con difficulty/
// duration/reward (Community khong co field tuong duong) - thay bang so kenh.
//
// QUAN TRONG - dieu huong vao cong dong: than the KHONG boc trong <Link>
// (khong click-card la vao thang) - vao cong dong CHI qua nut
// CommunityJoinButton theo rule chat: chua tham gia thi phai Tham gia (cong
// khai) / Xin tham gia (rieng tu) truoc, dang cho duyet thi khong vao duoc,
// da la thanh vien thi moi co nut "Vào cộng đồng". Chi link tac gia (toi
// trang /u/[username], KHONG phai vao cong dong) la ngoai le duy nhat.
export function CommunityDiscoveryCard({
  community,
  className,
}: {
  community: ApiCommunitySummary;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex flex-col gap-2">
        {/* Community khong co truong anh bia that (khac Series.coverImageUrl
            truoc day) - ContentTile tu fallback ve gradient + icon lon khi
            khong co imageUrl, giu duoc cam giac "cover" ma khong bia anh. */}
        <ContentTile
          icon={Users}
          accent={COMMUNITY_ACCENT}
          alt={community.name}
          className="aspect-1280/670 w-full"
          iconSize={32}
          sizes="240px"
        />

        <h3 className="line-clamp-2 text-base leading-snug font-semibold text-ink">
          {community.name}
        </h3>
        <p className="line-clamp-2 text-xs leading-relaxed text-ink-faint">
          {community.description}
        </p>

        {community.memberAvatars.length > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="flex shrink-0 -space-x-1.5">
              {community.memberAvatars.map((url, i) => (
                <Image
                  key={i}
                  src={url}
                  alt=""
                  width={18}
                  height={18}
                  className="size-4.5 shrink-0 rounded-full border border-surface object-cover"
                />
              ))}
            </div>
            <span className="truncate text-[11px] font-medium text-ink-muted">
              {formatCompact(community.memberCount)} thành viên
            </span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2 py-0.5 text-[11px] text-ink-muted">
            <Hash size={11} strokeWidth={2} />
            {community.channelCount} kênh
          </span>
          {!community.isPublic && (
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2 py-0.5 text-[11px] text-ink-muted">
              <Lock size={11} strokeWidth={2} />
              Riêng tư
            </span>
          )}
          {community.viewerStatus === "member" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-community-accent/10 px-2 py-0.5 text-[11px] font-medium text-community-accent">
              Đã tham gia
            </span>
          )}
        </div>
      </div>

      {/* Nguoi tao community - chi hien khi co du field (owner co the null neu
          bi xoa tai khoan, username co the null voi user rat cu chua duoc
          backfill). */}
      {community.owner?.username && (
        <Link
          href={`/u/${community.owner.username}`}
          className="flex min-w-0 items-center gap-1.5 text-[11px] text-ink-muted"
        >
          {community.owner.avatarUrl && (
            <Image
              src={community.owner.avatarUrl}
              alt={community.owner.name}
              width={16}
              height={16}
              className="size-4 shrink-0 rounded-full object-cover"
            />
          )}
          <span className="truncate font-medium text-ink">
            {community.owner.name}
          </span>
          {community.owner.verified && (
            <BadgeCheck
              size={11}
              strokeWidth={2.25}
              className="shrink-0 text-primary"
            />
          )}
        </Link>
      )}

      <CommunityJoinButton
        communityId={community.id}
        slug={community.slug}
        isPublic={community.isPublic}
        viewerStatus={community.viewerStatus}
        className="w-full"
      />
    </div>
  );
}

export function CommunityDiscoveryCardSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="aspect-1280/670 w-full animate-pulse rounded-lg bg-surface-muted" />
      <div className="h-4 w-full animate-pulse rounded bg-surface-muted" />
      <div className="h-4 w-2/3 animate-pulse rounded bg-surface-muted" />
      <div className="h-3 w-full animate-pulse rounded bg-surface-muted" />
      <div className="h-3 w-1/3 animate-pulse rounded bg-surface-muted" />
      <div className="h-8 w-full animate-pulse rounded-sm bg-surface-muted" />
    </div>
  );
}
