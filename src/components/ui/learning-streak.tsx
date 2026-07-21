"use client";

import { useEffect, useRef, useState } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Flame } from "lucide-react";
import { formatRelativeTime } from "@/lib/career-tree/format-time";

export type LearningStreakData = {
  current: number;
  longest: number;
  last7: boolean[]; // 7 phan tu, index cuoi = hom nay
};

type LearningStreakProps = {
  streak: LearningStreakData;
  lastActivity: string | null;
  // "compact": layout 2 dong dung cho GrowthCard (canvas + card node con).
  // "inline": 1 dong "🔥 12 ngay", dung cho thanh meta o trang chi tiet node.
  variant?: "compact" | "inline";
};

// Luu y: component nay KHONG tu bocj rieng Tooltip.Provider - noi nao dung
// LearningStreak (co the nhieu chuc/trang cung luc, vd canvas voi 30+ node)
// phai tu boc 1 Tooltip.Provider DUY NHAT o cap cha, tranh moi node tu tao
// rieng 1 Provider (dung dung y thiet ke cua Radix: Provider la cau hinh
// dung chung, khong phai per-instance).
function TooltipRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] text-ink-faint">{label}</span>
      <span className="text-xs font-medium text-ink">{value}</span>
    </div>
  );
}

const LearningStreak = ({
  streak,
  lastActivity,
  variant = "compact",
}: LearningStreakProps) => {
  const prevCurrentRef = useRef(streak.current);
  const [justIncreased, setJustIncreased] = useState(false);

  useEffect(() => {
    if (streak.current > prevCurrentRef.current) {
      setJustIncreased(true);
      const t = setTimeout(() => setJustIncreased(false), 320);
      prevCurrentRef.current = streak.current;
      return () => clearTimeout(t);
    }
    prevCurrentRef.current = streak.current;
  }, [streak.current]);

  const isActive = streak.current > 0;
  const consistencyCount = streak.last7.filter(Boolean).length;

  // CSS thuan thay vi framer-motion: mot node canvas co the co hang chuc
  // instance LearningStreak cung luc, dung transition CSS (GPU-composited)
  // re hon han animate mau/scale bang JS qua framer-motion.
  const glow = (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 -m-1 rounded-md bg-primary blur-sm transition-opacity duration-300 motion-reduce:transition-none ${
        justIncreased ? "opacity-20" : "opacity-0"
      }`}
    />
  );

  const flameIcon = (
    <span
      className={`inline-flex transition-transform duration-200 motion-reduce:transition-none ${
        justIncreased ? "scale-110" : "scale-100"
      }`}
    >
      <Flame
        className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-primary" : "text-ink-faint"}`}
        strokeWidth={1.75}
      />
    </span>
  );

  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        {variant === "inline" ? (
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="relative flex cursor-pointer items-center gap-1 rounded-md px-1 py-0.5 outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {glow}
            {flameIcon}
            <span className="relative text-xs font-medium tabular-nums text-ink">
              Streak {streak.current} ngày
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="nodrag relative flex w-22.5 max-w-22.5 cursor-pointer flex-col items-end gap-1 rounded-md px-1 py-0.5 outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {glow}
            <span className="relative flex items-center gap-1">
              {flameIcon}
              <span className="text-xs leading-none font-semibold tabular-nums text-ink">
                {streak.current}
              </span>
            </span>

            <span className="relative flex items-center gap-0.5">
              {streak.last7.map((active, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full transition-colors duration-250 motion-reduce:transition-none ${
                    active ? "bg-primary" : "bg-border"
                  }`}
                />
              ))}
            </span>
          </button>
        )}
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side="top"
          sideOffset={6}
          className="z-50 w-48 rounded-md border border-border bg-surface p-3 shadow-dropdown"
        >
          <p className="text-xs font-medium text-ink">Chuỗi học liên tục</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <TooltipRow
              label="Streak hiện tại"
              value={`${streak.current} ngày`}
            />
            <TooltipRow
              label="Streak dài nhất"
              value={`${streak.longest} ngày`}
            />
            <TooltipRow
              label="Hoạt động gần nhất"
              value={
                lastActivity ? formatRelativeTime(lastActivity) : "Chưa có"
              }
            />
            <TooltipRow
              label="Mức đều đặn"
              value={`${consistencyCount} / 7 ngày`}
            />
          </div>
          <Tooltip.Arrow className="fill-border" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
};

export default LearningStreak;
