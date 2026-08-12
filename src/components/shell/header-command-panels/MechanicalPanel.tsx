"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

// Vo panel dung chung cho 4 dropdown "Da luu/Tin nhan/Thong bao/Tro giup"
// tren TopHeaderBar - bê nguyên UI/UX/animation tu source rieng
// "treecareer-topbar-command-center" (MechanicalPanel.tsx), nhung doi toan bo
// mau HARDCODE (cyan/slate) sang TOKEN CSS (var(--...) tu globals.css) de tu
// dong doi theo theme sang/toi giong phan con lai cua header, thay vi khoa
// cung giao dien toi nhu ban demo.
const panelVariants: Variants = {
  closed: { opacity: 0, scale: 0.72, y: -10, rotateX: -12, filter: "blur(7px)" },
  open: {
    opacity: 1,
    scale: 1,
    y: 0,
    rotateX: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 280, damping: 24 },
  },
  exit: {
    opacity: 0,
    scale: 0.88,
    y: -6,
    filter: "blur(4px)",
    transition: { duration: 0.18 },
  },
};

export default function MechanicalPanel({
  title,
  eyebrow = "SYSTEM MODULE",
  icon,
  children,
  width = "w-[360px]",
  action,
}: {
  title: string;
  eyebrow?: string;
  icon: ReactNode;
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
        transformPerspective: 1000,
        border: "1px solid color-mix(in srgb, var(--primary) 22%, transparent)",
        background: "var(--surface-raised)",
        boxShadow:
          "0 24px 80px rgba(0,0,0,.28), 0 0 45px color-mix(in srgb, var(--primary) 10%, transparent)",
      }}
      className={`pointer-events-auto overflow-hidden rounded-2xl backdrop-blur-2xl ${width}`}
    >
      <div
        className="absolute inset-x-0 top-0 h-px overflow-hidden"
        style={{ background: "color-mix(in srgb, var(--primary) 20%, transparent)" }}
      >
        <div
          className="scan h-full w-1/2"
          style={{
            background:
              "linear-gradient(to right, transparent, color-mix(in srgb, var(--primary) 70%, transparent), transparent)",
          }}
        />
      </div>

      <header
        className="flex items-center justify-between px-4 py-3.5"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="grid h-9 w-9 place-items-center rounded-xl"
            style={{
              border: "1px solid color-mix(in srgb, var(--primary) 25%, transparent)",
              background: "color-mix(in srgb, var(--primary) 8%, transparent)",
              color: "var(--primary)",
            }}
          >
            {icon}
          </div>
          <div>
            <div
              className="text-[8px] font-semibold tracking-[.18em]"
              style={{ color: "color-mix(in srgb, var(--primary) 65%, var(--ink-faint))" }}
            >
              {eyebrow}
            </div>
            <h2 className="mt-0.5 text-[13px] font-semibold" style={{ color: "var(--ink)" }}>
              {title}
            </h2>
          </div>
        </div>
        {action}
      </header>
      {children}
    </motion.section>
  );
}
