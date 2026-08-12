"use server";

import { revalidatePath } from "next/cache";
import { deleteDocument } from "@/lib/api/documents";

export async function deleteDocumentAction(id: string, username: string) {
  await deleteDocument(id);
  revalidatePath(`/u/${username}/workspaces`);
}
