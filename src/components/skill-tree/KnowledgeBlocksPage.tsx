"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  ApiCategory,
  ApiNodeListItem,
  ApiWorkspace,
} from "@/lib/api/types";
import SkillTreeToolbar from "./SkillTreeToolbar";
import KnowledgeBlockCard from "./KnowledgeBlockCard";
import KnowledgeBlockSummary from "./KnowledgeBlockSummary";
import { computeCategoryStats } from "@/lib/skill-tree/category-stats";
import { createEmptyFilters, type SortKey } from "./toolbar-types";

// Thoi gian cho hieu ung "phong to card duoc bam + mo card khac" truoc khi
// dieu huong that (Interaction Story trong spec) - route van la Next.js route
// that (router.push), chi delay lai 1 chut de hieu ung kip choi.
const ENTER_TRANSITION_MS = 240;

type KnowledgeBlocksPageProps = {
  workspace: ApiWorkspace;
  workspaces: ApiWorkspace[];
  categories: ApiCategory[];
  nodes: ApiNodeListItem[];
};

const KnowledgeBlocksPage = ({
  workspace,
  categories,
  nodes,
}: KnowledgeBlocksPageProps) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortKey | null>(null);
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(
    null,
  );
  const [enteringId, setEnteringId] = useState<string | null>(null);

  const statsByCategory = useMemo(() => {
    const map = new Map<string, ReturnType<typeof computeCategoryStats>>();
    for (const category of categories) {
      map.set(category.id, computeCategoryStats(category, nodes));
    }
    return map;
  }, [categories, nodes]);

  const visibleCategories = useMemo(() => {
    const filtered = categories.filter((c) =>
      c.name.toLowerCase().includes(searchQuery.trim().toLowerCase()),
    );
    if (!sortBy) return filtered;
    const sorted = [...filtered];
    switch (sortBy) {
      case "alphabet":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "mastery":
        sorted.sort(
          (a, b) =>
            (statsByCategory.get(b.id)?.avgMasteryPercent ?? 0) -
            (statsByCategory.get(a.id)?.avgMasteryPercent ?? 0),
        );
        break;
      case "updated":
        sorted.sort((a, b) => {
          const aTime = statsByCategory.get(a.id)?.lastActivity;
          const bTime = statsByCategory.get(b.id)?.lastActivity;
          return (
            (bTime ? new Date(bTime).getTime() : 0) -
            (aTime ? new Date(aTime).getTime() : 0)
          );
        });
        break;
      // "streak" khong co y nghia o cap Knowledge Block (streak la tin hieu
      // rieng cua tung Node) - giu nguyen thu tu thay vi loi.
      case "streak":
        break;
    }
    return sorted;
  }, [categories, searchQuery, sortBy, statsByCategory]);

  const handleEnter = (categoryId: string, href: string) => {
    if (enteringId) return;
    setEnteringId(categoryId);
    setTimeout(() => router.push(href), ENTER_TRANSITION_MS);
  };

  const summaryCategoryId = hoveredCategoryId ?? visibleCategories[0]?.id;
  const summaryCategory =
    categories.find((c) => c.id === summaryCategoryId) ?? null;
  const summaryStats = summaryCategoryId
    ? (statsByCategory.get(summaryCategoryId) ?? null)
    : null;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1">
        <div className="flex min-h-0  flex-col  flex-1 rounded-lg bg-surface border border-border px-6">
          <div className="border-b border-border  pt-5 pb-4">
            <h1 className="text-xl font-bold text-ink">Knowledge Blocks</h1>
            <p className="mt-0.5 text-sm text-ink-faint">
              Click a block to explore its skills
            </p>
          </div>
          <SkillTreeToolbar
            mode="overview"
            workspaceId={workspace.id}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            filters={createEmptyFilters()}
            onFiltersChange={() => {}}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            cardSize="md"
            onCardSizeChange={() => {}}
            onExpandAll={() => {}}
            onCollapseAll={() => {}}
            isPreviewMode={false}
            onTogglePreview={() => {}}
          />
          <div className="flex-1 overflow-auto py-6">
            {visibleCategories.length === 0 && (
              <p className="text-sm text-ink-faint">
                {categories.length === 0
                  ? "Chưa có Knowledge Block nào - bấm “+ Knowledge Block” để bắt đầu."
                  : "Không tìm thấy Knowledge Block phù hợp."}
              </p>
            )}
            {/* auto-fill + minmax(280px,1fr) thay vi grid-cols-4 co dinh: voi
                it hon 4 block (vd chi 1), grid-cols-4 van chia du 4 cot bang
                nhau khien card con lai chi ~160px - qua hep de hien noi dung
                (tung gap loi tuong tu voi luoi SkillCard, da sua cung 1 cach
                truoc do trong SkillTreeCanvas.tsx). auto-fill tu tinh so cot
                vua khit, khong bao gio hep hon 280px/card. */}
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
              {visibleCategories.map((category) => (
                <KnowledgeBlockCard
                  key={category.id}
                  workspaceId={workspace.id}
                  category={category}
                  stats={
                    statsByCategory.get(category.id) ??
                    computeCategoryStats(category, nodes)
                  }
                  onHoverChange={setHoveredCategoryId}
                  isEntering={enteringId === category.id}
                  isFadedOut={enteringId !== null && enteringId !== category.id}
                  onEnter={handleEnter}
                />
              ))}
            </div>
          </div>
        </div>
        <KnowledgeBlockSummary
          workspaceId={workspace.id}
          category={summaryCategory}
          stats={summaryStats}
        />
      </div>
    </div>
  );
};

export default KnowledgeBlocksPage;
