"use client";

import {
  Target,
  Folder,
  FileText,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import type { ApiCategory, ApiNodeListItem } from "@/lib/api/types";
import { resolveNodeRole, type NodeRole } from "@/lib/career-tree/types";
import { getNodeStatus, type NodeStatus } from "@/lib/career-tree/node-status";
import { getMasteryPercent } from "@/lib/career-tree/node-narrative";
import { deleteTierAction } from "@/actions/career-tree/delete-tier";
import SkillCard from "./SkillCard";
import AddSkillCard from "./AddSkillCard";
import AddTierButton from "./AddTierButton";
import TierConnector from "./TierConnector";
import type { CardSize, SkillFilters, SortKey } from "./toolbar-types";

const ROLE_ICON: Record<NodeRole, typeof Target> = {
  root: Target,
  branch: Folder,
  leaf: FileText,
};

const RECENTLY_LEARNED_DAYS = 14;

function matchesSearch(node: ApiNodeListItem, query: string): boolean {
  if (!query.trim()) return true;
  return node.title.toLowerCase().includes(query.trim().toLowerCase());
}

function matchesFilters(
  node: ApiNodeListItem,
  status: NodeStatus,
  filters: SkillFilters,
): boolean {
  if (filters.statuses.size > 0 && !filters.statuses.has(status)) return false;
  if (
    filters.difficulties.size > 0 &&
    (!node.difficulty || !filters.difficulties.has(node.difficulty))
  )
    return false;
  if (filters.notes === "has" && node.cardCount === 0) return false;
  if (filters.notes === "none" && node.cardCount > 0) return false;
  if (filters.recentlyLearned) {
    if (!node.lastActivity) return false;
    const days =
      (Date.now() - new Date(node.lastActivity).getTime()) / 86_400_000;
    if (days > RECENTLY_LEARNED_DAYS) return false;
  }
  return true;
}

function sortEntries<
  T extends { node: ApiNodeListItem; masteryPercent: number },
>(entries: T[], sortBy: SortKey | null): T[] {
  if (!sortBy) return entries;
  const sorted = [...entries];
  switch (sortBy) {
    case "alphabet":
      sorted.sort((a, b) => a.node.title.localeCompare(b.node.title));
      break;
    case "mastery":
      sorted.sort((a, b) => b.masteryPercent - a.masteryPercent);
      break;
    case "updated":
      sorted.sort(
        (a, b) =>
          new Date(b.node.updatedAt).getTime() -
          new Date(a.node.updatedAt).getTime(),
      );
      break;
    case "streak":
      sorted.sort((a, b) => b.node.streak.current - a.node.streak.current);
      break;
  }
  return sorted;
}

type SkillTreeCanvasProps = {
  workspaceId: string;
  rootNodeId: string | null;
  // Trang chi tiet block luon chi 1 Category dung (moi route
  // skill-tree/[workspaceId]/[categoryId] chi truyen vao dung 1) - khong con
  // can lap qua nhieu Category nhu ban row-based cu, nen bo luon CategoryCard
  // (header cua trang da the hien ten/trang thai block roi).
  category: ApiCategory;
  nodes: ApiNodeListItem[];
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  // "Xem nhu khach" - gia lap nhung gi 1 nguoi khac (khong phai chu workspace)
  // se thay: an het cac thao tac chinh sua (them/xoa skill, tier), chi con
  // xem + chon node de mo Detail Panel.
  isPreviewMode: boolean;
  searchQuery: string;
  filters: SkillFilters;
  sortBy: SortKey | null;
  cardSize: CardSize;
  collapsedTierIds: Set<string>;
  onToggleTierCollapse: (tierId: string) => void;
};

// Tier duoc ve thanh COT ngang hang (khop anh mau) - moi Tier la 1 cot rieng,
// skill xep doc trong cot, TierConnector noi ngang giua 2 cot ke nhau. Khac
// ban truoc (Tier la hang, skill xep ngang trong hang) - doi huong theo dung
// yeu cau "giao diem chua giong" khi so voi anh mau trang chi tiet block.
const SkillTreeCanvas = ({
  workspaceId,
  rootNodeId,
  category,
  nodes,
  selectedNodeId,
  onSelectNode,
  isPreviewMode,
  searchQuery,
  filters,
  sortBy,
  cardSize,
  collapsedTierIds,
  onToggleTierCollapse,
}: SkillTreeCanvasProps) => {
  const nodesByTier = new Map<string, ApiNodeListItem[]>();
  for (const node of nodes) {
    if (!node.tierId) continue;
    const list = nodesByTier.get(node.tierId) ?? [];
    list.push(node);
    nodesByTier.set(node.tierId, list);
  }

  return (
    <div className="flex-1 overflow-auto p-6">
      {category.tiers.length === 0 && (
        <p className="mb-4 text-sm text-ink-faint">
          Chưa có tier nào - thêm tier để bắt đầu xếp kỹ năng.
        </p>
      )}
      <div className="flex items-start gap-6">
        {category.tiers.map((tier, tierIndex) => {
          const tierNodes = nodesByTier.get(tier.id) ?? [];
          const isCollapsed = collapsedTierIds.has(tier.id);

          const visibleEntries = sortEntries(
            tierNodes
              .map((node) => {
                const masteryPercent = getMasteryPercent(node.cardCount);
                const status = getNodeStatus({
                  streakCurrent: node.streak.current,
                  openIssueCount: node.openIssueCount,
                  masteryPercent,
                  lastActivity: node.lastActivity,
                });
                return { node, masteryPercent, status };
              })
              .filter(
                ({ node, status }) =>
                  matchesSearch(node, searchQuery) &&
                  matchesFilters(node, status, filters),
              ),
            sortBy,
          );

          return (
            <div key={tier.id} className="flex shrink-0 items-start gap-6">
              <div className="w-56 shrink-0">
                <div className="group flex items-start justify-between pb-3">
                  <button
                    type="button"
                    onClick={() => onToggleTierCollapse(tier.id)}
                    className="flex cursor-pointer items-start gap-1 text-left"
                  >
                    {isCollapsed ? (
                      <ChevronRight
                        size={13}
                        strokeWidth={1.75}
                        className="mt-0.5 shrink-0 text-ink-faint"
                      />
                    ) : (
                      <ChevronDown
                        size={13}
                        strokeWidth={1.75}
                        className="mt-0.5 shrink-0 text-ink-faint"
                      />
                    )}
                    <span>
                      <p className="text-sm font-semibold text-ink">
                        {tier.label}
                      </p>
                      <p className="text-[10px] font-medium tracking-wide text-ink-faint uppercase">
                        {tier.sublabel}
                      </p>
                    </span>
                  </button>
                  {!isPreviewMode && (
                    <button
                      type="button"
                      title="Xoá tier"
                      onClick={() => deleteTierAction(workspaceId, tier.id)}
                      className="cursor-pointer text-ink-faint opacity-0 transition-opacity duration-150 ease-out hover:text-red-500 group-hover:opacity-100"
                    >
                      <X size={13} strokeWidth={1.75} />
                    </button>
                  )}
                </div>

                {!isCollapsed && (
                  <div className="flex flex-col gap-4">
                    {visibleEntries.map(({ node, masteryPercent, status }) => {
                      const role = resolveNodeRole(node);
                      const Icon = ROLE_ICON[role];
                      return (
                        <SkillCard
                          key={node.id}
                          title={node.title}
                          icon={Icon}
                          status={status}
                          percent={masteryPercent}
                          size={cardSize}
                          hasSubSkills={nodes.some(
                            (n) => n.parentId === node.id,
                          )}
                          selected={node.id === selectedNodeId}
                          onClick={() => onSelectNode(node.id)}
                        />
                      );
                    })}
                    {!isPreviewMode && rootNodeId && (
                      <AddSkillCard
                        workspaceId={workspaceId}
                        parentId={rootNodeId}
                        tierId={tier.id}
                      />
                    )}
                  </div>
                )}
              </div>

              {!isCollapsed && tierIndex < category.tiers.length - 1 && (
                <div className="pt-9">
                  <TierConnector
                    statuses={visibleEntries.map((e) => e.status)}
                  />
                </div>
              )}
            </div>
          );
        })}

        {!isPreviewMode && (
          <div className="w-56 shrink-0 pt-9">
            <AddTierButton workspaceId={workspaceId} categoryId={category.id} />
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillTreeCanvas;
