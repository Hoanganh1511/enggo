import { apiFetch } from "./client";
import type { ApiIssue } from "./types";

export function getNodeIssues(nodeId: string): Promise<ApiIssue[]> {
  return apiFetch<ApiIssue[]>(`/nodes/${nodeId}/issues`);
}

export function createIssue(
  nodeId: string,
  question: string,
): Promise<ApiIssue> {
  return apiFetch<ApiIssue>(`/nodes/${nodeId}/issues`, {
    method: "POST",
    body: JSON.stringify({ question }),
  });
}

export function updateIssue(
  issueId: string,
  data: { question?: string; resolved?: boolean },
): Promise<ApiIssue> {
  return apiFetch<ApiIssue>(`/issues/${issueId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteIssue(issueId: string): Promise<void> {
  return apiFetch<void>(`/issues/${issueId}`, { method: "DELETE" });
}
