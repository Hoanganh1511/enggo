"use server";

import { leaveCollab } from "@/lib/api/knowledge-groups";

export async function leaveCollabAction(groupId: string) {
  await leaveCollab(groupId);
}
