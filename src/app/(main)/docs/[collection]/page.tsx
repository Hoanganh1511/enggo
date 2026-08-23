import { notFound, redirect } from "next/navigation";
import { getDocsCollection } from "@/lib/docs/docs-collections";

// Vao thang /docs/[collection] (chua chon bai nao) - nhay toi bai DAU TIEN
// (sau khi da sap xep theo ngay giam dan trong nguon du lieu, xem
// engineering-log-source.ts) giong hanh vi "Introduction" trong anh mau.
export default async function DocsCollectionIndexPage({
  params,
}: {
  params: Promise<{ collection: string }>;
}) {
  const { collection: collectionSlug } = await params;
  const collection = getDocsCollection(collectionSlug);
  if (!collection) notFound();

  const articles = await collection.getArticles();
  if (articles.length === 0) notFound();

  redirect(`/docs/${collectionSlug}/${articles[0].slug}`);
}
