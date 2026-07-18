"use server";

import { updateNode } from "@/lib/api/nodes";

// Không gọi revalidatePath: chỉnh content không ảnh hưởng canvas/sidebar/command
// palette, nên không cần refetch lại toàn bộ cây (tránh tải lại content của mọi
// node mỗi 500ms trong lúc gõ ghi chú).
export async function updateNodeContentAction(
  workspaceId: string,
  nodeId: string,
  content: Record<string, unknown>,
) {
  await updateNode(workspaceId, nodeId, { content });
}
