"use server";

import { removeSeriesDocument } from "@/lib/api/series";

export async function removeSeriesDocumentAction(
  id: string,
  documentId: string,
) {
  return removeSeriesDocument(id, documentId);
}
