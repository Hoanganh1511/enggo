import { useId, useMemo, type CSSProperties, type ReactNode } from "react";
import { hexToRgba } from "@/lib/skill-tree/status-style";

// Badge luc giac "3D" cho KnowledgeBlockCard - thay the HexBadge (bold) phang
// mau don sac bang 1 phien ban co chieu sau that: canh bo tron (khong nhon
// nhu polygon thuong), gradient sang->toi, do bong duoi de tao khoi, vet
// gloss trang o goc tren-trai, vien sang (rim light), va vai hat sparkle
// nhap nhay quanh badge. Chi dung cho card lon (Knowledge Blocks) - HexBadge.tsx
// (status/thin outline) van giu nguyen cho SkillCard/SkillDetailPanel.
//
// Khac ban demo goc: nhan 1 mau HEX bat ky (colorHex) thay vi 1 bang mau ten
// co dinh (emerald/cyan/...) - vi he thong accent cua app (block-accent.ts)
// sinh mau tu 6-color rotation HOAC mau tuy chinh nguoi dung dat cho Category,
// khong gioi han trong 1 bang ten co dinh. Cac sac do (light/mid/dark/deep)
// duoc tinh bang cach tron hex goc voi trang/den thay vi tra bang.
function normalize([x, y]: [number, number]): [number, number] {
  const len = Math.hypot(x, y) || 1;
  return [x / len, y / len];
}

function hexVertices(
  cx: number,
  cy: number,
  r: number,
  rotationDeg = -90,
): [number, number][] {
  return Array.from({ length: 6 }, (_, i) => {
    const a = ((rotationDeg + i * 60) * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as [number, number];
  });
}

function roundedPolygonPath(
  points: [number, number][],
  radius: number,
): string {
  const n = points.length;
  const d: string[] = [];
  for (let i = 0; i < n; i++) {
    const prev = points[(i - 1 + n) % n];
    const curr = points[i];
    const next = points[(i + 1) % n];
    const v1 = normalize([curr[0] - prev[0], curr[1] - prev[1]]);
    const v2 = normalize([next[0] - curr[0], next[1] - curr[1]]);
    const p1: [number, number] = [
      curr[0] - v1[0] * radius,
      curr[1] - v1[1] * radius,
    ];
    const p2: [number, number] = [
      curr[0] + v2[0] * radius,
      curr[1] + v2[1] * radius,
    ];
    d.push(
      i === 0
        ? `M ${p1[0].toFixed(2)} ${p1[1].toFixed(2)}`
        : `L ${p1[0].toFixed(2)} ${p1[1].toFixed(2)}`,
    );
    d.push(
      `Q ${curr[0].toFixed(2)} ${curr[1].toFixed(2)} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`,
    );
  }
  d.push("Z");
  return d.join(" ");
}

function clamp255(v: number) {
  return Math.max(0, Math.min(255, v));
}

function mixHex(
  hex: string,
  target: [number, number, number],
  amount: number,
): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const nr = clamp255(Math.round(r + (target[0] - r) * amount));
  const ng = clamp255(Math.round(g + (target[1] - g) * amount));
  const nb = clamp255(Math.round(b + (target[2] - b) * amount));
  return `#${[nr, ng, nb].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function deriveShades(hex: string) {
  return {
    light: mixHex(hex, [255, 255, 255], 0.55),
    mid: hex,
    dark: mixHex(hex, [0, 0, 0], 0.28),
    deep: mixHex(hex, [0, 0, 0], 0.55),
    glow: hexToRgba(hex, 0.5),
  };
}

function seedFrom(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 97;
  return h;
}

const SPARKLE_PATH =
  "M12 2 C12.6 7.5 16.5 11.4 22 12 C16.5 12.6 12.6 16.5 12 22 C11.4 16.5 7.5 12.6 2 12 C7.5 11.4 11.4 7.5 12 2 Z";

function Sparkle({
  size,
  style,
  color,
  delay,
  duration,
}: {
  size: number;
  style: CSSProperties;
  color: string;
  delay: number;
  duration: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{
        position: "absolute",
        animationName: "hex3d-twinkle",
        animationTimingFunction: "ease-in-out",
        animationIterationCount: "infinite",
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
        filter: `drop-shadow(0 0 3px ${color})`,
        ...style,
      }}
    >
      <path d={SPARKLE_PATH} fill={color} />
    </svg>
  );
}

type Hex3DBadgeProps = {
  colorHex: string;
  size?: number;
  sparkle?: boolean;
  cornerRadius?: number;
  children: ReactNode;
};

export function Hex3DBadge({
  colorHex,
  size = 56,
  sparkle = true,
  cornerRadius = 12,
  children,
}: Hex3DBadgeProps) {
  const shades = useMemo(() => deriveShades(colorHex), [colorHex]);
  const seed = useMemo(() => seedFrom(colorHex), [colorHex]);
  const uid = useId();

  const vb = 200;
  const cx = 100;
  const cy = 100;
  const r = 84;

  const hexPath = useMemo(
    () => roundedPolygonPath(hexVertices(cx, cy, r), cornerRadius),
    [cornerRadius],
  );

  const sparkles = [
    { size: size * 0.13, top: "2%", left: "6%", duration: 2.6, delay: 0.2 },
    { size: size * 0.09, top: "72%", left: "0%", duration: 3.1, delay: 1.1 },
    {
      size: size * 0.11,
      top: "8%",
      left: "84%",
      duration: 2.9,
      delay: 0.6 + (seed % 10) / 10,
    },
    { size: size * 0.08, top: "78%", left: "88%", duration: 3.4, delay: 1.6 },
  ];

  return (
    <div
      className="relative flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* ambient color halo behind everything */}
      <div
        className="absolute rounded-full"
        style={{
          width: size * 0.9,
          height: size * 0.9,
          background: shades.glow,
          filter: `blur(${size * 0.18}px)`,
          opacity: 0.5,
        }}
      />

      {sparkle &&
        sparkles.map((s, i) => (
          <Sparkle
            key={i}
            size={s.size}
            duration={s.duration}
            delay={s.delay}
            color={shades.light}
            style={{ top: s.top, left: s.left }}
          />
        ))}

      {/* the hexagon shell itself */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${vb} ${vb}`}
        className="relative"
        style={{
          filter: `drop-shadow(0 ${size * 0.09}px ${size * 0.1}px rgba(0,0,0,0.22)) drop-shadow(0 ${size * 0.02}px ${size * 0.02}px ${shades.glow})`,
        }}
      >
        <defs>
          <linearGradient id={`${uid}-base`} x1="15%" y1="8%" x2="85%" y2="95%">
            <stop offset="0%" stopColor={shades.light} />
            <stop offset="45%" stopColor={shades.mid} />
            <stop offset="100%" stopColor={shades.dark} />
          </linearGradient>
          <linearGradient
            id={`${uid}-shade`}
            x1="50%"
            y1="35%"
            x2="50%"
            y2="100%"
          >
            <stop offset="0%" stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor={shades.deep} stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id={`${uid}-rim`} x1="20%" y1="0%" x2="80%" y2="60%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="55%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <radialGradient id={`${uid}-gloss`} cx="38%" cy="26%" r="42%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <clipPath id={`${uid}-clip`}>
            <path d={hexPath} />
          </clipPath>
          <filter id={`${uid}-blur`}>
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>

        <path d={hexPath} fill={`url(#${uid}-base)`} />
        <path
          d={hexPath}
          fill={`url(#${uid}-shade)`}
          style={{ mixBlendMode: "multiply" }}
        />

        <g clipPath={`url(#${uid}-clip)`} filter={`url(#${uid}-blur)`}>
          <ellipse
            cx="76"
            cy="52"
            rx="70"
            ry="46"
            fill={`url(#${uid}-gloss)`}
          />
        </g>

        <path
          d={hexPath}
          fill="none"
          stroke={`url(#${uid}-rim)`}
          strokeWidth="4"
        />
        <path
          d={hexPath}
          fill="none"
          stroke="rgba(0,0,0,0.12)"
          strokeWidth="1.5"
        />
      </svg>

      {/* glyph, centered, lifted with its own soft shadow */}
      <div
        className="absolute flex items-center justify-center text-white"
        style={{
          filter: `drop-shadow(0 ${size * 0.02}px ${size * 0.03}px ${shades.deep}66)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default Hex3DBadge;
