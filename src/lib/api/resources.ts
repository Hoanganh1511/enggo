import { apiFetch } from "./client";
import type { ApiResource, ResourceType } from "./types";

export function getNodeResources(nodeId: string): Promise<ApiResource[]> {
  return apiFetch<ApiResource[]>(`/nodes/${nodeId}/resources`);
}

export function createResource(
  nodeId: string,
  data: { type: ResourceType; title: string; url: string },
): Promise<ApiResource> {
  return apiFetch<ApiResource>(`/nodes/${nodeId}/resources`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
export function deleteResource(resourceId: string): Promise<void> {
  return apiFetch<void>(`/resources/${resourceId}`, { method: "DELETE" });
}
