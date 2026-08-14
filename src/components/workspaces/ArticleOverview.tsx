"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  ChevronRight,
  Clock3,
  Eye,
  FileText,
  LoaderCircle,
  Network,
} from "lucide-react";
import type {
  ApiDocument,
  ApiDocumentSummary,
  ApiKnowledgeGroup,
} from "@/lib/api/types";
import { formatRelativeTime } from "@/lib/format-time";
import { formatCompact } from "@/lib/format-number";
import { sidebarFadeUp, SidebarSectionLabel } from "./article-tab-shared";

export function ArticleOverview({
  doc,
  group,
  workspaceName,
  siblingDocs,
  username,
  workspaceId,
}: {
  doc: ApiDocument | null;
  group: ApiKnowledgeGroup | null;
  workspaceName: string;
  siblingDocs: ApiDocumentSummary[];
  // Dung de build href That cho "bai viet lien quan" (Link, khong con
  // callback onOpenDoc nhu ban truoc).
  username: string;
  workspaceId: string;
}) {
  if (!doc) {
    return (
      <div className="flex h-40 items-center justify-center">
        <LoaderCircle
          size={16}
          className="animate-spin"
          style={{ color: "var(--ink-faint)" }}
        />
      </div>
    );
  }

  return (
    <div className="p-4">
      <motion.div variants={sidebarFadeUp}>
        <SidebarSectionLabel>BREADCRUMB</SidebarSectionLabel>
        <div
          className="mb-4 flex flex-wrap items-center gap-1 text-[11px]"
          style={{ color: "var(--ink-faint)" }}
        >
          <span className="truncate">{workspaceName}</span>
          <ChevronRight size={11} strokeWidth={1.9} className="shrink-0" />
          <span className="truncate">{group?.name ?? "..."}</span>
          <ChevronRight size={11} strokeWidth={1.9} className="shrink-0" />
          <span
            className="truncate font-semibold"
            style={{ color: "var(--primary)" }}
          >
            {doc.title}
          </span>
        </div>
      </motion.div>

      <motion.div variants={sidebarFadeUp}>
        <SidebarSectionLabel>TỔNG QUAN BÀI VIẾT</SidebarSectionLabel>
        <div className="grid grid-cols-2 gap-1.5">
          <SidebarMetric
            icon={<CheckCircle2 size={12} strokeWidth={1.9} />}
            label="Trạng thái"
            value={doc.isPublished ? "Đã xuất bản" : "Bản nháp"}
          />
          <SidebarMetric
            icon={<Eye size={12} strokeWidth={1.9} />}
            label="Lượt xem"
            value={formatCompact(doc.viewCount)}
          />
          <SidebarMetric
            icon={<Clock3 size={12} strokeWidth={1.9} />}
            label="Cập nhật"
            value={formatRelativeTime(doc.updatedAt)}
          />
          <SidebarMetric
            icon={<Network size={12} strokeWidth={1.9} />}
            label="Liên quan"
            value={String(siblingDocs.length)}
          />
        </div>
      </motion.div>

      {doc.tags.length > 0 && (
        <motion.div
          variants={sidebarFadeUp}
          className="mt-4 flex flex-wrap gap-1.5"
        >
          {doc.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full px-2 py-0.5 text-[9px]"
              style={{ background: "var(--tag-bg)", color: "var(--tag-text)" }}
            >
              #{tag}
            </span>
          ))}
        </motion.div>
      )}

      {siblingDocs.length > 0 && (
        <motion.div variants={sidebarFadeUp} className="mt-5">
          <SidebarSectionLabel>
            BÀI VIẾT LIÊN QUAN TRONG NHÓM
          </SidebarSectionLabel>
          <div className="space-y-1.5">
            {siblingDocs.slice(0, 5).map((d) => (
              <Link
                key={d.id}
                href={`/workspace/${username}/${workspaceId}/${d.slug}`}
                className="group flex w-full translate-y-0 items-center gap-2 rounded-[9px] border p-2 text-left transition-all duration-150 ease-out hover:-translate-y-px hover:border-[color-mix(in_srgb,var(--primary)_32%,transparent)] hover:bg-hover-bg"
                style={{ borderColor: "transparent" }}
              >
                <FileText
                  size={13}
                  strokeWidth={1.9}
                  style={{ color: "var(--ink-faint)" }}
                  className="shrink-0"
                />
                <span
                  className="min-w-0 flex-1 truncate text-[11px]"
                  style={{ color: "var(--ink-muted)" }}
                >
                  {d.title}
                </span>
                <ChevronRight
                  size={12}
                  strokeWidth={1.9}
                  style={{ color: "var(--ink-faint)" }}
                  className="shrink-0 transition-transform duration-150 ease-out group-hover:translate-x-0.5"
                />
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function SidebarMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      className="rounded-[11px] p-2.5"
      style={{
        border: "1px solid var(--border)",
        background: "var(--surface-muted)",
      }}
    >
      <div
        className="flex items-center gap-1 text-[9px]"
        style={{ color: "var(--ink-faint)" }}
      >
        {icon}
        {label}
      </div>
      <div
        className="mt-1 truncate text-[12px] font-semibold"
        style={{ color: "var(--ink)" }}
      >
        {value}
      </div>
    </div>
  );
}
