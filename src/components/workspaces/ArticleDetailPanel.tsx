"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Folder } from "lucide-react";
import type { ApiKnowledgeGroup } from "@/lib/api/types";
import { PANEL_SPRING } from "./motion";
import { KnowledgeGroupCollabRequestsPanel } from "./KnowledgeGroupCollabRequestsPanel";
import { PostEditorModal } from "./PostEditorModal";
import { WorkspaceButton } from "./WorkspaceButton";
import { useWorkspaceShell } from "./workspace-shell-context";

function Metric({ value, label }: { value: string | number; label: string }) {
  return (
    <div
      className="rounded-[9px] p-2.5 text-center"
      style={{
        border: "1px solid var(--border)",
        background: "var(--surface-muted)",
      }}
    >
      <strong className="block text-[13px]" style={{ color: "var(--ink)" }}>
        {value}
      </strong>
      <span
        className="mt-0.5 block text-[7px]"
        style={{ color: "var(--ink-faint)" }}
      >
        {label}
      </span>
    </div>
  );
}

// Panel phai - tong quan NHOM dang chon. Danh sach "Bai viet trong nhom" da
// CHUYEN het sang GroupArticleToc.tsx (panel trai, xem yeu cau nguoi dung) -
// bo phan preview trung lap o day, chi con thong tin tong quan + hanh dong
// (duyet yeu cau cong tac, viet bai moi). Truot vao 1 LAN duy nhat luc mount
// (khong doi lai luc chuyen nhom), bao panelsReady qua context khi animation
// settle xong.
export function ArticleDetailPanel({ group }: { group: ApiKnowledgeGroup }) {
  const { username, isSelf, workspace, setPanelsReady } = useWorkspaceShell();
  const [composerOpen, setComposerOpen] = useState(false);

  return (
    <>
      <motion.aside
        initial={{ x: 420, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={PANEL_SPRING}
        onAnimationComplete={() => setPanelsReady(true)}
        className="shadow-panel flex w-[420px] shrink-0 flex-col overflow-hidden rounded-[13px] backdrop-blur-md"
        style={{
          border: "1px solid var(--border)",
          background: "color-mix(in srgb, var(--surface) 82%, transparent)",
        }}
      >
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <div
            className="flex items-center gap-3 rounded-[13px] p-3.5"
            style={{
              border: "1px solid var(--border)",
              background:
                "linear-gradient(135deg, var(--surface-raised), var(--surface))",
            }}
          >
            <span
              className="flex size-[62px] shrink-0 items-center justify-center rounded-xl"
              style={{
                color: "var(--knowledge)",
                background:
                  "radial-gradient(circle, var(--knowledge-soft), var(--surface))",
              }}
            >
              <Folder size={30} strokeWidth={1.5} />
            </span>
            <div className="min-w-0">
              <span
                className="text-[9px] font-bold tracking-wide"
                style={{ color: "var(--ink-faint)" }}
              >
                KNOWLEDGE GROUP
              </span>
              <h1
                className="mt-0.5 truncate text-[15px] font-bold"
                style={{ color: "var(--ink)" }}
              >
                {group.name}
              </h1>
              <p
                className="mt-0.5 line-clamp-2 text-[9px] leading-relaxed"
                style={{ color: "var(--ink-faint)" }}
              >
                {group.description ?? "Chưa có mô tả."}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-1.5">
            <Metric value={group.postCount} label="Bài viết" />
            <Metric
              value={group.visibility === "PUBLIC" ? "Công khai" : "Riêng tư"}
              label="Quyền xem"
            />
            <Metric
              value={group.viewerCanWrite ? "Có" : "Không"}
              label="Được viết"
            />
            <Metric value={group.pendingRequests.length} label="Chờ duyệt" />
          </div>

          {isSelf && group.pendingRequests.length > 0 && (
            <div className="mt-4">
              <KnowledgeGroupCollabRequestsPanel
                groupId={group.id}
                username={username}
                workspaceId={workspace.id}
                initialRequests={group.pendingRequests}
              />
            </div>
          )}

          {group.viewerCanWrite && (
            <WorkspaceButton
              onClick={() => setComposerOpen(true)}
              size="sm"
              className="mt-5 w-full justify-center"
            >
              Viết bài mới
            </WorkspaceButton>
          )}
        </div>
      </motion.aside>
      <PostEditorModal
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        groupId={group.id}
      />
    </>
  );
}
