import Image from "next/image";
import Link from "next/link";
import { Compass, BadgeCheck, MessageCircle, FileText } from "lucide-react";

import type { Series } from "@/content/series-mock";
import {
  estimateDiscussionCount,
  estimateDocumentCount,
} from "@/content/community-mock";
import { formatCompact } from "@/lib/format-number";
import { cn } from "@/lib/utils";
import { ContentTile } from "../home-feed/ContentTile";
import { SeriesRewardRow } from "./SeriesRewardRow";
import { SeriesJoinButton } from "./SeriesJoinButton";

// The o trang "Đi cùng mọi người" - da doi ten tu SeriesCard: the nay gio
// dan toi /community/[slug] (xem quyet dinh 2026-08-03 trong
// docs/engineering-log.md) nen mang them 3 dong stat "level cong dong"
// (thanh vien/thao luan/tai lieu), khong chi con la "the series" thuan tuy.
// Van nhan prop `series: Series` (chua co model Community rieng cho danh
// sach nay) - 2 stat moi (thao luan/tai lieu) dung estimateDiscussionCount/
// estimateDocumentCount tu community-mock.ts de KHOP voi so hien o trang chi
// tiet Community cua chinh series do, khong tu bia cong thuc rieng o day.
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
  const previewTasks = series.todayTasks.slice(0, 2);
  const previewMembers = series.members.slice(0, 3);
  const discussionCount = estimateDiscussionCount(series);
  const documentCount = estimateDocumentCount(series);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Dan toi trang Community cua chinh series nay (khong con /series/[slug]
          cu) - xem quyet dinh trong docs/engineering-log.md. */}
      <Link
        href={`/community/${series.slug}`}
        className="flex flex-col gap-2 rounded-sm"
      >
        {/* Wrapper "relative" RIENG BEN NGOAI ContentTile (khong sua
            ContentTile.tsx - dung chung voi home-feed) de dat badge/avatar
            stack de len tren anh bia ma khong bi cat boi overflow-hidden cua
            chinh ContentTile. */}
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

          <div className="pointer-events-none absolute inset-x-2 top-2 flex items-start justify-between gap-1.5">
            {/* <span className="inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
              <span
                className={cn("size-1.5 rounded-full", difficulty.dotClass)}
              />
              {difficulty.label}
            </span> */}
            {/* <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
              <Clock size={10} strokeWidth={2.25} />
              {series.estimatedDurationDays} ngày
            </span> */}
          </div>

          {/* Gradient scrim + title - doi cho voi avatar stack (truoc day
              o day) theo yeu cau: tieu de gio de tren anh bia (kieu poster),
              avatar stack chuyen xuong thanh 1 dong thuong ben duoi anh. */}
          <div className="absolute inset-x-0 bottom-0 rounded-b-lg bg-linear-to-t from-black/70 to-transparent px-2 pt-8 pb-2">
            <h3 className="line-clamp-2 text-base leading-snug font-semibold text-white">
              {series.title}
            </h3>
          </div>
        </div>

        {/* Avatar stack + so luong thanh vien - truoc day de tren anh bia,
            gio la 1 dong thuong (xem comment o tren). */}
        {previewMembers.length > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="flex shrink-0 -space-x-1.5">
              {previewMembers.map((member) => (
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

        {/* 2 stat con lai "level cong dong" cua series - "thanh vien" da
            chuyen len dong avatar stack ngay tren (khong lap lai o day nua),
            xem comment dau file ve nguon estimateDiscussionCount/
            estimateDocumentCount. */}
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

        {previewTasks.length > 0 && (
          <div className="flex flex-col gap-1 pt-0.5">
            <p className="text-[11px] font-semibold text-ink">Hôm nay học</p>
            <ul className="flex flex-col gap-0.5">
              {previewTasks.map((task) => (
                <li
                  key={task.id}
                  className="line-clamp-1 text-[11px] text-ink-faint"
                >
                  • {task.label}
                </li>
              ))}
            </ul>
          </div>
        )}

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
      <div className="h-3 w-1/3 animate-pulse rounded bg-surface-muted" />
      <div className="h-1.5 w-full animate-pulse rounded-full bg-surface-muted" />
      <div className="h-3 w-1/2 animate-pulse rounded bg-surface-muted" />
      <div className="h-3 w-24 animate-pulse rounded bg-surface-muted" />
      <div className="h-8 w-full animate-pulse rounded-sm bg-surface-muted" />
    </div>
  );
}
