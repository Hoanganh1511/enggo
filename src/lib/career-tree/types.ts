import type { Edge, Node } from "@xyflow/react";
import type { ApiNode } from "../api/types";

export type NodeRole = "root" | "branch" | "leaf";

export type TreeNodeData = {
  title: string;
  role: NodeRole;
  cardCount: number;
  lastActivity: string | null;
  hiddenFromShare: boolean;
  isCollapsed: boolean;
};

export type AppNode = Node<TreeNodeData, NodeRole>;
export type AppEdge = Edge;

export function resolveNodeRole(
  apiNode: ApiNode,
  hasChildren: boolean,
): NodeRole {
  if (apiNode.depth === 0) return "root";
  return hasChildren ? "branch" : "leaf";
}
