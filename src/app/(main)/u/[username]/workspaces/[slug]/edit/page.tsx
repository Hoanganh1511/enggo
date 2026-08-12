import { notFound, redirect } from "next/navigation";
import { getDocument } from "@/lib/api/documents";
import { PostEditor } from "@/components/workspaces/PostEditor";
import { ApiError } from "@/lib/api/client";

// Trang SUA bai viet - chi tac gia (doc.isOwner) moi vao duoc; nguoi khac 404.
// 401 (chua dang nhap/session het han) -> redirect /login thay vi throw loi
// chung chung, xem getProfileOrRedirect.ts.
export default async function EditPostPage({
  params,
}: {
  params: Promise<{ username: string; slug: string }>;
}) {
  const { username, slug } = await params;
  let doc;
  try {
    doc = await getDocument(decodeURIComponent(username), slug);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    if (e instanceof ApiError && e.status === 401) redirect("/login");
    throw e;
  }
  if (!doc.isOwner) notFound();

  return <PostEditor mode="edit" document={doc} />;
}
