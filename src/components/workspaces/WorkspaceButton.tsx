"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

// Nut "Viet bai moi" kieu sticker (plus icon + paper plane bay len khi
// hover) - bang mau/gradient CO DINH theo chu dich cua thiet ke goc (khong
// dung token var(--...)), giong tinh than cac component "reactor" khac
// trong khu vuc Workspace (TransformModal, WorkspaceGatewayOverlay) da duoc
// ghi nhan la ngoai le trong docs/workspace-style-guide.md.
type WorkspaceButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "soft" | "outline";
  showPlane?: boolean;
  className?: string;
  // Mac dinh "button" (hanh dong tuc thi, vd mo modal) - form can submit
  // that (vd CreateWorkspaceModal) truyen "submit" de tai dung dung nut nay
  // lam nut submit cua <form>, khong phai tu viet lai gradient rieng.
  type?: "button" | "submit";
};

const sizes = {
  sm: { wrapper: "px-3 py-1.5 gap-2 text-[13px]", icon: "h-6 w-6", plus: 14 },
  md: { wrapper: "px-4 py-2.5 gap-2.5 text-[14px]", icon: "h-7 w-7", plus: 16 },
  lg: { wrapper: "px-5 py-3 gap-3 text-[15px]", icon: "h-8 w-8", plus: 18 },
};

export function WorkspaceButton({
  children,
  onClick,
  disabled = false,
  size = "md",
  variant = "primary",
  showPlane = true,
  className = "",
  type = "button",
}: WorkspaceButtonProps) {
  const s = sizes[size];

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { y: -1 } : undefined}
      whileTap={!disabled ? { scale: 0.97 } : undefined}
      transition={{ type: "spring", stiffness: 450, damping: 24 }}
      className={`group relative inline-flex items-center ${s.wrapper} rounded-[14px] font-semibold whitespace-nowrap select-none transition-all duration-200 ${getVariantStyles(variant, disabled)} ${className}`}
    >
      {/* Soft glow */}
      {variant === "primary" && !disabled && (
        <span className="pointer-events-none absolute inset-0 -z-10 rounded-[14px] bg-[#3199ff]/20 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
      )}

      {/* Plus */}
      <span
        className={`relative flex shrink-0 items-center justify-center rounded-full bg-white ${s.icon} ${
          variant === "outline" ? "shadow-sm" : "shadow-[0_2px_5px_rgba(20,70,130,0.16)]"
        }`}
      >
        <PlusIcon size={s.plus} className="text-[#287fee]" />
      </span>

      {/* Text */}
      <span className="relative z-10">{children}</span>

      {/* Paper plane */}
      {showPlane && <PaperPlane size={size} variant={variant} />}
    </motion.button>
  );
}

/* -------------------------------------------------------------------------- */
/* Icons                                                                      */
/* -------------------------------------------------------------------------- */

function PlusIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2.7" strokeLinecap="round" />
    </svg>
  );
}

function PaperPlane({
  size,
  variant,
}: {
  size: "sm" | "md" | "lg";
  variant: "primary" | "soft" | "outline";
}) {
  const dimensions = {
    sm: { width: 29, height: 29 },
    md: { width: 34, height: 34 },
    lg: { width: 39, height: 39 },
  };

  const d = dimensions[size];
  const color = variant === "outline" ? "#287fee" : "#ffffff";

  return (
    <motion.span
      initial={{ rotate: 6, x: 0, y: 0 }}
      whileHover={{ rotate: 13, x: 2, y: -2 }}
      transition={{ type: "spring", stiffness: 350, damping: 16 }}
      className="relative -mr-1 flex shrink-0 items-center justify-center"
    >
      <svg width={d.width} height={d.height} viewBox="0 0 40 40" fill="none" aria-hidden="true">
        {/* White sticker outline */}
        <path
          d="M6.5 17.5 L31.8 7.3 C33.8 6.5 35.2 8.4 34.1 10.2 L21.2 32.2 C20.2 34 17.6 33.5 17.2 31.3 L15.7 23.3 L7.2 20.4 C5 19.7 4.4 18.4 6.5 17.5Z"
          fill="white"
          stroke="white"
          strokeWidth="4"
          strokeLinejoin="round"
        />

        {/* Plane */}
        <path
          d="M6.5 17.5 L31.8 7.3 C33.8 6.5 35.2 8.4 34.1 10.2 L21.2 32.2 C20.2 34 17.6 33.5 17.2 31.3 L15.7 23.3 L7.2 20.4 C5 19.7 4.4 18.4 6.5 17.5Z"
          fill="#73D8F3"
          stroke="#287FEF"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />

        {/* Fold */}
        <path
          d="M15.7 23.3L31.8 8.3L18.5 27.5"
          stroke="#287FEF"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Highlight */}
        <path d="M10 18.3L28.2 10.8" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
      </svg>

      {/* Yellow motion sparks */}
      <span className="pointer-events-none absolute -right-2 top-0 flex rotate-[18deg] gap-1">
        <span className="h-2.5 w-1 rounded-full bg-[#FFC928]" />
        <span className="mt-2 h-2 w-1 rounded-full bg-[#FFC928]" />
      </span>
    </motion.span>
  );
}

/* -------------------------------------------------------------------------- */
/* Variants                                                                   */
/* -------------------------------------------------------------------------- */

function getVariantStyles(variant: WorkspaceButtonProps["variant"], disabled: boolean) {
  if (disabled) {
    return "cursor-not-allowed bg-[#e7edf5] text-[#9aa8ba] shadow-none opacity-70";
  }

  switch (variant) {
    case "soft":
      return "bg-[#eaf6ff] text-[#2375d1] border border-[#d5eaff] shadow-[0_5px_14px_rgba(45,125,220,0.08)] hover:bg-[#e2f2ff] hover:border-[#bcdfff]";

    case "outline":
      return "bg-white text-[#2375d1] border border-[#6ab8f5] shadow-[0_4px_12px_rgba(45,125,220,0.08)] hover:bg-[#f4fbff] hover:border-[#318fe9]";

    case "primary":
    default:
      // Vien trang dung inset box-shadow (khong dung `border` that) - `border`
      // trong suot + bg gradient bo goc bi trinh duyet anti-alias lech giua 2
      // lop clip rieng (border vs background) tai duong bo tron, tao vet mau
      // chom/ke manh o mep. Gop chung 1 lop shadow duy nhat tranh duoc seam nay.
      return "bg-gradient-to-r from-[#20c5d8] via-[#269ce9] to-[#326eea] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.3),0_7px_18px_rgba(40,125,235,0.24)] hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.3),0_10px_25px_rgba(40,125,235,0.30)]";
  }
}
