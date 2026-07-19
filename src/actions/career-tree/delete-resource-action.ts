"use server";

import { revalidatePath } from "next/cache";
import { deleteResource } from "@/lib/api/resources";

export async function deleteResourceAction(
  workspaceId: string,
  resourceId: string,
) {
  await deleteResource(resourceId);
  revalidatePath(`/w/${workspaceId}`);
}
