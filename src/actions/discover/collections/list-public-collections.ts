"use server";
import {
  listPublicCollections,
  type ListPublicCollectionsParams,
} from "@/lib/api/collections";

export async function listPublicCollectionsAction(
  params?: ListPublicCollectionsParams,
) {
  return listPublicCollections(params);
}
