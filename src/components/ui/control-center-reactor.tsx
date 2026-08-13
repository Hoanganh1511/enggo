"use client";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import {
  CircleHelp,
  type LucideIcon,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export type ReactorTool = {
  id: string;
  label: string;
  icon: LucideIcon;
  tone?: "cyan" | "violet" | "blue";
  onClick?: () => void;
};

type SystemState = "idle" | "deploying" | "online" | "retracting";

const DEFAULT_TOOLS: ReactorTool[] = [
  { id: "help", label: "Trợ giúp", icon: CircleHelp, tone: "violet" },
  { id: "settings", label: "Cài đặt", icon: Settings2, tone: "violet" },
];

const DEPLOY_MS = 1500;
const RETRACT_MS = 1100;

const jointVariants: Variants = {
  idle: {
    x: 0,
    y: 0,
    rotate: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 500, damping: 32 },
  },
  deploying: (custom: {
    x: number;
    y: number;
    rotate: number;
    delay: number;
  }) => ({
    x: custom.x,
    y: custom.y,
    rotate: custom.rotate,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 430,
      damping: 22,
      delay: custom.delay,
    },
  }),
  online: (custom: { x: number; y: number; rotate: number }) => ({
    x: custom.x,
    y: custom.y,
    rotate: custom.rotate,
    opacity: 1,
    transition: { type: "spring", stiffness: 360, damping: 28 },
  }),
  retracting: {
    x: 0,
    y: 0,
    rotate: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 500, damping: 30 },
  },
};

const toolVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.28,
    x: 10,
    y: 10,
    filter: "blur(7px)",
  },
  visible: (index: number) => ({
    opacity: 1,
    scale: 1,
    x: 0,
    y: 0,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 390,
      damping: 22,
      delay: 0.02 + index * 0.085,
    },
  }),
  exit: (index: number) => ({
    opacity: 0,
    scale: 0.45,
    x: 8,
    y: 8,
    filter: "blur(5px)",
    transition: {
      duration: 0.18,
      delay: (6 - index) * 0.035,
    },
  }),
};

// "Reactor" - toolbar goc phai duy nhat cua man Workspace, thay the ban
// "Control Center" thu cong truoc do (bo cuc tinh, animate rotate lam mat
// centering cua radial-core - da phai vá bang margin-based centering). Ban
// nay bê nguyên tu source rieng "control-center-reactor-final", giu HARDCODE
// bang mau cyan/violet/blue (dong bo StarfieldBackground/TransformModal -
// ca "vu tru" Workspace co chu dich khong doi theo theme sang/toi). Toast
// "{label} đã sẵn sàng" va vong doi deploy/retract da nam SAN trong chinh
// component (activeTool/state), khong can toolToast/timer rieng o layout
// nhu ban cu nua - chi truyen "tools" that (id/label/icon/tone/onClick).
export function ControlCenterReactor({
  tools = DEFAULT_TOOLS,
  label = "CONTROL CENTER",
  sublabel = "Quản lý workspace",
}: {
  tools?: ReactorTool[];
  label?: string;
  sublabel?: string;
}) {
  const [state, setState] = useState<SystemState>("idle");
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const isDeployed = state === "deploying" || state === "online";
  const isBusy = state === "deploying" || state === "retracting";

  const joints = useMemo(
    () => [
      { x: -11, y: -8, rotate: -9, delay: 0.02 },
      { x: 10, y: -10, rotate: 10, delay: 0.07 },
      { x: -10, y: 10, rotate: 8, delay: 0.12 },
      { x: 12, y: 10, rotate: -8, delay: 0.17 },
    ],
    [],
  );

  useEffect(() => {
    if (state === "deploying") {
      const timer = window.setTimeout(() => setState("online"), DEPLOY_MS);
      return () => window.clearTimeout(timer);
    }

    if (state === "retracting") {
      const timer = window.setTimeout(() => setState("idle"), RETRACT_MS);
      return () => window.clearTimeout(timer);
    }
  }, [state]);

  const toggle = () => {
    if (isBusy) return;
    setActiveTool(null);
    setState(isDeployed ? "retracting" : "deploying");
  };

  const executeTool = (tool: ReactorTool) => {
    if (state !== "online") return;
    setActiveTool(tool.id);
    tool.onClick?.();
    window.setTimeout(() => setActiveTool(null), 1300);
  };

  return (
    <div
      className="reactor-root fixed right-7 bottom-7 z-[80] h-[360px] w-[430px] select-none"
      aria-label="Control Center"
    >
      {/* ATMOSPHERE */}
      <motion.div
        animate={{
          opacity: isDeployed ? 0.75 : 0.32,
          scale: isDeployed ? 1.08 : 0.92,
        }}
        transition={{ duration: 0.65 }}
        className="pointer-events-none absolute -right-20 -bottom-20 h-[310px] w-[310px] rounded-full bg-violet-600/15 blur-[90px]"
      />

      <motion.div
        animate={{
          opacity: isDeployed ? 0.55 : 0.2,
          scale: isDeployed ? 1 : 0.82,
        }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="pointer-events-none absolute right-8 -bottom-8 h-[230px] w-[230px] rounded-full bg-cyan-400/10 blur-[75px]"
      />

      {/* RADIAL HUD - AN HOAN TOAN luc dong (opacity 0, khong phai 0.55 nhu
          truoc) vi vong tron 260px nay de lo ra ngoai vung nut bam, che len
          noi dung trang phia sau (vd text trong article) ngay ca khi Control
          Center dang dong. */}
      <motion.div
        animate={{
          opacity: isDeployed ? 1 : 0,
          scale: isDeployed ? 1 : 0.6,
        }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-none absolute right-0 bottom-0 h-[260px] w-[260px]"
      >
        <div className="absolute inset-0 rounded-full border border-violet-400/25" />
        <div className="reactor-spin absolute inset-[9px] rounded-full border border-dashed border-violet-300/35" />
        <div className="reactor-spin-reverse absolute inset-[25px] rounded-full border border-cyan-300/30" />
        <div className="absolute inset-[43px] rounded-full border border-violet-300/15" />
        <div className="reactor-grid absolute inset-[58px] rounded-full opacity-20" />

        {Array.from({ length: 24 }).map((_, index) => {
          const angle = index * 15;
          return (
            <span
              key={index}
              className="absolute top-1/2 left-1/2 h-px w-2 origin-left bg-violet-300/40"
              style={{ transform: `rotate(${angle}deg) translateX(122px)` }}
            />
          );
        })}

        <motion.div
          initial={{ opacity: 0 }}
          animate={isDeployed ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="reactor-scan absolute top-1/2 left-1/2 h-px w-[125px] origin-left bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent"
        />

        <motion.span
          animate={{
            rotate: isDeployed ? 360 : 0,
            opacity: isDeployed ? 1 : 0.2,
          }}
          transition={{
            rotate: { duration: 7, repeat: Infinity, ease: "linear" },
            opacity: { duration: 0.4 },
          }}
          className="absolute top-1/2 left-1/2 h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_14px_#22d3ee]"
          style={{ transformOrigin: "0 0", marginLeft: 0, marginTop: -4 }}
        />
      </motion.div>

      {/* MECHANICAL JOINTS / HOUSING */}
      {joints.map((joint, index) => (
        <motion.div
          key={index}
          custom={joint}
          variants={jointVariants}
          initial="idle"
          animate={state}
          className="pointer-events-none absolute right-[83px] bottom-[83px] h-[88px] w-[38px] origin-bottom"
          style={{ rotate: index * 90 }}
        >
          <div
            className="absolute inset-0 border border-violet-300/20 bg-[#080d1d]/80 shadow-[inset_0_0_18px_rgba(124,58,237,.08)]"
            style={{ clipPath: "polygon(18% 0,100% 0,82% 100%,0 100%)" }}
          />
          <span className="absolute top-2 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full border border-cyan-300/50 bg-[#07101d] shadow-[0_0_8px_rgba(34,211,238,.25)]" />
          <span className="absolute bottom-2 left-1/2 h-px w-4 -translate-x-1/2 bg-violet-300/35" />
        </motion.div>
      ))}

      {/* TOOL ARMS + TOOLS */}
      <AnimatePresence>
        {isDeployed &&
          tools.map((tool, index) => {
            const angle = 202 + index * (56 / Math.max(1, tools.length - 1));
            const radius = 142;
            const rad = (angle * Math.PI) / 180;
            const x = Math.cos(rad) * radius;
            const y = Math.sin(rad) * radius;
            const Icon = tool.icon;

            return (
              <motion.div
                key={tool.id}
                custom={index}
                variants={toolVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="pointer-events-auto absolute right-[86px] bottom-[86px]"
                style={{ marginRight: x, marginBottom: -y }}
              >
                <motion.span
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  exit={{ scaleX: 0, opacity: 0 }}
                  transition={{ duration: 0.28, delay: 0.06 + index * 0.085 }}
                  className="pointer-events-none absolute top-1/2 left-1/2 h-px w-[58px] origin-left -translate-y-1/2 bg-gradient-to-r from-violet-300/10 via-violet-300/45 to-transparent"
                  style={{ transform: `rotate(${angle + 180}deg)` }}
                />

                <motion.button
                  type="button"
                  disabled={state !== "online"}
                  onClick={() => executeTool(tool)}
                  whileHover={{ y: 5, scale: 1.08 }}
                  whileTap={{ scale: 0.94 }}
                  className={[
                    "group relative flex h-[68px] w-[82px] flex-col items-center justify-center rounded-[18px]",
                    "border border-white/10 bg-[#0a1020]/90 backdrop-blur-xl",
                    "shadow-[0_12px_34px_rgba(0,0,0,.22)]",
                    "transition-colors duration-200",
                    "hover:border-violet-300/35 hover:bg-[#10162a]",
                    "hover:shadow-[0_12px_42px_rgba(124,58,237,.22)]",
                    "disabled:cursor-default",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "absolute inset-0 rounded-[18px] opacity-0 transition-opacity duration-200 group-hover:opacity-100",
                      tool.tone === "cyan"
                        ? "bg-cyan-300/[0.045]"
                        : "bg-violet-300/[0.05]",
                    ].join(" ")}
                  />

                  <span
                    className={[
                      "relative grid h-9 w-9 place-items-center rounded-xl border",
                      tool.tone === "cyan"
                        ? "border-cyan-300/20 bg-cyan-300/[0.07] text-cyan-200"
                        : tool.tone === "blue"
                          ? "border-blue-300/20 bg-blue-300/[0.07] text-blue-200"
                          : "border-violet-300/20 bg-violet-300/[0.07] text-violet-200",
                    ].join(" ")}
                  >
                    <Icon size={16} />
                  </span>

                  <span className="relative mt-1.5 text-[9px] font-medium text-slate-400 transition-colors group-hover:text-slate-100">
                    {tool.label}
                  </span>

                  <span className="absolute -bottom-px left-1/2 h-px w-7 -translate-x-1/2 bg-gradient-to-r from-transparent via-violet-300/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                </motion.button>
              </motion.div>
            );
          })}
      </AnimatePresence>

      {/* CORE HOUSING */}
      <motion.div
        animate={{ scale: isDeployed ? 1 : 0.96, rotate: isDeployed ? 0 : -4 }}
        transition={{ type: "spring", stiffness: 320, damping: 24 }}
        className="absolute right-0 bottom-0 h-[126px] w-[126px]"
      >
        <div className="absolute inset-0 rounded-full border border-violet-300/25 bg-[#070b18]/90 shadow-[0_18px_50px_rgba(0,0,0,.35)] backdrop-blur-xl" />
        <div className="absolute inset-[7px] rounded-full border border-dashed border-violet-300/30" />

        <motion.div
          animate={{ rotate: isDeployed ? 360 : 0 }}
          transition={{
            rotate: { duration: 10, repeat: Infinity, ease: "linear" },
          }}
          className="absolute inset-[15px] rounded-full border border-cyan-300/20"
        />

        <motion.div
          animate={{
            scale: isDeployed ? [0.92, 1.08, 0.92] : 0.75,
            opacity: isDeployed ? [0.35, 0.7, 0.35] : 0.15,
          }}
          transition={{
            duration: 2.8,
            repeat: isDeployed ? Infinity : 0,
            ease: "easeInOut",
          }}
          className="absolute inset-[22px] rounded-full bg-cyan-400/15 blur-xl"
        />

        <motion.button
          type="button"
          onClick={toggle}
          disabled={isBusy}
          aria-label={isDeployed ? "Đóng Control Center" : "Mở Control Center"}
          className="absolute inset-[28px] grid place-items-center rounded-full border border-cyan-200/40 bg-gradient-to-br from-violet-500 via-blue-500 to-cyan-400 text-white shadow-[0_0_28px_rgba(56,189,248,.32)] transition-shadow hover:shadow-[0_0_38px_rgba(56,189,248,.5)] disabled:cursor-wait"
          whileHover={!isBusy ? { scale: 1.06 } : undefined}
          whileTap={!isBusy ? { scale: 0.94 } : undefined}
        >
          <motion.span
            animate={{ rotate: isDeployed ? 180 : 0 }}
            transition={{ duration: 0.4 }}
          >
            {isDeployed ? <X size={19} /> : <SlidersHorizontal size={19} />}
          </motion.span>
        </motion.button>

        <AnimatePresence>
          {state === "deploying" && (
            <motion.div
              initial={{ scale: 0.2, opacity: 0 }}
              animate={{ scale: [0.2, 1.25, 1], opacity: [0, 0.9, 0.35] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.85, ease: "easeOut" }}
              className="pointer-events-none absolute inset-[14px] rounded-full border border-cyan-200/70 shadow-[0_0_40px_rgba(34,211,238,.5)]"
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* LABEL */}
      <motion.div
        animate={{ opacity: isDeployed ? 1 : 0.7, x: isDeployed ? -4 : 0 }}
        transition={{ duration: 0.35 }}
        className="pointer-events-none absolute right-[142px] bottom-[13px] text-right"
      >
        <div className="flex items-center justify-end gap-2">
          <span
            className={[
              "h-2 w-2 rounded-full",
              state === "online"
                ? "bg-cyan-300 shadow-[0_0_9px_#22d3ee]"
                : state === "deploying"
                  ? "bg-amber-300 shadow-[0_0_9px_#fcd34d]"
                  : "bg-violet-300/50",
            ].join(" ")}
          />
          <span className="text-[13px] font-semibold tracking-[0.14em] text-violet-300">
            {label}
          </span>
        </div>

        <div className="mt-1 text-[11px] text-slate-500">
          {state === "deploying"
            ? "Khởi động hệ thống..."
            : state === "online"
              ? sublabel
              : state === "retracting"
                ? "Thu hồi module..."
                : "Click để khởi động"}
        </div>
      </motion.div>

      {/* BOOT STATUS */}
      <AnimatePresence>
        {state === "deploying" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="pointer-events-none absolute right-[128px] bottom-[142px] flex items-center gap-2 rounded-lg border border-cyan-300/10 bg-[#070d19]/85 px-3 py-2 backdrop-blur-xl"
          >
            <Sparkles size={12} className="text-cyan-300" />
            <span className="text-[8px] tracking-[0.12em] text-cyan-200/80">
              REACTOR BOOTING
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ACTIVE TOOL STATUS */}
      <AnimatePresence>
        {activeTool && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5 }}
            className="pointer-events-none absolute right-[110px] bottom-[155px] rounded-xl border border-violet-300/15 bg-[#080e1c]/90 px-3 py-2 shadow-xl backdrop-blur-xl"
          >
            <div className="flex items-center gap-2 text-[9px] text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#22d3ee]" />
              {tools.find((tool) => tool.id === activeTool)?.label} đã sẵn sàng
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ControlCenterReactor;
