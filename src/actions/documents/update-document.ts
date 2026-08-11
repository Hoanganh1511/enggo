"use server";

import { revalidatePath } from "next/cache";
import { updateDocument, type DocumentInput } from "@/lib/api/documents";

export async function updateDocumentAction(
  id: string,
  dto: Partial<DocumentInput>,
) {
  const doc = await updateDocument(id, dto);
  revalidatePath(`/u/${doc.author.username}/docs`);
  revalidatePath(`/u/${doc.author.username}/docs/${doc.slug}`);
  return doc;
}
