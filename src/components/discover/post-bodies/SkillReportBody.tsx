"use client";

import { useState } from "react";
import { ArrowUpRight, ChevronRight, Layers } from "lucide-react";
import type { Post } from "@/content/home-feed-mock";
import SkillReportDetailModal from "../SkillReportDetailModal";

type SkillReportPost = Extract<Post, { kind: "skill-report" }>;

// Khac voi cac PostBody con lai trong thu muc nay (StatusBodies.tsx, ...) -
// day la component DUY NHAT can local state, vi no tu quan ly modal "xem chi
// tiet" (SkillReportDetailModal.tsx) rieng cho tung the bai dang trong feed.
// Style "giay note" (nen am, goc gap giay) thay vi the trang trung tinh -
// day la nhat ky hoc tap ca nhan, muon cam giac thu cong/gan gui hon la 1
// "bao cao" cung nhac. Breadcrumb {workspaceName} > {categoryName} >
// {nodeTitle} - doan cuoi (nodeTitle) la phan nguoi dung tu chon o composer
// (xem PostComposer.tsx, muc "Bao cao ky nang"), in dam + dung dung mau
// accent that cua Knowledge Block (post.categoryAccent) de dong bo hinh anh
// voi KnowledgeBlockCard.tsx.
export function SkillReportBody({ post }: { post: SkillReportPost }) {
  const [detailOpen, setDetailOpen] = useState(false);

  return (
    <>
      <div className="relative mt-2 flex flex-col gap-2 overflow-hidden rounded-md border border-amber-200/70 bg-amber-50 p-3 shadow-sm dark:border-amber-400/15 dark:bg-amber-400/6">
        {/* Goc giay gap - hieu ung note that dan tren mat ban, thuan CSS
            border-trick. Mau dung tong amber DAM HON nen (gia lam "mat sau"
            to giay) + shadow nho tao chieu sau - dung black/10 phang se ra
            vet xam nhat trong nhu loi hien thi tren nen sang. */}
        <span
          aria-hidden
          className="pointer-events-none absolute top-0 right-0 h-0 w-0 border-t-16 border-r-16 border-t-amber-200 border-r-transparent shadow-[-1px_1px_2px_rgba(0,0,0,0.12)] dark:border-t-amber-900/60"
        />

        <div className="flex min-w-0 flex-wrap items-center gap-1 text-xs text-amber-900/60 dark:text-amber-200/60">
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

        <p className="text-sm wrap-break-word text-amber-950/80 dark:text-amber-50/80">
          {post.content}
        </p>

        <button
          type="button"
          onClick={() => setDetailOpen(true)}
          className="mt-1 flex w-fit cursor-pointer items-center gap-1 text-xs font-medium text-amber-700 transition-colors duration-150 ease-out hover:text-amber-900 hover:underline dark:text-amber-300 dark:hover:text-amber-100"
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
