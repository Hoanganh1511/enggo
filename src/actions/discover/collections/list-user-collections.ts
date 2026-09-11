"use server";
import { listUserCollections } from "@/lib/api/collections";

export async function listUserCollectionsAction(username: string) {
  return listUserCollections(username);
}
