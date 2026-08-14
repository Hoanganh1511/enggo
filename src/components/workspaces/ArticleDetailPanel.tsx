"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Folder } from "lucide-react";
import type { ApiDocumentSummary, ApiKnowledgeGroup } from "@/lib/api/types";
import { colorOf } from "./node-color";
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

// Panel phai - tong quan NHOM dang chon. Chi con 1 che do duy nhat (bo han
// che do preview bai viet Overview/Muc luc/Tai lieu ban truoc - "Bai viet
// trong nhom" gio dieu huong That qua next/link, dong bo voi ArticleCard,
// nen khong con ai kich hoat che do preview do nua). Truot vao 1 LAN duy
// nhat luc mount (khong doi lai luc chuyen nhom), bao panelsReady qua
// context khi animation settle xong.
export function ArticleDetailPanel({
  group,
  docs,
}: {
  group: ApiKnowledgeGroup;
  docs: ApiDocumentSummary[];
}) {
  const { username, isSelf, workspace, setPanelsReady } = useWorkspaceShell();
  const [composerOpen, setComposerOpen] = useState(false);

  return (
    <>
      <motion.aside
        initial={{ x: 420, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={PANEL_SPRING}
        onAnimationComplete={() => setPanelsReady(true)}
        className="flex w-[420px] shrink-0 flex-col overflow-hidden"
        style={{
          borderLeft: "1px solid var(--border)",
          background: "var(--surface)",
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
                initialRequests={group.pendingRequests}
              />
            </div>
          )}

          {docs.length > 0 && (
            <section className="mt-5">
              <div className="mb-2 flex items-center justify-between">
                <h3
                  className="text-[11px] font-semibold"
                  style={{ color: "var(--ink)" }}
                >
                  Bài viết trong nhóm
                </h3>
              </div>
              {docs.slice(0, 5).map((d) => (
                <Link
                  key={d.id}
                  href={`/workspace/${username}/${workspace.id}/${d.slug}`}
                  className="my-1.5 grid w-full grid-cols-[12px_1fr_30px] items-center gap-2"
                >
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{
                      background: colorOf(d.id),
                      boxShadow: `0 0 8px ${colorOf(d.id)}`,
                    }}
                  />
                  <span className="min-w-0 text-left">
                    <strong
                      className="block truncate text-[9px]"
                      style={{ color: "var(--ink)" }}
                    >
                      {d.title}
                    </strong>
                    <small
                      className="mt-0.5 block text-[7px]"
                      style={{ color: "var(--ink-faint)" }}
                    >
                      {d.viewCount} lượt xem
                    </small>
                  </span>
                  <b
                    className="text-right text-[8px]"
                    style={{ color: "var(--ink-faint)" }}
                  >
                    →
                  </b>
                </Link>
              ))}
            </section>
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
