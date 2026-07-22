import type { Edge, Node } from "@xyflow/react";
import type { ApiNodeListItem, NodeKind } from "../api/types";

export type NodeRole = "root" | "branch" | "leaf";

export type TreeNodeData = {
  title: string;
  role: NodeRole;
  kind: NodeKind;
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

// "kind" la nguon su that duy nhat cho branch/leaf (dat tuong minh luc tao
// node) - khong con suy tu viec node co con hay khong nua, vi 1 node kind
// TOPIC van co the co con ma van phai duoc dieu huong vao trang chi tiet
// khi click tren canvas.
export function resolveNodeRole(apiNode: ApiNodeListItem): NodeRole {
  if (apiNode.depth === 0) return "root";
  return apiNode.kind === "TOPIC" ? "leaf" : "branch";
}
