"use server";

import { listReadReceipts } from "@/lib/api/chat";

export async function listReadReceiptsAction(conversationId: string) {
  return listReadReceipts(conversationId);
}
