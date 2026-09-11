"use server";
import { deleteCollection } from "@/lib/api/collections";

export async function deleteCollectionAction(id: string) {
  return deleteCollection(id);
}
