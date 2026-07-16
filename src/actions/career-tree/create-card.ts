"use server";

import { revalidatePath } from "next/cache";
import { createCard } from "@/lib/api/cards";

export async function createCardAction(
  workspaceId: string,
  nodeId: string,
  content: Record<string, unknown>,
) {
  const card = await createCard(nodeId, content);
  revalidatePath(`/w/${workspaceId}`);
  return card;
}
