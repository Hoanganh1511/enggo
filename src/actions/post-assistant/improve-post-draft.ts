"use server";

import { improvePostDraft } from "@/lib/api/post-assistant";

export async function improvePostDraftAction(
  content: string,
  instruction: string,
) {
  return improvePostDraft(content, instruction);
}
