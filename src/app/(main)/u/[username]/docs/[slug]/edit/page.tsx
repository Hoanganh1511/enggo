import { notFound } from "next/navigation";
import { getDocument } from "@/lib/api/documents";
import { DocumentEditor } from "@/components/documents/DocumentEditor";
import { ApiError } from "@/lib/api/client";

// Trang SUA tai lieu - chi tac gia (doc.isOwner) moi vao duoc; nguoi khac 404.
export default async function EditDocumentPage({
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
  if (!doc.isOwner) notFound();

  return <DocumentEditor mode="edit" document={doc} />;
}
