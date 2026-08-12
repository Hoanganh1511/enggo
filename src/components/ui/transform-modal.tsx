"use client";

import { useEffect } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { Cpu, X, Sparkles, ChevronRight, Zap } from "lucide-react";

interface TransformModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  // Footer mac dinh la thanh trang thai + nut "Initialize" trang tri (demo).
  // Truyen footer rieng (hoac null de an han) khi children da co san hanh
  // dong that (nut submit cua form...) - tranh 2 nut hanh dong chong nhau,
  // 1 that 1 gia.
  footer?: React.ReactNode;
}

const spring = {
  type: "spring" as const,
  stiffness: 220,
  damping: 22,
  mass: 0.8,
};

// Modal "mechanical transformation" kieu robot bien hinh - bê nguyên hieu
// ung/bo cuc tu source nguoi dung dua (4 panel co khi truot/xoay tu 4 huong
// ghep vao + than chinh phinh ra tu tam theo hieu ung 3D perspective), giu
// nguyen bang mau cyan/violet hardcode (dong bo voi StarfieldBackground +
// Control Center - ca 3 cung thuoc "vu tru" Workspace, co chu dich KHONG doi
// theo theme sang/toi cua app nhu cac component thuong khac). Sua so voi
// ban goc: (1) type Variants that cho prop "variants" (goc de `any`), (2)
// them dong bang ESC + bam ra ngoai backdrop de dong - Radix Dialog dang
// dung truoc do co san 2 hanh vi nay, bo di se la 1 buoc lui UX, (3) them
// prop "footer" de tai su dung cho form that (footer mac dinh chi la demo).
export default function TransformModal({
  open,
  onClose,
  title = "Create Workspace",
  description = "Configure your new knowledge workspace.",
  children,
  footer,
}: TransformModalProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence mode="wait">
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
          initial="closed"
          animate="open"
          exit="closed"
        >
          {/* BACKDROP */}
          <motion.div
            className="absolute inset-0 bg-[#020611]/80 backdrop-blur-[8px]"
            onClick={onClose}
            variants={{
              closed: { opacity: 0 },
              open: { opacity: 1, transition: { duration: 0.3 } },
            }}
          />

          {/* Ambient cyan */}
          <motion.div
            className="pointer-events-none absolute top-[35%] left-[35%] h-[400px] w-[400px] rounded-full bg-cyan-400/10 blur-[120px]"
            variants={{
              closed: { opacity: 0, scale: 0.5 },
              open: { opacity: 1, scale: 1, transition: { duration: 0.8 } },
            }}
          />

          {/* Ambient violet */}
          <motion.div
            className="pointer-events-none absolute right-[25%] bottom-[25%] h-[300px] w-[300px] rounded-full bg-violet-500/10 blur-[100px]"
            variants={{
              closed: { opacity: 0 },
              open: { opacity: 1, transition: { delay: 0.15, duration: 0.8 } },
            }}
          />

          {/* TRANSFORMER CONTAINER */}
          <div className="pointer-events-none relative h-[620px] w-[780px]">
            <MechanicalPanel
              position="top-left"
              variants={{
                closed: { x: -260, y: -180, rotate: -28, opacity: 0 },
                open: {
                  x: 0,
                  y: 0,
                  rotate: 0,
                  opacity: 1,
                  transition: { ...spring, delay: 0.03 },
                },
              }}
            />
            <MechanicalPanel
              position="top-right"
              variants={{
                closed: { x: 260, y: -180, rotate: 28, opacity: 0 },
                open: {
                  x: 0,
                  y: 0,
                  rotate: 0,
                  opacity: 1,
                  transition: { ...spring, delay: 0.08 },
                },
              }}
            />
            <MechanicalPanel
              position="bottom-left"
              variants={{
                closed: { x: -260, y: 180, rotate: 28, opacity: 0 },
                open: {
                  x: 0,
                  y: 0,
                  rotate: 0,
                  opacity: 1,
                  transition: { ...spring, delay: 0.13 },
                },
              }}
            />
            <MechanicalPanel
              position="bottom-right"
              variants={{
                closed: { x: 260, y: 180, rotate: -28, opacity: 0 },
                open: {
                  x: 0,
                  y: 0,
                  rotate: 0,
                  opacity: 1,
                  transition: { ...spring, delay: 0.18 },
                },
              }}
            />

            {/* SIDE ARM PANELS */}
            <motion.div
              className="absolute top-1/2 left-[28px] h-[260px] w-[42px] -translate-y-1/2 border-y border-cyan-300/30 bg-gradient-to-b from-cyan-400/10 via-[#0b1827] to-cyan-400/10"
              variants={{
                closed: { x: -180, rotateY: -70, opacity: 0 },
                open: {
                  x: 0,
                  rotateY: 0,
                  opacity: 1,
                  transition: { ...spring, delay: 0.22 },
                },
              }}
            />
            <motion.div
              className="absolute top-1/2 right-[28px] h-[260px] w-[42px] -translate-y-1/2 border-y border-cyan-300/30 bg-gradient-to-b from-cyan-400/10 via-[#0b1827] to-cyan-400/10"
              variants={{
                closed: { x: 180, rotateY: 70, opacity: 0 },
                open: {
                  x: 0,
                  rotateY: 0,
                  opacity: 1,
                  transition: { ...spring, delay: 0.26 },
                },
              }}
            />

            {/* MAIN BODY */}
            <motion.div
              className="pointer-events-auto absolute top-1/2 left-1/2 w-[620px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[22px] border border-cyan-300/20 bg-[#07111e]/95 shadow-[0_0_80px_rgba(34,211,238,.12)] backdrop-blur-2xl"
              variants={{
                closed: { scale: 0.25, rotateX: -55, rotateY: 25, opacity: 0 },
                open: {
                  scale: 1,
                  rotateX: 0,
                  rotateY: 0,
                  opacity: 1,
                  transition: {
                    type: "spring" as const,
                    stiffness: 180,
                    damping: 20,
                    mass: 0.8,
                    delay: 0.2,
                  },
                },
              }}
              style={{ transformPerspective: 1200 }}
            >
              {/* SCAN LINE */}
              <motion.div
                className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-300 to-transparent"
                initial={{ x: "-100%", opacity: 0 }}
                animate={{ x: "100%", opacity: [0, 1, 1, 0] }}
                transition={{ duration: 1.2, delay: 0.35, ease: "easeInOut" }}
              />

              {/* HEADER */}
              <div className="relative flex items-center justify-between border-b border-white/[0.06] px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="relative grid h-11 w-11 place-items-center rounded-xl border border-cyan-300/20 bg-cyan-400/[0.06] text-cyan-300">
                    <Cpu size={20} />
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_10px_#22d3ee]" />
                  </div>
                  <div>
                    <div className="text-[9px] font-semibold tracking-[0.18em] text-cyan-300/70">
                      SYSTEM MODULE
                    </div>
                    <h2 className="mt-1 text-lg font-semibold text-white">{title}</h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Đóng"
                  className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-slate-400 transition hover:border-cyan-300/30 hover:bg-cyan-300/[0.06] hover:text-cyan-200"
                >
                  <X size={17} />
                </button>
              </div>

              {/* CONTENT */}
              <div className="px-6 py-7">
                <div className="mb-6">
                  <div className="flex items-center gap-2 text-[10px] text-cyan-300/70">
                    <Sparkles size={13} />
                    INITIALIZATION COMPLETE
                  </div>
                  <p className="mt-2 max-w-[480px] text-sm leading-6 text-slate-400">
                    {description}
                  </p>
                </div>

                {children ?? (
                  <div className="grid grid-cols-2 gap-3">
                    <ModuleCard title="Knowledge" />
                    <ModuleCard title="Resources" />
                    <ModuleCard title="Learning Path" />
                    <ModuleCard title="AI Assistant" />
                  </div>
                )}
              </div>

              {/* FOOTER */}
              {footer !== null &&
                (footer ?? (
                  <div className="flex items-center justify-between border-t border-white/[0.06] px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                      <span className="text-[9px] tracking-wide text-slate-500">
                        SYSTEM ONLINE
                      </span>
                    </div>
                    <button
                      type="button"
                      className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2.5 text-[10px] font-semibold text-white shadow-[0_8px_25px_rgba(6,182,212,.2)] transition hover:shadow-[0_8px_35px_rgba(6,182,212,.35)]"
                    >
                      Initialize
                      <ChevronRight size={14} />
                    </button>
                  </div>
                ))}
            </motion.div>

            {/* CENTER CORE */}
            <motion.div
              className="pointer-events-none absolute top-1/2 left-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/[0.04]"
              variants={{
                closed: { scale: 0.4, opacity: 0 },
                open: { scale: 1, opacity: 1, transition: { duration: 0.8, delay: 0.1 } },
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MechanicalPanel({
  position,
  variants,
}: {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  variants: Variants;
}) {
  const positionClasses: Record<typeof position, string> = {
    "top-left": "left-[45px] top-[55px]",
    "top-right": "right-[45px] top-[55px]",
    "bottom-left": "bottom-[55px] left-[45px]",
    "bottom-right": "bottom-[55px] right-[45px]",
  };

  return (
    <motion.div
      variants={variants}
      className={`absolute ${positionClasses[position]} h-[150px] w-[220px]`}
    >
      <div
        className="absolute inset-0 border border-cyan-300/[0.12] bg-[#081521]/80 shadow-[inset_0_0_30px_rgba(34,211,238,.03)] backdrop-blur-sm"
        style={{
          clipPath: "polygon(0 0, 88% 0, 100% 18%, 100% 100%, 12% 100%, 0 82%)",
        }}
      />
      <span className="absolute top-4 left-4 h-px w-14 bg-cyan-300/30" />
      <span className="absolute top-7 left-4 h-px w-7 bg-cyan-300/15" />
      <span className="absolute right-4 bottom-4 h-px w-16 bg-violet-400/25" />
      <span className="absolute top-4 right-4 h-2 w-2 rounded-full border border-cyan-300/40" />
    </motion.div>
  );
}

function ModuleCard({ title }: { title: string }) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -3, borderColor: "rgba(34,211,238,.25)" }}
      className="group rounded-xl border border-white/[0.07] bg-white/[0.025] p-4 text-left transition hover:bg-cyan-300/[0.035]"
    >
      <div className="mb-5 flex items-center justify-between">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-cyan-300/[0.07] text-cyan-300">
          <Zap size={15} />
        </div>
        <ChevronRight
          size={14}
          className="text-slate-600 transition group-hover:translate-x-1 group-hover:text-cyan-300"
        />
      </div>
      <div className="text-xs font-medium text-slate-200">{title}</div>
      <div className="mt-1 text-[9px] text-slate-500">Configure module</div>
    </motion.button>
  );
}
