import type { ApiCategory, ApiNodeListItem } from "@/lib/api/types";
import { getMasteryPercent } from "@/lib/career-tree/node-narrative";
import type { NodeStatus } from "@/lib/career-tree/node-status";
import { estimateCategoryStatus } from "./status-style";

export type CategoryTopNode = {
  id: string;
  title: string;
  masteryPercent: number;
  lastActivity: string | null;
};

export type CategoryStats = {
  skillCount: number;
  avgMasteryPercent: number;
  status: NodeStatus;
  skillTitles: string[];
  lastActivity: string | null;
  topLearnedNodes: CategoryTopNode[];
  recentNodes: CategoryTopNode[];
};

// Tinh 1 lan cac chi so cap Category (= "Knowledge Block") dung chung cho ca
// KnowledgeBlockCard (hien tat) va KnowledgeBlockSummary (hien chi tiet hon
// khi hover) - tranh moi noi tu loc/gop lai tu dau, dung dung 1 nguon.
export function computeCategoryStats(
  category: ApiCategory,
  nodes: ApiNodeListItem[],
): CategoryStats {
  const tierIds = new Set(category.tiers.map((t) => t.id));
  const categoryNodes = nodes.filter((n) => n.tierId && tierIds.has(n.tierId));

  const entries = categoryNodes.map((node) => ({
    id: node.id,
    title: node.title,
    masteryPercent: getMasteryPercent(node.cardCount),
    lastActivity: node.lastActivity,
  }));

  const skillCount = entries.length;
  const avgMasteryPercent = skillCount
    ? Math.round(
        entries.reduce((sum, e) => sum + e.masteryPercent, 0) / skillCount,
      )
    : 0;

  const lastActivity = entries.reduce<string | null>((latest, e) => {
    if (!e.lastActivity) return latest;
    if (!latest || new Date(e.lastActivity) > new Date(latest))
      return e.lastActivity;
    return latest;
  }, null);

  const topLearnedNodes = [...entries]
    .filter((e) => e.masteryPercent > 0)
    .sort((a, b) => b.masteryPercent - a.masteryPercent)
    .slice(0, 3);

  const recentNodes = [...entries]
    .filter((e): e is CategoryTopNode & { lastActivity: string } =>
      Boolean(e.lastActivity),
    )
    .sort(
      (a, b) =>
        new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime(),
    )
    .slice(0, 3);

  return {
    skillCount,
    avgMasteryPercent,
    status: estimateCategoryStatus(avgMasteryPercent),
    skillTitles: entries.map((e) => e.title).sort((a, b) => a.localeCompare(b)),
    lastActivity,
    topLearnedNodes,
    recentNodes,
  };
}
