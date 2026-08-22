import Link from "next/link";
import { Plus } from "lucide-react";
import { hexToRgba } from "@/lib/utils";
import { GroupIconGlyph } from "@/components/workspaces/group-icons";
import type { ApiJourneyGroup } from "@/lib/api/types";

// Mau accent xoay theo index - tai dung dung tien le WORLD_ACCENT cua
// EditorialFeed.tsx (hardcoded hex + hexToRgba, khong bia token moi), CHI de
// phan biet cac the "chuong" ke nhau, khong dai dien y nghia gi rieng.
const CHAPTER_ACCENTS = [
  "#10b981",
  "#0ea5e9",
  "#8b5cf6",
  "#f59e0b",
  "#f43f5e",
];

export function ChapterCard({
  group,
  index,
  username,
}: {
  group: ApiJourneyGroup;
  index: number;
  username: string;
}) {
  const accent = CHAPTER_ACCENTS[index % CHAPTER_ACCENTS.length];

  return (
    <Link
      href={`/workspace/${username}/${group.workspaceId}`}
      className="flex w-56 shrink-0 snap-start flex-col gap-2"
    >
      <div
        className="flex h-28 w-full items-center justify-center rounded-lg"
        style={{
          background: `linear-gradient(135deg, ${hexToRgba(accent, 0.3)}, ${hexToRgba(accent, 0.1)})`,
        }}
      >
        <GroupIconGlyph
          name={group.icon}
          size={32}
          strokeWidth={1.5}
          className="text-current"
        />
      </div>
      <h3 className="line-clamp-1 text-base leading-snug font-semibold text-ink">
        {group.name}
      </h3>
      {group.description && (
        <p className="line-clamp-2 text-xs text-ink-faint">
          {group.description}
        </p>
      )}
      <div className="mt-auto flex items-center justify-between text-[11px] text-ink-muted">
        <span>{group.postCount} bài viết</span>
        <span className="font-semibold text-ink">
          {group.progressPercent}%
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-muted">
        <div
          className="h-full rounded-full"
          style={{ width: `${group.progressPercent}%`, background: accent }}
        />
      </div>
    </Link>
  );
}

// The trong-cuoi-hang: chua co nhom nao (0 nhom) hoac "them chuong moi" (cuoi
// hang khi da co >=1 nhom) - cung 1 khuon, khac nhau qua props text/href.
export function AddChapterCard({
  href,
  title,
  subtitle,
}: {
  href: string;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className="flex h-[198px] w-56 shrink-0 snap-start flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border text-center transition-colors duration-150 ease-out hover:border-border-strong hover:bg-surface-muted"
    >
      <span className="flex size-11 items-center justify-center rounded-full border border-border bg-surface">
        <Plus size={22} strokeWidth={2} className="text-ink-muted" />
      </span>
      <b className="text-sm font-semibold text-ink">{title}</b>
      <small className="px-4 text-[11px] leading-relaxed text-ink-faint">
        {subtitle}
      </small>
    </Link>
  );
}
