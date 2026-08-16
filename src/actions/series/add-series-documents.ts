"use server";

import { addSeriesDocuments } from "@/lib/api/series";

export async function addSeriesDocumentsAction(
  id: string,
  documentIds: string[],
) {
  return addSeriesDocuments(id, documentIds);
}
