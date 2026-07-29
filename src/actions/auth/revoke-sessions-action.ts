"use server";

import { signOut } from "@/auth";
import { revokeAllSessions } from "@/lib/api/users";

// Thu hoi session tren MOI thiet bi: danh dau moc o backend truoc, roi tu dang
// xuat chinh thiet bi dang dung. Thu tu nay quan trong - neu signOut truoc thi
// mat session, khong con quyen goi API de danh dau nua.
export async function revokeSessionsAction() {
  await revokeAllSessions();
  await signOut({ redirectTo: "/login" });
}
