"use server";

import { getSelfStatus } from "@/lib/api/users";

// home/page.tsx goi truc tiep tu Server Component - gate hien
// WelcomeOnboardingModal.tsx.
export async function getSelfStatusAction() {
  return getSelfStatus();
}
