"use server";

import { auth } from "@/auth";
import { signSocketToken } from "@/lib/api/sign-internal-token";

// Ky token rieng cho ket noi WebSocket (xem sign-internal-token.ts) - goi tu
// client MOI LAN (re)connect qua callback `auth` cua socket.io-client. Tra ve
// null neu chua dang nhap (component goi se tu bo qua, khong ket noi socket).
export async function getSocketTokenAction(): Promise<string | null> {
  const session = await auth();
  if (!session?.userId) return null;
  return signSocketToken(session.userId);
}
