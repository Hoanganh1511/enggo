"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import type { NodeStatus } from "@/lib/career-tree/node-status";
import { getStatusStyle, hexToRgba } from "@/lib/skill-tree/status-style";
import HexBadge from "./HexBadge";
import SkillIcon from "./SkillIcon";

type Size = "sm" | "md" | "lg";
type Layout = "detailed" | "compact" | "icon";

const SIZE: Record<
  Size,
  {
    pad: string;
    icon: number;
    hex: number;
    title: string;
    sub: string;
    radius: string;
  }
> = {
  sm: {
    pad: "10px 12px",
    icon: 26,
    hex: 40,
    title: "12.5px",
    sub: "10.5px",
    radius: "12px",
  },
  md: {
    pad: "14px 16px",
    icon: 32,
    hex: 48,
    title: "14px",
    sub: "11.5px",
    radius: "14px",
  },
  lg: {
    pad: "18px 20px",
    icon: 38,
    hex: 58,
    title: "16px",
    sub: "12.5px",
    radius: "16px",
  },
};

function ProgressRail({
  percent,
  status,
}: {
  percent: number;
  status: NodeStatus;
}) {
  const s = getStatusStyle(status);
  return (
    <div className="mt-2 h-[5px] overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full rounded-full transition-[width] duration-500 ease-out"
        style={{
          width: `${percent}%`,
          background: `linear-gradient(90deg, ${hexToRgba(s.hex, 0.6)}, ${s.hex})`,
          boxShadow: `0 0 6px ${hexToRgba(s.hex, 0.35)}`,
        }}
      />
    </div>
  );
}

function ConnectorDots({
  status,
  count = 3,
}: {
  status: NodeStatus;
  count?: number;
}) {
  const s = getStatusStyle(status);
  return (
    <div className="absolute right-2.5 bottom-2 flex gap-[3px]">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="size-[3.5px] rounded-full"
          style={{ background: s.hex, opacity: 0.55 + i * 0.15 }}
        />
      ))}
    </div>
  );
}

export type SkillCardProps = {
  title: string;
  subtitle?: string;
  percent?: number;
  icon: LucideIcon;
  status: NodeStatus;
  size?: Size;
  layout?: Layout;
  selected?: boolean;
  hasSubSkills?: boolean;
  onClick?: () => void;
};

// "Glass tube" skill node - vien conic-gradient xoay lien tuc + anh sang luot
// qua mat kinh, hex badge phat sang theo mau trang thai. Dung inline style
// cho cac gia tri PHU THUOC RUNTIME (mau hex theo status, do dai title) vi
// Tailwind khong tham so hoa duoc; phan tinh (animation, transition, layout)
// dung Tailwind/keyframes global nhu quy uoc con lai cua repo.
const SkillCard = ({
  title,
  subtitle,
  percent = 0,
  icon: Icon,
  status,
  size = "md",
  layout = "detailed",
  selected = false,
  hasSubSkills = false,
  onClick,
}: SkillCardProps) => {
  const [hover, setHover] = useState(false);
  const s = getStatusStyle(status);
  const d = SIZE[size];
  const active = hover || selected;

  // Da giam dinh sang (peak alpha) so voi ban dau - vong xoay vua tang kich
  // thuoc de phu het goc card (xem ghi chu duoi) nen dinh sang cu (gan 100%)
  // gio chieu qua lop nen than card (chi ~94-96% duc) manh hon han, khien
  // cac mau sang manh (emerald, amber) lam ca card nhu bi loa.
  const liquidGradient = `conic-gradient(from 0deg,
    transparent 0%,
    ${hexToRgba(s.hex, 0)} 4%,
    ${hexToRgba(s.hex, 0.2)} 16%,
    ${hexToRgba(s.hex, 0.6)} 27%,
    ${hexToRgba(s.hex, 0.2)} 38%,
    ${hexToRgba(s.hex, 0)} 48%,
    transparent 50%,
    ${hexToRgba(s.hex, 0)} 52%,
    ${hexToRgba(s.hex, 0.15)} 63%,
    ${hexToRgba(s.hex, 0.5)} 76%,
    ${hexToRgba(s.hex, 0.15)} 87%,
    ${hexToRgba(s.hex, 0)} 96%,
    transparent 100%)`;

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`relative overflow-hidden p-[1.5px] transition-transform duration-150 ease-out ${
        onClick ? "cursor-pointer" : ""
      } ${active ? "-translate-y-0.5" : ""}`}
      style={{
        borderRadius: d.radius,
        minWidth: layout === "icon" ? d.hex + 24 : 190,
        boxShadow: active
          ? `0 10px 30px -8px ${hexToRgba(s.hex, 0.35)}`
          : "none",
      }}
    >
      {/* Vien "ong kinh": gradient xoay lien tuc.
          Card kieu "detailed" rong hon nhieu so voi cao (title+subtitle+bar
          chi cao ~1 hang, nhung o rong ca grid 4 cot) - voi 1 hinh chu nhat
          xoay quanh tam, ban kinh "an toan" toi thieu (tai moi goc quay) chi
          bang NUA CANH NGAN, khong phai nua duong cheo. Inset 60% cu qua
          nho so voi ty le rong/cao thuc te nen goc card thinh thoang lo ra
          ngoai vung gradient luc xoay toi gan 90deg. Tang len 150% de ban
          kinh an toan > nua duong cheo card voi moi ty le canh thuc te. */}
      <div
        className={`absolute inset-[-150%] animate-[skillcard-spin_5.5s_linear_infinite] transition-opacity duration-150 ${
          active ? "opacity-100 blur-[1.5px]" : "opacity-75 blur-[1.5px]"
        }`}
        style={{ background: liquidGradient }}
      />

      {/* Than card nam tren vien, chi lo ra 1 duong vien mong cua no */}
      <div
        className={`relative flex overflow-hidden ${
          layout === "icon" ? "flex-col items-center" : "flex-row items-start"
        } ${layout === "icon" ? "gap-1.5" : "gap-3"}`}
        style={{
          padding: d.pad,
          borderRadius: `calc(${d.radius} - 1.5px)`,
          background: active
            ? `linear-gradient(160deg, rgba(15,23,42,0.98), ${hexToRgba(s.hex, 0.12)})`
            : "linear-gradient(160deg, rgba(15,23,42,0.98), rgba(10,15,28,0.99))",
        }}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute top-[-40%] left-0 h-[180%] w-[35%] animate-[skillcard-sheen_4.7s_ease-in-out_infinite] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.10),transparent)]"
            style={{ animationDelay: `${(title.length % 5) * 0.3}s` }}
          />
        </div>

        <HexBadge size={d.hex} status={status}>
          <SkillIcon title={title} fallback={Icon} size={d.icon * 0.6} />
        </HexBadge>

        {layout !== "icon" && (
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div
                className="truncate font-semibold tracking-tight"
                style={{ fontSize: d.title, color: "#e2e8f0" }}
              >
                {title}
              </div>
              {layout === "detailed" && (
                <span
                  className="shrink-0 font-bold tabular-nums"
                  style={{ fontSize: d.sub, color: s.hex }}
                >
                  {percent}%
                </span>
              )}
            </div>
            <div
              className="mt-0.5 font-medium"
              style={{ fontSize: d.sub, color: s.hex }}
            >
              {layout === "compact" ? `${percent}%` : (subtitle ?? "")}
            </div>
            {layout === "detailed" && (
              <ProgressRail percent={percent} status={status} />
            )}
          </div>
        )}

        {layout === "icon" && (
          <div
            className="text-[10.5px] font-medium"
            style={{ color: "#94a3b8" }}
          >
            {percent}%
          </div>
        )}

        {layout === "detailed" && hasSubSkills && (
          <ConnectorDots status={status} />
        )}
      </div>
    </div>
  );
};

export default SkillCard;
