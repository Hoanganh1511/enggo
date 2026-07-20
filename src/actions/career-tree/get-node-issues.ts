"use server";
import { getNodeIssues } from "@/lib/api/issues";

export async function getNodeIssuesAction(nodeId: string) {
  return getNodeIssues(nodeId);
}
