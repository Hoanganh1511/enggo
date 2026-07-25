import { redirect } from "next/navigation";
import { listWorkspaces } from "@/lib/api/workspaces";

// Trampoline giong /topics - "/skill-tree" khong tu no co du lieu, luon
// chuyen sang skill set (workspace) dau tien cua user.
export default async function SkillTreeIndexPage() {
  const workspaces = await listWorkspaces();
  const first = workspaces[0];
  if (!first) redirect("/login");
  redirect(`/skill-tree/${first.id}`);
}
