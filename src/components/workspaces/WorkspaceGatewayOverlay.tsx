"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Folder } from "lucide-react";
import type { ApiWorkspaceWithGroups } from "@/lib/api/types";
import Spinner from "@/components/ui/spinner";

// Hieu ung chuyen canh luc bam vao 1 workspace:
//   1. Chon workspace - click 1 WorkspaceCard (xem WorkspaceSwitcher.tsx). Cac
//      the con lai rot xuong + mo dan roi bien mat (xu ly ngay trong
//      WorkspaceCard qua prop isTransitioning, khong lien quan file nay).
//   2. The duoc chon DI CHUYEN ra giua man hinh - qua Framer Motion layoutId
//      (component nay va WorkspaceCard chia se DUNG layoutId
//      `workspace-card-<id>`, Framer Motion tu FLIP-animate vi tri/kich thuoc
//      tu o luoi ra giua man hinh) - KHONG con phong to thanh 1 box
//      full-screen nhu ban truoc.
//   3. Khi the toi giua, noi dung ben trong crossfade tu icon/ten sang 1
//      spinner loading, giu 1 nhip ngan roi moi dieu huong That (router.push).
const MOVE_SPRING = {
  type: "spring" as const,
  stiffness: 220,
  damping: 28,
  mass: 0.9,
};

const MOVE_DURATION_MS = 550;
const SPINNER_HOLD_MS = 500;

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
        // key=workspace.id: moi lan chon 1 workspace khac la 1 instance MOI
        // (remount) - tranh phai tu reset timer/state qua effect.
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
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    const toSpinner = setTimeout(() => setShowSpinner(true), MOVE_DURATION_MS);
    const toEnter = setTimeout(
      () => onEnter(workspace),
      MOVE_DURATION_MS + SPINNER_HOLD_MS,
    );
    return () => {
      clearTimeout(toSpinner);
      clearTimeout(toEnter);
    };
  }, [workspace, onEnter]);

  return (
    <>
      {/* Lop nen dim nhe phia sau the - khong con zoom grid pattern nhu ban
          cu (do gan voi hieu ung box full-screen, gio the chi di chuyen ra
          giua nen dim nhe la du). */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: MOVE_DURATION_MS / 1000, ease: [0.76, 0, 0.24, 1] }}
        style={{
          background: "color-mix(in srgb, var(--background) 65%, transparent)",
        }}
      />

      {/* The duoc chon - layoutId chia se voi WorkspaceCard nen Framer Motion
          tu FLIP vi tri/kich thuoc tu o luoi ra giua man hinh. */}
      <motion.div
        layoutId={`workspace-card-${workspace.id}`}
        transition={MOVE_SPRING}
        className="fixed left-1/2 top-1/2 z-30 flex w-56 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl p-6"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          boxShadow: "0 30px 90px rgba(16, 24, 40, 0.25)",
        }}
      >
        <AnimatePresence mode="wait">
          {!showSpinner ? (
            <motion.div
              key="info"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center gap-3"
            >
              <span
                className="flex size-16 shrink-0 items-center justify-center rounded-2xl text-3xl"
                style={{
                  background: `color-mix(in srgb, ${workspace.color ?? "var(--primary)"} 12%, transparent)`,
                  color: workspace.color ?? "var(--primary)",
                }}
              >
                {workspace.icon ?? <Folder size={28} strokeWidth={1.5} />}
              </span>
              <h2 className="text-base font-semibold" style={{ color: "var(--ink)" }}>
                {workspace.name}
              </h2>
            </motion.div>
          ) : (
            <motion.div
              key="spinner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center gap-3 py-2"
            >
              <Spinner size={28} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
