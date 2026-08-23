import { notFound } from "next/navigation";
import { getDocsCollection } from "@/lib/docs/docs-collections";
import { DocsMarkdown } from "@/components/docs/DocsMarkdown";
import { CopyMarkdownButton } from "@/components/docs/CopyMarkdownButton";
import { DocsToc } from "@/components/docs/DocsToc";
import { extractDocsToc } from "@/lib/docs/docs-toc";

// 1 bai docs - noi dung + nut "Copy Markdown" (markdown THO, dung khi ai
// muon dan sang 1 LLM khac) o giua, "On This Page" (muc luc CHI cua bai nay,
// khac sidebar trai la muc luc CA collection) o phai - dung layout giong anh
// mau nguoi dung dua.
export default async function DocsArticlePage({
  params,
}: {
  params: Promise<{ collection: string; article: string }>;
}) {
  const { collection: collectionSlug, article: articleSlug } = await params;
  const collection = getDocsCollection(collectionSlug);
  if (!collection) notFound();

  const articles = await collection.getArticles();
  const article = articles.find((a) => a.slug === articleSlug);
  if (!article) notFound();

  const toc = extractDocsToc(article.body);

  return (
    <div className="flex gap-8">
      <article className="min-w-0 flex-1 pb-20">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <h1 className="text-[26px] font-extrabold text-ink sm:text-[30px]">
            {article.title}
          </h1>
          <CopyMarkdownButton markdown={article.body} />
        </div>
        <div className="mt-6">
          <DocsMarkdown markdown={article.body} />
        </div>
      </article>

      <aside className="sticky top-6 hidden h-fit w-56 shrink-0 xl:block">
        <DocsToc toc={toc} />
      </aside>
    </div>
  );
}
