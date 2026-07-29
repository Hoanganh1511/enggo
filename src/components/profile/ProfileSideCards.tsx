"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  Code2,
  Flame,
  GemIcon,
  Link2,
  Sparkles,
  Trophy,
} from "lucide-react";
import type {
  CareerSnapshot,
  MiniUser,
  ProfileBadge,
  ProfileCollection,
  ProfileLink,
} from "@/content/user-profile";
import Hex3DBadge from "@/components/skill-tree/Hex3DBadge";
import { formatCompact } from "@/lib/format-number";

// Khung chung cho moi the o cot phai: tieu de trai, so lieu/hanh dong phai.
function SideCard({
  title,
  meta,
  children,
}: {
  title: string;
  meta?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-ink">{title}</h2>
        {meta}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

// --- Thong ke ---------------------------------------------------------------
// Co y KHONG ve bieu do: day la vai con so roi rac, dang hero number + stat
// tile doc nhanh hon. Moi con so mac token chu (text-ink), khong to mau theo
// series - mau chi danh cho huy hieu/entity.
function StatTile({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Flame;
  value: string;
  label: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-md border border-border bg-surface-muted p-2.5">
      <Icon size={14} strokeWidth={1.75} className="text-ink-faint" />
      <span className="text-base font-bold text-ink tabular-nums">{value}</span>
      <span className="text-[10px] leading-tight text-ink-muted">{label}</span>
    </div>
  );
}

export function StatsCard({ career }: { career: CareerSnapshot }) {
  return (
    <SideCard
      title="Thống kê"
      meta={
        <span className="rounded-md border border-active-border bg-active-bg px-2 py-0.5 text-[11px] font-semibold text-primary">
          {career.percentile}
        </span>
      }
    >
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-bold tracking-tight text-ink tabular-nums">
          {career.careerScore}
        </span>
        <span className="text-xs text-ink-faint">/100</span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <StatTile
          icon={Sparkles}
          value={String(career.skillsMastered)}
          label="Kỹ năng thành thạo"
        />
        <StatTile
          icon={GemIcon}
          value={String(career.totalBlocks)}
          label="Knowledge Block"
        />
        <StatTile
          icon={Flame}
          value={String(career.streakDays)}
          label="Ngày liên tiếp"
        />
      </div>
    </SideCard>
  );
}

// --- Gioi thieu ban than ----------------------------------------------------
export function AboutCard({
  paragraphs,
  links,
}: {
  paragraphs: string[];
  links: ProfileLink[];
}) {
  if (paragraphs.length === 0 && links.length === 0) return null;

  return (
    <SideCard title="Giới thiệu bản thân">
      {paragraphs.map((p, i) => (
        <p key={i} className="mb-1.5 text-sm leading-6 wrap-break-word text-ink">
          {p}
        </p>
      ))}

      {links.length > 0 && (
        <div className="mt-3 flex flex-col gap-2">
          {links.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="flex items-center gap-2 text-xs text-primary hover:underline"
            >
              {link.kind === "github" ? (
                <Code2 size={14} strokeWidth={1.75} className="shrink-0 text-ink-faint" />
              ) : (
                <Link2 size={14} strokeWidth={1.75} className="shrink-0 text-ink-faint" />
              )}
              <span className="truncate">{link.label}</span>
            </a>
          ))}
        </div>
      )}
    </SideCard>
  );
}

// --- Huy hieu ---------------------------------------------------------------
export function BadgesCard({
  badges,
  total,
}: {
  badges: ProfileBadge[];
  total: number;
}) {
  if (badges.length === 0) return null;

  return (
    <SideCard
      title="Huy hiệu"
      meta={
        <span className="text-sm font-semibold text-ink tabular-nums">
          {total}
        </span>
      }
    >
      <div className="flex flex-wrap gap-2">
        {badges.map((badge) => (
          <span key={badge.id} title={badge.label}>
            <Hex3DBadge size={40} colorHex={badge.color} sparkle={false}>
              <Trophy size={15} strokeWidth={2} />
            </Hex3DBadge>
          </span>
        ))}
      </div>
    </SideCard>
  );
}

// --- Dang theo doi / Nguoi theo doi ----------------------------------------
export function ConnectionsCard({
  title,
  count,
  users,
}: {
  title: string;
  count: number;
  users: MiniUser[];
}) {
  return (
    <SideCard
      title={title}
      meta={
        <span className="text-sm font-semibold text-ink tabular-nums">
          {formatCompact(count)}
        </span>
      }
    >
      <div className="flex items-center gap-2">
        {users.map((user) => (
          <Link
            key={user.username}
            href={`/u/${user.username}`}
            title={user.displayName}
            className="shrink-0"
          >
            <Image
              src={user.avatarUrl}
              alt={user.displayName}
              width={44}
              height={44}
              className="size-11 rounded-full object-cover transition-opacity duration-150 ease-out hover:opacity-80"
            />
          </Link>
        ))}
        <button
          type="button"
          title="Xem tất cả"
          className="ml-auto flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border text-ink-faint transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-ink"
        >
          <ChevronRight size={14} strokeWidth={1.75} />
        </button>
      </div>
    </SideCard>
  );
}

// --- Bo suu tap -------------------------------------------------------------
export function CollectionsCard({
  collections,
}: {
  collections: ProfileCollection[];
}) {
  if (collections.length === 0) return null;

  return (
    <SideCard title="Bộ sưu tập yêu thích">
      <div className="flex flex-col gap-3">
        {collections.map((c) => (
          <button
            key={c.id}
            type="button"
            className="flex cursor-pointer items-center gap-3 text-left"
          >
            <Image
              src={c.thumbnailUrl}
              alt=""
              width={72}
              height={44}
              className="h-11 w-18 shrink-0 rounded-md object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-ink">{c.title}</p>
              <p className="mt-0.5 text-[11px] text-ink-faint tabular-nums">
                {c.itemCount} mục
              </p>
            </div>
          </button>
        ))}
      </div>

      <button
        type="button"
        className="mt-3 cursor-pointer text-xs font-medium text-primary transition-colors duration-150 ease-out hover:underline"
      >
        Xem tất cả
      </button>
    </SideCard>
  );
}
