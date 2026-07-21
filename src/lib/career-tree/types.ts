import type { Edge, Node } from "@xyflow/react";
import type { ApiNodeListItem } from "../api/types";

export type NodeRole = "root" | "branch" | "leaf";

export type TreeNodeData = {
  title: string;
  role: NodeRole;
  depth: number;
  cardCount: number;
  openIssueCount: number;
  lastActivity: string | null;
  hiddenFromShare: boolean;
  isCollapsed: boolean;
  childrenCount: number;
  streak: {
    current: number;
    longest: number;
    last7: boolean[];
  };
  isToggling?: boolean;
  onToggleCollapse?: () => void;
};

export type AppNode = Node<TreeNodeData, NodeRole>;
export type AppEdge = Edge;

export function resolveNodeRole(
  apiNode: ApiNodeListItem,
  hasChildren: boolean,
): NodeRole {
  if (apiNode.depth === 0) return "root";
  return hasChildren ? "branch" : "leaf";
}
