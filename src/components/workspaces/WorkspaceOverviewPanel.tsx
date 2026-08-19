"use client";

import { motion } from "framer-motion";
import { PANEL_SPRING } from "./motion";
import { useWorkspaceShell } from "./workspace-shell-context";

const CONCEPT_BLUE = "#269ce9";

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

// Panel phai - tong quan cua CA WORKSPACE (khac ArticleDetailPanel.tsx, tong
// quan cua 1 NHOM). Chi hien khi chua chon nhom nao (xem WorkspaceBrowseView.tsx,
// bo sung theo phan hoi: "đề xuất mở right panel là thông tin tổng quan về
// workspace này") - man tong quan (KnowledgeGroupCatalog.tsx) truoc do khong
// co gi o cot phai, thong tin workspace chi la 1 dong nho o goc trai gay
// "thua dien tich" - panel nay vua lap khoang trong vua cho thong tin RIENG,
// khong lap voi luoi the (postCount tong hop, ty le cong khai/rieng tu...
// khong co san o dau khac).
export function WorkspaceOverviewPanel() {
  const { workspace, groups, isSelf, username } = useWorkspaceShell();

  const totalPosts = groups.reduce((sum, g) => sum + g.postCount, 0);
  const publicCount = groups.filter((g) => g.visibility === "PUBLIC").length;
  const privateCount = groups.length - publicCount;

  return (
    <motion.aside
      initial={{ x: 420, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={PANEL_SPRING}
      className="shadow-panel flex w-[340px] shrink-0 flex-col self-start overflow-hidden rounded-[13px] backdrop-blur-md"
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
            className="flex size-[62px] shrink-0 items-center justify-center rounded-xl text-[28px]"
            style={{
              background: `color-mix(in srgb, ${workspace.color ?? CONCEPT_BLUE} 12%, transparent)`,
            }}
          >
            {workspace.icon ?? "📁"}
          </span>
          <div className="min-w-0">
            <span
              className="text-[9px] font-bold tracking-wide"
              style={{ color: "var(--ink-faint)" }}
            >
              WORKSPACE
            </span>
            <h1
              className="mt-0.5 truncate text-[15px] font-bold"
              style={{ color: "var(--ink)" }}
            >
              {workspace.name}
            </h1>
            <p
              className="mt-0.5 line-clamp-2 text-[9px] leading-relaxed"
              style={{ color: "var(--ink-faint)" }}
            >
              {workspace.description || "Chưa có mô tả."}
            </p>
          </div>
        </div>

        {!isSelf && (
          <p className="mt-3 text-[10px]" style={{ color: "var(--ink-faint)" }}>
            Chủ sở hữu:{" "}
            <span style={{ color: "var(--ink-muted)" }}>@{username}</span>
          </p>
        )}

        <div className="mt-4 grid grid-cols-4 gap-1.5">
          <Metric value={groups.length} label="Nhóm kiến thức" />
          <Metric value={totalPosts} label="Bài viết" />
          <Metric value={publicCount} label="Công khai" />
          <Metric value={privateCount} label="Riêng tư" />
        </div>
      </div>
    </motion.aside>
  );
}
