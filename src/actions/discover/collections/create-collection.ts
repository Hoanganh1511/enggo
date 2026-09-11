"use server";
import { createCollection, type CollectionInput } from "@/lib/api/collections";

export async function createCollectionAction(input: CollectionInput) {
  return createCollection(input);
}
