import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ContentTile } from "./ContentTile";

// Card cho section "Trending Topics" - khong phai post, ma la 1 Topic trong
// knowledge-worlds.ts kem so bai dem duoc trong tap posts da fetch. Dung
// chung khuon ContentTile (anh lon, gan khong vien) voi NoteCard.tsx de dong
// bo hinh anh toan trang, chi khac phan caption (worldLabel/description/count
// thay vi author/time). Bam vao dieu huong qua /home?topic=<slug> -
// HomeCategoryBar.tsx da tu doc param nay tu URL nen khong can dung/sua
// component do, chi tan dung URL dung chung.
export function TrendingTopicCard({
  slug,
  label,
  worldLabel,
  description,
  count,
  icon: Icon,
  accent,
}: {
  slug: string;
  label: string;
  worldLabel: string;
  description: string;
  count: number;
  icon: LucideIcon;
  accent: string;
}) {
  return (
    <Link
      href={`/home?topic=${slug}`}
      className="flex w-56 shrink-0 snap-start flex-col gap-2"
    >
      <ContentTile
        icon={Icon}
        accent={accent}
        className="aspect-1280/670 w-full"
        iconSize={32}
      />
      <div>
        <p className="text-[10px] font-medium tracking-wide text-ink-faint uppercase">
          {worldLabel}
        </p>
        <h3 className="text-sm font-semibold text-ink">{label}</h3>
      </div>
      <p className="line-clamp-2 text-xs text-ink-muted">{description}</p>
      <p className="text-xs font-medium text-ink-faint">{count} bài viết</p>
    </Link>
  );
}
