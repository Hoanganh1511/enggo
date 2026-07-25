import type { Difficulty } from "@/lib/api/types";
import type { NodeStatus } from "@/lib/career-tree/node-status";

// "Compact"/"Comfortable" trong spec = size cua SkillCard (da co san "sm"/"md").
export type CardSize = "sm" | "md";

export type SortKey = "alphabet" | "mastery" | "updated" | "streak";

export type NotesFilter = "all" | "has" | "none";

export type SkillFilters = {
  statuses: Set<NodeStatus>; // rong = khong loc theo status
  difficulties: Set<Difficulty>; // rong = khong loc theo do kho
  notes: NotesFilter;
  recentlyLearned: boolean; // lastActivity trong 14 ngay gan day
};

export function createEmptyFilters(): SkillFilters {
  return {
    statuses: new Set(),
    difficulties: new Set(),
    notes: "all",
    recentlyLearned: false,
  };
}

export function countActiveFilters(filters: SkillFilters): number {
  return (
    filters.statuses.size +
    filters.difficulties.size +
    (filters.notes !== "all" ? 1 : 0) +
    (filters.recentlyLearned ? 1 : 0)
  );
}
