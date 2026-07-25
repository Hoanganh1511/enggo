import { CalendarDays, MapPin, TrendingUp } from "lucide-react";
import type { Post } from "@/content/home-feed-mock";
import { hexToRgba } from "@/lib/skill-tree/status-style";

type TutorialPost = Extract<Post, { kind: "tutorial" }>;
type ExperimentPost = Extract<Post, { kind: "experiment" }>;
type EventPost = Extract<Post, { kind: "event" }>;

// Tutorial/Guide - giong the "attachment" nhung co badge so buoc thay vi
// rating (khac Resource).
export function TutorialBody({ post }: { post: TutorialPost }) {
  return (
    <div className="mt-2 flex items-center gap-3 rounded-xl border border-border bg-surface-muted p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-hover-border hover:shadow-dropdown">
      <span
        className="flex size-14 shrink-0 items-center justify-center rounded-lg"
        style={{
          background: hexToRgba(post.accent, 0.15),
          color: post.accent,
        }}
      >
        <post.icon size={24} strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">{post.title}</p>
        <p className="mt-0.5 line-clamp-1 text-xs text-ink-faint">
          {post.description}
        </p>
      </div>
      <span className="shrink-0 rounded-full bg-tag-bg px-2 py-0.5 text-[11px] font-medium text-tag-text">
        {post.steps} bước
      </span>
    </div>
  );
}

// Experiment - dang hypothesis -> ket qua, ket qua duoc nhan manh bang the
// mau success rieng biet de bat mat hon phan gia thuyet.
export function ExperimentBody({ post }: { post: ExperimentPost }) {
  return (
    <div className="mt-2 rounded-xl border border-border p-4">
      <p className="text-sm font-semibold text-ink">{post.title}</p>
      <p className="mt-1 text-xs text-ink-faint">
        Giả thuyết: {post.hypothesis}
      </p>
      <div className="mt-2 flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-sm font-medium text-success">
        <TrendingUp size={16} strokeWidth={1.75} className="shrink-0" />
        {post.result}
      </div>
    </div>
  );
}

// Event/Announcement - the kieu "poster" nen tinh mau active, icon loa tron.
export function EventBody({ post }: { post: EventPost }) {
  return (
    <div className="mt-2 flex items-center gap-3 rounded-xl border border-active-border bg-active-bg p-4">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
        <CalendarDays size={20} strokeWidth={1.75} />
      </span>
      <div className="min-w-0">
        <p className="text-base font-semibold text-ink">{post.title}</p>
        <p className="text-sm text-ink-muted">{post.when}</p>
        {post.location && (
          <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-faint">
            <MapPin size={11} strokeWidth={1.75} className="shrink-0" />
            {post.location}
          </p>
        )}
      </div>
    </div>
  );
}
