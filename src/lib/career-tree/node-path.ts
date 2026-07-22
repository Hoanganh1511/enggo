import type { ApiNodeListItem } from "../api/types";

export type AncestorPathItem = {
  id: string;
  title: string;
  depth: number;
  kind: ApiNodeListItem["kind"];
};

// Duyet nguoc theo parentId tu node hien tai len root, roi dao lai thanh
// root -> ... -> node hien tai - dung cho breadcrumb sidebar va de tra
// parent/branch name trong Overview tab.
export function buildAncestorPath(
  nodes: ApiNodeListItem[],
  nodeId: string,
): AncestorPathItem[] {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const path: AncestorPathItem[] = [];
  let current = byId.get(nodeId);
  while (current) {
    path.unshift({
      id: current.id,
      title: current.title,
      depth: current.depth,
      kind: current.kind,
    });
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }
  return path;
}
