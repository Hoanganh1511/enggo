"use server";

import { updateProfile, type UpdateProfileInput } from "@/lib/api/users";

// Redesign Settings - luu that "Hồ sơ công khai" (SettingsSections.tsx).
export async function updateProfileAction(dto: UpdateProfileInput) {
  return updateProfile(dto);
}
