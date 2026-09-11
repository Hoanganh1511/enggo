"use server";
import { getCollectionDetail } from "@/lib/api/collections";

export async function getCollectionDetailAction(id: string) {
  return getCollectionDetail(id);
}
