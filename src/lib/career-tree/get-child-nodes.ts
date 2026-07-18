import type { ApiNodeListItem } from "@/lib/api/types";

export function getChildNodes(
  allNodes: ApiNodeListItem[],
  parentId: string | null,
): ApiNodeListItem[] {
  return allNodes
    .filter((n) => n.parentId === parentId)
    .sort((a, b) => a.orderIndex - b.orderIndex);
}

export function hasChildren(
  allNodes: ApiNodeListItem[],
  nodeId: string,
): boolean {
  return allNodes.some((n) => n.parentId === nodeId);
}

export function getCollapsedAncestorIds(
  allNodes: ApiNodeListItem[],
  nodeId: string,
): string[] {
  const byId = new Map(allNodes.map((n) => [n.id, n]));
  const ids: string[] = [];
  let current = byId.get(nodeId)?.parentId ?? null;
  while (current) {
    const node = byId.get(current);
    if (!node) break;
    if (node.isCollapsed) ids.push(node.id);
    current = node.parentId;
  }
  return ids;
}
