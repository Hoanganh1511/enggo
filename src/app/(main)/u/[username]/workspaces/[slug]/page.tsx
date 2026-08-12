import { notFound } from "next/navigation";
import { getDocument } from "@/lib/api/documents";
import { PostView } from "@/components/workspaces/PostView";
import { ApiError } from "@/lib/api/client";

// Trang doc 1 bai viet (read-only) - /u/[username]/workspaces/[slug]. Backend
// tra 404 neu la ban nhap khong phai cua nguoi xem, HOAC thuoc nhom PRIVATE
// ma nguoi xem khong phai chu workspace/collaborator APPROVED.
export default async function PostPage({
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
    throw e;
  }
  return <PostView document={doc} />;
}
