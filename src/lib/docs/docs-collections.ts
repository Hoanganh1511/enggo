import { ScrollText, type LucideIcon } from "lucide-react";
import { getEngineeringLogArticles } from "./engineering-log-source";
import { ENGINEERING_LOG_CATEGORY_ORDER } from "./engineering-log-categories";

// 1 "bai viet" docs, khong phu thuoc nguon du lieu cu the (engineering-log
// hay 1 collection khac sau nay) - cac component render (DocsSidebar/
// DocsToc/DocsMarkdown) chi lam viec voi shape nay.
export type DocsArticle = {
  slug: string;
  title: string;
  category: string;
  body: string;
};

export type DocsCollection = {
  slug: string;
  title: string;
  description: string;
  icon: LucideIcon;
  // Thu tu hien danh muc trong sidebar - danh muc khong co trong day (vd
  // collection khac sau nay dinh nghia danh muc rieng) se noi vao cuoi theo
  // thu tu xuat hien trong du lieu.
  categoryOrder: string[];
  getArticles: () => Promise<DocsArticle[]>;
};

// Registry cac collection tai lieu, hien tren luoi 4 cot /docs (DocsGrid).
// Item DAU TIEN theo dung yeu cau nguoi dung: "Tài liệu kiến thức học được
// trong quá trình xây dựng web này" - doc THANG tu docs/engineering-log.md
// (xem engineering-log-source.ts), khong bia noi dung rieng cho trang nay.
export const DOCS_COLLECTIONS: DocsCollection[] = [
  {
    slug: "engineering-log",
    title: "Tài liệu kiến thức",
    description:
      "Những vấn đề lớn đã gặp và cách xử lý trong quá trình xây dựng web này.",
    icon: ScrollText,
    categoryOrder: ENGINEERING_LOG_CATEGORY_ORDER,
    getArticles: async () => {
      const articles = await getEngineeringLogArticles();
      return articles.map((a) => ({
        slug: a.slug,
        title: a.title,
        category: a.category,
        body: a.body,
      }));
    },
  },
];

export function getDocsCollection(slug: string): DocsCollection | undefined {
  return DOCS_COLLECTIONS.find((c) => c.slug === slug);
}
