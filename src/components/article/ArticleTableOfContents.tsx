import { List } from "lucide-react";
import {
  parseContentLines,
  type ContentLine,
} from "@/lib/discover/article-content";
import type { TiptapHeading } from "@/lib/discover/render-tiptap-html";
import { cn } from "@/lib/utils";

// Loc rieng phan heading tu CUNG 1 nguon parseContentLines ma ArticleBody.tsx
// dung de render toan bo noi dung (nhanh KHONG co richContent - bai cu/kind
// van ban tho) - dam bao id o day LUON khop voi id that trong DOM (khong the
// lech nhau vi chi co 1 ham sinh id duy nhat).
export function getHeadings(
  content: string,
): Extract<ContentLine, { type: "heading" }>[] {
  return parseContentLines(content).filter(
    (l): l is Extract<ContentLine, { type: "heading" }> => l.type === "heading",
  );
}

// `richHeadings` (uu tien neu co) la ket qua CUNG 1 lan goi renderTiptapHTML()
// o page.tsx ma ArticleBody.tsx dung de render HTML - dam bao id o day khop
// tuyet doi voi id that trong DOM cho bai dang qua Composer.tsx (co
// richContent JSON that, KHONG con la text thuong bi mat het dinh dang -
// xem lich su sua doi commit b302198 va sau do). Khong co richHeadings
// (bai cu/kind van ban tho) -> rơi ve doc content nhu truoc.
export function ArticleTableOfContents({
  content,
  richHeadings,
}: {
  content: string;
  richHeadings?: TiptapHeading[];
}) {
  const headings = richHeadings ?? getHeadings(content);
  if (headings.length === 0) return null;

  return (
    <nav className="rounded-lg border border-border bg-surface-muted/50 p-4">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-ink-faint">
        <List size={13} strokeWidth={2} />
        Mục lục
      </p>
      <ul className="flex flex-col gap-1.5">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={cn(
                "block text-sm text-ink-muted transition-colors duration-150 ease-out hover:text-primary",
                h.level >= 3 && "pl-4 text-[13px]",
              )}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
