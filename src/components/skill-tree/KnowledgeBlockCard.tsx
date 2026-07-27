"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Folder } from "lucide-react";
import type { ApiCategory } from "@/lib/api/types";
import type { CategoryStats } from "@/lib/skill-tree/category-stats";
import { hexToRgba } from "@/lib/skill-tree/status-style";
import { getBlockAccentColor } from "@/lib/skill-tree/block-accent";
import { formatRelativeTime } from "@/lib/career-tree/format-time";
import TechTag from "@/components/ui/tech-tag";
import Hex3DBadge from "./Hex3DBadge";

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
//
// Visual treatment: "floating glass slab" — nen gradient mo nhe + vien
// trang mo + shadow nhieu lop de tao chieu sau, highlight tren dinh gia
// lap anh sang chieu tu tren xuong, va mot lop "fake thickness" mo o day
// card de tao cam giac card co do day vat ly khi hover.
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
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
      onFocus={() => onHoverChange(category.id)}
      onBlur={() => onHoverChange(null)}
      className="group block  focus:outline-none"
    >
      <motion.div
        initial={false}
        animate={{
          opacity: isFadedOut ? 0.4 : 1,
          scale: isEntering ? 1.03 : 1,
        }}
        whileHover={
          {
            // rotateX: 1.5,
            // rotateY: -1.5,
          }
        }
        transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
        style={{
          background: `
radial-gradient(
circle at top,
${hexToRgba(accent, 0.1)},
transparent 45%
),
linear-gradient(
180deg,
rgba(255,255,255,.03),
rgba(255,255,255,.01)
),
var(--surface)
`,
        }}
        className="
         relative overflow-visible group/card
       
flex flex-col
rounded-sm
border border-white/[0.08]
px-5 py-5
transition-all duration-300 ease-out
bg-gradient-to-b
from-white/[0.035]
via-white/[0.02]
to-white/[0.01]
shadow-[0_6px_16px_rgba(0,0,0,.18),0_20px_42px_rgba(0,0,0,.28)]
hover:border-white/[0.12]
hover:ring-1 hover:ring-white/[0.05]
hover:shadow-[0_10px_24px_rgba(0,0,0,.24),0_28px_56px_rgba(0,0,0,.34)]
        "
      >
        <div
          className="absolute left-2 top-2 rounded-full px-2 py-1 text-[10px] font-semibold tracking-wide"
          style={{
            background: hexToRgba(accent, 0.12),
            color: accent,
            border: `1px solid ${hexToRgba(accent, 0.25)}`,
          }}
        >
          TOP
        </div>
        <div
          className="pointer-events-none absolute inset-0  opacity-0 transition-opacity duration-300 group-hover/card:opacity-100"
          style={{
            background:
              "radial-gradient(circle at var(--mx,50%) var(--my,50%), rgba(255,255,255,.06), transparent 55%)",
          }}
        />

        <div className="flex justify-center">
          <Hex3DBadge size={56} colorHex={accent}>
            <Folder size={20} strokeWidth={1.75} />
          </Hex3DBadge>
          <span
            className="absolute right-2 top-2 rounded-md border border-white/10 px-2 py-0.5 text-[10px] font-semibold backdrop-blur"
            style={{
              background: hexToRgba(accent, 0.15),
              color: accent,
            }}
          >
            Lv.{Math.floor(stats.avgMasteryPercent / 10) + 1}
          </span>
        </div>
        <p className="mt-5 text-center text-[14px] font-semibold tracking-tight text-slate-50">
          {category.name}
        </p>

        <div className="mt-2">
          <div className="mt-2 flex justify-between text-[11px]">
            <span className="text-ink-faint">
              {4}/{stats.skillCount} skills
            </span>

            <span style={{ color: accent }} className="font-medium">
              {stats.avgMasteryPercent * 4}/400 XP
            </span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full rounded-full"
              style={{
                width: `${stats.avgMasteryPercent}%`,
                background: `linear-gradient(90deg, ${hexToRgba(accent, 0.55)}, ${accent})`,
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
          <div
            className="mt-4 rounded-xl border border-white/5 p-3"
            style={{
              background: hexToRgba(accent, 0.05),
            }}
          >
            <div
              className="text-[11px] uppercase tracking-wider"
              style={{ color: accent }}
            >
              AI Insight
            </div>

            <p className="mt-1 text-xs text-slate-300">
              Continue learning Next.js to unlock SSR optimization.
            </p>
          </div>
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
