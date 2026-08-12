"use client";

import { motion } from "framer-motion";
import { mulberry32 } from "@/lib/seeded-random";

type Star = {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  driftX: number;
  driftY: number;
};

// Nen "deep space" cho man Workspace (list + workspace phase, dung o
// workspace/[username]/layout.tsx, nam duoi ca noi dung lan Control Center
// toolbar - xem layering trong layout.tsx). Palette + thong so (kich thuoc
// sao, glow, blur, vignette...) theo dung spec nguoi dung dua, CHI sua 1 cho:
// vi tri sao dung PRNG co seed (mulberry32) thay vi Math.random() truc tiep
// trong useMemo - component nay la "use client" nhung Next.js van SSR lan
// render dau, Math.random() se cho vi tri KHAC nhau giua server va client
// -> hydration mismatch. Tinh STARS 1 LAN o module scope (khong phai trong
// component) nen luon giong nhau moi lan render/moi instance, khong can
// useMemo nua.
const STAR_COUNT = 45;
const starRandom = mulberry32(7);
const STARS: Star[] = Array.from({ length: STAR_COUNT }, (_, i) => ({
  id: i,
  x: starRandom() * 100,
  y: starRandom() * 100,
  size: starRandom() * 2 + 0.8,
  opacity: starRandom() * 0.45 + 0.2,
  duration: starRandom() * 12 + 10,
  delay: starRandom() * -15,
  driftX: (starRandom() - 0.5) * 24,
  driftY: (starRandom() - 0.5) * 18,
}));

export default function StarfieldBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#030713]"
    >
      {/* Cyan atmosphere - goc tren trai */}
      <div className="absolute -top-[20%] -left-[15%] h-[650px] w-[650px] rounded-full bg-cyan-500/[0.09] blur-[130px]" />

      {/* Violet atmosphere - goc phai */}
      <div className="absolute top-[25%] -right-[15%] h-[650px] w-[650px] rounded-full bg-violet-500/[0.10] blur-[140px]" />

      {/* Blue atmosphere - duoi trung tam */}
      <div className="absolute bottom-[-35%] left-[28%] h-[600px] w-[600px] rounded-full bg-blue-600/[0.07] blur-[150px]" />

      {/* Star field */}
      <div className="absolute inset-0">
        {STARS.map((star) => (
          <motion.span
            key={star.id}
            className="absolute rounded-full bg-cyan-300"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              boxShadow:
                star.size > 1.5
                  ? "0 0 7px rgba(34,211,238,.55)"
                  : "0 0 4px rgba(34,211,238,.35)",
            }}
            animate={{
              x: [0, star.driftX, 0],
              y: [0, star.driftY, 0],
              opacity: [
                star.opacity * 0.65,
                Math.min(star.opacity * 1.5, 0.85),
                star.opacity * 0.65,
              ],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: star.duration,
              delay: star.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Very subtle space dust */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,white_0.5px,transparent_0.6px)] bg-[length:5px_5px] opacity-[0.035]"
        animate={{ x: [0, 3, 0], y: [0, -3, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(3,7,19,.28)_75%,rgba(3,7,19,.72)_100%)]" />

      {/* Top / bottom fade */}
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#030713] to-transparent opacity-70" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#030713] to-transparent opacity-80" />
    </div>
  );
}
