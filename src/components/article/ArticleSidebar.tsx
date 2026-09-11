import type { TiptapHeading } from "@/lib/discover/render-tiptap-html";
import type { PostSummary } from "./article-types";
import { ArticleTableOfContents } from "./ArticleTableOfContents";
import { ArticleSidebarRelated } from "./ArticleSidebarRelated";

// Cot phu DINH (sticky) ben phai tren desktop (lg+) - Muc luc + Bai viet
// lien quan rut gon, theo dung mockup nguoi dung gui. CHI hien tu lg+
// (page.tsx dung "hidden lg:block" tren khung boc ngoai) - tren mobile,
// muc luc rieng render inline gan dau trang (ArticleTableOfContents
// variant="inline"), khong co cot phu nay.
export function ArticleSidebar({
  content,
  richHeadings,
  related,
}: {
  content: string;
  richHeadings?: TiptapHeading[];
  related: PostSummary[];
}) {
  return (
    <div className="sticky top-20 flex flex-col gap-4">
      <ArticleTableOfContents content={content} richHeadings={richHeadings} variant="sidebar" />
      <ArticleSidebarRelated items={related} />
    </div>
  );
}
