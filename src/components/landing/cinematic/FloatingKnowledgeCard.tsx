import type { LucideIcon } from "lucide-react";
import { MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

type Accent = "blue" | "emerald" | "violet";

const ACCENT_STYLE: Record<
  Accent,
  { text: string; bar: string; border: string; shadow: string }
> = {
  blue: {
    text: "text-[#7ec6ff]",
    bar: "from-[#4a8fd9] to-[#7ec6ff]",
    border: "border-[#78aaff]/35",
    shadow:
      "shadow-[0_25px_50px_-12px_rgba(94,158,255,.35),0_8px_20px_rgba(0,0,0,.5),inset_0_1px_1px_rgba(255,255,255,.2)]",
  },
  emerald: {
    text: "text-[#7fe3ab]",
    bar: "from-[#3f9e6a] to-[#7fe3ab]",
    border: "border-[#5fae7d]/40",
    shadow:
      "shadow-[0_25px_50px_-12px_rgba(95,174,125,.4),0_8px_20px_rgba(0,0,0,.5),inset_0_1px_1px_rgba(255,255,255,.2)]",
  },
  violet: {
    text: "text-[#c9a4ff]",
    bar: "from-[#9b6fdb] to-[#c9a4ff]",
    border: "border-[#b482ff]/35",
    shadow:
      "shadow-[0_25px_50px_-12px_rgba(180,130,255,.32),0_8px_20px_rgba(0,0,0,.5),inset_0_1px_1px_rgba(255,255,255,.2)]",
  },
};

type FloatingKnowledgeCardProps = {
  icon: LucideIcon;
  title: string;
  meta: string;
  score: number;
  mastery: number;
  accent: Accent;
};

// Mat card thuan tuy - KHONG chua vi tri/transform 3D (phan do do wrapper
// rieng trong CinematicHero dam nhiem, vi moi card can 1 transform tinh +
// 1 transform hover khac nhau, dat qua Tailwind arbitrary class thay vi
// inline style de tranh xung dot dac ta voi transform tinh).
const FloatingKnowledgeCard = ({
  icon: Icon,
  title,
  meta,
  score,
  mastery,
  accent,
}: FloatingKnowledgeCardProps) => {
  const s = ACCENT_STYLE[accent];

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border p-5",
        "bg-[linear-gradient(155deg,rgba(255,255,255,.09),rgba(255,255,255,.02))]",
        s.border,
        s.shadow,
      )}
      style={{ backdropFilter: "blur(18px) saturate(160%)" }}
    >
      {/* Anh kinh cheo goc tren-trai */}
      <span
        className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(120deg,rgba(255,255,255,.16)_0%,transparent_35%)]"
        aria-hidden
      />
      {/* Ao giac do day o canh duoi - 1 dai mo, toi hon, cung mau card */}
      <span
        className={cn(
          "pointer-events-none absolute inset-x-1.5 -bottom-1.5 -z-10 h-3.5 rounded-b-2xl opacity-70 blur-[0.5px] brightness-[0.55]",
          "bg-[linear-gradient(155deg,rgba(255,255,255,.09),rgba(255,255,255,.02))]",
        )}
        aria-hidden
      />

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/15 bg-white/10">
            <Icon size={13} strokeWidth={1.75} className="text-white" />
          </span>
          <span className="text-sm font-semibold text-white">{title}</span>
        </div>
        <MoreVertical size={15} className="shrink-0 text-white/40" />
      </div>

      <p className="relative mt-2.5 text-[11px] text-white/45">{meta}</p>

      <div className="relative mt-3 flex items-center justify-between">
        <div>
          <p className="font-mono text-[9.5px] tracking-wide text-white/35">
            MASTERY
          </p>
          <div className="mt-1.5 h-1 w-25 overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full bg-linear-to-r ${s.bar}`}
              style={{ width: `${mastery}%` }}
            />
          </div>
        </div>
        <span className={`font-mono text-sm font-semibold ${s.text}`}>
          {score}%
        </span>
      </div>
    </div>
  );
};

export default FloatingKnowledgeCard;
