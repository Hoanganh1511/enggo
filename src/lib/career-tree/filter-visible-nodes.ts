import type { ApiNodeListItem } from "@/lib/api/types";

// Một lượt duyệt theo depth tăng dần: cha luôn được xử lý trước con, nên trạng
// thái "ẩn" chỉ cần lan truyền xuống từ cha (đã biết) thay vì mỗi node tự đi
// ngược lên kiểm tra toàn bộ tổ tiên — O(n) thay vì O(n * depth).
export function filterVisibleNodes(
  nodes: ApiNodeListItem[],
): ApiNodeListItem[] {
  const sorted = [...nodes].sort((a, b) => a.depth - b.depth);
  const hiddenIds = new Set<string>();
  const visible: ApiNodeListItem[] = [];

  for (const node of sorted) {
    const parentHidden = node.parentId !== null && hiddenIds.has(node.parentId);
    if (parentHidden) {
      hiddenIds.add(node.id);
      continue;
    }
    visible.push(node);
    if (node.isCollapsed) hiddenIds.add(node.id);
  }

  return visible;
}

// Đếm số con THẬT của mỗi node, tính từ danh sách đầy đủ (chưa lọc) —
// vì computeTreeLayout chỉ nhận cây đã lọc, nếu tính childrenCount từ đó thì
// node đang collapsed sẽ luôn hiện 0 nhánh (mất luôn nút mở lại).
export function getRealChildrenCount(
  nodes: ApiNodeListItem[],
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const n of nodes) {
    if (n.parentId) {
      counts.set(n.parentId, (counts.get(n.parentId) ?? 0) + 1);
    }
  }
  return counts;
}
