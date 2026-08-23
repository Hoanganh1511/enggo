import type { ReactElement, ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import { DOCS_PROSE_CLASS } from "@/lib/docs/docs-prose";
import { slugifyHeading } from "@/lib/docs/docs-toc";

function childrenToText(children: ReactNode): string {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(childrenToText).join("");
  if (children && typeof children === "object" && "props" in children) {
    return childrenToText((children as ReactElement<{ children?: ReactNode }>).props.children);
  }
  return "";
}

// Render markdown THO cua 1 bai docs (vd tu engineering-log.md, xem
// engineering-log-source.ts) qua react-markdown - dung DOCS_PROSE_CLASS
// (docs-prose.ts, COPY tu POST_PROSE_CLASS - xem comment trong file do ve LY
// DO khong import truc tiep tu post-extensions.ts).
//
// h2/h3 duoc gan `id` qua slugifyHeading - PHAI dung CHUNG 1 ham voi
// extractDocsToc (docs-toc.ts) de id khop chinh xac voi link trong DocsToc.tsx,
// khong the de 2 noi tu slugify rieng roi troi nhau.
export function DocsMarkdown({ markdown }: { markdown: string }) {
  const seen = new Map<string, number>();

  function headingId(children: ReactNode): string {
    const text = childrenToText(children);
    const base = slugifyHeading(text);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count > 0 ? `${base}-${count}` : base;
  }

  return (
    <div className={DOCS_PROSE_CLASS}>
      <ReactMarkdown
        components={{
          h2: ({ children }) => <h2 id={headingId(children)}>{children}</h2>,
          h3: ({ children }) => <h3 id={headingId(children)}>{children}</h3>,
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
