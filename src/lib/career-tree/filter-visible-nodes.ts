import type { ApiNode } from "@/lib/api/types";

export function filterVisibleNodes(nodes: ApiNode[]): ApiNode[] {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const collapsedIds = new Set(nodes.filter((n) => n.isCollapsed).map((n) => n.id));

  function isHidden(node: ApiNode): boolean {
    let current = node;
    while (current.parentId) {
      const parent = byId.get(current.parentId);
      if (!parent) break;
      if (collapsedIds.has(parent.id)) return true;
      current = parent;
    }
    return false;
  }

  return nodes.filter((n) => !isHidden(n));
}

// Đếm số con THẬT của mỗi node, tính từ danh sách đầy đủ (chưa lọc) —
// vì computeTreeLayout chỉ nhận cây đã lọc, nếu tính childrenCount từ đó thì
// node đang collapsed sẽ luôn hiện 0 nhánh (mất luôn nút mở lại).
export function getRealChildrenCount(nodes: ApiNode[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const n of nodes) {
    if (n.parentId) {
      counts.set(n.parentId, (counts.get(n.parentId) ?? 0) + 1);
    }
  }
  return counts;
}
