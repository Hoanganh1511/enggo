import { apiFetch } from "./client";
import type {
  ApiGroupProgress,
  ApiKnowledgeGroup,
  ApiKnowledgeGroupCollabRequest,
  ApiKnowledgeGroupVisibility,
} from "./types";

export type KnowledgeGroupInput = {
  name: string;
  description?: string;
  // Ten export cua 1 icon lucide-react (vd "BookOpen") - xem group-icons.tsx.
  icon?: string;
  // Ten/ma chung chi muc tieu (vd "AWS Solutions Architect"/"SAA-C03") - xem
  // GroupCertSettingsModal.tsx.
  certName?: string;
  certCode?: string;
  visibility?: ApiKnowledgeGroupVisibility;
  goal?: Record<string, unknown>;
  // "Lo trinh hoc tap" - xem GroupRoadmapSection.tsx.
  roadmap?: Record<string, unknown>;
};

export function listWorkspaceGroups(
  workspaceId: string,
): Promise<ApiKnowledgeGroup[]> {
  return apiFetch<ApiKnowledgeGroup[]>(`/workspaces/${workspaceId}/groups`);
}

export function createKnowledgeGroup(
  workspaceId: string,
  dto: KnowledgeGroupInput,
): Promise<ApiKnowledgeGroup> {
  return apiFetch<ApiKnowledgeGroup>(`/workspaces/${workspaceId}/groups`, {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export function updateKnowledgeGroup(
  id: string,
  dto: Partial<KnowledgeGroupInput>,
): Promise<ApiKnowledgeGroup> {
  return apiFetch<ApiKnowledgeGroup>(`/knowledge-groups/${id}`, {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
}

export function deleteKnowledgeGroup(id: string): Promise<void> {
  return apiFetch<void>(`/knowledge-groups/${id}`, { method: "DELETE" });
}

export function getGroupProgress(groupId: string): Promise<ApiGroupProgress> {
  return apiFetch<ApiGroupProgress>(`/knowledge-groups/${groupId}/progress`);
}

export function requestCollab(
  groupId: string,
  reason?: string,
): Promise<unknown> {
  return apiFetch<unknown>(`/knowledge-groups/${groupId}/collab`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

export function leaveCollab(groupId: string): Promise<void> {
  return apiFetch<void>(`/knowledge-groups/${groupId}/collab`, {
    method: "DELETE",
  });
}

export function listCollaborators(
  groupId: string,
): Promise<ApiKnowledgeGroupCollabRequest[]> {
  return apiFetch<ApiKnowledgeGroupCollabRequest[]>(
    `/knowledge-groups/${groupId}/collaborators`,
  );
}

export function approveCollab(
  groupId: string,
  collabId: string,
): Promise<unknown> {
  return apiFetch<unknown>(
    `/knowledge-groups/${groupId}/collaborators/${collabId}/approve`,
    { method: "PATCH" },
  );
}

export function rejectCollab(
  groupId: string,
  collabId: string,
): Promise<unknown> {
  return apiFetch<unknown>(
    `/knowledge-groups/${groupId}/collaborators/${collabId}/reject`,
    { method: "PATCH" },
  );
}
