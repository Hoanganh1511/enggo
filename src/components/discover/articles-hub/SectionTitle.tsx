import { ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function SectionTitle({
  icon: Icon,
  title,
  sub,
  actionHref,
  actionLabel,
}: {
  icon?: LucideIcon;
  title: string;
  sub?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="mt-8 mb-4 flex items-end justify-between gap-4">
      <div className="flex min-w-0 items-center gap-2.5">
        {Icon && (
          <span className="text-[var(--primary)]">
            <Icon size={18} aria-hidden="true" />
          </span>
        )}
        <h2 className="text-[20px] font-bold tracking-[-.025em] text-[var(--foreground)]">
          {title}
        </h2>
        {sub && (
          <span className="hidden truncate text-[12px] text-[var(--muted)] md:block">{sub}</span>
        )}
      </div>
      {actionHref && actionLabel && (
        <a
          href={actionHref}
          className="flex shrink-0 items-center gap-1 text-[12px] text-[var(--muted)] transition hover:text-[var(--foreground)]"
        >
          {actionLabel}
          <ArrowRight size={14} aria-hidden="true" />
        </a>
      )}
    </div>
  );
}
