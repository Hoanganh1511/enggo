"use client";

import { motion } from "framer-motion";
import type { ReactorTool } from "@/components/ui/control-center-reactor";

// Gradient CTA dung chung cua khu vuc Workspace (xem
// docs/workspace-style-guide.md muc 8 / GroupArticleToc.tsx).
const CTA_GRADIENT = "linear-gradient(135deg, #20c5d8, #269ce9, #326eea)";

// Toolbar noi don gian goc phai, thay the ControlCenterReactor (hieu ung co
// khi/deploy-retract khong con hop tong sang moi cua trang chon workspace -
// xem layout.tsx). Nut "create-workspace" (dang ky dong qua
// workspace-toolbar-context.tsx) hien rieng, to, mau CTA - cac tool tinh con
// lai CHUA co onClick that (xem staticTools trong layout.tsx) hien disabled
// that su (khong gia vo co chuc nang), chi bao "Sắp có" qua title.
export function WorkspaceQuickToolbar({ tools }: { tools: ReactorTool[] }) {
  const primary = tools.find((t) => t.id === "create-workspace");
  const secondary = tools.filter((t) => t.id !== "create-workspace");

  return (
    <div className="fixed top-24 right-6 z-30 flex flex-col items-center gap-2.5">
      {primary && (
        <motion.button
          type="button"
          onClick={primary.onClick}
          title={primary.label}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: "spring", stiffness: 420, damping: 20 }}
          className="flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-full text-white"
          style={{
            background: CTA_GRADIENT,
            border: "1px solid rgba(255,255,255,0.35)",
            boxShadow: "0 10px 26px rgba(40,125,235,0.35)",
          }}
        >
          <primary.icon size={20} strokeWidth={2.2} />
        </motion.button>
      )}

      {secondary.map((tool) => {
        const enabled = !!tool.onClick;
        const Icon = tool.icon;
        return (
          <motion.button
            key={tool.id}
            type="button"
            onClick={tool.onClick}
            disabled={!enabled}
            title={enabled ? tool.label : "Sắp có"}
            whileHover={enabled ? { scale: 1.06 } : undefined}
            whileTap={enabled ? { scale: 0.94 } : undefined}
            transition={{ type: "spring", stiffness: 420, damping: 20 }}
            className="shadow-panel flex size-11 shrink-0 items-center justify-center rounded-full bg-surface"
            style={{
              border: "1px solid var(--border)",
              color: enabled ? "var(--ink-muted)" : "var(--ink-disabled)",
              cursor: enabled ? "pointer" : "not-allowed",
            }}
          >
            <Icon size={17} strokeWidth={1.9} />
          </motion.button>
        );
      })}
    </div>
  );
}
