import { stratify, type HierarchyNode } from "d3-hierarchy";
import type { ApiNodeListItem } from "../api/types";

export function buildHierarchy(
  apiNodes: ApiNodeListItem[],
): HierarchyNode<ApiNodeListItem> {
  const roots = apiNodes.filter((n) => n.parentId === null);

  if (roots.length === 0) {
    throw new Error(
      "No root node round in workspace - expected exactly one node with parentId: null",
    );
  }
  if (roots.length > 1) {
    throw new Error(
      `Expected exactly one root node, found ${roots.length}: ${roots.map((r) => r.id).join(", ")}`,
    );
  }

  return stratify<ApiNodeListItem>()
    .id((n) => n.id)
    .parentId((n) => n.parentId ?? undefined)(apiNodes);
}
