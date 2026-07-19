"use server";

import { revalidatePath } from "next/cache";
import { createResource } from "@/lib/api/resources";
import type { ResourceType } from "@/lib/api/types";

export async function createResourceAction(
  workspaceId: string,
  nodeId: string,
  data: { type: ResourceType; title: string; url: string },
) {
  const resource = await createResource(nodeId, data);
  revalidatePath(`/w/${workspaceId}`);
  return resource;
}
