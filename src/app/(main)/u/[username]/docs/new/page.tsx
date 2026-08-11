import { notFound } from "next/navigation";
import { getProfileByUsername } from "@/lib/api/users";
import { DocumentEditor } from "@/components/documents/DocumentEditor";

// Trang soan tai lieu MOI - chi chinh chu (isSelf) moi vao duoc; nguoi khac
// -> 404 (tao tai lieu luon gan voi user dang dang nhap, khong the "tao ho").
export default async function NewDocumentPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = await getProfileByUsername(
    decodeURIComponent(username),
  ).catch(() => null);
  if (!profile?.isSelf) notFound();

  return <DocumentEditor mode="create" />;
}
