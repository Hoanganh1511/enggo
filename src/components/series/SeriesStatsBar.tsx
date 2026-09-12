import * as Icons from "lucide-react";
import { BadgeHelp, type LucideIcon } from "lucide-react";
import type { ContentSeriesStat, ContentSeriesExternalLink } from "@/lib/api/content-series";

// Icon la TEN STRING tu du lieu dong (Json field ben backend, xem
// ContentSeries.stats/externalLinks) - tra ve component qua bang lucide-react
// thay vi map thu cong tung ten, an toan fallback ve BadgeHelp neu ten sai/
// khong ton tai trong bo icon.
function resolveIcon(name?: string): LucideIcon {
  if (!name) return BadgeHelp;
  const icon = (Icons as unknown as Record<string, LucideIcon>)[name];
  return icon ?? BadgeHelp;
}

export function SeriesStatsBar({
  stats,
  externalLinks,
}: {
  stats: ContentSeriesStat[];
  externalLinks: ContentSeriesExternalLink[];
}) {
  if (stats.length === 0 && externalLinks.length === 0) return null;

  return (
    <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
      {stats.map((stat) => {
        const Icon = resolveIcon(stat.icon);
        const content = (
          <>
            <Icon size={15} className="text-ink-faint" aria-hidden="true" />
            <span className="font-semibold text-ink">{stat.value}</span>
            <span className="text-ink-faint">{stat.label}</span>
          </>
        );
        return stat.link ? (
          <a
            key={stat.label}
            href={stat.link}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-[13px] hover:text-ink"
          >
            {content}
          </a>
        ) : (
          <div key={stat.label} className="flex items-center gap-1.5 text-[13px]">
            {content}
          </div>
        );
      })}
      {externalLinks.map((link) => {
        const Icon = resolveIcon(link.icon);
        return (
          <a
            key={link.label}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-[13px] text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-ink"
          >
            <Icon size={14} aria-hidden="true" />
            {link.label}
          </a>
        );
      })}
    </div>
  );
}
