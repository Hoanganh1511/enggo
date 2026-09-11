"use server";
import { updateCollection, type CollectionInput } from "@/lib/api/collections";

export async function updateCollectionAction(
  id: string,
  input: Partial<CollectionInput>,
) {
  return updateCollection(id, input);
}
