"use server";

import { revalidatePath } from "next/cache";
import { createDocument, type DocumentInput } from "@/lib/api/documents";

export async function createDocumentAction(dto: DocumentInput) {
  const doc = await createDocument(dto);
  revalidatePath(`/u/${doc.author.username}/workspaces`);
  return doc;
}
