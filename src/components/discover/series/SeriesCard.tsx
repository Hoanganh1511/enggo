import Image from "next/image";
import Link from "next/link";
import { Compass, Users, Clock, BadgeCheck } from "lucide-react";

import type { Series } from "@/content/series-mock";
import { SERIES_DIFFICULTY_META } from "@/lib/discover/series-meta";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";
import { ContentTile } from "../home-feed/ContentTile";
import { SeriesRewardRow } from "./SeriesRewardRow";
import { SeriesJoinButton } from "./SeriesJoinButton";

// The series o trang "Đi cùng mọi người". Dung lai ContentTile cua home-feed
// (anh bia that, hoac gradient theo accent + icon khi khong co anh) de cung
// ngon ngu hinh anh voi NoteCard thay vi bia them 1 kieu the moi.
//
// CAU TRUC: KHONG boc ca the trong 1 <Link> - nut hanh dong (SeriesJoinButton,
// co the la <button> mo modal hoac <Link> rieng) phai nam NGOAI link do (bug
// <a> long nhau da gap o AuthorLine/NoteCard truoc day, trinh duyet tu sua
// DOM lam vo vung bam).
export function SeriesCard({
  series,
  className,
}: {
  series: Series;
  className?: string;
}) {
  const difficulty = SERIES_DIFFICULTY_META[series.difficulty];

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Link
        href={`/series/${series.slug}`}
        className="flex flex-col gap-2 rounded-sm"
      >
        <ContentTile
          icon={Compass}
          accent={series.accent}
          imageUrl={series.coverImageUrl}
          alt={series.title}
          className="aspect-1280/670 w-full"
          iconSize={32}
        />

        <div className="flex items-center gap-2 text-[11px] font-medium">
          <span
            className={cn("inline-flex items-center gap-1", difficulty.textClass)}
          >
            <span className={cn("size-1.5 rounded-full", difficulty.dotClass)} />
            {difficulty.label}
          </span>
          <span className="inline-flex items-center gap-1 text-ink-faint">
            <Clock size={11} strokeWidth={2} />
            {series.estimatedDurationDays} ngày
          </span>
        </div>

        <h3 className="line-clamp-2 text-base leading-snug font-semibold text-ink">
          {series.title}
        </h3>
        <p className="line-clamp-2 text-xs leading-relaxed text-ink-faint">
          {series.description}
        </p>

        <div className="flex flex-col gap-1.5 pt-0.5">
          <ProgressBar percent={series.progressPercent} />
          <div className="flex items-center justify-between text-[11px] text-ink-muted">
            <span>
              Ngày {series.currentDay} / {series.estimatedDurationDays}
            </span>
            <span className="inline-flex items-center gap-1">
              <Users size={11} strokeWidth={2} />
              {series.memberCount.toLocaleString("vi-VN")}
            </span>
          </div>
        </div>
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
          <BadgeCheck size={11} strokeWidth={2.25} className="shrink-0 text-primary" />
        )}
      </Link>

      <SeriesRewardRow reward={series.reward} />

      <SeriesJoinButton series={series} className="w-full" />
    </div>
  );
}

export function SeriesCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="aspect-1280/670 w-full animate-pulse rounded-sm bg-surface-muted" />
      <div className="h-3 w-24 animate-pulse rounded bg-surface-muted" />
      <div className="h-4 w-full animate-pulse rounded bg-surface-muted" />
      <div className="h-4 w-2/3 animate-pulse rounded bg-surface-muted" />
      <div className="h-1.5 w-full animate-pulse rounded-full bg-surface-muted" />
      <div className="h-8 w-full animate-pulse rounded-sm bg-surface-muted" />
    </div>
  );
}
