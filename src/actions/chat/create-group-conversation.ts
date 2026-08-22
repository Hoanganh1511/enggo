"use server";

import { createGroupConversation } from "@/lib/api/chat";
import type { GroupAvatarColor } from "@/lib/api/types";

export async function createGroupConversationAction(
  name: string,
  memberIds: string[],
  avatarColor: GroupAvatarColor,
) {
  return createGroupConversation(name, memberIds, avatarColor);
}
