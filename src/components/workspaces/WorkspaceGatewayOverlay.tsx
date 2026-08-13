"use client";

import { useEffect, useState, useTransition } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import {
  BrainCircuit,
  CheckCircle2,
  FileText,
  GitBranch,
  LoaderCircle,
  Network,
  Sparkles,
} from "lucide-react";
import type { ApiWorkspaceWithGroups } from "@/lib/api/types";

// Hieu ung "gateway" sci-fi/JARVIS luc bam vao 1 workspace - bê nguyên tu
// source rieng "workspace-gateway" (README cua source de xuat dung y het:
// giu nguyen animation gateway lam lop chuyen canh, doi hanh dong cuoi cung
// "Back to workspaces" thanh dieu huong vao trang chi tiet that -
// router.push(`/workspace/${username}/${workspace.id}`), xem onEnter). Khac
// source: (1) du lieu THAT (branches = tung ApiKnowledgeGroup that cua
// workspace, khong phai mock), (2) khong tu ve starfield rieng - trang da co
// StarfieldBackground o layout.tsx roi, (3) progress 0->100% van la GIA LAP
// co dinh 2.4s (giong nguyen ban goc) - day la hieu ung "AI transition"
// mang tinh trinh dien, khong gan voi 1 tac vu fetch that nao (trang chi
// tiet se tu fetch lai du lieu fresh khi dieu huong toi).
type GatewayPhase = "selected" | "opening" | "loading" | "complete";

const spring = {
  type: "spring" as const,
  stiffness: 170,
  damping: 22,
  mass: 0.8,
};

export function WorkspaceGatewayOverlay({
  workspace,
  onEnter,
}: {
  workspace: ApiWorkspaceWithGroups | null;
  onEnter: (workspace: ApiWorkspaceWithGroups) => void;
}) {
  return (
    <AnimatePresence>
      {workspace && (
        // key=workspace.id: MOI lan chon 1 workspace khac la 1 GatewayMachine
        // MOI (remount voi state khoi tao lai tu dau qua useState initializer)
        // thay vi 1 instance song song reset qua setState trong effect - tranh
        // loi eslint react-hooks/set-state-in-effect (goi setState dong bo
        // ngay dau effect de "reset" khi 1 dep doi la pattern bi cam trong
        // React Compiler ruleset, nen dung remount-by-key thay the).
        <GatewayMachine key={workspace.id} workspace={workspace} onEnter={onEnter} />
      )}
    </AnimatePresence>
  );
}

function GatewayMachine({
  workspace,
  onEnter,
}: {
  workspace: ApiWorkspaceWithGroups;
  onEnter: (workspace: ApiWorkspaceWithGroups) => void;
}) {
  const [phase, setPhase] = useState<GatewayPhase>("selected");
  const [progress, setProgress] = useState(0);
  const selectedControls = useAnimationControls();
  // router.push that su can 1 nhip de fetch trang moi (Server Component chi
  // tiet tu goi API rieng) - boc qua useTransition de hien hieu ung "Đang
  // chuyển hướng..." trong luc cho, thay vi man hinh dung im lang.
  const [, startNavigate] = useTransition();

  // Xong 100% la TU DONG vao workspace, khong doi bam nut nua - giu 1 nhip
  // ngan de nguoi dung kip thay badge "Hoàn tất" truoc khi dieu huong.
  useEffect(() => {
    if (phase !== "complete") return;
    const timer = setTimeout(() => {
      startNavigate(() => onEnter(workspace));
    }, 550);
    return () => clearTimeout(timer);
  }, [phase, onEnter, workspace]);

  useEffect(() => {
    let cancelled = false;

    const sequence = async () => {
      await new Promise((resolve) => setTimeout(resolve, 80));
      if (cancelled) return;

      await selectedControls.start({
        scale: 1.12,
        transition: { ...spring, duration: 0.85 },
      });

      if (cancelled) return;
      setPhase("opening");

      await new Promise((resolve) => setTimeout(resolve, 420));
      if (cancelled) return;
      setPhase("loading");

      const start = performance.now();
      const duration = 2400;

      const tick = (now: number) => {
        if (cancelled) return;
        const p = Math.min(100, ((now - start) / duration) * 100);
        setProgress(p);

        if (p < 100) {
          requestAnimationFrame(tick);
        } else {
          setPhase("complete");
        }
      };

      requestAnimationFrame(tick);
    };

    sequence();

    return () => {
      cancelled = true;
    };
  }, [selectedControls]);

  return (
    <>
      <motion.div
            className="pointer-events-none fixed inset-0 z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="laser-scene absolute inset-0">
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: [0, 1, 1, 0.25], scaleX: [0, 1, 1, 1] }}
                transition={{ duration: 0.9, times: [0, 0.25, 0.75, 1], ease: "easeOut" }}
                className="jarvis-laser"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 1, 0.6], scale: [0, 1.4, 1] }}
                transition={{ duration: 0.75, ease: "easeOut" }}
                className="laser-core"
              />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.75, 0] }}
                transition={{ delay: 0.2, duration: 1.1 }}
                className="laser-sweep"
              />
            </div>
          </motion.div>

          <motion.div
            className="fixed inset-0 z-30 bg-[#01050c]/40 backdrop-blur-[1px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === "selected" ? 0 : 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            animate={selectedControls}
            initial={{ scale: 1 }}
            className="fixed top-1/2 left-1/2 z-40"
            style={{ translateX: "-50%", translateY: "-50%" }}
          >
            <motion.div
              animate={{
                opacity: phase === "selected" ? 0 : 1,
                scale: phase === "selected" ? 0.98 : 1,
              }}
              transition={{ duration: 0.35 }}
              className="workspace-gateway"
            >
              <GatewayDoor workspace={workspace} phase={phase} progress={progress} />

              <AnimatePresence>
                {phase === "complete" && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-[calc(100%+24px)] left-1/2 w-max -translate-x-1/2"
                  >
                    <div className="flex items-center gap-2 rounded-full border border-cyan-300/15 bg-[#06101b]/85 px-4 py-2.5 text-[11px] text-cyan-200 shadow-2xl backdrop-blur-xl">
                      <LoaderCircle size={13} className="animate-spin" />
                      Đang chuyển hướng...
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
    </>
  );
}

function GatewayDoor({
  workspace,
  phase,
  progress,
}: {
  workspace: ApiWorkspaceWithGroups;
  phase: GatewayPhase;
  progress: number;
}) {
  const branches = workspace.groups.slice(0, 8);

  return (
    <div className="relative w-[min(820px,calc(100vw-36px))]">
      <div className="gateway-title mb-5 text-center">
        <motion.div
          initial={{ opacity: 0, y: 7 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-2 text-[9px] tracking-[.28em] text-cyan-300/60 uppercase"
        >
          Workspace initialized
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl font-semibold tracking-tight text-slate-100"
        >
          {workspace.name}
        </motion.h2>
      </div>

      <div className="door-frame">
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.72, ease: [0.76, 0, 0.24, 1] }}
          className="door-center-line"
        />

        <motion.div
          initial={{ y: 0 }}
          animate={{ y: "-51%" }}
          transition={{ delay: 0.16, duration: 0.95, ease: [0.76, 0, 0.24, 1] }}
          className="door-panel door-panel-top"
        >
          <DoorGrid />
        </motion.div>

        <motion.div
          initial={{ y: 0 }}
          animate={{ y: "51%" }}
          transition={{ delay: 0.16, duration: 0.95, ease: [0.76, 0, 0.24, 1] }}
          className="door-panel door-panel-bottom"
        >
          <DoorGrid />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: phase === "selected" ? 0 : 1 }}
          transition={{ delay: 0.62, duration: 0.5 }}
          className="door-content"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="gateway-logo">
              <BrainCircuit size={22} />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-100">Knowledge Space</div>
              <div className="mt-0.5 text-[10px] text-slate-600">
                {workspace.description ?? "Chưa có mô tả"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {branches.length === 0 ? (
              <p className="col-span-full text-center text-[11px] text-slate-600">
                Chưa có nhóm kiến thức nào.
              </p>
            ) : (
              branches.map((group, index) => (
                <motion.div
                  key={group.id}
                  // Bat dau MO/ghost (khong phai an han opacity:0) - the
                  // luoi hien dien mo nhat truoc, tung the "sang len" ro net
                  // 1 luc SAU LAN LUOT (delay giai theo index) de dong bo
                  // cam giac "dang tai" voi thanh AI transition ben duoi.
                  // KHONG dung filter:blur() (tung gay net mo du/giat o
                  // sidebar list - xem WorkspaceDetail.tsx) - chi opacity/y/
                  // scale, deu la thuoc tinh GPU-compositor re, van du "mo
                  // dan sang len" ma khong lam chu bi nhoe sau khi animation
                  // ket thuc.
                  initial={{ opacity: 0.12, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    delay: 0.75 + index * 0.16,
                    duration: 0.55,
                    ease: "easeOut",
                  }}
                  className="branch-card"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="grid size-8 place-items-center rounded-lg bg-white/[.035] text-cyan-300/75 ring-1 ring-white/7">
                      {index % 3 === 0 ? (
                        <Network size={15} />
                      ) : index % 3 === 1 ? (
                        <FileText size={15} />
                      ) : (
                        <GitBranch size={15} />
                      )}
                    </span>
                    <span className="text-[10px] text-slate-600">
                      {String(group.postCount).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="truncate text-[11px] font-semibold text-slate-300">
                    {group.name}
                  </div>
                  <div className="mt-1 text-[9px] text-slate-600">
                    {group.visibility === "PUBLIC" ? "Công khai" : "Riêng tư"}
                  </div>
                </motion.div>
              ))
            )}
          </div>

          <div className="mt-6 border-t border-white/7 pt-5">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] tracking-[.18em] text-cyan-300/60 uppercase">
                <Sparkles size={12} />
                AI transition
              </div>
              <div className="font-mono text-[11px] text-cyan-200">{Math.round(progress)}%</div>
            </div>
            <FluidProgress progress={progress} />
            <div className="mt-2 flex items-center justify-between text-[9px]">
              <span className="text-slate-700">Indexing knowledge graph</span>
              <AnimatePresence mode="wait">
                {phase === "complete" ? (
                  <motion.span
                    key="ready"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 420, damping: 22 }}
                    className="flex items-center gap-1 font-semibold text-emerald-300"
                  >
                    <CheckCircle2 size={11} /> Hoàn tất
                  </motion.span>
                ) : (
                  <motion.span
                    key="sync"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-slate-700"
                  >
                    Synchronizing...
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function DoorGrid() {
  return (
    <div className="door-grid">
      {Array.from({ length: 9 }).map((_, i) => (
        <span key={i} />
      ))}
    </div>
  );
}

function FluidProgress({ progress }: { progress: number }) {
  return (
    <div className="fluid-track">
      <motion.div
        className="fluid-fill"
        initial={{ width: "0%" }}
        animate={{ width: `${progress}%` }}
        transition={{ ease: "linear", duration: 0.08 }}
      >
        <div className="fluid-wave wave-a" />
        <div className="fluid-wave wave-b" />
        <div className="fluid-bubbles">
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className="fluid-glow" />
      </motion.div>
    </div>
  );
}
