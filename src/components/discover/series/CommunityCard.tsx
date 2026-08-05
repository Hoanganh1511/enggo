import Image from "next/image";
import Link from "next/link";
import {
  Compass,
  BadgeCheck,
  MessageCircle,
  FileText,
  Clock,
  BarChart3,
} from "lucide-react";

import type { Series } from "@/content/series-mock";
import {
  estimateDiscussionCount,
  estimateDocumentCount,
} from "@/content/community-mock";
import { SERIES_DIFFICULTY_META } from "@/lib/discover/series-meta";
import { formatCompact } from "@/lib/format-number";
import { cn } from "@/lib/utils";
import { ContentTile } from "../home-feed/ContentTile";
import { SeriesRewardRow } from "./SeriesRewardRow";
import { SeriesJoinButton } from "./SeriesJoinButton";

// Badge trang thai tren anh bia - CHI suy tu du lieu THAT co san (khong bia
// truong moi o backend): "AI HOT" neu type nhac AI, "NOI BAT" neu memberCount
// vuot nguong (dai dien duoc nhieu nguoi tin tuong theo). Series khong co
// truong createdAt rieng nen KHONG the tinh badge "MOI" trung thuc - bo qua
// loai badge do thay vi bia ngay tao gia.
const POPULAR_MEMBER_THRESHOLD = 1800;

function getSeriesBadge(
  series: Series,
): { label: string; className: string } | null {
  if (/\bAI\b/i.test(series.type)) {
    return { label: "🧠 AI HOT", className: "bg-teal-600" };
  }
  if (series.memberCount >= POPULAR_MEMBER_THRESHOLD) {
    return { label: "🔥 NỔI BẬT", className: "bg-rose-600" };
  }
  return null;
}

// The o trang "Đi cùng mọi người" - da doi ten tu SeriesCard: the nay gio
// dan toi /community/[slug] (xem quyet dinh 2026-08-03 trong
// docs/engineering-log.md) nen mang them 3 dong stat "level cong dong"
// (thanh vien/thao luan/tai lieu), khong chi con la "the series" thuan tuy.
//
// CAU TRUC: KHONG boc ca the trong 1 <Link> - nut hanh dong (SeriesJoinButton,
// co the la <button> mo modal hoac <Link> rieng) phai nam NGOAI link do (bug
// <a> long nhau da gap o AuthorLine/NoteCard truoc day, trinh duyet tu sua
// DOM lam vo vung bam).
export function CommunityCard({
  series,
  className,
}: {
  series: Series;
  className?: string;
}) {
  const discussionCount = estimateDiscussionCount(series);
  const documentCount = estimateDocumentCount(series);
  const badge = getSeriesBadge(series);
  const difficulty = SERIES_DIFFICULTY_META[series.difficulty];

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Dan toi trang Community cua chinh series nay (khong con /series/[slug]
          cu) - xem quyet dinh trong docs/engineering-log.md. */}
      <Link
        target="_blank"
        href={`/community/${series.slug}`}
        className="flex flex-col gap-2 rounded-sm"
      >
        {/* Wrapper "relative" RIENG BEN NGOAI ContentTile (khong sua
            ContentTile.tsx - dung chung voi home-feed) de dat badge de len
            tren anh bia ma khong bi cat boi overflow-hidden cua chinh
            ContentTile. */}
        <div className="relative">
          <ContentTile
            icon={Compass}
            accent={series.accent}
            imageUrl={series.coverImageUrl}
            alt={series.title}
            className="aspect-1280/670 w-full"
            iconSize={32}
            sizes="240px"
          />

          {badge && (
            <span
              className={cn(
                "absolute top-2 left-2 rounded-full px-2 py-1 text-[10px] font-semibold text-white",
                badge.className,
              )}
            >
              {badge.label}
            </span>
          )}
        </div>

        <h3 className="line-clamp-2 text-base leading-snug font-semibold text-ink">
          {series.title}
        </h3>
        <p className="line-clamp-2 text-xs leading-relaxed text-ink-faint">
          {series.description}
        </p>

        {series.members.length > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="flex shrink-0 -space-x-1.5">
              {series.members.slice(0, 3).map((member) => (
                <Image
                  key={member.id}
                  src={member.avatarUrl}
                  alt={member.name}
                  width={18}
                  height={18}
                  className="size-4.5 shrink-0 rounded-full border border-surface object-cover"
                />
              ))}
            </div>
            <span className="truncate text-[11px] font-medium text-ink-muted">
              {formatCompact(series.memberCount)} thành viên
            </span>
          </div>
        )}

        {/* Chip thoi luong + cap do - dung mau ban gio (dotClass) da co san
            trong SERIES_DIFFICULTY_META, khong bia mau moi. */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2 py-0.5 text-[11px] text-ink-muted">
            <Clock size={11} strokeWidth={2} />
            {series.estimatedDurationDays} ngày
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2 py-0.5 text-[11px] text-ink-muted">
            <BarChart3
              size={11}
              strokeWidth={2}
              className={difficulty.textClass}
            />
            Cấp độ: {difficulty.label}
          </span>
        </div>

        {/* 2 stat "level cong dong" cua series - "thanh vien" da hien o
            dong avatar stack o tren, khong lap lai o day nua. */}
        <div className="flex flex-col gap-1 text-[11px] text-ink-muted">
          <span className="inline-flex items-center gap-1.5">
            <MessageCircle
              size={12}
              strokeWidth={2}
              className="shrink-0 text-ink-faint"
            />
            {formatCompact(discussionCount)} cuộc thảo luận
          </span>
          <span className="inline-flex items-center gap-1.5">
            <FileText
              size={12}
              strokeWidth={2}
              className="shrink-0 text-ink-faint"
            />
            {formatCompact(documentCount)} tài liệu
          </span>
        </div>

        <SeriesRewardRow reward={series.reward} className="pt-0.5" />
      </Link>

      {/* Nguoi tao series - diem khac ban truoc: series khong phai noi dung he
          thong bien soan ma do chinh nguoi dung tao ra. */}
      <Link
        href={`/u/${series.author.username}`}
        className="flex min-w-0 items-center gap-1.5 text-[11px] text-ink-muted"
      >
        <Image
          src={series.author.avatarUrl}
          alt={series.author.name}
          width={16}
          height={16}
          className="size-4 shrink-0 rounded-full object-cover"
        />
        <span className="truncate font-medium text-ink">
          {series.author.name}
        </span>
        {series.author.verified && (
          <BadgeCheck
            size={11}
            strokeWidth={2.25}
            className="shrink-0 text-primary"
          />
        )}
      </Link>

      <SeriesJoinButton series={series} className="w-full" />
    </div>
  );
}

export function CommunityCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="aspect-1280/670 w-full animate-pulse rounded-lg bg-surface-muted" />
      <div className="h-4 w-full animate-pulse rounded bg-surface-muted" />
      <div className="h-4 w-2/3 animate-pulse rounded bg-surface-muted" />
      <div className="h-3 w-full animate-pulse rounded bg-surface-muted" />
      <div className="h-3 w-1/3 animate-pulse rounded bg-surface-muted" />
      <div className="h-3 w-1/2 animate-pulse rounded bg-surface-muted" />
      <div className="h-3 w-24 animate-pulse rounded bg-surface-muted" />
      <div className="h-8 w-full animate-pulse rounded-sm bg-surface-muted" />
    </div>
  );
}
