"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Folder } from "lucide-react";
import type { ApiWorkspaceWithGroups } from "@/lib/api/types";

// Hieu ung chuyen canh luc bam vao 1 workspace - 3 buoc don gian (thay ban
// sci-fi/JARVIS cu co progress bar gia lap 2.4s):
//   1. Chon workspace - click 1 WorkspaceCard (xem WorkspaceSwitcher.tsx).
//   2. Card PHONG TO That qua Framer Motion layoutId - component nay va
//      WorkspaceCard chia se DUNG layoutId `workspace-card-<id>`, Framer
//      Motion tu FLIP-animate vi tri/kich thuoc tu o luoi den full man hinh
//      (khong phai 2 phan tu doc lap crossfade).
//   3. Nen luoi (dong bo mau/pattern voi StarfieldBackground.tsx - lop rieng
//      o day vi StarfieldBackground la 1 instance co dinh o layout.tsx,
//      khong tu do scale duoc) zoom+hoi tu vao tam, chay SONG SONG voi card.
// Dieu huong THAT (router.push, khong con progress % gia lap) ngay sau khi
// card phong to xong.
const EXPAND_SPRING = {
  type: "spring" as const,
  stiffness: 220,
  damping: 28,
  mass: 0.9,
};

const EXPAND_DURATION_MS = 650;

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
  useEffect(() => {
    const timer = setTimeout(() => onEnter(workspace), EXPAND_DURATION_MS);
    return () => clearTimeout(timer);
  }, [workspace, onEnter]);

  return (
    <>
      {/* Buoc 3: nen luoi zoom + hoi tu vao tam */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-20 mask-[radial-gradient(ellipse_70%_60%_at_50%_50%,#000_60%,transparent_100%)]"
        initial={{ scale: 1, opacity: 0 }}
        animate={{ scale: 2.2, opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: EXPAND_DURATION_MS / 1000, ease: [0.76, 0, 0.24, 1] }}
        style={{
          background: "var(--background)",
          backgroundImage:
            "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
          backgroundSize: "20px 30px",
        }}
      />

      {/* Buoc 2: card phong to That (layoutId chia se voi WorkspaceCard) */}
      <motion.div
        layoutId={`workspace-card-${workspace.id}`}
        transition={EXPAND_SPRING}
        className="fixed inset-6 z-30 flex flex-col items-center justify-center gap-3 overflow-hidden rounded-[28px] sm:inset-16"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          boxShadow: "0 30px 90px rgba(16, 24, 40, 0.25)",
        }}
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
        <h2 className="text-xl font-semibold" style={{ color: "var(--ink)" }}>
          {workspace.name}
        </h2>
        <p className="text-sm" style={{ color: "var(--ink-faint)" }}>
          {workspace.groups.length} nhóm kiến thức
        </p>
      </motion.div>
    </>
  );
}
