"use server";

import { revalidatePath } from "next/cache";
import { updateCard } from "@/lib/api/cards";

export async function updateCardAction(
  workspaceId: string,
  cardId: string,
  content: Record<string, unknown>,
) {
  const card = await updateCard(cardId, content);
  revalidatePath(`/w/${workspaceId}`);
  return card;
}
