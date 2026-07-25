import { redirect } from "next/navigation";
import { listWorkspaces } from "@/lib/api/workspaces";

// Trampoline - "/career-tree" khong tu no co du lieu, luon chuyen sang
// workspace dau tien cua user (thay the vai tro cu cua "/topics").
export default async function CareerTreeIndexPage() {
  const workspaces = await listWorkspaces();
  const first = workspaces[0];
  if (!first) redirect("/login"); // phòng vệ - luôn có >=1 workspace nhờ syncUser
  redirect(`/w/${first.id}`);
}
