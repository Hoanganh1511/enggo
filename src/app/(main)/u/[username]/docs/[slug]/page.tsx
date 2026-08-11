import { notFound } from "next/navigation";
import { getDocument } from "@/lib/api/documents";
import { DocumentView } from "@/components/documents/DocumentView";
import { ApiError } from "@/lib/api/client";

// Trang doc 1 tai lieu (read-only) - /u/[username]/docs/[slug]. Backend tra
// 404 neu la ban nhap ma nguoi xem khong phai tac gia.
export default async function DocumentPage({
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
  return <DocumentView document={doc} />;
}
