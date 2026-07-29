"use client";

import { useState } from "react";
import { ArrowUpRight, ChevronRight, Layers } from "lucide-react";
import type { Post } from "@/content/home-feed-mock";
import { hexToRgba } from "@/lib/skill-tree/status-style";
import SkillReportDetailModal from "../SkillReportDetailModal";

type SkillReportPost = Extract<Post, { kind: "skill-report" }>;

// Khac voi cac PostBody con lai trong thu muc nay (StatusBodies.tsx, ...) -
// day la component DUY NHAT can local state, vi no tu quan ly modal "xem chi
// tiet" (SkillReportDetailModal.tsx) rieng cho tung the bai dang trong feed.
// Breadcrumb danh muc {workspaceName} > {categoryName} > {nodeTitle} thay cho
// badge category don le truoc day - doan cuoi (nodeTitle) la phan nguoi dung
// tu chon o composer (xem PostComposer.tsx, muc "Bao cao ky nang"), in dam +
// dung dung mau accent that cua Knowledge Block (post.categoryAccent) de vua
// noi bat vua dong bo hinh anh voi KnowledgeBlockCard.tsx.
export function SkillReportBody({ post }: { post: SkillReportPost }) {
  const [detailOpen, setDetailOpen] = useState(false);

  return (
    <>
      <div className="mt-2 flex flex-col gap-2 rounded-xl border border-border p-3">
        <div className="flex min-w-0 flex-wrap items-center gap-1 text-xs text-ink-faint">
          <Layers
            size={12}
            strokeWidth={2}
            className="shrink-0"
            style={{ color: post.categoryAccent }}
          />
          <span className="truncate">{post.workspaceName}</span>
          <ChevronRight size={11} strokeWidth={2} className="shrink-0" />
          <span className="truncate">{post.categoryName}</span>
          <ChevronRight size={11} strokeWidth={2} className="shrink-0" />
          <span
            className="truncate font-semibold"
            style={{ color: post.categoryAccent }}
          >
            {post.nodeTitle}
          </span>
        </div>

        <p className="text-sm wrap-break-word text-ink-muted">{post.content}</p>

        <button
          type="button"
          onClick={() => setDetailOpen(true)}
          className="mt-1 flex w-fit cursor-pointer items-center gap-1 text-xs font-medium text-primary transition-colors duration-150 ease-out hover:underline"
        >
          Xem chi tiết
          <ArrowUpRight size={13} strokeWidth={1.75} />
        </button>
      </div>

      <SkillReportDetailModal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        workspaceId={post.workspaceId}
        nodeId={post.nodeId}
        nodeTitle={post.nodeTitle}
        categoryName={post.categoryName}
        categoryAccent={post.categoryAccent}
      />
    </>
  );
}
