"use server";

import { revalidatePath } from "next/cache";
import { pinDocument, unpinDocument } from "@/lib/api/documents";

export async function togglePinDocumentAction(
  id: string,
  username: string,
  pin: boolean,
) {
  const doc = pin ? await pinDocument(id) : await unpinDocument(id);
  revalidatePath(`/u/${username}/workspaces`);
  return doc;
}
