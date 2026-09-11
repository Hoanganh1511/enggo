"use server";
import { listMyCollections } from "@/lib/api/collections";

export async function listMyCollectionsAction() {
  return listMyCollections();
}
