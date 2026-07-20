"use server";

import { revalidatePath } from "next/cache";
import { updateIssue } from "@/lib/api/issues";

export async function updateIssueAction(
  workspaceId: string,
  issueId: string,
  data: { question?: string; resolved?: boolean },
) {
  const issue = await updateIssue(issueId, data);
  revalidatePath(`/w/${workspaceId}`);
  return issue;
}
