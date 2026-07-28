"use server";
import { listWorkspaces } from "@/lib/api/workspaces";

export async function listWorkspacesAction() {
  return listWorkspaces();
}
