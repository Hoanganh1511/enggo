"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type RippleInstance = { id: number; x: number; y: number; size: number };

// Hieu ung "giot nuoc" luc bam - vong tron mo tu diem bam, phinh to + mo dan.
// Dung chung cho moi the/nut can animation click dong nhat (workspace card,
// "Tao workspace", ...). Element goi onPointerDown PHAI la "relative
// overflow-hidden" (thuong da co rounded-*) de vong tron bi cat gon trong
// bien cua no.
export function useRipple(color: string = "var(--primary)") {
  const [ripples, setRipples] = useState<RippleInstance[]>([]);

  function onPointerDown(e: React.PointerEvent<HTMLElement>) {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const id = Date.now() + Math.random();
    setRipples((prev) => [
      ...prev,
      {
        id,
        x: e.clientX - rect.left - size / 2,
        y: e.clientY - rect.top - size / 2,
        size,
      },
    ]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 650);
  }

  const rippleLayer = (
    <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
      <AnimatePresence>
        {ripples.map((r) => (
          <motion.span
            key={r.id}
            className="absolute rounded-full"
            style={{
              left: r.x,
              top: r.y,
              width: r.size,
              height: r.size,
              background: `color-mix(in srgb, ${color} 35%, transparent)`,
            }}
            initial={{ scale: 0, opacity: 0.55 }}
            animate={{ scale: 1, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>
    </span>
  );

  return { onPointerDown, rippleLayer };
}
