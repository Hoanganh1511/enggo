"use server";

import { revalidatePath } from "next/cache";
import { updateDocument, type DocumentInput } from "@/lib/api/documents";

export async function updateDocumentAction(
  id: string,
  dto: Partial<Omit<DocumentInput, "knowledgeGroupId">>,
) {
  const doc = await updateDocument(id, dto);
  revalidatePath(`/u/${doc.author.username}/workspaces`);
  revalidatePath(`/u/${doc.author.username}/workspaces/${doc.slug}`);
  return doc;
}
