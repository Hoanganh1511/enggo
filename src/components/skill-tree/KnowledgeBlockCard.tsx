"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Folder, ArrowRight } from "lucide-react";
import type { ApiCategory } from "@/lib/api/types";
import type { CategoryStats } from "@/lib/skill-tree/category-stats";
import { hexToRgba } from "@/lib/skill-tree/status-style";
import { getBlockAccentColor } from "@/lib/skill-tree/block-accent";
import { formatRelativeTime } from "@/lib/career-tree/format-time";
import TechTag from "@/components/ui/tech-tag";
import HexBadge from "./HexBadge";

const TECH_PREVIEW_LIMIT = 6;

type KnowledgeBlockCardProps = {
  workspaceId: string;
  category: ApiCategory;
  stats: CategoryStats;
  onHoverChange: (categoryId: string | null) => void;
  // "Interaction Story": bam vao 1 block thi CHINH no phong to (1.03x), CAC
  // block khac mo dan con 40% opacity, roi moi dieu huong that - can 2 co
  // nay tu component cha (KnowledgeBlocksPage) vi 1 card khong tu biet duoc
  // trang thai cua cac card anh em.
  isEntering: boolean;
  isFadedOut: boolean;
  onEnter: (categoryId: string, href: string) => void;
};

// Card lon, ca card bam duoc (Link that - keyboard accessible mien phi, Enter
// mo duoc, focus ring ke thua tu he thong co san) - khong dung button rieng
// nhu spec yeu cau "Do NOT display buttons". Toan bo mau sac cua card (icon/
// vien/glow/progress bar/% /nhan trang thai) dung CHUNG 1 "mau danh tinh"
// rieng cua block (getBlockAccentColor) thay vi mau status - khop anh mau:
// 2 block cung trang thai "Growing" van co mau khac han nhau vi la 2 block
// khac nhau, khong phai vi trang thai khac nhau.
const KnowledgeBlockCard = ({
  workspaceId,
  category,
  stats,
  onHoverChange,
  isEntering,
  isFadedOut,
  onEnter,
}: KnowledgeBlockCardProps) => {
  const accent = getBlockAccentColor(category.orderIndex, category.color);
  const statusLabel =
    stats.status === "need-review" ? "Needs review" : stats.status;
  const visibleTech = stats.skillTitles.slice(0, TECH_PREVIEW_LIMIT);
  const extraTechCount = stats.skillTitles.length - visibleTech.length;
  const href = `/skill-tree/${workspaceId}/${category.id}`;

  return (
    <Link
      href={href}
      onClick={(e) => {
        e.preventDefault();
        onEnter(category.id, href);
      }}
      onMouseEnter={() => onHoverChange(category.id)}
      onMouseLeave={() => onHoverChange(null)}
      onFocus={() => onHoverChange(category.id)}
      onBlur={() => onHoverChange(null)}
      className="group block h-72 focus:outline-none"
    >
      <motion.div
        initial={false}
        animate={{
          opacity: isFadedOut ? 0.4 : 1,
          scale: isEntering ? 1.03 : 1,
        }}
        whileHover={
          isEntering || isFadedOut
            ? undefined
            : {
                y: -4,
                scale: 1.015,
                boxShadow: `0 16px 40px -10px ${hexToRgba(accent, 0.45)}`,
              }
        }
        whileFocus={
          isEntering || isFadedOut
            ? undefined
            : { boxShadow: `0 16px 40px -10px ${hexToRgba(accent, 0.45)}` }
        }
        transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
        style={{
          boxShadow: `0 4px 16px -10px ${hexToRgba(accent, 0.2)}`,
          borderColor: hexToRgba(accent, 0.35),
          background:
            "linear-gradient(160deg, rgba(15,23,42,0.9), rgba(10,15,28,0.95))",
        }}
        className="flex h-full flex-col rounded-[18px] border p-5 group-focus-visible:ring-2 group-focus-visible:ring-primary"
      >
        <div className="flex items-start justify-between">
          <HexBadge size={56} colorHex={accent} bold>
            <Folder size={24} strokeWidth={1.75} />
          </HexBadge>
          <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-ink-faint opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100">
            Click to enter
            <ArrowRight size={12} strokeWidth={1.75} />
          </span>
        </div>

        <p
          className="mt-3 truncate text-lg font-semibold"
          style={{ color: "#e2e8f0" }}
        >
          {category.name}
        </p>

        <div className="mt-2">
          <div className="flex items-end justify-between">
            <span className="text-xs text-ink-faint">
              {stats.skillCount} skills
            </span>
            <span
              className="text-lg font-bold tabular-nums"
              style={{ color: accent }}
            >
              {stats.avgMasteryPercent}%
            </span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full rounded-full"
              style={{
                width: `${stats.avgMasteryPercent}%`,
                background: accent,
              }}
            />
          </div>
        </div>

        <div className="mt-3 flex min-h-14 flex-1 flex-wrap content-start gap-1.5 overflow-hidden">
          {visibleTech.length === 0 && (
            <span className="text-xs text-ink-faint italic">
              Chưa có kỹ năng nào.
            </span>
          )}
          {visibleTech.map((title) => (
            <TechTag key={title} name={title} />
          ))}
          {extraTechCount > 0 && (
            <span className="flex items-center rounded-md bg-surface-muted px-2 py-1 text-xs font-medium text-ink-faint">
              +{extraTechCount} more
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5">
          <span
            className="text-xs font-bold tracking-wide uppercase"
            style={{ color: accent }}
          >
            {statusLabel}
          </span>
          <span className="text-[11px] text-ink-faint">
            {stats.lastActivity
              ? `Cập nhật ${formatRelativeTime(stats.lastActivity)}`
              : "Chưa có hoạt động"}
          </span>
        </div>
      </motion.div>
    </Link>
  );
};

export default KnowledgeBlockCard;
