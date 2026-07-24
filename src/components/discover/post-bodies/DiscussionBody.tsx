"use client";

import { useState } from "react";
import { BarChart3, HelpCircle } from "lucide-react";
import type { Post } from "@/content/home-feed-mock";

type QuestionPost = Extract<Post, { kind: "question" }>;
type PollPost = Extract<Post, { kind: "poll" }>;

export function QuestionBody({ post }: { post: QuestionPost }) {
  return (
    <div className="mt-2">
      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
        <HelpCircle size={12} strokeWidth={2} />
        Question
      </span>
      <p className="mt-2 text-lg leading-snug font-semibold text-ink">
        {post.content}
      </p>
    </div>
  );
}

// Poll - interactive: bam 1 option se "vote" (local state, mock) va hien bar
// % cho tat ca option, khong the doi y sau khi da vote (giong UX pho bien).
export function PollBody({ post }: { post: PollPost }) {
  const [voted, setVoted] = useState<string | null>(null);
  const baseTotal = post.options.reduce((sum, o) => sum + o.votes, 0);
  const total = baseTotal + (voted ? 1 : 0);

  return (
    <div className="mt-2">
      <p className="text-base font-semibold text-ink">{post.question}</p>
      <div className="mt-2 flex flex-col gap-2">
        {post.options.map((option) => {
          const votes = option.votes + (voted === option.label ? 1 : 0);
          const percent = total > 0 ? Math.round((votes / total) * 100) : 0;
          return (
            <button
              key={option.label}
              type="button"
              disabled={!!voted}
              onClick={() => setVoted(option.label)}
              className="relative flex cursor-pointer items-center justify-between overflow-hidden rounded-lg border border-border px-3 py-2 text-sm font-medium text-ink transition-colors duration-150 ease-out hover:bg-hover-bg disabled:cursor-default"
            >
              {voted && (
                <span
                  className="absolute inset-y-0 left-0 bg-primary/10"
                  style={{ width: `${percent}%` }}
                />
              )}
              <span className="relative z-10">{option.label}</span>
              {voted && (
                <span className="relative z-10 text-xs font-semibold text-ink-muted">
                  {percent}%
                </span>
              )}
            </button>
          );
        })}
      </div>
      <p className="mt-1.5 flex items-center gap-1 text-xs text-ink-faint">
        <BarChart3 size={12} strokeWidth={1.75} />
        {total.toLocaleString("en-US")} lượt bình chọn
      </p>
    </div>
  );
}
