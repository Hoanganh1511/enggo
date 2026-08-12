"use server";

import { revalidatePath } from "next/cache";
import { deleteWorkspace } from "@/lib/api/workspaces";

export async function deleteWorkspaceAction(id: string, username: string) {
  await deleteWorkspace(id);
  revalidatePath(`/u/${username}/workspaces`);
}
