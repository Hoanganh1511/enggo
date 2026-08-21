"use server";

import { getProfileByUsername } from "@/lib/api/users";

// Dung cho panel thong tin (vd MessageInfoPanel.tsx) can profile DAY DU
// (createdAt/location/bio...) cua 1 nguoi khac, khac ApiConversationUser
// (chi co id/username/name/avatarUrl/verified) tra ve tu /conversations.
export async function getUserProfileAction(username: string) {
  return getProfileByUsername(username);
}
