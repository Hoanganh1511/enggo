"use server";

import { revalidatePath } from "next/cache";
import { deleteCard } from "@/lib/api/cards";

export async function deleteCardAction(workspaceId: string, cardId: string) {
  await deleteCard(cardId);
  revalidatePath(`/w/${workspaceId}`);
}
