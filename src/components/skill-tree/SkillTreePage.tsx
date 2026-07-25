"use client";

import { useState } from "react";
import type {
  ApiCategory,
  ApiNodeListItem,
  ApiWorkspace,
} from "@/lib/api/types";
import SkillTreeHeader from "./SkillTreeHeader";
import SkillTreeCanvas from "./SkillTreeCanvas";
import SkillTreeToolbar from "./SkillTreeToolbar";
import SkillDetailPanel from "./SkillDetailPanel";
import BlockAboutPanel from "./BlockAboutPanel";
import {
  createEmptyFilters,
  type CardSize,
  type SortKey,
} from "./toolbar-types";

type SkillTreePageProps = {
  workspace: ApiWorkspace;
  workspaces: ApiWorkspace[];
  categories: ApiCategory[];
  nodes: ApiNodeListItem[];
};

// SkillTreePage gio la noi dung trang chi tiet 1 Knowledge Block (duoc goi
// tu skill-tree/[workspaceId]/[categoryId]/page.tsx) - "categories" luon la
// mang 1 phan tu (dung [category] o day de tai su dung nguyen SkillTreeCanvas/
// SkillTreeToolbar/CreateSkillModal - deu da nhan categories: ApiCategory[]
// tu truoc). Trang tong quan (luoi nhieu block) la KnowledgeBlocksPage rieng.
const SkillTreePage = ({
  workspace,
  categories,
  nodes,
}: SkillTreePageProps) => {
  const category = categories[0];
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState(createEmptyFilters());
  const [sortBy, setSortBy] = useState<SortKey | null>(null);
  const [cardSize, setCardSize] = useState<CardSize>("md");
  const [collapsedTierIds, setCollapsedTierIds] = useState<Set<string>>(
    new Set(),
  );

  const rootNodeId = nodes.find((n) => n.parentId === null)?.id ?? null;
  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null;

  const toggleTierCollapse = (tierId: string) => {
    setCollapsedTierIds((prev) => {
      const next = new Set(prev);
      if (next.has(tierId)) next.delete(tierId);
      else next.add(tierId);
      return next;
    });
  };

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <SkillTreeHeader
        workspaceId={workspace.id}
        category={category}
        nodes={nodes}
        rootNodeId={rootNodeId}
        isPreviewMode={isPreviewMode}
      />
      {isPreviewMode && (
        <div className="flex h-9 shrink-0 items-center justify-center gap-2 bg-primary/10 text-xs font-medium text-primary">
          Đang xem như khách - chỉ xem, không thể chỉnh sửa
          <button
            type="button"
            onClick={() => setIsPreviewMode(false)}
            className="cursor-pointer underline underline-offset-2 hover:text-primary-hover"
          >
            Thoát
          </button>
        </div>
      )}
      <div className="flex min-h-0 flex-1">
        <div className="flex min-h-0 flex-1 flex-col">
          <SkillTreeToolbar
            mode="block"
            workspaceId={workspace.id}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            filters={filters}
            onFiltersChange={setFilters}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            cardSize={cardSize}
            onCardSizeChange={setCardSize}
            onExpandAll={() => setCollapsedTierIds(new Set())}
            onCollapseAll={() =>
              setCollapsedTierIds(new Set(category.tiers.map((t) => t.id)))
            }
            isPreviewMode={isPreviewMode}
            onTogglePreview={() => setIsPreviewMode((v) => !v)}
          />
          <SkillTreeCanvas
            workspaceId={workspace.id}
            rootNodeId={rootNodeId}
            category={category}
            nodes={nodes}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            isPreviewMode={isPreviewMode}
            searchQuery={searchQuery}
            filters={filters}
            sortBy={sortBy}
            cardSize={cardSize}
            collapsedTierIds={collapsedTierIds}
            onToggleTierCollapse={toggleTierCollapse}
          />
        </div>
        {selectedNode ? (
          <SkillDetailPanel workspaceId={workspace.id} node={selectedNode} />
        ) : (
          <BlockAboutPanel category={category} nodes={nodes} />
        )}
      </div>
    </div>
  );
};

export default SkillTreePage;
