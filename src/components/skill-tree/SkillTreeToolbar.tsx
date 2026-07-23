"use client";

import { Search, Sparkles, Eye, EyeOff } from "lucide-react";
import type { ApiCategory } from "@/lib/api/types";
import CreateSkillModal from "./CreateSkillModal";
import CreateCategoryModal from "./CreateCategoryModal";
import CreateMenu from "./CreateMenu";
import ViewMenu from "./ViewMenu";
import FilterMenu from "./FilterMenu";
import SortMenu from "./SortMenu";
import type { CardSize, SkillFilters, SortKey } from "./toolbar-types";

type SkillTreeToolbarProps = {
  // "overview" = trang luoi Knowledge Blocks (chi quan ly block: + Knowledge
  // Block, tim/sap xep theo block - khong co Filter/ViewMenu vi khong co
  // tier/skill nao hien truc tiep o day). "block" = trang chi tiet 1 block
  // (Skill Tree that su cua rieng no) - giu nguyen toolbar day du nhu truoc,
  // tru "+ Category" (tao Category moi khong hop ly khi dang o trong 1 block).
  mode: "overview" | "block";
  workspaceId: string;
  rootNodeId: string | null;
  categories: ApiCategory[];
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  filters: SkillFilters;
  onFiltersChange: (filters: SkillFilters) => void;
  sortBy: SortKey | null;
  onSortByChange: (key: SortKey | null) => void;
  cardSize: CardSize;
  onCardSizeChange: (size: CardSize) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  isPreviewMode: boolean;
  onTogglePreview: () => void;
};

// Toolbar day du theo spec "Skill Tree Toolbar" - chi lam that Group 1-5
// (Creation/Layout/Search/Filter/Sort, dung duoc ngay voi du lieu da co).
// Group 6 (AI) hien nut nhung disabled + badge "Sap ra mat" (chua co LLM
// provider). Import/Export/Bulk Actions chua lam trong dot nay.
const SkillTreeToolbar = ({
  mode,
  workspaceId,
  rootNodeId,
  categories,
  searchQuery,
  onSearchQueryChange,
  filters,
  onFiltersChange,
  sortBy,
  onSortByChange,
  cardSize,
  onCardSizeChange,
  onExpandAll,
  onCollapseAll,
  isPreviewMode,
  onTogglePreview,
}: SkillTreeToolbarProps) => {
  return (
    <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-3">
      {/* Group 1 - Creation */}
      <div className="flex shrink-0 items-center gap-1">
        {mode === "block" && (
          <CreateSkillModal
            workspaceId={workspaceId}
            rootNodeId={rootNodeId}
            categories={categories}
          />
        )}
        {mode === "overview" && (
          <>
            <CreateCategoryModal
              workspaceId={workspaceId}
              label="Knowledge Block"
            />
            <CreateMenu />
          </>
        )}
      </div>

      <div className="h-5 w-px shrink-0 bg-border" />

      {/* Group 2 - Layout (chi co y nghia trong 1 block - overview khong co
          tier/skill nao de mo rong/thu gon hay doi mat do) */}
      {mode === "block" && (
        <>
          <ViewMenu
            onExpandAll={onExpandAll}
            onCollapseAll={onCollapseAll}
            cardSize={cardSize}
            onCardSizeChange={onCardSizeChange}
          />
          <div className="h-5 w-px shrink-0 bg-border" />
        </>
      )}

      {/* Group 3 - Search */}
      <div className="flex h-8 min-w-0 flex-1 max-w-64 items-center gap-2 rounded-md border border-border bg-surface px-2.5 text-ink-faint">
        <Search size={14} strokeWidth={1.75} className="shrink-0" />
        <input
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          placeholder={mode === "overview" ? "Tìm block..." : "Tìm kỹ năng..."}
          className="min-w-0 flex-1 bg-transparent text-xs text-ink placeholder:text-ink-faint focus:outline-none"
        />
      </div>

      <div className="h-5 w-px shrink-0 bg-border" />

      {/* Group 4 + 5 - Filter (chi trong block, vi loc theo status/do kho cua
          skill), Sort (dung duoc ca 2 - sap xep block hay skill deu hop ly) */}
      <div className="flex shrink-0 items-center gap-1">
        {mode === "block" && (
          <FilterMenu filters={filters} onChange={onFiltersChange} />
        )}
        <SortMenu sortBy={sortBy} onChange={onSortByChange} />
      </div>

      <div className="flex-1" />

      {/* Group 6 - AI Assistant (UI only - chua co LLM provider) */}
      <button
        type="button"
        disabled
        title="Sắp ra mắt - cần chọn nhà cung cấp AI trước"
        className="flex h-8 shrink-0 cursor-not-allowed items-center gap-1.5 rounded-md border border-violet-500/20 bg-violet-500/5 px-2.5 text-sm font-medium text-violet-400/60"
      >
        <Sparkles size={14} strokeWidth={1.75} />
        AI
        <span className="rounded-full bg-surface-muted px-1.5 py-0.5 text-[10px] font-medium text-ink-faint">
          Sắp ra mắt
        </span>
      </button>

      <div className="h-5 w-px shrink-0 bg-border" />

      {/* <button
        type="button"
        onClick={onTogglePreview}
        className={`flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-sm font-medium transition-colors duration-150 ease-out ${
          isPreviewMode
            ? "bg-primary/10 text-primary"
            : "text-ink-muted hover:bg-hover-bg hover:text-ink"
        }`}
      >
        {isPreviewMode ? (
          <EyeOff size={15} strokeWidth={1.75} />
        ) : (
          <Eye size={15} strokeWidth={1.75} />
        )}
        {isPreviewMode ? "Thoát xem như khách" : "Xem như khách"}
      </button> */}
    </div>
  );
};

export default SkillTreeToolbar;
