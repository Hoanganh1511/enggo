"use server";
import { removeFromCollection } from "@/lib/api/collections";

export async function removeFromCollectionAction(
  collectionId: string,
  postId: string,
) {
  return removeFromCollection(collectionId, postId);
}
