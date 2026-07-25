"use client";

import { useRef, useState } from "react";
import {
  BadgeCheck,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Flame,
  PenLine,
  Users,
} from "lucide-react";
import { TRENDING_SKILLS, PEOPLE_TO_FOLLOW } from "@/content/home-feed-mock";
import { hexToRgba } from "@/lib/skill-tree/status-style";
import { getAvatarColor } from "@/lib/discover/avatar-color";
import Sparkline from "./Sparkline";

function formatCompact(n: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

// Vong tron % match - dung 1 mau primary duy nhat cho moi card (KHONG doi
// mau theo tung nguoi nhu anh mau, tranh cam giac "cau vong" khong chu dich).
function MatchRing({ percent }: { percent: number }) {
  const size = 40;
  const stroke = 3;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);
  return (
    <div className="relative flex size-10 shrink-0 items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-border"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="stroke-primary"
        />
      </svg>
      <span className="absolute text-[9px] font-bold text-ink tabular-nums">
        {percent}%
      </span>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <p className="text-sm font-semibold text-ink">{title}</p>
      <button
        type="button"
        className="cursor-pointer text-xs font-medium text-ink-faint transition-colors duration-150 ease-out hover:text-ink"
      >
        View all
      </button>
    </div>
  );
}

function FollowButton() {
  const [following, setFollowing] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setFollowing((v) => !v)}
      className={`h-7 w-full shrink-0 cursor-pointer rounded-md border text-xs font-medium transition-colors duration-150 ease-out ${
        following
          ? "border-border text-ink-muted hover:bg-hover-bg"
          : "border-follow-border bg-follow-bg text-primary hover:bg-follow-hover"
      }`}
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}

// Cot phai cua layout Trang chu - chi con 2 section theo yeu cau: Trending
// Knowledge (bang xep hang + sparkline) va People you may learn from (carousel
// cuon ngang). Dat trong layout dung chung 3 tab nen khong bi remount khi doi
// tab.
const HomeRightPanel = () => {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollByCard = (dir: 1 | -1) => {
    scrollerRef.current?.scrollBy({ left: dir * 200, behavior: "smooth" });
  };

  return (
    <aside className="flex w-140 shrink-0 flex-col gap-6 overflow-y-auto pl-6">
      <div className="rounded-lg border border-border bg-surface p-4">
        <SectionHeader title="Kiến thức được đề cập nhiều" />
        <div className="flex flex-col gap-3">
          {TRENDING_SKILLS.map((skill, i) => (
            <div key={skill.name} className="flex items-center gap-2.5">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-surface-muted text-[10px] font-semibold text-ink-faint tabular-nums">
                {i + 1}
              </span>
              <span
                className="flex size-8 shrink-0 items-center justify-center rounded-lg"
                style={{
                  background: hexToRgba(skill.accent, 0.15),
                  color: skill.accent,
                }}
              >
                <skill.icon size={15} strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-ink">
                  {skill.name}
                </p>
                <p className="text-[10px] text-ink-faint">
                  {skill.posts.toLocaleString("en-US")} saves · Trending #
                  {i + 1}
                </p>
              </div>
              <Sparkline values={skill.trend} color={skill.accent} />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-ink">Có thể bạn quan tâm</p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              className="flex size-6 cursor-pointer items-center justify-center rounded-full border border-border text-ink-faint transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-ink"
            >
              <ChevronLeft size={14} strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              className="flex size-6 cursor-pointer items-center justify-center rounded-full border border-border text-ink-faint transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-ink"
            >
              <ChevronRight size={14} strokeWidth={1.75} />
            </button>
          </div>
        </div>
        <div
          ref={scrollerRef}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1"
        >
          {PEOPLE_TO_FOLLOW.map((person) => (
            <div
              key={person.username}
              className="flex w-47 shrink-0 snap-start flex-col gap-4 rounded-xl border border-border bg-surface-muted p-4"
            >
              <div className="flex items-start gap-2.5">
                <span
                  className="flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ background: getAvatarColor(person.name) }}
                >
                  {person.name.charAt(0)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <p className="truncate text-xs font-semibold text-ink">
                      {person.name}
                    </p>
                    {person.verified && (
                      <BadgeCheck
                        size={12}
                        strokeWidth={2}
                        className="shrink-0 text-primary"
                      />
                    )}
                  </div>
                  <p className="truncate text-[10px] text-ink-faint">
                    @{person.username}
                  </p>
                  <p className="truncate text-[10px] text-ink-faint">
                    {person.role}
                  </p>
                </div>
                <MatchRing percent={person.matchPercent} />
              </div>

              <div className="flex flex-wrap gap-1">
                {person.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md border border-tag-border bg-tag-bg px-1.5 py-0.5 text-[10px] font-medium text-tag-text"
                  >
                    {tag}
                  </span>
                ))}
                {person.tags.length > 2 && (
                  <span className="rounded-md border border-tag-border bg-tag-bg px-1.5 py-0.5 text-[10px] font-medium text-tag-text">
                    +{person.tags.length - 2}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-border pt-3 text-[10px] text-ink-faint">
                <span className="flex items-center gap-1">
                  <PenLine size={11} strokeWidth={1.75} />
                  {person.posts}
                </span>
                <span className="flex items-center gap-1">
                  <Users size={11} strokeWidth={1.75} />
                  {formatCompact(person.followers)}
                </span>
                <span className="flex items-center gap-1">
                  <Flame size={11} strokeWidth={1.75} />
                  {person.helpfulPercent}%
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <FollowButton />
                <button
                  type="button"
                  title="Lưu"
                  className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md border border-border text-ink-faint transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-ink"
                >
                  <Bookmark size={13} strokeWidth={1.75} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="mt-3 w-full cursor-pointer text-center text-xs font-medium text-ink-faint transition-colors duration-150 ease-out hover:text-ink"
        >
          See more inspiring developers →
        </button>
      </div>
    </aside>
  );
};

export default HomeRightPanel;
