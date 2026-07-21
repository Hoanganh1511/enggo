"use server";

import { revalidatePath } from "next/cache";
import { resetNodeLayout } from "@/lib/api/nodes";

export async function resetNodeLayoutAction(workspaceId: string) {
  await resetNodeLayout(workspaceId);
  revalidatePath(`/w/${workspaceId}`);
}
