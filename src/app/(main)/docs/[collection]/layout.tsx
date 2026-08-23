import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getDocsCollection } from "@/lib/docs/docs-collections";
import {
  DocsSidebar,
  type DocsSidebarGroup,
} from "@/components/docs/DocsSidebar";

// Layout DUNG CHUNG cho 1 collection docs - sidebar trai (danh muc + bai
// viet) o day vi no GIU NGUYEN khi chuyen qua lai giua cac bai trong CUNG 1
// collection (khong remount, giong tinh than cac layout khac trong app - xem
// engineering-log.md muc "2026-08-03 Home feed" ve route group tranh remount).
// Cot phai "On This Page" KHONG nam o day - no phu thuoc noi dung TUNG bai cu
// the nen do chinh page [article] tu render canh noi dung (xem page.tsx).
export default async function DocsCollectionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ collection: string }>;
}) {
  const { collection: collectionSlug } = await params;
  const collection = getDocsCollection(collectionSlug);
  if (!collection) notFound();

  const articles = await collection.getArticles();

  const groups: DocsSidebarGroup[] = [];
  for (const categoryName of collection.categoryOrder) {
    const inCategory = articles.filter((a) => a.category === categoryName);
    if (inCategory.length > 0) {
      groups.push({
        category: categoryName,
        articles: inCategory.map((a) => ({ slug: a.slug, title: a.title })),
      });
    }
  }
  // Danh muc khong nam trong categoryOrder (vd them entry moi ma quen cap
  // nhat mapping) - van hien, gom vao cuoi, khong am tham mat noi dung.
  const knownCategories = new Set(collection.categoryOrder);
  const leftoverCategories = [
    ...new Set(articles.map((a) => a.category)),
  ].filter((c) => !knownCategories.has(c));
  for (const categoryName of leftoverCategories) {
    groups.push({
      category: categoryName,
      articles: articles
        .filter((a) => a.category === categoryName)
        .map((a) => ({ slug: a.slug, title: a.title })),
    });
  }

  return (
    <div className="flex min-h-full gap-8 px-6 py-10">
      <aside className="sticky top-6 hidden h-fit w-56 shrink-0 lg:block">
        <Link
          href="/docs"
          className="mb-4 flex items-center gap-1.5 px-2.5 text-xs font-medium text-ink-faint hover:text-ink"
        >
          <ArrowLeft size={13} />
          Tất cả tài liệu
        </Link>
        <DocsSidebar collectionSlug={collectionSlug} groups={groups} />
      </aside>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
