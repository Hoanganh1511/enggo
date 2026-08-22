"use server";

import { completeOnboarding } from "@/lib/api/users";

// Client-callable (WelcomeOnboardingModal.tsx) - khong revalidatePath, modal
// tu dieu huong/an sau khi goi xong.
export async function completeOnboardingAction(dto: {
  goal?: string;
  firstChapterTitle?: string;
}) {
  return completeOnboarding(dto);
}
