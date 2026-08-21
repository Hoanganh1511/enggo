"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

// Vo panel dung chung cho 4 dropdown "Da luu/Tin nhan/Thong bao/Tro giup"
// tren TopHeaderBar. Ban DON GIAN - chi fade+scale nhe (khop dung cach
// PopoverContent trong components/ui/popover.tsx dang dung cho dropdown
// "Khám phá"/HeaderSearch), thay cho ban cu animate rotateX (xoay 3D) +
// filter:blur() qua Framer Motion + 1 duong "scan" quet vo han - dung nguyen
// tac da chot trong docs/workspace-style-guide.md: KHONG animate filter/blur
// (buoc trinh duyet rasterize rieng 1 layer, gay mo du/giat), va khong glow/
// pulse thuan trang tri khong gan trang thai that.
const panelVariants: Variants = {
  closed: { opacity: 0, scale: 0.96, y: -6 },
  open: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.15, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: -6,
    transition: { duration: 0.12, ease: "easeIn" },
  },
};

export default function MechanicalPanel({
  title,
  children,
  width = "w-[360px]",
  action,
}: {
  title: string;
  children: ReactNode;
  width?: string;
  action?: ReactNode;
}) {
  return (
    <motion.section
      variants={panelVariants}
      initial="closed"
      animate="open"
      exit="exit"
      style={{
        border: "1px solid var(--border-strong)",
        background: "var(--surface-raised)",
        boxShadow: "var(--shadow-dropdown)",
      }}
      className={`pointer-events-auto overflow-hidden rounded-2xl ${width}`}
    >
      <header
        className="flex items-center justify-between px-4 py-3.5"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <h2 className="text-[15px] font-semibold" style={{ color: "var(--ink)" }}>
          {title}
        </h2>
        {action}
      </header>
      {children}
    </motion.section>
  );
}
