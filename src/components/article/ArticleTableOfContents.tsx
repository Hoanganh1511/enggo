import { List } from "lucide-react";
import { parseContentLines, type ContentLine } from "@/lib/discover/article-content";
import { cn } from "@/lib/utils";

// Loc rieng phan heading tu CUNG 1 nguon parseContentLines ma ArticleBody.tsx
// dung de render toan bo noi dung - dam bao id o day LUON khop voi id that
// trong DOM (khong the lech nhau vi chi co 1 ham sinh id duy nhat).
export function getHeadings(
  content: string,
): Extract<ContentLine, { type: "heading" }>[] {
  return parseContentLines(content).filter(
    (l): l is Extract<ContentLine, { type: "heading" }> => l.type === "heading",
  );
}

export function ArticleTableOfContents({ content }: { content: string }) {
  const headings = getHeadings(content);
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
                h.level === 3 && "pl-4 text-[13px]",
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
