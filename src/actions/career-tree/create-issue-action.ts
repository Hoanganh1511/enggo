"use server";

import { revalidatePath } from "next/cache";
import { createIssue } from "@/lib/api/issues";

export async function createIssueAction(
  workspaceId: string,
  nodeId: string,
  question: string,
) {
  const issue = await createIssue(nodeId, question);
  revalidatePath(`/w/${workspaceId}`);
  return issue;
}
