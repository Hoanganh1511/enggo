"use server";
import { listCommunities } from "@/lib/api/community";

export async function listCommunitiesAction() {
  return listCommunities();
}
