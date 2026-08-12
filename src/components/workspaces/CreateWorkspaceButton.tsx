"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useRipple } from "@/components/ui/ripple";
import { CreateWorkspaceModal } from "./CreateWorkspaceModal";

// The "+ Tao workspace" o giua man rong (chua co workspace nao) - khi da co
// san >=1 workspace, hanh dong nay chuyen han vao tool "Tao workspace" trong
// ControlCenterReactor (xem workspace-toolbar-context.tsx +
// WorkspaceSwitcher.tsx), khong con nut rieng nam ngoai toolbar nua.
export function CreateWorkspaceButton({ username }: { username: string }) {
  const [open, setOpen] = useState(false);
  // Cung 1 kieu tuong tac voi WorkspaceCard (WorkspaceSwitcher.tsx) - hover
  // nhe + click nay "giot nuoc" mau primary (khong co accent rieng nhu
  // workspace that).
  const { onPointerDown, rippleLayer } = useRipple("var(--primary)");

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        onPointerDown={onPointerDown}
        whileHover={{
          y: -3,
          borderColor: "var(--primary)",
          color: "var(--primary)",
          transition: { duration: 0.18, ease: "easeOut" },
        }}
        className="relative flex min-h-32 flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl text-sm font-medium"
        style={{ border: "2px dashed var(--border)", color: "var(--ink-faint)" }}
      >
        {rippleLayer}
        <Plus size={20} strokeWidth={2} />
        Tạo workspace
      </motion.button>

      <CreateWorkspaceModal open={open} onOpenChange={setOpen} username={username} />
    </>
  );
}
