import type { HierarchyNode } from "d3-hierarchy";
import type { ApiNodeListItem } from "../api/types";

import { resolveNodeRole, type AppEdge, type AppNode } from "./types";

// Layout nay tu dung (khong dung dagre/elk/d3.tree() de auto-space), nen
// khoang cach giua cac node hoan toan do 2 hang so duoi quyet dinh - tang/giam
// truc tiep 2 so nay la cach duy nhat de chinh khoang cach. GrowthCard rong
// w-84 (336px) cao ~390-440px; ban 560/600 truoc qua rong, giam lai muc vua
// phai (van cach ro rang hon ban goc 450/490 nhung khong lech qua xa).
const NODE_WIDTH = 450;
const LEVEL_HEIGHT = 400;
// Một node có nhiều hơn số này con sẽ xuống hàng thay vì trải dài 1 hàng ngang.
const MAX_NODES_PER_ROW = 4;

type SubtreeLayout = {
  width: number;
  height: number;
  // Vị trí (tương đối so với chính node này ở gốc (0,0)) của node và toàn bộ hậu duệ.
  positions: Map<string, { x: number; y: number }>;
};

// Tự dựng layout thay vì dùng d3.tree() trực tiếp, vì d3.tree() luôn xếp
// toàn bộ con của 1 node trên CÙNG 1 hàng ngang, không hỗ trợ giới hạn
// số node/hàng rồi xuống dòng.
function layoutSubtree(node: HierarchyNode<ApiNodeListItem>): SubtreeLayout {
  const positions = new Map<string, { x: number; y: number }>();
  positions.set(node.data.id, { x: 0, y: 0 });

  const children = node.children ?? [];
  if (children.length === 0) {
    return { width: NODE_WIDTH, height: LEVEL_HEIGHT, positions };
  }

  const childLayouts = children.map(layoutSubtree);

  let yOffset = LEVEL_HEIGHT;
  let maxRowWidth = NODE_WIDTH;

  for (let i = 0; i < childLayouts.length; i += MAX_NODES_PER_ROW) {
    const row = childLayouts.slice(i, i + MAX_NODES_PER_ROW);
    const rowWidth = row.reduce((sum, r) => sum + r.width, 0);
    const rowHeight = Math.max(...row.map((r) => r.height));
    maxRowWidth = Math.max(maxRowWidth, rowWidth);

    let xCursor = -rowWidth / 2;
    for (const childLayout of row) {
      const centerX = xCursor + childLayout.width / 2;
      for (const [id, pos] of childLayout.positions) {
        positions.set(id, { x: pos.x + centerX, y: pos.y + yOffset });
      }
      xCursor += childLayout.width;
    }
    yOffset += rowHeight;
  }

  return { width: maxRowWidth, height: yOffset, positions };
}

export function computeTreeLayout(root: HierarchyNode<ApiNodeListItem>): {
  nodes: AppNode[];
  edges: AppEdge[];
} {
  const { positions } = layoutSubtree(root);

  const nodes: AppNode[] = root.descendants().map((d) => {
    const role = resolveNodeRole(d.data);
    // Neu node da tung duoc keo tha va luu vi tri thu cong (x/y != null), giu
    // dung vi tri do thay vi tinh lai auto-layout - dung dung x/y goc (absolute),
    // khong phai toa do tuong doi ma layoutSubtree tinh cho auto-layout.
    const hasManualPosition = d.data.x != null && d.data.y != null;
    const position = hasManualPosition
      ? { x: d.data.x as number, y: d.data.y as number }
      : (positions.get(d.data.id) ?? { x: 0, y: 0 });
    return {
      id: d.data.id,
      type: role,
      position,
      data: {
        title: d.data.title,
        role,
        kind: d.data.kind,
        depth: d.data.depth,
        cardCount: d.data.cardCount,
        openIssueCount: d.data.openIssueCount,
        lastActivity: d.data.lastActivity,
        hiddenFromShare: d.data.hiddenFromShare,
        isCollapsed: d.data.isCollapsed,
        childrenCount: d.children?.length ?? 0,
        streak: d.data.streak,
        category: d.data.category,
        difficulty: d.data.difficulty,
        tags: d.data.tags,
        isPinned: d.data.isPinned,
        childNodes: d.children?.map((c) => c.data) ?? [],
      },
    };
  });

  const edges: AppEdge[] = root.links().map((link) => ({
    id: `e-${link.source.data.id}-${link.target.data.id}`,
    source: link.source.data.id,
    target: link.target.data.id,
    type: "smoothstep",
  }));
  return { nodes, edges };
}
