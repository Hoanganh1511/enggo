"use server";
import { getNodeResources } from "@/lib/api/resources";

export async function getNodeResourcesAction(nodeId: string) {
  return getNodeResources(nodeId);
}
