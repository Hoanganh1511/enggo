"use server";

import {
  leaveGroup,
  listMedia,
  listPinnedMessages,
  pinMessage,
  unpinMessage,
  updateGroupInfo,
  type UpdateGroupInfoInput,
} from "@/lib/api/chat";

export async function updateGroupInfoAction(
  conversationId: string,
  input: UpdateGroupInfoInput,
) {
  return updateGroupInfo(conversationId, input);
}

export async function leaveGroupAction(conversationId: string) {
  return leaveGroup(conversationId);
}

export async function listMediaAction(
  conversationId: string,
  cursor?: string,
) {
  return listMedia(conversationId, cursor);
}

export async function listPinnedMessagesAction(conversationId: string) {
  return listPinnedMessages(conversationId);
}

export async function pinMessageAction(
  conversationId: string,
  messageId: string,
) {
  return pinMessage(conversationId, messageId);
}

export async function unpinMessageAction(
  conversationId: string,
  messageId: string,
) {
  return unpinMessage(conversationId, messageId);
}
