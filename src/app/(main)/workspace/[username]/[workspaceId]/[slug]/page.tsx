import { notFound } from "next/navigation";
import { getDocument } from "@/lib/api/documents";
import { ApiError } from "@/lib/api/client";
import { ArticleReaderPane } from "@/components/workspaces/ArticleReaderPane";

// Trang doc 1 bai viet toan van, chia se sidebar/nhom voi trang browse qua
// layout.tsx chung (xem WorkspaceShell.tsx). Fetch THANG `getDocument` (khong
// qua server action "use client-callable") vi da o Server Component - cung
// co che auth server-side voi fetch workspace trong layout.tsx.
export default async function WorkspaceArticlePage({
  params,
}: {
  params: Promise<{ username: string; workspaceId: string; slug: string }>;
}) {
  const { username, slug } = await params;
  let doc;
  try {
    doc = await getDocument(decodeURIComponent(username), slug);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
  // key={doc.id}: dieu huong sang 1 bai viet KHAC (cung route pattern
  // [slug]) buoc ArticleReaderPane remount thay vi giu state cu (doc/toc/
  // editPhase) - xem comment trong ArticleReaderPane.tsx.
  return <ArticleReaderPane key={doc.id} doc={doc} />;
}
