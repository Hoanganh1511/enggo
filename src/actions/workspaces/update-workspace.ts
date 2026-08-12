"use server";

import { revalidatePath } from "next/cache";
import { updateWorkspace, type WorkspaceInput } from "@/lib/api/workspaces";

export async function updateWorkspaceAction(
  id: string,
  username: string,
  dto: Partial<WorkspaceInput>,
) {
  const workspace = await updateWorkspace(id, dto);
  revalidatePath(`/u/${username}/workspaces`);
  return workspace;
}
