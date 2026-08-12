import { notFound, redirect } from "next/navigation";
import { getProfileOrRedirect } from "@/lib/api/get-profile-or-redirect";
import { PostEditor } from "@/components/workspaces/PostEditor";

// Trang soan bai viet MOI - chi chinh chu (isSelf) moi vao duoc; nguoi khac
// -> 404. Bat buoc phai co ?group=<id> - tao bai viet luon gan voi 1
// Knowledge Group CU THE (chon tu WorkspaceSwitcher truoc khi bam "Viết
// bài"), khong cho tao "bai roi" ngoai nhom nao. Thieu query -> ve lai trang
// Workspace de nguoi dung chon nhom truoc. Chua dang nhap/session het han ->
// redirect /login (xem getProfileOrRedirect), khong hien 404 nham lan.
export default async function NewPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ group?: string }>;
}) {
  const { username } = await params;
  const { group } = await searchParams;
  const uname = decodeURIComponent(username);

  const profile = await getProfileOrRedirect(uname);
  if (!profile?.isSelf) notFound();
  if (!group) redirect(`/u/${uname}/workspaces`);

  return <PostEditor mode="create" groupId={group} />;
}
