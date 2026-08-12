"use server";

import { revalidatePath } from "next/cache";
import { createWorkspace, type WorkspaceInput } from "@/lib/api/workspaces";

export async function createWorkspaceAction(
  username: string,
  dto: WorkspaceInput,
) {
  const workspace = await createWorkspace(dto);
  revalidatePath(`/u/${username}/workspaces`);
  return workspace;
}
