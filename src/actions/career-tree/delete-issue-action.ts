"use server";

import { revalidatePath } from "next/cache";
import { deleteIssue } from "@/lib/api/issues";

export async function deleteIssueAction(workspaceId: string, issueId: string) {
  await deleteIssue(issueId);
  revalidatePath(`/w/${workspaceId}`);
}
