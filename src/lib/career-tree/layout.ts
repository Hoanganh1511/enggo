import { tree, type HierarchyNode } from "d3-hierarchy";
import type { ApiNode } from "../api/types";

import { resolveNodeRole, type AppEdge, type AppNode } from "./types";

const NODE_WIDTH = 300;
const LEVEL_HEIGHT = 200;

export function computeTreeLayout(root: HierarchyNode<ApiNode>): {
  nodes: AppNode[];
  edges: AppEdge[];
} {
  const layout = tree<ApiNode>().nodeSize([NODE_WIDTH, LEVEL_HEIGHT]);
  const laidOut = layout(root);

  const nodes: AppNode[] = laidOut.descendants().map((d) => {
    const hasChildren = (d.children?.length ?? 0) > 0;
    const role = resolveNodeRole(d.data, hasChildren);
    return {
      id: d.data.id,
      type: role,
      position: { x: d.x, y: d.y },
      data: {
        title: d.data.title,
        role,
        cardCount: d.data.cardCount,
        lastActivity: d.data.lastActivity,
        hiddenFromShare: d.data.hiddenFromShare,
        isCollapsed: d.data.isCollapsed,
        childrenCount: d.children?.length ?? 0,
      },
    };
  });

  const edges: AppEdge[] = laidOut.links().map((link) => ({
    id: `e-${link.source.data.id}-${link.target.data.id}`,
    source: link.source.data.id,
    target: link.target.data.id,
    type: "smoothstep",
  }));
  return { nodes, edges };
}
