"use server";

import { searchUsers } from "@/lib/api/users";

export async function searchUsersAction(
  q: string,
  cursor?: string,
  limit?: number,
) {
  return searchUsers(q, cursor, limit);
}
