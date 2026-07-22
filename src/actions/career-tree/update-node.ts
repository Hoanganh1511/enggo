"use server";

import { revalidatePath } from "next/cache";
import { updateNode } from "@/lib/api/nodes";
import type { Difficulty, NodeKind } from "@/lib/api/types";

export async function updateNodeAction(
  workspaceId: string,
  nodeId: string,
  patch: {
    title?: string;
    goal?: string;
    hiddenFromShare?: boolean;
    isCollapsed?: boolean;
    content?: Record<string, unknown>;
    x?: number;
    y?: number;
    kind?: NodeKind;
    category?: string;
    difficulty?: Difficulty;
    estimatedTime?: string;
    prerequisites?: string[];
    learningOutcomes?: string[];
    isPinned?: boolean;
    tags?: string[];
  },
) {
  const node = await updateNode(workspaceId, nodeId, patch);
  revalidatePath(`/w/${workspaceId}`);
  return node;
}
