"use server";
import { addToCollection } from "@/lib/api/collections";

export async function addToCollectionAction(
  collectionId: string,
  postId: string,
) {
  return addToCollection(collectionId, postId);
}
