import { signSyncToken } from "./sign-internal-token";

type SyncUserInput = {
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string;
};

export async function syncUserToBackend(
  input: SyncUserInput,
): Promise<{ id: string; username: string }> {
  const token = await signSyncToken();
  const res = await fetch(`${process.env.CAREER_TREE_API_URL}/users/sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`user sync failed: ${res.status}`);
  return res.json();
}
