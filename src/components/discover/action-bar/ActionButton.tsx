"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";

export type ActionTone =
  "danger" | "primary" | "warning" | "success" | "neutral";

const toneActiveClass: Record<ActionTone, string> = {
  danger: "text-rose-500",
  primary: "text-primary",
  warning: "text-warning",
  success: "text-emerald-500",
  neutral: "text-ink",
};

function formatCompact(n: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

export type ActionSlot = {
  key: string;
  icon: LucideIcon;
  label?: string;
  count?: number;
  tone: ActionTone;
  /** false = hien thi tinh, khong bam duoc (vd: view count, so phieu bau) */
  interactive?: boolean;
  /** icon fill mau khi active, giong tim/bookmark */
  fill?: boolean;
};

// 1 nut trong action bar - moi kind co bo slot rieng (xem action-bar-config.tsx),
// nhung tat ca deu di qua component nay de dam bao spacing/kich thuoc/hover
// nhat quan du noi dung/mau/icon khac nhau hoan toan.
export function ActionButton({ slot }: { slot: ActionSlot }) {
  const [active, setActive] = useState(false);
  const isInteractive = slot.interactive !== false;
  const isActive = isInteractive && active;
  const displayCount =
    slot.count === undefined ? undefined : slot.count + (isActive ? 1 : 0);

  return (
    <button
      type="button"
      disabled={!isInteractive}
      onClick={isInteractive ? () => setActive((v) => !v) : undefined}
      className={`flex h-9 shrink-0 items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors duration-150 ease-out ${
        isInteractive ? "cursor-pointer hover:bg-hover-bg" : "cursor-default"
      } ${isActive ? toneActiveClass[slot.tone] : "text-ink-faint"}`}
    >
      <slot.icon
        size={16}
        strokeWidth={1.75}
        fill={slot.fill && isActive ? "currentColor" : "none"}
      />
      {slot.label && <span>{slot.label}</span>}
      {displayCount !== undefined && (
        <span className="tabular-nums">{formatCompact(displayCount)}</span>
      )}
    </button>
  );
}
