import { redirect } from "next/navigation";
import { listWorkspaces } from "@/lib/api/workspaces";

export default async function TopicsPage() {
  const workspaces = await listWorkspaces();
  const first = workspaces[0];
  if (!first) redirect("/login"); // phòng vệ - luôn có >=1 workspace nhờ syncUser
  redirect(`/w/${first.id}`);
}
