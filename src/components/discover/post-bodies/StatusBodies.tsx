import { Briefcase, Clock, Hexagon, Sparkles } from "lucide-react";
import type { Post } from "@/content/home-feed-mock";
import { hexToRgba } from "@/lib/skill-tree/status-style";

type AchievementPost = Extract<Post, { kind: "achievement" }>;
type MilestonePost = Extract<Post, { kind: "milestone" }>;
type CareerUpdatePost = Extract<Post, { kind: "career-update" }>;
type SkillUpdatePost = Extract<Post, { kind: "skill-update" }>;
type NodeCreatedPost = Extract<Post, { kind: "node-created" }>;
type KnowledgeBlockPost = Extract<Post, { kind: "knowledge-block" }>;
type TimelineEventPost = Extract<Post, { kind: "timeline-event" }>;

// Nhom "status" - cac cap nhat ngan gon, ban than layout da la noi dung
// (khong co doan van dai), moi loai co bo cuc rieng de nhan ra ngay.

export function AchievementBody({ post }: { post: AchievementPost }) {
  return (
    <div className="mt-2 flex flex-col items-center gap-2 rounded-xl border border-border bg-gradient-to-b from-warning/10 to-transparent py-6 text-center">
      <span
        className="flex size-14 items-center justify-center rounded-full"
        style={{
          background: hexToRgba(post.accent, 0.15),
          color: post.accent,
        }}
      >
        <post.icon size={28} strokeWidth={1.75} />
      </span>
      <p className="text-lg font-bold text-ink">{post.title}</p>
      <p className="text-sm text-ink-muted">{post.description}</p>
    </div>
  );
}

export function MilestoneBody({ post }: { post: MilestonePost }) {
  return (
    <>
      {post.content && (
        <p className="mt-1 text-[16px] wrap-break-word text-ink">
          {post.content}
        </p>
      )}
      <div className="mt-2 rounded-xl border border-border p-4">
        <p className="text-sm font-semibold text-ink">{post.title}</p>
        <div className="mt-3 grid grid-cols-3 divide-x divide-border">
          {post.items.map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center gap-0.5 px-2 text-center"
            >
              <span className="text-2xl font-bold text-primary tabular-nums">
                {item.value}
              </span>
              <span className="text-[11px] text-ink-faint">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export function CareerUpdateBody({ post }: { post: CareerUpdatePost }) {
  return (
    <div className="mt-2 flex items-center gap-3 rounded-xl border border-active-border bg-active-bg p-4">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
        <Briefcase size={20} strokeWidth={1.75} />
      </span>
      <div className="min-w-0">
        <p className="text-base font-semibold text-ink">
          Joined {post.company}
        </p>
        <p className="text-sm text-ink-muted">{post.role}</p>
      </div>
    </div>
  );
}

export function SkillUpdateBody({ post }: { post: SkillUpdatePost }) {
  return (
    <div className="mt-2 flex items-center gap-3 rounded-xl border border-border p-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Sparkles size={18} strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium tracking-wide text-ink-faint uppercase">
          Added Skill
        </p>
        <p className="text-sm font-semibold text-ink">{post.skill}</p>
      </div>
      <div className="flex shrink-0 gap-1">
        {Array.from({ length: post.maxLevel }).map((_, i) => (
          <span
            key={i}
            className={`h-2 w-4 rounded-full ${i < post.level ? "bg-primary" : "bg-border"}`}
          />
        ))}
      </div>
    </div>
  );
}

export function NodeCreatedBody({ post }: { post: NodeCreatedPost }) {
  return (
    <div className="mt-2 flex items-center gap-2.5 rounded-xl border border-border p-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Hexagon size={16} strokeWidth={1.75} />
      </span>
      <p className="text-sm text-ink-muted">
        Created <span className="font-semibold text-ink">{post.nodeName}</span>{" "}
        trong {post.blockName}
      </p>
    </div>
  );
}

export function KnowledgeBlockBody({ post }: { post: KnowledgeBlockPost }) {
  return (
    <div className="mt-2 flex items-center gap-3 rounded-xl border border-border p-3">
      <span
        className="flex size-10 shrink-0 items-center justify-center rounded-lg"
        style={{
          background: hexToRgba(post.accent, 0.15),
          color: post.accent,
        }}
      >
        <post.icon size={18} strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">{post.block}</p>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
          <div
            className="h-full rounded-full"
            style={{ width: `${post.progress}%`, background: post.accent }}
          />
        </div>
      </div>
      <span className="shrink-0 text-sm font-bold text-ink tabular-nums">
        {post.progress}%
      </span>
    </div>
  );
}

export function TimelineEventBody({ post }: { post: TimelineEventPost }) {
  return (
    <div className="mt-2 flex items-center gap-3 rounded-xl border-l-4 border-primary bg-surface-muted py-2.5 pr-3 pl-4">
      <Clock size={16} strokeWidth={1.75} className="shrink-0 text-primary" />
      <p className="text-sm font-medium text-ink">{post.event}</p>
    </div>
  );
}
