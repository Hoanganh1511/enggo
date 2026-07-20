"use server";

import { revalidatePath } from "next/cache";
import { createCard } from "@/lib/api/cards";
import type { CardKind } from "@/lib/api/types";

export async function createCardAction(
  workspaceId: string,
  nodeId: string,
  content: Record<string, unknown>,
  kind?: CardKind,
) {
  const card = await createCard(nodeId, content, kind);
  revalidatePath(`/w/${workspaceId}`);
  return card;
}
